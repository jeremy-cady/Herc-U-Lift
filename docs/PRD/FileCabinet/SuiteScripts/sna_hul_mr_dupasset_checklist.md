# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DupeAssetChecklist
title: Duplicate Asset Cleanup for Rental Checklists
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_dupasset_checklist.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_sna_hul_rental_checklist)
  - Custom Record (customrecord_nx_asset)

---

## 1. Overview
A Map/Reduce script that updates rental checklist records to reference merged assets and inactivate duplicates.

---

## 2. Business Goal
Ensure checklist asset references point to the active asset after duplicate cleanup.

---

## 3. User Story
As a service admin, when duplicate assets exist, I want checklist assets normalized, so that reports use the active asset.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_sna_dupe_checklist | saved search provided | Update checklist merge fields and inactivate assets |

---

## 5. Functional Requirements
- Load a saved search from parameter `custscript_sna_dupe_checklist`.
- Set `custrecord_sn_hul_mergequipassetchklst` to the duplicate-of asset.
- Set `custrecord_sna_duplicate_asset` on the active asset.
- Inactivate the old asset record.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_sna_hul_rental_checklist)
- Custom Record (customrecord_nx_asset)

### Fields Referenced
- Checklist | custrecord_sna_nxc_rc_asset
- Checklist | custrecord_sn_hul_mergequipassetchklst
- Asset | custrecord_sna_dup_asset
- Asset | custrecord_sna_duplicate_asset

Schemas (if known):
- Script parameter: custscript_sna_dupe_checklist

---

## 7. Validation & Edge Cases
- Missing duplicate asset mapping should skip updates.
- Invalid search parameter should surface errors in logs.

---

## 8. Implementation Notes (Optional)
- Assumes duplicate asset mapping is stored on asset records.

---

## 9. Acceptance Criteria
- Given duplicate assets, when processed, then checklist merge field is populated and old assets are inactivated.

---

## 10. Testing Notes
- Checklist with duplicate asset updates merge field and inactivates old asset.
- Missing duplicate mapping; verify updates skipped.

---

## 11. Deployment Notes
- Upload `sna_hul_mr_dupasset_checklist.js`.
- Deploy Map/Reduce with saved search.
- Rollback: disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should old asset references be preserved in an audit field?
- Risk: Assets referenced elsewhere are inactivated.

---
