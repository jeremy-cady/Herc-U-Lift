/* eslint-disable max-len */
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 05/05/2025
 * Version: 1.3
 */
define(["require", "exports", "N/log", "N/record", "N/search"], function (require, exports, log, record, search) {
    "use strict";
    /**
     * Type guard: NetSuite lookup objects have { value, text }.
     */
    function isLookupValueObject(item) {
        return typeof item === 'object' && item !== null && 'value' in item && 'text' in item;
    }
    /**
     * Extract field value(s) from a Record, returning a string or string[] of internal IDs.
     * (Keeps your explicit checks; no generic `else` in the array branch.)
     */
    function extractFieldValue(recordObj, fieldId) {
        var value = recordObj.getValue({ fieldId: fieldId });
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return [];
            }
            if (isLookupValueObject(value[0])) {
                return value.map(function (item) { return item.value; });
            }
            else if (typeof value[0] === 'string' || typeof value[0] === 'number') {
                return value.map(String);
            }
            // For any other unexpected array shapes, return empty to avoid coercing the entire array to a CSV string.
            return [];
        }
        return String(value);
    }
    /**
     * Normalize a value from record.getValue() (single or array) into string or string[] IDs.
     * (Keeps your explicit checks; no generic `else` in the array branch.)
     */
    function extractRecordFieldValue(value) {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return [];
            }
            if (isLookupValueObject(value[0])) {
                return value.map(function (item) { return item.value; });
            }
            else if (typeof value[0] === 'string' || typeof value[0] === 'number') {
                return value.map(String);
            }
            return [];
        }
        return String(value);
    }
    /**
     * Safely read a field from search.lookupFields; returns a single string.
     */
    function getLookupFieldValue(lookupResult, fieldId) {
        var value = lookupResult[fieldId];
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        if (Array.isArray(value)) {
            if (value.length > 0) {
                if (isLookupValueObject(value[0])) {
                    return String(value[0].value);
                }
                return String(value[0]);
            }
            return '';
        }
        return String(value);
    }
    /**
     * Coerce to exactly one internal ID (string). If array, use the first element.
     */
    function toSingleId(v) {
        return Array.isArray(v) ? String(v[0] || '') : String(v || '');
    }
    /**
     * In XEDIT, newRecord may omit non-changed fields. Fallback to lookup of Task.assigned.
     */
    function safeReadTaskAssigned(taskId) {
        var id = Number(taskId) || 0;
        if (!id)
            return '';
        try {
            var res = search.lookupFields({
                type: record.Type.TASK,
                id: id,
                columns: ['assigned']
            });
            return getLookupFieldValue(res, 'assigned'); // internal ID of employee
        }
        catch (e) {
            log.debug('safeReadTaskAssigned lookup failed', { taskId: id, message: e.message });
            return '';
        }
    }
    // --- User Event ---
    function beforeLoad(_ctx) {
        try {
            return;
        }
        catch (e) {
            log.error('beforeLoad ERROR', { message: e.message, stack: e.stack });
        }
    }
    function beforeSubmit(ctx) {
        try {
            var newRecord = ctx.newRecord;
            var caseNumRaw = newRecord.getValue({ fieldId: 'supportcase' });
            var caseNum = Number(caseNumRaw) || 0;
            if (!caseNum) {
                log.debug('beforeSubmit: no linked supportcase; skipping', { taskId: newRecord.id, caseNumRaw: caseNumRaw });
                return;
            }
            var isEditLike = ctx.type === ctx.UserEventType.EDIT || ctx.type === ctx.UserEventType.XEDIT;
            if (!isEditLike) {
                return;
            }
            var oldRecord = ctx.oldRecord; // may be limited/undefined in XEDIT
            var oldAssignedTo = oldRecord ? extractRecordFieldValue(oldRecord.getValue({ fieldId: 'assigned' })) : '';
            var newAssignedFromRec = extractRecordFieldValue(newRecord.getValue({ fieldId: 'assigned' }));
            // On XEDIT, if Assigned wasn't changed, newRecord may not include it; fallback to lookup.
            var candidateNewAssigned = toSingleId(newAssignedFromRec) || safeReadTaskAssigned(newRecord.id);
            var singleAssignee = toSingleId(candidateNewAssigned);
            var oldAssignedId = Array.isArray(oldAssignedTo) ? oldAssignedTo.join(',') : String(oldAssignedTo || '');
            var newAssignedId = String(singleAssignee || '');
            var assignedChanged = !!oldRecord && oldAssignedId !== newAssignedId;
            // Read current Case (decide if we should backfill)
            var existingCaseTaskData = search.lookupFields({
                type: record.Type.SUPPORT_CASE,
                id: caseNum,
                columns: [
                    'custevent_hul_curr_task_tech_assigned',
                    'custevent_hul_current_task_number',
                    'custevent_hul_current_start_date',
                    'custevent_current_task_date_completed',
                    'custevent_hul_current_task_status',
                    'custevent_hul_current_task_result',
                    'custevent_hul_curr_task_action_taken',
                    'custevent_hul_curr_task_internal_notes'
                ]
            });
            var existingTechAssigned = getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_tech_assigned');
            var caseNeedsValue = !existingTechAssigned;
            if (!singleAssignee) {
                log.debug('beforeSubmit: no assignee resolved; skipping', { taskId: newRecord.id, isEditLike: isEditLike, assignedChanged: assignedChanged, caseNeedsValue: caseNeedsValue });
                return;
            }
            if (!assignedChanged && !caseNeedsValue) {
                log.debug('beforeSubmit: assigned unchanged and case populated; skipping', { taskId: newRecord.id });
                return;
            }
            var newTaskObj = {
                taskID: String(newRecord.id),
                taskCompletedDate: String(newRecord.getValue({ fieldId: 'custevent_nx_end_date' })),
                taskResult: extractFieldValue(newRecord, 'custevent_nxc_task_result'),
                taskStatus: String(newRecord.getValue({ fieldId: 'status' })),
                taskInternalNote: String(newRecord.getValue({ fieldId: 'custevent_nxc_internal_note' })),
                taskActionsTaken: String(newRecord.getValue({ fieldId: 'custevent_nx_actions_taken' })),
                taskAssignedTo: singleAssignee
            };
            record.submitFields({
                type: record.Type.SUPPORT_CASE,
                id: caseNum,
                values: {
                    custevent_hul_curr_task_tech_assigned: newTaskObj.taskAssignedTo,
                    custevent_hul_current_task_number: newTaskObj.taskID,
                    custevent_hul_current_start_date: newTaskObj.taskCompletedDate,
                    custevent_current_task_date_completed: newTaskObj.taskCompletedDate,
                    custevent_hul_current_task_status: newTaskObj.taskStatus,
                    custevent_hul_current_task_result: Array.isArray(newTaskObj.taskResult) ? newTaskObj.taskResult.join(',') : newTaskObj.taskResult,
                    custevent_hul_curr_task_action_taken: newTaskObj.taskActionsTaken,
                    custevent_hul_curr_task_internal_notes: newTaskObj.taskInternalNote,
                    custevent_hul_previous_task_number: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_task_number'),
                    custevent_hul_prev_task_tech_assigned: existingTechAssigned,
                    custevent_hul_previous_start_date: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_start_date'),
                    custevent_hul_prev_task_date_completed: getLookupFieldValue(existingCaseTaskData, 'custevent_current_task_date_completed'),
                    custevent_hul_prev_task_status: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_task_status'),
                    custevent_hul_prev_task_result: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_task_result'),
                    custevent_hul_prev_task_action_taken: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_action_taken'),
                    custevent_hul_prev_task_internal_notes: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_internal_notes')
                },
                options: { enableSourcing: false, ignoreMandatoryFields: true }
            });
            var verify = search.lookupFields({
                type: record.Type.SUPPORT_CASE,
                id: caseNum,
                columns: ['custevent_hul_curr_task_tech_assigned']
            });
            log.audit('beforeSubmit verify (EDIT/XEDIT)', {
                taskId: newRecord.id,
                caseNum: caseNum,
                assignedChanged: assignedChanged,
                caseNeedsValue: caseNeedsValue,
                wrote: newTaskObj.taskAssignedTo,
                now: verify.custevent_hul_curr_task_tech_assigned
            });
        }
        catch (e) {
            log.error('beforeSubmit ERROR', { message: e.message, stack: e.stack });
        }
    }
    function afterSubmit(ctx) {
        try {
            var newRecord = ctx.newRecord;
            var caseNumRaw = newRecord.getValue({ fieldId: 'supportcase' });
            var caseNum = Number(caseNumRaw) || 0;
            if (!caseNum) {
                log.debug('afterSubmit: no linked supportcase; skipping', { taskId: newRecord.id, caseNumRaw: caseNumRaw });
                return;
            }
            var isCreate = ctx.type === ctx.UserEventType.CREATE;
            var isEditLike = ctx.type === ctx.UserEventType.EDIT || ctx.type === ctx.UserEventType.XEDIT;
            // Assigned from newRecord or fallback to lookup (covers XEDIT where field may be missing)
            var assignedToRaw = extractRecordFieldValue(newRecord.getValue({ fieldId: 'assigned' }));
            var singleAssignee = toSingleId(assignedToRaw) || safeReadTaskAssigned(newRecord.id);
            if (!singleAssignee) {
                log.debug('afterSubmit: no assignee resolved; skipping', { taskId: newRecord.id, eventType: ctx.type });
                return;
            }
            var existingCaseTaskData = search.lookupFields({
                type: record.Type.SUPPORT_CASE,
                id: caseNum,
                columns: [
                    'custevent_hul_curr_task_tech_assigned',
                    'custevent_hul_current_task_number',
                    'custevent_hul_current_start_date',
                    'custevent_current_task_date_completed',
                    'custevent_hul_current_task_status',
                    'custevent_hul_current_task_result',
                    'custevent_hul_curr_task_action_taken',
                    'custevent_hul_curr_task_internal_notes'
                ]
            });
            var existingTechAssigned = getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_tech_assigned');
            var caseNeedsValue = !existingTechAssigned;
            // Default: write on CREATE. On EDIT/XEDIT, only backfill if Case is blank.
            if (!isCreate && !(isEditLike && caseNeedsValue)) {
                return;
            }
            var newTaskObj = {
                taskID: String(newRecord.id),
                taskCompletedDate: String(newRecord.getValue({ fieldId: 'custevent_nx_end_date' })),
                taskResult: extractFieldValue(newRecord, 'custevent_nxc_task_result'),
                taskStatus: String(newRecord.getValue({ fieldId: 'status' })),
                taskInternalNote: String(newRecord.getValue({ fieldId: 'custevent_nxc_internal_note' })),
                taskActionsTaken: String(newRecord.getValue({ fieldId: 'custevent_nx_actions_taken' })),
                taskAssignedTo: singleAssignee
            };
            record.submitFields({
                type: record.Type.SUPPORT_CASE,
                id: caseNum,
                values: {
                    custevent_hul_curr_task_tech_assigned: newTaskObj.taskAssignedTo,
                    custevent_hul_current_task_number: newTaskObj.taskID,
                    custevent_hul_current_start_date: newTaskObj.taskCompletedDate,
                    custevent_current_task_date_completed: newTaskObj.taskCompletedDate,
                    custevent_hul_current_task_status: newTaskObj.taskStatus,
                    custevent_hul_current_task_result: Array.isArray(newTaskObj.taskResult) ? newTaskObj.taskResult.join(',') : newTaskObj.taskResult,
                    custevent_hul_curr_task_action_taken: newTaskObj.taskActionsTaken,
                    custevent_hul_curr_task_internal_notes: newTaskObj.taskInternalNote,
                    custevent_hul_previous_task_number: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_task_number'),
                    custevent_hul_prev_task_tech_assigned: existingTechAssigned,
                    custevent_hul_previous_start_date: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_start_date'),
                    custevent_hul_prev_task_date_completed: getLookupFieldValue(existingCaseTaskData, 'custevent_current_task_date_completed'),
                    custevent_hul_prev_task_status: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_task_status'),
                    custevent_hul_prev_task_result: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_current_task_result'),
                    custevent_hul_prev_task_action_taken: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_action_taken'),
                    custevent_hul_prev_task_internal_notes: getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_internal_notes')
                },
                options: { enableSourcing: false, ignoreMandatoryFields: true }
            });
            var verify = search.lookupFields({
                type: record.Type.SUPPORT_CASE,
                id: caseNum,
                columns: ['custevent_hul_curr_task_tech_assigned']
            });
            log.audit('afterSubmit verify (CREATE/backfill EDIT/XEDIT)', {
                eventType: ctx.type,
                taskId: newRecord.id,
                caseNum: caseNum,
                wrote: newTaskObj.taskAssignedTo,
                now: verify.custevent_hul_curr_task_tech_assigned
            });
        }
        catch (e) {
            log.error('afterSubmit ERROR', { message: e.message, stack: e.stack });
        }
    }
    return { beforeLoad: beforeLoad, beforeSubmit: beforeSubmit, afterSubmit: afterSubmit };
});
