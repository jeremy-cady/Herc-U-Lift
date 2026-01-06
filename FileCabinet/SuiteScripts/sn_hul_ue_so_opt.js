/*
* Copyright (c) 2024, ScaleNorth LLC and/or its affiliates. All rights reserved.
*
* @author elausin
*
* Script brief description:
* Optimized UE Scripts:
*     SNA | UE | SO | Set Code on Item Lines
*     SNA | UE | Link Purchase Order (Line)
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2025/03/26                             elausin        Initial version
*/
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/runtime'],

    (search, runtime) => {

        const beforeSubmit = (context) => {
            //const start2 = Date.now();
            //const start = new Date().getTime();
            const contextType = context.type;

            log.debug("afterSubmit triggered");
            log.debug("context.type", context.type);
            log.debug("runtime.executionContext", runtime.executionContext);

            if (contextType == 'delete') return;

            let currentScript = runtime.getCurrentScript();
            let param_rentaldelivery = currentScript.getParameter({name: 'custscript_sn_rental_delivery_internal'});
            let param_checkin = currentScript.getParameter({name: 'custscript_sn_task_type_check_in'});

            if (contextType == context.UserEventType.CREATE || contextType == context.UserEventType.EDIT || contextType == context.UserEventType.DROPSHIP || contextType == context.UserEventType.SPECIALORDER || contextType == context.UserEventType.APPROVE) {
                try {
                    var currRecord = context.newRecord;
                    var lineItemCount = currRecord.getLineCount({ sublistId: "item" });
                    var nxcCaseID = currRecord.getValue({
                        fieldId: 'custbody_nx_case'
                    });
                    let tranid = currRecord.getValue({fieldId: 'tranid'});
                    let firstletter = tranid.charAt(0);
                    log.debug('firstletter', firstletter);

                    if (!isEmpty(nxcCaseID)) {
                        //Get Next Service Case > Revenue Stream
                        var nxcCaseRevStream = search.lookupFields({
                            type: 'supportcase',
                            id: nxcCaseID,
                            columns: 'cseg_sna_revenue_st'
                        });

                        log.debug('nxcCaseRevStream', nxcCaseRevStream);
                        log.debug('nxcCaseRevStream.cseg_sna_revenue_st', nxcCaseRevStream.cseg_sna_revenue_st);

                        if (!isEmpty(nxcCaseRevStream.cseg_sna_revenue_st)) {
                            var revStreamID = nxcCaseRevStream.cseg_sna_revenue_st[0].value;

                            log.debug('revStreamID', revStreamID);

                            var revStreamLookup = search.lookupFields({
                                type: 'customrecord_cseg_sna_revenue_st',
                                id: revStreamID,
                                columns: ['custrecord_sna_hul_revstream_repair_code', 'custrecord_sna_hul_revstream_work_code', 'custrecord_sna_hul_revstream_group_code']
                            });

                            log.debug('revStreamLookup', revStreamLookup);

                            var revStream_repairCodeLookup = revStreamLookup.custrecord_sna_hul_revstream_repair_code;
                            var revStream_workCodeLookup = revStreamLookup.custrecord_sna_hul_revstream_work_code;
                            var revStream_groupCodeLookup = revStreamLookup.custrecord_sna_hul_revstream_group_code;

                            log.debug('revStream_repairCodeLookup', revStream_repairCodeLookup);
                            log.debug('revStream_workCodeLookup', revStream_workCodeLookup);
                            log.debug('revStream_groupCodeLookup', revStream_groupCodeLookup);

                            if (!isEmpty(revStream_repairCodeLookup)) { //Repair Code has values, Work Code + Group Code will also have values
                                var revStream_repairCode = revStream_repairCodeLookup[0].value;
                                var revStream_workCode = revStream_workCodeLookup[0].value;
                                var revStream_groupCode = revStream_groupCodeLookup[0].value;

                                log.debug('revStream_repairCode', revStream_repairCode);
                                log.debug('revStream_workCode', revStream_workCode);
                                log.debug('revStream_groupCode', revStream_groupCode);

                                for (var itemIndex = 0; itemIndex < lineItemCount; itemIndex++) {

                                    // aduldulao 7/24/25
                                    if (contextType == context.UserEventType.EDIT) {
                                        setToClose(param_rentaldelivery, param_checkin, currRecord, itemIndex, firstletter);
                                    }

                                    currRecord.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_sna_repair_code',
                                        line: itemIndex,
                                        value: revStream_repairCode
                                    });

                                    currRecord.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_sna_work_code',
                                        line: itemIndex,
                                        value: revStream_workCode
                                    });

                                    currRecord.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_sna_group_code',
                                        line: itemIndex,
                                        value: revStream_groupCode
                                    });

                                    var createdPO = currRecord.getSublistValue({
                                        sublistId: "item",
                                        fieldId: "createdpo",
                                        line: line
                                    });

                                    log.debug('createdPO', createdPO);

                                    if (!isEmpty(createdPO)) {
                                        currRecord.setSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_linked_po",
                                            line: line,
                                            value: createdPO
                                        });
                                    }
                                }
                            } else { //Repair Code, Work Code, and Group Code don't have value

                                log.debug('Repair/Work/Group Code dont have value. Check Retain Task Codes column.');

                                for (var itemIndex = 0; itemIndex < lineItemCount; itemIndex++) {
                                    log.debug('Line index', itemIndex);

                                    // aduldulao 7/24/25
                                    if (contextType == context.UserEventType.EDIT) {
                                        setToClose(param_rentaldelivery, param_checkin, currRecord, itemIndex, firstletter);
                                    }

                                    var retainTaskCodes = currRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_sna_hul_nxc_retain_task_codes',
                                        line: itemIndex
                                    });

                                    log.debug('retainTaskCodes', retainTaskCodes);

                                    if (retainTaskCodes) { //If Retain Task Codes column = T, get previous line's Repair/Work/Group Codes and set it on the current line's

                                        var revStream_repairCode = currRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_sna_repair_code',
                                            line: itemIndex - 1
                                        });

                                        log.debug('Previous line > revStream_repairCode', revStream_repairCode);

                                        var revStream_workCode = currRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_sna_work_code',
                                            line: itemIndex - 1
                                        });

                                        log.debug('Previous line > revStream_workCode', revStream_workCode);

                                        var revStream_groupCode = currRecord.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_sna_group_code',
                                            line: itemIndex - 1
                                        });

                                        log.debug('Previous line > revStream_groupCode', revStream_groupCode);

                                        currRecord.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_sna_repair_code',
                                            line: itemIndex,
                                            value: revStream_repairCode
                                        });

                                        currRecord.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_sna_work_code',
                                            line: itemIndex,
                                            value: revStream_workCode
                                        });

                                        currRecord.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_sna_group_code',
                                            line: itemIndex,
                                            value: revStream_groupCode
                                        });
                                    }

                                    var createdPO = currRecord.getSublistValue({
                                        sublistId: "item",
                                        fieldId: "createdpo",
                                        line: itemIndex
                                    });

                                    log.debug('createdPO', createdPO);

                                    if (!isEmpty(createdPO)) {
                                        currRecord.setSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_linked_po",
                                            line: itemIndex,
                                            value: createdPO
                                        });
                                    }
                                }
                            }
                        } else {
                            for (var line = 0; line < lineItemCount; line++) {

                                log.debug('line', line);

                                // aduldulao 7/24/25
                                if (contextType == context.UserEventType.EDIT) {
                                    setToClose(param_rentaldelivery, param_checkin, currRecord, line, firstletter);
                                }

                                var createdPO = currRecord.getSublistValue({
                                    sublistId: "item",
                                    fieldId: "createdpo",
                                    line: line
                                });
                                log.debug('createdPO', createdPO);

                                if (!isEmpty(createdPO)) {
                                    currRecord.setSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_sna_linked_po",
                                        line: line,
                                        value: createdPO
                                    });
                                }
                            }
                        }
                    } else {
                        for (var line = 0; line < lineItemCount; line++) {

                            log.debug('line', line);

                            // aduldulao 7/24/25
                            if (contextType == context.UserEventType.EDIT) {
                                setToClose(param_rentaldelivery, param_checkin, currRecord, line, firstletter);
                            }

                            var createdPO = currRecord.getSublistValue({
                                sublistId: "item",
                                fieldId: "createdpo",
                                line: line
                            });
                            log.debug('createdPO', createdPO);

                            if (!isEmpty(createdPO)) {
                                currRecord.setSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_sna_linked_po",
                                    line: line,
                                    value: createdPO
                                });
                            }
                        }
                    }


                } catch (err) {
                    log.audit({
                        title: err.name,
                        details: err.message
                    });
                }
            }

            /*const end = new Date().getTime();
            const time = end - start;

            const end2 = Date.now();
            const time2 = end2 - start2;
            log.debug('Execution time: ' + time2 + 'ms');
            log.debug('Execution time: ' + time);*/
        }

        /**
         * Set line to closed
         * @param param_rentaldelivery
         * @param param_checkin
         * @param currRecord
         * @param itemIndex
         * @param firstletter
         */
        const setToClose = (param_rentaldelivery, param_checkin, currRecord, itemIndex, firstletter) => {
            const stLoggerTitle = 'setToClose';

            /*The script will check each item line and set the Closed column field to TRUE when:
                - Item is “Rental Delivery (internal)” (Item ID: 101189)
                - Sales Order Document Number Starts with “R”
                - Transaction Column Field Service Task: Field Service Task Type ({custcol_nx_task.custevent_nx_task_type}) = Check-in
                - Line Amount = 0*/

            if (firstletter == 'R') {
                let item = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: itemIndex
                });
                let tasktype = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_sn_nx_task_type",
                    line: itemIndex
                });
                let lineamt = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "amount",
                    line: itemIndex
                });

                if (item == param_rentaldelivery && tasktype == param_checkin && lineamt == 0) {
                    currRecord.setSublistValue({sublistId: 'item', fieldId: 'isclosed', value: true, line: itemIndex});
                }
            }
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }


        return {beforeSubmit}

    });