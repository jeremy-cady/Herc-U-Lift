# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DeleteMRDeployments
title: Delete Unsheduled M/R Deployments (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sn_hul_mr_delete_deployments.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Script Deployment

---

## 1. Overview
A Map/Reduce script that finds script deployments in NOTSCHEDULED status for a specific Map/Reduce script and deletes them.

---

## 2. Business Goal
Clean up unused deployments to reduce clutter and maintain deployment hygiene.

---

## 3. User Story
As an admin, when unused deployments exist, I want them removed, so that deployments stay manageable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | scriptid, isdeployed, status | scriptid = customscript_sna_hul_mr_upd_matrix_oncus, isdeployed = true, status = NOTSCHEDULED | Delete deployment except ID 1026 |

---

## 5. Functional Requirements
- Search `scriptdeployment` records where:
  - Script ID is `customscript_sna_hul_mr_upd_matrix_oncus`
  - `isdeployed` is true
  - `status` is `NOTSCHEDULED`
- Skip deployment ID `1026` (production exception).
- Delete each remaining deployment.

---

## 6. Data Contract
### Record Types Involved
- Script Deployment

### Fields Referenced
- scriptid
- isdeployed
- status

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching deployments; script completes without deletes.
- Exception deployment ID is skipped.

---

## 8. Implementation Notes (Optional)
- Hardcoded exception deployment ID (`1026`).
- Performance/governance considerations: deletions occur one per map entry.

---

## 9. Acceptance Criteria
- Given matching NOTSCHEDULED deployments, when the script runs, then all are deleted except the exception.
- Given errors occur during deletion, when the script runs, then exceptions are logged.

---

## 10. Testing Notes
- Run against NOTSCHEDULED deployments; confirm all deleted except exception.
- Run with no matching deployments; confirm no deletes.

---

## 11. Deployment Notes
- Upload `sn_hul_mr_delete_deployments.js`.
- Deploy and run as needed.
- Rollback: recreate deleted deployments as needed.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script accept the script ID and exception ID as parameters?
- Risk: Incorrect exception ID deletes a needed deployment.

---
