# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TriggerSoWorkflow
title: Trigger Sales Order Approval Workflow
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_trigger_so_workflow.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - supportcase
  - salesorder

---

## 1. Overview
Updates linked sales orders when a support case is closed and triggers the sales order approval workflow based on service bucket criteria.

---

## 2. Business Goal
Keep sales order case-closed flags and approval workflow execution synchronized with support case status.

---

## 3. User Story
As a service manager, when I close a support case, I want linked sales orders updated and the approval workflow triggered so that approvals remain accurate without manual steps.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custbody_nx_case | non-delete | Find sales orders linked to the case. |
| afterSubmit | custbody_sna_hul_case_closed | case status = 5 (Closed) | Set case-closed flag to true. |
| afterSubmit | workflow id 10 | case status = 5 and service bucket = 14 | Trigger the sales order approval workflow. |
| afterSubmit | custbody_sna_hul_case_closed | case status != 5 | Set case-closed flag to false. |

---

## 5. Functional Requirements
- On afterSubmit (non-delete), search for sales orders where `custbody_nx_case` equals the case id.
- If case status is 5 (Closed) and the sales order service bucket equals 14, set `custbody_sna_hul_case_closed` to true.
- When the case is closed and bucket criteria match, trigger workflow id 10 on the sales order.
- When the case is not closed, set `custbody_sna_hul_case_closed` to false.
- Retry `submitFields` up to five times on `RCRD_HAS_BEEN_CHANGED` errors.

---

## 6. Data Contract
### Record Types Involved
- Support Case
- Sales Order

### Fields Referenced
- Sales Order | custbody_nx_case | Linked case
- Sales Order | custbody_sna_hul_case_closed | Case closed flag
- Sales Order | custbody_sna_hul_service_bucket_ | Service bucket

Schemas (if known):
- Workflow | id 10 | SNA HUL Sales Order Approval

---

## 7. Validation & Edge Cases
- Delete context does not trigger updates.
- If the record changes during update, retry `submitFields` up to five times.
- Sales orders not linked by case are not updated.

---

## 8. Implementation Notes (Optional)
- Workflow id is hard-coded to 10.
- Uses a search for sales orders tied to the case.

---

## 9. Acceptance Criteria
- Given a case linked to a sales order in service bucket 14, when the case is closed, then the sales order case-closed flag is true and workflow id 10 is triggered.
- Given a case linked to a sales order, when the case is not closed, then the sales order case-closed flag is false.
- Given a case deletion, when afterSubmit runs, then no sales order updates occur.

---

## 10. Testing Notes
- Close a case linked to a sales order with bucket 14 and verify flag update and workflow trigger.
- Save a case that is not closed and verify the case-closed flag is false.
- Delete a case and verify no updates.

---

## 11. Deployment Notes
- Confirm workflow id 10 is active.
- Deploy the user event to Support Case.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should workflow id be parameterized instead of hard-coded?

---
