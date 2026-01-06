/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/31/2024
* Version: 1.0
* Purpose of Script: We ant an afterSubmit function that does the following:
*   - checks for event type...IF EDIT then...
*   - get task new data from fields that have changed (using System Information?)
*   - create new Task data object and set data in object
*   - populate data to Case record using submitFields
*/
define(["require", "exports", "N/log", "N/record", "N/search"], function (require, exports, log, record, search) {
    "use strict";
    /**
    * Function definition to be triggered before record is loaded.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {string} ctx.type - Trigger type
    * @param {Form} ctx.form - Form
    * @Since 2015.2
    */
    function beforeLoad(ctx) {
        var _a;
        try {
            if (ctx.type === ctx.UserEventType.EDIT) {
                // in beforeLoad, get all values from currentTask
                var taskRecord = ctx.newRecord;
                var currentCaseID = String(taskRecord.getValue({
                    fieldId: 'supportcase'
                }));
                var taskNumber = String(taskRecord.getValue({
                    fieldId: 'id'
                }));
                var taskStartDate = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_task_start'
                }));
                var taskCompletedDate = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_task_end'
                }));
                var taskStatus = String(taskRecord.getValue({
                    fieldId: 'status'
                }));
                var taskResult = String(taskRecord.getValue({
                    fieldId: 'custevent_nxc_task_result'
                }));
                var currentTaskAction = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_actions_taken'
                }));
                var taskInternalNote = String(taskRecord.getValue({
                    fieldId: 'custevent_nxc_internal_note'
                }));
                var taskAssigned = String(taskRecord.getValue({
                    fieldId: 'assigned'
                }));
                var caseTypeSearch = search.lookupFields({
                    type: record.Type.SUPPORT_CASE,
                    id: currentCaseID,
                    columns: ['category']
                });
                var thisCaseType = (_a = caseTypeSearch === null || caseTypeSearch === void 0 ? void 0 : caseTypeSearch.category[0]) === null || _a === void 0 ? void 0 : _a.value;
                log.debug('thisCaseType', thisCaseType);
                // create an object with the data points
                var currentTaskDataObject = {
                    caseID: currentCaseID || '',
                    caseType: thisCaseType || '',
                    currentTaskID: taskNumber || '',
                    currentStartDate: taskStartDate || '',
                    currentCompletedDate: taskCompletedDate || '',
                    currentTaskResult: taskResult || '',
                    currentStatus: taskStatus || '',
                    currentInternalNote: taskInternalNote || '',
                    currentActionsTaken: currentTaskAction || '',
                    currentAssignedTo: taskAssigned || '',
                };
                // JSON stringify the object
                var storedObject = JSON.stringify(currentTaskDataObject);
                log.debug('storedObject', storedObject);
                // store object in text area field for later use in afterSubmit
                taskRecord.setValue({
                    fieldId: 'custevent_hul_task_data_json',
                    value: storedObject,
                });
            }
        }
        catch (error) {
            log.debug('ERROR in beforeLoad', error);
        }
    }
    /**
    * Function definition to be triggered before record is submitted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {Record} ctx.oldRecord - Old record
    * @param {string} ctx.type - Trigger type
    * @Since 2015.2
    */
    function beforeSubmit(ctx) {
        var _a;
        if (ctx.type === ctx.UserEventType.EDIT) {
            try {
                var taskRecord = ctx.newRecord;
                // Verify that the field exists and contains valid data
                var taskDataJSON = taskRecord.getValue({
                    fieldId: 'custevent_hul_task_data_json'
                });
                if (!taskDataJSON) {
                    log.debug('Field Missing', 'custevent_hul_task_data_json is empty. Recalculating...');
                    // Recreate the JSON object to ensure it's present in afterSubmit
                    var currentCaseID = String(taskRecord.getValue({
                        fieldId: 'supportcase'
                    }));
                    var taskNumber = String(taskRecord.getValue({
                        fieldId: 'id'
                    }));
                    var taskStartDate = String(taskRecord.getValue({
                        fieldId: 'custevent_nx_task_start'
                    }));
                    var taskCompletedDate = String(taskRecord.getValue({
                        fieldId: 'custevent_nx_task_end'
                    }));
                    var taskStatus = String(taskRecord.getValue({
                        fieldId: 'status'
                    }));
                    var taskResult = String(taskRecord.getValue({
                        fieldId: 'custevent_nxc_task_result'
                    }));
                    var currentTaskAction = String(taskRecord.getValue({
                        fieldId: 'custevent_nx_actions_taken'
                    }));
                    var taskInternalNote = String(taskRecord.getValue({
                        fieldId: 'custevent_nxc_internal_note'
                    }));
                    var taskAssigned = String(taskRecord.getValue({
                        fieldId: 'assigned'
                    }));
                    var caseTypeSearch = search.lookupFields({
                        type: record.Type.SUPPORT_CASE,
                        id: currentCaseID,
                        columns: ['category']
                    });
                    var thisCaseType = (_a = caseTypeSearch === null || caseTypeSearch === void 0 ? void 0 : caseTypeSearch.category[0]) === null || _a === void 0 ? void 0 : _a.value;
                    log.debug('thisCaseType in beforeSubmit', thisCaseType);
                    var taskDataObject = {
                        caseID: currentCaseID || '',
                        caseType: thisCaseType || '',
                        currentTaskID: taskNumber || '',
                        currentStartDate: taskStartDate || '',
                        currentCompletedDate: taskCompletedDate || '',
                        currentTaskResult: taskResult || '',
                        currentStatus: taskStatus || '',
                        currentInternalNote: taskInternalNote || '',
                        currentActionsTaken: currentTaskAction || '',
                        currentAssignedTo: taskAssigned || '',
                    };
                    var updatedTaskDataJSON = JSON.stringify(taskDataObject);
                    // Update the field on the newRecord object
                    taskRecord.setValue({
                        fieldId: 'custevent_hul_task_data_json',
                        value: updatedTaskDataJSON,
                    });
                    log.debug('Updated Task JSON', updatedTaskDataJSON);
                }
                else {
                    log.debug('Task Data JSON Already Exists', taskDataJSON);
                }
            }
            catch (error) {
                log.error('Error in beforeSubmit', error.message);
            }
        }
    }
    /**
    * Function definition to be triggered after a record is submitted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {Record} ctx.oldRecord - Old record
    * @param {string} ctx.type - Trigger type
    * @Since 2015.2
    */
    function afterSubmit(ctx) {
        var _a;
        try {
            if (ctx.type === ctx.UserEventType.EDIT) {
                // declare record Object
                var taskRecord = ctx.newRecord;
                // gather the JSON stringified object and transform it back into a data object
                var taskDataJSON = taskRecord.getValue({
                    fieldId: 'custevent_hul_task_data_json'
                });
                if (!taskDataJSON) {
                    log.debug('Missing JSON Data!! custevent_hul_task_data_json is empty or not found.', taskRecord.id);
                    return;
                }
                var taskDataObject = null;
                try {
                    taskDataObject = JSON.parse(taskDataJSON);
                }
                catch (error) {
                    log.debug('Invalid JSON Data', "Error parsing JSON: ".concat(error.message));
                    return;
                }
                if (taskDataObject) {
                    log.debug('taskDataObject', taskDataObject);
                }
                // gather newly entered currentTaskData and create new taskData Object
                var currentCaseID = String(taskRecord.getValue({
                    fieldId: 'supportcase'
                }));
                var newTaskNumber = String(taskRecord.getValue({
                    fieldId: 'id'
                }));
                var newTaskStartDate = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_task_start'
                }));
                var newTaskCompletedDate = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_task_end'
                }));
                var newTaskStatus = String(taskRecord.getValue({
                    fieldId: 'status'
                }));
                var newTaskResult = String(taskRecord.getValue({
                    fieldId: 'custevent_nxc_task_result'
                }));
                var newCurrentTaskAction = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_actions_taken'
                }));
                var newTaskInternalNote = String(taskRecord.getValue({
                    fieldId: 'custevent_nxc_internal_note'
                }));
                var newTaskAssigned = String(taskRecord.getValue({
                    fieldId: 'assigned'
                }));
                var caseTypeSearch = search.lookupFields({
                    type: record.Type.SUPPORT_CASE,
                    id: currentCaseID,
                    columns: ['category']
                });
                log.debug('caseTypeSearch', caseTypeSearch);
                var thisCaseType = (_a = caseTypeSearch.category[0]) === null || _a === void 0 ? void 0 : _a.value;
                log.debug('thisCaseType', thisCaseType);
                // create an object with the data points
                var newTaskDataObject = {
                    caseID: currentCaseID,
                    caseType: thisCaseType,
                    currentTaskID: newTaskNumber,
                    currentStartDate: newTaskStartDate,
                    currentCompletedDate: newTaskCompletedDate,
                    currentTaskResult: newTaskResult,
                    currentStatus: newTaskStatus,
                    currentInternalNote: newTaskInternalNote,
                    currentActionsTaken: newCurrentTaskAction,
                    currentAssignedTo: newTaskAssigned,
                };
                // compare the old object with the new object
                // if they are equal - do nothing
                if (JSON.stringify(taskDataObject) === JSON.stringify(newTaskDataObject)) {
                    log.debug('MATCH', newTaskDataObject);
                    // if they are not equal - set new values on Case record
                }
                else if (JSON.stringify(taskDataObject) !== JSON.stringify(newTaskDataObject)
                    && newTaskDataObject.caseType === '4' || '') {
                    log.debug('NO MATCH', newTaskDataObject);
                    // we need to gather the current and previous task numbers from Case record and compare
                    var caseSearch = search.lookupFields({
                        type: record.Type.SUPPORT_CASE,
                        id: currentCaseID,
                        columns: ['custevent_hul_current_task_number', 'custevent_hul_previous_task_number']
                    });
                    log.debug('caseSearch', caseSearch);
                    // get task numbers to see if they are the same so we can determine where to polulate the data
                    var currentTaskNumber = caseSearch.custevent_hul_current_task_number;
                    var previousTaskNumber = caseSearch.custevent_hul_previous_task_number;
                    log.debug('currentTaskNumber', currentTaskNumber);
                    log.debug('previousTaskNumber', previousTaskNumber);
                    // if they match, populate new task data on both current and previous task fields
                    if (currentTaskNumber === previousTaskNumber) {
                        var submit = record.submitFields({
                            type: record.Type.SUPPORT_CASE,
                            id: newTaskDataObject.caseID,
                            values: {
                                custevent_hul_current_task_number: "".concat(newTaskDataObject.currentTaskID),
                                custevent_hul_current_start_date: "".concat(newTaskDataObject.currentStartDate),
                                custevent_current_task_date_completed: "".concat(newTaskDataObject.currentCompletedDate),
                                custevent_hul_current_task_status: "".concat(newTaskDataObject.currentStatus),
                                custevent_hul_current_task_result: "".concat(newTaskDataObject.currentTaskResult),
                                custevent_hul_curr_task_action_taken: "".concat(newTaskDataObject.currentActionsTaken),
                                custevent_hul_curr_task_internal_notes: "".concat(newTaskDataObject.currentInternalNote),
                                custevent_hul_curr_task_tech_assigned: "".concat(newTaskDataObject.currentAssignedTo),
                                custevent_hul_previous_task_number: "".concat(newTaskDataObject.currentTaskID),
                                custevent_hul_prev_task_start_date: "".concat(newTaskDataObject.currentStartDate),
                                custevent_hul_prev_task_date_completed: "".concat(newTaskDataObject.currentCompletedDate),
                                custevent_hul_prev_task_status: "".concat(newTaskDataObject.currentStatus),
                                custevent_hul_prev_task_result: "".concat(newTaskDataObject.currentTaskResult),
                                custevent_hul_prev_task_action_taken: "".concat(newTaskDataObject.currentActionsTaken),
                                custevent_hul_prev_task_internal_notes: "".concat(newTaskDataObject.currentInternalNote),
                                custevent_hul_prev_task_tech_assigned: "".concat(newTaskDataObject.currentAssignedTo),
                            }
                        });
                        log.debug('submit all', submit);
                        // if they do not match populate only on current fields
                    }
                    else if (currentTaskNumber !== previousTaskNumber) {
                        var submit = record.submitFields({
                            type: record.Type.SUPPORT_CASE,
                            id: newTaskDataObject.caseID,
                            values: {
                                custevent_hul_current_task_number: "".concat(newTaskDataObject.currentTaskID),
                                custevent_hul_current_start_date: "".concat(newTaskDataObject.currentStartDate),
                                custevent_current_task_date_completed: "".concat(newTaskDataObject.currentCompletedDate),
                                custevent_hul_current_task_status: "".concat(newTaskDataObject.currentStatus),
                                custevent_hul_current_task_result: "".concat(newTaskDataObject.currentTaskResult),
                                custevent_hul_curr_task_action_taken: "".concat(newTaskDataObject.currentActionsTaken),
                                custevent_hul_curr_task_internal_notes: "".concat(newTaskDataObject.currentInternalNote),
                                custevent_hul_curr_task_tech_assigned: "".concat(newTaskDataObject.currentAssignedTo),
                            }
                        });
                        log.debug('submit only current', submit);
                    }
                }
            }
        }
        catch (error) {
            log.debug('ERROR in afterSubmit', error);
        }
    }
    return { beforeLoad: beforeLoad, beforeSubmit: beforeSubmit, afterSubmit: afterSubmit };
});
