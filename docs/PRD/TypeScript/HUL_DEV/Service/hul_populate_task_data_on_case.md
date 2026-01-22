# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_task_data_on_case
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Service/hul_populate_task_data_on_case.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Task

---

## 1. Overview
Map/Reduce that backfills current and previous task details onto support cases.

---

## 2. Business Goal
Populate support cases with current and previous task data.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want support cases updated with current and previous task data, so that case records are complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | Task fields on Support Case | Case category is 4 and case ID > 1000000 | Populate current and previous task fields |

---

## 5. Functional Requirements
- getInputData: SuiteQL query returns most recent task per support case and previous task when available (case category 4 and sc.id > 1000000).
- map: Emit each row keyed by case ID.
- reduce: Write current and previous task fields to the support case.
- summarize: No custom logic.

---

## 6. Data Contract
### Record Types Involved
- Support Case
- Task

### Fields Referenced
- Support case current task fields:
  - custevent_hul_current_task_number
  - custevent_hul_current_start_date
  - custevent_current_task_date_completed
  - custevent_hul_current_task_status
  - custevent_hul_current_task_result
  - custevent_hul_curr_task_action_taken
  - custevent_hul_curr_task_internal_notes
  - custevent_hul_curr_task_tech_assigned
- Support case previous task fields:
  - custevent_hul_previous_task_number
  - custevent_hul_prev_task_start_date
  - custevent_hul_prev_task_date_completed
  - custevent_hul_prev_task_status
  - custevent_hul_prev_task_result
  - custevent_hul_prev_task_action_taken
  - custevent_hul_prev_task_internal_notes
  - custevent_hul_prev_task_tech_assigned

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Applies to case category 4 and case IDs > 1000000.

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
