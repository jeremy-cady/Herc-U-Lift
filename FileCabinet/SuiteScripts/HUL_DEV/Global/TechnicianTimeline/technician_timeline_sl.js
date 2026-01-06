/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * Technician Task Timeline Suitelet
 * 
 * Purpose: Visualize technician daily task start/completion patterns to identify
 *          batch completion behavior vs. proper sequential task completion
 * 
 * Phase: 1 - MVP
 * 
 * Features:
 * - Single technician, single day timeline view
 * - Visual timeline with task bars (green = sequential, red = overlapping)
 * - Interactive tooltips and click-through to task records
 * 
 * Record Type: task
 * Custom Fields: custevent_nx_task_start, custevent_nx_task_end
 * 
 * Author: Development Team
 * Date: October 22, 2025
 */

define(['N/search', 'N/ui/serverWidget', 'N/format', 'N/runtime', 'N/url'],
    function(search, serverWidget, format, runtime, url) {
        
        /**
         * Main request handler
         * @param {Object} context
         */
        function onRequest(context) {
            // Handle both GET and POST requests
            // POST happens when user clicks submit button
            if (context.request.method === 'GET' || context.request.method === 'POST') {
                handleGet(context);
            }
        }

        /**
         * Handles GET requests - displays the form and timeline
         */
        function handleGet(context) {
            try {
                var form = serverWidget.createForm({
                    title: 'Technician Task Timeline Viewer'
                });

                // Add filter fields
                addFilterFields(form, context);

                // Check if we need to display results
                var selectedDate = context.request.parameters.custpage_date;
                var selectedLocation = context.request.parameters.custpage_location;
                var selectedTech = context.request.parameters.custpage_technician;

                if (selectedDate && (selectedTech || selectedLocation)) {
                    // Get list of technicians to display
                    var technicians = [];
                    
                    if (selectedTech) {
                        // Single technician selected
                        technicians.push(selectedTech);
                    } else if (selectedLocation) {
                        // Location selected - get all technicians from that location
                        technicians = getTechniciansForLocation(selectedLocation);
                    }
                    
                    if (technicians.length === 0) {
                        // No technicians found
                        var noTechField = form.addField({
                            id: 'custpage_notechs',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Notice'
                        });
                        noTechField.defaultValue = '<div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; margin: 20px 0;">' +
                            '<h3> No Technicians Found</h3>' +
                            '<p>No technicians found for the selected location. Please select a different location or specific technician.</p>' +
                            '</div>';
                    } else {
                        // Fetch and display timelines for all selected technicians
                        addMultipleTechnicianTimelines(form, technicians, selectedDate, selectedLocation);
                    }
                } else {
                    // Add instructions
                    var instructionField = form.addField({
                        id: 'custpage_instructions',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Instructions'
                    });
                    instructionField.defaultValue = '<div style="padding: 20px; background: #f0f8ff; border: 1px solid #0066cc; border-radius: 4px; margin: 20px 0;">' +
                        '<h3> Welcome to the Technician Task Timeline</h3>' +
                        '<p>This tool helps you visualize how technicians complete their daily tasks:</p>' +
                        '<ul>' +
                        '<li><strong style="color: #28a745;"> Green bars</strong> = Tasks completed sequentially (proper workflow)</li>' +
                        '<li><strong style="color: #2196F3;"> Blue bars</strong> = Tasks with overlapping time periods at the same customer (multi-truck service)</li>' +
                        '<li><strong style="color: #dc3545;"> Red bars</strong> = Tasks with overlapping time periods at different customers (batch completion)</li>' +
                        '</ul>' +
                        '<p><strong>To view a timeline:</strong></p>' +
                        '<ol>' +
                        '<li>Select a <strong>Date</strong></li>' +
                        '<li><strong>Option A:</strong> Select a specific technician, OR</li>' +
                        '<li><strong>Option B:</strong> Select a location to view all technicians from that location</li>' +
                        '<li>Click <strong>"View Timeline"</strong></li>' +
                        '</ol>' +
                        '<p style="margin-top: 15px; font-size: 13px; color: #666;"> <strong>Tip:</strong> Use the location filter to see all technicians from St. Cloud, Maple Plain, Grand Rapids, or Sioux Falls at once!</p>' +
                        '</div>';
                }

                // Add submit button
                form.addSubmitButton({
                    label: 'View Timeline'
                });

                context.response.writePage(form);

            } catch (e) {
                log.error({
                    title: 'Error in handleGet',
                    details: e.toString() + '\n' + e.stack
                });
                
                var errorForm = serverWidget.createForm({
                    title: 'Error'
                });
                var errorField = errorForm.addField({
                    id: 'custpage_error',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Error'
                });
                errorField.defaultValue = '<div style="color: red; padding: 20px;">' +
                    '<h3>An error occurred</h3>' +
                    '<p>' + e.toString() + '</p>' +
                    '</div>';
                context.response.writePage(errorForm);
            }
        }

        /**
         * Add filter fields to the form
         */
        function addFilterFields(form, context) {
            // Get current values from request
            var currentDate = context.request.parameters.custpage_date || '';
            var currentLocation = context.request.parameters.custpage_location || '';
            var currentTech = context.request.parameters.custpage_technician || '';
            
            // Date field
            var dateField = form.addField({
                id: 'custpage_date',
                type: serverWidget.FieldType.DATE,
                label: 'Date'
            });
            dateField.isMandatory = false;
            if (currentDate) {
                dateField.defaultValue = currentDate;
            }

            // Location dropdown
            var locationField = form.addField({
                id: 'custpage_location',
                type: serverWidget.FieldType.SELECT,
                label: 'Location (Optional)'
            });
            locationField.addSelectOption({
                value: '',
                text: '- All Locations -'
            });
            
            // Load all active locations
            try {
                log.audit('Location Search', 'Starting location search...');
                
                var locationSearch = search.create({
                    type: search.Type.LOCATION,
                    filters: [
                        ['isinactive', search.Operator.IS, 'F']
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
                        search.createColumn({ name: 'name' })
                        // Removed parent column - not available in all NetSuite configurations
                    ]
                });

                var locationCount = 0;
                var searchResults = locationSearch.run();
                
                searchResults.each(function(result) {
                    var locId = result.getValue('internalid');
                    var locName = result.getValue('name');
                    
                    log.debug('Location Found', 'ID: ' + locId + ', Name: ' + locName);
                    
                    locationField.addSelectOption({
                        value: locId,
                        text: locName
                    });
                    
                    locationCount++;
                    return true;
                });
                
                if (locationCount === 0) {
                    log.error('No Locations Found', 'The location search returned 0 results. This may indicate: 1) All locations are inactive, 2) No locations exist in the system, or 3) User lacks permission to view locations.');
                    
                    locationField.addSelectOption({
                        value: 'none',
                        text: ' No locations found - Check permissions'
                    });
                } else {
                    log.audit('Locations Loaded', locationCount + ' locations loaded successfully');
                }
                
            } catch (e) {
                log.error('Error loading locations', 'Error: ' + e.toString() + '\nStack: ' + e.stack);
                locationField.addSelectOption({
                    value: 'error',
                    text: ' Error loading locations - Check log'
                });
            }
            
            if (currentLocation) {
                locationField.defaultValue = currentLocation;
            }

            // Technician dropdown
            var techField = form.addField({
                id: 'custpage_technician',
                type: serverWidget.FieldType.SELECT,
                label: 'Technician (Optional)'
            });
            techField.addSelectOption({
                value: '',
                text: '- All Technicians -'
            });

            // Load technicians - filtered by location if selected
            try {
                var empFilters = [
                    ['isinactive', search.Operator.IS, 'F']
                ];
                
                // If location is selected, filter by location
                if (currentLocation) {
                    empFilters.push('AND');
                    empFilters.push(['location', search.Operator.ANYOF, currentLocation]);
                }
                
                var employeeSearch = search.create({
                    type: search.Type.EMPLOYEE,
                    filters: empFilters,
                    columns: [
                        search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
                        search.createColumn({ name: 'entityid' })
                    ]
                });

                employeeSearch.run().each(function(result) {
                    var empId = result.getValue('internalid');
                    var empName = result.getValue('entityid');
                    
                    techField.addSelectOption({
                        value: empId,
                        text: empName
                    });
                    
                    return true;
                });
            } catch (e) {
                log.error('Error loading technicians', e.toString());
            }
            
            if (currentTech) {
                techField.defaultValue = currentTech;
            }
        }

        /**
         * Get all technicians for a given location (including child locations)
         * @param {string} locationId - Location internal ID
         * @returns {Array} Array of technician IDs
         */
        function getTechniciansForLocation(locationId) {
            var technicians = [];
            
            try {
                // Step 1: Find all child locations under this location
                var locationIds = [locationId]; // Include the parent location itself
                
                try {
                    var childLocationSearch = search.create({
                        type: search.Type.LOCATION,
                        filters: [
                            ['isinactive', search.Operator.IS, 'F'],
                            'AND',
                            ['parent', search.Operator.ANYOF, locationId]
                        ],
                        columns: ['internalid']
                    });
                    
                    childLocationSearch.run().each(function(result) {
                        locationIds.push(result.getValue('internalid'));
                        return true;
                    });
                    
                    log.debug('Child Locations Found', locationIds.length + ' total locations (parent + children) for location ' + locationId + ': ' + locationIds.join(','));
                } catch (e) {
                    log.error('Error finding child locations', e.toString());
                    // Continue with just the parent location
                }
                
                // Step 2: Find all employees in any of these locations
                log.debug('Searching for employees', 'Location IDs: ' + JSON.stringify(locationIds));
                
                var empSearch = search.create({
                    type: search.Type.EMPLOYEE,
                    filters: [
                        ['isinactive', search.Operator.IS, 'F'],
                        'AND',
                        ['location', 'anyof', locationIds] // Using string 'anyof' instead of Operator enum
                    ],
                    columns: ['internalid', 'entityid', 'location']
                });

                empSearch.run().each(function(result) {
                    var empId = result.getValue('internalid');
                    var empName = result.getValue('entityid');
                    var empLocation = result.getText('location');
                    
                    log.debug('Technician Found', 'ID: ' + empId + ', Name: ' + empName + ', Location: ' + empLocation);
                    technicians.push(empId);
                    return true;
                });
                
                log.audit('Technicians for Location', technicians.length + ' technicians found across ' + locationIds.length + ' location(s)');
            } catch (e) {
                log.error('Error getting technicians for location', e.toString());
            }
            
            return technicians;
        }

        /**
         * Add timelines for multiple technicians
         * @param {Object} form - NetSuite form object
         * @param {Array} technicianIds - Array of technician internal IDs
         * @param {string} selectedDate - Date string
         * @param {string} locationId - Optional location ID for display
         */
        function addMultipleTechnicianTimelines(form, technicianIds, selectedDate, locationId) {
            var totalTasks = 0;
            var techniciansWithTasks = 0;
            var MAX_TECHNICIANS_TO_DISPLAY = 40; // Increased limit
            var techniciansDisplayed = 0;
            
            // Build all timeline HTML in a single string
            var combinedHTML = '';
            
            // Add summary header
            var locationName = locationId ? getLocationName(locationId) : 'All Locations';
            
            combinedHTML += '<div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; margin: 20px 0;">' +
                '<h3 style="margin: 0 0 10px 0; color: #1976d2;"> Timeline Summary</h3>' +
                '<p style="margin: 0;"><strong>Location:</strong> ' + escapeHtml(locationName) + '</p>' +
                '<p style="margin: 5px 0;"><strong>Date:</strong> ' + escapeHtml(selectedDate) + '</p>' +
                '<p style="margin: 5px 0;"><strong>Total Technicians at Location:</strong> ' + technicianIds.length + '</p>' +
                '</div>';
            
            // For large locations (>50 technicians), use optimized approach
            if (technicianIds.length > 50) {
                log.audit('Large Location Detected', 'Using optimized task-first approach for ' + technicianIds.length + ' technicians');
                
                try {
                    // Parse date for formula
                    var targetDate = format.parse({
                        value: selectedDate,
                        type: format.Type.DATE
                    });
                    // Zero-pad month and day to match TO_CHAR format (MM/DD/YYYY)
                    var month = targetDate.getMonth() + 1;
                    var day = targetDate.getDate();
                    var year = targetDate.getFullYear();
                    var searchDateStr = (month < 10 ? '0' : '') + month + '/' +
                                       (day < 10 ? '0' : '') + day + '/' + year;
                    
                    // Search for all tasks on this date, filtered by our location's technicians
                    var taskSearch = search.create({
                        type: 'task',
                        filters: [
                            ['custevent_nx_task_start', search.Operator.ISNOTEMPTY, ''],
                            'AND',
                            ['custevent_nx_task_end', search.Operator.ISNOTEMPTY, ''],
                            'AND',
                            ['formulanumeric: CASE WHEN TO_CHAR({custevent_nx_task_start}, \'MM/DD/YYYY\') = \'' + searchDateStr + '\' THEN 1 ELSE 0 END', search.Operator.EQUALTO, '1'],
                            'AND',
                            ['assigned', 'anyof', technicianIds] // Filter by our location's techs
                        ],
                        columns: [
                            'assigned',
                            'internalid'
                        ]
                    });
                    
                    // Get unique technician IDs who have tasks
                    var techsWithTasksObj = {};
                    var taskCount = 0;
                    
                    taskSearch.run().each(function(result) {
                        var techId = result.getValue('assigned');
                        if (techId) {
                            techsWithTasksObj[techId] = true;
                            taskCount++;
                        }
                        return true;
                    });
                    
                    var techsWithTasks = Object.keys(techsWithTasksObj);
                    techniciansWithTasks = techsWithTasks.length;
                    
                    log.audit('Optimized Search Results', techniciansWithTasks + ' technicians found with ' + taskCount + ' tasks');
                    
                    // Now display timelines for technicians who have tasks (up to max)
                    for (var i = 0; i < techsWithTasks.length && techniciansDisplayed < MAX_TECHNICIANS_TO_DISPLAY; i++) {
                        var techId = techsWithTasks[i];
                        
                        try {
                            var tasks = searchTasks(selectedDate, techId);
                            
                            if (tasks.length > 0) {
                                totalTasks += tasks.length;
                                
                                var techName = getTechnicianName(techId);
                                var tasksWithRows = calculateTaskRows(tasks);
                                var tasksWithOverlaps = detectOverlapsForColoring(tasksWithRows);
                                
                                combinedHTML += generateTimelineHTML(tasksWithOverlaps, selectedDate, techName);
                                techniciansDisplayed++;
                            }
                        } catch (e) {
                            log.error('Error loading timeline for technician ' + techId, e.toString());
                        }
                    }
                    
                } catch (e) {
                    log.error('Error in optimized search', e.toString());
                    combinedHTML += '<div style="padding: 15px; background: #fee; border-left: 4px solid #f44; margin: 20px 0;">' +
                        '<p><strong> Error:</strong> Unable to load timelines for this large location. Please select a specific technician.</p>' +
                        '</div>';
                }
                
            } else {
                // Original approach for smaller locations
                for (var i = 0; i < technicianIds.length; i++) {
                    var techId = technicianIds[i];
                    
                    try {
                        var tasks = searchTasks(selectedDate, techId);
                        
                        if (tasks.length > 0) {
                            techniciansWithTasks++;
                            totalTasks += tasks.length;
                            
                            if (techniciansDisplayed < MAX_TECHNICIANS_TO_DISPLAY) {
                                var techName = getTechnicianName(techId);
                                var tasksWithRows = calculateTaskRows(tasks);
                                var tasksWithOverlaps = detectOverlapsForColoring(tasksWithRows);
                                
                                combinedHTML += generateTimelineHTML(tasksWithOverlaps, selectedDate, techName);
                                techniciansDisplayed++;
                            }
                        }
                    } catch (e) {
                        log.error('Error loading timeline for technician ' + techId, e.toString());
                    }
                }
            }
            
            // Add final summary
            combinedHTML += '<div style="padding: 15px; background: #f1f8e9; border-left: 4px solid #8bc34a; margin: 20px 0;">' +
                '<h3 style="margin: 0 0 10px 0; color: #558b2f;">Results</h3>' +
                '<p style="margin: 0;"><strong>' + techniciansWithTasks + '</strong> technician(s) completed tasks on this date</p>' +
                '<p style="margin: 5px 0;"><strong>Displayed:</strong> ' + techniciansDisplayed + ' of ' + techniciansWithTasks + '</p>' +
                '<p style="margin: 5px 0;"><strong>Total Tasks:</strong> ' + totalTasks + '</p>';
            
            if (techniciansWithTasks > MAX_TECHNICIANS_TO_DISPLAY) {
                combinedHTML += '<p style="margin: 10px 0 0 0; padding: 10px; background: #fff3cd; border-radius: 4px;"><strong> Note:</strong> Showing first ' + MAX_TECHNICIANS_TO_DISPLAY + ' of ' + techniciansWithTasks + ' technicians who completed tasks. Use the Technician dropdown to view a specific technician.</p>';
            }
            
            combinedHTML += '</div>';
            
            // Create a SINGLE field with all the combined HTML
            var allTimelinesField = form.addField({
                id: 'custpage_all_timelines',
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            });
            
            allTimelinesField.defaultValue = combinedHTML;
        }

        /**
         * Get location name from ID
         * @param {string} locationId - Location internal ID
         * @returns {string} Location name
         */
        function getLocationName(locationId) {
            try {
                var locationLookup = search.lookupFields({
                    type: search.Type.LOCATION,
                    id: locationId,
                    columns: ['name']
                });
                return locationLookup.name || 'Unknown Location';
            } catch (e) {
                log.error('Error getting location name', e.toString());
                return 'Location (ID: ' + locationId + ')';
            }
        }

        /**
         * Get time entry hours for a task by searching timebills directly
         * @param {string} taskId - Task internal ID
         * @returns {object} Object with hours grouped by item and total
         */
        function getTimeEntryHours(taskId) {
            var result = {
                total: 0,
                byItem: {}, // { 'Labor': 2.5, 'Travel': 1.0 }
                formatted: 'N/A'
            };
            
            if (!taskId) {
                return result;
            }
            
            try {
                log.debug('Time Entry Search', 'Starting search for task ID: ' + taskId);
                
                // Search timebills directly for this task using custcol_nx_task field
                var timeEntrySearch = search.create({
                    type: 'timebill',
                    filters: [
                        ['custcol_nx_task', 'anyof', taskId]
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'hours' }),
                        search.createColumn({ name: 'item' })
                    ]
                });
                
                var entryCount = 0;
                timeEntrySearch.run().each(function(timeResult) {
                    entryCount++;
                    
                    var timeEntryId = timeResult.getValue('internalid');
                    var hours = parseFloat(timeResult.getValue('hours')) || 0;
                    var itemText = timeResult.getText('item');
                    var itemId = timeResult.getValue('item');
                    
                    // Log what we found
                    log.debug('Time Entry Found', 
                        'Entry ID: ' + timeEntryId + 
                        ', Hours: ' + hours + 
                        ', Item ID: ' + itemId + 
                        ', Item Text: ' + itemText);
                    
                    // Use item text if available, otherwise use a fallback
                    var itemName = itemText || 'Item ID: ' + itemId || 'Other';
                    
                    // Group by service item
                    if (!result.byItem[itemName]) {
                        result.byItem[itemName] = 0;
                    }
                    result.byItem[itemName] += hours;
                    result.total += hours;
                    
                    return true; // Continue processing all results
                });
                
                log.debug('Time Entry Search Complete', 
                    'Task: ' + taskId + 
                    ', Entries found: ' + entryCount + 
                    ', Total hours: ' + result.total);
                
                // Format the result
                if (result.total > 0) {
                    var parts = [];
                    for (var itemName in result.byItem) {
                        parts.push(itemName + ': ' + result.byItem[itemName].toFixed(1) + ' hr' + (result.byItem[itemName] === 1 ? '' : 's'));
                    }
                    parts.push('Total: ' + result.total.toFixed(1) + ' hr' + (result.total === 1 ? '' : 's'));
                    result.formatted = parts.join(', ');
                } else {
                    result.formatted = 'No hours logged';
                }
                
            } catch (e) {
                log.error('Time Entry Hours Error', 'Task: ' + taskId + ', Error: ' + e.toString() + '\n' + e.stack);
                result.formatted = 'Error retrieving hours';
            }
            
            return result;
        }

        /**
         * Get revenue stream and customer from project record
         * @param {string} projectId - Project internal ID
         * @returns {object} Object with revenueStream and customer properties
         */
        function getProjectDetails(projectId) {
            if (!projectId) {
                return { revenueStream: 'N/A', customer: '' };
            }
            
            try {
                var projectLookup = search.lookupFields({
                    type: search.Type.JOB, // Project record type
                    id: projectId,
                    columns: ['cseg_sna_revenue_st', 'custentity_nx_customer']
                });
                
                var revenueStream = 'N/A';
                var customer = '';
                
                // Custom segments return as objects with value and text
                if (projectLookup.cseg_sna_revenue_st && projectLookup.cseg_sna_revenue_st.length > 0) {
                    revenueStream = projectLookup.cseg_sna_revenue_st[0].text || 'N/A';
                }
                
                // Custom entity fields also return as arrays
                if (projectLookup.custentity_nx_customer && projectLookup.custentity_nx_customer.length > 0) {
                    customer = projectLookup.custentity_nx_customer[0].text || '';
                }
                
                return { revenueStream: revenueStream, customer: customer };
            } catch (e) {
                log.debug('Project Details Lookup Error', 'Project ID: ' + projectId + ', Error: ' + e.toString());
                return { revenueStream: 'N/A', customer: '' };
            }
        }

        /**
         * Batch search for time entry hours for multiple tasks at once
         * This is much more efficient than searching one task at a time
         * @param {Array} taskIds - Array of task internal IDs
         * @returns {Object} Map of taskId -> formatted hours string
         */
        function batchGetTimeEntryHours(taskIds) {
            var resultMap = {}; // { taskId: "Labor: 2.5 hrs, Total: 2.5 hrs" }
            var taskHoursMap = {}; // { taskId: { byItem: {}, total: 0 } }
            
            if (!taskIds || taskIds.length === 0) {
                return resultMap;
            }
            
            try {
                log.debug('Batch Time Entry Search', 'Searching for ' + taskIds.length + ' tasks');
                
                // ONE search for ALL time entries across ALL tasks
                var timeEntrySearch = search.create({
                    type: 'timebill',
                    filters: [
                        ['custcol_nx_task', 'anyof', taskIds] // Search for all tasks at once!
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'custcol_nx_task' }), // Which task this entry belongs to
                        search.createColumn({ name: 'hours' }),
                        search.createColumn({ name: 'item' }),
                        search.createColumn({
                            name: 'itemid',
                            join: 'item'
                        }),
                        search.createColumn({
                            name: 'displayname',
                            join: 'item'
                        })
                    ]
                });
                
                var entryCount = 0;
                timeEntrySearch.run().each(function(timeResult) {
                    entryCount++;
                    
                    var timeEntryId = timeResult.getValue('internalid');
                    var taskId = timeResult.getValue('custcol_nx_task');
                    var hours = parseFloat(timeResult.getValue('hours')) || 0;
                    
                    // Try multiple ways to get the item name
                    var itemText = timeResult.getText('item');
                    var itemId = timeResult.getValue('item');
                    var itemName = timeResult.getValue({ name: 'itemid', join: 'item' });
                    var itemDisplayName = timeResult.getValue({ name: 'displayname', join: 'item' });
                    
                    // Debug log for first few entries to see what's working
                    if (entryCount <= 3) {
                        log.debug('Time Entry Sample', 
                            'Entry: ' + timeEntryId +
                            ', Task: ' + taskId +
                            ', Hours: ' + hours +
                            ', Item ID: ' + itemId +
                            ', Item Text: ' + itemText +
                            ', Item Name: ' + itemName +
                            ', Item Display: ' + itemDisplayName);
                    }
                    
                    // Use the best available name (priority order)
                    var finalItemName = itemDisplayName || itemText || itemName || ('Item ID: ' + itemId) || 'Other';
                    
                    // Initialize task entry if it doesn't exist
                    if (!taskHoursMap[taskId]) {
                        taskHoursMap[taskId] = {
                            byItem: {},
                            total: 0
                        };
                    }
                    
                    // Group by service item for this task
                    if (!taskHoursMap[taskId].byItem[finalItemName]) {
                        taskHoursMap[taskId].byItem[finalItemName] = 0;
                    }
                    taskHoursMap[taskId].byItem[finalItemName] += hours;
                    taskHoursMap[taskId].total += hours;
                    
                    return true; // Continue processing all results
                });
                
                log.debug('Batch Search Complete', 
                    'Found ' + entryCount + ' time entries across ' + 
                    Object.keys(taskHoursMap).length + ' tasks');
                
                // Format results for each task
                for (var taskId in taskHoursMap) {
                    var taskData = taskHoursMap[taskId];
                    
                    if (taskData.total > 0) {
                        var parts = [];
                        for (var itemName in taskData.byItem) {
                            var itemHours = taskData.byItem[itemName];
                            parts.push(itemName + ': ' + itemHours.toFixed(1) + ' hr' + (itemHours === 1 ? '' : 's'));
                        }
                        parts.push('Total: ' + taskData.total.toFixed(1) + ' hr' + (taskData.total === 1 ? '' : 's'));
                        resultMap[taskId] = parts.join(', ');
                    } else {
                        resultMap[taskId] = 'No hours logged';
                    }
                }
                
            } catch (e) {
                log.error('Batch Time Entry Error', 'Error: ' + e.toString() + '\n' + e.stack);
            }
            
            return resultMap;
        }

        /**
         * Search for tasks for the selected date and technician
         * @param {string} dateStr - Date string in NetSuite format
         * @param {string} technicianId - Employee internal ID
         * @returns {Array} Array of task objects
         */
        function searchTasks(dateStr, technicianId) {
            var tasks = [];
            
            try {
                log.audit('Searching Tasks', 'Date: ' + dateStr + ', Technician: ' + technicianId);

                // Parse date
                var targetDate = format.parse({
                    value: dateStr,
                    type: format.Type.DATE
                });

                // Format date for NetSuite search (MM/DD/YYYY)
                // Zero-pad month and day to match TO_CHAR format
                var month = targetDate.getMonth() + 1;
                var day = targetDate.getDate();
                var year = targetDate.getFullYear();
                var searchDateStr = (month < 10 ? '0' : '') + month + '/' +
                                   (day < 10 ? '0' : '') + day + '/' + year;

                // Create the search with date filter to limit results
                var taskSearch = search.create({
                    type: 'task',
                    filters: [
                        ['assigned', search.Operator.ANYOF, technicianId],
                        'AND',
                        ['custevent_nx_task_start', search.Operator.ISNOTEMPTY, ''],
                        'AND',
                        ['custevent_nx_task_end', search.Operator.ISNOTEMPTY, ''],
                        'AND',
                        ['formulanumeric: CASE WHEN TO_CHAR({custevent_nx_task_start}, \'MM/DD/YYYY\') = \'' + searchDateStr + '\' THEN 1 ELSE 0 END', search.Operator.EQUALTO, '1']
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'title' }),
                        search.createColumn({ name: 'assigned' }),
                        search.createColumn({ name: 'company' }), // This is the Project
                        search.createColumn({ name: 'status' }),
                        search.createColumn({ name: 'custevent_nx_task_start', sort: search.Sort.ASC }),
                        search.createColumn({ name: 'custevent_nx_task_end' })
                    ]
                });

                var searchResults = taskSearch.run();
                var processedCount = 0;
                var taskIds = []; // Collect all task IDs for batch time entry search
                
                // First pass: Collect all task data
                searchResults.each(function(result) {
                    processedCount++;
                    
                    var taskId = result.getValue('internalid');
                    var title = result.getValue('title') || 'Untitled Task';
                    var companyText = result.getText('company') || 'No Customer';
                    var companyId = result.getValue('company');
                    var statusText = result.getText('status') || 'Unknown';
                    var startTime = result.getValue('custevent_nx_task_start');
                    var endTime = result.getValue('custevent_nx_task_end');
                    
                    // Get revenue stream and customer from project using lookup
                    var projectDetails = getProjectDetails(companyId);
                    
                    if (startTime && endTime) {
                        tasks.push({
                            id: taskId,
                            title: title,
                            customer: companyText,
                            customerId: projectDetails.customer,
                            projectId: companyId,
                            status: statusText,
                            startTime: startTime,
                            endTime: endTime,
                            startTimestamp: new Date(startTime).getTime(),
                            endTimestamp: new Date(endTime).getTime(),
                            revenueStream: projectDetails.revenueStream,
                            timeEntryHours: 'Loading...' // Placeholder
                        });
                        
                        taskIds.push(taskId);
                    }
                    
                    // Limit to 1000 results to avoid governance issues
                    return processedCount < 1000;
                });

                log.audit('Tasks Found', tasks.length + ' tasks retrieved for ' + dateStr);
                
                // Second pass: Batch search for ALL time entries at once
                if (taskIds.length > 0) {
                    log.audit('Batch Time Entry Search', 'Searching for time entries for ' + taskIds.length + ' tasks');
                    var timeEntryMap = batchGetTimeEntryHours(taskIds);
                    
                    // Map time entry hours back to tasks
                    for (var i = 0; i < tasks.length; i++) {
                        var taskId = tasks[i].id;
                        if (timeEntryMap[taskId]) {
                            tasks[i].timeEntryHours = timeEntryMap[taskId];
                        } else {
                            tasks[i].timeEntryHours = 'No hours logged';
                        }
                    }
                }

            } catch (e) {
                log.error('Error searching tasks', e.toString() + '\n' + e.stack);
                throw new Error('Failed to search tasks: ' + e.message);
            }

            return tasks;
        }

        /**
         * Add the timeline visualization to the form
         */
        function addTimelineVisualization(form, tasks, selectedDate, technicianId) {
            // Calculate smart row positions
            var tasksWithRows = calculateTaskRows(tasks);
            
            // Detect overlaps for coloring
            var tasksWithOverlaps = detectOverlapsForColoring(tasksWithRows);
            
            // Get technician name for display
            var techName = getTechnicianName(technicianId);
            
            var htmlContent = generateTimelineHTML(tasksWithOverlaps, selectedDate, techName);
            
            // Create unique field ID by appending technician ID
            var timelineField = form.addField({
                id: 'custpage_timeline_' + technicianId,
                type: serverWidget.FieldType.INLINEHTML,
                label: ' ' // Empty label to avoid clutter
            });
            
            timelineField.defaultValue = htmlContent;
        }

        /**
         * Detect overlapping tasks for coloring
         * Now distinguishes between same-customer overlaps (blue) and different-customer overlaps (red)
         */
        function detectOverlapsForColoring(tasks) {
            for (var i = 0; i < tasks.length; i++) {
                tasks[i].hasOverlap = false;
                tasks[i].sameCustomerOverlap = false;
                
                for (var j = 0; j < tasks.length; j++) {
                    if (i !== j) {
                        var task1 = tasks[i];
                        var task2 = tasks[j];
                        
                        // Check if time periods overlap
                        if (task1.endTimestamp > task2.startTimestamp && 
                            task1.startTimestamp < task2.endTimestamp) {
                            
                            tasks[i].hasOverlap = true;
                            
                            // Check if it's the same customer
                            if (task1.customerId && task2.customerId && 
                                task1.customerId === task2.customerId) {
                                tasks[i].sameCustomerOverlap = true;
                            }
                        }
                    }
                }
            }
            
            return tasks;
        }

        /**
         * Get technician name from ID
         */
        function getTechnicianName(technicianId) {
            try {
                var employeeLookup = search.lookupFields({
                    type: search.Type.EMPLOYEE,
                    id: technicianId,
                    columns: ['entityid']
                });
                return employeeLookup.entityid || 'Unknown Technician';
            } catch (e) {
                return 'Unknown Technician';
            }
        }

        /**
         * Calculate vertical positions for tasks to avoid visual overlap
         * @param {Array} tasks - Array of task objects with timestamps
         * @returns {Array} Tasks with assigned row positions
         */
        function calculateTaskRows(tasks) {
            // Sort by start time
            var sortedTasks = tasks.slice().sort(function(a, b) {
                return a.startTimestamp - b.startTimestamp;
            });
            
            // Track which row each task is in and when each row becomes available
            var rows = []; // Each element: { endTime: timestamp }
            
            for (var i = 0; i < sortedTasks.length; i++) {
                var task = sortedTasks[i];
                var assignedRow = -1;
                
                // Find the first available row (one that ends before this task starts)
                for (var r = 0; r < rows.length; r++) {
                    if (rows[r].endTime <= task.startTimestamp) {
                        // This row is available
                        assignedRow = r;
                        rows[r].endTime = task.endTimestamp;
                        break;
                    }
                }
                
                // If no row is available, create a new one
                if (assignedRow === -1) {
                    assignedRow = rows.length;
                    rows.push({ endTime: task.endTimestamp });
                }
                
                // Assign the row to the task
                task.row = assignedRow;
            }
            
            return sortedTasks;
        }

        /**
         * Generate the HTML for the timeline visualization
         */
        function generateTimelineHTML(tasks, selectedDate, techName) {
            var html = '<style>' +
                '.timeline-container { margin: 20px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }' +
                '.timeline-header { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6; }' +
                '.timeline-header h2 { margin: 0 0 10px 0; color: #333; }' +
                '.timeline-info { color: #666; font-size: 14px; }' +
                '.timeline-legend { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }' +
                '.legend-item { display: inline-block; margin-right: 20px; }' +
                '.legend-color { display: inline-block; width: 20px; height: 20px; margin-right: 5px; vertical-align: middle; border: 1px solid #ddd; }' +
                '.timeline-canvas-wrapper { position: relative; overflow-x: auto; border: 1px solid #dee2e6; background: #fafafa; }' +
                '.timeline-canvas { position: relative; min-height: 150px; }' +
                '.time-axis { display: flex; justify-content: space-between; border-top: 1px solid #dee2e6; padding: 10px 0; background: white; font-size: 12px; color: #666; }' +
                '.task-bar { position: absolute; height: 40px; cursor: pointer; border-radius: 4px; border: 2px solid rgba(0,0,0,0.2); transition: all 0.2s; }' +
                '.task-bar:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); border-color: rgba(0,0,0,0.4); }' +
                '.task-bar.no-overlap { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }' +
                '.task-bar.has-overlap { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }' +
                '.task-bar.same-customer-overlap { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); }' +
                '.task-label { color: white; font-size: 11px; font-weight: bold; padding: 4px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }' +
                '.tooltip { position: fixed; background: rgba(0,0,0,0.9); color: white; padding: 12px; border-radius: 6px; font-size: 13px; z-index: 1000; pointer-events: none; min-width: 250px; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }' +
                '.tooltip-row { margin: 4px 0; }' +
                '.tooltip-label { font-weight: bold; color: #ffd700; }' +
                '.no-tasks { text-align: center; padding: 60px 20px; color: #999; }' +
                '.no-tasks-icon { font-size: 48px; margin-bottom: 10px; }' +
                '</style>';

            // Add table-breaking separator and explicit line breaks
            html += '<div style="clear:both;height:0;line-height:0;"></div>';
            html += '<table style="width:100%;"><tr><td>';
            
            html += '<div style="display: block; width: 100%; clear: both; margin-bottom: 40px; float: none;">';
            html += '<div class="timeline-container">' +
                '<div class="timeline-header">' +
                '<h2>Task Timeline for ' + escapeHtml(techName) + '</h2>' +
                '<div class="timeline-info">Date: ' + escapeHtml(selectedDate) + ' (Central Time)</div>' +
                '</div>';

            // Legend
            html += '<div class="timeline-legend">' +
                '<strong>Legend:</strong> ' +
                '<span class="legend-item"><span class="legend-color" style="background: #28a745;"></span>Sequential (No Overlap)</span>' +
                '<span class="legend-item"><span class="legend-color" style="background: #2196F3;"></span>Overlapping (Same Customer)</span>' +
                '<span class="legend-item"><span class="legend-color" style="background: #dc3545;"></span>Overlapping (Different Customers)</span>' +
                '</div>';

            if (tasks.length === 0) {
                html += '<div class="no-tasks">' +
                    '<div class="no-tasks-icon"></div>' +
                    '<h3>No Tasks Found</h3>' +
                    '<p>No completed tasks with start and end times found for this technician on the selected date.</p>' +
                    '</div>';
            } else {
                // Generate timeline
                html += generateTimelineCanvas(tasks);
            }

            html += '</div>'; // Close timeline-container
            html += '</div>'; // Close wrapper div
            html += '</td></tr></table>';
            html += '<br style="clear:both;" />';
            html += '<div id="tooltip" class="tooltip"></div>';
            html += generateTimelineScript(tasks);

            return html;
        }

        /**
         * Generate the timeline canvas with task bars
         */
        function generateTimelineCanvas(tasks) {
            // Timeline spans 6 AM (360 minutes) to 8 PM (1200 minutes) = 840 minutes total
            var START_HOUR = 6; // 6 AM
            var END_HOUR = 20; // 8 PM
            var MINUTES_PER_HOUR = 60;
            var TIMELINE_START = START_HOUR * MINUTES_PER_HOUR; // 360 minutes
            var TIMELINE_END = END_HOUR * MINUTES_PER_HOUR; // 1200 minutes
            var TIMELINE_SPAN = TIMELINE_END - TIMELINE_START; // 840 minutes
            var ROW_HEIGHT = 50; // pixels per row
            var PADDING = 20;
            
            // Calculate how many rows we need
            var maxRow = 0;
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].row > maxRow) {
                    maxRow = tasks[i].row;
                }
            }
            var canvasHeight = (maxRow + 1) * ROW_HEIGHT + PADDING * 2;

            var html = '<div class="timeline-canvas-wrapper">' +
                '<div class="timeline-canvas" style="width: 100%; min-width: 1200px; min-height: ' + canvasHeight + 'px; padding: ' + PADDING + 'px;">';

            // Draw task bars
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                
                // Calculate position and width
                var startDate = new Date(task.startTime);
                var endDate = new Date(task.endTime);
                
                var startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
                var endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
                
                // Calculate percentage positions
                var leftPercent = ((startMinutes - TIMELINE_START) / TIMELINE_SPAN) * 100;
                var widthPercent = ((endMinutes - startMinutes) / TIMELINE_SPAN) * 100;
                
                // Ensure bars stay within bounds
                if (leftPercent < 0) leftPercent = 0;
                if (leftPercent + widthPercent > 100) widthPercent = 100 - leftPercent;
                
                // Use the calculated row position (from calculateTaskRows function)
                var topPosition = (task.row || 0) * 50 + 10;
                
                // Determine color class based on overlap type
                var overlapClass = 'no-overlap';
                if (task.hasOverlap) {
                    if (task.sameCustomerOverlap) {
                        overlapClass = 'same-customer-overlap';
                    } else {
                        overlapClass = 'has-overlap';
                    }
                }
                
                var startTimeFormatted = formatTime(startDate);
                var endTimeFormatted = formatTime(endDate);
                var duration = Math.round((endDate - startDate) / (1000 * 60)); // Duration in minutes
                
                html += '<div class="task-bar ' + overlapClass + '" ' +
                    'style="left: ' + leftPercent + '%; width: ' + widthPercent + '%; top: ' + topPosition + 'px;" ' +
                    'data-task-id="' + task.id + '" ' +
                    'data-title="' + escapeHtml(task.title) + '" ' +
                    'data-customer="' + escapeHtml(task.customer) + '" ' +
                    'data-status="' + escapeHtml(task.status) + '" ' +
                    'data-start="' + startTimeFormatted + '" ' +
                    'data-end="' + endTimeFormatted + '" ' +
                    'data-duration="' + duration + ' min" ' +
                    'data-revenue="' + escapeHtml(task.revenueStream) + '" ' +
                    'data-timehours="' + escapeHtml(task.timeEntryHours || 'N/A') + '" ' +
                    'onclick="window.open(\'/app/crm/calendar/task.nl?id=' + task.id + '\', \'_blank\')">' +
                    '<div class="task-label">Task #' + task.id + '</div>' +
                    '</div>';
            }

            html += '</div>';

            // Time axis
            html += '<div class="time-axis">';
            for (var hour = START_HOUR; hour <= END_HOUR; hour++) {
                var timeLabel = (hour === 12) ? '12 PM' : 
                               (hour === 0) ? '12 AM' :
                               (hour > 12) ? (hour - 12) + ' PM' : hour + ' AM';
                html += '<span>' + timeLabel + '</span>';
            }
            html += '</div>';

            html += '</div>';

            return html;
        }

        /**
         * Generate JavaScript for tooltip interactivity
         */
        function generateTimelineScript(tasks) {
            return '<script>' +
                'document.addEventListener("DOMContentLoaded", function() {' +
                '  var taskBars = document.querySelectorAll(".task-bar");' +
                '  var tooltip = document.getElementById("tooltip");' +
                '  ' +
                '  taskBars.forEach(function(bar) {' +
                '    bar.addEventListener("mouseenter", function(e) {' +
                '      var taskId = this.getAttribute("data-task-id");' +
                '      var title = this.getAttribute("data-title");' +
                '      var customer = this.getAttribute("data-customer");' +
                '      var status = this.getAttribute("data-status");' +
                '      var start = this.getAttribute("data-start");' +
                '      var end = this.getAttribute("data-end");' +
                '      var duration = this.getAttribute("data-duration");' +
                '      var revenue = this.getAttribute("data-revenue");' +
                '      var timeHours = this.getAttribute("data-timehours");' +
                '      ' +
                '      tooltip.innerHTML = ' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Task:</span> #" + taskId + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Title:</span> " + title + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Customer:</span> " + customer + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Revenue Stream:</span> " + revenue + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Status:</span> " + status + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Start:</span> " + start + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">End:</span> " + end + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Duration:</span> " + duration + "</div>" +' +
                '        "<div class=\\"tooltip-row\\"><span class=\\"tooltip-label\\">Time Entry Hours:</span> " + timeHours + "</div>" +' +
                '        "<div style=\\"margin-top: 8px; font-size: 11px; color: #aaa;\\">Click to open task record</div>";' +
                '      ' +
                '      tooltip.style.display = "block";' +
                '      tooltip.style.left = e.clientX + 10 + "px";' +
                '      tooltip.style.top = e.clientY + 10 + "px";' +
                '    });' +
                '    ' +
                '    bar.addEventListener("mouseleave", function() {' +
                '      tooltip.style.display = "none";' +
                '    });' +
                '    ' +
                '    bar.addEventListener("mousemove", function(e) {' +
                '      tooltip.style.left = e.clientX + 10 + "px";' +
                '      tooltip.style.top = e.clientY + 10 + "px";' +
                '    });' +
                '  });' +
                '});' +
                '</script>';
        }

        /**
         * Format date object to readable time string
         */
        function formatTime(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Handle midnight
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return hours + ':' + minutes + ' ' + ampm;
        }

        /**
         * Escape HTML to prevent XSS
         */
        function escapeHtml(text) {
            if (!text) return '';
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        return {
            onRequest: onRequest
        };
    }
);