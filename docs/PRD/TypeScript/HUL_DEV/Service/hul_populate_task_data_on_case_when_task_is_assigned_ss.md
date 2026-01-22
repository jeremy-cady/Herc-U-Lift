# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_task_data_on_case_when_task_is_assigned_ss
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: TypeScript/HUL_DEV/Service/hul_populate_task_data_on_case_when_task_is_assigned_ss.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case

---

## 1. Overview
Scheduled script that monitors recent task assignment changes and pushes current task data to the related support case.

---

## 2. Business Goal
Keep support case task assignments in sync with recent task assignment changes.

---

## 3. User Story
As a user, when a task assignment changes, I want the related case updated with current task data, so that assignment info is current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled execution | Task assignment fields | Recent assignment change detected | Update case current task fields and set assigned flag |

---

## 5. Functional Requirements
- Use SuiteQL over task, systemnote, and supportcase to track changes to EVENT.KASSIGNED within the last 4 minutes.
- Map rows into TaskDataObject.
- If the case is not already assigned, update current task fields on the case and set custevent_hul_is_assigned to true.
- Call scriptScheduler to pause and reschedule itself.
- scriptScheduler:
  - Busy-waits for 4 minutes and then resubmits the scheduled script (customscript_hul_pop_task_on_case_assign / customdeploy_hul_pop_task_on_case_assign).

---

## 6. Data Contract
### Record Types Involved
- Task
- Support Case

### Fields Referenced
- EVENT.KASSIGNED (system note)
- custevent_hul_current_start_date
- custevent_current_task_date_completed
- custevent_hul_current_task_status
- custevent_hul_current_task_result
- custevent_hul_curr_task_action_taken
- custevent_hul_curr_task_internal_notes
- custevent_hul_curr_task_tech_assigned
- custevent_hul_is_assigned

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Script uses busy-waiting for 4 minutes before resubmitting.

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
