/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
* (BRIEF DESCRIPTION)
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/04/27				   9723	            vpitale      	    Updated code to get task code text from display field to using getcurrentsublisttext
* 2023/03/03				   9723	            vpitale      	    Removing the initial letters from task code when updating the description.
* 2023/01/27				   9723	            vpitale      	    Added Validation to disable entering duplicate task code for Task Codes Sublist.
* 2023/01/26				   9723	            vpitale      	    Populating Repair Code, Group Code, Work Code and Task Description in Items from Task Codes Tab.
* 2023/01/26				   9723	            vpitale      	    Update the validation for Task Code Sublist.
* 2022/04/06						            natoretiro      	Initial version
*
*/

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([
        'N/record',
        'N/runtime',
        'N/search',
        'N/format',
        'N/error'
    ],

    function (record, runtime, search, format, error) {


        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged_old(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;
            if (sublistName === 'custpage_slist_taskcode' && sublistFieldName === sublistFieldName)
            {
                var stTaskCode = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custpage_sl_taskcode'
                });

                var stTaskDescription = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custpage_sl_description'
                });

                if(sublistFieldName == 'custpage_sl_taskcode')
                {
                    // check if task code value is existing in other lines
                    var stTaskCodeLine = currentRecord.findSublistLineWithValue({ sublistId: sublistName, fieldId: sublistFieldName, value: stTaskCode });

                    if(stTaskCodeLine != -1)
                    {
                        alert('Task Code duplicate found in line ' + (parseInt(stTaskCodeLine) + 1) );
                        return false;
                    }
                }
                else if(sublistFieldName == 'custpage_sl_description')
                {
                    // check if task code value is existing in other lines
                    var stTaskCodeLine = currentRecord.findSublistLineWithValue({ sublistId: sublistName, fieldId: sublistFieldName, value: stTaskDescription });

                    if(stTaskCodeLine != -1)
                    {
                        alert('Task Code duplicate found in line ' + (parseInt(stTaskCodeLine) + 1) );
                        return false;
                    }
                }

            }


        }

        // function postSourcing(context) {
        //     var currentRecord = context.currentRecord;
        //     var sublistName = context.sublistId;
        //     var sublistFieldName = context.fieldId;
        //     var line = context.line;
        //     if (sublistName === 'item' && sublistFieldName === 'item')
        //         if (currentRecord.getCurrentSublistValue({
        //             sublistId: sublistName,
        //             fieldId: sublistFieldName
        //         }) === '39')
        //             if (currentRecord.getCurrentSublistValue({
        //                 sublistId: sublistName,
        //                 fieldId: 'pricelevels'
        //             }) !== '1-1')
        //                 currentRecord.setCurrentSublistValue({
        //                     sublistId: sublistName,
        //                     fieldId: 'pricelevels',
        //                     value: '1-1'
        //                 });
        // }
        //
        //

        function validateLine_old(context)
        {
            debugger;
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;

            if (sublistName === 'custpage_slist_taskcode')
            {
                var stTaskCode = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custpage_sl_taskcode'
                });

                var stTaskDescription = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custpage_sl_description'
                });

                if (isEmpty(stTaskCode))
                {
                    alert('Task Code should not be blank.');
                    return false;
                }

                if (isEmpty(stTaskDescription))
                {
                    alert('Task Description should not be blank.');
                    return false;
                }

                // check if task code value is existing in other lines
                var stTaskCodeLine = currentRecord.findSublistLineWithValue({ sublistId: sublistName, fieldId: 'custpage_sl_taskcode', value: stTaskCode });

                if(stTaskCodeLine != -1)
                {
                    alert('Task Code duplicate found in line ' + (parseInt(stTaskCodeLine) + 1) );
                    return false;
                }

                var stDescriptionLine = currentRecord.findSublistLineWithValue({ sublistId: sublistName, fieldId: 'custpage_sl_description', value: stTaskDescription });

                if(stDescriptionLine != -1)
                {
                    alert('Description duplicate found in line ' + (parseInt(stDescriptionLine) + 1) );
                    return false;
                }
            }
            else if (sublistName === 'item')
            {
                var stItemTaskCode = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_sna_hul_taskcode'
                });

                if(!isEmpty(stItemTaskCode))
                {
                    var stLine = currentRecord.findSublistLineWithValue({ sublistId: 'custpage_slist_taskcode', fieldId: 'custpage_sl_taskcode', value: stItemTaskCode });

                    if(stLine == -1)
                    {
                        alert('Task Code not valid/existing in the Task Code List' );
                        return false;
                    }
                }
            }

            return true;


        }

