# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DupeAssetCase
title: Duplicate Asset Cleanup for Cases
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_dupasset_case.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case (supportcase)
  - Custom Record (customrecord_nx_asset)

---

## 1. Overview
A Map/Reduce script that resolves duplicate equipment assets referenced on Support Case records.

---

## 2. Business Goal
Replace duplicate asset references with the active asset, record merge fields, and inactivate old assets.

---

## 3. User Story
As a service admin, when duplicate assets exist on cases, I want cases to reference the correct active asset, so that data stays consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_sna_dupe_case | saved search provided | Merge case asset references and inactivate duplicates |

---

## 5. Functional Requirements
- Load a saved search from parameter `custscript_sna_dupe_case`.
- For each case, derive active assets using `custrecord_sna_dup_asset` on asset records.
- Write merged asset values to `custevent_sna_case_mergedsite` and `custevent_sna_case_mergedequipment`.
- Set `custrecord_sna_duplicate_asset` on the active asset to reference the old asset.
- Inactivate old asset records referenced by the case.

---

## 6. Data Contract
### Record Types Involved
- Support Case (supportcase)
- Custom Record (customrecord_nx_asset)

### Fields Referenced
- Case | custevent_nx_case_asset
- Case | custevent_nxc_case_assets
- Case | custevent_sna_case_mergedsite
- Case | custevent_sna_case_mergedequipment
- Asset | custrecord_sna_dup_asset
- Asset | custrecord_sna_duplicate_asset

Schemas (if known):
- Script parameter: custscript_sna_dupe_case

---

## 7. Validation & Edge Cases
- Case with no duplicate asset values should remain unchanged.
- Missing search parameter should fail gracefully.

---

## 8. Implementation Notes (Optional)
- Multi-select asset fields are rewritten to merged assets only.

---

## 9. Acceptance Criteria
- Given duplicate assets, when processed, then case merged fields populate with active assets.
- Given duplicate assets, when processed, then old assets are inactivated and linked to active assets.

---

## 10. Testing Notes
- Case with duplicate asset references updates merged fields and inactivates old assets.
- Case with no duplicate asset values remains unchanged.

---

## 11. Deployment Notes
- Upload `sna_hul_mr_dupasset_case.js`.
- Deploy Map/Reduce with saved search.
- Rollback: disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should original multi-select assets be retained anywhere for audit?
- Risk: Inactivating assets still referenced elsewhere.

---
