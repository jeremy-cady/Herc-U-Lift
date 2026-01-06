/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * Idle Equipment Tracker - Rental Fleet Analysis
 *
 * Purpose: Identifies rental fleet equipment that has never been rented
 * or hasn't been rented in a configurable time period.
 *
 * Key Feature: CORRECTLY identifies rental history by checking ALL "R" invoices
 * for each equipment, not just invoices linked to the most recent Sales Order.
 *
 * @see Documentation/PRDs/PRD-20251125-IdleEquipmentTracker.md
 *
 * Version: 1.0
 * Date: November 2025
 */

define(['N/query', 'N/ui/serverWidget', 'N/file', 'N/format', 'N/runtime', 'N/url'],
    function(query, serverWidget, file, format, runtime, url) {

        /**
         * Configuration constants
         */
        const CONFIG = {
            // Color scheme for status indicators
            COLORS: {
                NEVER_RENTED: '#dc3545',    // Red
                MONTHS_12_PLUS: '#fd7e14',  // Orange
                MONTHS_6_12: '#ffc107',     // Yellow
                MONTHS_3_6: '#fff3cd',      // Light Yellow
                MONTHS_1_3: '#d4edda',      // Light Green
                UNDER_1_MONTH: '#28a745',   // Green
                ON_RENT: '#17a2b8'          // Blue
            },

            // Time bucket thresholds (in days)
            THRESHOLDS: {
                MONTH_1: 30,
                MONTH_3: 90,
                MONTH_6: 180,
                MONTH_12: 365
            },

            // Equipment segment parent IDs that define rental fleet
            RENTAL_SEGMENT_PARENTS: [1, 5, 6, 9]
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
                    title: 'Rental Fleet Idle Equipment Tracker'
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
                if (params.custpage_run_report === 'T' || params.custpage_time_bucket) {
                    var results = searchIdleEquipment(params);
                    displayResults(form, results, params);
                }

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
                '.stats-container { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }' +
                '.stats-box { display: inline-block; padding: 12px 20px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; min-width: 120px; }' +
                '.stats-box.highlight { border-left: 4px solid; }' +
                '.stats-number { font-size: 28px; font-weight: bold; }' +
                '.stats-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 4px; }' +
                '.status-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; color: white; }' +
                '.info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0; border-radius: 4px; }' +
                '</style>' +
                '<div class="info-box">' +
                '<strong>Purpose:</strong> This report identifies rental fleet equipment that has never been rented or hasn\'t been rented recently. ' +
                'Use the filters below to find equipment by idle time period, location, or category.' +
                '</div>';
        }

        /**
         * Adds filter fields to the form
         */
        function addFilterFields(form, params) {
            var filterGroup = form.addFieldGroup({
                id: 'custpage_filters',
                label: 'Search Filters'
            });

            // Time bucket filter
            var timeBucketField = form.addField({
                id: 'custpage_time_bucket',
                type: serverWidget.FieldType.SELECT,
                label: 'Time Since Last Rental',
                container: 'custpage_filters'
            });
            timeBucketField.addSelectOption({ value: '', text: '-- All Equipment --' });
            timeBucketField.addSelectOption({ value: 'NEVER', text: 'Never Rented' });
            timeBucketField.addSelectOption({ value: '12PLUS', text: '12+ Months' });
            timeBucketField.addSelectOption({ value: '6TO12', text: '6-12 Months' });
            timeBucketField.addSelectOption({ value: '3TO6', text: '3-6 Months' });
            timeBucketField.addSelectOption({ value: '1TO3', text: '1-3 Months' });
            timeBucketField.addSelectOption({ value: 'UNDER1', text: 'Under 1 Month' });
            timeBucketField.addSelectOption({ value: 'ON_RENT', text: 'Currently On Rent' });

            if (params.custpage_time_bucket) {
                timeBucketField.defaultValue = params.custpage_time_bucket;
            }

            // Location filter
            var locationField = form.addField({
                id: 'custpage_location',
                type: serverWidget.FieldType.SELECT,
                label: 'Location',
                source: 'location',
                container: 'custpage_filters'
            });
            if (params.custpage_location) {
                locationField.defaultValue = params.custpage_location;
            }

            // Equipment Category filter
            var categoryField = form.addField({
                id: 'custpage_eq_category',
                type: serverWidget.FieldType.SELECT,
                label: 'Equipment Category',
                source: 'customrecord_cseg_sna_hul_eq_seg',
                container: 'custpage_filters'
            });
            if (params.custpage_eq_category) {
                categoryField.defaultValue = params.custpage_eq_category;
            }

            // Manufacturer filter
            var mfgField = form.addField({
                id: 'custpage_manufacturer',
                type: serverWidget.FieldType.SELECT,
                label: 'Manufacturer',
                source: 'customrecord_cseg_hul_mfg',
                container: 'custpage_filters'
            });
            if (params.custpage_manufacturer) {
                mfgField.defaultValue = params.custpage_manufacturer;
            }

            // Search text
            var searchField = form.addField({
                id: 'custpage_search',
                type: serverWidget.FieldType.TEXT,
                label: 'Fleet Code / Serial Number',
                container: 'custpage_filters'
            });
            if (params.custpage_search) {
                searchField.defaultValue = params.custpage_search;
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
         * Searches for idle equipment using SuiteQL
         */
        function searchIdleEquipment(params) {
            var results = [];

            try {
                // Build the master query with CTEs
                var sql = buildMasterQuery(params);

                log.debug({
                    title: 'Executing SuiteQL',
                    details: sql.substring(0, 500) + '...'
                });

                var queryResults = query.runSuiteQL({
                    query: sql
                });

                var mappedResults = queryResults.asMappedResults();

                log.audit({
                    title: 'Query Results',
                    details: 'Found ' + mappedResults.length + ' equipment records'
                });

                // Process and filter results based on time bucket selection
                for (var i = 0; i < mappedResults.length; i++) {
                    var row = mappedResults[i];

                    // Apply time bucket filter
                    if (params.custpage_time_bucket && !matchesTimeBucket(row, params.custpage_time_bucket)) {
                        continue;
                    }

                    // Apply search filter
                    if (params.custpage_search) {
                        var searchText = params.custpage_search.toLowerCase();
                        var fleetCode = (row.fleet_code || '').toLowerCase();
                        var serial = (row.serial || '').toLowerCase();
                        if (fleetCode.indexOf(searchText) === -1 && serial.indexOf(searchText) === -1) {
                            continue;
                        }
                    }

                    results.push({
                        assetId: row.asset_id,
                        objectId: row.object_id,
                        fleetCode: row.fleet_code || '',
                        serial: row.serial || '',
                        objectName: row.object_name || '',
                        manufacturer: row.manufacturer || '',
                        model: row.model || '',
                        category: row.category || '',
                        location: row.location || '',
                        invoiceCount: row.invoice_count || 0,
                        lastInvoiceDate: row.last_invoice_date,
                        daysSinceInvoice: row.days_since_invoice,
                        currentSO: row.current_so || '',
                        currentCustomer: row.current_customer || '',
                        totalSOCount: row.total_so_count || 0,
                        rentalStatus: row.rental_status || 'Unknown',
                        hasOpenSO: row.has_open_so === 'Y',
                        timeBucket: row.time_bucket || 'Unknown'
                    });
                }

            } catch (e) {
                log.error({
                    title: 'Error in searchIdleEquipment',
                    details: e.toString() + '\n' + (e.stack || '')
                });
            }

            return results;
        }

        /**
         * Builds the master SuiteQL query with CTEs
         */
        function buildMasterQuery(params) {
            var sql = `
                WITH RentalFleet AS (
                    SELECT
                        a.id AS asset_id,
                        a.custrecord_sna_hul_fleetcode AS fleet_code,
                        a.custrecord_nx_asset_serial AS serial,
                        o.id AS object_id,
                        o.name AS object_name,
                        BUILTIN.DF(a.cseg_hul_mfg) AS manufacturer,
                        BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
                        a.cseg_sna_hul_eq_seg AS category_id,
                        BUILTIN.DF(a.cseg_sna_hul_eq_seg) AS category,
                        BUILTIN.DF(o.custrecord_sna_responsibility_center) AS location,
                        o.custrecord_sna_responsibility_center AS location_id
                    FROM customrecord_nx_asset a
                    INNER JOIN customrecord_sna_objects o
                        ON a.custrecord_sna_hul_nxcassetobject = o.id
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg seg ON a.cseg_sna_hul_eq_seg = seg.id
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg p1 ON seg.parent = p1.id
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg p2 ON p1.parent = p2.id
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg p3 ON p2.parent = p3.id
                    WHERE o.custrecord_sna_owner_status = 3
                      AND o.custrecord_sna_posting_status = 2
                      AND NVL(o.custrecord_sna_hul_rent_dummy, 'F') = 'F'
                      AND a.isinactive = 'F'
                      AND (
                          seg.parent IN (1, 5, 6, 9)
                          OR p1.parent IN (1, 5, 6, 9)
                          OR p2.parent IN (1, 5, 6, 9)
                          OR p3.parent IN (1, 5, 6, 9)
                      )
                ),
                InvoiceHistory AS (
                    SELECT
                        tl.custcol_sna_object AS object_id,
                        COUNT(DISTINCT t.id) AS invoice_count,
                        MAX(t.trandate) AS last_invoice_date,
                        MIN(t.trandate) AS first_invoice_date
                    FROM transaction t
                    INNER JOIN transactionline tl ON t.id = tl.transaction
                    WHERE t.type = 'CustInvc'
                      AND t.tranid LIKE 'R%'
                      AND tl.custcol_sna_object IS NOT NULL
                      AND tl.mainline = 'F'
                    GROUP BY tl.custcol_sna_object
                ),
                OpenRentals AS (
                    SELECT
                        tl.custcol_sna_object AS object_id,
                        t.id AS open_so_id,
                        t.tranid AS open_so_number,
                        BUILTIN.DF(t.entity) AS current_customer,
                        ROW_NUMBER() OVER (PARTITION BY tl.custcol_sna_object ORDER BY t.trandate DESC) AS rn
                    FROM transaction t
                    INNER JOIN transactionline tl ON t.id = tl.transaction
                    WHERE t.type = 'SalesOrd'
                      AND t.tranid LIKE 'R%'
                      AND t.status NOT IN ('SalesOrd:C', 'SalesOrd:H')
                      AND tl.custcol_sna_object IS NOT NULL
                      AND tl.mainline = 'F'
                ),
                AllSOs AS (
                    SELECT
                        tl.custcol_sna_object AS object_id,
                        COUNT(DISTINCT t.id) AS total_so_count
                    FROM transaction t
                    INNER JOIN transactionline tl ON t.id = tl.transaction
                    WHERE t.type = 'SalesOrd'
                      AND t.tranid LIKE 'R%'
                      AND tl.custcol_sna_object IS NOT NULL
                      AND tl.mainline = 'F'
                    GROUP BY tl.custcol_sna_object
                )
                SELECT
                    rf.asset_id,
                    rf.object_id,
                    rf.fleet_code,
                    rf.serial,
                    rf.object_name,
                    rf.manufacturer,
                    rf.model,
                    rf.category_id,
                    rf.category,
                    rf.location,
                    rf.location_id,
                    NVL(ih.invoice_count, 0) AS invoice_count,
                    ih.last_invoice_date,
                    TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) AS days_since_invoice,
                    CASE WHEN orr.rn = 1 THEN orr.open_so_number END AS current_so,
                    CASE WHEN orr.rn = 1 THEN orr.current_customer END AS current_customer,
                    NVL(aso.total_so_count, 0) AS total_so_count,
                    CASE
                        WHEN orr.rn = 1 AND NVL(ih.invoice_count, 0) = 0 THEN 'On Rent'
                        WHEN NVL(ih.invoice_count, 0) = 0 AND NVL(aso.total_so_count, 0) = 0 THEN 'Never Rented'
                        ELSE 'Available'
                    END AS rental_status,
                    CASE WHEN orr.rn = 1 THEN 'Y' ELSE 'N' END AS has_open_so,
                    CASE
                        WHEN ih.last_invoice_date IS NULL THEN 'Never'
                        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 30 THEN '1 Month'
                        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 90 THEN '3 Months'
                        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 180 THEN '6 Months'
                        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 365 THEN '12 Months'
                        ELSE '12+ Months'
                    END AS time_bucket
                FROM RentalFleet rf
                LEFT JOIN InvoiceHistory ih ON rf.object_id = ih.object_id
                LEFT JOIN OpenRentals orr ON rf.object_id = orr.object_id AND orr.rn = 1
                LEFT JOIN AllSOs aso ON rf.object_id = aso.object_id
            `;

            // Add filters if specified
            var whereClauses = [];

            if (params.custpage_location) {
                whereClauses.push(`rf.location_id = ${params.custpage_location}`);
            }

            if (params.custpage_eq_category) {
                whereClauses.push(`rf.category_id = ${params.custpage_eq_category}`);
            }

            if (whereClauses.length > 0) {
                sql += ` WHERE ` + whereClauses.join(' AND ');
            }

            sql += `
                ORDER BY
                    CASE
                        WHEN orr.rn = 1 THEN 3
                        WHEN NVL(ih.invoice_count, 0) = 0 AND NVL(aso.total_so_count, 0) = 0 THEN 1
                        ELSE 2
                    END,
                    CASE
                        WHEN ih.last_invoice_date IS NULL THEN 99999
                        ELSE TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date)
                    END DESC,
                    rf.fleet_code
            `;

            return sql;
        }

        /**
         * Checks if a result matches the selected time bucket filter
         */
        function matchesTimeBucket(row, bucketFilter) {
            var status = row.rental_status;
            var bucket = row.time_bucket;

            switch (bucketFilter) {
                case 'NEVER':
                    return status === 'Never Rented';
                case 'ON_RENT':
                    return status === 'On Rent';
                case '12PLUS':
                    return bucket === '12+ Months' && status === 'Available';
                case '6TO12':
                    return bucket === '12 Months' && status === 'Available';
                case '3TO6':
                    return bucket === '6 Months' && status === 'Available';
                case '1TO3':
                    return bucket === '3 Months' && status === 'Available';
                case 'UNDER1':
                    return bucket === '1 Month' && status === 'Available';
                default:
                    return true;
            }
        }

        /**
         * Displays search results
         */
        function displayResults(form, results, params) {
            if (!results || results.length === 0) {
                var noResultsField = form.addField({
                    id: 'custpage_no_results',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'No Results'
                });
                noResultsField.defaultValue =
                    '<div class="info-box" style="background: #fff3cd; border-left-color: #ffc107;">' +
                    '<strong>No equipment found</strong><br/>' +
                    'No rental fleet equipment matches your search criteria. Try adjusting your filters.' +
                    '</div>';
                return;
            }

            // Calculate statistics
            var stats = calculateStatistics(results);

            // Display statistics banner
            displayStatistics(form, stats, params);

            // Add export button
            addExportButton(form, params);

            // Create results sublist
            createResultsSublist(form, results);
        }

        /**
         * Calculates statistics from results
         */
        function calculateStatistics(results) {
            var stats = {
                total: results.length,
                neverRented: 0,
                onRent: 0,
                months12Plus: 0,
                months6to12: 0,
                months3to6: 0,
                months1to3: 0,
                under1Month: 0
            };

            for (var i = 0; i < results.length; i++) {
                var r = results[i];

                if (r.rentalStatus === 'Never Rented') {
                    stats.neverRented++;
                } else if (r.rentalStatus === 'On Rent') {
                    stats.onRent++;
                } else {
                    // Available - categorize by time bucket
                    switch (r.timeBucket) {
                        case '12+ Months':
                            stats.months12Plus++;
                            break;
                        case '12 Months':
                            stats.months6to12++;
                            break;
                        case '6 Months':
                            stats.months3to6++;
                            break;
                        case '3 Months':
                            stats.months1to3++;
                            break;
                        case '1 Month':
                            stats.under1Month++;
                            break;
                    }
                }
            }

            return stats;
        }

        /**
         * Displays statistics banner
         */
        function displayStatistics(form, stats, params) {
            var statsField = form.addField({
                id: 'custpage_stats',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Statistics'
            });

            var html = '<div class="stats-container">';

            // Total
            html += createStatsBox(stats.total, 'Total Equipment', '#6c757d');

            // Never Rented (red)
            html += createStatsBox(stats.neverRented, 'Never Rented', CONFIG.COLORS.NEVER_RENTED);

            // 12+ Months (orange)
            html += createStatsBox(stats.months12Plus, '12+ Months', CONFIG.COLORS.MONTHS_12_PLUS);

            // 6-12 Months (yellow)
            html += createStatsBox(stats.months6to12, '6-12 Months', CONFIG.COLORS.MONTHS_6_12);

            // 3-6 Months (light yellow)
            html += createStatsBox(stats.months3to6, '3-6 Months', '#b8860b');

            // 1-3 Months (light green)
            html += createStatsBox(stats.months1to3, '1-3 Months', '#28a745');

            // Under 1 Month (green)
            html += createStatsBox(stats.under1Month, '<1 Month', CONFIG.COLORS.UNDER_1_MONTH);

            // On Rent (blue)
            html += createStatsBox(stats.onRent, 'On Rent', CONFIG.COLORS.ON_RENT);

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
         * Adds CSV export button
         */
        function addExportButton(form, params) {
            var exportField = form.addField({
                id: 'custpage_export_btn',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Export'
            });

            var exportUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId,
                params: {
                    export: 'csv',
                    custpage_time_bucket: params.custpage_time_bucket || '',
                    custpage_location: params.custpage_location || '',
                    custpage_eq_category: params.custpage_eq_category || '',
                    custpage_manufacturer: params.custpage_manufacturer || '',
                    custpage_search: params.custpage_search || ''
                }
            });

            exportField.defaultValue =
                '<div style="margin: 15px 0;">' +
                '<a href="' + exportUrl + '" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">' +
                'Export to CSV' +
                '</a>' +
                '</div>';
        }

        /**
         * Creates the results sublist
         */
        function createResultsSublist(form, results) {
            var sublist = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'Equipment Results (' + results.length + ' items)'
            });

            // Add columns
            sublist.addField({
                id: 'custpage_status',
                type: serverWidget.FieldType.TEXT,
                label: 'Status'
            });

            sublist.addField({
                id: 'custpage_fleet_code',
                type: serverWidget.FieldType.TEXT,
                label: 'Fleet Code'
            });

            sublist.addField({
                id: 'custpage_days_idle',
                type: serverWidget.FieldType.TEXT,
                label: 'Days Idle'
            });

            sublist.addField({
                id: 'custpage_last_rental',
                type: serverWidget.FieldType.TEXT,
                label: 'Last Rental'
            });

            sublist.addField({
                id: 'custpage_location',
                type: serverWidget.FieldType.TEXT,
                label: 'Location'
            });

            sublist.addField({
                id: 'custpage_serial',
                type: serverWidget.FieldType.TEXT,
                label: 'Serial'
            });

            sublist.addField({
                id: 'custpage_manufacturer',
                type: serverWidget.FieldType.TEXT,
                label: 'Manufacturer'
            });

            sublist.addField({
                id: 'custpage_model',
                type: serverWidget.FieldType.TEXT,
                label: 'Model'
            });

            sublist.addField({
                id: 'custpage_category',
                type: serverWidget.FieldType.TEXT,
                label: 'Category'
            });

            sublist.addField({
                id: 'custpage_customer',
                type: serverWidget.FieldType.TEXT,
                label: 'Customer'
            });

            sublist.addField({
                id: 'custpage_invoice_count',
                type: serverWidget.FieldType.TEXT,
                label: 'Total Rentals'
            });

            var viewCol = sublist.addField({
                id: 'custpage_view',
                type: serverWidget.FieldType.URL,
                label: 'View'
            });
            viewCol.linkText = 'View';

            // Populate sublist (limit to 1000 for performance)
            var displayLimit = Math.min(results.length, 1000);

            for (var i = 0; i < displayLimit; i++) {
                var r = results[i];

                try {
                    // Status badge
                    sublist.setSublistValue({
                        id: 'custpage_status',
                        line: i,
                        value: getStatusBadge(r.rentalStatus, r.timeBucket, r.daysSinceInvoice, r.hasOpenSO)
                    });

                    // Fleet code
                    sublist.setSublistValue({
                        id: 'custpage_fleet_code',
                        line: i,
                        value: r.fleetCode || 'N/A'
                    });

                    // Days idle
                    var daysIdle = r.rentalStatus === 'Never Rented' ? 'Never' :
                                   r.rentalStatus === 'On Rent' ? 'On Rent' :
                                   (r.daysSinceInvoice !== null ? r.daysSinceInvoice + ' days' : 'N/A');
                    sublist.setSublistValue({
                        id: 'custpage_days_idle',
                        line: i,
                        value: daysIdle
                    });

                    // Last rental date
                    var lastRental = r.lastInvoiceDate ? formatDate(r.lastInvoiceDate) : 'Never';
                    sublist.setSublistValue({
                        id: 'custpage_last_rental',
                        line: i,
                        value: lastRental
                    });

                    // Location
                    sublist.setSublistValue({
                        id: 'custpage_location',
                        line: i,
                        value: r.location || 'N/A'
                    });

                    // Serial
                    sublist.setSublistValue({
                        id: 'custpage_serial',
                        line: i,
                        value: r.serial || 'N/A'
                    });

                    // Manufacturer
                    sublist.setSublistValue({
                        id: 'custpage_manufacturer',
                        line: i,
                        value: r.manufacturer || 'N/A'
                    });

                    // Model
                    sublist.setSublistValue({
                        id: 'custpage_model',
                        line: i,
                        value: r.model || 'N/A'
                    });

                    // Category
                    sublist.setSublistValue({
                        id: 'custpage_category',
                        line: i,
                        value: r.category || 'N/A'
                    });

                    // Customer (if on rent) - only set if there's a value
                    if (r.currentCustomer) {
                        sublist.setSublistValue({
                            id: 'custpage_customer',
                            line: i,
                            value: r.currentCustomer
                        });
                    }

                    // Invoice count
                    sublist.setSublistValue({
                        id: 'custpage_invoice_count',
                        line: i,
                        value: String(r.invoiceCount)
                    });

                    // View link
                    var viewUrl = url.resolveRecord({
                        recordType: 'customrecord_nx_asset',
                        recordId: r.assetId,
                        isEditMode: false
                    });
                    sublist.setSublistValue({
                        id: 'custpage_view',
                        line: i,
                        value: viewUrl
                    });

                } catch (e) {
                    log.error({
                        title: 'Error setting sublist value',
                        details: 'Line ' + i + ': ' + e.toString()
                    });
                }
            }

            // Add note if results were limited
            if (results.length > 1000) {
                var limitNote = form.addField({
                    id: 'custpage_limit_note',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Note'
                });
                limitNote.defaultValue =
                    '<div class="info-box" style="background: #fff3cd; border-left-color: #ffc107;">' +
                    '<strong>Note:</strong> Displaying first 1,000 of ' + results.length + ' results. ' +
                    'Use the Export to CSV button to download all results.' +
                    '</div>';
            }
        }

        /**
         * Gets the status text label
         */
        function getStatusBadge(status, timeBucket, daysSinceInvoice, hasOpenSO) {
            var label = '';

            if (status === 'Never Rented') {
                label = 'NEVER RENTED';
            } else if (status === 'On Rent') {
                label = 'ON RENT (New)';
            } else {
                // Available - determine label by days
                if (daysSinceInvoice === null) {
                    label = 'NEVER RENTED';
                } else if (daysSinceInvoice > 365) {
                    label = '12+ MONTHS';
                } else if (daysSinceInvoice > 180) {
                    label = '6-12 MONTHS';
                } else if (daysSinceInvoice > 90) {
                    label = '3-6 MONTHS';
                } else if (daysSinceInvoice > 30) {
                    label = '1-3 MONTHS';
                } else {
                    label = 'UNDER 1 MONTH';
                }

                // Append indicator if equipment has open SO but old invoice
                if (hasOpenSO) {
                    label += ' (On SO)';
                }
            }

            return label;
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
         * Exports results to CSV
         */
        function exportToCSV(context) {
            try {
                var params = context.request.parameters;
                var results = searchIdleEquipment(params);

                var csvContent = generateCSV(results);

                var csvFile = file.create({
                    name: 'idle_equipment_' + format.format({
                        value: new Date(),
                        type: format.Type.DATE
                    }).replace(/\//g, '-') + '.csv',
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
        function generateCSV(results) {
            var csvLines = [];

            // Header row
            csvLines.push([
                'Fleet Code',
                'Serial Number',
                'Manufacturer',
                'Model',
                'Category',
                'Location',
                'Rental Status',
                'Days Since Last Rental',
                'Last Rental Date',
                'Total Rental Invoices',
                'Current Customer',
                'Current SO',
                'Asset ID'
            ].join(','));

            // Data rows
            for (var i = 0; i < results.length; i++) {
                var r = results[i];
                csvLines.push([
                    '"' + (r.fleetCode || '').replace(/"/g, '""') + '"',
                    '"' + (r.serial || '').replace(/"/g, '""') + '"',
                    '"' + (r.manufacturer || '').replace(/"/g, '""') + '"',
                    '"' + (r.model || '').replace(/"/g, '""') + '"',
                    '"' + (r.category || '').replace(/"/g, '""') + '"',
                    '"' + (r.location || '').replace(/"/g, '""') + '"',
                    '"' + (r.rentalStatus || '').replace(/"/g, '""') + '"',
                    r.daysSinceInvoice !== null ? r.daysSinceInvoice : 'Never',
                    r.lastInvoiceDate ? formatDate(r.lastInvoiceDate) : 'Never',
                    r.invoiceCount,
                    '"' + (r.currentCustomer || '').replace(/"/g, '""') + '"',
                    '"' + (r.currentSO || '').replace(/"/g, '""') + '"',
                    r.assetId
                ].join(','));
            }

            return csvLines.join('\n');
        }

        return {
            onRequest: onRequest
        };
    }
);
