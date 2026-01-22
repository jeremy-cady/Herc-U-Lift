# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_new_task_data_on_case_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case

---

## 1. Overview
User Event that captures task edits and pushes current task data to the related support case when fields change.

---

## 2. Business Goal
Keep support case task fields in sync with task edits.

---

## 3. User Story
As a user, when I edit a task, I want related support case task fields updated, so that the case reflects the latest task details.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| EDIT (beforeLoad) | custevent_hul_task_data_json | Task edited | Store task snapshot for comparison |
| EDIT (beforeSubmit) | custevent_hul_task_data_json | Snapshot missing | Rebuild snapshot |
| EDIT (afterSubmit) | Task fields | Snapshot changed and case type is 4 | Update support case task fields |

---

## 5. Functional Requirements
- beforeLoad:
  - Read current task fields and case category.
  - Store JSON snapshot in custevent_hul_task_data_json.
- beforeSubmit:
  - Ensure custevent_hul_task_data_json is populated, rebuilding if missing.
- afterSubmit:
  - Parse stored snapshot and build a new snapshot from edited task.
  - If snapshots differ and case type is 4, update case fields.
  - If current and previous task numbers match, write new data to both current and previous fields; otherwise update current fields only.

---

## 6. Data Contract
### Record Types Involved
- Task
- Support Case

### Fields Referenced
- custevent_hul_task_data_json
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
- Updates only when case type is 4.
- If current and previous task numbers match, both sets are updated.

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
