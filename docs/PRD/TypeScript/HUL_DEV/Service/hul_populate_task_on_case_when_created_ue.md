# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_task_on_case_when_created_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Service/hul_populate_task_on_case_when_created_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case

---

## 1. Overview
User Event that updates support case task fields when a new task is created.

---

## 2. Business Goal
Populate support case task fields when new tasks are created.

---

## 3. User Story
As a user, when a task is created for a case, I want the case task fields updated, so that the case reflects the latest task.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (afterSubmit) | Task fields | Task created | Update support case current/previous task fields |

---

## 5. Functional Requirements
- Build newTaskData from the created task record.
- Look up the case’s current and previous task fields.
- Write task data to the case based on whether current/previous slots are empty:
  - If both are empty: populate current fields with the new task.
  - If current exists but previous is empty: move current → previous and write new task to current.
  - If both exist: move current → previous and write new task to current.

---

## 6. Data Contract
### Record Types Involved
- Task
- Support Case

### Fields Referenced
- Current task fields:
  - custevent_hul_current_task_number
  - custevent_hul_current_start_date
  - custevent_current_task_date_completed
  - custevent_hul_current_task_result
  - custevent_hul_current_task_status
  - custevent_hul_curr_task_internal_notes
  - custevent_hul_curr_task_action_taken
  - custevent_hul_curr_task_tech_assigned
- Previous task fields:
  - custevent_hul_previous_task_number
  - custevent_hul_prev_task_date_completed
  - custevent_hul_prev_task_result
  - custevent_hul_prev_task_status
  - custevent_hul_prev_task_internal_notes
  - custevent_hul_prev_task_action_taken
  - custevent_hul_prev_task_tech_assigned

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Moves current to previous when current exists.

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
