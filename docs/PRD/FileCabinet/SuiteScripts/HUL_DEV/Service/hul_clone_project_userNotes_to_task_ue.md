# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CloneProjectNotesUE
title: Clone Project Notes to Task (User Event)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_clone_project_userNotes_to_task_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Note
  - Task
  - Project (Job)

---

## 1. Overview
A User Event that clones project-attached user notes to a target task when the note is created using the HUL User Note form.

---

## 2. Business Goal
Ensure notes entered on projects are also visible on related tasks without manual duplication.

---

## 3. User Story
- As a project user, I want my notes to appear on tasks so that task context is complete.
- As an admin, I want cloning only for project notes so that other notes are not duplicated.
- As a support user, I want the cloned note linked to the task so that it appears in task activity.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit (create) | custrecord_hul_sync_note_to_task, record, entity | Form ID 218 and note linked to a Project | Clone note and set activity to task |

---

## 5. Functional Requirements
- The system must run on afterSubmit for CREATE.
- The system must only run for notes created on form ID 218.
- The system must read target Task ID from custrecord_hul_sync_note_to_task.
- The system must only proceed if the note is associated with a Project (Job) via record or entity.
- The system must clone the note and copy title, note, notetype, and direction.
- The system must clear record and entity on the clone and set activity to the Task ID.
- The system must log the new note ID.
- Errors must be logged without breaking note creation.

---

## 6. Data Contract
### Record Types Involved
- Note
- Task
- Project (Job)

### Fields Referenced
- custrecord_hul_sync_note_to_task
- record
- entity
- title
- note
- notetype
- direction
- activity

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Notes without task ID or non-project context are skipped.
- Record create failures are logged without blocking the original note.

---

## 8. Implementation Notes (Optional)
- Clone links only via activity; record and entity are cleared.

---

## 9. Acceptance Criteria
- Given a note created on form 218 linked to a project, when saved, then a clone is created for the task.
- Given a cloned note, when created, then it links via activity only.
- Given missing task ID or non-project note, when saved, then no clone is created.

---

## 10. Testing Notes
- Create a note on a project using form 218 with task ID and confirm clone on task.
- Create a note without task ID and confirm no clone.
- Create a note on a non-project record and confirm no clone.

---

## 11. Deployment Notes
- Upload hul_clone_project_userNotes_to_task_ue.js.
- Deploy on Note record type.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should the form ID (218) be configurable?
- Should cloning happen on edit as well?
- Form ID changes.
- Task ID missing.

---