// ------------------------------------------------------------ fieldChanged_ function------------------------------------------------------------

        function fieldChanged_(context) {
            // Updating the Task Code Details in Item Sublist when selecting the items.
            updateItemSubTaskDetails(context);

            // Updating the Task Description in Task Code Sublist.
            updateTaskSubDescription(context);
        }

// ------------------------------------------------------------ validateLine_ function------------------------------------------------------------

        function validateLine_(context) {
            var currentRecord = context.currentRecord, sublistName = context.sublistId, sublistFieldName = context.fieldId, line = context.line;

            // Executing the code when sublist Task Codes is Added/Updated.
            if(sublistName == 'recmachcustrecord_tc_quoteestimateid') {
                var taskCodeId = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'id' });
                var taskCode = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_taskcode' });
                var description = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_description' });

                // Executing the code when taskCode is empty and description is empty.
                if(isEmpty(taskCode) || isEmpty(description)) { alert('Task code and Description are Mandatory.'); return false; }

                // Executing the code only when the Task Code is being Added/Updated. Code to disable entering Duplicate Task Code in Task Code Sublist.
                if(!isEmpty(taskCode)) {
                    var lineNum = currentRecord.findSublistLineWithValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_taskcode', value: taskCode });

                    // Executing the code only when the linenum doesn't match the entered one.
                    if(lineNum != -1) {
                        var id = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'id', line: lineNum });
// console.log('Details: taskCodeId: ' + taskCodeId + ', id: ' + id);
                        if(taskCodeId != id) {
                            alert('You cannot enter a Duplicate Task Code. Please change it.');
                            return false;
                        }
                    }
                }
            }

            return true;
        }

// ------------------------------------------------------------ Save function------------------------------------------------------------

        function saveRecord_(context) {
console.time('saveRecord');
            var currentRecord = context.currentRecord;
            var itemItemLineCnt = currentRecord.getLineCount({ sublistId: 'item' });
// console.log('itemItemLineCnt: ' + itemItemLineCnt);
            // Traversing through the Item Sublist to update the Task Code Details.
            for(var iloop = 0; iloop < itemItemLineCnt; iloop++) {
                var line = currentRecord.selectLine({ sublistId: 'item', line: iloop });
                var taskCode = currentRecord.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_code' });
// console.log('taskCode: ' + taskCode);
                // Executing the code only when the Task Code from Item Sublist is not empty.
                if(!isEmpty(taskCode)) {
                    var taskLineNum = currentRecord.findSublistLineWithValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_taskcode', value: taskCode });
// console.log('taskLineNum: ' + taskLineNum);
                    // Executing the code only when Task Code is found in Task Code Sublist.
                    if(taskLineNum != -1) {
                        var groupCode = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_groupcode', line: taskLineNum });
                        var workCode = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_workcode', line: taskLineNum });
                        var repairCode = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_repaircode', line: taskLineNum });
                        var description = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_description', line: taskLineNum });
// console.log('Details: groupCode: ' + groupCode + ', workCode: ' + workCode + ', repairCode: ' + repairCode + ', description: ' + description);
                        // Assigning values to Group Code, Work Code, Repair Code and Description.
                        currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_group_code', value: groupCode });
                        currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_work_code', value: workCode });
                        currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_repair_code', value: repairCode });
                        currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_description', value: description });
                    }
                }
            }
console.timeEnd('saveRecord');
            return true;
        }

