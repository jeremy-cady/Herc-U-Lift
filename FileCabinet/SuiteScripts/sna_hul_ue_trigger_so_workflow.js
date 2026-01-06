/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author sdesilva
 *
 * Script brief description:
 * User event script to trigger workflow: SNA HUL Sales Order Approval
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2023/01/03                           mdesilva       Initial version
 * 2024/02/28                           mdesilva       Added try catch for RCRD_HAS_BEEN_CHANGED
 * 2024/03/27        Case Task 169556   caranda        Modified search and use record.submitFields
 *
 */
define(['N/search', 'N/record', 'N/currentRecord', 'N/task'],
    function(search, record, currentRecord, task) {
        var mod_utils = {};

        function afterSubmit(context) {
            log.debug('beforeSubmit', 'context.type: ' + context.type);
            //if (context.type == 'create') {
            if (context.type != 'delete') {
                var caseRecord = context.newRecord;
                var caseStatus = caseRecord.getValue('status');
                log.debug('beforeSubmit', 'caseRecord ID: ' + caseRecord.id);
                log.debug('beforeSubmit', 'caseStatus: ' + caseStatus);

                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters: [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["custbody_nx_case", "anyof", caseRecord.id]
                    ],
                    columns: [
                        "internalid", "custbody_sna_hul_service_bucket_"
                    ]
                });
                var searchResultCount = salesorderSearchObj.runPaged().count;
                if (!mod_utils.isEmpty(searchResultCount)) {
                    log.debug('salesorderSearchObj', 'SO Internal ID Count: ' + searchResultCount);
                    var so_id;
                    salesorderSearchObj.run().each(function(result) {
                        log.debug('search', 'result: ' + JSON.stringify(result));
                        so_id = result.getValue({
                            name: "internalid"
                        });
                        log.debug('salesorderSearchObj', 'so_id: ' + so_id);

                        var maxRetries = 5;
                        var retries = 0;
                        var success = false;
                        var SOservicebucket = result.getValue({name: 'custbody_sna_hul_service_bucket_'});
                        while (!success && retries < maxRetries) {
                            try {
                                log.debug('TRY', 'retries: ' + retries);

                                /*var recSalesOrder = record.load({
                                    type: 'salesorder',
                                    id: so_id
                                });*/
                                //log.debug('salesorderSearchObj', 'caseStatus: ' + caseStatus);
                                //log.debug('recSalesOrder', 'recSalesOrder: ' + JSON.stringify(recSalesOrder));

                                //5 = CLOSED
                                if (caseStatus == '5') {

                                    //var SOservicebucket = recSalesOrder.getValue('custbody_sna_hul_service_bucket_');
                                    log.debug('salesorderSearchObj', 'SOservicebucket: ' + SOservicebucket);

                                    if (SOservicebucket == 14) { //14 internal id of service bucket 3
                                        //log.debug('salesorderSearchObj', 'SOservicebucket: ' + SOservicebucket);
                                        /*recSalesOrder.setValue({
                                            fieldId: 'custbody_sna_hul_case_closed',
                                            value: true
                                        });*/

                                        var soVal = {
                                            'custbody_sna_hul_case_closed': true
                                        }
                                        log.debug('beforeSubmit', 'Case Closed: Checked');

                                        //var recSalesOrdersaved = recSalesOrder.save();
                                        var recSalesOrdersaved = record.submitFields({
                                            type: record.Type.SALES_ORDER,
                                            id: so_id,
                                            values: soVal
                                        })
                                        log.debug('TRY', 'recSalesOrdersaved: ' + recSalesOrdersaved);


                                        //trigger wf
                                        var workflowTask = task.create({
                                            taskType: task.TaskType.WORKFLOW_TRIGGER
                                        });
                                        workflowTask.recordType = 'salesorder';
                                        workflowTask.recordId = so_id;
                                        workflowTask.workflowId = 10; //Prod
                                        //workflowTask.workflowId = 154;
                                        var taskId = workflowTask.submit();
                                        log.debug('beforeSubmit', 'taskId: ' + taskId);
                                    }
                                    return true;
                                } else {
                                    /*recSalesOrder.setValue({
                                        fieldId: 'custbody_sna_hul_case_closed',
                                        value: false
                                    });*/
                                    log.debug('beforeSubmit', 'Case Closed: UnChecked');

                                    //var recSalesOrdersaved = recSalesOrder.save();

                                    var recSalesOrdersaved = record.submitFields({
                                        type: record.Type.SALES_ORDER,
                                        id: so_id,
                                        values: {
                                            'custbody_sna_hul_case_closed': false
                                        }
                                    })
                                    log.debug('beforeSubmit', 'recSalesOrdersaved: ' + recSalesOrdersaved);
                                    return true;
                                }


                                success = true;

                            } catch (e) {
                                if (e.name === 'RCRD_HAS_BEEN_CHANGED') {
                                    // Attempt to save the record again
                                    log.error('CATCH', 'Record has been changed. Attempting to save again.');
                                    retries++;
                                } else {
                                    throw e;
                                }
                            }
                        }

                    });

                }

            }
        }

        mod_utils.isEmpty = function(stValue) {
            return ((stValue === 0 || stValue === '' || stValue === "" || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        };

        return {
            afterSubmit: afterSubmit

        }
    });