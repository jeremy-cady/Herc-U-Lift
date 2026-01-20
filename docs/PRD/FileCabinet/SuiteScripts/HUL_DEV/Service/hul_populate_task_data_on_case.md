# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateTaskDataMR
title: Populate Task Data on Cases (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Task

---

## 1. Overview
A Map/Reduce script that backfills current and previous task details onto support cases of a specific category.

## 2. Business Goal
Ensures case records have up-to-date task summary fields even if they were not populated at creation time.

## 3. User Story
As a service user, when cases need task summaries, I want task summaries on cases, so that I can review work history quickly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | Backfill current and previous task fields for category 4 cases |

## 5. Functional Requirements
- The system must query cases where `category = '4'` and `id > 1000000`.
- The system must identify the most recent task (`t1`) and previous task (`t2`) by task ID.
- If no previous task exists, previous task fields must mirror current task fields.
- The system must populate case fields: current task fields (`custevent_hul_current_task_*`) and previous task fields (`custevent_hul_prev_task_*`).
- Errors must be logged without stopping the run.

## 6. Data Contract
### Record Types Involved
- Support Case
- Task

### Fields Referenced
- Case | `category`
- Case | `id`
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_previous_task_number`
- Case | `custevent_hul_prev_task_start_date`
- Case | `custevent_hul_prev_task_date_completed`
- Case | `custevent_hul_prev_task_status`
- Case | `custevent_hul_prev_task_result`
- Case | `custevent_hul_prev_task_action_taken`
- Case | `custevent_hul_prev_task_internal_notes`
- Case | `custevent_hul_prev_task_tech_assigned`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- If no previous task exists, previous task fields mirror current task fields.
- No tasks found; case is not updated.
- Errors are logged without halting execution.

## 8. Implementation Notes (Optional)
- Uses task ID ordering to determine current vs previous.

## 9. Acceptance Criteria
- Given category 4 cases, when the script runs, then current and previous task data is populated.
- Given a case with only one task, when the script runs, then current values are copied into previous fields.
- Given an error occurs, when the script runs, then it is logged without halting execution.

## 10. Testing Notes
- Case with two tasks gets current and previous fields populated.
- Case with one task copies current into previous.
- No tasks found; case not updated.
- submitFields failures logged.

## 11. Deployment Notes
- Upload `hul_populate_task_data_on_case.js`.
- Create Map/Reduce script record.
- Run in sandbox and validate case updates.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should task ordering use dates instead of IDs?
- Should category ID be configurable?
- Risk: Task ID ordering not chronological (Mitigation: Use dates if possible)
- Risk: Large case volume (Mitigation: Monitor MR usage)

---
