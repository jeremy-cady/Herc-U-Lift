# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ReopenCase
title: Reopen Case from Sales Order Workflow Action
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: workflow_action
  file: FileCabinet/SuiteScripts/sna_hul_wfa_reopen_case.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - supportcase

---

## 1. Overview
Workflow action that reopens a linked support case and clears the sales order case-closed flag when the service bucket is Parts.

---

## 2. Business Goal
Ensure cases are reopened when sales orders return to the Parts service bucket.

---

## 3. User Story
As a service manager, when an order returns to Parts, I want the linked case reopened so that case status stays accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| workflowAction | custbody_sna_hul_service_bucket_ | bucket = 1 (Parts) | Set linked case status to 4 and clear case-closed flag on the sales order. |

---

## 5. Functional Requirements
- Read `custbody_sna_hul_service_bucket_` from the sales order.
- If bucket equals 1, set the linked support case status to 4 via submitFields.
- If bucket equals 1, clear `custbody_sna_hul_case_closed` on the sales order record in context.
- If no linked case exists, exit without error.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Support Case

### Fields Referenced
- Sales Order | custbody_sna_hul_service_bucket_ | Service bucket
- Sales Order | custbody_nx_case | Linked case
- Sales Order | custbody_sna_hul_case_closed | Case closed flag

Schemas (if known):
- Support Case | status | Reopen status id 4

---

## 7. Validation & Edge Cases
- If no linked case is present, no update occurs.
- Case status id is hard-coded to 4.

---

## 8. Implementation Notes (Optional)
- Updates the sales order field in-memory rather than submitFields.

---

## 9. Acceptance Criteria
- Given a sales order in service bucket 1 with a linked case, when the action runs, then the case status is set to 4 and the case-closed flag is cleared.
- Given a sales order with no linked case, when the action runs, then no error occurs.
- Given a sales order in a different bucket, when the action runs, then no updates occur.

---

## 10. Testing Notes
- Run the action on a sales order with bucket 1 and verify case status and flag updates.
- Run the action on a sales order with no linked case and verify no error.
- Run the action on a sales order with bucket not equal to 1 and verify no update.

---

## 11. Deployment Notes
- Deploy the workflow action script and attach it to the sales order workflow.
- Confirm status id 4 is the correct reopen status in the target environment.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should the sales order field be updated with submitFields instead of in-memory setValue?

---
