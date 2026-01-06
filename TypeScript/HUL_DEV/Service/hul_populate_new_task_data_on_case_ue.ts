/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/31/2024
* Version: 1.0
* Purpose of Script: We want an afterSubmit function that does the following:
*   - checks for event type...IF EDIT then...
*   - get task new data from fields that have changed (using System Information?)
*   - create new Task data object and set data in object
*   - populate data to Case record using submitFields
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as record from 'N/record';
import * as search from 'N/search';

// declare currentTaskData object interface
interface TaskDataObject {
    caseID: string;
    caseType: string;
    currentTaskID: string;
    currentStartDate: string;
    currentCompletedDate: string;
    currentTaskResult: string;
    currentStatus: string;
    currentInternalNote: string;
    currentActionsTaken: string;
    currentAssignedTo: string;
}

/**
* Function definition to be triggered before record is loaded.
*
* @param {Object} ctx
* @param {Record} ctx.newRecord - New record
* @param {string} ctx.type - Trigger type
* @param {Form} ctx.form - Form
* @Since 2015.2
*/
function beforeLoad(ctx: EntryPoints.UserEvent.beforeLoadContext) {
    try {
        if (ctx.type === ctx.UserEventType.EDIT){
            // in beforeLoad, get all values from currentTask
            const taskRecord = ctx.newRecord;
            const currentCaseID = String(taskRecord.getValue({
                fieldId: 'supportcase'
            }));
            const taskNumber = String(taskRecord.getValue({
                fieldId: 'id'
            }));
            const taskStartDate = String(taskRecord.getValue({
                fieldId: 'custevent_nx_task_start'
            }));
            const taskCompletedDate = String(taskRecord.getValue({
                fieldId: 'custevent_nx_task_end'
            }));
            const taskStatus = String(taskRecord.getValue({
                fieldId: 'status'
            }));
            const taskResult = String(taskRecord.getValue({
                fieldId: 'custevent_nxc_task_result'
            }));
            const currentTaskAction = String(taskRecord.getValue({
                fieldId: 'custevent_nx_actions_taken'
            }));
            const taskInternalNote = String(taskRecord.getValue({
                fieldId: 'custevent_nxc_internal_note'
            }));
            const taskAssigned = String(taskRecord.getValue({
                fieldId: 'assigned'
            }));
            const caseTypeSearch = search.lookupFields({
                type: record.Type.SUPPORT_CASE,
                id: currentCaseID,
                columns: ['category']
            });
            const thisCaseType = caseTypeSearch?.category[0]?.value;
            log.debug('thisCaseType', thisCaseType);
            // create an object with the data points
            const currentTaskDataObject: TaskDataObject = {
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
            const storedObject = JSON.stringify(currentTaskDataObject);
            log.debug('storedObject', storedObject);
            // store object in text area field for later use in afterSubmit
            taskRecord.setValue({
                fieldId: 'custevent_hul_task_data_json',
                value: storedObject,
            });
        }
    } catch (error) {
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
function beforeSubmit(ctx: EntryPoints.UserEvent.beforeSubmitContext) {
    if (ctx.type === ctx.UserEventType.EDIT) {
        try {
            const taskRecord = ctx.newRecord;

            // Verify that the field exists and contains valid data
            const taskDataJSON = taskRecord.getValue({
                fieldId: 'custevent_hul_task_data_json'
            }) as string;

            if (!taskDataJSON) {
                log.debug('Field Missing', 'custevent_hul_task_data_json is empty. Recalculating...');
                // Recreate the JSON object to ensure it's present in afterSubmit
                const currentCaseID = String(taskRecord.getValue({
                    fieldId: 'supportcase'
                }));
                const taskNumber = String(taskRecord.getValue({
                    fieldId: 'id'
                }));
                const taskStartDate = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_task_start'
                }));
                const taskCompletedDate = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_task_end'
                }));
                const taskStatus = String(taskRecord.getValue({
                    fieldId: 'status'
                }));
                const taskResult = String(taskRecord.getValue({
                    fieldId: 'custevent_nxc_task_result'
                }));
                const currentTaskAction = String(taskRecord.getValue({
                    fieldId: 'custevent_nx_actions_taken'
                }));
                const taskInternalNote = String(taskRecord.getValue({
                    fieldId: 'custevent_nxc_internal_note'
                }));
                const taskAssigned = String(taskRecord.getValue({
                    fieldId: 'assigned'
                }));
                const caseTypeSearch = search.lookupFields({
                    type: record.Type.SUPPORT_CASE,
                    id: currentCaseID,
                    columns: ['category']
                });
                const thisCaseType = caseTypeSearch?.category[0]?.value;
                log.debug('thisCaseType in beforeSubmit', thisCaseType);

                const taskDataObject: TaskDataObject = {
                    caseID: currentCaseID || '',
                    caseType: thisCaseType || '', // Optional: Perform lookup if necessary
                    currentTaskID: taskNumber || '',
                    currentStartDate: taskStartDate || '',
                    currentCompletedDate: taskCompletedDate || '',
                    currentTaskResult: taskResult || '',
                    currentStatus: taskStatus || '',
                    currentInternalNote: taskInternalNote || '',
                    currentActionsTaken: currentTaskAction || '',
                    currentAssignedTo: taskAssigned || '',
                };

                const updatedTaskDataJSON = JSON.stringify(taskDataObject);

                // Update the field on the newRecord object
                taskRecord.setValue({
                    fieldId: 'custevent_hul_task_data_json',
                    value: updatedTaskDataJSON,
                });

                log.debug('Updated Task JSON', updatedTaskDataJSON);
            } else {
                log.debug('Task Data JSON Already Exists', taskDataJSON);
            }
        } catch (error) {
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
function afterSubmit(ctx: EntryPoints.UserEvent.afterSubmitContext) {
    try {
        if (ctx.type === ctx.UserEventType.EDIT){
            // declare record Object
            const taskRecord = ctx.newRecord;
            // gather the JSON stringified object and transform it back into a data object
            const taskDataJSON: any = taskRecord.getValue({
                fieldId: 'custevent_hul_task_data_json'
            }) as string;
            if (!taskDataJSON) {
                log.debug('Missing JSON Data!! custevent_hul_task_data_json is empty or not found.', taskRecord.id);
                return;
            }
            let taskDataObject: TaskDataObject | null = null;
            try {
                taskDataObject = JSON.parse(taskDataJSON);
            } catch (error) {
                log.debug('Invalid JSON Data', `Error parsing JSON: ${error.message}`);
                return;
            }
            if (taskDataObject) {
                log.debug('taskDataObject', taskDataObject);
            }
            // gather newly entered currentTaskData and create new taskData Object
            const currentCaseID = String(taskRecord.getValue({
                fieldId: 'supportcase'
            }));
            const newTaskNumber = String(taskRecord.getValue({
                fieldId: 'id'
            }));
            const newTaskStartDate = String(taskRecord.getValue({
                fieldId: 'custevent_nx_task_start'
            }));
            const newTaskCompletedDate = String(taskRecord.getValue({
                fieldId: 'custevent_nx_task_end'
            }));
            const newTaskStatus = String(taskRecord.getValue({
                fieldId: 'status'
            }));
            const newTaskResult = String(taskRecord.getValue({
                fieldId: 'custevent_nxc_task_result'
            }));
            const newCurrentTaskAction = String(taskRecord.getValue({
                fieldId: 'custevent_nx_actions_taken'
            }));
            const newTaskInternalNote = String(taskRecord.getValue({
                fieldId: 'custevent_nxc_internal_note'
            }));
            const newTaskAssigned = String(taskRecord.getValue({
                fieldId: 'assigned'
            }));
            const caseTypeSearch = search.lookupFields({
                type: record.Type.SUPPORT_CASE,
                id: currentCaseID,
                columns: ['category']
            });
            log.debug('caseTypeSearch', caseTypeSearch);
            const thisCaseType = caseTypeSearch.category[0]?.value;
            log.debug('thisCaseType', thisCaseType);
            // create an object with the data points
            const newTaskDataObject: TaskDataObject = {
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
            } else if (JSON.stringify(taskDataObject) !== JSON.stringify(newTaskDataObject)
                && newTaskDataObject.caseType === '4' || '') {
                log.debug('NO MATCH', newTaskDataObject);
                // we need to gather the current and previous task numbers from Case record and compare
                const caseSearch = search.lookupFields({
                    type: record.Type.SUPPORT_CASE,
                    id: currentCaseID,
                    columns: ['custevent_hul_current_task_number', 'custevent_hul_previous_task_number']
                });
                log.debug('caseSearch', caseSearch);
                // get task numbers to see if they are the same so we can determine where to polulate the data
                const currentTaskNumber = caseSearch.custevent_hul_current_task_number;
                const previousTaskNumber = caseSearch.custevent_hul_previous_task_number;
                log.debug('currentTaskNumber', currentTaskNumber);
                log.debug('previousTaskNumber', previousTaskNumber);
                // if they match, populate new task data on both current and previous task fields
                if (currentTaskNumber === previousTaskNumber) {
                    const submit = record.submitFields({
                        type: record.Type.SUPPORT_CASE,
                        id: newTaskDataObject.caseID,
                        values: {
                            custevent_hul_current_task_number: `${newTaskDataObject.currentTaskID}`,
                            custevent_hul_current_start_date: `${newTaskDataObject.currentStartDate}`,
                            custevent_current_task_date_completed: `${newTaskDataObject.currentCompletedDate}`,
                            custevent_hul_current_task_status: `${newTaskDataObject.currentStatus}`,
                            custevent_hul_current_task_result: `${newTaskDataObject.currentTaskResult}`,
                            custevent_hul_curr_task_action_taken: `${newTaskDataObject.currentActionsTaken}`,
                            custevent_hul_curr_task_internal_notes: `${newTaskDataObject.currentInternalNote}`,
                            custevent_hul_curr_task_tech_assigned: `${newTaskDataObject.currentAssignedTo}`,
                            custevent_hul_previous_task_number: `${newTaskDataObject.currentTaskID}`,
                            custevent_hul_prev_task_start_date: `${newTaskDataObject.currentStartDate}`,
                            custevent_hul_prev_task_date_completed: `${newTaskDataObject.currentCompletedDate}`,
                            custevent_hul_prev_task_status: `${newTaskDataObject.currentStatus}`,
                            custevent_hul_prev_task_result: `${newTaskDataObject.currentTaskResult}`,
                            custevent_hul_prev_task_action_taken: `${newTaskDataObject.currentActionsTaken}`,
                            custevent_hul_prev_task_internal_notes: `${newTaskDataObject.currentInternalNote}`,
                            custevent_hul_prev_task_tech_assigned: `${newTaskDataObject.currentAssignedTo}`,
                        }
                    });
                    log.debug('submit all', submit);
                // if they do not match populate only on current fields
                } else if (currentTaskNumber !== previousTaskNumber) {
                    const submit = record.submitFields({
                        type: record.Type.SUPPORT_CASE,
                        id: newTaskDataObject.caseID,
                        values: {
                            custevent_hul_current_task_number: `${newTaskDataObject.currentTaskID}`,
                            custevent_hul_current_start_date: `${newTaskDataObject.currentStartDate}`,
                            custevent_current_task_date_completed: `${newTaskDataObject.currentCompletedDate}`,
                            custevent_hul_current_task_status: `${newTaskDataObject.currentStatus}`,
                            custevent_hul_current_task_result: `${newTaskDataObject.currentTaskResult}`,
                            custevent_hul_curr_task_action_taken: `${newTaskDataObject.currentActionsTaken}`,
                            custevent_hul_curr_task_internal_notes: `${newTaskDataObject.currentInternalNote}`,
                            custevent_hul_curr_task_tech_assigned: `${newTaskDataObject.currentAssignedTo}`,
                        }
                    });
                    log.debug('submit only current', submit);
                }
            }
        }
    } catch (error) {
        log.debug('ERROR in afterSubmit', error);
    }
}

export = { beforeLoad, beforeSubmit, afterSubmit };