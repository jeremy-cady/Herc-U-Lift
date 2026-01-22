# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_new_task_data_on_case_daily_ss
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: TypeScript/HUL_DEV/Service/hul_populate_new_task_data_on_case_daily_ss.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Task
  - Employee

---

## 1. Overview
Scheduled script that backfills current and previous task details onto support cases that are missing current task data.

---

## 2. Business Goal
Backfill support cases with current and previous task details when missing.

---

## 3. User Story
As a user, when the daily script runs, I want missing task data on support cases filled in, so that case records are complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled execution | Task fields on Support Case | custevent_hul_current_task_number is null | Populate current and previous task fields |

---

## 5. Functional Requirements
- Use SuiteQL to find support cases where custevent_hul_current_task_number is null and return the two most recent tasks per case.
- Build TaskDataObject for each case with current and previous task details.
- Validate assigned techs by checking employee.isinactive and clear inactive techs.
- Write current and previous task fields back to the support case via record.submitFields.

---

## 6. Data Contract
### Record Types Involved
- Support Case
- Task
- Employee

### Fields Referenced
- custevent_hul_current_task_number
- custevent_hul_current_start_date
- custevent_current_task_date_completed
- custevent_hul_current_task_status
- custevent_hul_current_task_result
- custevent_hul_curr_task_action_taken
- custevent_hul_curr_task_internal_notes
- custevent_hul_curr_task_tech_assigned
- custevent_hul_previous_task_number
- custevent_hul_prev_task_start_date
- custevent_hul_prev_task_date_completed
- custevent_hul_prev_task_status
- custevent_hul_prev_task_result
- custevent_hul_prev_task_action_taken
- custevent_hul_prev_task_internal_notes
- custevent_hul_prev_task_tech_assigned
- employee.isinactive

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Inactive techs are cleared from assignments.

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
