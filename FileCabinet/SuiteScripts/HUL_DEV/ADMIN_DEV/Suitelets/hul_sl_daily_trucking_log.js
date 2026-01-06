/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * Daily Trucking Log Report - Dual-Mode Suitelet
 *
 * Purpose: Generates Daily Trucking Log reports matching the format of manual PDF logs.
 * Shows equipment deliveries and pickups grouped by location.
 *
 * Modes:
 * - UI Mode (?format=ui or default): HTML form with filters and results
 * - JSON Mode (?format=json): JSON API for n8n integration
 *
 * @see Documentation/PRDs/PRD-20251126-DailyTruckingLog.md
 *
 * Version: 1.0
 * Date: November 2025
 */

define(['N/query', 'N/ui/serverWidget', 'N/format', 'N/runtime', 'N/url'],
    function(query, serverWidget, format, runtime, url) {

        /**
         * Configuration constants
         */
        const CONFIG = {
            // Case types
            CASE_TYPE: {
                DELIVERY: 6,
                PICKUP: 103
            },

            // Code prefixes from transaction tranid
            CODE_MAPPING: {
                'R': 'Rental',
                'S': 'Sale',
                'D': 'Demo',
                'L': 'Loaner',
                'C': 'Customer Repairs',
                'WO': 'Work Order',
                'T': 'Trucking/Transfer',
                'P': 'Parts',
                'E': 'Equipment',
                'A': 'Allied/Rack'
            },

            // Color scheme
            COLORS: {
                PRIMARY: '#667eea',
                SECONDARY: '#764ba2',
                SUCCESS: '#28a745',
                WARNING: '#ffc107',
                INFO: '#17a2b8'
            }
        };

        /**
         * Main request handler
         */
        function onRequest(context) {
            var format = context.request.parameters.format || 'ui';

            try {
                if (format === 'json') {
                    handleJsonRequest(context);
                } else {
                    handleUiRequest(context);
                }
            } catch (e) {
                log.error({
                    title: 'Error in onRequest',
                    details: e.toString() + '\n' + (e.stack || '')
                });

                if (format === 'json') {
                    context.response.setHeader({
                        name: 'Content-Type',
                        value: 'application/json'
                    });
                    context.response.write(JSON.stringify({
                        error: true,
                        message: e.toString()
                    }));
                } else {
                    context.response.write('An error occurred: ' + e.toString());
                }
            }
        }

        /**
         * Handles JSON API requests
         */
        function handleJsonRequest(context) {
            var params = context.request.parameters;
            var reportDate = params.date || getTodayDateString();
            var locationFilter = params.location || null;

            var results = searchTruckingLog(reportDate, locationFilter);
            var jsonResponse = formatJsonResponse(results, reportDate);

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json'
            });
            context.response.write(JSON.stringify(jsonResponse));
        }

        /**
         * Handles UI requests - displays form and results
         */
        function handleUiRequest(context) {
            var form = serverWidget.createForm({
                title: 'Daily Trucking Log Report'
            });

            // Add header with description
            addHeaderHtml(form);

            // Add filter fields
            addFilterFields(form, context.request.parameters);

            // Add submit button
            form.addSubmitButton({
                label: 'Run Report'
            });

            // If filters are set, run search and display results
            var params = context.request.parameters;
            if (params.custpage_run_report === 'T' || params.custpage_date) {
                var reportDate = params.custpage_date || getTodayDateString();
                var locationFilter = params.custpage_location || null;

                var results = searchTruckingLog(reportDate, locationFilter);
                displayResults(form, results, reportDate);
            }

            context.response.writePage(form);
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
                '.stats-container { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }' +
                '.stats-box { display: inline-block; padding: 12px 20px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; min-width: 120px; }' +
                '.stats-box.highlight { border-left: 4px solid; }' +
                '.stats-number { font-size: 28px; font-weight: bold; }' +
                '.stats-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 4px; }' +
                '.location-section { margin: 25px 0; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; width: 100%; }' +
                '.location-header { background: linear-gradient(135deg, ' + CONFIG.COLORS.PRIMARY + ', ' + CONFIG.COLORS.SECONDARY + '); color: white; padding: 15px 20px; font-size: 18px; font-weight: bold; }' +
                '.section-header { background: #f8f9fa; padding: 12px 20px; font-weight: bold; border-bottom: 1px solid #dee2e6; color: #495057; }' +
                '.section-header.delivered { border-left: 4px solid ' + CONFIG.COLORS.SUCCESS + '; }' +
                '.section-header.pickup { border-left: 4px solid ' + CONFIG.COLORS.INFO + '; }' +
                '.table-wrapper { overflow-x: auto; width: 100%; }' +
                '.data-table { width: 100%; border-collapse: collapse; min-width: 1400px; table-layout: fixed; }' +
                '.data-table th { background: #f1f3f5; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #495057; border-bottom: 2px solid #dee2e6; overflow: hidden; text-overflow: ellipsis; }' +
                '.data-table td { padding: 10px 12px; border-bottom: 1px solid #e9ecef; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }' +
                '.col-case { width: 70px; }' +
                '.col-task { width: 50px; }' +
                '.col-code { width: 50px; }' +
                '.col-custnum { width: 80px; }' +
                '.col-custname { width: 180px; }' +
                '.col-site { width: 250px; }' +
                '.col-driver { width: 60px; }' +
                '.col-fileno { width: 80px; }' +
                '.col-model { width: 90px; }' +
                '.col-trans { width: 90px; }' +
                '.col-revenue { width: 120px; }' +
                '.col-details { width: 200px; }' +
                '.data-table tr:hover { background: #f8f9fa; }' +
                '.code-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #e9ecef; color: #495057; }' +
                '.no-data { padding: 20px; text-align: center; color: #6c757d; font-style: italic; }' +
                '.info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0; border-radius: 4px; }' +
                '.json-api-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; font-family: monospace; font-size: 12px; }' +
                '</style>' +
                '<div class="info-box">' +
                '<strong>Purpose:</strong> This report shows daily equipment deliveries and pickups grouped by location, matching the manual trucking log format. ' +
                'Use this to verify data entry against manual PDF logs.' +
                '</div>' +
                '<div class="json-api-info">' +
                '<strong>JSON API:</strong> Add <code>?format=json&date=MM/DD/YYYY</code> to get JSON output for n8n integration.' +
                '</div>';
        }

        /**
         * Adds filter fields to the form
         */
        function addFilterFields(form, params) {
            var filterGroup = form.addFieldGroup({
                id: 'custpage_filters',
                label: 'Report Filters'
            });

            // Date picker
            var dateField = form.addField({
                id: 'custpage_date',
                type: serverWidget.FieldType.DATE,
                label: 'Report Date',
                container: 'custpage_filters'
            });
            dateField.defaultValue = params.custpage_date || new Date();
            dateField.isMandatory = true;

            // Location filter
            var locationField = form.addField({
                id: 'custpage_location',
                type: serverWidget.FieldType.SELECT,
                label: 'Location (HERC)',
                container: 'custpage_filters'
            });
            locationField.addSelectOption({ value: '', text: '-- All Locations --' });

            // Add locations from query
            addLocationOptions(locationField);

            if (params.custpage_location) {
                locationField.defaultValue = params.custpage_location;
            }

            // Hidden field to track if report has been run
            var runReportField = form.addField({
                id: 'custpage_run_report',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Run Report',
                container: 'custpage_filters'
            });
            runReportField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            runReportField.defaultValue = 'T';
        }

        /**
         * Adds location options to dropdown
         */
        function addLocationOptions(field) {
            try {
                var sql = `
                    SELECT
                        id,
                        name,
                        custrecord_sna_hul_res_cntr_code AS herc_code
                    FROM location
                    WHERE custrecord_sna_hul_res_cntr_code IS NOT NULL
                      AND isinactive = 'F'
                    ORDER BY custrecord_sna_hul_res_cntr_code
                `;

                var results = query.runSuiteQL({ query: sql }).asMappedResults();

                for (var i = 0; i < results.length; i++) {
                    var loc = results[i];
                    field.addSelectOption({
                        value: loc.id,
                        text: 'HERC ' + loc.herc_code + ' - ' + loc.name
                    });
                }
            } catch (e) {
                log.error({
                    title: 'Error loading locations',
                    details: e.toString()
                });
            }
        }

        /**
         * Searches for trucking log data using SuiteQL
         */
        function searchTruckingLog(reportDate, locationFilter) {
            var results = {
                deliveries: [],
                pickups: [],
                byLocation: {}
            };

            try {
                var sql = buildTruckingLogQuery(reportDate, locationFilter);

                log.debug({
                    title: 'Executing SuiteQL - Full Query',
                    details: sql
                });

                log.audit({
                    title: 'Query Parameters',
                    details: 'Date: ' + reportDate + ', Location: ' + locationFilter
                });

                var queryResults = query.runSuiteQL({ query: sql }).asMappedResults();

                log.audit({
                    title: 'Query Results',
                    details: 'Found ' + queryResults.length + ' records'
                });

                // Process results and group by location (HERC code)
                for (var i = 0; i < queryResults.length; i++) {
                    var row = queryResults[i];
                    var record = processRow(row);

                    // Group by HERC code (location)
                    var locationKey = row.herc_code || 0;
                    if (!results.byLocation[locationKey]) {
                        results.byLocation[locationKey] = {
                            locationId: row.location_id,
                            hercCode: row.herc_code,
                            locationName: row.location_name || 'Unknown Location',
                            deliveredTo: [],
                            inFrom: []
                        };
                    }

                    // Add to appropriate section
                    if (row.case_type == CONFIG.CASE_TYPE.DELIVERY) {
                        results.byLocation[locationKey].deliveredTo.push(record);
                        results.deliveries.push(record);
                    } else if (row.case_type == CONFIG.CASE_TYPE.PICKUP) {
                        results.byLocation[locationKey].inFrom.push(record);
                        results.pickups.push(record);
                    }
                }

            } catch (e) {
                log.error({
                    title: 'Error in searchTruckingLog',
                    details: e.toString() + '\n' + (e.stack || '')
                });
            }

            return results;
        }

        /**
         * Builds the SuiteQL query for trucking log data
         *
         * Field IDs (verified):
         * - Case to Object: custevent_sna_hul_case_object
         * - Asset to Object: custrecord_sna_hul_nxcassetobject (Asset points to Object)
         * - Model on Asset: custrecord_sna_hul_nxc_object_model
         */
        function buildTruckingLogQuery(reportDate, locationFilter) {
            // Join path: Case -> Object -> Asset (Asset links to Object via custrecord_sna_hul_nxcassetobject)
            // Customer: Case -> Customer entity (via custevent_nx_customer)
            var sql = `
                SELECT
                    sc.id AS case_id,
                    sc.casenumber,
                    sc.custevent_nx_case_type AS case_type,
                    sc.custevent_nx_case_details AS case_details,
                    BUILTIN.DF(sc.custevent_nx_case_asset) AS site_name,
                    BUILTIN.DF(sc.cseg_sna_revenue_st) AS revenue_stream,
                    cust.entityid AS customer_number,
                    cust.companyname AS customer_name,
                    t.id AS task_id,
                    t.title AS task_title,
                    t.startdate AS task_date,
                    BUILTIN.DF(t.assigned) AS driver_name,
                    o.id AS object_id,
                    o.name AS object_name,
                    a.custrecord_sna_hul_fleetcode AS fleet_code,
                    BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
                    o.custrecord_sna_responsibility_center AS location_id,
                    loc.name AS location_name,
                    loc.custrecord_sna_hul_res_cntr_code AS herc_code,
                    trans.id AS transaction_id,
                    trans.tranid AS transaction_number,
                    CASE
                        WHEN trans.tranid LIKE 'WO%' THEN 'WO'
                        ELSE SUBSTR(trans.tranid, 1, 1)
                    END AS move_code
                FROM supportcase sc
                INNER JOIN task t ON t.supportcase = sc.id
                LEFT JOIN customer cust ON sc.custevent_nx_customer = cust.id
                LEFT JOIN customrecord_sna_objects o ON sc.custevent_sna_hul_case_object = o.id
                LEFT JOIN customrecord_nx_asset a ON a.custrecord_sna_hul_nxcassetobject = o.id
                LEFT JOIN location loc ON o.custrecord_sna_responsibility_center = loc.id
                LEFT JOIN transaction trans ON sc.custevent_nx_case_transaction = trans.id
                WHERE sc.custevent_nx_case_type IN (${CONFIG.CASE_TYPE.DELIVERY}, ${CONFIG.CASE_TYPE.PICKUP})
                  AND TRUNC(t.startdate) = TO_DATE('${reportDate}', 'MM/DD/YYYY')
            `;

            // Add location filter if specified
            if (locationFilter) {
                sql += ` AND loc.id = ${locationFilter}`;
            }

            sql += `
                ORDER BY loc.custrecord_sna_hul_res_cntr_code, sc.custevent_nx_case_type, sc.custevent_nx_customer
            `;

            return sql;
        }

        /**
         * Processes a single row from query results
         */
        function processRow(row) {
            // Parse driver initials from name
            var driverInitials = getDriverInitials(row.driver_name);

            return {
                caseId: row.case_id,
                caseNumber: row.casenumber,
                caseDetails: row.case_details || '',
                code: row.move_code || '',
                subCode: null, // TBD - source not yet identified
                customerId: row.customer_number || '',
                customerName: row.customer_name || '',
                site: row.site_name || '',
                revenueStream: row.revenue_stream || '',
                driver: driverInitials,
                fleetCode: row.fleet_code || '',
                model: row.model || '',
                taskId: row.task_id,
                taskTitle: row.task_title || '',
                transactionId: row.transaction_id,
                transactionNumber: row.transaction_number || ''
            };
        }

        /**
         * Parses customer field (format: "NUMBER NAME")
         */
        function parseCustomerField(customerRaw) {
            if (!customerRaw) {
                return { id: '', name: '' };
            }

            var parts = customerRaw.trim().split(' ');
            if (parts.length === 1) {
                return { id: parts[0], name: '' };
            }

            return {
                id: parts[0],
                name: parts.slice(1).join(' ')
            };
        }

        /**
         * Gets driver initials from full name
         */
        function getDriverInitials(driverName) {
            if (!driverName) return '';

            // Check if it's already initials (2-3 chars, all uppercase)
            if (driverName.length <= 3 && driverName === driverName.toUpperCase()) {
                return driverName;
            }

            // Parse initials from name
            var parts = driverName.trim().split(' ');
            var initials = '';
            for (var i = 0; i < parts.length && i < 3; i++) {
                if (parts[i].length > 0) {
                    initials += parts[i].charAt(0).toUpperCase();
                }
            }
            return initials;
        }

        /**
         * Formats results as JSON response
         */
        function formatJsonResponse(results, reportDate) {
            var locations = [];

            // Sort locations by HERC code
            var sortedKeys = Object.keys(results.byLocation).sort(function(a, b) {
                return parseInt(a) - parseInt(b);
            });

            for (var i = 0; i < sortedKeys.length; i++) {
                var loc = results.byLocation[sortedKeys[i]];
                locations.push({
                    locationId: loc.locationId,
                    hercCode: loc.hercCode,
                    locationName: loc.locationName,
                    deliveredTo: loc.deliveredTo,
                    inFrom: loc.inFrom
                });
            }

            return {
                reportDate: reportDate,
                generatedAt: new Date().toISOString(),
                locations: locations,
                summary: {
                    totalDeliveries: results.deliveries.length,
                    totalPickups: results.pickups.length,
                    locationsWithActivity: sortedKeys.length
                }
            };
        }

        /**
         * Displays search results in UI
         */
        function displayResults(form, results, reportDate) {
            // Display statistics banner
            displayStatistics(form, results);

            // Display results grouped by location
            displayLocationGroups(form, results);
        }

        /**
         * Displays statistics banner
         */
        function displayStatistics(form, results) {
            var statsField = form.addField({
                id: 'custpage_stats',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Statistics'
            });

            // Force field to appear below filters, spanning full width
            statsField.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });
            statsField.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTROW
            });

            var locationCount = Object.keys(results.byLocation).length;

            var html = '<div class="stats-container">';

            // Total Deliveries
            html += createStatsBox(results.deliveries.length, 'Deliveries', CONFIG.COLORS.SUCCESS);

            // Total Pickups
            html += createStatsBox(results.pickups.length, 'Pickups', CONFIG.COLORS.INFO);

            // Locations with Activity
            html += createStatsBox(locationCount, 'Locations', CONFIG.COLORS.PRIMARY);

            // Total Moves
            html += createStatsBox(results.deliveries.length + results.pickups.length, 'Total Moves', '#6c757d');

            html += '</div>';

            statsField.defaultValue = html;
        }

        /**
         * Creates a statistics box HTML
         */
        function createStatsBox(value, label, color) {
            return '<div class="stats-box highlight" style="border-left-color: ' + color + ';">' +
                   '<div class="stats-number" style="color: ' + color + ';">' + value + '</div>' +
                   '<div class="stats-label">' + label + '</div>' +
                   '</div>';
        }

        /**
         * Displays results grouped by location
         */
        function displayLocationGroups(form, results) {
            var resultsField = form.addField({
                id: 'custpage_results',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Results'
            });

            // Force field to appear below stats, spanning full width
            resultsField.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });
            resultsField.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTROW
            });

            var html = '';

            // Sort locations by HERC code
            var sortedKeys = Object.keys(results.byLocation).sort(function(a, b) {
                return parseInt(a) - parseInt(b);
            });

            if (sortedKeys.length === 0) {
                html = '<div class="info-box" style="background: #fff3cd; border-left-color: #ffc107;">' +
                       '<strong>No Results</strong><br/>' +
                       'No deliveries or pickups found for the selected date and filters.' +
                       '</div>';
            } else {
                for (var i = 0; i < sortedKeys.length; i++) {
                    var loc = results.byLocation[sortedKeys[i]];
                    html += createLocationSection(loc);
                }
            }

            resultsField.defaultValue = html;
        }

        /**
         * Creates HTML for a location section
         */
        function createLocationSection(location) {
            var html = '<div class="location-section">';

            // Location header
            html += '<div class="location-header">';
            html += 'HERC ' + (location.hercCode || '?') + ' - ' + location.locationName;
            html += '</div>';

            // DELIVERED TO section
            html += '<div class="section-header delivered">DELIVERED TO</div>';
            if (location.deliveredTo.length > 0) {
                html += createDataTable(location.deliveredTo);
            } else {
                html += '<div class="no-data">No deliveries</div>';
            }

            // IN FROM section
            html += '<div class="section-header pickup">IN FROM</div>';
            if (location.inFrom.length > 0) {
                html += createDataTable(location.inFrom);
            } else {
                html += '<div class="no-data">No pickups</div>';
            }

            html += '</div>';

            return html;
        }

        /**
         * Creates HTML data table for records
         */
        function createDataTable(records) {
            var html = '<div class="table-wrapper"><table class="data-table">';

            // Header row with fixed column widths
            html += '<thead><tr>';
            html += '<th class="col-case">Case#</th>';
            html += '<th class="col-task">Task</th>';
            html += '<th class="col-code">Code</th>';
            html += '<th class="col-custnum">Cust#</th>';
            html += '<th class="col-custname">Customer Name</th>';
            html += '<th class="col-site">Site</th>';
            html += '<th class="col-driver">Driver</th>';
            html += '<th class="col-fileno">File No.</th>';
            html += '<th class="col-model">Model</th>';
            html += '<th class="col-trans">Transaction</th>';
            html += '<th class="col-revenue">Revenue Stream</th>';
            html += '<th class="col-details">Case Details</th>';
            html += '</tr></thead>';

            // Data rows
            html += '<tbody>';
            for (var i = 0; i < records.length; i++) {
                var r = records[i];
                html += '<tr>';

                // Case number with link
                var caseLink = '/app/crm/support/supportcase.nl?id=' + r.caseId;
                html += '<td class="col-case"><a href="' + caseLink + '" target="_blank" style="color: #667eea; text-decoration: none;">' + (r.caseNumber || '-') + '</a></td>';

                // Task with link
                if (r.taskId) {
                    var taskLink = '/app/crm/calendar/task.nl?id=' + r.taskId;
                    html += '<td class="col-task"><a href="' + taskLink + '" target="_blank" style="color: #667eea; text-decoration: none;">View</a></td>';
                } else {
                    html += '<td class="col-task">-</td>';
                }

                html += '<td class="col-code"><span class="code-badge">' + (r.code || '-') + '</span></td>';
                html += '<td class="col-custnum" title="' + (r.customerId || '') + '">' + (r.customerId || '-') + '</td>';
                html += '<td class="col-custname" title="' + (r.customerName || '') + '">' + (r.customerName || '-') + '</td>';
                html += '<td class="col-site" title="' + (r.site || '') + '">' + (r.site || '-') + '</td>';
                html += '<td class="col-driver">' + (r.driver || '-') + '</td>';
                html += '<td class="col-fileno">' + (r.fleetCode || '-') + '</td>';
                html += '<td class="col-model" title="' + (r.model || '') + '">' + (r.model || '-') + '</td>';

                // Transaction with link
                if (r.transactionId) {
                    var transLink = '/app/accounting/transactions/transaction.nl?id=' + r.transactionId;
                    html += '<td class="col-trans"><a href="' + transLink + '" target="_blank" style="color: #667eea; text-decoration: none;">' + (r.transactionNumber || '-') + '</a></td>';
                } else {
                    html += '<td class="col-trans">' + (r.transactionNumber || '-') + '</td>';
                }

                html += '<td class="col-revenue" title="' + (r.revenueStream || '') + '">' + (r.revenueStream || '-') + '</td>';
                html += '<td class="col-details" title="' + (r.caseDetails || '') + '">' + (r.caseDetails || '-') + '</td>';
                html += '</tr>';
            }
            html += '</tbody>';

            html += '</table></div>';

            return html;
        }

        /**
         * Gets today's date as MM/DD/YYYY string
         */
        function getTodayDateString() {
            var today = new Date();
            var month = String(today.getMonth() + 1).padStart(2, '0');
            var day = String(today.getDate()).padStart(2, '0');
            var year = today.getFullYear();
            return month + '/' + day + '/' + year;
        }

        return {
            onRequest: onRequest
        };
    }
);
