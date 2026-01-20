# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TechAssignedOnTaskUE
title: Sync Case Task Assignee on Task Edit (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_tech_assigned_on_task_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case

---

## 1. Overview
A User Event that keeps case task summary fields in sync when a task is created or its assignee changes.

## 2. Business Goal
Ensures cases reflect the latest task technician and related task details, including backfilling in edit scenarios.

## 3. User Story
As a service coordinator, when a task is assigned, I want case task summaries updated, so that I can see the current technician.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | assigned | EDIT, XEDIT | Capture assignee changes on task edit |
| afterSubmit | assigned | CREATE | Update case current/previous task fields |
| afterSubmit | assigned | EDIT, XEDIT only when case current tech is missing | Backfill case task fields |

## 5. Functional Requirements
- The system must run on task `beforeSubmit` for `EDIT` and `XEDIT`.
- The system must run on task `afterSubmit` for `CREATE`, and for `EDIT`/`XEDIT` only when the case is missing the current tech.
- The system must read task fields: `supportcase`, `assigned`, `status`, `custevent_nx_end_date`, `custevent_nxc_task_result`, `custevent_nxc_internal_note`, `custevent_nx_actions_taken`.
- The system must read case task fields for current and previous values using `lookupFields`.
- If the assignee changes or the case has no current tech assigned, the system must write task values into current case fields.
- The system must shift existing current case task values into previous fields before writing new current values.
- On XEDIT where `assigned` may be missing from the new record, the system must look up the assignee from the task record.
- Errors must be logged without blocking task updates.

## 6. Data Contract
### Record Types Involved
- Task
- Support Case

### Fields Referenced
- Task | `supportcase`
- Task | `assigned`
- Task | `status`
- Task | `custevent_nx_end_date`
- Task | `custevent_nxc_task_result`
- Task | `custevent_nxc_internal_note`
- Task | `custevent_nx_actions_taken`
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_previous_task_number`
- Case | `custevent_hul_prev_task_tech_assigned`
- Case | `custevent_hul_previous_start_date`
- Case | `custevent_hul_prev_task_date_completed`
- Case | `custevent_hul_prev_task_status`
- Case | `custevent_hul_prev_task_result`
- Case | `custevent_hul_prev_task_action_taken`
- Case | `custevent_hul_prev_task_internal_notes`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- XEDIT may omit non-changed fields; assignee is retrieved by lookup when missing.
- No updates occur when there is no linked case or no resolved assignee.
- Errors are logged without blocking task updates.

## 8. Implementation Notes (Optional)
- Two lookupFields calls and one submitFields per qualifying event.

## 9. Acceptance Criteria
- Given a task is created with a linked case, when the script runs, then case current task fields populate.
- Given a task assignee changes, when the script runs, then case current fields update and previous fields shift.
- Given an XEDIT where assigned is missing and case current tech is blank, when the script runs, then the assignee is looked up and case fields update.
- Given no linked case or no resolved assignee, when the script runs, then no updates occur.

## 10. Testing Notes
- Create a task with a linked case; case current task fields populate.
- Edit task assignee; case current fields update and previous fields shift.
- XEDIT assigned change where newRecord omits `assigned`; lookup fills assignee.
- Case has current tech blank; backfill on edit.
- Task has no supportcase; script skips.
- lookupFields or submitFields errors are logged without blocking updates.

## 11. Deployment Notes
- Upload `hul_tech_assigned_on_task_ue.js`.
- Deploy as User Event on the task record.
- Validate case updates on task create and assignee edit.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should this run only for specific task statuses?
- Should previous task shifting be limited to one level?
- Risk: High task edit volume (Mitigation: Monitor UE performance)
- Risk: Assignee lookup failure (Mitigation: Log errors and verify assignments)

---
