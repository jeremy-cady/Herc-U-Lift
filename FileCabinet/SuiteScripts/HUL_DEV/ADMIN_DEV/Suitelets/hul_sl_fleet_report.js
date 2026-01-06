/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * Fleet Report - Equipment Cost Analysis System
 * 
 * Purpose: Provides real-time cost-per-hour analysis for equipment
 * Including repair history, maintenance tracking, and hour meter validation
 * 
 * Version: 2.3 - CORRECT CASE DETAILS FIX
 * Date: October 2025
 * 
 * FIXES APPLIED IN v2.3:
 * - CORRECTLY fixed case details query using custbody_nx_case field
 * - Invoice.custbody_nx_case directly links to Support Case (no sales order needed!)
 * - Case details retrieved via search join (single query, no record loads)
 * - Massive performance improvement - eliminated all separate lookups
 * 
 * FIXES APPLIED IN v2.1:
 * - Hour meters now properly search through Object records
 * - Improved compact layout with better spacing
 * - Enhanced debugging and logging
 * 
 * FEATURES (v2.1):
 * - Revenue stream displays as text instead of IDs
 * - Case details from support cases shown with invoices
 * - Invoices sorted newest first with visual indicators
 */

define(['N/search', 'N/ui/serverWidget', 'N/format', 'N/runtime', 'N/url', 'N/record', 'N/query', 'N/file', 'N/render'],
    function(search, serverWidget, format, runtime, url, record, query, file, render) {
        
        /**
         * CONFIGURATION - Verified from your NetSuite instance
         */
        const CONFIG = {
            // Record Types
            FIELD_SERVICE_ASSET_TYPE: 'customrecord_nx_asset',
            HOUR_METER_TYPE: 'customrecord_sna_hul_hour_meter',
            OBJECT_TYPE: 'customrecord_sna_objects',
            SUPPORT_CASE_TYPE: 'supportcase',
            MAINTENANCE_RECORD_TYPE: 'customrecord_nxc_mr',
            
            // Field Service Asset Fields
            ASSET_FIELDS: {
                name: 'name',
                parent: 'parent',
                model: 'custrecord_sna_hul_nxc_object_model',
                manufacturer: 'cseg_hul_mfg',
                serial: 'custrecord_nx_asset_serial',
                customer: 'custrecord_nx_asset_customer',
                fleet_code: 'custrecord_sna_hul_fleetcode',
                category: 'cseg_sna_hul_eq_seg',
                asset_type: 'custrecord_nxc_na_asset_type'
            },
            
            // Object Fields - Asset field that contains Object ID
            OBJECT_FIELDS: {
                asset_object: 'custrecord_sna_hul_nxcassetobject'  // Field ON Asset that has Object ID
            },
            
            // Hour Meter Fields - VERIFIED from actual record
            HOUR_METER_FIELDS: {
                equipment: 'custrecord_sna_hul_object_ref',  // Links to Object ID
                reading_date: 'custrecord_sna_hul_date',
                reading_value: 'custrecord_sna_hul_hour_meter_reading',
                actual_reading: 'custrecord_sna_hul_actual_reading',
                time: 'custrecord_sna_hul_time',
                ignore_calc: 'custrecord_sna_hul_ignore_in_calculation'
            },
            
            // Invoice Fields
            INVOICE_FIELDS: {
                equipment_body: 'custbody_sna_hul_nxc_eq_asset',
                equipment_line: 'custcol_nxc_equip_asset',
                service_code_type: 'custcol_sna_so_service_code_type',
                revenue_stream: 'cseg_sna_revenue_st',
                case_link: 'custbody_nx_case'  // Direct link from invoice to support case
            },
            
            // Support Case Fields
            CASE_FIELDS: {
                equipment: 'custevent_sna_hul_caseobjeclasset',
                object: 'custevent_sna_hul_caseobject',
                case_details: 'custevent_nx_case_details'  // The field we want to display
            }
        };
        
        /**
         * Main request handler
         */
        function onRequest(context) {
            if (context.request.parameters.setup === 'true') {
                showSetupDiagnostics(context);
                return;
            }
            
            if (context.request.method === 'GET' || context.request.method === 'POST') {
                handleRequest(context);
            }
        }
        
        /**
         * Setup diagnostics
         */
        function showSetupDiagnostics(context) {
            var form = serverWidget.createForm({
                title: 'Fleet Report - Setup Diagnostics'
            });
            
            var html = '<div style="font-family: Arial; padding: 20px;">';
            html += '<h2>🔧 Configuration Check</h2>';
            html += '<p>Testing your NetSuite configuration...</p>';
            
            html += '<h3>Record Types:</h3>';
            html += '<ul>';
            
            // Test each record type
            var recordTypes = [
                {name: 'Field Service Asset', type: CONFIG.FIELD_SERVICE_ASSET_TYPE},
                {name: 'Hour Meter', type: CONFIG.HOUR_METER_TYPE},
                {name: 'Object', type: CONFIG.OBJECT_TYPE}
            ];
            
            recordTypes.forEach(function(rec) {
                try {
                    var testSearch = search.create({
                        type: rec.type,
                        filters: [],
                        columns: ['internalid']
                    });
                    var resultSet = testSearch.run();
                    var firstResult = resultSet.getRange(0, 1);
                    html += '<li style="color: green;">✅ ' + rec.name + ' (' + rec.type + ') - Found</li>';
                } catch (e) {
                    html += '<li style="color: red;">❌ ' + rec.name + ' (' + rec.type + ') - Error: ' + e.message + '</li>';
                }
            });
            
            html += '</ul>';
            html += '<hr/>';
            html += '<p><a href="' + url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId
            }) + '">← Back to Report</a></p>';
            html += '</div>';
            
            var field = form.addField({
                id: 'custpage_diagnostics',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Diagnostics'
            });
            field.defaultValue = html;
            
            context.response.writePage(form);
        }

        /**
         * Main request handler
         */
        function handleRequest(context) {
            try {
                // Check if this is a PDF export request
                var exportFormat = context.request.parameters.export;
                if (exportFormat === 'pdf') {
                    handlePdfExport(context);
                    return;
                }

                var form = serverWidget.createForm({
                    title: 'Fleet Report - Equipment Cost Analysis'
                });

                var equipmentId = context.request.parameters.custpage_equipment;
                var equipmentSearchText = context.request.parameters.custpage_equipment_search;
                var startDate = context.request.parameters.custpage_date_from;
                var endDate = context.request.parameters.custpage_date_to;
                var excludeInternal = context.request.parameters.custpage_exclude_internal === 'T';

                if (!equipmentId && equipmentSearchText) {
                    equipmentId = findEquipmentBySearch(equipmentSearchText);
                    if (!equipmentId) {
                        var errorField = form.addField({
                            id: 'custpage_error',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Error'
                        });
                        errorField.defaultValue = '<div style="padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; border-radius: 4px; margin: 20px;">' +
                            '<strong>Equipment Not Found</strong><br/>' +
                            'Could not find equipment with fleet code or serial: ' + equipmentSearchText +
                            '</div>';
                    }
                }

                var reportData = null;
                var mostRecentPhotoId = null;

                if (equipmentId && startDate && endDate) {
                    reportData = generateReport(equipmentId, startDate, endDate, excludeInternal);

                    // Find most recent photo for filter section
                    if (reportData.invoices && reportData.invoices.invoices) {
                        for (var i = 0; i < reportData.invoices.invoices.length; i++) {
                            if (reportData.invoices.invoices[i].completedCorrectionImg) {
                                mostRecentPhotoId = reportData.invoices.invoices[i].completedCorrectionImg;
                                break;
                            }
                        }
                    }
                }

                // Add form fields including photo if available
                addFormFields(form, context, mostRecentPhotoId);

                // Add export button if report data is available
                if (reportData) {
                    form.addButton({
                        id: 'custpage_export_pdf',
                        label: 'Export to PDF',
                        functionName: 'exportToPDF'
                    });
                    displayResults(form, reportData);
                } else {
                    displayInstructions(form);
                }

                context.response.writePage(form);

            } catch (e) {
                log.error('Fleet Report Error', e);
                throw e;
            }
        }

        /**
         * Find equipment by fleet code or serial
         */
        function findEquipmentBySearch(searchText) {
            if (!searchText) return null;
            
            searchText = searchText.trim().toUpperCase();
            
            try {
                var filters = [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    [
                        [CONFIG.ASSET_FIELDS.fleet_code, 'is', searchText],
                        'OR',
                        [CONFIG.ASSET_FIELDS.serial, 'is', searchText]
                    ]
                ];
                
                var equipmentSearch = search.create({
                    type: CONFIG.FIELD_SERVICE_ASSET_TYPE,
                    filters: filters,
                    columns: ['internalid']
                });
                
                var results = equipmentSearch.run().getRange(0, 1);
                if (results.length > 0) {
                    return results[0].id;
                }
                
                // Try contains search
                filters = [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    [
                        [CONFIG.ASSET_FIELDS.fleet_code, 'contains', searchText],
                        'OR',
                        [CONFIG.ASSET_FIELDS.serial, 'contains', searchText]
                    ]
                ];
                
                equipmentSearch = search.create({
                    type: CONFIG.FIELD_SERVICE_ASSET_TYPE,
                    filters: filters,
                    columns: ['internalid']
                });
                
                results = equipmentSearch.run().getRange(0, 1);
                if (results.length > 0) {
                    return results[0].id;
                }
                
            } catch (e) {
                log.error('Equipment search error', e);
            }
            
            return null;
        }

        /**
         * Add form fields
         */
        function addFormFields(form, context, mostRecentPhotoId) {
            // Customer filter
            var customerField = form.addField({
                id: 'custpage_customer_filter',
                type: serverWidget.FieldType.SELECT,
                label: 'Filter by Customer (Optional)',
                source: 'customer'
            });
            customerField.defaultValue = context.request.parameters.custpage_customer_filter || '';
            customerField.setHelpText('Select a customer to show only their equipment');
            
            // REMOVED: Equipment dropdown - use search field only
            /*
            var equipmentField = form.addField({
                id: 'custpage_equipment',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Equipment'
            });
            
            var filters = [
                ['isinactive', 'is', 'F'],
                'AND',
                [CONFIG.ASSET_FIELDS.parent, 'noneof', '@NONE@']
            ];
            
            var customerFilter = context.request.parameters.custpage_customer_filter;
            if (customerFilter) {
                filters.push('AND');
                filters.push([CONFIG.ASSET_FIELDS.customer, 'anyof', customerFilter]);
            }
            
            var equipmentSearch = search.create({
                type: CONFIG.FIELD_SERVICE_ASSET_TYPE,
                filters: filters,
                columns: [
                    'internalid',
                    search.createColumn({
                        name: 'name',
                        sort: search.Sort.ASC
                    }),
                    CONFIG.ASSET_FIELDS.fleet_code,
                    CONFIG.ASSET_FIELDS.serial,
                    search.createColumn({
                        name: 'name',
                        join: CONFIG.ASSET_FIELDS.parent
                    })
                ]
            });

            equipmentField.addSelectOption({
                value: '',
                text: '-- Select Equipment --'
            });

            var maxResults = 500;
            var searchResults = [];
            
            try {
                searchResults = equipmentSearch.run().getRange({
                    start: 0,
                    end: maxResults
                });
            } catch (e) {
                log.error('Equipment search error', e);
                equipmentField.addSelectOption({
                    value: '',
                    text: '-- Error loading equipment --'
                });
            }
            */
            
            // Search field - NOW THE MAIN WAY TO SELECT EQUIPMENT
            var searchField = form.addField({
                id: 'custpage_equipment_search',
                type: serverWidget.FieldType.TEXT,
                label: 'Equipment Fleet Code/Serial Number'
            });
            searchField.setHelpText('Enter fleet code or serial number (e.g., TM478, AF17D10662)');
            searchField.defaultValue = context.request.parameters.custpage_equipment_search || '';
            searchField.isMandatory = true;
            
            /*
            if (searchResults.length >= maxResults) {
                equipmentField.addSelectOption({
                    value: '',
                    text: '-- Showing first ' + maxResults + ' equipment --'
                });
            }
            
            // Populate equipment dropdown
            for (var i = 0; i < searchResults.length; i++) {
                var result = searchResults[i];
                var assetName = result.getValue('name');
                var fleetCode = result.getValue(CONFIG.ASSET_FIELDS.fleet_code);
                var serial = result.getValue(CONFIG.ASSET_FIELDS.serial);
                var siteName = result.getValue({
                    name: 'name',
                    join: CONFIG.ASSET_FIELDS.parent
                });
                
                var displayText = '';
                if (fleetCode) {
                    displayText = fleetCode + ' - ';
                }
                displayText += assetName;
                if (serial) {
                    displayText += ' (' + serial + ')';
                }
                if (siteName) {
                    displayText += ' @ ' + siteName;
                }
                
                equipmentField.addSelectOption({
                    value: result.id,
                    text: displayText
                });
            }

            equipmentField.defaultValue = context.request.parameters.custpage_equipment || '';
            */

            // Date fields
            var dateFromField = form.addField({
                id: 'custpage_date_from',
                type: serverWidget.FieldType.DATE,
                label: 'From Date'
            });
            dateFromField.defaultValue = context.request.parameters.custpage_date_from || getFirstDayOfMonth();
            dateFromField.isMandatory = true;

            var dateToField = form.addField({
                id: 'custpage_date_to',
                type: serverWidget.FieldType.DATE,
                label: 'To Date'
            });
            dateToField.defaultValue = context.request.parameters.custpage_date_to || new Date();
            dateToField.isMandatory = true;

            // Exclude internal checkbox
            var excludeInternalField = form.addField({
                id: 'custpage_exclude_internal',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Exclude Warranty & Internal Repairs'
            });
            excludeInternalField.defaultValue = context.request.parameters.custpage_exclude_internal || 'T';

            // Add most recent machine photo if available
            if (mostRecentPhotoId) {
                var photoUrl;
                try {
                    var imageFile = file.load({ id: mostRecentPhotoId });
                    photoUrl = imageFile.url;
                } catch (e) {
                    log.debug('Could not load image file', e.message);
                    photoUrl = '/app/common/media/mediaitem.nl?id=' + mostRecentPhotoId;
                }

                var photoHtml = '<div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
                photoHtml += '<div style="font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 10px; font-weight: 600;">Most Recent Photo</div>';
                photoHtml += '<a href="' + photoUrl + '" target="_blank">';
                photoHtml += '<img src="' + photoUrl + '" style="max-width: 100%; max-height: 300px; border-radius: 4px; cursor: pointer;" alt="Equipment Photo" />';
                photoHtml += '</a>';
                photoHtml += '</div>';

                var photoField = form.addField({
                    id: 'custpage_machine_photo',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Machine Photo'
                });
                photoField.defaultValue = photoHtml;
            }

            form.addSubmitButton({
                label: 'Generate Report'
            });

            // Add client script if available
            // Try to determine the correct path based on environment
            try {
                // Both environments use the same path structure:
                // Suitelet: /SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/
                // Client:   /SuiteScripts/HUL_DEV/ADMIN_DEV/ClientScripts/
                form.clientScriptModulePath = '../ClientScripts/hul_cs_fleet_report.js';

                log.debug('Client Script Path', 'Set to: ' + form.clientScriptModulePath);
            } catch (e) {
                log.error('Client Script Path Error', 'Could not set client script path: ' + e.toString());
                // Continue without client script rather than failing
            }
        }

        /**
         * Display instructions
         */
        function displayInstructions(form) {
            var instructionsField = form.addField({
                id: 'custpage_instructions',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Instructions'
            });
            
            instructionsField.defaultValue = '<div style="padding: 20px; background: #e3f2fd; border-left: 4px solid #2196f3; margin: 20px 0;">' +
                '<h3 style="color: #1976d2; margin-top: 0;">How to Use the Fleet Report</h3>' +
                '<ol style="line-height: 1.8;">' +
                '<li><strong>Enter Equipment:</strong> Type the fleet code or serial number (e.g., TM478, AF17D10662)</li>' +
                '<li><strong>Set Date Range:</strong> Select the period for analysis</li>' +
                '<li><strong>Warranty Filter:</strong> Check to exclude internal/warranty repairs from cost calculations</li>' +
                '<li><strong>Generate Report:</strong> Click the button to calculate cost-per-hour</li>' +
                '</ol>' +
                '<p style="margin-top: 15px; color: #666;"><em>Tip: Use the customer filter to narrow your search if needed</em></p>' +
                '</div>';
        }

        /**
         * Generate report data
         */
        function generateReport(equipmentId, startDate, endDate, excludeInternal) {
            var reportData = {
                equipment: {},
                hourMeter: {},
                invoices: {},
                summary: {}
            };

            reportData.equipment = getEquipmentDetails(equipmentId);
            reportData.hourMeter = getHourMeterData(equipmentId, startDate, endDate);
            reportData.invoices = getInvoiceData(equipmentId, startDate, endDate, excludeInternal);
            reportData.summary = calculateSummary(reportData);

            return reportData;
        }

        /**
         * Get equipment details
         */
        function getEquipmentDetails(equipmentId) {
            try {
                var equipmentRec = record.load({
                    type: CONFIG.FIELD_SERVICE_ASSET_TYPE,
                    id: equipmentId
                });
                
                var details = {
                    id: equipmentId,
                    name: equipmentRec.getValue('name') || '',
                    fleetCode: equipmentRec.getValue(CONFIG.ASSET_FIELDS.fleet_code) || '',
                    serial: equipmentRec.getValue(CONFIG.ASSET_FIELDS.serial) || '',
                    model: '',
                    manufacturer: '',
                    siteName: '',
                    customerName: ''
                };
                
                // Get parent site name
                var parentId = equipmentRec.getValue(CONFIG.ASSET_FIELDS.parent);
                if (parentId) {
                    try {
                        var parentLookup = search.lookupFields({
                            type: CONFIG.FIELD_SERVICE_ASSET_TYPE,
                            id: parentId,
                            columns: ['name']
                        });
                        details.siteName = parentLookup.name || '';
                    } catch (e) {
                        log.debug('Parent lookup error', e);
                    }
                }
                
                // Get customer name
                var customerId = equipmentRec.getValue(CONFIG.ASSET_FIELDS.customer);
                if (customerId) {
                    try {
                        var customerLookup = search.lookupFields({
                            type: 'customer',
                            id: customerId,
                            columns: ['entityid']
                        });
                        details.customerName = customerLookup.entityid || '';
                    } catch (e) {
                        log.debug('Customer lookup error', e);
                    }
                }
                
                try {
                    details.model = equipmentRec.getValue(CONFIG.ASSET_FIELDS.model) || '';
                } catch (e) {
                    log.debug('Model field not found', e);
                }
                
                try {
                    var mfgValue = equipmentRec.getValue(CONFIG.ASSET_FIELDS.manufacturer);
                    if (mfgValue) {
                        details.manufacturer = equipmentRec.getText(CONFIG.ASSET_FIELDS.manufacturer) || mfgValue;
                    }
                } catch (e) {
                    log.debug('Manufacturer field not found', e);
                }
                
                return details;
                
            } catch (e) {
                log.error('Error loading equipment details', e);
                return {
                    id: equipmentId,
                    name: 'Equipment ' + equipmentId,
                    fleetCode: '',
                    serial: '',
                    model: '',
                    manufacturer: '',
                    siteName: '',
                    customerName: ''
                };
            }
        }

        /**
         * FIXED: Get hour meter data - searches through Object records
         */
        function getHourMeterData(equipmentId, startDate, endDate) {
            var searchId = equipmentId;
            var results = null;
            
            log.audit('Hour Meter Search Start', 'Equipment: ' + equipmentId + ', Dates: ' + startDate + ' to ' + endDate);
            
            // Step 1: FIRST get Object ID from Asset record
            try {
                var assetRecord = record.load({
                    type: CONFIG.FIELD_SERVICE_ASSET_TYPE,
                    id: equipmentId
                });
                
                var objectId = assetRecord.getValue('custrecord_sna_hul_nxcassetobject');
                
                if (objectId) {
                    log.audit('Object ID Found', 'Asset: ' + equipmentId + ' has Object: ' + objectId);
                    searchId = objectId;
                    
                    // Search hour meters with Object ID
                    var hourSearch = search.create({
                        type: CONFIG.HOUR_METER_TYPE,
                        filters: [
                            [CONFIG.HOUR_METER_FIELDS.equipment, 'anyof', objectId],
                            'AND',
                            [CONFIG.HOUR_METER_FIELDS.reading_date, 'within', startDate, endDate]
                            // Removed ignore_calc filter - may not exist or filter valid records
                        ],
                        columns: [
                            search.createColumn({
                                name: CONFIG.HOUR_METER_FIELDS.reading_value,
                                summary: 'MIN'
                            }),
                            search.createColumn({
                                name: CONFIG.HOUR_METER_FIELDS.reading_value,
                                summary: 'MAX'
                            }),
                            search.createColumn({
                                name: CONFIG.HOUR_METER_FIELDS.reading_date,
                                summary: 'COUNT'
                            })
                        ]
                    });
                    
                    results = hourSearch.run().getRange(0, 1);
                    if (results && results.length > 0) {
                        log.audit('Hour Meters Found with Object', 'Object ID: ' + objectId + ' has hour meter data');
                    }
                } else {
                    log.debug('No Object ID', 'Asset ' + equipmentId + ' has no Object ID in custrecord_sna_hul_nxcassetobject field');
                }
            } catch (e) {
                log.error('Asset/Object lookup failed', e);
            }
            
            // Step 2: If no results, try direct search with Asset ID as fallback
            if (!results || results.length === 0) {
                try {
                    log.audit('Trying Fallback', 'No results with Object, trying direct Asset ID: ' + equipmentId);
                    
                    var hourSearch = search.create({
                        type: CONFIG.HOUR_METER_TYPE,
                        filters: [
                            [CONFIG.HOUR_METER_FIELDS.equipment, 'anyof', equipmentId],
                            'AND',
                            [CONFIG.HOUR_METER_FIELDS.reading_date, 'within', startDate, endDate]
                            // Removed ignore_calc filter - may not exist or filter valid records
                        ],
                        columns: [
                            search.createColumn({
                                name: CONFIG.HOUR_METER_FIELDS.reading_value,
                                summary: 'MIN'
                            }),
                            search.createColumn({
                                name: CONFIG.HOUR_METER_FIELDS.reading_value,
                                summary: 'MAX'
                            }),
                            search.createColumn({
                                name: CONFIG.HOUR_METER_FIELDS.reading_date,
                                summary: 'COUNT'
                            })
                        ]
                    });
                    
                    results = hourSearch.run().getRange(0, 1);
                    if (results && results.length > 0) {
                        log.audit('Hour Meters Found with Asset', 'Direct Asset ID search successful');
                    }
                } catch (e) {
                    log.debug('Direct search also failed', e);
                }
            }
            
            // Debug: Check if ANY hour meters exist for this equipment
            if (!results || results.length === 0) {
                try {
                    var allHourSearch = search.create({
                        type: CONFIG.HOUR_METER_TYPE,
                        filters: [
                            [CONFIG.HOUR_METER_FIELDS.equipment, 'anyof', searchId]
                        ],
                        columns: [
                            search.createColumn({
                                name: CONFIG.HOUR_METER_FIELDS.reading_date,
                                sort: search.Sort.DESC
                            }),
                            CONFIG.HOUR_METER_FIELDS.reading_value
                        ]
                    });
                    
                    var allResults = allHourSearch.run().getRange(0, 5);
                    if (allResults && allResults.length > 0) {
                        log.audit('Hour Meters Exist', 'Found ' + allResults.length + ' hour meters (no date filter)');
                        var dates = allResults.map(function(r) {
                            return r.getValue(CONFIG.HOUR_METER_FIELDS.reading_date);
                        });
                        log.audit('Latest Hour Meter Dates', dates.join(', '));
                    } else {
                        log.audit('No Hour Meters', 'No hour meters found for this equipment at all');
                    }
                } catch (e) {
                    log.error('All hour meters search failed', e);
                }
            }
            
            // Process results
            if (results && results.length > 0) {
                var startHours = parseFloat(results[0].getValue({
                    name: CONFIG.HOUR_METER_FIELDS.reading_value,
                    summary: 'MIN'
                })) || 0;
                
                var endHours = parseFloat(results[0].getValue({
                    name: CONFIG.HOUR_METER_FIELDS.reading_value,
                    summary: 'MAX'
                })) || 0;
                
                var readingCount = parseInt(results[0].getValue({
                    name: CONFIG.HOUR_METER_FIELDS.reading_date,
                    summary: 'COUNT'
                })) || 0;
                
                var hoursOperated = endHours - startHours;
                var daysDiff = getDaysDifference(startDate, endDate);
                
                log.audit('Hour Calculation', 'Start: ' + startHours + ', End: ' + endHours + ', Operated: ' + hoursOperated);
                
                var validationIssues = [];
                if (hoursOperated < 0) {
                    validationIssues.push({
                        type: 'METER_RESET',
                        message: 'Hour meter appears to have been reset'
                    });
                    hoursOperated = Math.abs(hoursOperated);
                }
                
                if (hoursOperated > daysDiff * 24) {
                    validationIssues.push({
                        type: 'EXCESSIVE_HOURS',
                        message: 'Hours exceed 24hrs/day'
                    });
                }
                
                var avgHoursPerDay = hoursOperated / daysDiff;
                if (avgHoursPerDay > 16 && avgHoursPerDay <= 24) {
                    validationIssues.push({
                        type: 'HIGH_USAGE',
                        message: 'High usage detected (' + avgHoursPerDay.toFixed(1) + ' hrs/day avg)'
                    });
                }
                
                var dataQuality = readingCount > 10 ? 'HIGH' : (readingCount > 5 ? 'MEDIUM' : 'LOW');
                
                return {
                    startReading: startHours,
                    endReading: endHours,
                    hoursOperated: hoursOperated,
                    readingCount: readingCount,
                    dataQuality: dataQuality,
                    avgHoursPerDay: avgHoursPerDay,
                    validationIssues: validationIssues,
                    daysPeriod: daysDiff,
                    searchedId: searchId
                };
            }
            
            // No data found
            return {
                hoursOperated: 0,
                readingCount: 0,
                dataQuality: 'NO_DATA',
                validationIssues: [{
                    type: 'NO_DATA',
                    message: 'No hour meter readings found for this period'
                }],
                searchedId: searchId
            };
        }

        /**
         * Get maintenance record hour meters for given case IDs
         * @param {Array} caseIds - Array of support case internal IDs
         * @returns {Object} Map of caseId -> hour meter reading
         */
        function getMaintenanceRecordHourMeters(caseIds) {
            var maintenanceMap = {};

            if (!caseIds || caseIds.length === 0) {
                return maintenanceMap;
            }

            try {
                log.debug('Searching for maintenance records', 'Cases: ' + caseIds.length);

                // Search maintenance records linked to these cases
                var mrSearch = search.create({
                    type: CONFIG.MAINTENANCE_RECORD_TYPE,
                    filters: [
                        ['custrecord_nxc_mr_case', 'anyof', caseIds]
                    ],
                    columns: [
                        'custrecord_nxc_mr_case',  // Case ID
                        'custrecord_nxc_mr_field_222',  // Hour meter reading
                        'custrecord_sna_nxc_mr_ref_1_img'  // Completed Correction image
                    ]
                });

                mrSearch.run().each(function(result) {
                    var caseId = result.getValue('custrecord_nxc_mr_case');
                    var hourMeter = result.getValue('custrecord_nxc_mr_field_222');
                    var completedCorrectionImg = result.getValue('custrecord_sna_nxc_mr_ref_1_img');

                    if (caseId) {
                        // Store the maintenance record data for this case
                        maintenanceMap[caseId] = {
                            hourMeter: hourMeter,
                            completedCorrectionImg: completedCorrectionImg
                        };

                        log.debug('Maintenance Record Found', {
                            caseId: caseId,
                            hourMeter: hourMeter,
                            hasImage: !!completedCorrectionImg
                        });
                    }

                    return true; // Continue processing
                });

                log.audit('Maintenance Records Retrieved',
                    'Found records for ' + Object.keys(maintenanceMap).length + ' of ' + caseIds.length + ' cases');

            } catch (e) {
                log.error('Error searching maintenance records', e.toString());
            }

            return maintenanceMap;
        }

        /**
         * Get invoice data - TASK DATE VERSION
         * Filters by task service dates instead of invoice dates
         */
        function getInvoiceData(equipmentId, startDate, endDate, excludeInternal) {
            log.audit('Starting Task-Based Invoice Search', {
                equipment: equipmentId,
                startDate: startDate,
                endDate: endDate
            });

            // Step 1: First find cases that have invoices for this equipment
            // This narrows down which cases we need to check for tasks
            var caseSearch = search.create({
                type: 'invoice',
                filters: [
                    ['mainline', 'is', 'T'],
                    'AND',
                    [CONFIG.INVOICE_FIELDS.equipment_body, 'anyof', equipmentId],
                    'AND',
                    [CONFIG.INVOICE_FIELDS.case_link, 'isnotempty', '']
                ],
                columns: [
                    search.createColumn({
                        name: CONFIG.INVOICE_FIELDS.case_link,
                        summary: 'GROUP'
                    })
                ]
            });

            var equipmentCaseIds = [];
            caseSearch.run().each(function(result) {
                var caseId = result.getValue({
                    name: CONFIG.INVOICE_FIELDS.case_link,
                    summary: 'GROUP'
                });
                if (caseId) {
                    equipmentCaseIds.push(caseId);
                }
                return true;
            });

            log.audit('Cases found for equipment', {
                equipmentId: equipmentId,
                caseCount: equipmentCaseIds.length
            });

            if (equipmentCaseIds.length === 0) {
                log.debug('No cases found', 'No cases with invoices for equipment ' + equipmentId);
                return {
                    invoices: [],
                    totalLabor: 0,
                    totalParts: 0,
                    totalOther: 0,
                    totalAmount: 0,
                    laborHours: 0,
                    invoiceCount: 0
                };
            }

            // Step 2: Find tasks for these cases within the date range using SuiteQL
            // Note: Search API doesn't support task-to-case joins, so we use SuiteQL
            var caseIds = [];  // Cases that have tasks in our date range
            var tasksByCase = {};  // Track tasks for each case

            // Build the case IDs list for the IN clause
            var caseIdList = equipmentCaseIds.join(',');

            // Use SuiteQL to find tasks linked to our cases within the date range
            // Use BUILTIN.DF() to get display text for custom list fields
            // LEFT JOIN to JSA record to get task photos
            var taskSql = "SELECT " +
                "t.id AS task_id, " +
                "t.title AS task_title, " +
                "t.startDate AS start_date, " +
                "t.status AS task_status, " +
                "e.entityid AS assigned_name, " +
                "BUILTIN.DF(t.custevent_nxc_task_result) AS task_result, " +
                "t.custevent_nx_actions_taken AS actions_taken, " +
                "sc.id AS case_id, " +
                "jsa.id AS jsa_id, " +
                "jsa.custrecord_sna_hul_nxc_ref_1_img AS img_1, " +
                "jsa.custrecord_sna_hul_nxc_ref_2_img AS img_2, " +
                "jsa.custrecord_sna_hul_nxc_ref_3_img AS img_3, " +
                "jsa.custrecord_sna_hul_nxc_ref_4_img AS img_4 " +
                "FROM Task t " +
                "INNER JOIN supportCase sc ON t.supportcase = sc.id " +
                "LEFT JOIN Employee e ON t.assigned = e.id " +
                "LEFT JOIN customrecord_nxc_jsa jsa ON jsa.custrecord_nxc_jsa_task = t.id " +
                "WHERE sc.id IN (" + caseIdList + ") " +
                "AND t.startDate >= TO_DATE(?, 'MM/DD/YYYY') " +
                "AND t.startDate <= TO_DATE(?, 'MM/DD/YYYY') " +
                "ORDER BY t.startDate DESC";

            try {
                var taskResults = query.runSuiteQL({
                    query: taskSql,
                    params: [startDate, endDate]
                });

                var taskResultSet = taskResults.asMappedResults();

                var processedTaskIds = {};  // Track tasks we've already added to avoid duplicates

                taskResultSet.forEach(function(row) {
                    var taskCaseId = String(row.case_id);
                    var taskId = row.task_id;

                    // Skip if we've already processed this task (avoids duplicates from JOINs)
                    if (processedTaskIds[taskId]) {
                        return;
                    }
                    processedTaskIds[taskId] = true;

                    // Track this case as having tasks in our date range
                    if (caseIds.indexOf(taskCaseId) === -1) {
                        caseIds.push(taskCaseId);
                    }

                    if (!tasksByCase[taskCaseId]) {
                        tasksByCase[taskCaseId] = [];
                    }

                    tasksByCase[taskCaseId].push({
                        taskId: taskId,
                        taskTitle: row.task_title,
                        taskDate: row.start_date,
                        taskStatus: row.task_status,
                        assignedName: row.assigned_name,
                        taskResult: row.task_result,
                        actionsTaken: row.actions_taken,
                        jsaId: row.jsa_id,
                        images: [
                            { id: row.img_1, name: 'Problem/Cause' },
                            { id: row.img_2, name: 'ID Plate' },
                            { id: row.img_3, name: 'Hour Meter' },
                            { id: row.img_4, name: 'Fault codes/extra' }
                        ].filter(function(img) { return img.id; })
                    });

                    log.debug('Task Found', {
                        taskId: taskId,
                        taskDate: row.start_date,
                        caseId: taskCaseId,
                        assigned: row.assigned_name,
                        jsaId: row.jsa_id,
                        img1: row.img_1,
                        img2: row.img_2,
                        img3: row.img_3,
                        img4: row.img_4
                    });
                });

                log.audit('Task Search Complete', {
                    tasksFound: taskResultSet.length,
                    casesWithTasks: caseIds.length
                });

            } catch (e) {
                log.error('SuiteQL Task Query Failed', {
                    error: e.message,
                    sql: taskSql
                });
            }

            log.audit('Tasks Found', {
                caseCount: caseIds.length,
                totalTasks: Object.keys(tasksByCase).reduce(function(sum, caseId) {
                    return sum + tasksByCase[caseId].length;
                }, 0)
            });

            if (caseIds.length === 0) {
                log.debug('No tasks found', 'No tasks with cases found in date range');
                return {
                    invoices: [],
                    totalLabor: 0,
                    totalParts: 0,
                    totalOther: 0,
                    totalAmount: 0,
                    laborHours: 0,
                    invoiceCount: 0
                };
            }

            // Step 3: Get invoice details for cases that have tasks in our date range
            // This ensures we only get invoices for equipment with service tasks in the period
            // Only include service repair documents (tranid starts with "W")
            var filters = [
                ['type', 'anyof', 'CustInvc'],
                'AND',
                ['tranid', 'startswith', 'W'],  // Only service repair invoices
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['taxline', 'is', 'F'],
                'AND',
                [CONFIG.INVOICE_FIELDS.case_link, 'anyof', caseIds],  // Invoices linked to cases with tasks
                'AND',
                [CONFIG.INVOICE_FIELDS.equipment_body, 'anyof', equipmentId]  // Double-check equipment
            ];
            
            // Note: We'll filter internal/warranty AFTER retrieving results
            // because the revenue stream text field may not filter properly in search
            
            var invoiceSearch = search.create({
                type: 'invoice',
                filters: filters,
                columns: [
                    'internalid',
                    'tranid',
                    'trandate',
                    'entity',
                    'memo',
                    'total',
                    CONFIG.INVOICE_FIELDS.revenue_stream,
                    search.createColumn({
                        name: 'name',
                        join: CONFIG.INVOICE_FIELDS.revenue_stream
                    }),
                    CONFIG.INVOICE_FIELDS.case_link,  // Case ID on invoice body
                    // Join to support case to get case details
                    search.createColumn({
                        name: 'casenumber',
                        join: CONFIG.INVOICE_FIELDS.case_link
                    }),
                    search.createColumn({
                        name: 'title',
                        join: CONFIG.INVOICE_FIELDS.case_link
                    }),
                    search.createColumn({
                        name: CONFIG.CASE_FIELDS.case_details,
                        join: CONFIG.INVOICE_FIELDS.case_link
                    }),
                    'line',
                    'item',
                    CONFIG.INVOICE_FIELDS.equipment_line,
                    CONFIG.INVOICE_FIELDS.service_code_type,
                    'quantity',
                    'rate',
                    'amount'
                ]
            });

            var invoiceMap = {};
            var totalLabor = 0;
            var totalParts = 0;
            var totalOther = 0;
            var laborHours = 0;

            invoiceSearch.run().each(function(result) {
                var invoiceId = result.getValue('tranid');
                var internalId = result.getValue('internalid');
                var serviceType = result.getValue(CONFIG.INVOICE_FIELDS.service_code_type);
                var amount = parseFloat(result.getValue('amount')) || 0;
                var quantity = parseFloat(result.getValue('quantity')) || 0;
                var rate = parseFloat(result.getValue('rate')) || 0;
                
                // Get revenue stream text with better fallback handling
                var revenueStreamText = result.getText({
                    name: 'name',
                    join: CONFIG.INVOICE_FIELDS.revenue_stream
                });
                
                if (!revenueStreamText) {
                    revenueStreamText = result.getText(CONFIG.INVOICE_FIELDS.revenue_stream);
                }
                
                if (!revenueStreamText) {
                    revenueStreamText = result.getValue(CONFIG.INVOICE_FIELDS.revenue_stream);
                }
                
                // Get case details directly from joined search columns
                var caseNumber = result.getValue({
                    name: 'casenumber',
                    join: CONFIG.INVOICE_FIELDS.case_link
                });
                var caseTitle = result.getValue({
                    name: 'title',
                    join: CONFIG.INVOICE_FIELDS.case_link
                });
                var caseDetails = result.getValue({
                    name: CONFIG.CASE_FIELDS.case_details,
                    join: CONFIG.INVOICE_FIELDS.case_link
                });
                var caseId = result.getValue(CONFIG.INVOICE_FIELDS.case_link);
                
                if (!invoiceMap[invoiceId]) {
                    invoiceMap[invoiceId] = {
                        id: internalId,
                        number: invoiceId,
                        date: result.getValue('trandate'),
                        customer: result.getText('entity'),
                        total: 0,
                        laborTotal: 0,
                        partsTotal: 0,
                        otherTotal: 0,
                        laborHours: 0,
                        lineItems: [],
                        revenueStream: revenueStreamText,
                        caseDetails: null  // Will be set below if case exists
                    };
                    
                    // Set case details if case is linked to this invoice
                    if (caseId && caseNumber) {
                        invoiceMap[invoiceId].caseDetails = {
                            number: caseNumber,
                            title: caseTitle,
                            details: caseDetails,
                            caseId: caseId
                        };
                        
                        log.debug('Case Linked to Invoice', {
                            invoice: invoiceId,
                            caseNumber: caseNumber,
                            hasDetails: !!caseDetails
                        });
                    }
                }
                
                invoiceMap[invoiceId].lineItems.push({
                    item: result.getText('item') || result.getValue('item'),
                    quantity: quantity,
                    rate: rate,
                    amount: amount,
                    type: serviceType === '2' ? 'Labor' : (serviceType === '1' ? 'Parts' : 'Other')
                });
                
                if (serviceType === '2') {
                    invoiceMap[invoiceId].laborTotal += amount;
                    invoiceMap[invoiceId].laborHours += quantity;
                    totalLabor += amount;
                    laborHours += quantity;
                } else if (serviceType === '1') {
                    invoiceMap[invoiceId].partsTotal += amount;
                    totalParts += amount;
                } else {
                    invoiceMap[invoiceId].otherTotal += amount;
                    totalOther += amount;
                }
                
                invoiceMap[invoiceId].total += amount;
                
                return true;
            });

            // Case details are now retrieved directly in the search above via join
            // No separate lookup needed!

            // Get maintenance record hour meters for all cases
            var caseIds = [];
            for (var key in invoiceMap) {
                if (invoiceMap[key].caseDetails && invoiceMap[key].caseDetails.caseId) {
                    caseIds.push(invoiceMap[key].caseDetails.caseId);
                }
            }

            var maintenanceHourMeters = {};
            if (caseIds.length > 0) {
                maintenanceHourMeters = getMaintenanceRecordHourMeters(caseIds);
            }

            var invoices = [];
            for (var key in invoiceMap) {
                var invoice = invoiceMap[key];

                // Add task information if available (through the case)
                if (invoice.caseDetails && invoice.caseDetails.caseId && tasksByCase[invoice.caseDetails.caseId]) {
                    invoice.tasks = tasksByCase[invoice.caseDetails.caseId];
                    // Use first task date for display
                    if (invoice.tasks.length > 0) {
                        invoice.serviceDate = invoice.tasks[0].taskDate;
                    }
                } else {
                    invoice.tasks = [];
                }

                // Add maintenance record data if available
                if (invoice.caseDetails && invoice.caseDetails.caseId && maintenanceHourMeters[invoice.caseDetails.caseId]) {
                    var mrData = maintenanceHourMeters[invoice.caseDetails.caseId];
                    invoice.hourMeter = mrData.hourMeter;
                    invoice.completedCorrectionImg = mrData.completedCorrectionImg;
                } else {
                    invoice.hourMeter = null;
                    invoice.completedCorrectionImg = null;
                }

                // Filter out internal/warranty invoices if checkbox is checked
                if (excludeInternal && invoice.revenueStream) {
                    var revenueStreamLower = invoice.revenueStream.toString().toLowerCase();
                    // Skip if revenue stream contains 'internal' or 'warranty'
                    if (revenueStreamLower.indexOf('internal') !== -1 || 
                        revenueStreamLower.indexOf('warranty') !== -1) {
                        log.debug('Excluding internal/warranty invoice', {
                            invoice: invoice.number,
                            revenueStream: invoice.revenueStream
                        });
                        continue; // Skip this invoice
                    }
                }
                
                invoices.push(invoice);
            }
            
            // Recalculate totals after filtering
            if (excludeInternal) {
                totalLabor = 0;
                totalParts = 0;
                totalOther = 0;
                laborHours = 0;
                
                invoices.forEach(function(inv) {
                    totalLabor += inv.laborTotal;
                    totalParts += inv.partsTotal;
                    totalOther += inv.otherTotal;
                    laborHours += inv.laborHours;
                });
            }
            
            // Sort invoices by date, newest first
            invoices.sort(function(a, b) {
                var dateA = new Date(a.date);
                var dateB = new Date(b.date);
                return dateB - dateA; // Descending order (newest first)
            });

            return {
                invoices: invoices,
                totalLabor: totalLabor,
                totalParts: totalParts,
                totalOther: totalOther,
                totalAmount: totalLabor + totalParts + totalOther,
                laborHours: laborHours,
                invoiceCount: invoices.length
            };
        }

        /**
         * Calculate summary metrics
         */
        function calculateSummary(reportData) {
            var totalCost = reportData.invoices.totalAmount || 0;
            var hoursOperated = reportData.hourMeter.hoursOperated || 0;
            
            return {
                totalRepairCost: totalCost,
                laborCost: reportData.invoices.totalLabor || 0,
                partsCost: reportData.invoices.totalParts || 0,
                otherCost: reportData.invoices.totalOther || 0,
                hoursOperated: hoursOperated,
                costPerHour: hoursOperated > 0 ? (totalCost / hoursOperated) : 0,
                repairCount: reportData.invoices.invoiceCount || 0,
                laborHours: reportData.invoices.laborHours || 0,
                avgRepairCost: reportData.invoices.invoiceCount > 0 ? 
                    (totalCost / reportData.invoices.invoiceCount) : 0
            };
        }

        /**
         * FIXED: Display results with improved compact layout
         */
        function displayResults(form, reportData) {
            // Compact Equipment Header
            var headerHtml = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); ' +
                'padding: 20px 25px; border-radius: 8px; color: white; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
            
            headerHtml += '<h2 style="margin: 0; font-size: 22px;">' + 
                (reportData.equipment.fleetCode || reportData.equipment.name) + '</h2>';
            
            headerHtml += '<div style="display: flex; flex-wrap: wrap; gap: 25px; margin-top: 12px; font-size: 14px;">';
            
            if (reportData.equipment.customerName) {
                headerHtml += '<div><strong>Customer:</strong> ' + reportData.equipment.customerName + '</div>';
            }
            if (reportData.equipment.siteName) {
                headerHtml += '<div><strong>Site:</strong> ' + reportData.equipment.siteName + '</div>';
            }
            if (reportData.equipment.serial) {
                headerHtml += '<div><strong>Serial:</strong> ' + reportData.equipment.serial + '</div>';
            }
            if (reportData.equipment.model) {
                headerHtml += '<div><strong>Model:</strong> ' + reportData.equipment.model + '</div>';
            }
            if (reportData.equipment.manufacturer) {
                headerHtml += '<div><strong>Manufacturer:</strong> ' + reportData.equipment.manufacturer + '</div>';
            }
            
            headerHtml += '</div>';
            
            if (reportData.hourMeter.validationIssues && reportData.hourMeter.validationIssues.length > 0) {
                headerHtml += '<div style="margin-top: 12px; padding: 6px 10px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px;">';
                headerHtml += '⚠️ ' + reportData.hourMeter.validationIssues.map(function(issue) {
                    return issue.message;
                }).join(' | ');
                headerHtml += '</div>';
            }
            
            headerHtml += '</div>';
            
            var headerField = form.addField({
                id: 'custpage_header',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Header'
            });
            headerField.defaultValue = headerHtml;

            // PRIMARY METRICS - Fixed 3 column layout
            var metricsHtml = '<div style="max-width: 1200px;">';
            metricsHtml += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">';
            
            // Cost per hour
            metricsHtml += '<div style="background: white; padding: 20px; border-radius: 8px; ' +
                'border-left: 4px solid #667eea; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
            metricsHtml += '<div style="color: #667eea; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Cost Per Hour</div>';
            metricsHtml += '<div style="font-size: 36px; font-weight: bold; color: #333; line-height: 1;">' + 
                formatCurrency(reportData.summary.costPerHour) + '</div>';
            metricsHtml += '</div>';
            
            // Total repair cost
            metricsHtml += '<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
            metricsHtml += '<div style="color: #666; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total Repair Cost</div>';
            metricsHtml += '<div style="font-size: 28px; font-weight: bold; color: #333;">' + 
                formatCurrency(reportData.summary.totalRepairCost) + '</div>';
            metricsHtml += '</div>';
            
            // Labor cost
            metricsHtml += '<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
            metricsHtml += '<div style="color: #666; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Labor Cost</div>';
            metricsHtml += '<div style="font-size: 24px; font-weight: bold; color: #333;">' + 
                formatCurrency(reportData.summary.laborCost) + '</div>';
            metricsHtml += '<div style="font-size: 12px; color: #999; margin-top: 4px;">' + 
                reportData.summary.laborHours.toFixed(1) + ' hours</div>';
            metricsHtml += '</div>';
            
            metricsHtml += '</div>';
            
            // SECONDARY METRICS - Fixed 5 column layout
            metricsHtml += '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px;">';
            
            // Parts cost
            metricsHtml += '<div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">';
            metricsHtml += '<div style="color: #999; font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">Parts Cost</div>';
            metricsHtml += '<div style="font-size: 20px; font-weight: 600;">' + 
                formatCurrency(reportData.summary.partsCost) + '</div>';
            metricsHtml += '</div>';
            
            // Hours operated
            var hoursColor = reportData.hourMeter.dataQuality === 'NO_DATA' ? '#dc3545' : 
                           (reportData.hourMeter.dataQuality === 'LOW' ? '#ffc107' : '#28a745');
            metricsHtml += '<div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">';
            metricsHtml += '<div style="color: #999; font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">Hours Operated</div>';
            metricsHtml += '<div style="font-size: 20px; font-weight: 600;">' + 
                reportData.summary.hoursOperated.toFixed(1) + '</div>';
            metricsHtml += '<div style="margin-top: 4px;"><span style="display: inline-block; padding: 2px 6px; ' +
                'background: ' + hoursColor + '; color: white; border-radius: 3px; font-size: 10px; font-weight: 600;">' + 
                reportData.hourMeter.dataQuality + '</span></div>';
            metricsHtml += '</div>';
            
            // Repairs
            metricsHtml += '<div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">';
            metricsHtml += '<div style="color: #999; font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">Repairs</div>';
            metricsHtml += '<div style="font-size: 20px; font-weight: 600;">' + 
                reportData.summary.repairCount + '</div>';
            metricsHtml += '</div>';
            
            // Total labor hours
            metricsHtml += '<div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">';
            metricsHtml += '<div style="color: #999; font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">Total Labor Hours</div>';
            metricsHtml += '<div style="font-size: 20px; font-weight: 600;">' + 
                reportData.summary.laborHours.toFixed(1) + '</div>';
            metricsHtml += '</div>';
            
            // Average repair cost
            metricsHtml += '<div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">';
            metricsHtml += '<div style="color: #999; font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">Avg Repair Cost</div>';
            metricsHtml += '<div style="font-size: 20px; font-weight: 600;">' + 
                formatCurrency(reportData.summary.avgRepairCost) + '</div>';
            metricsHtml += '</div>';
            
            metricsHtml += '</div>';
            metricsHtml += '</div>';
            
            var metricsField = form.addField({
                id: 'custpage_metrics',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Metrics'
            });
            metricsField.defaultValue = metricsHtml;

            // Repair details - ENHANCED VERSION
            if (reportData.invoices.invoices && reportData.invoices.invoices.length > 0) {
                var detailsHtml = '<div style="max-width: 1200px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
                detailsHtml += '<h3 style="margin-top: 0; font-size: 18px;">Repair Details (' + reportData.invoices.invoices.length + ' invoices)</h3>';
                detailsHtml += '<p style="font-size: 12px; color: #666; margin-bottom: 15px;">Showing most recent invoices first</p>';
                
                reportData.invoices.invoices.forEach(function(invoice, index) {
                    // Highlight the 3 most recent invoices with purple border
                    detailsHtml += '<details style="margin-bottom: 12px; border: 1px solid #e0e0e0; border-radius: 5px; padding: 12px;' + 
                                  (index < 3 ? ' border-left: 3px solid #667eea;' : '') + '">';
                    detailsHtml += '<summary style="cursor: pointer; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">';
                    detailsHtml += '<span>';
                    detailsHtml += invoice.number + ' - ';

                    // Show task date if available, otherwise invoice date
                    if (invoice.tasks && invoice.tasks.length > 0) {
                        detailsHtml += '<span style="color: #28a745;">Service: ' + invoice.serviceDate + '</span>';
                    } else {
                        detailsHtml += 'Invoice: ' + invoice.date;
                    }

                    // Add hour meter reading if available
                    if (invoice.hourMeter) {
                        detailsHtml += ' - <span style="color: #666; font-weight: normal;">' + invoice.hourMeter + ' hrs</span>';
                    } else {
                        detailsHtml += ' - <span style="color: #999; font-weight: normal; font-style: italic;">N/A</span>';
                    }

                    // Add revenue stream if available
                    if (invoice.revenueStream) {
                        detailsHtml += ' - <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: normal;">' + invoice.revenueStream + '</span>';
                    }

                    // Add "MOST RECENT" badge for first invoice
                    if (index === 0) {
                        detailsHtml += ' <span style="background: #667eea; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 8px;">MOST RECENT</span>';
                    }

                    detailsHtml += '</span>';
                    detailsHtml += '<span style="font-size: 16px; color: #667eea;">' + formatCurrency(invoice.total) + '</span>';
                    detailsHtml += '</summary>';
                    
                    detailsHtml += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">';

                    // Invoice summary fields at top
                    detailsHtml += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 15px;">';

                    if (invoice.customer) {
                        detailsHtml += '<div><strong>Customer:</strong> ' + invoice.customer + '</div>';
                    }

                    // Enhanced revenue stream display
                    if (invoice.revenueStream) {
                        detailsHtml += '<div><strong>Revenue Stream:</strong> <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px;">' +
                            invoice.revenueStream + '</span></div>';
                    }

                    if (invoice.laborTotal > 0) {
                        detailsHtml += '<div><strong>Labor:</strong> ' + formatCurrency(invoice.laborTotal) +
                            ' (' + invoice.laborHours.toFixed(1) + ' hrs)</div>';
                    }

                    if (invoice.partsTotal > 0) {
                        detailsHtml += '<div><strong>Parts:</strong> ' + formatCurrency(invoice.partsTotal) + '</div>';
                    }

                    if (invoice.otherTotal > 0) {
                        detailsHtml += '<div><strong>Other:</strong> ' + formatCurrency(invoice.otherTotal) + '</div>';
                    }

                    detailsHtml += '</div>';

                    // Add case details (always one case per invoice)
                    if (invoice.caseDetails && (invoice.caseDetails.details || invoice.caseDetails.title)) {
                        detailsHtml += '<div style="background: #f8f9fa; border-left: 3px solid #17a2b8; padding: 10px; margin-bottom: 15px; border-radius: 4px;">';
                        detailsHtml += '<div style="font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 5px;">Case Details';
                        if (invoice.caseDetails.number) {
                            detailsHtml += ' (Case #' + invoice.caseDetails.number + ')';
                        }
                        detailsHtml += '</div>';

                        if (invoice.caseDetails.title) {
                            detailsHtml += '<div style="font-weight: 600; margin-bottom: 5px;">' + invoice.caseDetails.title + '</div>';
                        }

                        if (invoice.caseDetails.details) {
                            // Escape HTML and preserve line breaks
                            var caseDetailsText = invoice.caseDetails.details
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/\n/g, '<br/>');
                            detailsHtml += '<div style="font-size: 13px; color: #333; line-height: 1.5;">' + caseDetailsText + '</div>';
                        }

                        detailsHtml += '</div>';
                    }

                    // Add Completed Correction image from Maintenance Record if available
                    if (invoice.completedCorrectionImg) {
                        detailsHtml += '<div style="margin-bottom: 15px; font-size: 12px;">';
                        detailsHtml += '<strong>Maintenance Record Photo:</strong> ';
                        var mrImgUrl;
                        if (String(invoice.completedCorrectionImg).indexOf('http') === 0 || String(invoice.completedCorrectionImg).indexOf('/') === 0) {
                            mrImgUrl = invoice.completedCorrectionImg;
                        } else {
                            mrImgUrl = '/app/common/media/mediaitem.nl?id=' + invoice.completedCorrectionImg;
                        }
                        detailsHtml += '<a href="' + mrImgUrl + '" target="_blank" style="color: #667eea;">Completed Correction</a>';
                        detailsHtml += '</div>';
                    }

                    // Add task details if available (may have multiple tasks)
                    if (invoice.tasks && invoice.tasks.length > 0) {
                        detailsHtml += '<div style="background: #f0f8ff; border-left: 3px solid #28a745; padding: 10px; margin-bottom: 15px; border-radius: 4px;">';
                        detailsHtml += '<div style="font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 5px;">Service Task Details (' + invoice.tasks.length + ' task' + (invoice.tasks.length > 1 ? 's' : '') + ')</div>';

                        invoice.tasks.forEach(function(task) {
                            detailsHtml += '<div style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">';
                            detailsHtml += '<strong>Task #' + task.taskId + '</strong>';
                            if (task.taskTitle) {
                                detailsHtml += ' - ' + task.taskTitle;
                            }
                            detailsHtml += '<br/>';

                            // Task metadata row
                            detailsHtml += '<div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 5px; font-size: 12px; color: #666;">';
                            detailsHtml += '<span><strong>Date:</strong> ' + task.taskDate + '</span>';
                            if (task.assignedName) {
                                detailsHtml += '<span><strong>Assigned:</strong> ' + task.assignedName + '</span>';
                            }
                            if (task.taskStatus) {
                                detailsHtml += '<span><strong>Status:</strong> ' + task.taskStatus + '</span>';
                            }
                            if (task.taskResult) {
                                detailsHtml += '<span><strong>Result:</strong> ' + task.taskResult + '</span>';
                            }
                            detailsHtml += '</div>';

                            // Actions taken
                            if (task.actionsTaken) {
                                detailsHtml += '<div style="margin-top: 5px; font-size: 12px; background: #f5f5f5; padding: 8px; border-radius: 4px;">';
                                detailsHtml += '<strong>Actions Taken:</strong><br/>';
                                var actionsText = task.actionsTaken
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/\n/g, '<br/>');
                                detailsHtml += actionsText;
                                detailsHtml += '</div>';
                            }

                            // JSA Photos
                            if (task.images && task.images.length > 0) {
                                detailsHtml += '<div style="margin-top: 8px; font-size: 12px;">';
                                detailsHtml += '<strong>Photos:</strong> ';
                                task.images.forEach(function(img, idx) {
                                    if (idx > 0) detailsHtml += ' | ';
                                    // Check if it's already a URL or just an ID
                                    var imgUrl;
                                    if (String(img.id).indexOf('http') === 0 || String(img.id).indexOf('/') === 0) {
                                        imgUrl = img.id;
                                    } else {
                                        // Try file record URL format
                                        imgUrl = '/app/common/media/mediaitem.nl?id=' + img.id;
                                    }
                                    detailsHtml += '<a href="' + imgUrl + '" target="_blank" style="color: #667eea;">' + img.name + '</a>';
                                });
                                detailsHtml += '</div>';
                            }

                            detailsHtml += '</div>';
                        });

                        detailsHtml += '</div>';
                    }

                    // Line items table
                    if (invoice.lineItems && invoice.lineItems.length > 0) {
                        detailsHtml += '<table style="width: 100%; font-size: 12px; border-collapse: collapse;">';
                        detailsHtml += '<thead><tr style="background: #f5f5f5;">';
                        detailsHtml += '<th style="padding: 5px; text-align: left;">Item</th>';
                        detailsHtml += '<th style="padding: 5px; text-align: center;">Type</th>';
                        detailsHtml += '<th style="padding: 5px; text-align: right;">Qty</th>';
                        detailsHtml += '<th style="padding: 5px; text-align: right;">Rate</th>';
                        detailsHtml += '<th style="padding: 5px; text-align: right;">Amount</th>';
                        detailsHtml += '</tr></thead><tbody>';
                        
                        invoice.lineItems.forEach(function(line) {
                            var typeColor = line.type === 'Labor' ? '#4CAF50' : 
                                          (line.type === 'Parts' ? '#2196F3' : '#999');
                            detailsHtml += '<tr>';
                            detailsHtml += '<td style="padding: 5px;">' + (line.item || 'N/A') + '</td>';
                            detailsHtml += '<td style="padding: 5px; text-align: center;"><span style="color: ' + 
                                typeColor + '; font-weight: bold;">' + line.type + '</span></td>';
                            detailsHtml += '<td style="padding: 5px; text-align: right;">' + line.quantity.toFixed(2) + '</td>';
                            detailsHtml += '<td style="padding: 5px; text-align: right;">' + formatCurrency(line.rate) + '</td>';
                            detailsHtml += '<td style="padding: 5px; text-align: right; font-weight: bold;">' + 
                                formatCurrency(line.amount) + '</td>';
                            detailsHtml += '</tr>';
                        });
                        
                        detailsHtml += '</tbody></table>';
                    }
                    
                    detailsHtml += '</div>';
                    detailsHtml += '</details>';
                });
                
                detailsHtml += '</div>';
                
                var detailsField = form.addField({
                    id: 'custpage_details',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Details'
                });
                detailsField.defaultValue = detailsHtml;
            }
        }

        /**
         * Handle PDF Export Request
         */
        function handlePdfExport(context) {
            try {
                log.audit('PDF Export Started', 'Generating fleet report PDF');

                // Get same parameters as normal request
                var equipmentId = context.request.parameters.custpage_equipment;
                var equipmentSearchText = context.request.parameters.custpage_equipment_search;
                var startDate = context.request.parameters.custpage_date_from;
                var endDate = context.request.parameters.custpage_date_to;
                var excludeInternal = context.request.parameters.custpage_exclude_internal === 'T';

                // Find equipment if using search text
                if (!equipmentId && equipmentSearchText) {
                    equipmentId = findEquipmentBySearch(equipmentSearchText);
                }

                // Validate required parameters
                if (!equipmentId || !startDate || !endDate) {
                    context.response.write('Error: Missing required parameters for PDF export');
                    return;
                }

                // Generate report data
                var reportData = generateReport(equipmentId, startDate, endDate, excludeInternal);

                // Create PDF
                var pdfFile = generatePdf(reportData, startDate, endDate);

                // Set response headers for download
                context.response.writeFile(pdfFile, true);

                log.audit('PDF Export Complete', 'PDF generated successfully');

            } catch (e) {
                log.error('PDF Export Error', e);
                context.response.write('Error generating PDF: ' + e.message);
            }
        }

        /**
         * Generate PDF from report data
         */
        function generatePdf(reportData, startDate, endDate) {
            var equipment = reportData.equipment;
            var fleetCode = equipment.fleetCode || equipment.name;

            // Create BFO XML template
            var xmlTemplate = generatePdfXml(reportData, startDate, endDate);

            log.debug('PDF XML Length', xmlTemplate.length + ' characters');

            // Render PDF
            var pdfRenderer = render.xmlToPdf({
                xmlString: xmlTemplate
            });

            // Set filename
            var filename = 'FleetReport_' + fleetCode + '_' + startDate.replace(/\//g, '-') + '.pdf';
            pdfRenderer.name = filename;

            return pdfRenderer;
        }

        /**
         * Generate BFO XML for PDF
         */
        function generatePdfXml(reportData, startDate, endDate) {
            var equipment = reportData.equipment;
            var summary = reportData.summary;
            var invoices = reportData.invoices.invoices || [];

            var xml = '<?xml version="1.0"?>\n';
            xml += '<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n';
            xml += '<pdf>\n';
            xml += '<head>\n';
            xml += '    <style type="text/css">\n';
            xml += '        body { font-family: sans-serif; font-size: 10pt; text-align: left; }\n';
            xml += '        h1 { font-size: 18pt; color: #667eea; margin-bottom: 10pt; text-align: left; }\n';
            xml += '        h2 { font-size: 14pt; color: #333; margin-top: 15pt; margin-bottom: 8pt; text-align: left; }\n';
            xml += '        h3 { font-size: 12pt; color: #333; margin-top: 10pt; margin-bottom: 5pt; text-align: left; }\n';
            xml += '        p { text-align: left; margin: 0; }\n';
            xml += '        .header-box { background-color: #667eea; color: white; padding: 15pt; margin-bottom: 15pt; text-align: left; }\n';
            xml += '        .metric-box { border: 1pt solid #e0e0e0; padding: 10pt; margin-bottom: 10pt; text-align: left; }\n';
            xml += '        .metric-label { font-size: 8pt; color: #666; text-transform: uppercase; font-weight: bold; text-align: left; }\n';
            xml += '        .metric-value { font-size: 24pt; font-weight: bold; color: #333; text-align: left; }\n';
            xml += '        .invoice-separator { border-top: 3pt solid #667eea; margin: 20pt 0 15pt 0; padding-top: 0; }\n';
            xml += '        .case-box { background-color: #f8f9fa; border-left: 3pt solid #17a2b8; padding: 8pt; margin-bottom: 8pt; text-align: left; }\n';
            xml += '        .task-box { background-color: #f0f8ff; border-left: 3pt solid #28a745; padding: 8pt; margin-bottom: 8pt; text-align: left; }\n';
            xml += '        .invoice-number { font-size: 14pt; font-weight: bold; color: #333; margin: 0; }\n';
            xml += '        .invoice-total { font-size: 16pt; font-weight: bold; color: #667eea; }\n';
            xml += '        .label { font-weight: bold; }\n';
            xml += '        .small-text { font-size: 8pt; color: #666; text-align: left; }\n';
            xml += '        table { width: 100%; border-collapse: collapse; table-layout: auto; }\n';
            xml += '        th { background-color: #f5f5f5; padding: 5pt; text-align: left; font-weight: bold; }\n';
            xml += '        td { padding: 5pt; border-bottom: 1pt solid #e0e0e0; text-align: left; }\n';
            xml += '        tbody { page-break-inside: auto; }\n';
            xml += '        tr { page-break-inside: avoid; page-break-after: auto; }\n';
            xml += '        thead { display: table-header-group; }\n';
            xml += '        tfoot { display: table-footer-group; }\n';
            xml += '        .photo-link { color: #667eea; text-decoration: underline; }\n';
            xml += '    </style>\n';
            xml += '</head>\n';
            xml += '<body>\n';

            // Header section
            xml += '<div class="header-box">\n';
            xml += '    <h1>Fleet Report - Equipment Cost Analysis</h1>\n';
            xml += '    <p style="font-size: 14pt; margin: 0;">' + escapeXml(equipment.fleetCode || equipment.name) + '</p>\n';
            xml += '    <p style="font-size: 10pt; margin: 5pt 0 0 0;">Period: ' + escapeXml(startDate) + ' to ' + escapeXml(endDate) + '</p>\n';

            // Equipment details
            xml += '    <table style="margin-top: 10pt; table-layout: auto;">\n';
            xml += '        <tr>\n';
            if (equipment.customerName) {
                xml += '            <td align="left" style="border: none; padding-right: 15pt; white-space: normal;"><span class="label">Customer:</span> ' + escapeXml(equipment.customerName) + '</td>\n';
            }
            if (equipment.siteName) {
                xml += '            <td align="left" style="border: none; padding-right: 15pt; white-space: normal;"><span class="label">Site:</span> ' + escapeXml(equipment.siteName) + '</td>\n';
            }
            xml += '        </tr>\n';
            xml += '        <tr>\n';
            if (equipment.serial) {
                xml += '            <td align="left" style="border: none; padding-right: 15pt; white-space: normal;"><span class="label">Serial:</span> ' + escapeXml(equipment.serial) + '</td>\n';
            }
            if (equipment.model) {
                xml += '            <td align="left" style="border: none; padding-right: 15pt; white-space: normal;"><span class="label">Model:</span> ' + escapeXml(equipment.model) + '</td>\n';
            }
            if (equipment.manufacturer) {
                xml += '            <td align="left" style="border: none; padding-right: 15pt; white-space: normal;"><span class="label">Manufacturer:</span> ' + escapeXml(equipment.manufacturer) + '</td>\n';
            }
            xml += '        </tr>\n';
            xml += '    </table>\n';
            xml += '</div>\n';

            // Metrics section - 3 column layout
            xml += '<h2>Summary Metrics</h2>\n';
            xml += '<table style="margin-bottom: 15pt;">\n';
            xml += '    <tr>\n';
            xml += '        <td style="width: 33%; border: 1pt solid #e0e0e0; border-left: 4pt solid #667eea; padding: 10pt; vertical-align: top;">\n';
            xml += '            <p style="font-size: 8pt; color: #666; text-transform: uppercase; font-weight: bold; margin: 0 0 5pt 0;">Cost Per Hour</p>\n';
            xml += '            <p style="font-size: 24pt; font-weight: bold; color: #333; margin: 0;">' + formatCurrency(summary.costPerHour) + '</p>\n';
            xml += '        </td>\n';
            xml += '        <td style="width: 33%; border: 1pt solid #e0e0e0; padding: 10pt; vertical-align: top;">\n';
            xml += '            <p style="font-size: 8pt; color: #666; text-transform: uppercase; font-weight: bold; margin: 0 0 5pt 0;">Total Repair Cost</p>\n';
            xml += '            <p style="font-size: 20pt; font-weight: bold; color: #333; margin: 0;">' + formatCurrency(summary.totalRepairCost) + '</p>\n';
            xml += '        </td>\n';
            xml += '        <td style="width: 33%; border: 1pt solid #e0e0e0; padding: 10pt; vertical-align: top;">\n';
            xml += '            <p style="font-size: 8pt; color: #666; text-transform: uppercase; font-weight: bold; margin: 0 0 5pt 0;">Labor Cost</p>\n';
            xml += '            <p style="font-size: 18pt; font-weight: bold; color: #333; margin: 0;">' + formatCurrency(summary.laborCost) + '</p>\n';
            xml += '            <p style="font-size: 8pt; color: #666; margin: 3pt 0 0 0;">' + summary.laborHours.toFixed(1) + ' hours</p>\n';
            xml += '        </td>\n';
            xml += '    </tr>\n';
            xml += '</table>\n';

            // Secondary metrics - 2 rows
            xml += '<table style="margin-bottom: 15pt; table-layout: auto;">\n';
            xml += '    <tr>\n';
            xml += '        <td align="left" style="border: none; padding: 2pt 15pt 2pt 2pt; white-space: normal;"><span class="label">Parts Cost:</span> ' + formatCurrency(summary.partsCost) + '</td>\n';
            xml += '        <td align="left" style="border: none; padding: 2pt 15pt 2pt 2pt; white-space: normal;"><span class="label">Hours Operated:</span> ' + summary.hoursOperated.toFixed(1) + '</td>\n';
            xml += '        <td align="left" style="border: none; padding: 2pt 15pt 2pt 2pt; white-space: normal;"><span class="label">Repairs:</span> ' + summary.repairCount + '</td>\n';
            xml += '        <td align="left" style="border: none; padding: 2pt 15pt 2pt 2pt; white-space: normal;"><span class="label">Avg Repair:</span> ' + formatCurrency(summary.avgRepairCost) + '</td>\n';
            xml += '    </tr>\n';
            xml += '</table>\n';

            // Invoice details
            if (invoices && invoices.length > 0) {
                xml += '<h2>Repair Details (' + invoices.length + ' invoices)</h2>\n';
                xml += '<p class="small-text">Showing most recent invoices first</p>\n';

                invoices.forEach(function(invoice, index) {
                    // Invoice separator (not for first invoice)
                    if (index > 0) {
                        xml += '<div class="invoice-separator"></div>\n';
                    }

                    // Invoice header - simple, no wrapper
                    xml += '<table style="margin-bottom: 8pt;">\n';
                    xml += '    <tr>\n';
                    xml += '        <td style="border: none; width: 70%;"><h3 class="invoice-number">' + escapeXml(invoice.number) + '</h3></td>\n';
                    xml += '        <td style="border: none; width: 30%; text-align: right;"><span class="invoice-total">' + formatCurrency(invoice.total) + '</span></td>\n';
                    xml += '    </tr>\n';
                    xml += '</table>\n';

                    // Invoice summary
                    xml += '<table style="margin-bottom: 10pt; table-layout: auto;">\n';
                    xml += '    <tr>\n';

                    // Date (task date if available)
                    if (invoice.tasks && invoice.tasks.length > 0) {
                        xml += '        <td align="left" style="border: none; padding-right: 10pt; white-space: normal;"><span class="label">Service Date:</span> <span style="color: #28a745;">' + escapeXml(invoice.serviceDate) + '</span></td>\n';
                    } else {
                        xml += '        <td align="left" style="border: none; padding-right: 10pt; white-space: normal;"><span class="label">Invoice Date:</span> ' + escapeXml(invoice.date) + '</td>\n';
                    }

                    // Hour meter
                    if (invoice.hourMeter) {
                        xml += '        <td align="left" style="border: none; padding-right: 10pt; white-space: normal;"><span class="label">Hour Meter:</span> ' + escapeXml(invoice.hourMeter) + ' hrs</td>\n';
                    } else {
                        xml += '        <td align="left" style="border: none; padding-right: 10pt; white-space: normal;"><span class="label">Hour Meter:</span> <span style="font-style: italic; color: #999;">N/A</span></td>\n';
                    }

                    // Customer
                    if (invoice.customer) {
                        xml += '        <td align="left" style="border: none; padding-right: 10pt; white-space: normal;"><span class="label">Customer:</span> ' + escapeXml(invoice.customer) + '</td>\n';
                    }

                    // Revenue stream
                    if (invoice.revenueStream) {
                        xml += '        <td align="left" style="border: none; padding-right: 10pt; white-space: normal;"><span class="label">Revenue:</span> ' + escapeXml(invoice.revenueStream) + '</td>\n';
                    }

                    xml += '    </tr>\n';
                    xml += '</table>\n';

                    // Cost breakdown
                    xml += '<table style="margin-bottom: 10pt; table-layout: auto;">\n';
                    xml += '    <tr>\n';
                    if (invoice.laborTotal > 0) {
                        xml += '        <td align="left" style="border: none; padding: 2pt 10pt 2pt 2pt; white-space: normal;"><span class="label">Labor:</span> ' + formatCurrency(invoice.laborTotal) + ' (' + invoice.laborHours.toFixed(1) + ' hrs)</td>\n';
                    }
                    if (invoice.partsTotal > 0) {
                        xml += '        <td align="left" style="border: none; padding: 2pt 10pt 2pt 2pt; white-space: normal;"><span class="label">Parts:</span> ' + formatCurrency(invoice.partsTotal) + '</td>\n';
                    }
                    if (invoice.otherTotal > 0) {
                        xml += '        <td align="left" style="border: none; padding: 2pt 10pt 2pt 2pt; white-space: normal;"><span class="label">Other:</span> ' + formatCurrency(invoice.otherTotal) + '</td>\n';
                    }
                    xml += '    </tr>\n';
                    xml += '</table>\n';

                    // Case details
                    if (invoice.caseDetails && (invoice.caseDetails.details || invoice.caseDetails.title)) {
                        xml += '<div class="case-box">\n';
                        xml += '        <p style="margin: 0 0 5pt 0;" class="small-text">CASE DETAILS';
                        if (invoice.caseDetails.number) {
                            xml += ' (Case #' + escapeXml(invoice.caseDetails.number) + ')';
                        }
                        xml += '</p>\n';

                        if (invoice.caseDetails.title) {
                            xml += '        <p style="margin: 0 0 5pt 0; font-weight: bold;">' + escapeXml(invoice.caseDetails.title) + '</p>\n';
                        }

                        if (invoice.caseDetails.details) {
                            xml += '        <p style="margin: 0;">' + escapeXml(invoice.caseDetails.details) + '</p>\n';
                        }

                        xml += '    </div>\n';
                    }

                    // Maintenance Record photo - removed text link, showing thumbnail at end instead

                    // Task details
                    if (invoice.tasks && invoice.tasks.length > 0) {
                        xml += '    <div class="task-box">\n';
                        xml += '        <p style="margin: 0 0 5pt 0;" class="small-text">SERVICE TASK DETAILS (' + invoice.tasks.length + ' task' + (invoice.tasks.length > 1 ? 's' : '') + ')</p>\n';

                        invoice.tasks.forEach(function(task) {
                            xml += '        <div style="padding: 5pt 0; border-bottom: 1pt solid #e0e0e0;">\n';
                            xml += '            <p style="margin: 0 0 3pt 0; font-weight: bold;">Task #' + task.taskId;
                            if (task.taskTitle) {
                                xml += ' - ' + escapeXml(task.taskTitle);
                            }
                            xml += '</p>\n';

                            // Task metadata
                            xml += '            <p style="margin: 0; font-size: 9pt; color: #666;">\n';
                            xml += '                <span class="label">Date:</span> ' + escapeXml(task.taskDate);
                            if (task.assignedName) {
                                xml += ' | <span class="label">Assigned:</span> ' + escapeXml(task.assignedName);
                            }
                            if (task.taskStatus) {
                                xml += ' | <span class="label">Status:</span> ' + escapeXml(task.taskStatus);
                            }
                            if (task.taskResult) {
                                xml += ' | <span class="label">Result:</span> ' + escapeXml(task.taskResult);
                            }
                            xml += '            </p>\n';

                            // Actions taken
                            if (task.actionsTaken) {
                                xml += '            <div style="margin-top: 5pt; background-color: #f5f5f5; padding: 5pt;">\n';
                                xml += '                <p style="margin: 0; font-weight: bold; font-size: 9pt;">Actions Taken:</p>\n';
                                xml += '                <p style="margin: 3pt 0 0 0; font-size: 9pt;">' + escapeXml(task.actionsTaken) + '</p>\n';
                                xml += '            </div>\n';
                            }

                            // JSA Photos - removed text links, showing thumbnails at end instead

                            xml += '        </div>\n';
                        });

                        xml += '    </div>\n';
                    }

                    // Line items table
                    if (invoice.lineItems && invoice.lineItems.length > 0) {
                        xml += '    <table style="margin-top: 10pt; font-size: 9pt;">\n';
                        xml += '        <thead>\n';
                        xml += '            <tr>\n';
                        xml += '                <th style="text-align: left;">Item</th>\n';
                        xml += '                <th style="text-align: center;">Type</th>\n';
                        xml += '                <th style="text-align: right;">Qty</th>\n';
                        xml += '                <th style="text-align: right;">Rate</th>\n';
                        xml += '                <th style="text-align: right;">Amount</th>\n';
                        xml += '            </tr>\n';
                        xml += '        </thead>\n';
                        xml += '        <tbody>\n';

                        invoice.lineItems.forEach(function(line) {
                            xml += '            <tr>\n';
                            xml += '                <td>' + escapeXml(line.item || 'N/A') + '</td>\n';
                            xml += '                <td style="text-align: center; font-weight: bold;">' + escapeXml(line.type) + '</td>\n';
                            xml += '                <td style="text-align: right;">' + line.quantity.toFixed(2) + '</td>\n';
                            xml += '                <td style="text-align: right;">' + formatCurrency(line.rate) + '</td>\n';
                            xml += '                <td style="text-align: right; font-weight: bold;">' + formatCurrency(line.amount) + '</td>\n';
                            xml += '            </tr>\n';
                        });

                        xml += '        </tbody>\n';
                        xml += '    </table>\n';
                    }

                    // Photo thumbnails section - ONLY IN PDF
                    var allPhotos = [];

                    // Collect Maintenance Record photo
                    if (invoice.completedCorrectionImg) {
                        allPhotos.push({
                            id: invoice.completedCorrectionImg,
                            name: 'Completed Correction'
                        });
                    }

                    // Collect JSA photos from tasks
                    if (invoice.tasks && invoice.tasks.length > 0) {
                        invoice.tasks.forEach(function(task) {
                            if (task.images && task.images.length > 0) {
                                task.images.forEach(function(img) {
                                    allPhotos.push(img);
                                });
                            }
                        });
                    }

                    // Display photo thumbnails if any exist
                    if (allPhotos.length > 0) {
                        xml += '    <div class="photo-section">\n';
                        xml += '        <p style="font-weight: bold; font-size: 10pt; margin: 15pt 0 10pt 0; padding-top: 10pt; border-top: 2pt solid #e0e0e0;">Photos (' + allPhotos.length + ')</p>\n';
                        xml += '        <table style="table-layout: fixed; border: none;">\n';

                        // Display photos in rows of 2
                        var photoCount = 0;
                        allPhotos.forEach(function(photo) {
                            // Get image as base64 for PDF embedding
                            var imgData = '';
                            var imgType = '';
                            try {
                                var imageFile = file.load({ id: photo.id });
                                var fileContent = imageFile.getContents();
                                var fileType = imageFile.fileType;

                                // Determine MIME type
                                if (fileType === file.Type.PNGIMAGE) {
                                    imgType = 'image/png';
                                } else if (fileType === file.Type.JPGIMAGE) {
                                    imgType = 'image/jpeg';
                                } else if (fileType === file.Type.GIFIMAGE) {
                                    imgType = 'image/gif';
                                } else {
                                    // Default to jpeg for unknown types
                                    imgType = 'image/jpeg';
                                }

                                // Convert to base64
                                imgData = 'data:' + imgType + ';base64,' + fileContent;

                                log.debug('Image loaded for PDF', 'Photo: ' + photo.name + ', ID: ' + photo.id + ', Type: ' + imgType);
                            } catch (e) {
                                log.error('Could not load image for PDF', 'Photo ID: ' + photo.id + ', Error: ' + e.message);
                                imgData = '';
                            }

                            if (imgData) {
                                // Start new row every 2 images
                                if (photoCount % 2 === 0) {
                                    xml += '            <tr>\n';
                                }

                                xml += '                <td align="center" style="width: 50%; border: none; padding: 5pt; vertical-align: top;">\n';
                                xml += '                    <p style="font-size: 8pt; font-weight: bold; margin: 0 0 5pt 0;">' + escapeXml(photo.name) + '</p>\n';
                                xml += '                    <img src="' + imgData + '" width="150" height="150" style="border: 1pt solid #ccc;" />\n';
                                xml += '                </td>\n';

                                photoCount++;

                                // Close row every 2 images
                                if (photoCount % 2 === 0) {
                                    xml += '            </tr>\n';
                                }
                            }
                        });

                        // Close the last row if it has an odd number of photos
                        if (photoCount % 2 !== 0) {
                            xml += '                <td style="width: 50%; border: none;"></td>\n'; // Empty cell
                            xml += '            </tr>\n';
                        }

                        xml += '        </table>\n';
                        xml += '    </div>\n';
                    }

                    // End of invoice - no closing div needed
                });
            } else {
                xml += '<p>No repair invoices found for this period.</p>\n';
            }

            xml += '</body>\n';
            xml += '</pdf>';

            return xml;
        }

        /**
         * Escape XML special characters
         */
        function escapeXml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }

        /**
         * Utility functions
         */
        function getDaysDifference(startDate, endDate) {
            var start = new Date(startDate);
            var end = new Date(endDate);
            var timeDiff = end.getTime() - start.getTime();
            var dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            return dayDiff;
        }

        function getFirstDayOfMonth() {
            var today = new Date();
            return new Date(today.getFullYear(), today.getMonth(), 1);
        }

        function formatCurrency(amount) {
            if (isNaN(amount)) return '$0.00';
            return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        return {
            onRequest: onRequest
        };
    });