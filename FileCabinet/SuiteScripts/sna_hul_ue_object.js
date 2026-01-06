/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script for dynamic filter of which fields are visible on the Configuration tab of the Object record
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/10/4                             aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/ui/serverWidget', 'N/runtime', 'N/task','N/record'],
    /**
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (search, serverWidget, runtime, task,record) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
        }

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try {
                if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE) return;
                if (scriptContext.type != scriptContext.UserEventType.VIEW) return;

                var currrec = scriptContext.newRecord;
                var form = scriptContext.form;

                var segment = currrec.getText({fieldId: 'cseg_sna_hul_eq_seg'});
                log.debug({title: 'beforeLoad', details: 'segment: ' + segment});

                var noruleflds = [
                    'custrecord_sna_raised_platform_height',
                    'custrecord_sna_mitsubishi_fb16pnt_fb20pn',
                    'custrecord_sna_skyjack_3219',
                    'custrecord_sna_skyjack_1056th',
                    'custrecord_sna_skyjack_60aj',
                    'custrecord_sna_skyjack_60t',
                    'custrecord_sna_jlg_e400',
                    'custrecord_sna_nifty_sd64',
                    'custrecord_sna_nifty_tm42t',
                    'custrecord_sna_mast_cylinder_numbers',
                    'custrecord_sna_axle_on_rail_serial',
                    'custrecord_sna_trackmobile_titan_railcar'
                ];
                var arrfinalallflds = [];
                var arrfinalflds = '';
                var temp_arrfinalflds = '';
                var resfound = false;

                var columns = [];
                columns.push(search.createColumn({name: 'custrecord_sna_hul_configurable_fields'}));
                columns.push(search.createColumn({name: 'cseg_sna_hul_eq_seg'}));

                var srch = search.create({type: 'customrecord_sna_object_config_rule', columns: columns});

                srch.run().each(function(result) {
                    var finalflds = result.getValue({name: 'custrecord_sna_hul_configurable_fields'});
                    var seg = result.getText({name: 'cseg_sna_hul_eq_seg'}); // FORKLIFT : CLASS IV

                    // When the Rental Object Configurator Rule Segment String is within the HUL Category Segment String of the Object selected, display all Object Record fields based on the Internal Ids listed under configurable field Text box
                    if (segment.includes(seg) && !isEmpty(segment) && !isEmpty(seg) && !resfound) {
                        arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                        resfound = true;
                    }

                    // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
                    if (isEmpty(seg) && isEmpty(segment)  && !resfound) {
                        arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                        resfound = true;
                    }

                    // it is assumed that there is 1 Rule with no segment for non matching or empty object segments
                    if (isEmpty(seg) && !isEmpty(segment)) {
                        temp_arrfinalflds = finalflds.replace(/\r\n/g, '').split(',');
                    }

                    var allflds = finalflds.replace(/\r\n/g, '').split(',');
                    arrfinalallflds = allflds.concat(arrfinalallflds.filter((fld) => allflds.indexOf(fld) < 0)); // remove dup

                    return true;
                });

                // no match found
                if (isEmpty(arrfinalflds)) {
                    arrfinalflds = temp_arrfinalflds;
                }

                log.debug({title: 'beforeLoad', details: 'arrfinalflds: ' + JSON.stringify(arrfinalflds)});
                log.debug({title: 'beforeLoad', details: 'arrfinalallflds: ' + JSON.stringify(arrfinalallflds)});

                // loop through all fields
                for (var d = 0; d < arrfinalallflds.length; d++) {
                    var fldobj = form.getField({id: arrfinalallflds[d]});

                    if (!isEmpty(fldobj)) {
                        if (inArray(arrfinalallflds[d], arrfinalflds)) {
                            fldobj.updateDisplayType({displayType: serverWidget.FieldDisplayType.NORMAL});
                        }
                        else {
                            fldobj.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                        }
                    }
                }

                // loop through no rule fields
                for (var x = 0; x < noruleflds.length; x++) {
                    var fldobj = form.getField({id: noruleflds[x]});

                    if (!isEmpty(fldobj)) {
                        if (inArray(noruleflds[x], arrfinalflds)) {
                            fldobj.updateDisplayType({displayType: serverWidget.FieldDisplayType.NORMAL});
                        }
                        else {
                            fldobj.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                        }
                    }
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try {
log.audit('context type details', 'scriptContext.type: ' + scriptContext.type + ', DELETE: ' + scriptContext.UserEventType.DELETE + ', EDIT: ' + scriptContext.UserEventType.EDIT + ', XEDIT: ' + scriptContext.UserEventType.XEDIT);

                // Executing the code only when the record is being updated.
                if(scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.XEDIT) {
                    let oldRec = scriptContext.oldRecord;
                    let newRec = scriptContext.newRecord;
                    let recId = newRec.id;
                    let custApplyBookVal = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_ue_object_cust_applied' });
                    let oldCommBookValue = oldRec.getValue({ fieldId: 'custrecord_sna_hul_obj_commissionable_bv' });
                    let newCommBookValue = newRec.getValue({ fieldId: 'custrecord_sna_hul_obj_commissionable_bv' });
log.audit('Field Values', 'oldCommBookValue: ' + oldCommBookValue + ', newCommBookValue: ' + newCommBookValue + ', custApplyBookVal: ' + custApplyBookVal);

                    // Executing the code only when the Commissionable Book Value is changed and customer parameter is not empty.
                    if(!isEmpty(oldCommBookValue) && oldCommBookValue != newCommBookValue && !isEmpty(custApplyBookVal)) {

                        // Call MR to update the SO.
                        let mrTask = task.create({
                            taskType: task.TaskType.MAP_REDUCE,
                            scriptId: 'customscript_sna_hul_mr_upd_socombookval',
                            params: { 'custscript_sna_mr_upd_so_object': recId,
                                'custscript_sna_mr_upd_so_cmv': newCommBookValue,
                                'custscript_sna_mr_upd_so_cust_applied': custApplyBookVal }
                        });
                        let mrTaskId = mrTask.submit();
                        log.audit('mrTaskId', mrTaskId);
                    }
                }

                if (scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.XEDIT) {
                    var oldRec = scriptContext.oldRecord;
                    var newRec = scriptContext.newRecord;

                    var oldFleetCode = oldRec.getValue({ fieldId: 'custrecord_sna_fleet_code' });
                    log.audit('oldFleetCode', oldFleetCode);

                    var newFleetCode = newRec.getValue({ fieldId: 'custrecord_sna_fleet_code' });
                    log.audit('newFleetCode', newFleetCode);

                    var oldSerialNo = oldRec.getValue({ fieldId: 'custrecord_sna_serial_no' });
                    log.audit('oldSerialNo', oldSerialNo);

                    var newSerialNo = newRec.getValue({ fieldId: 'custrecord_sna_serial_no' });
                    log.audit('newSerialNo', newSerialNo);

                    var objectId = newRec.getValue({ fieldId: 'name' });
                    log.audit('objectId', objectId);

                    var numericPart = parseInt(objectId.substring(1));
                    log.audit('Numeric part', numericPart);

                    if (newFleetCode != oldFleetCode || newSerialNo != oldSerialNo) {
                        // Execute the search to find related Purchase Orders
                        var purchaseorderSearchObj = search.create({
                            type: "purchaseorder",
                            filters: [
                                ["type", "anyof", "PurchOrd"], 
                                "AND", 
                                [
                                    ["custcol_sna_po_fleet_code", "isnotempty", ""],
                                    "OR",
                                    ["custcol_sna_hul_eq_serial", "isnotempty", ""]
                                ], 
                                "AND", 
                                ["formulanumeric: CASE WHEN {quantity} != {quantityshiprecv} THEN 1 ELSE 0 END", "equalto", "1"]
                            ],
                            columns: [
                                search.createColumn({name: "internalid"}),
                                search.createColumn({name: "custcol_sna_hul_fleet_no"})
                            ]
                        });
            
                        var searchResultCount = purchaseorderSearchObj.runPaged().count;
                        log.audit('searchResultCount', searchResultCount);
                        if (searchResultCount > 0) {
                            purchaseorderSearchObj.run().each(function(result) {
                                // Update the PO line item
                                var poId = result.getValue({name: "internalid"});
                                log.audit('poId', poId);

                                var poObjectId = result.getValue({name: "custcol_sna_hul_fleet_no"});
                                log.audit('poObjectId', poObjectId);

                                if (numericPart == poObjectId) {
                                    var poRecord = record.load({type: 'purchaseorder', id: poId, isDynamic: true});
                                    log.audit('poRecord', JSON.stringify(poRecord));
    
                                    var numLines = poRecord.getLineCount({sublistId: 'item'});
                                    log.audit('numLines', numLines);
                                    
                                    for (var i = 0; i < numLines; i++) {
                                        var fleetCode = poRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_po_fleet_code', line: i});
                                        log.audit('PO fleetCode', fleetCode);
    
                                        var serialNo = poRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_eq_serial', line: i});
                                        log.audit('PO serialNo', serialNo);
                                        
                                        var lineNumericPart = poRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: i });
                                        log.audit('PO lineNumericPart', lineNumericPart);

                                        if (numericPart == lineNumericPart) {


                                            if (fleetCode || serialNo) {
                                                poRecord.selectLine({sublistId: 'item', line: i});
                                                if (newFleetCode != oldFleetCode) {
                                                    log.audit('newFleetCode != oldFleetCode');
                                                    poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_po_fleet_code', value: newFleetCode});
                                                }
                                                if (newSerialNo != oldSerialNo) {
                                                    log.audit('newSerialNo != oldSerialNo');
                                                    poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_eq_serial', value: newSerialNo});
                                                }
                                                poRecord.commitLine({sublistId: 'item'});
                                            }
                                        }

                                    }
                                    poRecord.save();
                                }
                                    return true; // continue processing

                            });
                        }
                    }
                }


            } catch (e) { log.error('Error', e); }
        }

        return {beforeLoad, afterSubmit}

    });