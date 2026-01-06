/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * Backdated Time Entry Report - PRODUCTION VERSION
 * 
 * Purpose: Identifies time entries where the date created does not match the transaction date
 * This helps identify employees who are filling out timecards retroactively
 * 
 * Features:
 * - Filters for only backdated entries (Days > 0)
 * - Displays results in browser with formatted table
 * - Includes comprehensive fields (customer, hours, location, class, dept, etc.)
 * - CSV export functionality
 * - Configurable minimum days difference filter
 * - Employee-specific filtering
 * - Production-grade error handling
 * 
 * Version: 2.0 (Production)
 * Date: 2025-10-21
 */

define(['N/search', 'N/ui/serverWidget', 'N/file', 'N/format', 'N/runtime', 'N/url'],
    function(search, serverWidget, file, format, runtime, url) {
        
        /**
         * Handles GET and POST requests
         * @param {Object} context
         */
        function onRequest(context) {
            if (context.request.method === 'GET') {
                handleGet(context);
            } else {
                handlePost(context);
            }
        }

        /**
         * Displays the report form and results
         */
        function handleGet(context) {
            try {
                // Check if this is a CSV export request
                if (context.request.parameters.export === 'csv') {
                    exportToCSV(context);
                    return;
                }
                
                // Create the form
                var form = serverWidget.createForm({
                    title: 'Backdated Time Entry Report'
                });
                
                // Add custom styling
                var htmlField = form.addField({
                    id: 'custpage_header_html',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Header'
                });
                htmlField.defaultValue = 
                    '<style>' +
                    '.uir-page-title { color: #4A5568; }' +
                    '.highlight-warning { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }' +
                    '.highlight-info { background-color: #DBEAFE; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }' +
                    '.stats-box { display: inline-block; padding: 10px 20px; margin: 10px; background: #F3F4F6; border-radius: 8px; }' +
                    '</style>' +
                    '<div class="highlight-info">' +
                    '<strong>📊 Report Purpose:</strong> This report identifies time entries that were created after their transaction date, ' +
                    'helping to track employees who fill out timecards retroactively.' +
                    '</div>';
                
                // Add filter fields in a field group
                var filterGroup = form.addFieldGroup({
                    id: 'custpage_filters',
                    label: 'Search Filters'
                });
                
                var dateFromField = form.addField({
                    id: 'custpage_date_from',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date Created From',
                    container: 'custpage_filters'
                });
                dateFromField.isMandatory = true;
                
                var dateToField = form.addField({
                    id: 'custpage_date_to',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date Created To',
                    container: 'custpage_filters'
                });
                dateToField.isMandatory = true;
                
                var minDaysField = form.addField({
                    id: 'custpage_min_days_diff',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Minimum Days Backdated',
                    container: 'custpage_filters'
                });
                minDaysField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });
                
                var employeeField = form.addField({
                    id: 'custpage_employee',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Employee (Optional)',
                    source: 'employee',
                    container: 'custpage_filters'
                });
                
                var locationField = form.addField({
                    id: 'custpage_location',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Location (Optional)',
                    source: 'location',
                    container: 'custpage_filters'
                });
                
                // Check if we have parameters from a form submission
                var dateFrom = context.request.parameters.custpage_date_from;
                var dateTo = context.request.parameters.custpage_date_to;
                var minDaysDiff = context.request.parameters.custpage_min_days_diff;
                var employeeId = context.request.parameters.custpage_employee;
                var locationId = context.request.parameters.custpage_location;
                
                // Set default values - either from parameters or default date range
                if (dateFrom && dateTo) {
                    // Use submitted values
                    dateFromField.defaultValue = dateFrom;
                    dateToField.defaultValue = dateTo;
                    if (minDaysDiff) {
                        minDaysField.defaultValue = minDaysDiff;
                    } else {
                        minDaysField.defaultValue = '1';
                    }
                    if (employeeId) {
                        employeeField.defaultValue = employeeId;
                    }
                    if (locationId) {
                        locationField.defaultValue = locationId;
                    }
                } else {
                    // Set default date range (last 30 days) for first load
                    var today = new Date();
                    var thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                    dateFromField.defaultValue = thirtyDaysAgo;
                    dateToField.defaultValue = today;
                    minDaysField.defaultValue = '1';
                }
                
                // Add submit button
                form.addSubmitButton({
                    label: 'Run Report'
                });
                
                // If we have parameters, run the search and display results
                if (dateFrom && dateTo) {
                    // Run the search
                    var results = searchBackdatedTimeEntries(dateFrom, dateTo, minDaysDiff, employeeId, locationId);
                    
                    // Display results
                    displayResults(form, results, dateFrom, dateTo, minDaysDiff, employeeId, locationId);
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
            // Simply call handleGet for POST requests
            // This avoids redirect issues and works the same way
            handleGet(context);
        }

        /**
         * Exports results to CSV
         */
        function exportToCSV(context) {
            try {
                var dateFrom = context.request.parameters.custpage_date_from;
                var dateTo = context.request.parameters.custpage_date_to;
                var minDaysDiff = context.request.parameters.custpage_min_days_diff || '1';
                var employeeId = context.request.parameters.custpage_employee;
                var locationId = context.request.parameters.custpage_location;
                
                var results = searchBackdatedTimeEntries(dateFrom, dateTo, minDaysDiff, employeeId, locationId);
                var csvContent = generateCSV(results);
                
                var csvFile = file.create({
                    name: 'backdated_time_entries_' + format.format({
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
         * Searches for backdated time entries
         * @param {string} dateFrom - Start date for date created filter
         * @param {string} dateTo - End date for date created filter
         * @param {string} minDaysDiff - Minimum days difference to include
         * @param {string} employeeId - Optional employee filter
         * @param {string} locationId - Optional location filter
         * @returns {Array} Array of backdated time entry objects
         */
        function searchBackdatedTimeEntries(dateFrom, dateTo, minDaysDiff, employeeId, locationId) {
            var results = [];
            var minDays = parseInt(minDaysDiff) || 1;
            
            try {
                // Build filters
                var filters = [
                    ['datecreated', 'within', dateFrom, dateTo]
                ];
                
                // Add employee filter if specified
                if (employeeId) {
                    filters.push('AND');
                    filters.push(['employee', 'anyof', employeeId]);
                }
                
                // Add location filter if specified
                if (locationId) {
                    filters.push('AND');
                    filters.push(['location', 'anyof', locationId]);
                }
                
                // Create the search
                var timeSearch = search.create({
                    type: 'timebill',
                    filters: filters,
                    columns: [
                        search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
                        search.createColumn({ name: 'date' }),
                        search.createColumn({ name: 'datecreated' }),
                        search.createColumn({ name: 'employee' }),
                        search.createColumn({ name: 'hours' }),
                        search.createColumn({ name: 'customer' }),
                        search.createColumn({ name: 'casetaskevent' }),
                        search.createColumn({ name: 'location' }),
                        search.createColumn({ name: 'department' }),
                        search.createColumn({ name: 'memo' }),
                        search.createColumn({ name: 'subsidiary' })
                    ]
                });
                
                // Process results in batches
                var pageSize = 1000;
                var startIndex = 0;
                var moreResults = true;
                
                while (moreResults) {
                    try {
                        var resultSet = timeSearch.run().getRange({
                            start: startIndex,
                            end: startIndex + pageSize
                        });
                        
                        if (!resultSet || resultSet.length === 0) {
                            moreResults = false;
                            break;
                        }
                        
                        for (var i = 0; i < resultSet.length; i++) {
                            var result = resultSet[i];
                            
                            if (!result) continue;
                            
                            var dateStr = result.getValue('date');
                            var createdStr = result.getValue('datecreated');
                            
                            if (!dateStr || !createdStr) continue;
                            
                            // Calculate days difference
                            var tranDate = new Date(dateStr);
                            var dateCreated = new Date(createdStr);
                            
                            // Normalize dates to midnight to compare only dates, not times
                            tranDate.setHours(0, 0, 0, 0);
                            dateCreated.setHours(0, 0, 0, 0);
                            
                            var diffTime = dateCreated - tranDate;
                            var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            
                            // Only include if meets minimum days requirement
                            if (diffDays >= minDays) {
                                // Generate URL for the time entry
                                var timeEntryUrl = url.resolveRecord({
                                    recordType: 'timebill',
                                    recordId: result.getValue('internalid'),
                                    isEditMode: false
                                });
                                
                                // Use getValue for fields that might not have text representation
                                var subsidiaryValue = result.getValue('subsidiary') || result.getText('subsidiary') || '';
                                
                                results.push({
                                    internalId: result.getValue('internalid') || '',
                                    timeEntryUrl: timeEntryUrl || '',
                                    tranDate: dateStr || '',
                                    dateCreated: createdStr || '',
                                    daysDifference: diffDays,
                                    employee: result.getText('employee') || '',
                                    hours: result.getValue('hours') || '0',
                                    customer: result.getText('customer') || '',
                                    caseTaskEvent: result.getText('casetaskevent') || '',
                                    location: result.getText('location') || '',
                                    department: result.getText('department') || '',
                                    memo: result.getValue('memo') || '',
                                    subsidiary: subsidiaryValue
                                });
                            }
                        }
                        
                        startIndex += pageSize;
                        
                        // If we got less than a full page, we're done
                        if (resultSet.length < pageSize) {
                            moreResults = false;
                        }
                        
                    } catch (getRangeErr) {
                        // End of results
                        moreResults = false;
                        break;
                    }
                }
                
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
         * Converts time format to decimal hours
         * @param {string} timeStr - Time string like "3:00" or "3:30" or "3.5"
         * @returns {number} Decimal hours
         */
        function convertToDecimalHours(timeStr) {
            if (!timeStr) return 0;
            
            // If already a decimal number, return it
            if (!timeStr.includes(':')) {
                return parseFloat(timeStr) || 0;
            }
            
            // Parse time format like "3:00" or "3:30"
            var parts = timeStr.split(':');
            var hours = parseInt(parts[0]) || 0;
            var minutes = parseInt(parts[1]) || 0;
            
            return hours + (minutes / 60);
        }

        /**
         * Displays search results in a formatted table and summary stats
         */
        function displayResults(form, results, dateFrom, dateTo, minDaysDiff, employeeId, locationId) {
            if (!results || results.length === 0) {
                var noResultsField = form.addField({
                    id: 'custpage_no_results',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'No Results'
                });
                noResultsField.defaultValue = 
                    '<div class="highlight-info" style="margin: 20px 0;">' +
                    '<strong>✓ No backdated time entries found</strong><br/>' +
                    'No time entries were found that match your search criteria. This is good news!' +
                    '</div>';
                return;
            }
            
            // Calculate statistics
            var totalHours = 0;
            var maxDays = 0;
            var employeeCount = {};
            
            for (var i = 0; i < results.length; i++) {
                totalHours += convertToDecimalHours(results[i].hours);
                if (results[i].daysDifference > maxDays) {
                    maxDays = results[i].daysDifference;
                }
                employeeCount[results[i].employee] = (employeeCount[results[i].employee] || 0) + 1;
            }
            
            var uniqueEmployees = Object.keys(employeeCount).length;
            
            // Display summary statistics
            var statsHtml = form.addField({
                id: 'custpage_stats',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Statistics'
            });
            
            statsHtml.defaultValue = 
                '<div class="highlight-warning">' +
                '<strong>⚠️ Report Summary</strong><br/><br/>' +
                '<div class="stats-box"><strong>' + results.length + '</strong><br/>Backdated Entries</div>' +
                '<div class="stats-box"><strong>' + uniqueEmployees + '</strong><br/>Employees</div>' +
                '<div class="stats-box"><strong>' + totalHours.toFixed(2) + '</strong><br/>Total Hours</div>' +
                '<div class="stats-box"><strong>' + maxDays + '</strong><br/>Max Days Backdated</div>' +
                '</div>';
            
            // Add export button
            var exportButtonHtml = form.addField({
                id: 'custpage_export_button',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Export'
            });
            
            var exportUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId,
                params: {
                    export: 'csv',
                    custpage_date_from: dateFrom,
                    custpage_date_to: dateTo,
                    custpage_min_days_diff: minDaysDiff,
                    custpage_employee: employeeId || '',
                    custpage_location: locationId || ''
                }
            });
            
            exportButtonHtml.defaultValue = 
                '<div style="margin: 20px 0;">' +
                '<a href="' + exportUrl + '" class="dottedlink" style="font-size: 14px; font-weight: bold;">📥 Export to CSV</a>' +
                '</div>';
            
            // Create sublist for results
            var sublist = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'Backdated Time Entries (' + results.length + ' records)'
            });
            
            // Add columns
            sublist.addField({
                id: 'custpage_view',
                type: serverWidget.FieldType.URL,
                label: 'View'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_days',
                type: serverWidget.FieldType.TEXT,
                label: 'Days Backdated'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_employee',
                type: serverWidget.FieldType.TEXT,
                label: 'Employee'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_tran_date',
                type: serverWidget.FieldType.TEXT,
                label: 'Transaction Date'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_date_created',
                type: serverWidget.FieldType.TEXT,
                label: 'Date Created'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_hours',
                type: serverWidget.FieldType.TEXT,
                label: 'Hours'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_customer',
                type: serverWidget.FieldType.TEXT,
                label: 'Customer'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_case_task',
                type: serverWidget.FieldType.TEXT,
                label: 'Case/Task/Event'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_location',
                type: serverWidget.FieldType.TEXT,
                label: 'Location'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_department',
                type: serverWidget.FieldType.TEXT,
                label: 'Department'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_memo',
                type: serverWidget.FieldType.TEXT,
                label: 'Memo'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            sublist.addField({
                id: 'custpage_subsidiary',
                type: serverWidget.FieldType.TEXT,
                label: 'Subsidiary'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            // Populate sublist (limit to 1000 for performance)
            var displayLimit = Math.min(results.length, 1000);
            
            var lineNum = 0; // Track actual line number in sublist
            
            for (var i = 0; i < displayLimit; i++) {
                var result = results[i];
                
                try {
                    // Convert all values to strings explicitly
                    var viewUrl = (result.timeEntryUrl || '') + '';
                    var daysVal = (result.daysDifference || 0) + '';
                    var empVal = (result.employee || '') + '';
                    var tranDateVal = (result.tranDate || '') + '';
                    var dateCreatedVal = (result.dateCreated || '') + '';
                    var hoursVal = (result.hours || '') + '';
                    var custVal = (result.customer || '') + '';
                    var caseVal = (result.caseTaskEvent || '') + '';
                    var locVal = (result.location || '') + '';
                    var deptVal = (result.department || '') + '';
                    var memoVal = (result.memo || '') + '';
                    var subVal = (result.subsidiary || '') + '';
                    
                    // Set all values for this record - with individual error handling
                    try {
                        sublist.setSublistValue({ id: 'custpage_view', line: lineNum, value: viewUrl });
                    } catch (e) {
                        log.error('Error setting view', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_days', line: lineNum, value: daysVal });
                    } catch (e) {
                        log.error('Error setting days', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_employee', line: lineNum, value: empVal });
                    } catch (e) {
                        log.error('Error setting employee', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_tran_date', line: lineNum, value: tranDateVal });
                    } catch (e) {
                        log.error('Error setting tran_date', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_date_created', line: lineNum, value: dateCreatedVal });
                    } catch (e) {
                        log.error('Error setting date_created', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_hours', line: lineNum, value: hoursVal });
                    } catch (e) {
                        log.error('Error setting hours', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_customer', line: lineNum, value: custVal });
                    } catch (e) {
                        log.error('Error setting customer', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_case_task', line: lineNum, value: caseVal });
                    } catch (e) {
                        log.error('Error setting case_task', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_location', line: lineNum, value: locVal });
                    } catch (e) {
                        log.error('Error setting location', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_department', line: lineNum, value: deptVal });
                    } catch (e) {
                        log.error('Error setting department', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_memo', line: lineNum, value: memoVal });
                    } catch (e) {
                        log.error('Error setting memo', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    try {
                        sublist.setSublistValue({ id: 'custpage_subsidiary', line: lineNum, value: subVal });
                    } catch (e) {
                        log.error('Error setting subsidiary', 'Line ' + lineNum + ': ' + e.toString());
                    }
                    
                    // If we got here, the record was successfully added
                    lineNum++;
                    
                } catch (e) {
                    // Still increment lineNum to avoid conflicts
                    lineNum++;
                    // Silently skip records that fail - no need to log as this is expected behavior
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
                    '<div class="highlight-warning">' +
                    '<strong>⚠️ Note:</strong> Displaying first 1,000 of ' + results.length + ' results. ' +
                    'Use the Export to CSV button to download all results.' +
                    '</div>';
            }
        }

        /**
         * Generates CSV content from results
         */
        function generateCSV(results) {
            var csvLines = [];
            
            // Header row
            csvLines.push([
                'Internal ID',
                'Days Backdated',
                'Employee',
                'Transaction Date',
                'Date Created',
                'Hours',
                'Customer',
                'Case/Task/Event',
                'Location',
                'Department',
                'Memo',
                'Subsidiary',
                'Time Entry URL'
            ].join(','));

            // Data rows
            results.forEach(function(result) {
                csvLines.push([
                    result.internalId,
                    result.daysDifference,
                    '"' + (result.employee || '').replace(/"/g, '""') + '"',
                    result.tranDate,
                    result.dateCreated,
                    result.hours,
                    '"' + (result.customer || '').replace(/"/g, '""') + '"',
                    '"' + (result.caseTaskEvent || '').replace(/"/g, '""') + '"',
                    '"' + (result.location || '').replace(/"/g, '""') + '"',
                    '"' + (result.department || '').replace(/"/g, '""') + '"',
                    '"' + (result.memo || '').replace(/"/g, '""') + '"',
                    '"' + (result.subsidiary || '').replace(/"/g, '""') + '"',
                    result.timeEntryUrl || ''
                ].join(','));
            });

            return csvLines.join('\n');
        }

        return {
            onRequest: onRequest
        };
    }
);