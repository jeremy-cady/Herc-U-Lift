/* eslint-disable max-len */
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 05/05/2025
 * Version: 1.3
 */

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as record from 'N/record';
import * as search from 'N/search';

interface TaskDataObject {
    taskID: string;
    taskCompletedDate: string;
    taskResult: string | string[];
    taskStatus: string;
    taskInternalNote: string;
    taskActionsTaken: string;
    taskAssignedTo: string | string[];
}

/**
 * Type guard: NetSuite lookup objects have { value, text }.
 */
function isLookupValueObject(item: any): item is { value: string; text: string } {
    return typeof item === 'object' && item !== null && 'value' in item && 'text' in item;
}

/**
 * Extract field value(s) from a Record, returning a string or string[] of internal IDs.
 * (Keeps your explicit checks; no generic `else` in the array branch.)
 */
function extractFieldValue(recordObj: record.Record, fieldId: string): string | string[] {
    const value = recordObj.getValue({ fieldId });

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return [];
        }
        if (isLookupValueObject(value[0])) {
            return value.map((item) => item.value);
        } else if (typeof value[0] === 'string' || typeof value[0] === 'number') {
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
function extractRecordFieldValue(value: any): string | string[] {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return [];
        }
        if (isLookupValueObject(value[0])) {
            return value.map((item) => item.value);
        } else if (typeof value[0] === 'string' || typeof value[0] === 'number') {
            return value.map(String);
        }
        return [];
    }
    return String(value);
}

/**
 * Safely read a field from search.lookupFields; returns a single string.
 */
