/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 * Project → Task Note Sync (CREATE only)
 * - Trigger: Note created using the HUL User Note form (internal ID: 218).
 * - Reads target Task ID from custrecord_hul_sync_note_to_task on the Note.
 * - Proceeds only if the Note is associated with a Project (Job).
 * - Clone behavior:
 *      • Links cloned Note to the Task via 'activity'
 *      • Explicitly clears 'record' AND 'entity' on the clone so it does NOT appear on the Project
 *      • Copies title, body, notetype, direction (but NOT entity)
 * - No searches. No recursion (clone does NOT carry the sync field).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
define(["require", "exports", "N/record", "N/log"], function (require, exports, record, log) {
    "use strict";
    const FIELD_SYNC_TASK = 'custrecord_hul_sync_note_to_task'; // Note custom field holding the target Task internal ID
    const FORM_ID_HUL_NOTE = 218; // HUL User Note form internal ID
    function toStr(v) {
        return (v ?? '').toString();
    }
    function toIntOrNull(v) {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }
    function isNonEmptyId(v) {
        const n = toIntOrNull(v);
        return !!n && n > 0;
    }
    /** Best-effort: is this internal ID a Job (Project)? */
    function isJobId(id) {
        if (!id)
            return false;
        try {
            record.load({ type: record.Type.JOB, id });
            return true;
        }
        catch {
            return false;
        }
    }
    /** Clone the Note to a Task (attach ONLY via 'activity'; clear 'record' and 'entity'). */
    function cloneNoteToTask(params) {
        const { taskId, title, body, notetype, direction, sourceNoteId } = params;
        const n = record.create({ type: record.Type.NOTE });
        // Content
        n.setValue({ fieldId: 'title', value: title });
        n.setValue({ fieldId: 'note', value: body });
        // Optionals
        if (isNonEmptyId(notetype))
            n.setValue({ fieldId: 'notetype', value: Number(notetype) });
        if (isNonEmptyId(direction))
            n.setValue({ fieldId: 'direction', value: Number(direction) });
        // Ensure the clone does NOT appear on the Project:
        // - clear 'record' and 'entity'
        // - link exclusively via 'activity' to the Task
        n.setValue({ fieldId: 'record', value: null });
        n.setValue({ fieldId: 'entity', value: null });
        n.setValue({ fieldId: 'activity', value: taskId });
        const newId = Number(n.save({ enableSourcing: false, ignoreMandatoryFields: true }));
        log.audit('Project→Task Note Sync: Cloned note', {
            sourceNoteId,
            newTaskNoteId: newId,
            linkedVia: 'activity',
            taskId
        });
        return newId;
    }
    const afterSubmit = (ctx) => {
        try {
            if (ctx.type !== ctx.UserEventType.CREATE) {
                log.debug('Project→Task Note Sync: Skip (not CREATE)', { type: ctx.type });
                return;
            }
            const note = ctx.newRecord;
            // Form guard: only run on the HUL User Note form
            const formId = Number(note.getValue({ fieldId: 'customform' }) || 0);
            if (FORM_ID_HUL_NOTE && formId !== FORM_ID_HUL_NOTE) {
                log.debug('Project→Task Note Sync: Skip (not HUL Note form)', { formId });
                return;
            }
            // Target Task ID from the custom field
            const taskIdRaw = note.getValue({ fieldId: FIELD_SYNC_TASK });
            if (!isNonEmptyId(taskIdRaw)) {
                log.debug('Project→Task Note Sync: No target Task ID on note; exit', {});
                return;
            }
            const taskId = Number(taskIdRaw);
            // Confirm the source note is on a Project (Job)
            const attachedRecordId = toIntOrNull(note.getValue({ fieldId: 'record' }));
            const entityId = toIntOrNull(note.getValue({ fieldId: 'entity' }));
            const isProjectContext = (attachedRecordId ? isJobId(attachedRecordId) : false) ||
                (entityId ? isJobId(entityId) : false);
            if (!isProjectContext) {
                log.audit('Project→Task Note Sync: Note is not on a Project; no clone', {
                    attachedRecordId,
                    entityId
                });
                return;
            }
            // Source fields
            const sourceNoteId = Number(note.id) || 0;
            const title = toStr(note.getValue({ fieldId: 'title' }));
            const body = toStr(note.getValue({ fieldId: 'note' }));
            const notetype = toIntOrNull(note.getValue({ fieldId: 'notetype' }));
            const direction = toIntOrNull(note.getValue({ fieldId: 'direction' }));
            if (!title && !body) {
                log.audit('Project→Task Note Sync: Source note has no title/body; exit', { sourceNoteId, taskId });
                return;
            }
            log.debug('Project→Task Note Sync: Preparing clone', {
                sourceNoteId,
                taskId,
                formId,
                attachedRecordId,
                entityId,
                hasTitle: !!title,
                hasBody: !!body,
                notetype,
                direction,
                linkVia: 'activity',
                clearEntityAndRecord: true
            });
            cloneNoteToTask({
                sourceNoteId,
                taskId,
                title,
                body,
                notetype,
                direction
            });
        }
        catch (e) {
            log.error('Project→Task Note Sync: afterSubmit failure', e?.message || e);
        }
    };
    return { afterSubmit };
});
