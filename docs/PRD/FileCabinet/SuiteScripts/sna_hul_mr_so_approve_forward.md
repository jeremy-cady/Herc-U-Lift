# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoApproveForward
title: Sales Order Approval Forwarding (Parts Bucket)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_so_approve_forward.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (salesorder)
  - Support Case (supportcase) or search source record containing `custevent_nx_case_transaction`

---

## 1. Overview
A Map/Reduce script that sets the Sales Order Service Bucket to Parts and triggers the approval workflow.

---

## 2. Business Goal
Ensures Sales Orders flagged for parts processing move forward in the approval workflow with the correct bucket.

---

## 3. User Story
As a service coordinator, when Sales Orders need to be routed to Parts, I want them routed automatically, so that approvals follow the correct flow.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custevent_nx_case_transaction` | Saved search result | Set `custbody_sna_hul_service_bucket_` to 1 and trigger workflow `customworkflow_sna_hul_so_approval` action `workflowaction271` |

---

## 5. Functional Requirements
- The script must load a saved search from parameter `custscript_so_appr_fwd_bucket_search`.
- The script must read `custevent_nx_case_transaction` from each result to obtain the Sales Order ID.
- The script must update `custbody_sna_hul_service_bucket_` to `1` (Parts).
- If submitFields fails, the script must retry via record load and save.
- The script must trigger workflow `customworkflow_sna_hul_so_approval` action `workflowaction271`.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (`salesorder`)
- Support Case (`supportcase`) or search source record containing `custevent_nx_case_transaction`

### Fields Referenced
- Sales Order | `custbody_sna_hul_service_bucket_`
- Case/Source Record | `custevent_nx_case_transaction`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SubmitFields failure retries via record load and save.
- Workflow trigger failure is logged.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One Sales Order update and workflow trigger per result row.
- Constraints: Requires Service Bucket field and workflow to be active.
- Dependencies: Workflow deployment and search configuration.
- Risk: Incorrect bucket assignment.

---

## 9. Acceptance Criteria
- Given Sales Orders from the search, when the script runs, then Sales Orders have Service Bucket set to Parts.
- Given a Sales Order is updated, when the script runs, then the approval workflow action is triggered for the order.
- Given errors occur, when the script runs, then errors are logged without halting the run.

---

## 10. Testing Notes
- Happy path: Sales Orders from the search update bucket and trigger workflow.
- Edge case: SubmitFields failure retries via record load and save.
- Error handling: Workflow trigger failure is logged.
- Test data: Saved search returning Sales Orders that should move to Parts.
- Sandbox setup: Ensure workflow `customworkflow_sna_hul_so_approval` is active.

---

## 11. Deployment Notes
- Configure search parameter `custscript_so_appr_fwd_bucket_search`.
- Upload `sna_hul_mr_so_approve_forward.js`.
- Deploy Map/Reduce with search parameter.
- Post-deployment: Validate Service Bucket changes on sample orders.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Schema details are not specified.
- Should the workflow trigger be conditional on current bucket value?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
