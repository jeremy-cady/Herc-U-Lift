/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
* This script will create a task code list to help in grouping of tasks during generation of quote/estimate pdf
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2022/04/05						            natoretiro      	Initial version
* 2022/06/14                                    aduldulao           null checking of submitFields
* 2023/01/20                                    nretiro             deployed to SO and Inv.
*                                                                   > will only run on defined form/s
* 2023/01/27				   9723	            vpitale      	    Updating the Item Sublist's Task Code Details
*/


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */



define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/format'],
    (record, widget, search, runtime, url, file, format) => {




        const beforeLoad_old = (objContext) => {
            var stLoggerTitle = 'beforeLoad';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {

                var stSOForm = runtime.getCurrentScript().getParameter({ name: 'custscript_param_taskcodesoform' });
                var arrSOForm = [];
                var stInvForm = runtime.getCurrentScript().getParameter({ name: 'custscript_param_taskcodeinvform' });
                var arrInvForm = [];


                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;
                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;

                var stCurrentCustomForm = objCurrentRecord.getValue({ fieldId: 'customform' });



                if(!isEmpty(stSOForm))
                {
                    arrSOForm = stSOForm.split(',');
                }

                if(!isEmpty(stInvForm))
                {
                    arrSOForm = arrInvForm.split(',');
                }

                log.debug(stLoggerTitle, 'stRecType = ' + stRecType + ' | stCurrentCustomForm = ' + stCurrentCustomForm +
                    ' | arrSOForm = ' + JSON.stringify(arrSOForm) +
                    ' | arrInvForm = ' + JSON.stringify(arrInvForm));


                if(stRecType == 'invoice')
                {
                    if(arrInvForm.indexOf(stCurrentCustomForm) == -1)
                    {
                        log.debug(stLoggerTitle, 'Exiting. Form is not supported.');
                        return;
                    }
                }

                if(stRecType == 'salesorder')
                {
                    if(arrSOForm.indexOf(stCurrentCustomForm) == -1)
                    {
                        log.debug(stLoggerTitle, 'Exiting. Form is not supported.');
                        return;
                    }
                }

                // create tab and sublist for task codes
                objForm.addTab({
                    id: 'custpage_tab_taskcode',
                    label: 'Task Codes'
                });

                objForm.addSubtab({
                    id: 'custpage_stab_taskcode',
                    label: 'Task Codes',
                    tab: 'custpage_tab_taskcode'
                });

                // add sublist
                var objSublist = objForm.addSublist({
                    id: 'custpage_slist_taskcode',
                    type: widget.SublistType.INLINEEDITOR,
                    label: 'List of Task Codes',
                    tab: 'custpage_stab_taskcode'
                });

                //add sublist fields
                var flTaskCodeId = objSublist.addField({id: 'custpage_sl_taskcodeid', type: widget.FieldType.TEXT, label: 'Task Code Id' });
                flTaskCodeId.updateDisplayType({ displayType: widget.FieldDisplayType.HIDDEN });
                var flTaskCode = objSublist.addField({id: 'custpage_sl_taskcode', type: widget.FieldType.TEXT, label: 'Task Code' });
                var flDescription = objSublist.addField({id: 'custpage_sl_description', type: widget.FieldType.TEXT, label: 'Description' });

                var objTaskCode = searchTaskCode(stRecId);
                log.debug(stLoggerTitle, 'objTaskCode = ' + JSON.stringify(objTaskCode));

                if(Object.keys(objTaskCode).length > 0)
                {
                    var intLineCounter = 0;
                    for(var i in objTaskCode)
                    {

                        objSublist.setSublistValue({id: 'custpage_sl_taskcodeid', line: intLineCounter, value: objTaskCode[i].taskCodeId });
                        objSublist.setSublistValue({id: 'custpage_sl_taskcode', line: intLineCounter, value: objTaskCode[i].taskCode });
                        objSublist.setSublistValue({id: 'custpage_sl_description', line: intLineCounter, value: objTaskCode[i].description });
                        intLineCounter++;
                    }

                }

                if(objContext.type == objContext.UserEventType.VIEW)
                {

                    flTaskCode.updateDisplayType({ displayType: widget.FieldDisplayType.DISABLED });
                    flTaskCode.updateDisplayType({ displayType: widget.FieldDisplayType.DISABLED });

                }


            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        const beforeSubmit_old = (objContext) => {
            var stLoggerTitle = 'beforeSubmit';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            if (objContext.type == 'delete') return;


            try {

                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;
                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;

                var arrTaskCodes = [];



                if(objContext.type == 'edit' || objContext.type == 'create')
                {
                    var objTaskCode = searchTaskCode(stRecId);
                    log.debug(stLoggerTitle, 'objTaskCode = ' + JSON.stringify(objTaskCode));

                    //get number of sublist lines
                    var intTaskCodeSLLines = objCurrentRecord.getLineCount({ sublistId: 'custpage_slist_taskcode' });
                    log.debug(stLoggerTitle, 'intTaskCodeSLLines = ' + intTaskCodeSLLines);
                    for(var i = 0; i < intTaskCodeSLLines; i++)
                    {
                        var stTaskCodeId = objCurrentRecord.getSublistValue({ sublistId: 'custpage_slist_taskcode', fieldId: 'custpage_sl_taskcodeid', line: i });
                        log.debug(stLoggerTitle, 'stTaskCodeId = ' + stTaskCodeId);

                        log.debug(stLoggerTitle, 'objTaskCode[' + stTaskCodeId + '] = ' + JSON.stringify(objTaskCode[stTaskCodeId]));

                        var stTaskCode = objCurrentRecord.getSublistValue({ sublistId: 'custpage_slist_taskcode', fieldId: 'custpage_sl_taskcode', line: i });
                        var stDescription = objCurrentRecord.getSublistValue({ sublistId: 'custpage_slist_taskcode', fieldId: 'custpage_sl_description', line: i });
                        log.debug(stLoggerTitle, 'stTaskCode = ' + stTaskCode + ' | stDescription = ' + stDescription);

                        if(objTaskCode[stTaskCodeId] == undefined)
                        {

                            //create new entry in SNA | Quote Task Code custom record
                            var recTaskCode = record.create({type: 'customrecord_quotetaskcodes' });
                            recTaskCode.setValue({ fieldId: 'custrecord_tc_taskcode', value: stTaskCode });
                            recTaskCode.setValue({ fieldId: 'custrecord_tc_description', value: stDescription });
                            var stTaskCodeId = recTaskCode.save();
                            log.debug(stLoggerTitle, 'stTaskCodeId Create= ' + stTaskCodeId);
                            arrTaskCodes.push(stTaskCodeId);
                        }
                        else
                        {
                            var stTaskCodeId = record.submitFields({
                                type: "customrecord_quotetaskcodes",
                                id: stTaskCodeId,
                                values: {
                                    'custrecord_tc_taskcode': stTaskCode,
                                    'custrecord_tc_description': stDescription
                                }
                            });

                            log.debug(stLoggerTitle, 'stTaskCodeId Update = ' + stTaskCodeId);
                            arrTaskCodes.push(stTaskCodeId);
                        }

                    }
                    log.debug(stLoggerTitle, 'arrTaskCodes = ' + JSON.stringify(arrTaskCodes));
                    objCurrentRecord.setValue({ fieldId: 'custbody_sna_taskcoderef', value: arrTaskCodes.toString() });


                }


            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });

                throw 'ERROR: ' + e.name + ' DESCRIPTION: ' + e
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        const afterSubmit_old = (objContext) => {
            var stLoggerTitle = 'afterSubmit';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            if (objContext.type == 'delete') return;


            try {

                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;
                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;

                var arrTaskCodes = [];



                if(objContext.type == 'create' || objContext.type == 'edit')
                {
                    if(!isEmpty(stRecId))
                    {
                        log.debug(stLoggerTitle, 'stRecId = ' + stRecId);
                        var stTaskCodeRefs = objCurrentRecord.getValue({ fieldId: 'custbody_sna_taskcoderef' });
                        var arrTaskCodeRefs = stTaskCodeRefs.split(',');

                        for(var i = 0; i < arrTaskCodeRefs.length; i++) {
                            if (!isEmpty(arrTaskCodeRefs[i])) {
                                var stTaskCodeId = record.submitFields({
                                    type: 'customrecord_quotetaskcodes',
                                    id: arrTaskCodeRefs[i],
                                    values: {'custrecord_tc_quoteestimateid': stRecId}
                                });
                                log.debug(stLoggerTitle, 'Task Code [' + stTaskCodeId + '] was updated');
                            }
                        }
                    }
                }
                else if(objContext.type == 'edit')
                {
                    // if(!isEmpty(stRecId))
                    // {
                    //     log.debug(stLoggerTitle, 'stRecId = ' + stRecId);
                    //     var stTaskCodeRefs = objCurrentRecord.getValue({ fieldId: 'custbody_sna_taskcoderef' });
                    //     var arrTaskCodeRefs = stTaskCodeRefs.split(',');
                    //
                    //     for(var i = 0; i < arrTaskCodeRefs.length; i++) {
                    //         var stTaskCodeId = record.submitFields({
                    //             type: 'customrecord_quotetaskcodes',
                    //             id: arrTaskCodeRefs[i],
                    //             values: {'custrecord_tc_quoteestimateid': stRecId}
                    //         });
                    //         log.debug(stLoggerTitle, 'Task Code [' + stTaskCodeId + '] was updated');
                    //     }
                    //
                    // }
                }


            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });

                throw 'ERROR: ' + e.name + ' DESCRIPTION: ' + e.message
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        function searchTaskCode(stQuoteId)
        {
            var stLoggerTitle = 'searchTaskCode';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            log.debug(stLoggerTitle, 'stQuoteId = ' + stQuoteId);

            var objData = {};
            var arrFilters = [];

            if(!isEmpty(stQuoteId))
            {
                arrFilters.push(["custrecord_tc_quoteestimateid","anyof",stQuoteId]);

                try
                {
                    var objTaskCodeSearch = search.create({
                        type: "customrecord_quotetaskcodes",
                        filters: arrFilters,
                        columns:
                            [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC
                                }),
                                "custrecord_tc_quoteestimateid",
                                "custrecord_tc_taskcode",
                                "custrecord_tc_description"
                            ]
                    });

                    var searchResultCount = objTaskCodeSearch.runPaged().count;
                    log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                    objTaskCodeSearch.run().each(function(result) {
                        // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));



                        objData[result.id] = {

                            taskCodeId: result.getValue({ name: 'id'}),
                            quoteId: result.getValue({ name: 'custrecord_tc_quoteestimateid'}),
                            taskCode: result.getValue({ name: 'custrecord_tc_taskcode'}),
                            description: result.getValue({ name: 'custrecord_tc_description'})

                        };



                        return true;

                    });


                }
                catch(err)
                {
                    log.audit({
                        title: err.name,
                        details: err.message
                    });

                    throw err;
                }
            }


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return objData;
        }

        function beforeSubmit(context) {
            try {
log.audit('Start', new Date());
                updateTaskDetItemSublist(context);
log.audit('End', new Date());
            } catch(e) { log.error('Error', e); }
        }


        // Function used to update the Task Details in Item Sublist.
        function updateTaskDetItemSublist(context) {
            var ifRec = context.newRecord;
            var itemItemLineCnt = ifRec.getLineCount({ sublistId: 'item' });
log.audit('itemItemLineCnt: ' + itemItemLineCnt);

            // Traversing through the Item Sublist to update the Task Code Details.
            for(var iloop = 0; iloop < itemItemLineCnt; iloop++) {
                // var line = ifRec.selectLine({ sublistId: 'item', line: iloop });
                var taskCode = ifRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_code', line: iloop });
log.audit('taskCode: ' + taskCode);

                // Executing the code only when the Task Code from Item Sublist is not empty.
                if(!isEmpty(taskCode)) {
                    var taskLineNum = ifRec.findSublistLineWithValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_taskcode', value: taskCode });
log.audit('taskLineNum: ' + taskLineNum);

                    // Executing the code only when Task Code is found in Task Code Sublist.
                    if(taskLineNum != -1) {
                        var groupCode = ifRec.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_groupcode', line: taskLineNum });
                        var workCode = ifRec.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_workcode', line: taskLineNum });
                        var repairCode = ifRec.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_repaircode', line: taskLineNum });
                        var description = ifRec.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_description', line: taskLineNum });
log.audit('Details: groupCode: ' + groupCode + ', workCode: ' + workCode + ', repairCode: ' + repairCode + ', description: ' + description);

                        // Assigning values to Group Code, Work Code, Repair Code and Description.
                        ifRec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_group_code', value: groupCode, line: iloop });
                        ifRec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_work_code', value: workCode, line: iloop });
                        ifRec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_repair_code', value: repairCode, line: iloop });
                        ifRec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_description', value: description, line: iloop });
                    }
                }
            }
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        };

        return {
            beforeSubmit: beforeSubmit
        };
    });