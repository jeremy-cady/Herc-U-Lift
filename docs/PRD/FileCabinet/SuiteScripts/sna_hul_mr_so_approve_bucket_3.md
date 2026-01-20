# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoApproveBucket3
title: Sales Order Approval Forwarding (Bucket 3)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_so_approve_bucket_3.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (salesorder)
  - Support Case (supportcase) or search source record containing `custevent_nx_case_transaction`

---

## 1. Overview
A Map/Reduce script that forwards Sales Orders out of Service Bucket 3 by triggering a workflow action.

---

## 2. Business Goal
Automates routing of Sales Orders that should move out of Bucket 3 without manual workflow triggers.

---

## 3. User Story
As a service manager, when orders are in Bucket 3, I want them automatically forwarded, so that approval routing is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custevent_nx_case_transaction` | Saved search result | Trigger workflow `customworkflow_sna_hul_so_approval_2` action `workflowaction271` |

---

## 5. Functional Requirements
- The script must load a saved search from parameter `custscript_so_appr_fwd_bucket_3`.
- The script must read `custevent_nx_case_transaction` from each search result to obtain the Sales Order ID.
- The script must trigger workflow `customworkflow_sna_hul_so_approval_2` with action `workflowaction271` on the Sales Order.
- The script must log errors without aborting the entire run.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (`salesorder`)
- Support Case (`supportcase`) or search source record containing `custevent_nx_case_transaction`

### Fields Referenced
- Case/Source Record | `custevent_nx_case_transaction`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Search result with missing `custevent_nx_case_transaction` is skipped.
- Workflow trigger failure is logged for the affected order.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One workflow trigger per result row.
- Constraints: Requires workflow action to be active and accessible.
- Dependencies: Workflow deployment and search configuration.
- Risk: Workflow action disabled.

---

## 9. Acceptance Criteria
- Given Sales Orders from the saved search, when the script runs, then each Sales Order triggers the workflow action.
- Given a workflow trigger fails, when the script runs, then the error is logged and processing continues.

---

## 10. Testing Notes
- Happy path: Search returns Sales Orders and workflow triggers succeed.
- Edge case: Search result with missing `custevent_nx_case_transaction` is skipped.
- Error handling: Workflow trigger failure is logged for the affected order.
- Test data: Saved search returning Sales Orders in Bucket 3.
- Sandbox setup: Ensure workflow `customworkflow_sna_hul_so_approval_2` is active.

---

## 11. Deployment Notes
- Configure search parameter `custscript_so_appr_fwd_bucket_3`.
- Upload `sna_hul_mr_so_approve_bucket_3.js`.
- Deploy Map/Reduce with search parameter.
- Post-deployment: Validate a sample Sales Order moves forward in workflow.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Schema details are not specified.
- Which saved search should be used for production routing?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
