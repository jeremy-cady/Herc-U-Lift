/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

/**
 * Backdated Time Entry Report - Scheduled Script
 * 
 * Purpose: Automatically runs daily to identify and report on backdated time entries
 * Sends email notifications to specified recipients
 * 
 * Schedule: Daily at 7:00 AM
 * 
 * Author: [Your Name]
 * Date: 2025-10-21
 */

define(['N/search', 'N/email', 'N/runtime', 'N/format', 'N/file', 'N/render'],
    function(search, email, runtime, format, file, render) {

        /**
         * Main execution function
         */
        function execute(context) {
            try {
                log.audit({
                    title: 'Backdated Time Entry Report Started',
                    details: 'Beginning daily backdated time entry analysis'
                });

                var script = runtime.getCurrentScript();
                
                // Get script parameters
                var emailRecipients = script.getParameter({
                    name: 'custscript_btr_email_recipients'
                }) || '';
                
                var minDaysDiff = script.getParameter({
                    name: 'custscript_btr_min_days_diff'
                }) || 1;

                var lookbackDays = script.getParameter({
                    name: 'custscript_btr_lookback_days'
                }) || 1;

                var sendEmptyReport = script.getParameter({
                    name: 'custscript_btr_send_empty_report'
                }) || false;

                // Calculate date range - check entries created in the last N days
                var dateTo = new Date();
                var dateFrom = new Date();
                dateFrom.setDate(dateFrom.getDate() - lookbackDays);

                // Search for backdated entries
                var results = searchBackdatedTimeEntries(dateFrom, dateTo, minDaysDiff);

                log.audit({
                    title: 'Search Completed',
                    details: 'Found ' + results.length + ' backdated time entries'
                });

                // Send email if results found (or if sendEmptyReport is true)
                if (results.length > 0 || sendEmptyReport) {
                    sendEmailReport(emailRecipients, results, dateFrom, dateTo, minDaysDiff);
                }

                // Save results to file cabinet for historical tracking
                if (results.length > 0) {
                    saveResultsToFile(results, dateFrom, dateTo);
                }

                log.audit({
                    title: 'Backdated Time Entry Report Completed',
                    details: 'Successfully processed ' + results.length + ' records'
                });

            } catch (e) {
                log.error({
                    title: 'Error in execute',
                    details: e.toString() + '\n' + JSON.stringify(e)
                });
                
                // Send error notification
                sendErrorNotification(e);
            }
        }

        /**
         * Searches for backdated time entries
         */
        function searchBackdatedTimeEntries(dateFrom, dateTo, minDaysDiff) {
            var results = [];
            
            try {
                var dateFromFormatted = format.format({
                    value: dateFrom,
                    type: format.Type.DATE
                });
                
                var dateToFormatted = format.format({
                    value: dateTo,
                    type: format.Type.DATE
                });

                var filters = [
                    ['type', 'anyof', 'TimeBill'],
                    'AND',
                    ['datecreated', 'within', dateFromFormatted, dateToFormatted],
                    'AND',
                    ['formulanumeric: CASE WHEN {datecreated} != {trandate} THEN 1 ELSE 0 END', 'equalto', '1']
                ];

                var columns = [
                    search.createColumn({ name: 'internalid' }),
                    search.createColumn({ name: 'tranid' }),
                    search.createColumn({ name: 'trandate' }),
                    search.createColumn({ name: 'datecreated' }),
                    search.createColumn({ name: 'employee' }),
                    search.createColumn({ name: 'customer' }),
                    search.createColumn({ name: 'casetaskevent' }),
                    search.createColumn({ name: 'hours' }),
                    search.createColumn({ name: 'item' }),
                    search.createColumn({ name: 'class' }),
                    search.createColumn({ name: 'location' }),
                    search.createColumn({ name: 'department' }),
                    search.createColumn({ name: 'memo' }),
                    search.createColumn({ name: 'subsidiary' }),
                    search.createColumn({
                        name: 'formulanumeric',
                        formula: '{datecreated} - {trandate}',
                        label: 'Days Difference'
                    })
                ];

                var timeSearch = search.create({
                    type: search.Type.TRANSACTION,
                    filters: filters,
                    columns: columns
                });

                var pagedData = timeSearch.runPaged({
                    pageSize: 1000
                });

                var minDays = parseInt(minDaysDiff);

                pagedData.pageRanges.forEach(function(pageRange) {
                    var page = pagedData.fetch({ index: pageRange.index });
                    
                    page.data.forEach(function(result) {
                        var daysDiff = Math.abs(parseFloat(result.getValue({ name: 'formulanumeric' }) || 0));
                        
                        if (daysDiff >= minDays) {
                            results.push({
                                internalId: result.getValue({ name: 'internalid' }),
                                tranId: result.getValue({ name: 'tranid' }),
                                tranDate: result.getValue({ name: 'trandate' }),
                                dateCreated: result.getValue({ name: 'datecreated' }),
                                daysDifference: daysDiff,
                                employee: result.getText({ name: 'employee' }),
                                employeeId: result.getValue({ name: 'employee' }),
                                customer: result.getText({ name: 'customer' }),
                                customerId: result.getValue({ name: 'customer' }),
                                caseTaskEvent: result.getText({ name: 'casetaskevent' }),
                                hours: result.getValue({ name: 'hours' }),
                                serviceItem: result.getText({ name: 'item' }),
                                class: result.getText({ name: 'class' }),
                                location: result.getText({ name: 'location' }),
                                department: result.getText({ name: 'department' }),
                                memo: result.getValue({ name: 'memo' }),
                                subsidiary: result.getText({ name: 'subsidiary' })
                            });
                        }
                    });
                });

                // Sort by days difference (descending) then by employee
                results.sort(function(a, b) {
                    if (b.daysDifference !== a.daysDifference) {
                        return b.daysDifference - a.daysDifference;
                    }
                    return (a.employee || '').localeCompare(b.employee || '');
                });

            } catch (e) {
                log.error({
                    title: 'Error in searchBackdatedTimeEntries',
                    details: e.toString()
                });
                throw e;
            }

            return results;
        }

        /**
         * Sends email report to specified recipients
         */
        function sendEmailReport(recipients, results, dateFrom, dateTo, minDaysDiff) {
            try {
                if (!recipients) {
                    log.audit({
                        title: 'No Email Recipients',
                        details: 'Email recipients not configured. Skipping email.'
                    });
                    return;
                }

                var recipientArray = recipients.split(',').map(function(email) {
                    return email.trim();
                }).filter(function(email) {
                    return email.length > 0;
                });

                if (recipientArray.length === 0) {
                    return;
                }

                var subject = 'Backdated Time Entry Report - ' + format.format({
                    value: new Date(),
                    type: format.Type.DATE
                });

                if (results.length > 0) {
                    subject += ' (' + results.length + ' entries found)';
                } else {
                    subject += ' (No entries found)';
                }

                var body = generateEmailBody(results, dateFrom, dateTo, minDaysDiff);

                // Send email to each recipient
                recipientArray.forEach(function(recipient) {
                    email.send({
                        author: runtime.getCurrentUser().id,
                        recipients: recipient,
                        subject: subject,
                        body: body
                    });

                    log.audit({
                        title: 'Email Sent',
                        details: 'Report sent to: ' + recipient
                    });
                });

            } catch (e) {
                log.error({
                    title: 'Error sending email',
                    details: e.toString()
                });
            }
        }

        /**
         * Generates HTML email body
         */
        function generateEmailBody(results, dateFrom, dateTo, minDaysDiff) {
            var html = '<html><head><style>' +
                'body { font-family: Arial, sans-serif; font-size: 14px; }' +
                'table { border-collapse: collapse; width: 100%; margin-top: 20px; }' +
                'th { background-color: #0066cc; color: white; padding: 10px; text-align: left; border: 1px solid #ddd; }' +
                'td { padding: 8px; border: 1px solid #ddd; }' +
                'tr:nth-child(even) { background-color: #f2f2f2; }' +
                '.summary { background-color: #f0f8ff; padding: 15px; border-left: 4px solid #0066cc; margin-bottom: 20px; }' +
                '.alert { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-bottom: 20px; }' +
                '.success { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin-bottom: 20px; }' +
                '</style></head><body>';

            html += '<h2>Backdated Time Entry Report</h2>';

            html += '<div class="summary">';
            html += '<strong>Report Parameters:</strong><br/>';
            html += 'Date Created Range: ' + format.format({ value: dateFrom, type: format.Type.DATE }) + 
                    ' to ' + format.format({ value: dateTo, type: format.Type.DATE }) + '<br/>';
            html += 'Minimum Days Difference: ' + minDaysDiff + '<br/>';
            html += 'Report Generated: ' + format.format({ value: new Date(), type: format.Type.DATETIME }) + '<br/>';
            html += '</div>';

            if (results.length === 0) {
                html += '<div class="success">';
                html += '<strong>No backdated time entries found!</strong><br/>';
                html += 'All time entries were created on the same day as their transaction date.';
                html += '</div>';
            } else {
                html += '<div class="alert">';
                html += '<strong>Found ' + results.length + ' backdated time entries</strong><br/>';
                html += 'These entries were created on a different date than their transaction date.';
                html += '</div>';

                // Summary by employee
                var employeeSummary = {};
                results.forEach(function(result) {
                    if (!employeeSummary[result.employee]) {
                        employeeSummary[result.employee] = {
                            count: 0,
                            totalHours: 0,
                            maxDaysDiff: 0
                        };
                    }
                    employeeSummary[result.employee].count++;
                    employeeSummary[result.employee].totalHours += parseFloat(result.hours || 0);
                    employeeSummary[result.employee].maxDaysDiff = Math.max(
                        employeeSummary[result.employee].maxDaysDiff,
                        result.daysDifference
                    );
                });

                html += '<h3>Summary by Employee</h3>';
                html += '<table>';
                html += '<tr><th>Employee</th><th>Backdated Entries</th><th>Total Hours</th><th>Max Days Backdated</th></tr>';
                
                Object.keys(employeeSummary).sort().forEach(function(empName) {
                    var emp = employeeSummary[empName];
                    html += '<tr>';
                    html += '<td>' + empName + '</td>';
                    html += '<td>' + emp.count + '</td>';
                    html += '<td>' + emp.totalHours.toFixed(2) + '</td>';
                    html += '<td>' + Math.round(emp.maxDaysDiff) + '</td>';
                    html += '</tr>';
                });
                html += '</table>';

                // Detailed results
                html += '<h3>Detailed Results</h3>';
                html += '<table>';
                html += '<tr>' +
                    '<th>Days Backdated</th>' +
                    '<th>Employee</th>' +
                    '<th>Transaction Date</th>' +
                    '<th>Date Created</th>' +
                    '<th>Hours</th>' +
                    '<th>Customer</th>' +
                    '<th>Case/Task</th>' +
                    '<th>Location</th>' +
                    '<th>Memo</th>' +
                    '</tr>';

                results.forEach(function(result) {
                    html += '<tr>';
                    html += '<td><strong>' + Math.round(result.daysDifference) + '</strong></td>';
                    html += '<td>' + (result.employee || '') + '</td>';
                    html += '<td>' + (result.tranDate || '') + '</td>';
                    html += '<td>' + (result.dateCreated || '') + '</td>';
                    html += '<td>' + (result.hours || '0') + '</td>';
                    html += '<td>' + (result.customer || '') + '</td>';
                    html += '<td>' + (result.caseTaskEvent || '') + '</td>';
                    html += '<td>' + (result.location || '') + '</td>';
                    html += '<td>' + (result.memo || '') + '</td>';
                    html += '</tr>';
                });

                html += '</table>';
            }

            html += '<hr style="margin-top: 30px;"/>';
            html += '<p style="font-size: 12px; color: #666;">';
            html += 'This is an automated report generated by the Backdated Time Entry Report script.<br/>';
            html += 'To view individual records in NetSuite, go to Transactions > Time Tracking > Time Entries.';
            html += '</p>';

            html += '</body></html>';

            return html;
        }

        /**
         * Saves results to a file in the file cabinet
         */
        function saveResultsToFile(results, dateFrom, dateTo) {
            try {
                var csvContent = generateCSV(results);
                var fileName = 'backdated_time_report_' + 
                    format.format({ value: new Date(), type: format.Type.DATE }).replace(/\//g, '-') + 
                    '.csv';

                var fileObj = file.create({
                    name: fileName,
                    fileType: file.Type.CSV,
                    contents: csvContent,
                    folder: getFolderId() // You'll need to set this up
                });

                var fileId = fileObj.save();

                log.audit({
                    title: 'File Saved',
                    details: 'Results saved to file ID: ' + fileId
                });

            } catch (e) {
                log.error({
                    title: 'Error saving file',
                    details: e.toString()
                });
            }
        }

        /**
         * Gets the folder ID for saving reports
         * You'll need to create a folder in File Cabinet and update this
         */
        function getFolderId() {
            // TODO: Update with your folder ID
            // Navigate to Documents > Files > File Cabinet
            // Create a folder called "Backdated Time Reports"
            // Replace the number below with that folder's internal ID
            return -15; // Default to SuiteScripts folder, update as needed
        }

        /**
         * Generates CSV content
         */
        function generateCSV(results) {
            var csvLines = [];
            
            csvLines.push([
                'Internal ID',
                'Days Backdated',
                'Employee',
                'Transaction Date',
                'Date Created',
                'Hours',
                'Customer',
                'Case/Task/Event',
                'Service Item',
                'Location',
                'Class',
                'Department',
                'Memo',
                'Subsidiary'
            ].join(','));

            results.forEach(function(result) {
                csvLines.push([
                    result.internalId,
                    Math.round(result.daysDifference),
                    '"' + (result.employee || '').replace(/"/g, '""') + '"',
                    result.tranDate,
                    result.dateCreated,
                    result.hours,
                    '"' + (result.customer || '').replace(/"/g, '""') + '"',
                    '"' + (result.caseTaskEvent || '').replace(/"/g, '""') + '"',
                    '"' + (result.serviceItem || '').replace(/"/g, '""') + '"',
                    '"' + (result.location || '').replace(/"/g, '""') + '"',
                    '"' + (result.class || '').replace(/"/g, '""') + '"',
                    '"' + (result.department || '').replace(/"/g, '""') + '"',
                    '"' + (result.memo || '').replace(/"/g, '""') + '"',
                    '"' + (result.subsidiary || '').replace(/"/g, '""') + '"'
                ].join(','));
            });

            return csvLines.join('\n');
        }

        /**
         * Sends error notification email
         */
        function sendErrorNotification(error) {
            try {
                var script = runtime.getCurrentScript();
                var recipients = script.getParameter({
                    name: 'custscript_btr_email_recipients'
                });

                if (!recipients) {
                    return;
                }

                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: recipients,
                    subject: 'ERROR: Backdated Time Entry Report Failed',
                    body: 'The Backdated Time Entry Report script encountered an error:\n\n' +
                        error.toString() + '\n\n' +
                        'Please check the script logs for more details.'
                });

            } catch (e) {
                log.error({
                    title: 'Error sending error notification',
                    details: e.toString()
                });
            }
        }

        return {
            execute: execute
        };
    }
);
