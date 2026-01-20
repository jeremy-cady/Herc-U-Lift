# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopTaskDataOnAssignSS
title: Populate Task Data on Case When Assigned (Scheduled Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case_when_task_is_assigned_ss.js
  script_id: customscript_hul_pop_task_on_case_assign
  deployment_id: customdeploy_hul_pop_task_on_case_assign

record_types:
  - Task
  - Support Case
  - System Note

---

## 1. Overview
A scheduled script that detects recent task assignment changes and updates task summary fields on the related case.

## 2. Business Goal
Keeps case task fields updated when a technician is assigned, using system notes to detect recent changes.

## 3. User Story
As a dispatcher, when a technician is assigned, I want case task fields updated on assignment, so that case data reflects the latest tech.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled | `EVENT.KASSIGNED` | System note changes in the last 4 minutes and `sn.type` in (2, 4) | Update case current task fields and set `custevent_hul_is_assigned = true` |

## 5. Functional Requirements
- The system must query tasks with recent system note changes in the last 4 minutes where `sn.field` includes `EVENT.KASSIGNED` and `sn.type` in (2, 4).
- The system must map task data including case ID, status, dates, notes, and assigned tech.
- The system must update the case fields: `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_status`, `custevent_hul_current_task_result`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_internal_notes`, `custevent_hul_curr_task_tech_assigned`, `custevent_hul_is_assigned = true`.
- The system must skip records without a valid case ID.
- The script must pause for ~4 minutes and reschedule itself.
- Errors must be logged and rescheduling must still occur.

## 6. Data Contract
### Record Types Involved
- Task
- Support Case
- System Note

### Fields Referenced
- System Note | `field` (EVENT.KASSIGNED)
- System Note | `type`
- Task | case ID, status, dates, notes, assigned tech
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_is_assigned`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Records without a valid case ID are skipped.
- Errors are logged and rescheduling still occurs.

## 8. Implementation Notes (Optional)
- Busy-wait loop is used to delay reschedule.
- Script reschedules itself every ~4 minutes.

## 9. Acceptance Criteria
- Given recent assignment changes, when the script runs, then case fields are updated.
- Given a task without a case ID, when the script runs, then it is skipped.
- Given the run completes, when the script runs, then it reschedules after ~4 minutes.

## 10. Testing Notes
- Assign a tech to a task; case fields update within the polling window.
- Task with no case ID is skipped.
- Multiple assignments in 4 minutes are processed.
- Query errors logged and rescheduling still occurs.

## 11. Deployment Notes
- Upload `hul_populate_task_data_on_case_when_task_is_assigned_ss.js`.
- Create Scheduled Script record with IDs above.
- Run and verify auto-rescheduling.

## 12. Open Questions / TBDs
- Created date: TBD
- Last updated date: TBD
- Should this be rewritten as a Map/Reduce or use a scheduled interval without busy-wait?
- Should assignment changes be handled by User Event instead?
- Risk: Busy-wait loop consumes governance (Mitigation: Replace with proper scheduling)
- Risk: Missed assignments outside window (Mitigation: Increase window or schedule frequency)

---
