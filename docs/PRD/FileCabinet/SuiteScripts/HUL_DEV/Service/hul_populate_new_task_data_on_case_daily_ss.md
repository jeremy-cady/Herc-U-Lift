# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateTaskDataDailySS
title: Populate Latest Task Data on Cases (Daily Scheduled)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_daily_ss.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Task
  - Employee

---

## 1. Overview
A scheduled script that backfills current and previous task details onto support cases using the two most recent tasks per case.

## 2. Business Goal
Ensures case records reflect task history even when task data wasn’t populated at the time of creation.

## 3. User Story
As a service user, when a case is missing task history, I want case task history visible, so that I can review recent work.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled | TBD | Daily backfill | Populate current and previous task fields on cases missing `custevent_hul_current_task_number` |

## 5. Functional Requirements
- The system must query cases where `custevent_hul_current_task_number` is null.
- The system must join the latest two tasks per case using row-number ordering by task ID.
- The system must populate current task fields: `custevent_hul_current_task_number`, `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_status`, `custevent_hul_current_task_result`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_internal_notes`, `custevent_hul_curr_task_tech_assigned`.
- The system must populate previous task fields: `custevent_hul_previous_task_number`, `custevent_hul_prev_task_start_date`, `custevent_hul_prev_task_date_completed`, `custevent_hul_prev_task_status`, `custevent_hul_prev_task_result`, `custevent_hul_prev_task_action_taken`, `custevent_hul_prev_task_internal_notes`, `custevent_hul_prev_task_tech_assigned`.
- The system must validate assigned technicians; if a tech is inactive, clear the assignment field.
- Errors must be logged without stopping the run.

## 6. Data Contract
### Record Types Involved
- Support Case
- Task
- Employee

### Fields Referenced
- Support Case | `custevent_hul_current_task_number`
- Support Case | `custevent_hul_current_start_date`
- Support Case | `custevent_current_task_date_completed`
- Support Case | `custevent_hul_current_task_status`
- Support Case | `custevent_hul_current_task_result`
- Support Case | `custevent_hul_curr_task_action_taken`
- Support Case | `custevent_hul_curr_task_internal_notes`
- Support Case | `custevent_hul_curr_task_tech_assigned`
- Support Case | `custevent_hul_previous_task_number`
- Support Case | `custevent_hul_prev_task_start_date`
- Support Case | `custevent_hul_prev_task_date_completed`
- Support Case | `custevent_hul_prev_task_status`
- Support Case | `custevent_hul_prev_task_result`
- Support Case | `custevent_hul_prev_task_action_taken`
- Support Case | `custevent_hul_prev_task_internal_notes`
- Support Case | `custevent_hul_prev_task_tech_assigned`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- If a tech is inactive, clear the assignment field.
- No tasks found; case is not updated.
- Errors are logged without halting the script.

## 8. Implementation Notes (Optional)
- Uses task ID ordering to infer current and previous tasks.
- SuiteQL query plus employee lookups per case.

## 9. Acceptance Criteria
- Given a case missing current task numbers, when the script runs, then the latest task data is populated.
- Given a case with a previous task, when the script runs, then previous task fields are populated.
- Given an inactive technician, when the script runs, then the assignment field is cleared.
- Given an error during updates, when the script runs, then the error is logged without halting the run.

## 10. Testing Notes
- Case without current task fields receives updates.
- No tasks found; case not updated.
- Assigned tech inactive; assignment cleared.
- submitFields errors logged.

## 11. Deployment Notes
- Upload `hul_populate_new_task_data_on_case_daily_ss.js`.
- Create Scheduled Script record.
- Schedule daily execution.
- Verify case fields populate after job runs.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should task ordering use completed date instead of ID?
- Should this logic move to a Map/Reduce for scale?
- Risk: Task ID ordering not chronological (Mitigation: Use dates if possible)
- Risk: High case volume (Mitigation: Monitor runtime and consider MR)

---
