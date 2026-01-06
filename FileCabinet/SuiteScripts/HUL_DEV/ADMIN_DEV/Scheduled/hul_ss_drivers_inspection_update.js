/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log', 'N/runtime'], 
    function(search, record, log, runtime) {
    
    // CONFIGURATION
    var INSPECTION_RECORD_TYPE = 'customrecord_hul_employee_drivers_inspec'; // Internal ID for drivers inspection record
    var LOCATION_FIELD = 'custrecord_hul_driveinp_drivers_inp_loc'; // Location field on inspection record
    var DATETIME_FIELD = 'custrecord_hul_driveinp_datetime'; // DateTime field on inspection record
    
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} context
     * @param {string} context.type - The context in which the script is executed. It is one of the values from the context.InvocationType enum.
     * @Since 2015.2
     */
    function execute(context) {
        try {
            log.audit('Script Started', 'Starting drivers inspection date update process');
            
            // Step 1: Get all unique locations from the drivers inspection records
            var locationData = getLatestInspectionsByLocation();
            log.audit('Location Data Retrieved', 'Found ' + Object.keys(locationData).length + ' locations with inspections');
            
            // Step 2: Get all employees with locations
            var allEmployeeLocations = getAllEmployeeLocations();
            
            // Step 3: Update employees with the latest inspection dates or clear if no inspection found
            updateEmployeesWithInspectionDates(locationData, allEmployeeLocations);
            
            log.audit('Script Completed', 'Drivers inspection date update process completed successfully');
            
        } catch (error) {
            log.error('Script Error', 'Error in main execution: ' + error.toString());
        }
    }
    
    /**
     * Get the latest inspection datetime for each location
     * @returns {Object} Object with location as key and datetime as value
     */
    function getLatestInspectionsByLocation() {
        var locationData = {};
        
        try {
            // Create search to get the most recent inspection record for each location
            var inspectionSearch = search.create({
                type: INSPECTION_RECORD_TYPE,
                filters: [],
                columns: [
                    search.createColumn({
                        name: LOCATION_FIELD,
                        summary: search.Summary.GROUP
                    }),
                    search.createColumn({
                        name: DATETIME_FIELD,
                        summary: search.Summary.MAX
                    })
                ]
            });
            
            var searchResultCount = inspectionSearch.runPaged().count;
            log.audit('Inspection Records Found', searchResultCount + ' unique locations found');
            
            inspectionSearch.run().each(function(result) {
                var locationId = result.getValue({
                    name: LOCATION_FIELD,
                    summary: search.Summary.GROUP
                });
                
                var latestDateTime = result.getValue({
                    name: DATETIME_FIELD,
                    summary: search.Summary.MAX
                });
                
                if (locationId && latestDateTime) {
                    locationData[locationId] = latestDateTime;
                    log.debug('Location Data', 'Location ID: ' + locationId + ', Latest DateTime: ' + latestDateTime);
                }
                
                return true; // Continue iteration
            });
            
        } catch (error) {
            log.error('Search Error', 'Error getting inspection records: ' + error.toString());
        }
        
        return locationData;
    }
    
    /**
     * Get all employees with locations
     * @returns {Array} Array of employee data objects
     */
    function getAllEmployeeLocations() {
        var employees = [];
        
        try {
            var employeeSearch = search.create({
                type: search.Type.EMPLOYEE,
                filters: [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['custentity_nx_location', 'isnotempty', '']
                ],
                columns: [
                    'internalid',
                    'entityid',
                    'custentity_nx_location',
                    'custentity_last_drivers_insp_date'
                ]
            });
            
            employeeSearch.run().each(function(result) {
                employees.push({
                    id: result.getValue('internalid'),
                    name: result.getValue('entityid'),
                    locationId: result.getValue('custentity_nx_location'),
                    currentInspDate: result.getValue('custentity_last_drivers_insp_date')
                });
                return true;
            });
            
            log.audit('Employees Found', employees.length + ' active employees with locations');
            
        } catch (error) {
            log.error('Employee Search Error', 'Error getting employees: ' + error.toString());
        }
        
        return employees;
    }
    
    /**
     * Update employees with their latest inspection dates based on location
     * @param {Object} locationData - Object with location as key and date as value
     * @param {Array} employees - Array of all employees with locations
     */
    function updateEmployeesWithInspectionDates(locationData, employees) {
        var updatedCount = 0;
        var clearedCount = 0;
        var errorCount = 0;
        
        employees.forEach(function(employee) {
            try {
                // Check governance units
                var remainingUnits = runtime.getCurrentScript().getRemainingUsage();
                if (remainingUnits < 100) {
                    log.error('Governance Limit', 'Script approaching governance limit. Remaining units: ' + remainingUnits);
                    return;
                }
                
                var newInspDate = locationData[employee.locationId] || null;
                var updateNeeded = false;
                var values = {};
                
                // Determine if update is needed
                if (newInspDate && newInspDate !== employee.currentInspDate) {
                    // Update with new date
                    values['custentity_last_drivers_insp_date'] = newInspDate;
                    updateNeeded = true;
                    updatedCount++;
                    log.debug('Employee Update', 
                        'Employee: ' + employee.name + ' (ID: ' + employee.id + ') ' +
                        'updated with inspection datetime: ' + newInspDate);
                } else if (!newInspDate && employee.currentInspDate) {
                    // Clear the date field as no inspection found for this location
                    values['custentity_last_drivers_insp_date'] = '';
                    updateNeeded = true;
                    clearedCount++;
                    log.debug('Employee Cleared', 
                        'Employee: ' + employee.name + ' (ID: ' + employee.id + ') ' +
                        'inspection date cleared - no recent inspection for location: ' + employee.locationId);
                }
                
                // Perform update if needed
                if (updateNeeded) {
                    record.submitFields({
                        type: record.Type.EMPLOYEE,
                        id: employee.id,
                        values: values,
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                }
                
            } catch (error) {
                errorCount++;
                log.error('Update Error', 
                    'Error updating employee ' + employee.name + ' (ID: ' + employee.id + '): ' + 
                    error.toString());
            }
        });
        
        log.audit('Update Summary', 
            'Updated ' + updatedCount + ' employees with new dates. ' +
            'Cleared ' + clearedCount + ' employees with no recent inspections. ' +
            'Errors: ' + errorCount);
    }
    
    return {
        execute: execute
    };
    
});