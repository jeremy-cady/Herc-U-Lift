/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

/**
 * Idle Equipment Alert - Weekly Email Notification
 *
 * Purpose: Sends weekly email alerts to the Rental team about idle equipment
 * that hasn't been rented in configurable time periods.
 *
 * Schedule: Weekly (Monday 7:00 AM recommended)
 *
 * Script Parameters:
 * - custscript_idle_eq_sender: Sender employee internal ID (required)
 * - custscript_idle_eq_recipients: Email recipients (comma-separated)
 * - custscript_idle_eq_cc: CC recipients (comma-separated)
 * - custscript_idle_eq_send_empty: Send report even if no idle equipment
 * - custscript_idle_eq_threshold_attention: Days threshold for "attention" bucket (default: 90)
 * - custscript_idle_eq_threshold_critical: Days threshold for "critical" bucket (default: 180)
 *
 * @see Documentation/PRDs/PRD-20251125-IdleEquipmentTracker.md
 *
 * Version: 1.0
 * Date: November 2025
 */

define(['N/query', 'N/email', 'N/runtime', 'N/format', 'N/url'],
    function(query, email, runtime, format, url) {

        /**
         * Configuration
         */
        const CONFIG = {
            COLORS: {
                CRITICAL: '#dc3545',
                ATTENTION: '#fd7e14',
                WATCH: '#ffc107',
                NEVER_RENTED: '#dc3545'
            },
            DEFAULT_THRESHOLDS: {
                ATTENTION: 90,
                CRITICAL: 180
            }
        };

        /**
         * Main execution entry point
         */
        function execute(context) {
            try {
                log.audit('Idle Equipment Alert', 'Starting execution');

                var script = runtime.getCurrentScript();
                var params = getScriptParameters(script);

                // Debug log all parameters
                log.debug('Script Parameters', JSON.stringify({
                    senderId: params.senderId,
                    senderIdType: typeof params.senderId,
                    recipients: params.recipients,
                    thresholds: params.thresholds
                }));

                // Validate we have a sender
                if (!params.senderId) {
                    log.error('Idle Equipment Alert', 'No sender employee ID configured. Exiting.');
                    return;
                }

                // Validate we have recipients
                if (!params.recipients || params.recipients.length === 0) {
                    log.error('Idle Equipment Alert', 'No recipients configured. Exiting.');
                    return;
                }

                // Get all idle equipment
                var equipmentData = getIdleEquipment();

                // Categorize by severity
                var categorized = categorizeEquipment(equipmentData, params.thresholds);

                // Check if we should send (only if there's idle equipment or sendEmpty is true)
                if (!hasIdleEquipment(categorized) && !params.sendEmpty) {
                    log.audit('Idle Equipment Alert', 'No idle equipment found and sendEmpty is false. Skipping email.');
                    return;
                }

                // Generate and send email
                var emailBody = generateEmailBody(categorized, params);
                sendEmailReport(params, emailBody, categorized);

                log.audit('Idle Equipment Alert', 'Completed successfully. Sent to: ' + params.recipients.join(', '));

            } catch (e) {
                log.error({
                    title: 'Idle Equipment Alert Error',
                    details: e.toString() + '\n' + (e.stack || '')
                });
            }
        }

        /**
         * Gets script parameters
         */
        function getScriptParameters(script) {
            var recipientStr = script.getParameter({ name: 'custscript_idle_eq_recipients' }) || '';
            var ccStr = script.getParameter({ name: 'custscript_idle_eq_cc' }) || '';
            var senderId = script.getParameter({ name: 'custscript_idle_eq_sender' });

            return {
                senderId: senderId,
                recipients: parseEmailList(recipientStr),
                cc: parseEmailList(ccStr),
                sendEmpty: script.getParameter({ name: 'custscript_idle_eq_send_empty' }) === true,
                thresholds: {
                    attention: parseInt(script.getParameter({ name: 'custscript_idle_eq_threshold_attention' })) || CONFIG.DEFAULT_THRESHOLDS.ATTENTION,
                    critical: parseInt(script.getParameter({ name: 'custscript_idle_eq_threshold_critical' })) || CONFIG.DEFAULT_THRESHOLDS.CRITICAL
                }
            };
        }

        /**
         * Parses comma-separated email list
         */
        function parseEmailList(str) {
            if (!str) return [];
            return str.split(',')
                .map(function(e) { return e.trim(); })
                .filter(function(e) { return e.length > 0; });
        }

        /**
         * Gets all idle equipment using SuiteQL
         */
        function getIdleEquipment() {
            var sql = `
                WITH RentalFleet AS (
                    SELECT
                        a.id AS asset_id,
                        a.custrecord_sna_hul_fleetcode AS fleet_code,
                        a.custrecord_nx_asset_serial AS serial,
                        o.id AS object_id,
                        BUILTIN.DF(a.cseg_hul_mfg) AS manufacturer,
                        BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
                        BUILTIN.DF(a.cseg_sna_hul_eq_seg) AS category,
                        BUILTIN.DF(o.custrecord_sna_responsibility_center) AS location
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
                        MAX(t.trandate) AS last_invoice_date
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
                    rf.fleet_code,
                    rf.serial,
                    rf.manufacturer,
                    rf.model,
                    rf.category,
                    rf.location,
                    NVL(ih.invoice_count, 0) AS invoice_count,
                    ih.last_invoice_date,
                    TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) AS days_since_invoice,
                    CASE
                        WHEN orr.rn = 1 AND NVL(ih.invoice_count, 0) = 0 THEN 'On Rent'
                        WHEN NVL(ih.invoice_count, 0) = 0 AND NVL(aso.total_so_count, 0) = 0 THEN 'Never Rented'
                        ELSE 'Available'
                    END AS rental_status
                FROM RentalFleet rf
                LEFT JOIN InvoiceHistory ih ON rf.object_id = ih.object_id
                LEFT JOIN OpenRentals orr ON rf.object_id = orr.object_id AND orr.rn = 1
                LEFT JOIN AllSOs aso ON rf.object_id = aso.object_id
                WHERE NOT (orr.rn = 1 AND NVL(ih.invoice_count, 0) = 0)  -- Exclude new rentals (open SO, no invoices yet)
                ORDER BY
                    CASE
                        WHEN NVL(ih.invoice_count, 0) = 0 AND NVL(aso.total_so_count, 0) = 0 THEN 1
                        ELSE 2
                    END,
                    CASE
                        WHEN ih.last_invoice_date IS NULL THEN 99999
                        ELSE TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date)
                    END DESC
            `;

            try {
                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                log.debug('getIdleEquipment', 'Found ' + results.length + ' idle equipment records');
                return results;
            } catch (e) {
                log.error('getIdleEquipment Error', e.toString());
                return [];
            }
        }

        /**
         * Categorizes equipment by severity
         */
        function categorizeEquipment(equipment, thresholds) {
            var categorized = {
                critical: [],
                attention: [],
                watch: [],
                neverRented: []
            };

            for (var i = 0; i < equipment.length; i++) {
                var eq = equipment[i];

                if (eq.rental_status === 'Never Rented') {
                    categorized.neverRented.push(eq);
                } else if (eq.days_since_invoice >= thresholds.critical) {
                    categorized.critical.push(eq);
                } else if (eq.days_since_invoice >= thresholds.attention) {
                    categorized.attention.push(eq);
                } else if (eq.days_since_invoice >= 30) {
                    categorized.watch.push(eq);
                }
            }

            return categorized;
        }

        /**
         * Checks if there's any idle equipment to report
         */
        function hasIdleEquipment(categorized) {
            return categorized.critical.length > 0 ||
                   categorized.attention.length > 0 ||
                   categorized.watch.length > 0 ||
                   categorized.neverRented.length > 0;
        }

        /**
         * Generates the email HTML body
         */
        function generateEmailBody(categorized, params) {
            var today = format.format({
                value: new Date(),
                type: format.Type.DATE
            });

            var totalIdle = categorized.critical.length +
                           categorized.attention.length +
                           categorized.watch.length +
                           categorized.neverRented.length;

            var html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .summary-box { padding: 15px; margin-bottom: 20px; border-radius: 4px; }
                        .summary-box.critical { background-color: #f8d7da; border-left: 4px solid #dc3545; }
                        .summary-box.attention { background-color: #fff3cd; border-left: 4px solid #fd7e14; }
                        .summary-box.watch { background-color: #d1ecf1; border-left: 4px solid #17a2b8; }
                        .summary-box.info { background-color: #e2e3e5; border-left: 4px solid #6c757d; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                        th { background-color: #0066cc; color: white; padding: 10px; text-align: left; }
                        td { padding: 8px; border: 1px solid #ddd; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                        .stats { display: inline-block; padding: 10px 20px; margin: 5px; background: #f8f9fa; border-radius: 8px; text-align: center; }
                        .stats-number { font-size: 24px; font-weight: bold; }
                        .stats-label { font-size: 12px; color: #666; }
                        h2 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Rental Fleet Idle Equipment Report</h1>

                    <div class="summary-box info">
                        <strong>Report Date:</strong> ${today}<br/>
                        <strong>Equipment Requiring Attention:</strong> ${totalIdle}
                    </div>

                    <div style="margin: 20px 0;">
                        <div class="stats" style="border-left: 4px solid #dc3545;">
                            <div class="stats-number" style="color: #dc3545;">${categorized.neverRented.length}</div>
                            <div class="stats-label">Never Rented</div>
                        </div>
                        <div class="stats" style="border-left: 4px solid #dc3545;">
                            <div class="stats-number" style="color: #dc3545;">${categorized.critical.length}</div>
                            <div class="stats-label">Critical (${params.thresholds.critical}+ days)</div>
                        </div>
                        <div class="stats" style="border-left: 4px solid #fd7e14;">
                            <div class="stats-number" style="color: #fd7e14;">${categorized.attention.length}</div>
                            <div class="stats-label">Attention (${params.thresholds.attention}+ days)</div>
                        </div>
                        <div class="stats" style="border-left: 4px solid #17a2b8;">
                            <div class="stats-number" style="color: #17a2b8;">${categorized.watch.length}</div>
                            <div class="stats-label">Watch (30+ days)</div>
                        </div>
                    </div>
            `;

            // Never Rented Section
            if (categorized.neverRented.length > 0) {
                html += `
                    <div class="summary-box critical">
                        <h2 style="color: #dc3545; margin-top: 0;">NEVER RENTED (${categorized.neverRented.length})</h2>
                        <p>Equipment that has never been on a rental contract. Consider:</p>
                        <ul>
                            <li>Marketing/promotional pricing</li>
                            <li>Relocating to higher-demand location</li>
                            <li>Disposition review</li>
                        </ul>
                    </div>
                    ${generateEquipmentTable(categorized.neverRented, false)}
                `;
            }

            // Critical Section
            if (categorized.critical.length > 0) {
                html += `
                    <div class="summary-box critical">
                        <h2 style="color: #dc3545; margin-top: 0;">CRITICAL - ${params.thresholds.critical}+ Days Idle (${categorized.critical.length})</h2>
                        <p>Equipment requiring immediate review.</p>
                    </div>
                    ${generateEquipmentTable(categorized.critical, true)}
                `;
            }

            // Attention Section
            if (categorized.attention.length > 0) {
                html += `
                    <div class="summary-box attention">
                        <h2 style="color: #fd7e14; margin-top: 0;">ATTENTION - ${params.thresholds.attention}+ Days Idle (${categorized.attention.length})</h2>
                    </div>
                    ${generateEquipmentTable(categorized.attention, true)}
                `;
            }

            // Watch Section
            if (categorized.watch.length > 0) {
                html += `
                    <div class="summary-box watch">
                        <h2 style="color: #17a2b8; margin-top: 0;">WATCH - 30+ Days Idle (${categorized.watch.length})</h2>
                    </div>
                    ${generateEquipmentTable(categorized.watch, true)}
                `;
            }

            // Footer
            html += `
                    <hr/>
                    <p style="font-size: 12px; color: #666;">
                        This is an automated report generated by the Idle Equipment Alert Script.<br/>
                        To configure thresholds or recipients, contact your NetSuite administrator.
                    </p>
                </body>
                </html>
            `;

            return html;
        }

        /**
         * Generates an equipment table HTML
         */
        function generateEquipmentTable(equipment, showDays) {
            if (equipment.length === 0) return '';

            var html = `
                <table>
                    <tr>
                        <th>Fleet Code</th>
                        <th>Serial</th>
                        <th>Manufacturer</th>
                        <th>Model</th>
                        <th>Category</th>
                        <th>Location</th>
                        ${showDays ? '<th>Days Idle</th>' : ''}
                        ${showDays ? '<th>Last Rental</th>' : ''}
                    </tr>
            `;

            // Limit to first 50 items in email
            var displayCount = Math.min(equipment.length, 50);

            for (var i = 0; i < displayCount; i++) {
                var eq = equipment[i];
                var lastRental = eq.last_invoice_date ? formatDate(eq.last_invoice_date) : 'Never';

                html += `
                    <tr>
                        <td>${eq.fleet_code || 'N/A'}</td>
                        <td>${eq.serial || 'N/A'}</td>
                        <td>${eq.manufacturer || 'N/A'}</td>
                        <td>${eq.model || 'N/A'}</td>
                        <td>${eq.category || 'N/A'}</td>
                        <td>${eq.location || 'N/A'}</td>
                        ${showDays ? '<td>' + (eq.days_since_invoice || 'N/A') + '</td>' : ''}
                        ${showDays ? '<td>' + lastRental + '</td>' : ''}
                    </tr>
                `;
            }

            html += '</table>';

            if (equipment.length > 50) {
                html += `<p><em>Showing first 50 of ${equipment.length} items. View full report in NetSuite.</em></p>`;
            }

            return html;
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
         * Sends the email report
         */
        function sendEmailReport(params, emailBody, categorized) {
            var totalCritical = categorized.critical.length + categorized.neverRented.length;
            var subject = '[Weekly] Rental Fleet Idle Equipment Report - ' +
                          format.format({ value: new Date(), type: format.Type.DATE }) +
                          (totalCritical > 0 ? ' (' + totalCritical + ' Critical)' : '');

            // Send to first recipient, CC others
            var primaryRecipient = params.recipients[0];
            var ccList = params.recipients.slice(1).concat(params.cc);

            var authorId = parseInt(params.senderId, 10);
            log.debug('Sending Email', 'Author ID: ' + authorId + ', Recipient: ' + primaryRecipient);

            email.send({
                author: authorId,
                recipients: primaryRecipient,
                cc: ccList.length > 0 ? ccList : null,
                subject: subject,
                body: emailBody
            });

            log.audit('Email Sent', {
                to: primaryRecipient,
                cc: ccList,
                subject: subject,
                criticalCount: totalCritical
            });
        }

        return {
            execute: execute
        };
    }
);
