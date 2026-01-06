/*
* Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author fshaikh
*
* Script brief description:
* CS script deployed on Sales Order  Record used for:
* - set default values for location,department, Revenue Stream
*
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2025/02/10                            fshaikh         Initial Version -
*/


/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {

    function pageInit(context) {
        try {
            if (context.mode !== 'create') {
                return;
            }

            var rec = context.currentRecord;

            var formId = rec.getValue({ fieldId: 'customform' });
            log.debug("formId",formId);

            if (formId != '121') {
                return; // Exit if it's not the Rental Sales Order form
            }

            var userObj = runtime.getCurrentUser();
            log.debug("userObj",userObj);

            var employeeLocation = search.lookupFields({
                        type: 'employee',
                        id: userObj.id,
                        columns: ['location']
                    }).location[0].value;

            //var employeeLocation = userObj.location;
            log.debug("employeeLocation",employeeLocation);

            if (employeeLocation) {
                rec.setValue({
                    fieldId: 'location',
                    value: employeeLocation
                });
            }

            // 2) Set Department = 23 (Rental)
            rec.setValue({
                fieldId: 'department',
                value: 23
            });

            // 3) Set Revenue Stream = 416 (External : Rental : Sales : Rentals)
            rec.setValue({
                fieldId: 'cseg_sna_revenue_st',
                value: 416
            });

            var departmentValue = rec.getValue({ fieldId: 'department' });
            log.debug("departmentValue",departmentValue);

            log.debug("Set All the values")
        } catch (e) {
            log.error('Error in pageInit:', e.name + ' - ' + e.message);
        }
    }

    function fieldChanged(context) {
        try {
            var rec = context.currentRecord;
            var fieldId = context.fieldId;

            if (fieldId == 'entity'|| fieldId == 'customform') {

                var formId = rec.getValue({ fieldId: 'customform' });
                if (formId != '121') {
                    log.debug("form is not 121")
                    return; // Exit if it's not the Rental Sales Order form
                }
    
                var customerId = rec.getValue({ fieldId: 'entity' });
                log.debug("customerId",customerId);
                
                if (!customerId) {
                    return; 
                }
    
                var userObj = runtime.getCurrentUser();

                var employeeLocation = search.lookupFields({
                        type: 'employee',
                        id: userObj.id,
                        columns: ['location']
                    }).location[0].value;


                //var employeeLocation = userObj.location;
                log.debug("fieldChanged employeeLocation",employeeLocation);
    
                if (employeeLocation) {
                    rec.setValue({
                        fieldId: 'location',
                        value: employeeLocation
                    });
                }
    
                // Set Department = 23 (Rental)
                rec.setValue({
                    fieldId: 'department',
                    value: 23
                });
    
                // Set Revenue Stream = 416 (External : Rental : Sales : Rentals)
                rec.setValue({
                    fieldId: 'cseg_sna_revenue_st',
                    value: 416
                });

                var department = rec.getValue({ fieldId: 'department' });
                log.debug("department ",department);

                if (!department) {
                    rec.setValue({
                        fieldId: 'department',
                        value: 23
                    });
                }

            }

        } catch (e) {
            console.error('Error in fieldChanged:', e.name + ' - ' + e.message);
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };
});
