# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateTaskOnCreateUE
title: Populate Case Task Fields on Task Create (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_on_case_when_created_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case

---

## 1. Overview
A User Event that updates current/previous task summary fields on a case when a new task is created.

## 2. Business Goal
Ensures case task summary fields stay current with newly created tasks.

## 3. User Story
As a service user, when a new task is created, I want new tasks reflected on cases, so that task summaries stay current.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | TBD | CREATE | Shift existing case task data to previous and write new task data to current |

## 5. Functional Requirements
- The system must run on `afterSubmit` for `CREATE`.
- The system must read task fields: `supportcase`, `id`, `custevent_nx_start_date`, `custevent_nx_end_date`, `custevent_nxc_task_result`, `status`, `custevent_nxc_internal_note`, `custevent_nx_actions_taken`, `assigned`.
- The system must lookup case fields for current/previous task data.
- If both current and previous task IDs are blank, the system must populate only current fields.
- If current is set and previous is blank, the system must move current values into previous fields and set new task values into current fields.
- If both current and previous are set, the system must shift current values into previous fields and set new task values into current fields.
- Errors must be logged without blocking task creation.

## 6. Data Contract
### Record Types Involved
- Task
- Support Case

### Fields Referenced
- Task | `supportcase`
- Task | `id`
- Task | `custevent_nx_start_date`
- Task | `custevent_nx_end_date`
- Task | `custevent_nxc_task_result`
- Task | `status`
- Task | `custevent_nxc_internal_note`
- Task | `custevent_nx_actions_taken`
- Task | `assigned`
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_previous_task_number`
- Case | `custevent_hul_prev_task_date_completed`
- Case | `custevent_hul_prev_task_result`
- Case | `custevent_hul_prev_task_status`
- Case | `custevent_hul_prev_task_internal_notes`
- Case | `custevent_hul_prev_task_action_taken`
- Case | `custevent_hul_prev_task_tech_assigned`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- If both current and previous task IDs are blank, populate only current fields.
- If current is set and previous is blank, shift current to previous and set new current.
- If both current and previous are set, shift current to previous and set new current.
- Undefined list values from lookupFields are handled as empty.
- Errors are logged without blocking creation.

## 8. Implementation Notes (Optional)
- Uses lookupFields arrays for list fields; handles undefined values.

## 9. Acceptance Criteria
- Given a new task is created, when the script runs, then current fields populate on the case.
- Given existing current data, when the script runs, then current data shifts to previous fields.
- Given an error occurs, when the script runs, then it is logged and does not block creation.

## 10. Testing Notes
- Create a task for a case with no task data; current fields populate.
- Create a new task for a case with current data; previous fields shift and current updates.
- Case lookup returns undefined list values; script handles as empty.
- submitFields errors logged without blocking creation.

## 11. Deployment Notes
- Upload `hul_populate_task_on_case_when_created_ue.js`.
- Deploy as User Event on task record.
- Validate case updates on task create.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should this run only for certain case categories?
- Should previous task shifting be capped to one level?
- Risk: High task volume (Mitigation: Monitor UE performance)
- Risk: Inconsistent field values (Mitigation: Standardize inputs)

---
