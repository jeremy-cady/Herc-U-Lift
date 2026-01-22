# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_clone_project_userNotes_to_task_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Service/hul_clone_project_userNotes_to_task_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Note
  - Project (Job)
  - Task

---

## 1. Overview
User Event that clones HUL User Notes from Projects to a target Task on note creation.

---

## 2. Business Goal
Ensure project user notes are copied to the related task when created.

---

## 3. User Story
As a user, when I create a HUL User Note on a Project with a target Task, I want the note cloned to the Task, so that task records reflect the note.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (afterSubmit) | custrecord_hul_sync_note_to_task | Note form is 218 and target Task is present | Clone note to Task |

---

## 5. Functional Requirements
- Exit unless the Note uses form internal ID 218 (HUL User Note form).
- Read custrecord_hul_sync_note_to_task; exit if missing/invalid.
- Verify the source Note is attached to a Project (Job) by attempting record.Type.JOB loads using record or entity.
- Create a new Note:
  - Copy title, body, note type, and direction.
  - Clear record and entity.
  - Set activity to the Task ID.
- Log audit/debug events.
- No searches and no recursion (clone lacks the sync field).

---

## 6. Data Contract
### Record Types Involved
- Note
- Project (Job)
- Task

### Fields Referenced
- custrecord_hul_sync_note_to_task
- record
- entity
- activity
- title
- note
- notetype
- direction

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Exits if note form is not 218.
- Exits if target Task ID is missing/invalid.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
