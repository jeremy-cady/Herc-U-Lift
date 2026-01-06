/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * Fleet-Wide Rental Equipment ROI Report
 *
 * Generates a CSV report of ROI metrics for all rental fleet equipment.
 * Calculates revenue, costs, and ROI percentage for each piece of equipment
 * within a configurable date range.
 *
 * ============================================================================
 * PARAMETER REFERENCE GUIDE
 * ============================================================================
 *
 * FROM DATE (custscript_roi_from_date)
 *   Type: Date
 *   Example: 01/01/2025
 *   Required: Yes
 *
 * TO DATE (custscript_roi_to_date)
 *   Type: Date
 *   Example: 12/31/2025
 *   Required: Yes
 *
 * USER EMAIL FOR NOTIFICATION (custscript_roi_user_email)
 *   Type: Email Address
 *   Example: user@company.com
 *   Notes: Email address to receive completion notification with summary stats.
 *          In Sandbox, email may not send - check File Cabinet for output.
 *   Required: No (but recommended)
 *
 * ============================================================================
 *
 * @see Documentation/PRDs/PRD-20251128-RentalEquipmentROIAnalyzer.md
 */

define(['N/query', 'N/runtime', 'N/file', 'N/email', 'N/log', 'N/format'],
    function(query, runtime, file, email, log, format) {

        // Configuration
        var CONFIG = {
            FOLDER_ID: 6043632 // Inventory Reports folder in Documents (Sandbox: 5746560, Production: 6043632)
        };

        // Column names for SuiteQL result mapping
        var EQUIPMENT_COLUMNS = [
            'object_id', 'object_name', 'asset_id', 'fleet_code', 'serial',
            'manufacturer', 'model', 'category', 'location', 'year',
            'fixed_asset', 'lease_co_code', 'dummy'
        ];

        /**
         * Get Input Data - Return all rental equipment
         */
        function getInputData() {
            var scriptObj = runtime.getCurrentScript();

            var fromDateParam = scriptObj.getParameter({ name: 'custscript_roi_from_date' });
            var toDateParam = scriptObj.getParameter({ name: 'custscript_roi_to_date' });

            if (!fromDateParam || !toDateParam) {
                log.error('getInputData', 'Missing required date parameters');
                return [];
            }

            log.audit('getInputData', 'Starting rental ROI report. Date range: ' +
                formatDateForQuery(fromDateParam) + ' to ' + formatDateForQuery(toDateParam));

            // Query all rental equipment (Objects with owner_status = 3 joined to Assets)
            // Use ROW_NUMBER to get only one Asset per Object (in case multiple Assets link to same Object)
            var equipmentSql = `
                SELECT
                    object_id,
                    object_name,
                    asset_id,
                    fleet_code,
                    serial,
                    manufacturer,
                    model,
                    category,
                    location,
                    year,
                    fixed_asset,
                    lease_co_code,
                    dummy
                FROM (
                    SELECT
                        o.id AS object_id,
                        o.name AS object_name,
                        a.id AS asset_id,
                        a.custrecord_sna_hul_fleetcode AS fleet_code,
                        a.custrecord_nx_asset_serial AS serial,
                        BUILTIN.DF(a.cseg_hul_mfg) AS manufacturer,
                        BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
                        BUILTIN.DF(a.cseg_sna_hul_eq_seg) AS category,
                        BUILTIN.DF(o.custrecord_sna_responsibility_center) AS location,
                        o.custrecord_sna_year AS year,
                        o.custrecord_sna_fixed_asset AS fixed_asset,
                        o.custrecord_sna_hul_lease_co_code AS lease_co_code,
                        o.custrecord_sna_hul_rent_dummy AS dummy,
                        ROW_NUMBER() OVER (PARTITION BY o.id ORDER BY a.id) AS rn
                    FROM customrecord_sna_objects o
                    INNER JOIN customrecord_nx_asset a ON a.custrecord_sna_hul_nxcassetobject = o.id
                    WHERE o.custrecord_sna_owner_status = 3
                      AND a.isinactive = 'F'
                )
                WHERE rn = 1
                ORDER BY fleet_code
            `;

            log.debug('getInputData', 'Equipment query: ' + equipmentSql);

            return {
                type: 'suiteql',
                query: equipmentSql
            };
        }

        /**
         * Map - Process each equipment record
         * Run 4 aggregate queries and calculate ROI metrics
         */
        function map(context) {
            var scriptObj = runtime.getCurrentScript();
            var fromDate = formatDateForQuery(scriptObj.getParameter({ name: 'custscript_roi_from_date' }));
            var toDate = formatDateForQuery(scriptObj.getParameter({ name: 'custscript_roi_to_date' }));

            try {
                // Parse equipment data from SuiteQL result
                var rawData = JSON.parse(context.value);
                var equipment = {};

                // Map values array to named properties
                if (rawData.values && Array.isArray(rawData.values)) {
                    for (var i = 0; i < EQUIPMENT_COLUMNS.length && i < rawData.values.length; i++) {
                        equipment[EQUIPMENT_COLUMNS[i]] = rawData.values[i];
                    }
                } else {
                    // Already mapped object
                    equipment = rawData;
                }

                var objectId = equipment.object_id;
                var fleetCode = equipment.fleet_code || '';

                if (!objectId) {
                    log.error('map', 'Missing object_id in equipment data');
                    return;
                }

                log.debug('map', 'Processing equipment: ' + fleetCode + ' (Object ID: ' + objectId + ')');

                // Run 4 aggregate queries
                var rentalRevenue = getRevenueTotal(objectId, fromDate, toDate);
                var revenueCredits = getRevenueCreditTotal(objectId, fromDate, toDate);
                var grossCosts = getCostTotal(objectId, fromDate, toDate);
                var costCredits = getCostCreditTotal(objectId, fromDate, toDate);

                // Calculate ROI metrics
                var netRevenue = rentalRevenue - revenueCredits;
                var netCosts = grossCosts - costCredits;
                var netProfit = netRevenue - netCosts;
                var roiPercent = netCosts > 0 ? ((netProfit / netCosts) * 100) : null;

                // Calculate equipment age
                var currentYear = new Date().getFullYear();
                var equipmentYear = equipment.year ? parseInt(equipment.year, 10) : null;
                var age = equipmentYear ? (currentYear - equipmentYear) : null;

                // Build CSV row
                var csvRow = [
                    escapeCSV(objectId),
                    escapeCSV(equipment.object_name || ''),
                    escapeCSV(fleetCode),
                    escapeCSV(equipment.serial || ''),
                    escapeCSV(equipment.manufacturer || ''),
                    escapeCSV(equipment.model || ''),
                    escapeCSV(equipment.category || ''),
                    escapeCSV(equipment.location || ''),
                    age !== null ? age : '',
                    escapeCSV(equipment.fixed_asset || ''),
                    escapeCSV(equipment.lease_co_code || ''),
                    escapeCSV(equipment.dummy || ''),
                    formatNumber(rentalRevenue),
                    formatNumber(revenueCredits),
                    formatNumber(netRevenue),
                    formatNumber(grossCosts),
                    formatNumber(costCredits),
                    formatNumber(netCosts),
                    formatNumber(netProfit),
                    roiPercent !== null ? roiPercent.toFixed(2) : ''
                ].join(',');

                // Determine status for grouping
                var status = 'WITH_ACTIVITY';
                if (rentalRevenue === 0 && grossCosts === 0) {
                    status = 'NO_ACTIVITY';
                }

                context.write({
                    key: status,
                    value: csvRow
                });

            } catch (e) {
                log.error('map', 'Error processing equipment: ' + e.toString());
            }
        }

        /**
         * Reduce - Pass through CSV rows
         */
        function reduce(context) {
            context.values.forEach(function(csvRow) {
                context.write({
                    key: context.key,
                    value: csvRow
                });
            });
        }

        /**
         * Summarize - Build CSV and email to user
         */
        function summarize(summary) {
            var scriptObj = runtime.getCurrentScript();
            var userEmail = scriptObj.getParameter({ name: 'custscript_roi_user_email' });
            var fromDate = formatDateForQuery(scriptObj.getParameter({ name: 'custscript_roi_from_date' }));
            var toDate = formatDateForQuery(scriptObj.getParameter({ name: 'custscript_roi_to_date' }));

            log.audit('summarize', 'Starting CSV generation');

            // Count statistics
            var stats = {
                total: 0,
                withActivity: 0,
                noActivity: 0,
                totalRevenue: 0,
                totalCosts: 0,
                totalProfit: 0
            };

            // Build CSV content
            var csvHeader = 'Object ID,Object Name,Fleet Code,Serial,Manufacturer,Model,Category,Location,Age (Years),Fixed Asset,Lease Co Code,Dummy,Rental Revenue,Revenue Credits,Net Revenue,Gross Costs,Cost Credits,Net Costs,Net Profit/Loss,ROI %\n';
            var csvRows = [];

            summary.output.iterator().each(function(key, value) {
                stats.total++;

                // Update stats based on status key
                if (key === 'WITH_ACTIVITY') {
                    stats.withActivity++;
                } else {
                    stats.noActivity++;
                }

                // Parse CSV row to extract totals for summary
                // Column order: Object ID(0), Object Name(1), Fleet Code(2), Serial(3), Manufacturer(4), Model(5),
                //               Category(6), Location(7), Age(8), Fixed Asset(9), Lease Co Code(10), Dummy(11),
                //               Rental Revenue(12), Revenue Credits(13), Net Revenue(14), Gross Costs(15),
                //               Cost Credits(16), Net Costs(17), Net Profit(18), ROI %(19)
                var columns = parseCSVRow(value);
                if (columns.length >= 19) {
                    stats.totalRevenue += parseFloat(columns[14]) || 0;  // Net Revenue
                    stats.totalCosts += parseFloat(columns[17]) || 0;   // Net Costs
                    stats.totalProfit += parseFloat(columns[18]) || 0;  // Net Profit
                }

                csvRows.push(value);
                return true;
            });

            log.audit('summarize', 'Processed ' + stats.total + ' equipment records');

            // Calculate average ROI
            var avgROI = stats.totalCosts > 0 ? ((stats.totalProfit / stats.totalCosts) * 100) : 0;

            // Create CSV file
            var csvContent = csvHeader + csvRows.join('\n');
            var timestamp = new Date().getTime();
            var fileName = 'rental_roi_report_' + timestamp + '.csv';

            var csvFile = file.create({
                name: fileName,
                fileType: file.Type.CSV,
                contents: csvContent,
                folder: CONFIG.FOLDER_ID
            });

            var fileId = csvFile.save();
            log.audit('summarize', 'CSV file saved with ID: ' + fileId);

            // Send email notification
            if (userEmail) {
                var emailBody = 'Your Fleet-Wide Rental ROI Report is complete.\n\n';
                emailBody += 'Date Range: ' + fromDate + ' to ' + toDate + '\n\n';
                emailBody += 'Summary:\n';
                emailBody += '- Total Equipment: ' + stats.total + '\n';
                emailBody += '- Equipment with Activity: ' + stats.withActivity + '\n';
                emailBody += '- Equipment without Activity: ' + stats.noActivity + '\n';
                emailBody += '- Total Net Revenue: ' + formatCurrency(stats.totalRevenue) + '\n';
                emailBody += '- Total Net Costs: ' + formatCurrency(stats.totalCosts) + '\n';
                emailBody += '- Total Net Profit: ' + formatCurrency(stats.totalProfit) + '\n';
                emailBody += '- Average ROI: ' + avgROI.toFixed(1) + '%\n\n';
                emailBody += 'The CSV file has been saved to the File Cabinet (Inventory Reports folder).\n';
                emailBody += 'File ID: ' + fileId + '\n';
                emailBody += 'File Name: ' + fileName + '\n';

                email.send({
                    author: -5, // System user
                    recipients: userEmail,
                    subject: 'Rental ROI Report Complete - ' + stats.total + ' Equipment',
                    body: emailBody
                });

                log.audit('summarize', 'Email sent to ' + userEmail);
            }

            // Log any errors
            var errorCount = 0;
            summary.mapSummary.errors.iterator().each(function(key, error) {
                log.error('Map Error', 'Key: ' + key + ', Error: ' + error);
                errorCount++;
                return true;
            });

            summary.reduceSummary.errors.iterator().each(function(key, error) {
                log.error('Reduce Error', 'Key: ' + key + ', Error: ' + error);
                errorCount++;
                return true;
            });

            if (errorCount > 0) {
                log.audit('summarize', 'Completed with ' + errorCount + ' errors');
            }
        }

        // ============ Query Functions ============

        /**
         * Get total rental revenue (R-prefix invoices, ALL revenue streams)
         */
        function getRevenueTotal(objectId, fromDate, toDate) {
            var sql = `
                SELECT COALESCE(SUM(ABS(tl.netamount)), 0) AS total
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                WHERE t.type = 'CustInvc'
                  AND t.tranid LIKE 'R%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
            `;

            return runAggregateQuery(sql, 0);
        }

        /**
         * Get total revenue credits (CM-prefix credit memos)
         */
        function getRevenueCreditTotal(objectId, fromDate, toDate) {
            var sql = `
                SELECT COALESCE(SUM(ABS(tl.netamount)), 0) AS total
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                WHERE t.type = 'CustCred'
                  AND t.tranid LIKE 'CM%'
                  AND tl.custcol_sna_object = ${objectId}
                  AND tl.mainline = 'F'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
            `;

            return runAggregateQuery(sql, 0);
        }

        /**
         * Get total costs (non-R-prefix, INTERNAL revenue stream)
         * Uses dual linking: custcol_sna_object OR custcol_sna_hul_fleet_no
         */
        function getCostTotal(objectId, fromDate, toDate) {
            var sql = `
                SELECT COALESCE(SUM(ABS(tl.netamount)), 0) AS total
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                WHERE t.type IN ('CustInvc', 'CashSale')
                  AND (tl.custcol_sna_object = ${objectId} OR tl.custcol_sna_hul_fleet_no = ${objectId})
                  AND tl.mainline = 'F'
                  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
                  AND t.tranid NOT LIKE 'R%'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
            `;

            return runAggregateQuery(sql, 0);
        }

        /**
         * Get total cost credits (CM-prefix, INTERNAL revenue stream)
         * Uses dual linking: custcol_sna_object OR custcol_sna_hul_fleet_no
         */
        function getCostCreditTotal(objectId, fromDate, toDate) {
            var sql = `
                SELECT COALESCE(SUM(ABS(tl.netamount)), 0) AS total
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                WHERE t.type = 'CustCred'
                  AND t.tranid LIKE 'CM%'
                  AND (tl.custcol_sna_object = ${objectId} OR tl.custcol_sna_hul_fleet_no = ${objectId})
                  AND tl.mainline = 'F'
                  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
            `;

            return runAggregateQuery(sql, 0);
        }

        /**
         * Run an aggregate query and return the result
         */
        function runAggregateQuery(sql, defaultValue) {
            try {
                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                if (results.length > 0 && results[0].total !== null) {
                    return parseFloat(results[0].total) || defaultValue;
                }
                return defaultValue;
            } catch (e) {
                log.error('runAggregateQuery', 'Query error: ' + e.toString());
                return defaultValue;
            }
        }

        // ============ Helper Functions ============

        /**
         * Format date for SuiteQL query (MM/DD/YYYY)
         */
        function formatDateForQuery(dateValue) {
            if (!dateValue) return '';

            // If already a string in correct format, return as-is
            if (typeof dateValue === 'string') {
                // Check if already in MM/DD/YYYY format
                if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
                    return dateValue;
                }
                // Try to parse the string
                dateValue = new Date(dateValue);
            }

            // If it's a Date object, format it
            if (dateValue instanceof Date && !isNaN(dateValue)) {
                var month = (dateValue.getMonth() + 1).toString();
                var day = dateValue.getDate().toString();
                var year = dateValue.getFullYear().toString();
                return month + '/' + day + '/' + year;
            }

            return '';
        }

        /**
         * Escape a value for CSV (handle commas, quotes, newlines)
         */
        function escapeCSV(value) {
            if (value === null || value === undefined) return '';
            var str = String(value);
            if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }

        /**
         * Format number for CSV (2 decimal places)
         */
        function formatNumber(value) {
            if (value === null || value === undefined) return '0.00';
            return parseFloat(value).toFixed(2);
        }

        /**
         * Format currency for display
         */
        function formatCurrency(value) {
            if (value === null || value === undefined) return '$0.00';
            var num = parseFloat(value);
            var sign = num < 0 ? '-' : '';
            var absNum = Math.abs(num);
            return sign + '$' + absNum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        /**
         * Parse a CSV row back to array (simple parser)
         */
        function parseCSVRow(row) {
            var result = [];
            var current = '';
            var inQuotes = false;

            for (var i = 0; i < row.length; i++) {
                var char = row[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current);
            return result;
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });
