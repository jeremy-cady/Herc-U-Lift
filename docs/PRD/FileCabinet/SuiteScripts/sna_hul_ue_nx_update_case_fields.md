# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-NXUpdateCaseFields
title: NX Task Updates Case Fields
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_nx_update_case_fields.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - task
  - supportcase

---

## 1. Overview
User Event that copies revenue stream and equipment asset fields from a newly created task to its linked support case.

---

## 2. Business Goal
Keep support case fields in sync when tasks are created through NX "add new task" flow.

---

## 3. User Story
As a service coordinator, when tasks are created, I want case fields synced from the task, so that case data stays current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | supportcase, custevent_nx_task_type | task create | Update case revenue stream and equipment asset |

---

## 5. Functional Requirements
- Run beforeSubmit on task create.
- If `supportcase` and `custevent_nx_task_type` are set, update the support case.
- Set `cseg_sna_revenue_st` and `custevent_nxc_case_assets` when values are present.

---

## 6. Data Contract
### Record Types Involved
- task
- supportcase

### Fields Referenced
- task | custevent_nx_task_type | Task type
- task | supportcase | Support case
- task | cseg_sna_revenue_st | Revenue stream
- task | custevent_sn_hul_equip_asset | Equipment asset
- supportcase | cseg_sna_revenue_st | Revenue stream
- supportcase | custevent_nxc_case_assets | Equipment asset

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Task without case does nothing.
- submitFields errors are logged.
- Only runs on create events.

---

## 8. Implementation Notes (Optional)
- NX task creation flow.

---

## 9. Acceptance Criteria
- Given a task with a support case and revenue stream, when beforeSubmit runs, then the case fields are updated.

---

## 10. Testing Notes
- Create task with case and revenue stream; case updates accordingly.
- Task without case does nothing.
- Deploy User Event on Task.

---

## 11. Deployment Notes
- Confirm task and case custom fields.
- Deploy User Event on Task and validate case updates.
- Monitor logs for submitFields errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should case updates occur on task edits?

---
