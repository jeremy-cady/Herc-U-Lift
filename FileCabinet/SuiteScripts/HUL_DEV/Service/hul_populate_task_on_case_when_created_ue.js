/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 03/25/2025
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/search", "N/record"], function (require, exports, log, search, record) {
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
        var _a, _b, _c, _d;
        if (ctx.type === ctx.UserEventType.CREATE) {
            // gather requisite data from the task record
            var newTaskData = {
                caseID: String(ctx.newRecord.getValue({ fieldId: 'supportcase' })),
                currentTaskID: String(ctx.newRecord.id),
                currentStartDate: String(ctx.newRecord.getValue({ fieldId: 'custevent_nx_start_date' })),
                currentCompletedDate: String(ctx.newRecord.getValue({ fieldId: 'custevent_nx_end_date' })),
                currentTaskResult: String(ctx.newRecord.getValue({ fieldId: 'custevent_nxc_task_result' })),
                currentStatus: String(ctx.newRecord.getValue({ fieldId: 'status' })),
                currentInternalNote: String(ctx.newRecord.getValue({ fieldId: 'custevent_nxc_internal_note' })),
                currentActionsTaken: String(ctx.newRecord.getValue({ fieldId: 'custevent_nx_actions_taken' })),
                currentAssignedTo: String(ctx.newRecord.getValue({ fieldId: 'assigned' }))
            };
            log.debug('newTaskData', newTaskData);
            // check related case record for task data
            var caseMetricsFields = search.lookupFields({
                type: search.Type.SUPPORT_CASE,
                id: newTaskData.caseID,
                columns: ['custevent_hul_previous_task_number', 'custevent_hul_prev_task_date_completed',
                    'custevent_hul_prev_task_result', 'custevent_hul_prev_task_status',
                    'custevent_hul_prev_task_internal_notes', 'custevent_hul_prev_task_action_taken',
                    'custevent_hul_prev_task_tech_assigned', 'custevent_hul_current_task_number',
                    'custevent_hul_current_start_date', 'custevent_current_task_date_completed',
                    'custevent_hul_current_task_result', 'custevent_hul_current_task_status',
                    'custevent_hul_curr_task_internal_notes', 'custevent_hul_curr_task_action_taken',
                    'custevent_hul_curr_task_tech_assigned'
                ]
            });
            log.debug('caseMetricsFields', caseMetricsFields);
            // create object to hold old task data
            var oldTaskData = {
                caseID: String(newTaskData.caseID),
                currentTaskID: String(caseMetricsFields.custevent_hul_current_task_number),
                currentStartDate: String(caseMetricsFields.custevent_hul_current_start_date),
                currentCompletedDate: String(caseMetricsFields.custevent_current_task_date_completed),
                currentTaskResult: String((_a = caseMetricsFields.custevent_hul_current_task_result[0]) === null || _a === void 0 ? void 0 : _a.value),
                currentStatus: String(caseMetricsFields.custevent_hul_current_task_status),
                currentInternalNote: String(caseMetricsFields.custevent_hul_curr_task_internal_notes),
                currentActionsTaken: String(caseMetricsFields.custevent_hul_curr_task_action_taken),
                currentAssignedTo: String((_b = caseMetricsFields.custevent_hul_curr_task_tech_assigned[0]) === null || _b === void 0 ? void 0 : _b.value),
                previousTaskID: String(caseMetricsFields.custevent_hul_previous_task_number),
                previousCompletedDate: String(caseMetricsFields.custevent_hul_prev_task_date_completed),
                previousTaskResult: String((_c = caseMetricsFields.custevent_hul_prev_task_result[0]) === null || _c === void 0 ? void 0 : _c.value),
                previousStatus: String(caseMetricsFields.custevent_hul_prev_task_status),
                previousInternalNote: String(caseMetricsFields.custevent_hul_prev_task_internal_notes),
                previousActionsTaken: String(caseMetricsFields.custevent_hul_prev_task_action_taken),
                previousAssignedTo: String((_d = caseMetricsFields.custevent_hul_prev_task_tech_assigned[0]) === null || _d === void 0 ? void 0 : _d.value)
            };
            if (oldTaskData.currentTaskResult === 'undefined') {
                oldTaskData.currentTaskResult = '';
            }
            if (oldTaskData.previousTaskResult === 'undefined') {
                oldTaskData.previousTaskResult = '';
            }
            if (oldTaskData.currentAssignedTo === 'undefined') {
                oldTaskData.currentAssignedTo = '';
            }
            if (oldTaskData.previousAssignedTo === 'undefined') {
                oldTaskData.previousAssignedTo = '';
            }
            log.debug('oldTaskData', oldTaskData);
            // if no previous and no current, update case record with new task data in current fields
            if (oldTaskData.currentTaskID === '' && oldTaskData.previousTaskID === '') {
                record.submitFields({
                    type: record.Type.SUPPORT_CASE,
                    id: newTaskData.caseID,
                    values: {
                        custevent_hul_current_task_number: newTaskData.currentTaskID,
                        custevent_hul_current_start_date: newTaskData.currentStartDate,
                        custevent_current_task_date_completed: newTaskData.currentCompletedDate,
                        custevent_hul_current_task_result: newTaskData.currentTaskResult,
                        custevent_hul_current_task_status: newTaskData.currentStatus,
                        custevent_hul_curr_task_internal_notes: newTaskData.currentInternalNote,
                        custevent_hul_curr_task_action_taken: newTaskData.currentActionsTaken,
                        custevent_hul_curr_task_tech_assigned: newTaskData.currentAssignedTo,
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
            }
            else if (oldTaskData.currentTaskID !== '' && oldTaskData.previousTaskID === '') {
                // if current is not blank and previous is, update case record with new task data in current fields
                // and move current to previous
                record.submitFields({
                    type: record.Type.SUPPORT_CASE,
                    id: newTaskData.caseID,
                    values: {
                        custevent_hul_current_task_number: newTaskData.currentTaskID,
                        custevent_hul_current_start_date: newTaskData.currentStartDate,
                        custevent_current_task_date_completed: newTaskData.currentCompletedDate,
                        custevent_hul_current_task_result: newTaskData.currentTaskResult,
                        custevent_hul_current_task_status: newTaskData.currentStatus,
                        custevent_hul_curr_task_internal_notes: newTaskData.currentInternalNote,
                        custevent_hul_curr_task_action_taken: newTaskData.currentActionsTaken,
                        custevent_hul_curr_task_tech_assigned: newTaskData.currentAssignedTo,
                        custevent_hul_previous_task_number: oldTaskData.currentTaskID,
                        custevent_hul_prev_task_date_completed: oldTaskData.currentCompletedDate,
                        custevent_hul_prev_task_result: oldTaskData.currentTaskResult,
                        custevent_hul_prev_task_status: oldTaskData.currentStatus,
                        custevent_hul_prev_task_internal_notes: oldTaskData.currentInternalNote,
                        custevent_hul_prev_task_action_taken: oldTaskData.currentActionsTaken,
                        custevent_hul_prev_task_tech_assigned: oldTaskData.currentAssignedTo
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
                // if current && previous then move current to previous & new to current
            }
            else if (oldTaskData.currentTaskID !== '' && oldTaskData.previousTaskID !== '') {
                record.submitFields({
                    type: record.Type.SUPPORT_CASE,
                    id: newTaskData.caseID,
                    values: {
                        custevent_hul_current_task_number: newTaskData.currentTaskID,
                        custevent_hul_current_start_date: newTaskData.currentStartDate,
                        custevent_current_task_date_completed: newTaskData.currentCompletedDate,
                        custevent_hul_current_task_result: newTaskData.currentTaskResult,
                        custevent_hul_current_task_status: newTaskData.currentStatus,
                        custevent_hul_curr_task_internal_notes: newTaskData.currentInternalNote,
                        custevent_hul_curr_task_action_taken: newTaskData.currentActionsTaken,
                        custevent_hul_curr_task_tech_assigned: newTaskData.currentAssignedTo,
                        custevent_hul_previous_task_number: oldTaskData.currentTaskID,
                        custevent_hul_prev_task_date_completed: oldTaskData.currentCompletedDate,
                        custevent_hul_prev_task_result: oldTaskData.currentTaskResult,
                        custevent_hul_prev_task_status: oldTaskData.currentStatus,
                        custevent_hul_prev_task_internal_notes: oldTaskData.currentInternalNote,
                        custevent_hul_prev_task_action_taken: oldTaskData.currentActionsTaken,
                        custevent_hul_prev_task_tech_assigned: oldTaskData.currentAssignedTo
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
            }
        }
    }
    return { beforeLoad: beforeLoad, beforeSubmit: beforeSubmit, afterSubmit: afterSubmit };
});