// ------------------------------------------------------------ updateTaskSubDescription function------------------------------------------------------------

        // Function used to update the Task Description in Task Code Sublist.
        function updateTaskSubDescription(context) {
            var currentRecord = context.currentRecord, sublistName = context.sublistId, sublistFieldName = context.fieldId;

            // Executing the code when sublist Task Codes is Added/Updated.
            if(sublistName == 'recmachcustrecord_tc_quoteestimateid') {
                var workCodeVal = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_workcode' });
                var groupCodeVal = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_groupcode' });
                // var workCode = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_workcode_display' });
                // var groupCode = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_groupcode_display' });
                // var repairCode = currentRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_repaircode_display' });
                var workCode = currentRecord.getCurrentSublistText({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_workcode' });
                var groupCode = currentRecord.getCurrentSublistText({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_groupcode' });
                var repairCode = currentRecord.getCurrentSublistText({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_repaircode' });
                var description = '';

// console.log('Details: groupCode: ' + groupCode + ', workCode: ' + workCode + ', repairCode: ' + repairCode + ', workCodeVal: ' + workCodeVal + ', groupCodeVal: ' + groupCodeVal);

				// Updating the Codes to remove the initial letter.
                if(!isEmpty(workCodeVal)) {
                    workCode = workCode.substr((workCode.indexOf(' ') + 1), workCode.length);
                }

                if(!isEmpty(groupCodeVal)) {
                    groupCode = groupCode.substr((groupCode.indexOf(' ') + 1), groupCode.length);
                }

                // Adding the description when Work Code or Group Code is being Added/Updated.
                if(sublistFieldName == 'custrecord_tc_workcode' || sublistFieldName == 'custrecord_tc_groupcode') {
                    // Getting the Description.
                    if(!isEmpty(workCodeVal) && !isEmpty(groupCodeVal)) { description = workCode + ' ' + groupCode; }
                    else if(!isEmpty(workCodeVal)) { description = workCode; }
                    else if(!isEmpty(groupCodeVal)) { description = groupCode; }
                    else { }
                    description = workCode + ' ' + groupCode;
// console.log('Details: description: |' + description + '|');
                    currentRecord.setCurrentSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_description', value: description });
                }
            }
        }

// ------------------------------------------------------------ updateItemSubTaskDetails function------------------------------------------------------------

        // Function used to update the Task Code Details in Item Sublist when selecting the items.
        function updateItemSubTaskDetails(context) {
            var currentRecord = context.currentRecord, sublistName = context.sublistId, sublistFieldName = context.fieldId;

            // Executing the code when sublist Item is Added/Updated.
            if(sublistName == 'item') {
                // Executing the code only when the Task Code field is being Added/Updated.
                if(sublistFieldName == 'custcol_sna_task_code') {
                    var taskCode = currentRecord.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_code' });

                    // Executing the code only when it is not empty.
                    if(!isEmpty(taskCode)) {
                        var lineNum = currentRecord.findSublistLineWithValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_taskcode', value: taskCode });

                        // Executing the code when lineNum is found for the Task Code.
                        if(!isEmpty(lineNum) && lineNum != -1) {
                            var groupCode = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_groupcode', line: lineNum });
                            var workCode = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_workcode', line: lineNum });
                            var repairCode = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_repaircode', line: lineNum });
                            var description = currentRecord.getSublistValue({ sublistId: 'recmachcustrecord_tc_quoteestimateid', fieldId: 'custrecord_tc_description', line: lineNum });

                            // Assigning values to Group Code, Work Code, Repair Code and Description.
                            currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_group_code', value: groupCode });
                            currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_work_code', value: workCode });
                            currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_repair_code', value: repairCode });
                            currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_description', value: description });
                        }
                    }
                }
            }
        }

// ------------------------------------------------------------ isEmpty function------------------------------------------------------------

        // Function used to check whether the value is empty or not.
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        };

// ------------------------------------------------------------ Return Function List ------------------------------------------------------------

        return {
            fieldChanged: fieldChanged_,
            validateLine: validateLine_,
            // saveRecord: saveRecord_
        };
    });