function getLookupFieldValue(lookupResult: any, fieldId: string): string {
    const value = lookupResult[fieldId];
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
function toSingleId(v: string | string[]): string {
    return Array.isArray(v) ? String(v[0] || '') : String(v || '');
}

/**
 * In XEDIT, newRecord may omit non-changed fields. Fallback to lookup of Task.assigned.
 */
function safeReadTaskAssigned(taskId: number | string): string {
    const id = Number(taskId) || 0;
    if (!id) return '';
    try {
        const res: any = search.lookupFields({
            type: record.Type.TASK,
            id,
            columns: ['assigned']
        });
        return getLookupFieldValue(res, 'assigned'); // internal ID of employee
    } catch (e) {
        log.debug('safeReadTaskAssigned lookup failed', { taskId: id, message: (e as Error).message });
        return '';
    }
}

// --- User Event ---

function beforeLoad(_ctx: EntryPoints.UserEvent.beforeLoadContext) {
    try {
        return;
    } catch (e) {
        log.error('beforeLoad ERROR', { message: (e as Error).message, stack: (e as Error).stack });
    }
}

function beforeSubmit(ctx: EntryPoints.UserEvent.beforeSubmitContext) {
    try {
        const newRecord = ctx.newRecord;
        const caseNumRaw = newRecord.getValue({ fieldId: 'supportcase' });
        const caseNum = Number(caseNumRaw) || 0;
        if (!caseNum) {
            log.debug('beforeSubmit: no linked supportcase; skipping', { taskId: newRecord.id, caseNumRaw });
            return;
        }

        const isEditLike = ctx.type === ctx.UserEventType.EDIT || ctx.type === ctx.UserEventType.XEDIT;
        if (!isEditLike) {
            return;
        }

        const oldRecord = ctx.oldRecord; // may be limited/undefined in XEDIT
        const oldAssignedTo = oldRecord ? extractRecordFieldValue(oldRecord.getValue({ fieldId: 'assigned' })) : '';
        const newAssignedFromRec = extractRecordFieldValue(newRecord.getValue({ fieldId: 'assigned' }));

        // On XEDIT, if Assigned wasn't changed, newRecord may not include it; fallback to lookup.
        const candidateNewAssigned = toSingleId(newAssignedFromRec) || safeReadTaskAssigned(newRecord.id as number);
        const singleAssignee = toSingleId(candidateNewAssigned);

        const oldAssignedId = Array.isArray(oldAssignedTo) ? oldAssignedTo.join(',') : String(oldAssignedTo || '');
        const newAssignedId = String(singleAssignee || '');
        const assignedChanged = !!oldRecord && oldAssignedId !== newAssignedId;

        // Read current Case (decide if we should backfill)
        const existingCaseTaskData: any = search.lookupFields({
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
        const existingTechAssigned = getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_tech_assigned');
        const caseNeedsValue = !existingTechAssigned;

        if (!singleAssignee) {
            log.debug('beforeSubmit: no assignee resolved; skipping', { taskId: newRecord.id, isEditLike, assignedChanged, caseNeedsValue });
            return;
        }
        if (!assignedChanged && !caseNeedsValue) {
            log.debug('beforeSubmit: assigned unchanged and case populated; skipping', { taskId: newRecord.id });
            return;
        }

        const newTaskObj: TaskDataObject = {
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

        const verify = search.lookupFields({
            type: record.Type.SUPPORT_CASE,
            id: caseNum,
            columns: ['custevent_hul_curr_task_tech_assigned']
        });
        log.audit('beforeSubmit verify (EDIT/XEDIT)', {
            taskId: newRecord.id,
            caseNum,
            assignedChanged,
            caseNeedsValue,
            wrote: newTaskObj.taskAssignedTo,
            now: verify.custevent_hul_curr_task_tech_assigned
        });
    } catch (e) {
        log.error('beforeSubmit ERROR', { message: (e as Error).message, stack: (e as Error).stack });
    }
}

function afterSubmit(ctx: EntryPoints.UserEvent.afterSubmitContext) {
    try {
        const newRecord = ctx.newRecord;
        const caseNumRaw = newRecord.getValue({ fieldId: 'supportcase' });
        const caseNum = Number(caseNumRaw) || 0;
        if (!caseNum) {
            log.debug('afterSubmit: no linked supportcase; skipping', { taskId: newRecord.id, caseNumRaw });
            return;
        }

        const isCreate = ctx.type === ctx.UserEventType.CREATE;
        const isEditLike = ctx.type === ctx.UserEventType.EDIT || ctx.type === ctx.UserEventType.XEDIT;

        // Assigned from newRecord or fallback to lookup (covers XEDIT where field may be missing)
        const assignedToRaw = extractRecordFieldValue(newRecord.getValue({ fieldId: 'assigned' }));
        const singleAssignee = toSingleId(assignedToRaw) || safeReadTaskAssigned(newRecord.id as number);
        if (!singleAssignee) {
            log.debug('afterSubmit: no assignee resolved; skipping', { taskId: newRecord.id, eventType: ctx.type });
            return;
        }

        const existingCaseTaskData: any = search.lookupFields({
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
        const existingTechAssigned = getLookupFieldValue(existingCaseTaskData, 'custevent_hul_curr_task_tech_assigned');
        const caseNeedsValue = !existingTechAssigned;

        // Default: write on CREATE. On EDIT/XEDIT, only backfill if Case is blank.
        if (!isCreate && !(isEditLike && caseNeedsValue)) {
            return;
        }

        const newTaskObj: TaskDataObject = {
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

        const verify = search.lookupFields({
            type: record.Type.SUPPORT_CASE,
            id: caseNum,
            columns: ['custevent_hul_curr_task_tech_assigned']
        });
        log.audit('afterSubmit verify (CREATE/backfill EDIT/XEDIT)', {
            eventType: ctx.type,
            taskId: newRecord.id,
            caseNum,
            wrote: newTaskObj.taskAssignedTo,
            now: verify.custevent_hul_curr_task_tech_assigned
        });
    } catch (e) {
        log.error('afterSubmit ERROR', { message: (e as Error).message, stack: (e as Error).stack });
    }
}

export = { beforeLoad, beforeSubmit, afterSubmit };
