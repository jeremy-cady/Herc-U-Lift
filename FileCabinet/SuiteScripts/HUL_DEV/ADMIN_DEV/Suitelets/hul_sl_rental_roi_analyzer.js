/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * Rental Equipment ROI Analyzer
 *
 * Purpose: Calculate ROI for rental fleet equipment by comparing rental revenue
 * against associated costs over a configurable time period.
 *
 * Key Design:
 * - Revenue = ALL R-prefix invoices (rental revenue from any customer)
 * - Revenue Credits = ALL CM-prefix credit memos linked to equipment
 * - Costs = INTERNAL revenue streams only (W, PS, T internal service charges)
 * - Cost Credits = INTERNAL revenue stream CM credits
 *
 * @see Documentation/PRDs/PRD-20251128-RentalEquipmentROIAnalyzer.md
 *
 * Version: 1.0
 * Date: November 2025
 */

define(['N/query', 'N/ui/serverWidget', 'N/file', 'N/format', 'N/runtime', 'N/url', 'N/search'],
    function(query, serverWidget, file, format, runtime, url, search) {

        /**
         * Configuration constants
         */
        const CONFIG = {
            // Color scheme for display
            COLORS: {
                REVENUE: '#28a745',      // Green
                CREDIT: '#dc3545',       // Red
                NET_REVENUE: '#007bff',  // Blue
                COST: '#fd7e14',         // Orange
                PROFIT: '#28a745',       // Green (for positive)
                LOSS: '#dc3545',         // Red (for negative)
                ROI_GOOD: '#28a745',     // Green (ROI > 20%)
                ROI_MEDIUM: '#ffc107',   // Yellow (ROI 0-20%)
                ROI_BAD: '#dc3545'       // Red (ROI < 0)
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
         * Handles GET requests - displays form and results
         */
        function handleGet(context) {
            try {
                // Check for CSV export
                if (context.request.parameters.export === 'csv') {
                    exportToCSV(context);
                    return;
                }

                var form = serverWidget.createForm({
                    title: 'Rental Equipment ROI Analyzer'
                });

                // Add header with description
                addHeaderHtml(form);

                // Add filter fields
                addFilterFields(form, context.request.parameters);

                // Add submit button
                form.addSubmitButton({
                    label: 'Calculate ROI'
                });

                // If filters are set, run analysis and display results
                var params = context.request.parameters;
                if (params.custpage_equipment && params.custpage_date_from && params.custpage_date_to) {
                    var results = analyzeEquipmentROI(params);
                    if (results.error) {
                        displayError(form, results.error);
                    } else {
                        displayResults(form, results, params);
                    }
                }

                // Add a spacer field to push results below the form
                var spacerField = form.addField({
                    id: 'custpage_spacer',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Spacer'
                });
                spacerField.defaultValue = '<div style="clear: both;"></div>';

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
         *//**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * Rental Equipment ROI Analyzer
 *
 * Purpose: Calculate ROI for rental fleet equipment by comparing rental revenue
 * against associated costs over a configurable time period.
 *
 * Key Design:
 * - Revenue = ALL R-prefix invoices (rental revenue from any customer)
 * - Revenue Credits = ALL CM-prefix credit memos linked to equipment
 * - Costs = INTERNAL revenue streams only (W, PS, T internal service charges)
 * - Cost Credits = INTERNAL revenue stream CM credits
 *
 * @see Documentation/PRDs/PRD-20251128-RentalEquipmentROIAnalyzer.md
 *
 * Version: 1.0
 * Date: November 2025
 */

define(['N/query', 'N/ui/serverWidget', 'N/file', 'N/format', 'N/runtime', 'N/url', 'N/search'],
    function(query, serverWidget, file, format, runtime, url, search) {

        /**
         * Configuration constants
         */
        const CONFIG = {
            // Color scheme for display
            COLORS: {
                REVENUE: '#28a745',      // Green
                CREDIT: '#dc3545',       // Red
                NET_REVENUE: '#007bff',  // Blue
                COST: '#fd7e14',         // Orange
                PROFIT: '#28a745',       // Green (for positive)
                LOSS: '#dc3545',         // Red (for negative)
                ROI_GOOD: '#28a745',     // Green (ROI > 20%)
                ROI_MEDIUM: '#ffc107',   // Yellow (ROI 0-20%)
                ROI_BAD: '#dc3545'       // Red (ROI < 0)
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
         * Handles GET requests - displays form and results
         */
        function handleGet(context) {
            try {
                // Check for CSV export
                if (context.request.parameters.export === 'csv') {
                    exportToCSV(context);
                    return;
                }

                var form = serverWidget.createForm({
                    title: 'Rental Equipment ROI Analyzer'
                });

                // Add header with description
                addHeaderHtml(form);

                // Add filter fields
                addFilterFields(form, context.request.parameters);

                // Add submit button
                form.addSubmitButton({
                    label: 'Calculate ROI'
                });

                // If filters are set, run analysis and display results
                var params = context.request.parameters;
                if (params.custpage_equipment && params.custpage_date_from && params.custpage_date_to) {
                    var results = analyzeEquipmentROI(params);
                    if (results.error) {
                        displayError(form, results.error);
                    } else {
                        displayResults(form, results, params);
                    }
                }

                // Add a spacer field to push results below the form
                var spacerField = form.addField({
                    id: 'custpage_spacer',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Spacer'
                });
                spacerField.defaultValue = '<div style="clear: both;"></div>';

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
            handleGet(context);
        }

        /**
         * Adds header HTML with description
         */
        function addHeaderHtml(form) {
            var headerField = form.addField({
                id: 'custpage_header_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Header'
            });

            headerField.defaultValue =
                '<style>' +
                '/* Force results to full width below form */' +
                '#custpage_results_fs_lbl { display: none !important; }' +
                '#custpage_results_fs { width: 100% !important; clear: both !important; float: none !important; }' +
                '#custpage_results_val { width: 100% !important; }' +
                '' +
                '/* Main Layout */' +
                '.roi-results-container { max-width: 100%; margin: 20px 0 0 0; clear: both; }' +
                '.roi-main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 20px; }' +
                '' +
                '/* Metrics Row */' +
                '.roi-metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 20px 0; }' +
                '.roi-box { padding: 15px 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; border-left: 5px solid; }' +
                '.roi-number { font-size: 20px; font-weight: bold; white-space: nowrap; }' +
                '.roi-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 5px; }' +
                '' +
                '/* Info Box */' +
                '.info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0; border-radius: 4px; }' +
                '' +
                '/* Equipment Header */' +
                '.equipment-header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }' +
                '.equipment-header h3 { margin: 0 0 15px 0; color: #333; font-size: 18px; }' +
                '.equipment-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }' +
                '.equipment-detail { font-size: 13px; }' +
                '.equipment-detail label { font-weight: bold; color: #666; margin-right: 5px; }' +
                '' +
                '/* Tables */' +
                '.tables-grid { display: block; margin-top: 20px; }' +
                '.transaction-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto; }' +
                '.transaction-table th { background: #f1f3f4; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; border-bottom: 2px solid #ddd; }' +
                '.transaction-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }' +
                '.transaction-table tr:hover { background: #f8f9fa; }' +
                '.transaction-table .amount-col { text-align: right; white-space: nowrap; }' +
                '' +
                '/* Section Headers */' +
                '.section-header { background: #667eea; color: white; padding: 10px 15px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }' +
                '.section-header-title { }' +
                '.section-header-total { font-size: 14px; font-weight: bold; }' +
                '.section-content { border: 1px solid #ddd; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; background: white; overflow-x: auto; }' +
                '.section-box { margin-bottom: 20px; }' +
                '' +
                '/* Cost Breakdown */' +
                '.cost-breakdown-container { margin: 15px 0; }' +
                '.cost-breakdown-grid { display: flex; flex-wrap: wrap; gap: 10px; }' +
                '' +
                '/* Export Button */' +
                '.export-container { margin: 15px 0; }' +
                '.export-btn { display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 13px; }' +
                '.export-btn:hover { background: #218838; }' +
                '</style>' +
                '<div class="info-box">' +
                '<strong>Purpose:</strong> Calculate ROI for rental fleet equipment by comparing rental revenue against internal costs. ' +
                'Enter a fleet code or serial number and date range to analyze equipment profitability.' +
                '</div>';
        }

        /**
         * Adds filter fields to the form
         */
        function addFilterFields(form, params) {
            var filterGroup = form.addFieldGroup({
                id: 'custpage_filters',
                label: 'Analysis Parameters'
            });

            // Equipment search field
            var equipmentField = form.addField({
                id: 'custpage_equipment',
                type: serverWidget.FieldType.TEXT,
                label: 'Equipment (Fleet Code or Serial Number)',
                container: 'custpage_filters'
            });
            equipmentField.isMandatory = true;
            if (params.custpage_equipment) {
                equipmentField.defaultValue = params.custpage_equipment;
            }

            // From date
            var fromDateField = form.addField({
                id: 'custpage_date_from',
                type: serverWidget.FieldType.DATE,
                label: 'From Date',
                container: 'custpage_filters'
            });
            fromDateField.isMandatory = true;
            if (params.custpage_date_from) {
                fromDateField.defaultValue = params.custpage_date_from;
            }

            // To date
            var toDateField = form.addField({
                id: 'custpage_date_to',
                type: serverWidget.FieldType.DATE,
                label: 'To Date',
                container: 'custpage_filters'
            });
            toDateField.isMandatory = true;
            if (params.custpage_date_to) {
                toDateField.defaultValue = params.custpage_date_to;
            }
        }

        /**
         * Main analysis function - calculates ROI for equipment
         */
        function analyzeEquipmentROI(params) {
            var result = {
                equipment: null,
                revenue: { transactions: [], total: 0 },
                credits: { transactions: [], total: 0 },
                costs: { transactions: [], total: 0, byType: {} },
                summary: {}
            };

            try {
                // Step 1: Find equipment
                var equipment = findEquipment(params.custpage_equipment);
                if (!equipment) {
                    return { error: 'Equipment not found with fleet code or serial: ' + params.custpage_equipment };
                }
                result.equipment = equipment;

                log.audit({
                    title: 'Equipment Found',
                    details: 'Object ID: ' + equipment.objectId + ', Fleet Code: ' + equipment.fleetCode
                });

                // Step 1b: Get first rental invoice date (independent of date filters)
                var firstRental = getFirstRentalInvoice(equipment.objectId);
                equipment.firstRentalInvoice = firstRental;

                // Step 2: Get revenue transactions (R-prefix invoices, Internal only)
                var revenueData = getRevenueTransactions(equipment.objectId, params.custpage_date_from, params.custpage_date_to);
                result.revenue = revenueData.revenue;
                result.credits = revenueData.credits;

                // Step 3: Get cost transactions (all Internal, exclude R-prefix)
                // Note: custcol_sna_hul_fleet_no stores Object Internal ID, so we use objectId for matching
                result.costs = getCostTransactions(equipment.objectId, params.custpage_date_from, params.custpage_date_to);

                // Step 4: Calculate summary metrics
                result.summary = calculateSummary(result);

            } catch (e) {
                log.error({
                    title: 'Error in analyzeEquipmentROI',
                    details: e.toString() + '\n' + (e.stack || '')
                });
                return { error: 'Analysis error: ' + e.toString() };
            }

            return result;
        }

        /**
         * Finds equipment by fleet code or serial number
         */
        function findEquipment(searchText) {
            if (!searchText) return null;

            searchText = searchText.trim().toUpperCase();

            var sql = `
                SELECT
                    a.id AS asset_id,
                    a.custrecord_sna_hul_fleetcode AS fleet_code,
                    a.custrecord_nx_asset_serial AS serial,
                    o.id AS object_id,
                    o.name AS object_name,
                    o.custrecord_sna_year AS year,
                    BUILTIN.DF(a.cseg_hul_mfg) AS manufacturer,
                    BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
                    BUILTIN.DF(a.cseg_sna_hul_eq_seg) AS category,
                    BUILTIN.DF(o.custrecord_sna_responsibility_center) AS location
                FROM customrecord_nx_asset a
                INNER JOIN customrecord_sna_objects o ON a.custrecord_sna_hul_nxcassetobject = o.id
                WHERE (UPPER(a.custrecord_sna_hul_fleetcode) = '${searchText}'
                       OR UPPER(a.custrecord_nx_asset_serial) = '${searchText}')
                  AND a.isinactive = 'F'
            `;

            try {
                var queryResults = query.runSuiteQL({ query: sql });
                var results = queryResults.asMappedResults();

                if (results.length > 0) {
                    var row = results[0];
                    var currentYear = new Date().getFullYear();
                    var equipmentYear = row.year ? parseInt(row.year, 10) : null;
                    var age = equipmentYear ? (currentYear - equipmentYear) : null;

                    return {
                        assetId: row.asset_id,
                        objectId: row.object_id,
                        fleetCode: row.fleet_code || '',
                        serial: row.serial || '',
                        objectName: row.object_name || '',
                        year: row.year,
                        age: age,
                        manufacturer: row.manufacturer || '',
                        model: row.model || '',
                        category: row.category || '',
                        location: row.location || ''
                    };
                }
            } catch (e) {
                log.error({
                    title: 'Error in findEquipment',
                    details: e.toString()
                });
            }

            return null;
        }

        /**
         * Finds the first rental invoice date for the equipment (regardless of date filters)
         * This helps users know the full history range of the equipment
         */
        function getFirstRentalInvoice(objectId) {
            var sql = `
                SELECT
                    t.tranid AS transaction_number,
                    t.trandate
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                WHERE t.type = 'CustInvc'
                  AND t.tranid LIKE 'R%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                ORDER BY t.trandate ASC
                FETCH FIRST 1 ROWS ONLY
            `;

            try {
                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                if (results.length > 0) {
                    return {
                        number: results[0].transaction_number,
                        date: results[0].trandate
                    };
                }
            } catch (e) {
                log.error({
                    title: 'Error in getFirstRentalInvoice',
                    details: e.toString()
                });
            }

            return null;
        }

        /**
         * Gets the applied transactions (payments/credits) for an invoice
         * or the invoices a credit memo was applied to
         * Returns array of objects with id, tranid, and type for building links
         */
        function getAppliedTransactions(transactionId, transactionType) {
            try {
                var appliedList = [];

                if (transactionType === 'CustInvc' || transactionType === 'Invoice') {
                    // For invoices, search for customer payments that have this invoice in their apply list
                    var pymtSearch = search.create({
                        type: search.Type.CUSTOMER_PAYMENT,
                        filters: [
                            ['appliedtotransaction', 'anyof', transactionId]
                        ],
                        columns: [
                            search.createColumn({ name: 'tranid' }),
                            search.createColumn({ name: 'internalid' })
                        ]
                    });

                    var seenIds = {};
                    pymtSearch.run().each(function(result) {
                        var tranid = result.getValue({ name: 'tranid' });
                        var id = result.getValue({ name: 'internalid' });
                        if (tranid && !seenIds[id]) {
                            seenIds[id] = true;
                            appliedList.push({ id: id, tranid: tranid, type: 'CustPymt' });
                        }
                        return true;
                    });

                    // Also search for credit memos applied to this invoice
                    var cmSearch = search.create({
                        type: search.Type.CREDIT_MEMO,
                        filters: [
                            ['appliedtotransaction', 'anyof', transactionId]
                        ],
                        columns: [
                            search.createColumn({ name: 'tranid' }),
                            search.createColumn({ name: 'internalid' })
                        ]
                    });

                    cmSearch.run().each(function(result) {
                        var tranid = result.getValue({ name: 'tranid' });
                        var id = result.getValue({ name: 'internalid' });
                        if (tranid && !seenIds[id]) {
                            seenIds[id] = true;
                            appliedList.push({ id: id, tranid: tranid, type: 'CustCred' });
                        }
                        return true;
                    });

                } else if (transactionType === 'CustCred' || transactionType === 'Credit Memo') {
                    // For credit memos, find invoices it was applied to using appliedtolinkamount
                    var cmSearch = search.create({
                        type: search.Type.CREDIT_MEMO,
                        filters: [
                            ['internalid', 'anyof', transactionId],
                            'AND',
                            ['applyingtransaction', 'noneof', '@NONE@']
                        ],
                        columns: [
                            search.createColumn({ name: 'tranid', join: 'applyingTransaction' }),
                            search.createColumn({ name: 'internalid', join: 'applyingTransaction' })
                        ]
                    });

                    var seenIds = {};
                    cmSearch.run().each(function(result) {
                        var tranid = result.getValue({ name: 'tranid', join: 'applyingTransaction' });
                        var id = result.getValue({ name: 'internalid', join: 'applyingTransaction' });
                        if (tranid && !seenIds[id]) {
                            seenIds[id] = true;
                            appliedList.push({ id: id, tranid: tranid, type: 'CustInvc' });
                        }
                        return true;
                    });
                }

                return appliedList;
            } catch (e) {
                log.debug({
                    title: 'Error getting applied transactions for ' + transactionId,
                    details: e.toString()
                });
                return [];
            }
        }

        /**
         * Formats applied transactions array into HTML links
         */
        function formatAppliedTransactionsHtml(appliedTransactions) {
            if (!appliedTransactions || appliedTransactions.length === 0) {
                return '';
            }

            var links = appliedTransactions.map(function(t) {
                var urlPath = '/app/accounting/transactions/custpymt.nl?id=' + t.id;
                if (t.type === 'CustCred') {
                    urlPath = '/app/accounting/transactions/custcred.nl?id=' + t.id;
                } else if (t.type === 'CustInvc') {
                    urlPath = '/app/accounting/transactions/custinvc.nl?id=' + t.id;
                }
                return '<a href="' + urlPath + '" target="_blank" style="color: #007bff;">' + t.tranid + '</a>';
            });

            return links.join(', ');
        }

        /**
         * Formats applied transactions array into plain text for CSV
         */
        function formatAppliedTransactionsText(appliedTransactions) {
            if (!appliedTransactions || appliedTransactions.length === 0) {
                return '';
            }

            return appliedTransactions.map(function(t) {
                return t.tranid;
            }).join(', ');
        }

        /**
         * Gets revenue transactions:
         * - R-prefix invoices with EXTERNAL revenue stream = Revenue (paying customers)
         * - CM-prefix credit memos with EXTERNAL revenue stream = Revenue Credits
         */
        function getRevenueTransactions(objectId, fromDate, toDate) {
            var revenue = { transactions: [], total: 0 };
            var credits = { transactions: [], total: 0 };

            // Query 1: R-prefix invoices (rental revenue) - ALL revenue streams (internal and external)
            // R-prefix = rental invoices, capture all rental revenue regardless of customer type
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var revenueSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = 'CustInvc'
                LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type = 'CustInvc'
                  AND t.tranid LIKE 'R%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var revenueResults = query.runSuiteQL({ query: revenueSql }).asMappedResults();

                log.debug({
                    title: 'Revenue Invoice Query',
                    details: 'Found ' + revenueResults.length + ' R-prefix invoices'
                });

                for (var i = 0; i < revenueResults.length; i++) {
                    var row = revenueResults[i];
                    var amount = Math.abs(parseFloat(row.amount) || 0);

                    revenue.transactions.push({
                        id: row.transaction_id,
                        number: row.transaction_number,
                        date: row.trandate,
                        type: 'Invoice',
                        status: row.status_display || '',
                        appliedTransactions: getAppliedTransactions(row.transaction_id, 'CustInvc'),
                        amount: amount,
                        customer: row.customer || '',
                        revenueStream: row.revenue_stream || '',
                        memo: row.memo || ''
                    });
                    revenue.total += amount;
                }
            } catch (e) {
                log.error({
                    title: 'Error in revenue invoice query',
                    details: e.toString()
                });
            }

            // Query 2: CM-prefix credit memos linked to R-invoices (reduces rental revenue)
            // Include all credit memos that reference the equipment, regardless of revenue stream
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var creditSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = 'CustCred'
                LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type = 'CustCred'
                  AND t.tranid LIKE 'CM%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var creditResults = query.runSuiteQL({ query: creditSql }).asMappedResults();

                log.debug({
                    title: 'Revenue Credit Query',
                    details: 'Found ' + creditResults.length + ' CM credit memos (non-internal)'
                });

                for (var j = 0; j < creditResults.length; j++) {
                    var creditRow = creditResults[j];
                    var creditAmount = Math.abs(parseFloat(creditRow.amount) || 0);

                    credits.transactions.push({
                        id: creditRow.transaction_id,
                        number: creditRow.transaction_number,
                        date: creditRow.trandate,
                        type: 'Credit Memo',
                        status: creditRow.status_display || '',
                        appliedTransactions: getAppliedTransactions(creditRow.transaction_id, 'CustCred'),
                        amount: creditAmount,
                        customer: creditRow.customer || '',
                        revenueStream: creditRow.revenue_stream || '',
                        memo: creditRow.memo || ''
                    });
                    credits.total += creditAmount;
                }
            } catch (e) {
                log.error({
                    title: 'Error in revenue credit query',
                    details: e.toString()
                });
            }

            return { revenue: revenue, credits: credits };
        }

        /**
         * Gets cost transactions:
         * - Non-R-prefix invoices with Internal revenue stream = Costs
         * - CM-prefix credit memos with Internal revenue stream = Cost Credits (reduces costs)
         *
         * NOTE: W invoices use custcol_sna_hul_fleet_no which stores the Object INTERNAL ID,
         * NOT the Fleet Code or Object Name. This is a data naming inconsistency in NetSuite.
         */
        function getCostTransactions(objectId, fromDate, toDate) {
            var costs = { transactions: [], total: 0, grossTotal: 0, byType: {}, credits: { transactions: [], total: 0 } };

            log.debug({
                title: 'getCostTransactions params',
                details: 'objectId: ' + objectId
            });

            // Query 1: Cost invoices (non-R prefix) with Internal revenue stream
            // W invoices link via custcol_sna_hul_fleet_no (which stores Object Internal ID)
            // Other invoices might link via custcol_sna_object (also Object Internal ID)
            // GROUP BY invoice to show one row per invoice with total amount
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var costSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    CASE
                        WHEN t.tranid LIKE 'W%' THEN 'Service'
                        WHEN t.tranid LIKE 'PS%' THEN 'Parts'
                        WHEN t.tranid LIKE 'T%' THEN 'Trucking'
                        ELSE 'Other'
                    END AS cost_type,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = t.type
                INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type IN ('CustInvc', 'CashSale')
                  AND (tl.custcol_sna_object = ${objectId} OR tl.custcol_sna_hul_fleet_no = ${objectId})
                  AND tl.mainline = 'F'
                  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
                  AND t.tranid NOT LIKE 'R%'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var costResults = query.runSuiteQL({ query: costSql }).asMappedResults();

                log.debug({
                    title: 'Cost Invoice Query',
                    details: 'Found ' + costResults.length + ' cost invoices'
                });

                for (var i = 0; i < costResults.length; i++) {
                    var row = costResults[i];
                    var amount = Math.abs(parseFloat(row.amount) || 0);
                    var costType = row.cost_type || 'Other';

                    costs.transactions.push({
                        id: row.transaction_id,
                        number: row.transaction_number,
                        date: row.trandate,
                        type: costType,
                        status: row.status_display || '',
                        appliedTransactions: getAppliedTransactions(row.transaction_id, 'CustInvc'),
                        amount: amount,
                        customer: row.customer || '',
                        revenueStream: row.revenue_stream || '',
                        memo: row.memo || ''
                    });

                    costs.total += amount;
                    costs.grossTotal += amount;  // Track gross before credits

                    // Track by type
                    if (!costs.byType[costType]) {
                        costs.byType[costType] = 0;
                    }
                    costs.byType[costType] += amount;
                }
            } catch (e) {
                log.error({
                    title: 'Error in cost invoice query',
                    details: e.toString()
                });
            }

            // Query 2: CM credit memos with Internal revenue stream (reduces costs - billing error corrections)
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var costCreditSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = 'CustCred'
                INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type = 'CustCred'
                  AND t.tranid LIKE 'CM%'
                  AND (tl.custcol_sna_object = ${objectId} OR tl.custcol_sna_hul_fleet_no = ${objectId})
                  AND tl.mainline = 'F'
                  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var costCreditResults = query.runSuiteQL({ query: costCreditSql }).asMappedResults();

                log.debug({
                    title: 'Cost Credit Query',
                    details: 'Found ' + costCreditResults.length + ' CM credit memos (internal - cost credits)'
                });

                for (var j = 0; j < costCreditResults.length; j++) {
                    var creditRow = costCreditResults[j];
                    var creditAmount = Math.abs(parseFloat(creditRow.amount) || 0);

                    costs.credits.transactions.push({
                        id: creditRow.transaction_id,
                        number: creditRow.transaction_number,
                        date: creditRow.trandate,
                        type: 'Cost Credit',
                        status: creditRow.status_display || '',
                        appliedTransactions: getAppliedTransactions(creditRow.transaction_id, 'CustCred'),
                        amount: creditAmount,
                        customer: creditRow.customer || '',
                        revenueStream: creditRow.revenue_stream || '',
                        memo: creditRow.memo || ''
                    });

                    costs.credits.total += creditAmount;
                }

                // Subtract cost credits from total costs (can go negative if credits exceed costs)
                costs.total = costs.total - costs.credits.total;

            } catch (e) {
                log.error({
                    title: 'Error in cost credit query',
                    details: e.toString()
                });
            }

            return costs;
        }

        /**
         * Calculates summary metrics
         */
        function calculateSummary(data) {
            var grossRevenue = data.revenue.total;
            var revenueCredits = data.credits.total;
            var netRevenue = grossRevenue - revenueCredits;

            var grossCosts = data.costs.grossTotal;  // Use tracked gross total
            var costCredits = data.costs.credits.total;
            var netCosts = data.costs.total;  // Already has credits subtracted (but not capped)

            var netProfit = netRevenue - netCosts;

            var roiPercent = null;
            if (netCosts > 0) {
                roiPercent = (netProfit / netCosts) * 100;
            }

            return {
                grossRevenue: grossRevenue,
                revenueCredits: revenueCredits,
                netRevenue: netRevenue,
                grossCosts: grossCosts,
                costCredits: costCredits,
                netCosts: netCosts,
                netProfit: netProfit,
                roiPercent: roiPercent,
                revenueCount: data.revenue.transactions.length,
                revenueCreditCount: data.credits.transactions.length,
                costCount: data.costs.transactions.length,
                costCreditCount: data.costs.credits.transactions.length,
                costsByType: data.costs.byType
            };
        }

        /**
         * Displays error message
         */
        function displayError(form, errorMessage) {
            var errorField = form.addField({
                id: 'custpage_error',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Error'
            });

            errorField.defaultValue =
                '<div style="padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; border-radius: 4px; margin: 20px 0;">' +
                '<strong>Error:</strong> ' + errorMessage +
                '</div>';
        }

        /**
         * Displays analysis results
         */
        function displayResults(form, results, params) {
            // Create a single HTML field for the entire results layout
            var resultsField = form.addField({
                id: 'custpage_results',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Results'
            });

            var html = '<div class="roi-results-container">';

            // Equipment header
            html += buildEquipmentHeader(results.equipment);

            // ROI Summary metrics
            html += buildROISummary(results.summary);

            // Export button
            html += buildExportButton(params);

            // Cost breakdown by type (if any costs)
            if (results.summary.grossCosts > 0) {
                html += buildCostBreakdown(results.summary.costsByType);
            }

            // Transaction tables in a grid
            html += '<div class="tables-grid">';
            html += buildTransactionTable('Revenue Transactions', results.revenue.transactions, 'revenue', results.revenue.total);
            html += buildTransactionTable('Cost Transactions', results.costs.transactions, 'cost', results.summary.grossCosts);
            html += '</div>';

            // Credit memo tables (if any)
            if (results.credits.transactions.length > 0 || (results.costs.credits && results.costs.credits.transactions.length > 0)) {
                html += '<div class="tables-grid">';
                if (results.credits.transactions.length > 0) {
                    html += buildTransactionTable('Revenue Credit Memos', results.credits.transactions, 'credit', results.credits.total);
                }
                if (results.costs.credits && results.costs.credits.transactions.length > 0) {
                    html += buildTransactionTable('Cost Credit Memos', results.costs.credits.transactions, 'costcredit', results.costs.credits.total);
                }
                html += '</div>';
            }

            html += '</div>';

            resultsField.defaultValue = html;
        }

        /**
         * Builds equipment header HTML
         */
        function buildEquipmentHeader(equipment) {
            var ageDisplay = equipment.age !== null ? equipment.age + ' years' : 'N/A';
            if (equipment.year) {
                ageDisplay += ' (Year: ' + equipment.year + ')';
            }

            // Format first rental invoice display
            var firstRentalDisplay = 'N/A';
            if (equipment.firstRentalInvoice) {
                var firstDate = formatDate(equipment.firstRentalInvoice.date);
                var firstNumber = equipment.firstRentalInvoice.number;
                firstRentalDisplay = firstDate + ' (' + firstNumber + ')';
            }

            var html = '<div class="equipment-header">';
            html += '<h3>' + (equipment.fleetCode || equipment.serial || 'Equipment') + '</h3>';
            html += '<div class="equipment-details">';
            html += '<div class="equipment-detail"><label>Fleet Code:</label>' + (equipment.fleetCode || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Serial:</label>' + (equipment.serial || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Manufacturer:</label>' + (equipment.manufacturer || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Model:</label>' + (equipment.model || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Category:</label>' + (equipment.category || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Location:</label>' + (equipment.location || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Equipment Age:</label>' + ageDisplay + '</div>';
            html += '<div class="equipment-detail"><label>First Rental Invoice:</label>' + firstRentalDisplay + '</div>';
            html += '</div>';
            html += '</div>';

            return html;
        }

        /**
         * Builds ROI summary metrics HTML
         */
        function buildROISummary(summary) {
            var html = '<div class="roi-metrics-row">';

            // Gross Revenue
            html += createMetricBox(
                formatCurrency(summary.grossRevenue),
                'Rental Revenue (' + summary.revenueCount + ')',
                CONFIG.COLORS.REVENUE
            );

            // Revenue Credits
            html += createMetricBox(
                '-' + formatCurrency(summary.revenueCredits),
                'Revenue Credits (' + summary.revenueCreditCount + ')',
                CONFIG.COLORS.CREDIT
            );

            // Net Revenue
            html += createMetricBox(
                formatCurrency(summary.netRevenue),
                'Net Revenue',
                CONFIG.COLORS.NET_REVENUE
            );

            // Gross Costs
            html += createMetricBox(
                formatCurrency(summary.grossCosts),
                'Gross Costs (' + summary.costCount + ')',
                CONFIG.COLORS.COST
            );

            // Cost Credits
            if (summary.costCreditCount > 0) {
                html += createMetricBox(
                    '-' + formatCurrency(summary.costCredits),
                    'Cost Credits (' + summary.costCreditCount + ')',
                    '#17a2b8'  // Teal for cost credits
                );
            }

            // Net Costs
            var netCostsColor = summary.netCosts < 0 ? '#17a2b8' : CONFIG.COLORS.COST;
            html += createMetricBox(
                formatCurrency(summary.netCosts),
                'Net Costs',
                netCostsColor
            );

            // Net Profit
            var profitColor = summary.netProfit >= 0 ? CONFIG.COLORS.PROFIT : CONFIG.COLORS.LOSS;
            html += createMetricBox(
                formatCurrency(summary.netProfit),
                'Net Profit/Loss',
                profitColor
            );

            // ROI Percentage
            var roiDisplay = 'N/A';
            var roiColor = CONFIG.COLORS.ROI_MEDIUM;
            if (summary.roiPercent !== null && isFinite(summary.roiPercent)) {
                roiDisplay = summary.roiPercent.toFixed(1) + '%';
                if (summary.roiPercent > 20) {
                    roiColor = CONFIG.COLORS.ROI_GOOD;
                } else if (summary.roiPercent < 0) {
                    roiColor = CONFIG.COLORS.ROI_BAD;
                }
            } else if (summary.netCosts <= 0 && summary.netRevenue > 0) {
                roiDisplay = 'Infinite';
                roiColor = CONFIG.COLORS.ROI_GOOD;
            }
            html += createMetricBox(roiDisplay, 'ROI', roiColor);

            html += '</div>';

            return html;
        }

        /**
         * Creates a metric box HTML
         */
        function createMetricBox(value, label, color) {
            return '<div class="roi-box" style="border-left-color: ' + color + ';">' +
                   '<div class="roi-number" style="color: ' + color + ';">' + value + '</div>' +
                   '<div class="roi-label">' + label + '</div>' +
                   '</div>';
        }

        /**
         * Builds cost breakdown by type HTML
         */
        function buildCostBreakdown(costsByType) {
            if (!costsByType || Object.keys(costsByType).length === 0) {
                return '';
            }

            // Calculate total of all cost types
            var totalCosts = 0;
            for (var type in costsByType) {
                totalCosts += costsByType[type];
            }

            var html = '<div class="cost-breakdown-container">';
            html += '<div class="section-header">';
            html += '<span class="section-header-title">Cost Breakdown by Type</span>';
            html += '<span class="section-header-total">' + formatCurrency(totalCosts) + '</span>';
            html += '</div>';
            html += '<div class="section-content">';
            html += '<div class="cost-breakdown-grid">';

            var colors = {
                'Service': '#17a2b8',
                'Parts': '#6f42c1',
                'Trucking': '#e83e8c',
                'Other': '#6c757d'
            };

            for (var type in costsByType) {
                var color = colors[type] || '#6c757d';
                html += createMetricBox(formatCurrency(costsByType[type]), type, color);
            }

            html += '</div></div></div>';

            return html;
        }

        /**
         * Builds CSV export button HTML
         */
        function buildExportButton(params) {
            var exportUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId,
                params: {
                    export: 'csv',
                    custpage_equipment: params.custpage_equipment || '',
                    custpage_date_from: params.custpage_date_from || '',
                    custpage_date_to: params.custpage_date_to || ''
                }
            });

            return '<div class="export-container">' +
                   '<a href="' + exportUrl + '" class="export-btn">Export to CSV</a>' +
                   '</div>';
        }

        /**
         * Builds a transaction table HTML
         */
        function buildTransactionTable(title, transactions, tableType, total) {
            if (!transactions || transactions.length === 0) {
                return '<div class="section-box">' +
                       '<div class="section-header">' +
                       '<span class="section-header-title">' + title + ' (0)</span>' +
                       '<span class="section-header-total">$0.00</span>' +
                       '</div>' +
                       '<div class="section-content"><p style="color: #666; margin: 0;">No transactions found.</p></div>' +
                       '</div>';
            }

            var html = '<div class="section-box">';
            html += '<div class="section-header">';
            html += '<span class="section-header-title">' + title + ' (' + transactions.length + ')</span>';
            html += '<span class="section-header-total">' + formatCurrency(total || 0) + '</span>';
            html += '</div>';
            html += '<div class="section-content">';
            html += '<table class="transaction-table" style="table-layout: fixed; min-width: 1200px; width: 100%;">';
            html += '<colgroup>';
            html += '<col style="width: 85px;">';   // Date
            html += '<col style="width: 100px;">';  // Transaction #
            html += '<col style="width: 70px;">';   // Type
            html += '<col style="width: 100px;">';  // Status
            html += '<col style="width: 120px;">';  // Applied To
            html += '<col style="width: 110px;">';  // Amount
            html += '<col style="width: 180px;">';  // Customer
            html += '<col style="width: 320px;">';  // Revenue Stream
            html += '<col style="width: 115px;">';  // Memo
            html += '</colgroup>';
            html += '<thead><tr>';
            html += '<th>Date</th>';
            html += '<th>Transaction #</th>';
            html += '<th>Type</th>';
            html += '<th>Status</th>';
            html += '<th>Applied To</th>';
            html += '<th style="text-align: right;">Amount</th>';
            html += '<th>Customer</th>';
            html += '<th>Revenue Stream</th>';
            html += '<th>Memo</th>';
            html += '</tr></thead>';
            html += '<tbody>';

            for (var i = 0; i < transactions.length; i++) {
                var t = transactions[i];

                // Determine the URL based on transaction type
                var tranUrl = '/app/accounting/transactions/custinvc.nl?id=' + t.id;
                if (tableType === 'credit' || tableType === 'costcredit') {
                    tranUrl = '/app/accounting/transactions/custcred.nl?id=' + t.id;
                }

                var appliedHtml = formatAppliedTransactionsHtml(t.appliedTransactions);
                var appliedText = formatAppliedTransactionsText(t.appliedTransactions);

                html += '<tr>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + formatDate(t.date) + '</td>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a href="' + tranUrl + '" target="_blank" style="color: #007bff;">' + t.number + '</a></td>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (t.type || '') + '</td>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (t.status || '') + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + appliedText.replace(/"/g, '&quot;') + '">' + appliedHtml + '</td>';
                html += '<td class="amount-col" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + formatCurrency(t.amount) + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + (t.customer || '').replace(/"/g, '&quot;') + '">' + (t.customer || '') + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + (t.revenueStream || '').replace(/"/g, '&quot;') + '">' + (t.revenueStream || '') + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + (t.memo || '').replace(/"/g, '&quot;') + '">' + (t.memo || '') + '</td>';
                html += '</tr>';
            }

            html += '</tbody></table>';
            html += '</div></div>';

            return html;
        }

        /**
         * Exports results to CSV
         */
        function exportToCSV(context) {
            try {
                var params = context.request.parameters;
                var results = analyzeEquipmentROI(params);

                if (results.error) {
                    context.response.write('Error: ' + results.error);
                    return;
                }

                var csvContent = generateCSV(results, params);

                var csvFile = file.create({
                    name: 'roi_analysis_' + (results.equipment.fleetCode || 'equipment') + '_' +
                          format.format({ value: new Date(), type: format.Type.DATE }).replace(/\//g, '-') + '.csv',
                    fileType: file.Type.CSV,
                    contents: csvContent
                });

                context.response.writeFile({
                    file: csvFile,
                    isInline: false
                });

            } catch (e) {
                log.error({
                    title: 'Error in exportToCSV',
                    details: e.toString()
                });
                context.response.write('An error occurred during export: ' + e.toString());
            }
        }

        /**
         * Generates CSV content from results
         */
        function generateCSV(results, params) {
            var csvLines = [];

            // Summary header
            csvLines.push('ROI Analysis Report');
            csvLines.push('Equipment,' + (results.equipment.fleetCode || results.equipment.serial));
            csvLines.push('Date Range,' + params.custpage_date_from + ' to ' + params.custpage_date_to);
            csvLines.push('');

            // Summary metrics
            csvLines.push('Summary Metrics');
            csvLines.push('Gross Revenue,' + results.summary.grossRevenue.toFixed(2));
            csvLines.push('Revenue Credits,' + results.summary.revenueCredits.toFixed(2));
            csvLines.push('Net Revenue,' + results.summary.netRevenue.toFixed(2));
            csvLines.push('Gross Costs,' + results.summary.grossCosts.toFixed(2));
            csvLines.push('Cost Credits,' + results.summary.costCredits.toFixed(2));
            csvLines.push('Net Costs,' + results.summary.netCosts.toFixed(2));
            csvLines.push('Net Profit,' + results.summary.netProfit.toFixed(2));
            csvLines.push('ROI %,' + (results.summary.roiPercent !== null ? results.summary.roiPercent.toFixed(2) : 'N/A'));
            csvLines.push('');

            // Revenue transactions
            csvLines.push('Revenue Transactions');
            csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Customer,Memo');
            for (var i = 0; i < results.revenue.transactions.length; i++) {
                var r = results.revenue.transactions[i];
                csvLines.push([
                    formatDate(r.date),
                    '"' + r.number + '"',
                    '"Revenue"',
                    '"' + (r.status || '').replace(/"/g, '""') + '"',
                    '"' + formatAppliedTransactionsText(r.appliedTransactions).replace(/"/g, '""') + '"',
                    r.amount.toFixed(2),
                    '"' + (r.customer || '').replace(/"/g, '""') + '"',
                    '"' + (r.memo || '').replace(/"/g, '""') + '"'
                ].join(','));
            }
            csvLines.push('');

            // Revenue credit transactions
            csvLines.push('Revenue Credit Memo Transactions');
            csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Customer,Memo');
            for (var j = 0; j < results.credits.transactions.length; j++) {
                var c = results.credits.transactions[j];
                csvLines.push([
                    formatDate(c.date),
                    '"' + c.number + '"',
                    '"Revenue Credit"',
                    '"' + (c.status || '').replace(/"/g, '""') + '"',
                    '"' + formatAppliedTransactionsText(c.appliedTransactions).replace(/"/g, '""') + '"',
                    c.amount.toFixed(2),
                    '"' + (c.customer || '').replace(/"/g, '""') + '"',
                    '"' + (c.memo || '').replace(/"/g, '""') + '"'
                ].join(','));
            }
            csvLines.push('');

            // Cost transactions
            csvLines.push('Cost Transactions');
            csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Revenue Stream,Memo');
            for (var k = 0; k < results.costs.transactions.length; k++) {
                var t = results.costs.transactions[k];
                csvLines.push([
                    formatDate(t.date),
                    '"' + t.number + '"',
                    '"' + (t.type || '') + '"',
                    '"' + (t.status || '').replace(/"/g, '""') + '"',
                    '"' + formatAppliedTransactionsText(t.appliedTransactions).replace(/"/g, '""') + '"',
                    t.amount.toFixed(2),
                    '"' + (t.revenueStream || '').replace(/"/g, '""') + '"',
                    '"' + (t.memo || '').replace(/"/g, '""') + '"'
                ].join(','));
            }
            csvLines.push('');

            // Cost credit transactions
            if (results.costs.credits && results.costs.credits.transactions.length > 0) {
                csvLines.push('Cost Credit Memo Transactions');
                csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Revenue Stream,Memo');
                for (var m = 0; m < results.costs.credits.transactions.length; m++) {
                    var cc = results.costs.credits.transactions[m];
                    csvLines.push([
                        formatDate(cc.date),
                        '"' + cc.number + '"',
                        '"Cost Credit"',
                        '"' + (cc.status || '').replace(/"/g, '""') + '"',
                        '"' + formatAppliedTransactionsText(cc.appliedTransactions).replace(/"/g, '""') + '"',
                        cc.amount.toFixed(2),
                        '"' + (cc.revenueStream || '').replace(/"/g, '""') + '"',
                        '"' + (cc.memo || '').replace(/"/g, '""') + '"'
                    ].join(','));
                }
            }

            return csvLines.join('\n');
        }

        /**
         * Formats a number as currency
         */
        function formatCurrency(value) {
            if (value === null || value === undefined) return '$0.00';
            var num = parseFloat(value);
            var isNegative = num < 0;
            var absValue = Math.abs(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return (isNegative ? '-$' : '$') + absValue;
        }

        /**
         * Formats a date for display
         */
        function formatDate(dateValue) {
            if (!dateValue) return '';
            try {
                var date = new Date(dateValue);
                return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            } catch (e) {
                return String(dateValue);
            }
        }

        /**
         * Truncates text to specified length
         */
        function truncateText(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }

        return {
            onRequest: onRequest
        };
    }
);

        function handlePost(context) {
            handleGet(context);
        }

        /**
         * Adds header HTML with description
         */
        function addHeaderHtml(form) {
            var headerField = form.addField({
                id: 'custpage_header_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Header'
            });

            headerField.defaultValue =
                '<style>' +
                '/* Force results to full width below form */' +
                '#custpage_results_fs_lbl { display: none !important; }' +
                '#custpage_results_fs { width: 100% !important; clear: both !important; float: none !important; }' +
                '#custpage_results_val { width: 100% !important; }' +
                '' +
                '/* Main Layout */' +
                '.roi-results-container { max-width: 100%; margin: 20px 0 0 0; clear: both; }' +
                '.roi-main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 20px; }' +
                '' +
                '/* Metrics Row */' +
                '.roi-metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 20px 0; }' +
                '.roi-box { padding: 15px 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; border-left: 5px solid; }' +
                '.roi-number { font-size: 20px; font-weight: bold; white-space: nowrap; }' +
                '.roi-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 5px; }' +
                '' +
                '/* Info Box */' +
                '.info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0; border-radius: 4px; }' +
                '' +
                '/* Equipment Header */' +
                '.equipment-header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }' +
                '.equipment-header h3 { margin: 0 0 15px 0; color: #333; font-size: 18px; }' +
                '.equipment-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }' +
                '.equipment-detail { font-size: 13px; }' +
                '.equipment-detail label { font-weight: bold; color: #666; margin-right: 5px; }' +
                '' +
                '/* Tables */' +
                '.tables-grid { display: block; margin-top: 20px; }' +
                '.transaction-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto; }' +
                '.transaction-table th { background: #f1f3f4; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; border-bottom: 2px solid #ddd; }' +
                '.transaction-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }' +
                '.transaction-table tr:hover { background: #f8f9fa; }' +
                '.transaction-table .amount-col { text-align: right; white-space: nowrap; }' +
                '' +
                '/* Section Headers */' +
                '.section-header { background: #667eea; color: white; padding: 10px 15px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }' +
                '.section-header-title { }' +
                '.section-header-total { font-size: 14px; font-weight: bold; }' +
                '.section-content { border: 1px solid #ddd; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; background: white; overflow-x: auto; }' +
                '.section-box { margin-bottom: 20px; }' +
                '' +
                '/* Cost Breakdown */' +
                '.cost-breakdown-container { margin: 15px 0; }' +
                '.cost-breakdown-grid { display: flex; flex-wrap: wrap; gap: 10px; }' +
                '' +
                '/* Export Button */' +
                '.export-container { margin: 15px 0; }' +
                '.export-btn { display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 13px; }' +
                '.export-btn:hover { background: #218838; }' +
                '</style>' +
                '<div class="info-box">' +
                '<strong>Purpose:</strong> Calculate ROI for rental fleet equipment by comparing rental revenue against internal costs. ' +
                'Enter a fleet code or serial number and date range to analyze equipment profitability.' +
                '</div>';
        }

        /**
         * Adds filter fields to the form
         */
        function addFilterFields(form, params) {
            var filterGroup = form.addFieldGroup({
                id: 'custpage_filters',
                label: 'Analysis Parameters'
            });

            // Equipment search field
            var equipmentField = form.addField({
                id: 'custpage_equipment',
                type: serverWidget.FieldType.TEXT,
                label: 'Equipment (Fleet Code or Serial Number)',
                container: 'custpage_filters'
            });
            equipmentField.isMandatory = true;
            if (params.custpage_equipment) {
                equipmentField.defaultValue = params.custpage_equipment;
            }

            // From date
            var fromDateField = form.addField({
                id: 'custpage_date_from',
                type: serverWidget.FieldType.DATE,
                label: 'From Date',
                container: 'custpage_filters'
            });
            fromDateField.isMandatory = true;
            if (params.custpage_date_from) {
                fromDateField.defaultValue = params.custpage_date_from;
            }

            // To date
            var toDateField = form.addField({
                id: 'custpage_date_to',
                type: serverWidget.FieldType.DATE,
                label: 'To Date',
                container: 'custpage_filters'
            });
            toDateField.isMandatory = true;
            if (params.custpage_date_to) {
                toDateField.defaultValue = params.custpage_date_to;
            }
        }

        /**
         * Main analysis function - calculates ROI for equipment
         */
        function analyzeEquipmentROI(params) {
            var result = {
                equipment: null,
                revenue: { transactions: [], total: 0 },
                credits: { transactions: [], total: 0 },
                costs: { transactions: [], total: 0, byType: {} },
                summary: {}
            };

            try {
                // Step 1: Find equipment
                var equipment = findEquipment(params.custpage_equipment);
                if (!equipment) {
                    return { error: 'Equipment not found with fleet code or serial: ' + params.custpage_equipment };
                }
                result.equipment = equipment;

                log.audit({
                    title: 'Equipment Found',
                    details: 'Object ID: ' + equipment.objectId + ', Fleet Code: ' + equipment.fleetCode
                });

                // Step 1b: Get first rental invoice date (independent of date filters)
                var firstRental = getFirstRentalInvoice(equipment.objectId);
                equipment.firstRentalInvoice = firstRental;

                // Step 2: Get revenue transactions (R-prefix invoices, Internal only)
                var revenueData = getRevenueTransactions(equipment.objectId, params.custpage_date_from, params.custpage_date_to);
                result.revenue = revenueData.revenue;
                result.credits = revenueData.credits;

                // Step 3: Get cost transactions (all Internal, exclude R-prefix)
                // Note: custcol_sna_hul_fleet_no stores Object Internal ID, so we use objectId for matching
                result.costs = getCostTransactions(equipment.objectId, params.custpage_date_from, params.custpage_date_to);

                // Step 4: Calculate summary metrics
                result.summary = calculateSummary(result);

            } catch (e) {
                log.error({
                    title: 'Error in analyzeEquipmentROI',
                    details: e.toString() + '\n' + (e.stack || '')
                });
                return { error: 'Analysis error: ' + e.toString() };
            }

            return result;
        }

        /**
         * Finds equipment by fleet code or serial number
         */
        function findEquipment(searchText) {
            if (!searchText) return null;

            searchText = searchText.trim().toUpperCase();

            var sql = `
                SELECT
                    a.id AS asset_id,
                    a.custrecord_sna_hul_fleetcode AS fleet_code,
                    a.custrecord_nx_asset_serial AS serial,
                    o.id AS object_id,
                    o.name AS object_name,
                    o.custrecord_sna_year AS year,
                    BUILTIN.DF(a.cseg_hul_mfg) AS manufacturer,
                    BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
                    BUILTIN.DF(a.cseg_sna_hul_eq_seg) AS category,
                    BUILTIN.DF(o.custrecord_sna_responsibility_center) AS location
                FROM customrecord_nx_asset a
                INNER JOIN customrecord_sna_objects o ON a.custrecord_sna_hul_nxcassetobject = o.id
                WHERE (UPPER(a.custrecord_sna_hul_fleetcode) = '${searchText}'
                       OR UPPER(a.custrecord_nx_asset_serial) = '${searchText}')
                  AND a.isinactive = 'F'
            `;

            try {
                var queryResults = query.runSuiteQL({ query: sql });
                var results = queryResults.asMappedResults();

                if (results.length > 0) {
                    var row = results[0];
                    var currentYear = new Date().getFullYear();
                    var equipmentYear = row.year ? parseInt(row.year, 10) : null;
                    var age = equipmentYear ? (currentYear - equipmentYear) : null;

                    return {
                        assetId: row.asset_id,
                        objectId: row.object_id,
                        fleetCode: row.fleet_code || '',
                        serial: row.serial || '',
                        objectName: row.object_name || '',
                        year: row.year,
                        age: age,
                        manufacturer: row.manufacturer || '',
                        model: row.model || '',
                        category: row.category || '',
                        location: row.location || ''
                    };
                }
            } catch (e) {
                log.error({
                    title: 'Error in findEquipment',
                    details: e.toString()
                });
            }

            return null;
        }

        /**
         * Finds the first rental invoice date for the equipment (regardless of date filters)
         * This helps users know the full history range of the equipment
         */
        function getFirstRentalInvoice(objectId) {
            var sql = `
                SELECT
                    t.tranid AS transaction_number,
                    t.trandate
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                WHERE t.type = 'CustInvc'
                  AND t.tranid LIKE 'R%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                ORDER BY t.trandate ASC
                FETCH FIRST 1 ROWS ONLY
            `;

            try {
                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                if (results.length > 0) {
                    return {
                        number: results[0].transaction_number,
                        date: results[0].trandate
                    };
                }
            } catch (e) {
                log.error({
                    title: 'Error in getFirstRentalInvoice',
                    details: e.toString()
                });
            }

            return null;
        }

        /**
         * Gets the applied transactions (payments/credits) for an invoice
         * or the invoices a credit memo was applied to
         * Returns array of objects with id, tranid, and type for building links
         */
        function getAppliedTransactions(transactionId, transactionType) {
            try {
                var appliedList = [];

                if (transactionType === 'CustInvc' || transactionType === 'Invoice') {
                    // For invoices, search for customer payments that have this invoice in their apply list
                    var pymtSearch = search.create({
                        type: search.Type.CUSTOMER_PAYMENT,
                        filters: [
                            ['appliedtotransaction', 'anyof', transactionId]
                        ],
                        columns: [
                            search.createColumn({ name: 'tranid' }),
                            search.createColumn({ name: 'internalid' })
                        ]
                    });

                    var seenIds = {};
                    pymtSearch.run().each(function(result) {
                        var tranid = result.getValue({ name: 'tranid' });
                        var id = result.getValue({ name: 'internalid' });
                        if (tranid && !seenIds[id]) {
                            seenIds[id] = true;
                            appliedList.push({ id: id, tranid: tranid, type: 'CustPymt' });
                        }
                        return true;
                    });

                    // Also search for credit memos applied to this invoice
                    var cmSearch = search.create({
                        type: search.Type.CREDIT_MEMO,
                        filters: [
                            ['appliedtotransaction', 'anyof', transactionId]
                        ],
                        columns: [
                            search.createColumn({ name: 'tranid' }),
                            search.createColumn({ name: 'internalid' })
                        ]
                    });

                    cmSearch.run().each(function(result) {
                        var tranid = result.getValue({ name: 'tranid' });
                        var id = result.getValue({ name: 'internalid' });
                        if (tranid && !seenIds[id]) {
                            seenIds[id] = true;
                            appliedList.push({ id: id, tranid: tranid, type: 'CustCred' });
                        }
                        return true;
                    });

                } else if (transactionType === 'CustCred' || transactionType === 'Credit Memo') {
                    // For credit memos, find invoices it was applied to using appliedtolinkamount
                    var cmSearch = search.create({
                        type: search.Type.CREDIT_MEMO,
                        filters: [
                            ['internalid', 'anyof', transactionId],
                            'AND',
                            ['applyingtransaction', 'noneof', '@NONE@']
                        ],
                        columns: [
                            search.createColumn({ name: 'tranid', join: 'applyingTransaction' }),
                            search.createColumn({ name: 'internalid', join: 'applyingTransaction' })
                        ]
                    });

                    var seenIds = {};
                    cmSearch.run().each(function(result) {
                        var tranid = result.getValue({ name: 'tranid', join: 'applyingTransaction' });
                        var id = result.getValue({ name: 'internalid', join: 'applyingTransaction' });
                        if (tranid && !seenIds[id]) {
                            seenIds[id] = true;
                            appliedList.push({ id: id, tranid: tranid, type: 'CustInvc' });
                        }
                        return true;
                    });
                }

                return appliedList;
            } catch (e) {
                log.debug({
                    title: 'Error getting applied transactions for ' + transactionId,
                    details: e.toString()
                });
                return [];
            }
        }

        /**
         * Formats applied transactions array into HTML links
         */
        function formatAppliedTransactionsHtml(appliedTransactions) {
            if (!appliedTransactions || appliedTransactions.length === 0) {
                return '';
            }

            var links = appliedTransactions.map(function(t) {
                var urlPath = '/app/accounting/transactions/custpymt.nl?id=' + t.id;
                if (t.type === 'CustCred') {
                    urlPath = '/app/accounting/transactions/custcred.nl?id=' + t.id;
                } else if (t.type === 'CustInvc') {
                    urlPath = '/app/accounting/transactions/custinvc.nl?id=' + t.id;
                }
                return '<a href="' + urlPath + '" target="_blank" style="color: #007bff;">' + t.tranid + '</a>';
            });

            return links.join(', ');
        }

        /**
         * Formats applied transactions array into plain text for CSV
         */
        function formatAppliedTransactionsText(appliedTransactions) {
            if (!appliedTransactions || appliedTransactions.length === 0) {
                return '';
            }

            return appliedTransactions.map(function(t) {
                return t.tranid;
            }).join(', ');
        }

        /**
         * Gets revenue transactions:
         * - R-prefix invoices with EXTERNAL revenue stream = Revenue (paying customers)
         * - CM-prefix credit memos with EXTERNAL revenue stream = Revenue Credits
         */
        function getRevenueTransactions(objectId, fromDate, toDate) {
            var revenue = { transactions: [], total: 0 };
            var credits = { transactions: [], total: 0 };

            // Query 1: R-prefix invoices (rental revenue) - ALL revenue streams (internal and external)
            // R-prefix = rental invoices, capture all rental revenue regardless of customer type
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var revenueSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = 'CustInvc'
                LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type = 'CustInvc'
                  AND t.tranid LIKE 'R%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var revenueResults = query.runSuiteQL({ query: revenueSql }).asMappedResults();

                log.debug({
                    title: 'Revenue Invoice Query',
                    details: 'Found ' + revenueResults.length + ' R-prefix invoices'
                });

                for (var i = 0; i < revenueResults.length; i++) {
                    var row = revenueResults[i];
                    var amount = Math.abs(parseFloat(row.amount) || 0);

                    revenue.transactions.push({
                        id: row.transaction_id,
                        number: row.transaction_number,
                        date: row.trandate,
                        type: 'Invoice',
                        status: row.status_display || '',
                        appliedTransactions: getAppliedTransactions(row.transaction_id, 'CustInvc'),
                        amount: amount,
                        customer: row.customer || '',
                        revenueStream: row.revenue_stream || '',
                        memo: row.memo || ''
                    });
                    revenue.total += amount;
                }
            } catch (e) {
                log.error({
                    title: 'Error in revenue invoice query',
                    details: e.toString()
                });
            }

            // Query 2: CM-prefix credit memos linked to R-invoices (reduces rental revenue)
            // Include all credit memos that reference the equipment, regardless of revenue stream
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var creditSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = 'CustCred'
                LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type = 'CustCred'
                  AND t.tranid LIKE 'CM%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var creditResults = query.runSuiteQL({ query: creditSql }).asMappedResults();

                log.debug({
                    title: 'Revenue Credit Query',
                    details: 'Found ' + creditResults.length + ' CM credit memos (non-internal)'
                });

                for (var j = 0; j < creditResults.length; j++) {
                    var creditRow = creditResults[j];
                    var creditAmount = Math.abs(parseFloat(creditRow.amount) || 0);

                    credits.transactions.push({
                        id: creditRow.transaction_id,
                        number: creditRow.transaction_number,
                        date: creditRow.trandate,
                        type: 'Credit Memo',
                        status: creditRow.status_display || '',
                        appliedTransactions: getAppliedTransactions(creditRow.transaction_id, 'CustCred'),
                        amount: creditAmount,
                        customer: creditRow.customer || '',
                        revenueStream: creditRow.revenue_stream || '',
                        memo: creditRow.memo || ''
                    });
                    credits.total += creditAmount;
                }
            } catch (e) {
                log.error({
                    title: 'Error in revenue credit query',
                    details: e.toString()
                });
            }

            return { revenue: revenue, credits: credits };
        }

        /**
         * Gets cost transactions:
         * - Non-R-prefix invoices with Internal revenue stream = Costs
         * - CM-prefix credit memos with Internal revenue stream = Cost Credits (reduces costs)
         *
         * NOTE: W invoices use custcol_sna_hul_fleet_no which stores the Object INTERNAL ID,
         * NOT the Fleet Code or Object Name. This is a data naming inconsistency in NetSuite.
         */
        function getCostTransactions(objectId, fromDate, toDate) {
            var costs = { transactions: [], total: 0, grossTotal: 0, byType: {}, credits: { transactions: [], total: 0 } };

            log.debug({
                title: 'getCostTransactions params',
                details: 'objectId: ' + objectId
            });

            // Query 1: Cost invoices (non-R prefix) with Internal revenue stream
            // W invoices link via custcol_sna_hul_fleet_no (which stores Object Internal ID)
            // Other invoices might link via custcol_sna_object (also Object Internal ID)
            // GROUP BY invoice to show one row per invoice with total amount
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var costSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    CASE
                        WHEN t.tranid LIKE 'W%' THEN 'Service'
                        WHEN t.tranid LIKE 'PS%' THEN 'Parts'
                        WHEN t.tranid LIKE 'T%' THEN 'Trucking'
                        ELSE 'Other'
                    END AS cost_type,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = t.type
                INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type IN ('CustInvc', 'CashSale')
                  AND (tl.custcol_sna_object = ${objectId} OR tl.custcol_sna_hul_fleet_no = ${objectId})
                  AND tl.mainline = 'F'
                  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
                  AND t.tranid NOT LIKE 'R%'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var costResults = query.runSuiteQL({ query: costSql }).asMappedResults();

                log.debug({
                    title: 'Cost Invoice Query',
                    details: 'Found ' + costResults.length + ' cost invoices'
                });

                for (var i = 0; i < costResults.length; i++) {
                    var row = costResults[i];
                    var amount = Math.abs(parseFloat(row.amount) || 0);
                    var costType = row.cost_type || 'Other';

                    costs.transactions.push({
                        id: row.transaction_id,
                        number: row.transaction_number,
                        date: row.trandate,
                        type: costType,
                        status: row.status_display || '',
                        appliedTransactions: getAppliedTransactions(row.transaction_id, 'CustInvc'),
                        amount: amount,
                        customer: row.customer || '',
                        revenueStream: row.revenue_stream || '',
                        memo: row.memo || ''
                    });

                    costs.total += amount;
                    costs.grossTotal += amount;  // Track gross before credits

                    // Track by type
                    if (!costs.byType[costType]) {
                        costs.byType[costType] = 0;
                    }
                    costs.byType[costType] += amount;
                }
            } catch (e) {
                log.error({
                    title: 'Error in cost invoice query',
                    details: e.toString()
                });
            }

            // Query 2: CM credit memos with Internal revenue stream (reduces costs - billing error corrections)
            // Use self-joins to build full revenue stream path (up to 5 levels deep)
            var costCreditSql = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS transaction_number,
                    t.trandate,
                    t.type,
                    ts.name AS status_display,
                    SUM(tl.netamount) AS amount,
                    MAX(BUILTIN.DF(t.entity)) AS customer,
                    MAX(
                        CASE
                            WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
                            WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
                            ELSE rs.name
                        END
                    ) AS revenue_stream,
                    t.memo,
                    '' AS applied_transactions
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = 'CustCred'
                INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id
                WHERE t.type = 'CustCred'
                  AND t.tranid LIKE 'CM%'
                  AND (tl.custcol_sna_object = ${objectId} OR tl.custcol_sna_hul_fleet_no = ${objectId})
                  AND tl.mainline = 'F'
                  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                GROUP BY t.id, t.tranid, t.trandate, t.type, ts.name, t.memo
                ORDER BY t.trandate DESC
            `;

            try {
                var costCreditResults = query.runSuiteQL({ query: costCreditSql }).asMappedResults();

                log.debug({
                    title: 'Cost Credit Query',
                    details: 'Found ' + costCreditResults.length + ' CM credit memos (internal - cost credits)'
                });

                for (var j = 0; j < costCreditResults.length; j++) {
                    var creditRow = costCreditResults[j];
                    var creditAmount = Math.abs(parseFloat(creditRow.amount) || 0);

                    costs.credits.transactions.push({
                        id: creditRow.transaction_id,
                        number: creditRow.transaction_number,
                        date: creditRow.trandate,
                        type: 'Cost Credit',
                        status: creditRow.status_display || '',
                        appliedTransactions: getAppliedTransactions(creditRow.transaction_id, 'CustCred'),
                        amount: creditAmount,
                        customer: creditRow.customer || '',
                        revenueStream: creditRow.revenue_stream || '',
                        memo: creditRow.memo || ''
                    });

                    costs.credits.total += creditAmount;
                }

                // Subtract cost credits from total costs (can go negative if credits exceed costs)
                costs.total = costs.total - costs.credits.total;

            } catch (e) {
                log.error({
                    title: 'Error in cost credit query',
                    details: e.toString()
                });
            }

            return costs;
        }

        /**
         * Calculates summary metrics
         */
        function calculateSummary(data) {
            var grossRevenue = data.revenue.total;
            var revenueCredits = data.credits.total;
            var netRevenue = grossRevenue - revenueCredits;

            var grossCosts = data.costs.grossTotal;  // Use tracked gross total
            var costCredits = data.costs.credits.total;
            var netCosts = data.costs.total;  // Already has credits subtracted (but not capped)

            var netProfit = netRevenue - netCosts;

            var roiPercent = null;
            if (netCosts > 0) {
                roiPercent = (netProfit / netCosts) * 100;
            }

            return {
                grossRevenue: grossRevenue,
                revenueCredits: revenueCredits,
                netRevenue: netRevenue,
                grossCosts: grossCosts,
                costCredits: costCredits,
                netCosts: netCosts,
                netProfit: netProfit,
                roiPercent: roiPercent,
                revenueCount: data.revenue.transactions.length,
                revenueCreditCount: data.credits.transactions.length,
                costCount: data.costs.transactions.length,
                costCreditCount: data.costs.credits.transactions.length,
                costsByType: data.costs.byType
            };
        }

        /**
         * Displays error message
         */
        function displayError(form, errorMessage) {
            var errorField = form.addField({
                id: 'custpage_error',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Error'
            });

            errorField.defaultValue =
                '<div style="padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; border-radius: 4px; margin: 20px 0;">' +
                '<strong>Error:</strong> ' + errorMessage +
                '</div>';
        }

        /**
         * Displays analysis results
         */
        function displayResults(form, results, params) {
            // Create a single HTML field for the entire results layout
            var resultsField = form.addField({
                id: 'custpage_results',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Results'
            });

            var html = '<div class="roi-results-container">';

            // Equipment header
            html += buildEquipmentHeader(results.equipment);

            // ROI Summary metrics
            html += buildROISummary(results.summary);

            // Export button
            html += buildExportButton(params);

            // Cost breakdown by type (if any costs)
            if (results.summary.grossCosts > 0) {
                html += buildCostBreakdown(results.summary.costsByType);
            }

            // Transaction tables in a grid
            html += '<div class="tables-grid">';
            html += buildTransactionTable('Revenue Transactions', results.revenue.transactions, 'revenue', results.revenue.total);
            html += buildTransactionTable('Cost Transactions', results.costs.transactions, 'cost', results.summary.grossCosts);
            html += '</div>';

            // Credit memo tables (if any)
            if (results.credits.transactions.length > 0 || (results.costs.credits && results.costs.credits.transactions.length > 0)) {
                html += '<div class="tables-grid">';
                if (results.credits.transactions.length > 0) {
                    html += buildTransactionTable('Revenue Credit Memos', results.credits.transactions, 'credit', results.credits.total);
                }
                if (results.costs.credits && results.costs.credits.transactions.length > 0) {
                    html += buildTransactionTable('Cost Credit Memos', results.costs.credits.transactions, 'costcredit', results.costs.credits.total);
                }
                html += '</div>';
            }

            html += '</div>';

            resultsField.defaultValue = html;
        }

        /**
         * Builds equipment header HTML
         */
        function buildEquipmentHeader(equipment) {
            var ageDisplay = equipment.age !== null ? equipment.age + ' years' : 'N/A';
            if (equipment.year) {
                ageDisplay += ' (Year: ' + equipment.year + ')';
            }

            // Format first rental invoice display
            var firstRentalDisplay = 'N/A';
            if (equipment.firstRentalInvoice) {
                var firstDate = formatDate(equipment.firstRentalInvoice.date);
                var firstNumber = equipment.firstRentalInvoice.number;
                firstRentalDisplay = firstDate + ' (' + firstNumber + ')';
            }

            var html = '<div class="equipment-header">';
            html += '<h3>' + (equipment.fleetCode || equipment.serial || 'Equipment') + '</h3>';
            html += '<div class="equipment-details">';
            html += '<div class="equipment-detail"><label>Fleet Code:</label>' + (equipment.fleetCode || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Serial:</label>' + (equipment.serial || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Manufacturer:</label>' + (equipment.manufacturer || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Model:</label>' + (equipment.model || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Category:</label>' + (equipment.category || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Location:</label>' + (equipment.location || 'N/A') + '</div>';
            html += '<div class="equipment-detail"><label>Equipment Age:</label>' + ageDisplay + '</div>';
            html += '<div class="equipment-detail"><label>First Rental Invoice:</label>' + firstRentalDisplay + '</div>';
            html += '</div>';
            html += '</div>';

            return html;
        }

        /**
         * Builds ROI summary metrics HTML
         */
        function buildROISummary(summary) {
            var html = '<div class="roi-metrics-row">';

            // Gross Revenue
            html += createMetricBox(
                formatCurrency(summary.grossRevenue),
                'Rental Revenue (' + summary.revenueCount + ')',
                CONFIG.COLORS.REVENUE
            );

            // Revenue Credits
            html += createMetricBox(
                '-' + formatCurrency(summary.revenueCredits),
                'Revenue Credits (' + summary.revenueCreditCount + ')',
                CONFIG.COLORS.CREDIT
            );

            // Net Revenue
            html += createMetricBox(
                formatCurrency(summary.netRevenue),
                'Net Revenue',
                CONFIG.COLORS.NET_REVENUE
            );

            // Gross Costs
            html += createMetricBox(
                formatCurrency(summary.grossCosts),
                'Gross Costs (' + summary.costCount + ')',
                CONFIG.COLORS.COST
            );

            // Cost Credits
            if (summary.costCreditCount > 0) {
                html += createMetricBox(
                    '-' + formatCurrency(summary.costCredits),
                    'Cost Credits (' + summary.costCreditCount + ')',
                    '#17a2b8'  // Teal for cost credits
                );
            }

            // Net Costs
            var netCostsColor = summary.netCosts < 0 ? '#17a2b8' : CONFIG.COLORS.COST;
            html += createMetricBox(
                formatCurrency(summary.netCosts),
                'Net Costs',
                netCostsColor
            );

            // Net Profit
            var profitColor = summary.netProfit >= 0 ? CONFIG.COLORS.PROFIT : CONFIG.COLORS.LOSS;
            html += createMetricBox(
                formatCurrency(summary.netProfit),
                'Net Profit/Loss',
                profitColor
            );

            // ROI Percentage
            var roiDisplay = 'N/A';
            var roiColor = CONFIG.COLORS.ROI_MEDIUM;
            if (summary.roiPercent !== null && isFinite(summary.roiPercent)) {
                roiDisplay = summary.roiPercent.toFixed(1) + '%';
                if (summary.roiPercent > 20) {
                    roiColor = CONFIG.COLORS.ROI_GOOD;
                } else if (summary.roiPercent < 0) {
                    roiColor = CONFIG.COLORS.ROI_BAD;
                }
            } else if (summary.netCosts <= 0 && summary.netRevenue > 0) {
                roiDisplay = 'Infinite';
                roiColor = CONFIG.COLORS.ROI_GOOD;
            }
            html += createMetricBox(roiDisplay, 'ROI', roiColor);

            html += '</div>';

            return html;
        }

        /**
         * Creates a metric box HTML
         */
        function createMetricBox(value, label, color) {
            return '<div class="roi-box" style="border-left-color: ' + color + ';">' +
                   '<div class="roi-number" style="color: ' + color + ';">' + value + '</div>' +
                   '<div class="roi-label">' + label + '</div>' +
                   '</div>';
        }

        /**
         * Builds cost breakdown by type HTML
         */
        function buildCostBreakdown(costsByType) {
            if (!costsByType || Object.keys(costsByType).length === 0) {
                return '';
            }

            // Calculate total of all cost types
            var totalCosts = 0;
            for (var type in costsByType) {
                totalCosts += costsByType[type];
            }

            var html = '<div class="cost-breakdown-container">';
            html += '<div class="section-header">';
            html += '<span class="section-header-title">Cost Breakdown by Type</span>';
            html += '<span class="section-header-total">' + formatCurrency(totalCosts) + '</span>';
            html += '</div>';
            html += '<div class="section-content">';
            html += '<div class="cost-breakdown-grid">';

            var colors = {
                'Service': '#17a2b8',
                'Parts': '#6f42c1',
                'Trucking': '#e83e8c',
                'Other': '#6c757d'
            };

            for (var type in costsByType) {
                var color = colors[type] || '#6c757d';
                html += createMetricBox(formatCurrency(costsByType[type]), type, color);
            }

            html += '</div></div></div>';

            return html;
        }

        /**
         * Builds CSV export button HTML
         */
        function buildExportButton(params) {
            var exportUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId,
                params: {
                    export: 'csv',
                    custpage_equipment: params.custpage_equipment || '',
                    custpage_date_from: params.custpage_date_from || '',
                    custpage_date_to: params.custpage_date_to || ''
                }
            });

            return '<div class="export-container">' +
                   '<a href="' + exportUrl + '" class="export-btn">Export to CSV</a>' +
                   '</div>';
        }

        /**
         * Builds a transaction table HTML
         */
        function buildTransactionTable(title, transactions, tableType, total) {
            if (!transactions || transactions.length === 0) {
                return '<div class="section-box">' +
                       '<div class="section-header">' +
                       '<span class="section-header-title">' + title + ' (0)</span>' +
                       '<span class="section-header-total">$0.00</span>' +
                       '</div>' +
                       '<div class="section-content"><p style="color: #666; margin: 0;">No transactions found.</p></div>' +
                       '</div>';
            }

            var html = '<div class="section-box">';
            html += '<div class="section-header">';
            html += '<span class="section-header-title">' + title + ' (' + transactions.length + ')</span>';
            html += '<span class="section-header-total">' + formatCurrency(total || 0) + '</span>';
            html += '</div>';
            html += '<div class="section-content">';
            html += '<table class="transaction-table" style="table-layout: fixed; min-width: 1200px; width: 100%;">';
            html += '<colgroup>';
            html += '<col style="width: 85px;">';   // Date
            html += '<col style="width: 100px;">';  // Transaction #
            html += '<col style="width: 70px;">';   // Type
            html += '<col style="width: 100px;">';  // Status
            html += '<col style="width: 120px;">';  // Applied To
            html += '<col style="width: 110px;">';  // Amount
            html += '<col style="width: 180px;">';  // Customer
            html += '<col style="width: 320px;">';  // Revenue Stream
            html += '<col style="width: 115px;">';  // Memo
            html += '</colgroup>';
            html += '<thead><tr>';
            html += '<th>Date</th>';
            html += '<th>Transaction #</th>';
            html += '<th>Type</th>';
            html += '<th>Status</th>';
            html += '<th>Applied To</th>';
            html += '<th style="text-align: right;">Amount</th>';
            html += '<th>Customer</th>';
            html += '<th>Revenue Stream</th>';
            html += '<th>Memo</th>';
            html += '</tr></thead>';
            html += '<tbody>';

            for (var i = 0; i < transactions.length; i++) {
                var t = transactions[i];

                // Determine the URL based on transaction type
                var tranUrl = '/app/accounting/transactions/custinvc.nl?id=' + t.id;
                if (tableType === 'credit' || tableType === 'costcredit') {
                    tranUrl = '/app/accounting/transactions/custcred.nl?id=' + t.id;
                }

                var appliedHtml = formatAppliedTransactionsHtml(t.appliedTransactions);
                var appliedText = formatAppliedTransactionsText(t.appliedTransactions);

                html += '<tr>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + formatDate(t.date) + '</td>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a href="' + tranUrl + '" target="_blank" style="color: #007bff;">' + t.number + '</a></td>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (t.type || '') + '</td>';
                html += '<td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (t.status || '') + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + appliedText.replace(/"/g, '&quot;') + '">' + appliedHtml + '</td>';
                html += '<td class="amount-col" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + formatCurrency(t.amount) + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + (t.customer || '').replace(/"/g, '&quot;') + '">' + (t.customer || '') + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + (t.revenueStream || '').replace(/"/g, '&quot;') + '">' + (t.revenueStream || '') + '</td>';
                html += '<td style="overflow: hidden; text-overflow: ellipsis;" title="' + (t.memo || '').replace(/"/g, '&quot;') + '">' + (t.memo || '') + '</td>';
                html += '</tr>';
            }

            html += '</tbody></table>';
            html += '</div></div>';

            return html;
        }

        /**
         * Exports results to CSV
         */
        function exportToCSV(context) {
            try {
                var params = context.request.parameters;
                var results = analyzeEquipmentROI(params);

                if (results.error) {
                    context.response.write('Error: ' + results.error);
                    return;
                }

                var csvContent = generateCSV(results, params);

                var csvFile = file.create({
                    name: 'roi_analysis_' + (results.equipment.fleetCode || 'equipment') + '_' +
                          format.format({ value: new Date(), type: format.Type.DATE }).replace(/\//g, '-') + '.csv',
                    fileType: file.Type.CSV,
                    contents: csvContent
                });

                context.response.writeFile({
                    file: csvFile,
                    isInline: false
                });

            } catch (e) {
                log.error({
                    title: 'Error in exportToCSV',
                    details: e.toString()
                });
                context.response.write('An error occurred during export: ' + e.toString());
            }
        }

        /**
         * Generates CSV content from results
         */
        function generateCSV(results, params) {
            var csvLines = [];

            // Summary header
            csvLines.push('ROI Analysis Report');
            csvLines.push('Equipment,' + (results.equipment.fleetCode || results.equipment.serial));
            csvLines.push('Date Range,' + params.custpage_date_from + ' to ' + params.custpage_date_to);
            csvLines.push('');

            // Summary metrics
            csvLines.push('Summary Metrics');
            csvLines.push('Gross Revenue,' + results.summary.grossRevenue.toFixed(2));
            csvLines.push('Revenue Credits,' + results.summary.revenueCredits.toFixed(2));
            csvLines.push('Net Revenue,' + results.summary.netRevenue.toFixed(2));
            csvLines.push('Gross Costs,' + results.summary.grossCosts.toFixed(2));
            csvLines.push('Cost Credits,' + results.summary.costCredits.toFixed(2));
            csvLines.push('Net Costs,' + results.summary.netCosts.toFixed(2));
            csvLines.push('Net Profit,' + results.summary.netProfit.toFixed(2));
            csvLines.push('ROI %,' + (results.summary.roiPercent !== null ? results.summary.roiPercent.toFixed(2) : 'N/A'));
            csvLines.push('');

            // Revenue transactions
            csvLines.push('Revenue Transactions');
            csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Customer,Memo');
            for (var i = 0; i < results.revenue.transactions.length; i++) {
                var r = results.revenue.transactions[i];
                csvLines.push([
                    formatDate(r.date),
                    '"' + r.number + '"',
                    '"Revenue"',
                    '"' + (r.status || '').replace(/"/g, '""') + '"',
                    '"' + formatAppliedTransactionsText(r.appliedTransactions).replace(/"/g, '""') + '"',
                    r.amount.toFixed(2),
                    '"' + (r.customer || '').replace(/"/g, '""') + '"',
                    '"' + (r.memo || '').replace(/"/g, '""') + '"'
                ].join(','));
            }
            csvLines.push('');

            // Revenue credit transactions
            csvLines.push('Revenue Credit Memo Transactions');
            csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Customer,Memo');
            for (var j = 0; j < results.credits.transactions.length; j++) {
                var c = results.credits.transactions[j];
                csvLines.push([
                    formatDate(c.date),
                    '"' + c.number + '"',
                    '"Revenue Credit"',
                    '"' + (c.status || '').replace(/"/g, '""') + '"',
                    '"' + formatAppliedTransactionsText(c.appliedTransactions).replace(/"/g, '""') + '"',
                    c.amount.toFixed(2),
                    '"' + (c.customer || '').replace(/"/g, '""') + '"',
                    '"' + (c.memo || '').replace(/"/g, '""') + '"'
                ].join(','));
            }
            csvLines.push('');

            // Cost transactions
            csvLines.push('Cost Transactions');
            csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Revenue Stream,Memo');
            for (var k = 0; k < results.costs.transactions.length; k++) {
                var t = results.costs.transactions[k];
                csvLines.push([
                    formatDate(t.date),
                    '"' + t.number + '"',
                    '"' + (t.type || '') + '"',
                    '"' + (t.status || '').replace(/"/g, '""') + '"',
                    '"' + formatAppliedTransactionsText(t.appliedTransactions).replace(/"/g, '""') + '"',
                    t.amount.toFixed(2),
                    '"' + (t.revenueStream || '').replace(/"/g, '""') + '"',
                    '"' + (t.memo || '').replace(/"/g, '""') + '"'
                ].join(','));
            }
            csvLines.push('');

            // Cost credit transactions
            if (results.costs.credits && results.costs.credits.transactions.length > 0) {
                csvLines.push('Cost Credit Memo Transactions');
                csvLines.push('Date,Transaction #,Type,Status,Applied To,Amount,Revenue Stream,Memo');
                for (var m = 0; m < results.costs.credits.transactions.length; m++) {
                    var cc = results.costs.credits.transactions[m];
                    csvLines.push([
                        formatDate(cc.date),
                        '"' + cc.number + '"',
                        '"Cost Credit"',
                        '"' + (cc.status || '').replace(/"/g, '""') + '"',
                        '"' + formatAppliedTransactionsText(cc.appliedTransactions).replace(/"/g, '""') + '"',
                        cc.amount.toFixed(2),
                        '"' + (cc.revenueStream || '').replace(/"/g, '""') + '"',
                        '"' + (cc.memo || '').replace(/"/g, '""') + '"'
                    ].join(','));
                }
            }

            return csvLines.join('\n');
        }

        /**
         * Formats a number as currency
         */
        function formatCurrency(value) {
            if (value === null || value === undefined) return '$0.00';
            var num = parseFloat(value);
            var isNegative = num < 0;
            var absValue = Math.abs(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return (isNegative ? '-$' : '$') + absValue;
        }

        /**
         * Formats a date for display
         */
        function formatDate(dateValue) {
            if (!dateValue) return '';
            try {
                var date = new Date(dateValue);
                return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            } catch (e) {
                return String(dateValue);
            }
        }

        /**
         * Truncates text to specified length
         */
        function truncateText(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }

        return {
            onRequest: onRequest
        };
    }
);
