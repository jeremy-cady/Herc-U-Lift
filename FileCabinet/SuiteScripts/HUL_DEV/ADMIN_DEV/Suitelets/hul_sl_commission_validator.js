/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * HUL - Commission Data Validator
 *
 * Purpose: Validates commission fields on transaction lines against the Sales Rep Matrix,
 * identifying missing data and mismatches for data quality auditing.
 *
 * Features:
 * - Filter by date range, document prefix, transaction type
 * - Show missing sales rep, commission plan assignments
 * - Compare assigned sales rep vs expected from matrix
 * - Color-coded status indicators
 * - CSV export
 * - Direct links to transactions
 *
 * @see Documentation/PRDs/PRD-20251204-CommissionDataValidator.md
 */

define(['N/query', 'N/ui/serverWidget', 'N/file', 'N/format', 'N/runtime', 'N/url', 'N/redirect', 'N/task'],
    function(query, serverWidget, file, format, runtime, url, redirect, task) {

        /**
         * Configuration object for field IDs
         */
        var CONFIG = {
            // Sales Rep Matrix record
            MATRIX_RECORD: 'customrecord_sna_salesrep_matrix_mapping',
            MATRIX_FIELDS: {
                state: 'custrecord_salesrep_mapping_state',
                county: 'custrecord_salesrep_mapping_county',
                zipcode: 'custrecord_salesrep_mapping_zipcode',
                equipment: 'custrecord_salesrep_mapping_equipment',
                revenue_stream: 'custrecord_salesrep_mapping_rev_stream',
                manufacturer: 'custrecord_salesrep_mapping_manufacturer',
                sales_reps: 'custrecord_salesrep_mapping_sales_reps',
                customer: 'custrecord_salesrep_mapping_customer',
                commission_plan: 'custrecord_sna_hul_sales_rep_comm_plan_2'
            },
            // Transaction line fields
            LINE_FIELDS: {
                sales_rep: 'custcol_sna_sales_rep',
                sales_rep_matrix: 'custcol_sna_sales_rep_matrix',
                commission_plan: 'custcol_sna_commission_plan',
                eligible_for_comm: 'custcol_sna_hul_eligible_for_comm',
                override_commission: 'custcol_sna_override_commission'
            },
            // Custom segments
            SEGMENTS: {
                equip_category: 'cseg_sna_hul_eq_seg',
                revenue_stream: 'cseg_sna_revenue_st',
                manufacturer: 'cseg_hul_mfg'
            },
            // Status colors
            COLORS: {
                MATCH: '#d4edda',          // Green
                OVERRIDE: '#fff3cd',        // Yellow
                MISMATCH: '#ffe5d0',        // Orange
                MISSING_REP: '#f8d7da',     // Red
                MISSING_PLAN: '#f8d7da',    // Red
                NO_MATRIX: '#e9ecef',       // Gray
                NO_ZONE: '#e9ecef'          // Gray
            }
        };

        /**
         * Main request handler
         */
        function onRequest(context) {
            if (context.request.method === 'GET') {
                handleGet(context);
            } else {
                handlePost(context);
            }
        }

        /**
         * Handles GET requests
         */
        function handleGet(context) {
            try {
                // Check for CSV export
                if (context.request.parameters.export === 'csv') {
                    exportToCSV(context);
                    return;
                }

                // Check for Full Export (triggers Map/Reduce)
                if (context.request.parameters.fullexport === 'T') {
                    triggerMapReduceExport(context);
                    return;
                }

                var form = serverWidget.createForm({
                    title: 'Commission Data Validator'
                });

                // Add filter fields first (they appear at top)
                var params = context.request.parameters;
                addFilterFields(form, params);

                // Add submit button
                form.addSubmitButton({
                    label: 'Run Report'
                });

                // Add Full Export button (triggers Map/Reduce for unlimited results)
                form.addButton({
                    id: 'custpage_full_export',
                    label: 'Full Export (All Results)',
                    functionName: 'triggerFullExport'
                });

                // Build results HTML if report has been run
                var resultsHtml = '';
                if (params.custpage_run_report === 'T') {
                    // Query transaction lines first
                    var results = queryTransactionLines(params);

                    // Extract unique zip codes and customer IDs from results
                    var zipCodes = [];
                    var customerIds = [];
                    results.forEach(function(line) {
                        if (line.shipzip) {
                            var zip = String(line.shipzip).substring(0, 5);
                            if (zipCodes.indexOf(zip) === -1) {
                                zipCodes.push(zip);
                            }
                        }
                        if (line.customer_id && customerIds.indexOf(line.customer_id) === -1) {
                            customerIds.push(line.customer_id);
                        }
                    });

                    // Load only the matrix data we need for these zip codes/customers
                    var matrixData = loadMatrixDataForZips(zipCodes, customerIds);

                    // Validate each line against matrix
                    var validatedResults = validateLines(results, matrixData);

                    // Build results HTML
                    resultsHtml = buildResultsHtml(validatedResults, params);
                }

                // Add header with description AND results (so results appear after info box)
                addHeaderHtml(form, resultsHtml);

                context.response.writePage(form);

            } catch (e) {
                log.error({
                    title: 'Error in handleGet',
                    details: e.toString() + '\n' + (e.stack || '')
                });
                context.response.write('An error occurred: ' + e.toString());
            }
        }

        /**
         * Handles POST requests
         */
        function handlePost(context) {
            // Redirect with parameters as GET
            var params = context.request.parameters;
            var redirectUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId,
                params: {
                    custpage_run_report: 'T',
                    custpage_from_date: params.custpage_from_date,
                    custpage_to_date: params.custpage_to_date,
                    custpage_prefix: params.custpage_prefix,
                    custpage_tran_type: params.custpage_tran_type,
                    custpage_issues_only: params.custpage_issues_only,
                    custpage_exclude_internal: params.custpage_exclude_internal,
                    custpage_exclude_override: params.custpage_exclude_override,
                    custpage_eligible_comm: params.custpage_eligible_comm,
                    custpage_equip_category: params.custpage_equip_category
                }
            });
            redirect.redirect({ url: redirectUrl });
        }

        /**
         * Adds header HTML with description, styles, and optional results
         * @param {Object} form - The form object
         * @param {string} resultsHtml - Optional HTML for results (stats + table)
         */
        function addHeaderHtml(form, resultsHtml) {
            var headerField = form.addField({
                id: 'custpage_header_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Header'
            });

            var html = '<style>' +
                '.stats-container { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }' +
                '.stats-box { display: inline-block; padding: 12px 20px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; min-width: 100px; }' +
                '.stats-number { font-size: 24px; font-weight: bold; }' +
                '.stats-label { font-size: 10px; color: #666; text-transform: uppercase; margin-top: 4px; }' +
                '.stats-box.green { border-top: 3px solid #28a745; }' +
                '.stats-box.yellow { border-top: 3px solid #ffc107; }' +
                '.stats-box.orange { border-top: 3px solid #fd7e14; }' +
                '.stats-box.red { border-top: 3px solid #dc3545; }' +
                '.stats-box.gray { border-top: 3px solid #6c757d; }' +
                '.info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 4px; }' +
                '.status-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; }' +
                '.results-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }' +
                '.results-table th { background: #667eea; color: white; padding: 10px 8px; text-align: left; position: sticky; top: 0; }' +
                '.results-table td { padding: 8px; border-bottom: 1px solid #ddd; }' +
                '.results-table tr:hover { background: #f5f5f5; }' +
                '.expected-rep { color: #666; font-style: italic; font-size: 11px; }' +
                '.export-btn { background: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; text-decoration: none; }' +
                '.export-btn:hover { background: #218838; }' +
                '</style>' +
                '<script type="text/javascript">' +
                'function triggerFullExport() {' +
                '    var fromDate = document.getElementById("custpage_from_date").value;' +
                '    var toDate = document.getElementById("custpage_to_date").value;' +
                '    if (!fromDate || !toDate) {' +
                '        alert("Please select From Date and To Date before running Full Export.");' +
                '        return;' +
                '    }' +
                '    var prefix = document.getElementById("custpage_prefix").value || "";' +
                '    var tranType = document.getElementById("custpage_tran_type").value || "";' +
                '    var excludeInternal = document.getElementById("custpage_exclude_internal").checked ? "T" : "F";' +
                '    var excludeOverride = document.getElementById("custpage_exclude_override").checked ? "T" : "F";' +
                '    var eligibleComm = document.getElementById("custpage_eligible_comm").value || "";' +
                '    var equipCategory = document.getElementById("custpage_equip_category").value || "";' +
                '    var currentUrl = window.location.href.split("?")[0];' +
                '    var exportUrl = currentUrl + "?fullexport=T" +' +
                '        "&custpage_from_date=" + encodeURIComponent(fromDate) +' +
                '        "&custpage_to_date=" + encodeURIComponent(toDate) +' +
                '        "&custpage_prefix=" + encodeURIComponent(prefix) +' +
                '        "&custpage_tran_type=" + encodeURIComponent(tranType) +' +
                '        "&custpage_exclude_internal=" + excludeInternal +' +
                '        "&custpage_exclude_override=" + excludeOverride +' +
                '        "&custpage_eligible_comm=" + encodeURIComponent(eligibleComm) +' +
                '        "&custpage_equip_category=" + encodeURIComponent(equipCategory);' +
                '    window.location.href = exportUrl;' +
                '}' +
                '</script>' +
                '<div class="info-box">' +
                '<strong>Commission Data Validator</strong><br/>' +
                'Validate commission fields on transaction lines against the Sales Rep Matrix. ' +
                'Identifies missing sales rep assignments, missing commission plans, and mismatches where the assigned rep ' +
                'differs from what the matrix specifies. Use this tool to audit data quality before commission processing.' +
                '</div>';

            // Append results HTML if provided
            if (resultsHtml) {
                html += resultsHtml;
            }

            headerField.defaultValue = html;
        }

        /**
         * Adds filter fields to the form
         */
        function addFilterFields(form, params) {
            var filterGroup = form.addFieldGroup({
                id: 'custpage_filters',
                label: 'Search Filters'
            });

            // From Date
            var fromDateField = form.addField({
                id: 'custpage_from_date',
                type: serverWidget.FieldType.DATE,
                label: 'From Date',
                container: 'custpage_filters'
            });
            // Default to first of current month
            if (!params.custpage_from_date) {
                var today = new Date();
                var firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                fromDateField.defaultValue = firstOfMonth;
            } else {
                fromDateField.defaultValue = params.custpage_from_date;
            }

            // To Date
            var toDateField = form.addField({
                id: 'custpage_to_date',
                type: serverWidget.FieldType.DATE,
                label: 'To Date',
                container: 'custpage_filters'
            });
            if (!params.custpage_to_date) {
                toDateField.defaultValue = new Date();
            } else {
                toDateField.defaultValue = params.custpage_to_date;
            }

            // Document Prefix filter
            var prefixField = form.addField({
                id: 'custpage_prefix',
                type: serverWidget.FieldType.SELECT,
                label: 'Document Prefix',
                container: 'custpage_filters'
            });
            prefixField.addSelectOption({ value: '', text: '-- All --' });
            prefixField.addSelectOption({ value: 'S', text: 'S - Equipment Sales' });
            prefixField.addSelectOption({ value: 'PS', text: 'PS - Parts Sales' });
            prefixField.addSelectOption({ value: 'W', text: 'W - Service' });
            prefixField.addSelectOption({ value: 'R', text: 'R - Rental' });
            prefixField.addSelectOption({ value: 'MC', text: 'MC - Maintenance' });
            if (params.custpage_prefix) {
                prefixField.defaultValue = params.custpage_prefix;
            }

            // Transaction Type filter
            var tranTypeField = form.addField({
                id: 'custpage_tran_type',
                type: serverWidget.FieldType.SELECT,
                label: 'Transaction Type',
                container: 'custpage_filters'
            });
            tranTypeField.addSelectOption({ value: '', text: '-- All --' });
            tranTypeField.addSelectOption({ value: 'SalesOrd', text: 'Sales Orders' });
            tranTypeField.addSelectOption({ value: 'CustInvc', text: 'Invoices' });
            tranTypeField.addSelectOption({ value: 'CustCred', text: 'Credit Memos' });
            if (params.custpage_tran_type) {
                tranTypeField.defaultValue = params.custpage_tran_type;
            }

            // Show only issues checkbox
            var issuesOnlyField = form.addField({
                id: 'custpage_issues_only',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Show Only Lines with Issues',
                container: 'custpage_filters'
            });
            if (params.custpage_issues_only === 'T') {
                issuesOnlyField.defaultValue = 'T';
            }

            // Exclude internal revenue streams checkbox
            var excludeInternalField = form.addField({
                id: 'custpage_exclude_internal',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Exclude Internal Revenue Streams',
                container: 'custpage_filters'
            });
            if (params.custpage_exclude_internal === 'T') {
                excludeInternalField.defaultValue = 'T';
            }

            // Exclude override lines checkbox
            var excludeOverrideField = form.addField({
                id: 'custpage_exclude_override',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Exclude Override Lines',
                container: 'custpage_filters'
            });
            if (params.custpage_exclude_override === 'T') {
                excludeOverrideField.defaultValue = 'T';
            }

            // Eligible for commission filter
            var eligibleCommField = form.addField({
                id: 'custpage_eligible_comm',
                type: serverWidget.FieldType.SELECT,
                label: 'Eligible for Commission',
                container: 'custpage_filters'
            });
            eligibleCommField.addSelectOption({ value: '', text: '-- All --' });
            eligibleCommField.addSelectOption({ value: 'T', text: 'Yes - Eligible' });
            eligibleCommField.addSelectOption({ value: 'F', text: 'No - Not Eligible' });
            if (params.custpage_eligible_comm) {
                eligibleCommField.defaultValue = params.custpage_eligible_comm;
            }

            // Equipment Category filter
            var equipCategoryField = form.addField({
                id: 'custpage_equip_category',
                type: serverWidget.FieldType.SELECT,
                label: 'Equipment Category',
                container: 'custpage_filters'
            });
            equipCategoryField.addSelectOption({ value: '', text: '-- All --' });
            equipCategoryField.addSelectOption({ value: 'FORKLIFT', text: 'FORKLIFT' });
            equipCategoryField.addSelectOption({ value: 'AERIAL', text: 'AERIAL' });
            equipCategoryField.addSelectOption({ value: 'CONSTRUCTION', text: 'CONSTRUCTION' });
            equipCategoryField.addSelectOption({ value: 'RAIL MOVERS', text: 'RAIL MOVERS' });
            equipCategoryField.addSelectOption({ value: 'ALLIED', text: 'ALLIED' });
            equipCategoryField.addSelectOption({ value: 'EXCLUDE_RAIL', text: 'All EXCEPT Rail Movers' });
            if (params.custpage_equip_category) {
                equipCategoryField.defaultValue = params.custpage_equip_category;
            }

            // Hidden field to track if report has been run
            var runReportField = form.addField({
                id: 'custpage_run_report',
                type: serverWidget.FieldType.TEXT,
                label: 'Run Report'
            });
            runReportField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            runReportField.defaultValue = 'T';
        }

        /**
         * Loads Sales Rep Matrix records - customer matches first, then zip codes
         * This is more efficient as customer-specific matrices are fewer
         * @param {Array} zipCodes - Array of zip codes to load matrix data for
         * @param {Array} customerIds - Array of customer IDs to load matrix data for
         * @returns {Object} Matrix data keyed by customer ID and by zip
         */
        function loadMatrixDataForZips(zipCodes, customerIds) {
            var matrixByCustomer = {};
            var matrixByGeo = {};
            var salesRepNames = {};

            try {
                // First, load sales rep names for lookup
                var repQuery = `
                    SELECT id, entityid AS name
                    FROM employee
                    WHERE isinactive = 'F'
                `;
                var repResults = query.runSuiteQL({ query: repQuery }).asMappedResults();
                repResults.forEach(function(rep) {
                    salesRepNames[rep.id] = rep.name;
                });

                // STEP 1: Load customer-specific matrix records (highest priority, usually fewer records)
                if (customerIds.length > 0) {
                    log.debug('loadMatrixDataForZips', 'Loading matrix records for ' + customerIds.length + ' customers');
                    var customerResults = queryMatrixByCustomers(customerIds);
                    log.debug('loadMatrixDataForZips', 'Found ' + customerResults.length + ' customer-specific matrix records');

                    customerResults.forEach(function(row) {
                        var matrixRecord = buildMatrixRecord(row, salesRepNames);
                        if (row.customer_id) {
                            if (!matrixByCustomer[row.customer_id]) {
                                matrixByCustomer[row.customer_id] = [];
                            }
                            matrixByCustomer[row.customer_id].push(matrixRecord);
                        }
                    });
                }

                // STEP 2: Load geographic (zip-based) matrix records
                if (zipCodes.length > 0) {
                    log.debug('loadMatrixDataForZips', 'Loading matrix records for ' + zipCodes.length + ' zip codes');
                    var zipResults = queryMatrixByZips(zipCodes);
                    log.debug('loadMatrixDataForZips', 'Found ' + zipResults.length + ' zip-based matrix records');

                    zipResults.forEach(function(row) {
                        var matrixRecord = buildMatrixRecord(row, salesRepNames);
                        if (row.zip_code) {
                            var zip = String(row.zip_code).substring(0, 5);
                            if (!matrixByGeo[zip]) {
                                matrixByGeo[zip] = [];
                            }
                            matrixByGeo[zip].push(matrixRecord);
                        }
                    });
                }

            } catch (e) {
                log.error('loadMatrixDataForZips Error', e.toString());
            }

            return {
                byCustomer: matrixByCustomer,
                byGeo: matrixByGeo
            };
        }

        /**
         * Query matrix records by customer IDs
         * Uses smaller batches and pagination to ensure all records are retrieved
         */
        function queryMatrixByCustomers(customerIds) {
            var allResults = [];
            var BATCH_SIZE = 25; // Smaller batches to avoid hitting row limits
            var PAGE_SIZE = 5000;

            for (var i = 0; i < customerIds.length; i += BATCH_SIZE) {
                var batch = customerIds.slice(i, i + BATCH_SIZE);
                var idList = batch.join(',');

                var baseQuery = `
                    SELECT
                        m.id,
                        m.name,
                        m.custrecord_salesrep_mapping_zipcode AS zip_code,
                        m.custrecord_salesrep_mapping_equipment AS equip_category_id,
                        eq.name AS equip_category_name,
                        m.custrecord_salesrep_mapping_rev_stream AS revenue_stream_id,
                        rs.name AS revenue_stream_name,
                        m.custrecord_salesrep_mapping_manufacturer AS manufacturer_id,
                        mfg.name AS manufacturer_name,
                        m.custrecord_salesrep_mapping_sales_reps AS sales_rep_ids,
                        m.custrecord_salesrep_mapping_customer AS customer_id,
                        cust.companyname AS customer_name,
                        m.custrecord_sna_hul_sales_rep_comm_plan_2 AS commission_plan_id,
                        cp.name AS commission_plan_name
                    FROM customrecord_sna_salesrep_matrix_mapping m
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON m.custrecord_salesrep_mapping_equipment = eq.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs ON m.custrecord_salesrep_mapping_rev_stream = rs.id
                    LEFT JOIN customrecord_cseg_hul_mfg mfg ON m.custrecord_salesrep_mapping_manufacturer = mfg.id
                    LEFT JOIN customer cust ON m.custrecord_salesrep_mapping_customer = cust.id
                    LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON m.custrecord_sna_hul_sales_rep_comm_plan_2 = cp.id
                    WHERE m.isinactive = 'F'
                      AND m.custrecord_salesrep_mapping_customer IN (${idList})
                    ORDER BY m.id
                `;

                // Paginate within each batch
                var offset = 0;
                var moreResults = true;
                while (moreResults) {
                    var pagedQuery = baseQuery + ` OFFSET ${offset} ROWS FETCH NEXT ${PAGE_SIZE} ROWS ONLY`;
                    var batchResults = query.runSuiteQL({ query: pagedQuery }).asMappedResults();
                    allResults = allResults.concat(batchResults);

                    if (batchResults.length < PAGE_SIZE) {
                        moreResults = false;
                    } else {
                        offset += PAGE_SIZE;
                    }
                }
            }

            return allResults;
        }

        /**
         * Query matrix records by zip codes - only gets NON-customer-specific records
         * Uses smaller batches and pagination to ensure all records are retrieved
         */
        function queryMatrixByZips(zipCodes) {
            var allResults = [];
            var BATCH_SIZE = 25; // Smaller batches to avoid hitting row limits
            var PAGE_SIZE = 5000;

            for (var i = 0; i < zipCodes.length; i += BATCH_SIZE) {
                var batch = zipCodes.slice(i, i + BATCH_SIZE);
                var zipList = batch.map(function(z) { return "'" + z + "'"; }).join(',');

                var baseQuery = `
                    SELECT
                        m.id,
                        m.name,
                        m.custrecord_salesrep_mapping_zipcode AS zip_code,
                        m.custrecord_salesrep_mapping_equipment AS equip_category_id,
                        eq.name AS equip_category_name,
                        m.custrecord_salesrep_mapping_rev_stream AS revenue_stream_id,
                        rs.name AS revenue_stream_name,
                        m.custrecord_salesrep_mapping_manufacturer AS manufacturer_id,
                        mfg.name AS manufacturer_name,
                        m.custrecord_salesrep_mapping_sales_reps AS sales_rep_ids,
                        m.custrecord_salesrep_mapping_customer AS customer_id,
                        cust.companyname AS customer_name,
                        m.custrecord_sna_hul_sales_rep_comm_plan_2 AS commission_plan_id,
                        cp.name AS commission_plan_name
                    FROM customrecord_sna_salesrep_matrix_mapping m
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON m.custrecord_salesrep_mapping_equipment = eq.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs ON m.custrecord_salesrep_mapping_rev_stream = rs.id
                    LEFT JOIN customrecord_cseg_hul_mfg mfg ON m.custrecord_salesrep_mapping_manufacturer = mfg.id
                    LEFT JOIN customer cust ON m.custrecord_salesrep_mapping_customer = cust.id
                    LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON m.custrecord_sna_hul_sales_rep_comm_plan_2 = cp.id
                    WHERE m.isinactive = 'F'
                      AND m.custrecord_salesrep_mapping_zipcode IN (${zipList})
                      AND m.custrecord_salesrep_mapping_customer IS NULL
                    ORDER BY m.id
                `;

                // Paginate within each batch
                var offset = 0;
                var moreResults = true;
                while (moreResults) {
                    var pagedQuery = baseQuery + ` OFFSET ${offset} ROWS FETCH NEXT ${PAGE_SIZE} ROWS ONLY`;
                    var batchResults = query.runSuiteQL({ query: pagedQuery }).asMappedResults();
                    allResults = allResults.concat(batchResults);

                    if (batchResults.length < PAGE_SIZE) {
                        moreResults = false;
                    } else {
                        offset += PAGE_SIZE;
                        // Safety limit
                        if (offset > 25000) {
                            log.audit('queryMatrixByZips', 'Hit safety limit at offset ' + offset + ' for batch starting at zip index ' + i);
                            moreResults = false;
                        }
                    }
                }
            }

            return allResults;
        }

        /**
         * Build a matrix record object from a query row
         */
        function buildMatrixRecord(row, salesRepNames) {
            var repIds = parseSalesRepIds(row.sales_rep_ids);
            var repNames = repIds.map(function(id) {
                return salesRepNames[id] || ('ID:' + id);
            });

            return {
                id: row.id,
                name: row.name,
                zip_code: row.zip_code,
                equip_category_id: row.equip_category_id,
                equip_category_name: row.equip_category_name,
                revenue_stream_id: row.revenue_stream_id,
                revenue_stream_name: row.revenue_stream_name,
                manufacturer_id: row.manufacturer_id,
                manufacturer_name: row.manufacturer_name,
                sales_rep_ids: repIds,
                sales_rep_names: repNames,
                customer_id: row.customer_id,
                customer_name: row.customer_name,
                commission_plan_id: row.commission_plan_id,
                commission_plan_name: row.commission_plan_name
            };
        }

        /**
         * Parse sales rep IDs from multi-select field
         * @param {string} value - Comma-separated IDs or single ID
         * @returns {Array} Array of sales rep IDs
         */
        function parseSalesRepIds(value) {
            if (!value) return [];
            if (typeof value === 'number') return [value];
            return String(value).split(',').map(function(id) {
                return parseInt(id.trim(), 10);
            }).filter(function(id) {
                return !isNaN(id);
            });
        }

        /**
         * Query transaction lines based on filter parameters
         */
        function queryTransactionLines(params) {
            var results = [];

            try {
                var fromDate = params.custpage_from_date;
                var toDate = params.custpage_to_date;
                var prefix = params.custpage_prefix || '';
                var tranType = params.custpage_tran_type || '';
                var excludeInternal = params.custpage_exclude_internal === 'T';
                var excludeOverride = params.custpage_exclude_override === 'T';
                var eligibleComm = params.custpage_eligible_comm || '';

                // Build transaction type filter
                var typeFilter = "t.type IN ('SalesOrd', 'CustInvc', 'CustCred')";
                if (tranType) {
                    typeFilter = "t.type = '" + tranType + "'";
                }

                // Build prefix filter
                var prefixFilter = '';
                if (prefix) {
                    prefixFilter = "AND t.tranid LIKE '" + prefix + "%'";
                }

                // Build internal revenue stream filter
                var internalFilter = '';
                if (excludeInternal) {
                    internalFilter = "AND (rs.custrecord_sna_hul_revstreaminternal IS NULL OR rs.custrecord_sna_hul_revstreaminternal = 'F')";
                }

                // Build override filter
                var overrideFilter = '';
                if (excludeOverride) {
                    overrideFilter = "AND (tl.custcol_sna_override_commission IS NULL OR tl.custcol_sna_override_commission = 'F')";
                }

                // Build eligible for commission filter
                var eligibleFilter = '';
                if (eligibleComm === 'T') {
                    eligibleFilter = "AND tl.custcol_sna_hul_eligible_for_comm = 'T'";
                } else if (eligibleComm === 'F') {
                    eligibleFilter = "AND (tl.custcol_sna_hul_eligible_for_comm IS NULL OR tl.custcol_sna_hul_eligible_for_comm = 'F')";
                }

                // Build equipment category filter
                var equipCategory = params.custpage_equip_category || '';
                var equipCategoryFilter = '';
                if (equipCategory === 'EXCLUDE_RAIL') {
                    // Exclude Rail Movers - check top-level parent name
                    equipCategoryFilter = "AND (eq_grandparent.name != 'RAIL MOVERS' OR eq_grandparent.name IS NULL) AND (eq_parent.name != 'RAIL MOVERS' OR eq_parent.name IS NULL) AND (eq.name != 'RAIL MOVERS' OR eq.name IS NULL)";
                } else if (equipCategory) {
                    // Include specific category - check all hierarchy levels
                    equipCategoryFilter = "AND (eq_grandparent.name = '" + equipCategory + "' OR eq_parent.name = '" + equipCategory + "' OR eq.name = '" + equipCategory + "')";
                }

                var lineQuery = `
                    SELECT
                        t.id AS transaction_id,
                        t.tranid AS doc_number,
                        t.trandate,
                        t.type AS tran_type,
                        t.entity AS customer_id,
                        c.entityid AS customer_number,
                        c.companyname AS customer_name,
                        tsa.zip AS shipzip,
                        tl.linesequencenumber AS line_num,
                        tl.item AS item_id,
                        i.itemid AS item_name,
                        BUILTIN.DF(i.custitem_sna_hul_itemcategory) AS item_category_name,
                        tl.netamount,
                        tl.cseg_sna_hul_eq_seg AS equip_category_id,
                        eq.name AS equip_category_name,
                        eq.parent AS equip_category_parent_id,
                        eq_parent.name AS equip_category_parent_name,
                        eq_parent.parent AS equip_category_grandparent_id,
                        eq_grandparent.name AS equip_category_grandparent_name,
                        tl.cseg_sna_revenue_st AS revenue_stream_id,
                        rs.name AS revenue_stream_name,
                        rs.parent AS revenue_stream_parent_id,
                        rs_parent.name AS revenue_stream_parent_name,
                        rs_parent.parent AS revenue_stream_grandparent_id,
                        rs_grandparent.name AS revenue_stream_grandparent_name,
                        rs_grandparent.parent AS revenue_stream_greatgrandparent_id,
                        rs_greatgrandparent.name AS revenue_stream_greatgrandparent_name,
                        rs_greatgrandparent.parent AS revenue_stream_greatgreatgrandparent_id,
                        rs_greatgreatgrandparent.name AS revenue_stream_greatgreatgrandparent_name,
                        rs.custrecord_sna_hul_revstreaminternal AS revenue_stream_internal,
                        tl.cseg_hul_mfg AS manufacturer_id,
                        mfg.name AS manufacturer_name,
                        tl.custcol_sna_sales_rep AS sales_rep_id,
                        e.entityid AS sales_rep_name,
                        tl.custcol_sna_sales_rep_matrix AS matrix_id,
                        tl.custcol_sna_commission_plan AS commission_plan_id,
                        cp.name AS commission_plan_name,
                        tl.custcol_sna_hul_eligible_for_comm AS eligible_for_comm,
                        tl.custcol_sna_override_commission AS override_flag
                    FROM transaction t
                    INNER JOIN transactionline tl ON t.id = tl.transaction
                    LEFT JOIN customer c ON t.entity = c.id
                    LEFT JOIN item i ON tl.item = i.id
                    LEFT JOIN employee e ON tl.custcol_sna_sales_rep = e.id
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON tl.cseg_sna_hul_eq_seg = eq.id
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq_parent ON eq.parent = eq_parent.id
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq_grandparent ON eq_parent.parent = eq_grandparent.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs_parent ON rs.parent = rs_parent.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs_grandparent ON rs_parent.parent = rs_grandparent.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs_greatgrandparent ON rs_grandparent.parent = rs_greatgrandparent.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs_greatgreatgrandparent ON rs_greatgrandparent.parent = rs_greatgreatgrandparent.id
                    LEFT JOIN customrecord_cseg_hul_mfg mfg ON tl.cseg_hul_mfg = mfg.id
                    LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON tl.custcol_sna_commission_plan = cp.id
                    LEFT JOIN transactionShippingAddress tsa ON t.shippingaddress = tsa.nkey
                    WHERE ${typeFilter}
                      AND tl.mainline = 'F'
                      AND tl.taxline = 'F'
                      AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                      AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                      ${prefixFilter}
                      ${internalFilter}
                      ${overrideFilter}
                      ${eligibleFilter}
                      ${equipCategoryFilter}
                      AND tl.item IS NOT NULL
                    ORDER BY t.trandate DESC, t.tranid, tl.linesequencenumber
                `;

                log.debug('queryTransactionLines', 'Running query...');

                // Limit to 5000 for Suitelet display (use Full Export for more)
                var limitedQuery = lineQuery + ` FETCH FIRST 5000 ROWS ONLY`;
                results = query.runSuiteQL({ query: limitedQuery }).asMappedResults();

                log.debug('queryTransactionLines', 'Found ' + results.length + ' lines (limited to 5000 for display)');

            } catch (e) {
                log.error('queryTransactionLines Error', e.toString());
            }

            return results;
        }

        /**
         * Validate each line against the Sales Rep Matrix
         */
        function validateLines(lines, matrixData) {
            return lines.map(function(line) {
                var validation = validateLine(line, matrixData);
                line.validation = validation;
                return line;
            });
        }

        /**
         * Validate a single line against the matrix
         */
        function validateLine(line, matrixData) {
            // Find matching matrix record first (we may need it even for missing rep)
            var matrixMatch = findMatrixMatch(line, matrixData);

            // Check if matrixMatch is a "noMatch" indicator object
            var isNoMatch = matrixMatch && matrixMatch.noMatch === true;
            var noMatchReason = isNoMatch ? matrixMatch.reason : null;

            // Build base validation result with matrix info
            var baseResult = {
                expected_rep_ids: (!isNoMatch && matrixMatch) ? (matrixMatch.sales_rep_ids || []) : [],
                expected_rep_names: (!isNoMatch && matrixMatch) ? (matrixMatch.sales_rep_names || []) : [],
                expected_matrix_id: (!isNoMatch && matrixMatch) ? matrixMatch.id : null,
                expected_matrix_name: (!isNoMatch && matrixMatch) ? matrixMatch.name : null,
                expected_commission_plan: (!isNoMatch && matrixMatch) ? matrixMatch.commission_plan_name : null,
                no_match_reason: noMatchReason
            };

            // Check for missing required fields first
            if (!line.sales_rep_id) {
                return Object.assign({
                    status: 'MISSING_REP',
                    color: CONFIG.COLORS.MISSING_REP,
                    label: 'Missing Rep'
                }, baseResult);
            }

            // Check for missing commission plan on eligible lines
            if (line.eligible_for_comm === 'T' && !line.commission_plan_id) {
                return Object.assign({
                    status: 'MISSING_PLAN',
                    color: CONFIG.COLORS.MISSING_PLAN,
                    label: 'Missing Plan'
                }, baseResult);
            }

            // Check for override flag
            if (line.override_flag === 'T') {
                return Object.assign({
                    status: 'OVERRIDE',
                    color: CONFIG.COLORS.OVERRIDE,
                    label: 'Override'
                }, baseResult);
            }

            if (!matrixMatch || isNoMatch) {
                return Object.assign({
                    status: 'NO_MATRIX',
                    color: CONFIG.COLORS.NO_MATRIX,
                    label: 'No Matrix'
                }, baseResult);
            }

            // Compare assigned rep to expected
            var expectedReps = matrixMatch.sales_rep_ids || [];
            var assignedRepId = parseInt(line.sales_rep_id, 10);

            if (expectedReps.includes(assignedRepId)) {
                return Object.assign({
                    status: 'MATCH',
                    color: CONFIG.COLORS.MATCH,
                    label: 'Match'
                }, baseResult);
            }

            return Object.assign({
                status: 'MISMATCH',
                color: CONFIG.COLORS.MISMATCH,
                label: 'Mismatch'
            }, baseResult);
        }

        /**
         * Find matching matrix record for a line
         * Priority: Customer-specific > Geographic/Category match
         *
         * IMPORTANT: Matrix uses TOP-LEVEL equipment category and PARENT revenue stream
         * Line hierarchy: grandparent > parent > child
         * - Equipment: Use grandparent_id if exists, else parent_id, else category_id
         * - Revenue Stream: Use parent_id (the level shown in matrix like "New Equipment", "Service")
         * - Manufacturer: Only used as tiebreaker when multiple matches exist
         *
         * SPECIAL CASE: For "External : Parts" lines with no equipment category,
         * default to FORKLIFT unless item category is "4600 - Trackmobile"
         */
        function findMatrixMatch(line, matrixData) {
            // Get the correct hierarchy level IDs for matching
            var topLevelEquipId = getTopLevelEquipId(line);
            var matrixRevenueStreamId = getMatrixRevenueStreamId(line);
            var shipZip = (line.shipzip || '').substring(0, 5);

            // Check if we need to apply the Parts default logic
            var usePartsDefault = false;
            var useTrackmobileDefault = false;
            var revenueStreamDisplay = formatRevenueStream(line);
            if (!topLevelEquipId && revenueStreamDisplay === 'External : Parts') {
                var itemCategory = line.item_category_name || '';
                // Check if Trackmobile - use RAIL MOVERS
                if (itemCategory.indexOf('4600') !== -1 || itemCategory.toLowerCase().indexOf('trackmobile') !== -1) {
                    useTrackmobileDefault = true;
                } else {
                    // Default to FORKLIFT for other parts
                    usePartsDefault = true;
                }
            }

            // Priority 1: Customer-specific match (must also match zip code)
            var customerMatch = null;
            var hasCustomerMatrix = line.customer_id && matrixData.byCustomer[line.customer_id] && matrixData.byCustomer[line.customer_id].length > 0;

            if (hasCustomerMatrix) {
                var customerMatches = matrixData.byCustomer[line.customer_id];
                // Filter customer matches by zip code first
                var customerMatchesForZip = customerMatches.filter(function(m) {
                    var matrixZip = (m.zip_code || '').substring(0, 5);
                    return matrixZip === shipZip;
                });

                if (customerMatchesForZip.length > 0) {
                    customerMatch = findBestMatchWithPartsDefault(customerMatchesForZip, topLevelEquipId, matrixRevenueStreamId, line.manufacturer_id, usePartsDefault, useTrackmobileDefault);
                    if (customerMatch) {
                        return customerMatch;
                    }
                }
            }

            // Priority 2: Geographic match - lookup by ZIP, then filter by category/stream
            var hasZipMatrix = shipZip && matrixData.byGeo[shipZip] && matrixData.byGeo[shipZip].length > 0;

            if (hasZipMatrix) {
                var zipMatches = matrixData.byGeo[shipZip];
                var zipMatch = findBestMatchWithPartsDefault(zipMatches, topLevelEquipId, matrixRevenueStreamId, line.manufacturer_id, usePartsDefault, useTrackmobileDefault);
                if (zipMatch) {
                    return zipMatch;
                }
            }

            // No fallbacks - return indicator of what wasn't found
            // Check if customer has matrix records for this specific zip
            var hasCustomerMatrixForZip = false;
            if (hasCustomerMatrix) {
                var customerMatches = matrixData.byCustomer[line.customer_id];
                hasCustomerMatrixForZip = customerMatches.some(function(m) {
                    var matrixZip = (m.zip_code || '').substring(0, 5);
                    return matrixZip === shipZip;
                });
            }

            // Determine the reason for no match
            if (!hasCustomerMatrix && !hasZipMatrix) {
                return { noMatch: true, reason: 'Customer NA, Zip NA' };
            } else if (hasCustomerMatrix && !hasCustomerMatrixForZip && !hasZipMatrix) {
                return { noMatch: true, reason: 'Customer zip NA, Zip NA' };
            } else if (hasCustomerMatrixForZip || hasZipMatrix) {
                // We have matrix records for this zip (either customer-specific or generic)
                // but no match on equip category/revenue stream
                return { noMatch: true, reason: 'Category/Stream NA' };
            } else if (!hasCustomerMatrixForZip && hasCustomerMatrix) {
                return { noMatch: true, reason: 'Customer zip NA' };
            } else if (!hasZipMatrix) {
                return { noMatch: true, reason: 'Zip NA' };
            }

            // Had matrix data but no criteria match
            return { noMatch: true, reason: 'No criteria match' };
        }

        /**
         * Find best match with special handling for Parts default to FORKLIFT or RAIL MOVERS (Trackmobile)
         */
        function findBestMatchWithPartsDefault(matches, topLevelEquipId, matrixRevenueStreamId, manufacturerId, usePartsDefault, useTrackmobileDefault) {
            // First try normal matching
            var match = findBestMatch(matches, topLevelEquipId, matrixRevenueStreamId, manufacturerId);
            if (match) {
                return match;
            }

            // If no match and we should use Parts default, look for FORKLIFT + Parts match
            if (usePartsDefault) {
                var forkliftMatches = matches.filter(function(m) {
                    // Match FORKLIFT equipment category by name
                    var equipName = (m.equip_category_name || '').toUpperCase();
                    if (equipName !== 'FORKLIFT') return false;

                    // Must match revenue stream if specified
                    if (m.revenue_stream_id && matrixRevenueStreamId) {
                        if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                    }
                    return true;
                });

                if (forkliftMatches.length > 0) {
                    return selectBestByManufacturer(forkliftMatches, manufacturerId);
                }
            }

            // If Trackmobile item category, look for RAIL MOVERS + Parts match
            if (useTrackmobileDefault) {
                var railMoverMatches = matches.filter(function(m) {
                    // Match RAIL MOVERS equipment category by name
                    var equipName = (m.equip_category_name || '').toUpperCase();
                    if (equipName !== 'RAIL MOVERS') return false;

                    // Must match revenue stream if specified
                    if (m.revenue_stream_id && matrixRevenueStreamId) {
                        if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                    }
                    return true;
                });

                if (railMoverMatches.length > 0) {
                    return selectBestByManufacturer(railMoverMatches, manufacturerId);
                }
            }

            return null;
        }

        /**
         * Find best match from a list of matrix records
         * First filters by equip/revenue stream, then uses manufacturer as tiebreaker
         */
        function findBestMatch(matches, topLevelEquipId, matrixRevenueStreamId, manufacturerId) {
            // Filter to matches that match equip and revenue stream (ignoring manufacturer initially)
            // Use loose equality (==) to handle string/number type differences from database
            var filtered = matches.filter(function(m) {
                // If matrix specifies equip category, it must match (or line has no category)
                if (m.equip_category_id) {
                    if (!topLevelEquipId) return false;
                    if (String(m.equip_category_id) !== String(topLevelEquipId)) return false;
                }
                // If matrix specifies revenue stream, it must match (or line has no stream)
                if (m.revenue_stream_id) {
                    if (!matrixRevenueStreamId) return false;
                    if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                }
                return true;
            });

            if (filtered.length === 0) {
                return null;
            }

            // Use manufacturer as tiebreaker
            return selectBestByManufacturer(filtered, manufacturerId);
        }

        /**
         * Select best match from candidates using manufacturer as tiebreaker
         * If there's a manufacturer-specific match, prefer it; otherwise return first match
         */
        function selectBestByManufacturer(candidates, manufacturerId) {
            if (!candidates || candidates.length === 0) {
                return null;
            }

            if (candidates.length === 1) {
                return candidates[0];
            }

            // Look for manufacturer-specific match
            if (manufacturerId) {
                var mfgMatch = candidates.find(function(m) {
                    return m.manufacturer_id && String(m.manufacturer_id) === String(manufacturerId);
                });
                if (mfgMatch) {
                    return mfgMatch;
                }
            }

            // Look for a match without manufacturer specified (generic match)
            var genericMatch = candidates.find(function(m) {
                return !m.manufacturer_id;
            });
            if (genericMatch) {
                return genericMatch;
            }

            // Fall back to first match
            return candidates[0];
        }

        /**
         * Get the top-level equipment category ID for matrix matching
         * Returns grandparent if exists, else parent if exists, else the category itself
         */
        function getTopLevelEquipId(line) {
            if (line.equip_category_grandparent_id) {
                return line.equip_category_grandparent_id;
            }
            if (line.equip_category_parent_id) {
                return line.equip_category_parent_id;
            }
            return line.equip_category_id;
        }

        /**
         * Get the revenue stream ID at the level used by the matrix
         * Matrix uses the SECOND level (e.g., "Service", "Parts", "Rental", "New Equipment")
         * which is the direct child of "External" (ID: 1) or "Internal" (ID: 2)
         *
         * Known Level 2 IDs (children of External/Internal):
         * External (1) children: Service(5), Rental(6), Parts(7), New Equipment(8), Used Equipment(3), Allied Equipment(4), Other(420)
         * Internal (2) children: Service(12), Rental(13), Parts(14), New Equipment(9), Used Equipment(10), Allied Equipment(11), Freight(16)
         *
         * Strategy: Walk UP the hierarchy until we find a parent that is External(1) or Internal(2),
         * then return that child's ID.
         */
        function getMatrixRevenueStreamId(line) {
            var EXTERNAL_ID = '1';
            var INTERNAL_ID = '2';

            // Build an array of the hierarchy from top to bottom with available data
            // Format: [{id, parent_id}, ...]
            var levels = [];

            // Add levels we have data for (from deepest to shallowest based on field names)
            if (line.revenue_stream_id) {
                levels.push({
                    id: String(line.revenue_stream_id),
                    parent_id: line.revenue_stream_parent_id ? String(line.revenue_stream_parent_id) : null
                });
            }
            if (line.revenue_stream_parent_id) {
                levels.push({
                    id: String(line.revenue_stream_parent_id),
                    parent_id: line.revenue_stream_grandparent_id ? String(line.revenue_stream_grandparent_id) : null
                });
            }
            if (line.revenue_stream_grandparent_id) {
                levels.push({
                    id: String(line.revenue_stream_grandparent_id),
                    parent_id: line.revenue_stream_greatgrandparent_id ? String(line.revenue_stream_greatgrandparent_id) : null
                });
            }
            if (line.revenue_stream_greatgrandparent_id) {
                levels.push({
                    id: String(line.revenue_stream_greatgrandparent_id),
                    parent_id: line.revenue_stream_greatgreatgrandparent_id ? String(line.revenue_stream_greatgreatgrandparent_id) : null
                });
            }
            if (line.revenue_stream_greatgreatgrandparent_id) {
                levels.push({
                    id: String(line.revenue_stream_greatgreatgrandparent_id),
                    parent_id: null  // This is the top level we have
                });
            }

            // Find the level whose parent is External(1) or Internal(2)
            for (var i = 0; i < levels.length; i++) {
                var level = levels[i];
                if (level.parent_id === EXTERNAL_ID || level.parent_id === INTERNAL_ID) {
                    return level.id;
                }
            }

            // Fallback: if we couldn't find it, check if the current level IS External or Internal
            // (meaning line is at level 1 - shouldn't happen but handle it)
            if (line.revenue_stream_id) {
                var currentId = String(line.revenue_stream_id);
                if (currentId === EXTERNAL_ID || currentId === INTERNAL_ID) {
                    return null;  // Can't match at level 1
                }
            }

            // Last resort: return the highest level we have that isn't External/Internal
            for (var j = levels.length - 1; j >= 0; j--) {
                var lvl = levels[j];
                if (lvl.id !== EXTERNAL_ID && lvl.id !== INTERNAL_ID) {
                    return lvl.id;
                }
            }

            return line.revenue_stream_id;
        }

        /**
         * Build results HTML (stats + table)
         * @param {Array} results - Validated transaction lines
         * @param {Object} params - Request parameters
         * @returns {string} HTML string
         */
        function buildResultsHtml(results, params) {
            // Calculate statistics
            var stats = calculateStats(results);

            // Filter to issues only if checkbox is set
            var displayResults = results;
            if (params.custpage_issues_only === 'T') {
                displayResults = results.filter(function(r) {
                    return r.validation.status !== 'MATCH' && r.validation.status !== 'OVERRIDE';
                });
            }

            // Build HTML output
            var html = buildStatsHtml(stats, params);
            html += buildResultsTableHtml(displayResults);

            return html;
        }

        /**
         * Calculate statistics from results
         */
        function calculateStats(results) {
            var stats = {
                total: results.length,
                match: 0,
                override: 0,
                mismatch: 0,
                missing_rep: 0,
                missing_plan: 0,
                no_matrix: 0
            };

            results.forEach(function(r) {
                switch (r.validation.status) {
                    case 'MATCH': stats.match++; break;
                    case 'OVERRIDE': stats.override++; break;
                    case 'MISMATCH': stats.mismatch++; break;
                    case 'MISSING_REP': stats.missing_rep++; break;
                    case 'MISSING_PLAN': stats.missing_plan++; break;
                    case 'NO_MATRIX': stats.no_matrix++; break;
                }
            });

            return stats;
        }

        /**
         * Build statistics HTML
         */
        function buildStatsHtml(stats, params) {
            // Build export URL with ALL filter parameters
            var exportUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId,
                params: {
                    export: 'csv',
                    custpage_from_date: params.custpage_from_date,
                    custpage_to_date: params.custpage_to_date,
                    custpage_prefix: params.custpage_prefix,
                    custpage_tran_type: params.custpage_tran_type,
                    custpage_issues_only: params.custpage_issues_only,
                    custpage_exclude_internal: params.custpage_exclude_internal,
                    custpage_exclude_override: params.custpage_exclude_override,
                    custpage_eligible_comm: params.custpage_eligible_comm,
                    custpage_equip_category: params.custpage_equip_category
                }
            });

            return '<div class="stats-container">' +
                '<div class="stats-box"><div class="stats-number">' + stats.total + '</div><div class="stats-label">Total Lines</div></div>' +
                '<div class="stats-box green"><div class="stats-number">' + stats.match + '</div><div class="stats-label">Match</div></div>' +
                '<div class="stats-box yellow"><div class="stats-number">' + stats.override + '</div><div class="stats-label">Override</div></div>' +
                '<div class="stats-box orange"><div class="stats-number">' + stats.mismatch + '</div><div class="stats-label">Mismatch</div></div>' +
                '<div class="stats-box red"><div class="stats-number">' + stats.missing_rep + '</div><div class="stats-label">Missing Rep</div></div>' +
                '<div class="stats-box red"><div class="stats-number">' + stats.missing_plan + '</div><div class="stats-label">Missing Plan</div></div>' +
                '<div class="stats-box gray"><div class="stats-number">' + stats.no_matrix + '</div><div class="stats-label">No Matrix</div></div>' +
                '<a href="' + exportUrl + '" class="export-btn" target="_blank">Export CSV</a>' +
                '</div>';
        }

        /**
         * Build results table HTML
         */
        function buildResultsTableHtml(results) {
            if (results.length === 0) {
                return '<div style="padding: 20px; text-align: center; color: #666;">No results found for the selected criteria.</div>';
            }

            var html = '<div style="max-height: 600px; overflow-y: auto;">' +
                '<table class="results-table">' +
                '<thead><tr>' +
                '<th>Doc #</th>' +
                '<th>Date</th>' +
                '<th>Type</th>' +
                '<th>Ln</th>' +
                '<th>Customer ID</th>' +
                '<th>Customer #</th>' +
                '<th>Customer Name</th>' +
                '<th>Item</th>' +
                '<th>Item Category</th>' +
                '<th>Zip</th>' +
                '<th>Equip Category</th>' +
                '<th>Revenue Stream</th>' +
                '<th>Manufacturer</th>' +
                '<th>Status</th>' +
                '<th>Override</th>' +
                '<th>Eligible</th>' +
                '<th>Sales Rep</th>' +
                '<th>Expected Rep</th>' +
                '<th>Expected Matrix</th>' +
                '<th>Amount</th>' +
                '</tr></thead><tbody>';

            results.forEach(function(r) {
                var rowStyle = 'background-color: ' + r.validation.color + ';';
                var tranUrl = '/app/accounting/transactions/transaction.nl?id=' + r.transaction_id;
                var dateStr = r.trandate ? formatDate(r.trandate) : '';

                // Format equipment category - show top-level parent only
                var equipCatDisplay = formatEquipCategory(r);

                // Format revenue stream - show "Parent : Child" format
                var revenueStreamDisplay = formatRevenueStream(r);

                // Format expected rep names
                var expectedRepDisplay = formatExpectedRepNames(r.validation);

                // Format expected matrix link
                var expectedMatrixDisplay = formatExpectedMatrix(r.validation);

                html += '<tr style="' + rowStyle + '">' +
                    '<td><a href="' + tranUrl + '" target="_blank">' + (r.doc_number || '') + '</a></td>' +
                    '<td>' + dateStr + '</td>' +
                    '<td>' + formatTranType(r.tran_type) + '</td>' +
                    '<td>' + (r.line_num || '') + '</td>' +
                    '<td>' + (r.customer_id || '') + '</td>' +
                    '<td>' + (r.customer_number || '') + '</td>' +
                    '<td>' + (r.customer_name || '') + '</td>' +
                    '<td>' + (r.item_name || '') + '</td>' +
                    '<td>' + (r.item_category_name || '') + '</td>' +
                    '<td>' + (r.shipzip || '') + '</td>' +
                    '<td>' + equipCatDisplay + '</td>' +
                    '<td>' + revenueStreamDisplay + '</td>' +
                    '<td>' + (r.manufacturer_name || '') + '</td>' +
                    '<td><span class="status-badge">' + r.validation.label + '</span></td>' +
                    '<td>' + (r.override_flag === 'T' ? 'Yes' : 'No') + '</td>' +
                    '<td>' + (r.eligible_for_comm === 'T' ? 'Yes' : 'No') + '</td>' +
                    '<td>' + (r.sales_rep_name || '<em>None</em>') + '</td>' +
                    '<td class="expected-rep">' + expectedRepDisplay + '</td>' +
                    '<td>' + expectedMatrixDisplay + '</td>' +
                    '<td style="text-align: right;">' + formatCurrency(r.netamount) + '</td>' +
                    '</tr>';
            });

            html += '</tbody></table></div>';
            return html;
        }

        /**
         * Format date for display
         */
        function formatDate(dateStr) {
            if (!dateStr) return '';
            var d = new Date(dateStr);
            return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        }

        /**
         * Format transaction type
         */
        function formatTranType(type) {
            switch (type) {
                case 'SalesOrd': return 'SO';
                case 'CustInvc': return 'INV';
                case 'CustCred': return 'CM';
                default: return type || '';
            }
        }

        /**
         * Format expected rep names from validation result
         */
        function formatExpectedRepNames(validation) {
            if (!validation.expected_rep_names || validation.expected_rep_names.length === 0) {
                return '';
            }
            return validation.expected_rep_names.join(', ');
        }

        /**
         * Format expected matrix as a clickable link or show reason for no match
         */
        function formatExpectedMatrix(validation) {
            if (!validation.expected_matrix_id) {
                // Show reason if available
                if (validation.no_match_reason) {
                    return '<span style="color: #999; font-style: italic;">' + validation.no_match_reason + '</span>';
                }
                return '';
            }
            var matrixUrl = '/app/common/custom/custrecordentry.nl?rectype=customrecord_sna_salesrep_matrix_mapping&id=' + validation.expected_matrix_id;
            var displayName = validation.expected_matrix_name || ('Matrix #' + validation.expected_matrix_id);
            return '<a href="' + matrixUrl + '" target="_blank" style="color: #667eea;">' + displayName + '</a>';
        }

        /**
         * Format currency
         */
        function formatCurrency(amount) {
            if (amount === null || amount === undefined) return '';
            return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }

        /**
         * Format equipment category - show top-level parent only
         * Hierarchy: Grandparent > Parent > Child (we want Grandparent or Parent if no Grandparent)
         */
        function formatEquipCategory(row) {
            // If there's a grandparent, that's the top level
            if (row.equip_category_grandparent_name) {
                return row.equip_category_grandparent_name;
            }
            // If there's a parent but no grandparent, parent is top level
            if (row.equip_category_parent_name) {
                return row.equip_category_parent_name;
            }
            // Otherwise use the category itself (it's already top level)
            return row.equip_category_name || '';
        }

        /**
         * Format revenue stream - show top two levels "TopLevel : SecondLevel" format
         * Example: "External : Service", "External : New Equipment", "External : Parts"
         *
         * We need to find the TOP level (the one with no parent) and the SECOND level.
         * Hierarchy can be up to 5 levels deep.
         */
        function formatRevenueStream(row) {
            var greatgreatgrandparent = row.revenue_stream_greatgreatgrandparent_name || '';
            var greatgrandparent = row.revenue_stream_greatgrandparent_name || '';
            var grandparent = row.revenue_stream_grandparent_name || '';
            var parent = row.revenue_stream_parent_name || '';
            var child = row.revenue_stream_name || '';

            // 5 levels: great-great-grandparent is top, great-grandparent is second
            if (greatgreatgrandparent) {
                return greatgreatgrandparent + ' : ' + greatgrandparent;
            }
            // 4 levels: great-grandparent is top, grandparent is second
            if (greatgrandparent) {
                return greatgrandparent + ' : ' + grandparent;
            }
            // 3 levels: grandparent is top, parent is second
            if (grandparent) {
                return grandparent + ' : ' + parent;
            }
            // 2 levels: parent is top, child is second
            if (parent) {
                return parent + ' : ' + child;
            }
            // 1 level: just show the name
            return child;
        }

        /**
         * Export results to CSV
         */
        function exportToCSV(context) {
            try {
                var params = context.request.parameters;
                var results = queryTransactionLines(params);

                // Extract unique zip codes and customer IDs
                var zipCodes = [];
                var customerIds = [];
                results.forEach(function(line) {
                    if (line.shipzip) {
                        var zip = String(line.shipzip).substring(0, 5);
                        if (zipCodes.indexOf(zip) === -1) {
                            zipCodes.push(zip);
                        }
                    }
                    if (line.customer_id && customerIds.indexOf(line.customer_id) === -1) {
                        customerIds.push(line.customer_id);
                    }
                });

                var matrixData = loadMatrixDataForZips(zipCodes, customerIds);
                var validatedResults = validateLines(results, matrixData);

                // Apply "Show Only Issues" filter if set (same as display)
                var exportResults = validatedResults;
                if (params.custpage_issues_only === 'T') {
                    exportResults = validatedResults.filter(function(r) {
                        return r.validation.status !== 'MATCH' && r.validation.status !== 'OVERRIDE';
                    });
                }

                // Build CSV content
                var csv = 'Doc #,Date,Type,Line,Customer ID,Customer #,Customer Name,Item,Item Category,Zip,Equip Category,Revenue Stream,Manufacturer,Status,Override,Eligible,Sales Rep,Expected Rep,Expected Matrix,Amount\n';

                exportResults.forEach(function(r) {
                    csv += '"' + (r.doc_number || '') + '",' +
                        '"' + formatDate(r.trandate) + '",' +
                        '"' + formatTranType(r.tran_type) + '",' +
                        '"' + (r.line_num || '') + '",' +
                        '"' + (r.customer_id || '') + '",' +
                        '"' + (r.customer_number || '').replace(/"/g, '""') + '",' +
                        '"' + (r.customer_name || '').replace(/"/g, '""') + '",' +
                        '"' + (r.item_name || '').replace(/"/g, '""') + '",' +
                        '"' + (r.item_category_name || '').replace(/"/g, '""') + '",' +
                        '"' + (r.shipzip || '') + '",' +
                        '"' + formatEquipCategory(r) + '",' +
                        '"' + formatRevenueStream(r) + '",' +
                        '"' + (r.manufacturer_name || '') + '",' +
                        '"' + r.validation.label + '",' +
                        '"' + (r.override_flag === 'T' ? 'Yes' : 'No') + '",' +
                        '"' + (r.eligible_for_comm === 'T' ? 'Yes' : 'No') + '",' +
                        '"' + (r.sales_rep_name || '') + '",' +
                        '"' + formatExpectedRepNames(r.validation) + '",' +
                        '"' + (r.validation.expected_matrix_name || r.validation.no_match_reason || '') + '",' +
                        '"' + (r.netamount || 0) + '"\n';
                });

                // Create and download file
                var csvFile = file.create({
                    name: 'commission_validation_' + new Date().getTime() + '.csv',
                    fileType: file.Type.CSV,
                    contents: csv
                });

                context.response.writeFile({
                    file: csvFile,
                    isInline: false
                });

            } catch (e) {
                log.error('exportToCSV Error', e.toString());
                context.response.write('Error exporting CSV: ' + e.toString());
            }
        }

        /**
         * Triggers the Map/Reduce script for full export
         * @param {Object} context - Request context
         */
        function triggerMapReduceExport(context) {
            try {
                var params = context.request.parameters;
                var currentUser = runtime.getCurrentUser();

                // Create Map/Reduce task with filter parameters
                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_hul_mr_commission_export',
                    deploymentId: 'customdeploy_hul_mr_commission_export',
                    params: {
                        custscript_comm_export_from_date: params.custpage_from_date,
                        custscript_comm_export_to_date: params.custpage_to_date,
                        custscript_comm_export_prefix: params.custpage_prefix || '',
                        custscript_comm_export_tran_type: params.custpage_tran_type || '',
                        custscript_comm_export_exclude_internal: params.custpage_exclude_internal === 'T' ? 'T' : 'F',
                        custscript_comm_export_exclude_override: params.custpage_exclude_override === 'T' ? 'T' : 'F',
                        custscript_comm_export_eligible_comm: params.custpage_eligible_comm || '',
                        custscript_comm_export_equip_category: params.custpage_equip_category || '',
                        custscript_comm_export_user_email: currentUser.email
                    }
                });

                var taskId = mrTask.submit();
                log.audit('Map/Reduce Export Triggered', 'Task ID: ' + taskId);

                // Show confirmation page
                var html = '<!DOCTYPE html>' +
                    '<html><head><title>Full Export Started</title>' +
                    '<style>' +
                    'body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }' +
                    '.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }' +
                    '.success { color: #28a745; font-size: 48px; margin-bottom: 20px; }' +
                    'h1 { color: #333; margin-bottom: 10px; }' +
                    'p { color: #666; line-height: 1.6; }' +
                    '.task-id { background: #e9ecef; padding: 10px 15px; border-radius: 4px; font-family: monospace; margin: 20px 0; }' +
                    '.back-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }' +
                    '.back-btn:hover { background: #5a6fd6; }' +
                    '</style>' +
                    '</head><body>' +
                    '<div class="container">' +
                    '<div class="success">&#10003;</div>' +
                    '<h1>Full Export Started</h1>' +
                    '<p>Your commission validation export is now processing in the background. ' +
                    'This may take several minutes depending on the number of transaction lines.</p>' +
                    '<div class="task-id"><strong>Task ID:</strong> ' + taskId + '</div>' +
                    '<p><strong>What happens next:</strong></p>' +
                    '<ul>' +
                    '<li>The export will process all matching transaction lines (no limit)</li>' +
                    '<li>A CSV file will be saved to the File Cabinet</li>' +
                    '<li>You will receive an email at <strong>' + currentUser.email + '</strong> with a link to download the file</li>' +
                    '</ul>' +
                    '<p>You can monitor the task progress in: Setup > SuiteCloud Development > Scheduled Script Status</p>' +
                    '<a href="' + url.resolveScript({
                        scriptId: runtime.getCurrentScript().id,
                        deploymentId: runtime.getCurrentScript().deploymentId
                    }) + '" class="back-btn">Back to Commission Validator</a>' +
                    '</div>' +
                    '</body></html>';

                context.response.write(html);

            } catch (e) {
                log.error('triggerMapReduceExport Error', e.toString() + '\n' + (e.stack || ''));

                var errorHtml = '<!DOCTYPE html>' +
                    '<html><head><title>Export Error</title>' +
                    '<style>' +
                    'body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }' +
                    '.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }' +
                    '.error { color: #dc3545; font-size: 48px; margin-bottom: 20px; }' +
                    'h1 { color: #333; margin-bottom: 10px; }' +
                    'p { color: #666; line-height: 1.6; }' +
                    '.error-details { background: #fff3f3; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; font-family: monospace; font-size: 12px; overflow-x: auto; }' +
                    '.back-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }' +
                    '</style>' +
                    '</head><body>' +
                    '<div class="container">' +
                    '<div class="error">&#10007;</div>' +
                    '<h1>Export Failed to Start</h1>' +
                    '<p>There was an error starting the full export. Please ensure the Map/Reduce script is deployed.</p>' +
                    '<div class="error-details">' + e.toString() + '</div>' +
                    '<p><strong>To fix this:</strong></p>' +
                    '<ul>' +
                    '<li>Ensure the Map/Reduce script <code>hul_mr_commission_export.js</code> is uploaded to File Cabinet</li>' +
                    '<li>Create a Script Record with ID <code>customscript_hul_mr_commission_export</code></li>' +
                    '<li>Create a Deployment with ID <code>customdeploy_hul_mr_commission_export</code></li>' +
                    '</ul>' +
                    '<a href="' + url.resolveScript({
                        scriptId: runtime.getCurrentScript().id,
                        deploymentId: runtime.getCurrentScript().deploymentId
                    }) + '" class="back-btn">Back to Commission Validator</a>' +
                    '</div>' +
                    '</body></html>';

                context.response.write(errorHtml);
            }
        }

        return {
            onRequest: onRequest
        };
    });
