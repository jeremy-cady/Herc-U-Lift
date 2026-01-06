/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author cparba
*
* Script brief description:
* This is a suitelet that will display the number of lines processed and that will the MR script which is responsible for updating the lines
*
* Revision History:
*
* Date			Issue/Case		Author			Issue Fix Summary
* =============================================================================================
* 2023/12/04					cparba          Initial version
*
*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/workflow', 'N/search', 'N/redirect', 'N/url', 'N/task'],
    function(serverWidget, record, redirect, workflow, search, redirect, url, task) {
    function onRequest(context) {
        const PROCESS_STATUS = {
            'completed': 2,
            'inProgress': 3,
            'failed': 1
        };

        //if (context.request.method === 'GET') {
            try{
                let stActionType = context.request.parameters.custparam_actionType;
                log.debug('stActionType', stActionType);

                /*let formTitle = '';

                if(stActionType == 'recalculateRate'){
                    formTitle = 'Recalculating Rate';
                } else if(stActionType == 'updateRevStreamRecalcRate'){
                    formTitle = 'Updating Revenue Stream and Recalculating Rate';
                } else if(stActionType == 'refreshSuitelet'){
                    formTitle = 'Recalculating Rate';
                }*/

                let form = serverWidget.createForm({
                    title: 'Recalculating Rate'
                });
                form.clientScriptModulePath = './sna_hul_cs_recalculate_rate_rev_stream.js';

                if(stActionType == 'refreshSuitelet'){
                    let stCustomRecordId = context.request.parameters.custparam_customRecordId;

                    let objSOLinesProcessedRec = record.load({
                        type: 'customrecord_sna_hul_so_lines_processed',
                        id: stCustomRecordId
                    });
                    let iNumOfLinesProcessed = objSOLinesProcessedRec.getValue({ fieldId: 'custrecord_sna_hul_so_lines_processed' });
                    let stSOId = objSOLinesProcessedRec.getValue({ fieldId: 'custrecord_sna_hul_sales_order' });
                    let stProcessedStatus = objSOLinesProcessedRec.getText({ fieldId: 'custrecord_sna_hul_process_status' });

                    //Display Suitelet
                    form.addButton({
                        id: "custpage_refresh",
                        label: "Refresh",
                        functionName: `refreshSuitelet(${stCustomRecordId})`
                    });

                    let salesOrderField = form.addField({
                        id : 'custpage_sales_order',
                        type : serverWidget.FieldType.SELECT,
                        label : 'Sales Order',
                        source: 'salesorder'
                    });
                    salesOrderField.defaultValue = stSOId;
                    salesOrderField.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });
                    let processStatusField = form.addField({
                        id : 'custpage_process_status',
                        type : serverWidget.FieldType.TEXT,
                        label : 'Process Status'
                    });
                    processStatusField.defaultValue = stProcessedStatus;
                    processStatusField.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });
                    let numOfLinesField = form.addField({
                        id : 'custpage_num_of_lines',
                        type : serverWidget.FieldType.INTEGER,
                        label : 'Number of Lines Processed'
                    });
                    numOfLinesField.defaultValue = iNumOfLinesProcessed;
                    numOfLinesField.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });
                    context.response.writePage(form);
                } else {
                    let stSOId = context.request.parameters.custparam_soId;
                    log.debug('stSOId', stSOId);

                    var objCustomRecSearchResult = search.create({
                        type: "customrecord_sna_hul_so_lines_processed",
                        filters: [
                            ["custrecord_sna_hul_process_status","anyof",PROCESS_STATUS.inProgress],
                            "AND",
                            ["custrecord_sna_hul_sales_order","anyof",stSOId]
                        ],
                        columns: [
                            search.createColumn({name: "internalid"})
                        ]
                    }).run().getRange({ start: 0, end: 10 });

                    if(objCustomRecSearchResult.length == 0) {
                        let objSOLinesProcessedRec = record.create({
                            type: 'customrecord_sna_hul_so_lines_processed'
                        });
                        objSOLinesProcessedRec.setValue({fieldId: 'custrecord_sna_hul_sales_order', value: stSOId});
                        objSOLinesProcessedRec.setValue({fieldId: 'custrecord_sna_hul_so_lines_processed', value: 0});
                        objSOLinesProcessedRec.setValue({
                            fieldId: 'custrecord_sna_hul_process_status',
                            value: PROCESS_STATUS.inProgress
                        });
                        let stSOLPId = objSOLinesProcessedRec.save();
                        log.debug('stSOLPId', stSOLPId);

                        let objScriptTask = task.create({
                            taskType: task.TaskType.MAP_REDUCE
                        });
                        objScriptTask.scriptId = 'customscript_sna_hul_mr_recalc_rate_revs';
                        objScriptTask.deploymentId = 'customdeploy_sna_hul_mr_recalc_rate_revs';
                        objScriptTask.params = {
                            'custscript_sna_hul_action_type': stActionType,
                            'custscript_sna_hul_so_id': stSOId,
                            'custscript_sna_hul_customrec_id': stSOLPId
                        };
                        let scriptTaskId = objScriptTask.submit();
                        log.debug('scriptTaskId', scriptTaskId);

                        //Display Suitelet
                        form.addButton({
                            id: "custpage_refresh",
                            label: "Refresh",
                            functionName: `refreshSuitelet(${stSOLPId})`
                        });

                        let salesOrderField = form.addField({
                            id: 'custpage_sales_order',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Sales Order',
                            source: 'salesorder'
                        });
                        salesOrderField.defaultValue = stSOId;
                        salesOrderField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                        let processStatusField = form.addField({
                            id: 'custpage_process_status',
                            type: serverWidget.FieldType.TEXT,
                            label: 'Process Status'
                        });
                        processStatusField.defaultValue = 'In Progress';
                        processStatusField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                        let numOfLinesField = form.addField({
                            id: 'custpage_num_of_lines',
                            type: serverWidget.FieldType.INTEGER,
                            label: 'Number of Lines Processed'
                        });
                        numOfLinesField.defaultValue = 0;
                        numOfLinesField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                        context.response.writePage(form);
                    } else if(objCustomRecSearchResult.length > 0) {
                        log.debug('objCustomRecSearchResult', objCustomRecSearchResult);
                        log.debug('objCustomRecSearchResult length', objCustomRecSearchResult.length);
                        let stCustomRecId = objCustomRecSearchResult[0].id;
                        log.debug('stCustomRecId', stCustomRecId);
                        /*redirect.toSuitelet({
                            scriptId: 'customscript_sna_hul_sl_recalc_rate_revs',
                            deploymentId: 'customdeploy_sna_hul_sl_recalc_rate_revs',
                            parameters: {
                                'custparam_actionType': 'refreshSuitelet',
                                'custparam_customRecordId': stCustomRecId
                            }
                        });*/
                        let stSuiteletURL = url.resolveScript({
                            scriptId: 'customscript_sna_hul_sl_recalc_rate_revs',
                            deploymentId: 'customdeploy_sna_hul_sl_recalc_rate_revs',
                            //returnExternalUrl: false,
                            params: {
                                'custparam_actionType': 'refreshSuitelet',
                                'custparam_customRecordId': stCustomRecId
                            }
                        });

                        redirect.redirect({
                            url: stSuiteletURL
                        });
                    }
                }
            } catch(ex) {
                log.error('Catch onRequest', ex);
            }
        //}
    }

    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined)
            || (stValue.constructor === Array && stValue.length == 0)
            || (stValue.constructor === Object && (function (v) {
                for (var k in v) return false;
                return true;
            })(stValue)));
    }

    return {
        onRequest: onRequest
    };
});