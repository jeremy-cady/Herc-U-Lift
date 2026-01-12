# hul_clone_project_userNotes_to_task_ue

User Event that clones HUL User Notes from Projects to a target Task on note creation.

## Script Info
- Type: User Event Script
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_clone_project_userNotes_to_task_ue.ts`

## Trigger
- `afterSubmit` on CREATE only.

## Key Fields
- Note form (internal ID): `218` (HUL User Note form).
- `custrecord_hul_sync_note_to_task`: target Task internal ID stored on the Note.
- Note link fields:
  - `record` / `entity`: cleared on clone to prevent association to the Project.
  - `activity`: set on clone to link to the Task.

## Behavior
- Exits unless the Note uses the HUL User Note form.
- Reads `custrecord_hul_sync_note_to_task`; exits if missing/invalid.
- Verifies the source Note is attached to a Project (Job) by attempting `record.Type.JOB` loads using `record` or `entity`.
- Creates a new Note:
  - Copies title, body, note type, and direction.
  - Clears `record` and `entity`.
  - Sets `activity` to the Task ID.
- Logs audit/debug events; no searches and no recursion (clone lacks the sync field).
