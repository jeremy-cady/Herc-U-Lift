# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_tech_assigned_on_task_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Service/hul_tech_assigned_on_task_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case

---

## 1. Overview
User Event that backfills current task details on the related support case when a technician is assigned.

---

## 2. Business Goal
Keep support case task fields in sync when technicians are assigned to tasks.

---

## 3. User Story
As a user, when a technician is assigned to a task, I want the related case updated with current task details, so that assignment info is current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| EDIT/XEDIT (beforeSubmit) | assigned tech fields | Assignment changes or case tech is empty | Update case current task fields and shift previous values |
| CREATE (afterSubmit) | task fields | Task created | Write current task data to case |
| EDIT/XEDIT (afterSubmit) | assigned tech fields | Case missing current tech assignment | Write current task data to case |

---

## 5. Functional Requirements
- Normalize assigned tech values from record fields or via lookup (for XEDIT).
- beforeSubmit:
  - Detect assignment changes and/or empty case tech assignment.
  - Write current task data to the case and shift existing current values to previous fields.
- afterSubmit:
  - On CREATE: write current task data to the case.
  - On EDIT/XEDIT: write only if the case is missing current tech assignment.

---

## 6. Data Contract
### Record Types Involved
- Task
- Support Case

### Fields Referenced
- Current task fields:
  - custevent_hul_curr_task_tech_assigned
  - custevent_hul_current_task_number
  - custevent_hul_current_start_date
  - custevent_current_task_date_completed
  - custevent_hul_current_task_status
  - custevent_hul_current_task_result
  - custevent_hul_curr_task_action_taken
  - custevent_hul_curr_task_internal_notes
- Previous task fields:
  - custevent_hul_previous_task_number
  - custevent_hul_prev_task_tech_assigned
  - custevent_hul_previous_start_date
  - custevent_hul_prev_task_date_completed
  - custevent_hul_prev_task_status
  - custevent_hul_prev_task_result
  - custevent_hul_prev_task_action_taken
  - custevent_hul_prev_task_internal_notes

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- On EDIT/XEDIT, only updates in afterSubmit if case is missing current tech assignment.

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
