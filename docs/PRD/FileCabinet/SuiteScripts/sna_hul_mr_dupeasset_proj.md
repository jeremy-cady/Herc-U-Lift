# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DupeAssetProject
title: Duplicate Asset Cleanup for Projects
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_dupeasset_proj.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Project/Job (job)
  - Custom Record (customrecord_nx_asset)

---

## 1. Overview
A Map/Reduce script that updates project (job) records to reference merged assets and inactivate duplicates.

---

## 2. Business Goal
Ensure project asset references point to active assets after duplicate cleanup.

---

## 3. User Story
As a project admin, when duplicate assets exist, I want project asset references normalized, so that reporting uses the active asset.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_sna_dupe_proj | saved search provided | Update project merge fields and inactivate assets |

---

## 5. Functional Requirements
- Load a saved search from parameter `custscript_sna_dupe_proj`.
- Write merged asset values to `custentity_sn_hul_mergesiteassetproj` and `custentity_sn_hul_mergequipassetproj`.
- Set `custrecord_sna_duplicate_asset` on the active asset.
- Inactivate old asset records referenced by the project.

---

## 6. Data Contract
### Record Types Involved
- Project/Job (job)
- Custom Record (customrecord_nx_asset)

### Fields Referenced
- Project | custentity_nx_asset
- Project | custentity_nxc_project_assets
- Project | custentity_sn_hul_mergesiteassetproj
- Project | custentity_sn_hul_mergequipassetproj
- Asset | custrecord_sna_dup_asset
- Asset | custrecord_sna_duplicate_asset

Schemas (if known):
- Script parameter: custscript_sna_dupe_proj

---

## 7. Validation & Edge Cases
- Project without duplicate mapping should remain unchanged.
- Invalid search parameter should log errors.

---

## 8. Implementation Notes (Optional)
- Multi-select asset fields are rewritten to merged assets only.

---

## 9. Acceptance Criteria
- Given duplicate assets, when processed, then project merge fields populate and old assets are inactivated.

---

## 10. Testing Notes
- Project with duplicate assets updates merge fields and inactivates old assets.
- No duplicate mapping; project remains unchanged.

---

## 11. Deployment Notes
- Upload `sna_hul_mr_dupeasset_proj.js`.
- Deploy Map/Reduce with saved search.
- Rollback: disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should original asset selections be retained for audit?
- Risk: Inactivating assets still referenced elsewhere.

---
