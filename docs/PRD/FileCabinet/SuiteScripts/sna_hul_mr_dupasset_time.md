# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DupeAssetTime
title: Duplicate Asset Cleanup for Time Entries
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_dupasset_time.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Time Bill (record.Type.TIME_BILL)
  - Custom Record (customrecord_nx_asset)

---

## 1. Overview
A Map/Reduce script that updates time entries to reference merged assets and inactivate duplicates.

---

## 2. Business Goal
Ensure time records point to the active asset after duplicate cleanup.

---

## 3. User Story
As a service admin, when duplicate assets exist, I want time records to use active assets, so that reporting is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_sna_dupe_time | saved search provided | Update time entries and inactivate assets |

---

## 5. Functional Requirements
- Load a saved search from parameter `custscript_sna_dupe_time`.
- Set `custcol_sn_hul_mergequipassettime` on time entries to the duplicate-of asset.
- Set `custrecord_sna_duplicate_asset` on the active asset.
- Inactivate the old asset record.

---

## 6. Data Contract
### Record Types Involved
- Time Bill (record.Type.TIME_BILL)
- Custom Record (customrecord_nx_asset)

### Fields Referenced
- Time | custcol_nxc_equip_asset
- Time | custcol_sn_hul_mergequipassettime
- Asset | custrecord_sna_dup_asset
- Asset | custrecord_sna_duplicate_asset

Schemas (if known):
- Script parameter: custscript_sna_dupe_time

---

## 7. Validation & Edge Cases
- Missing duplicate mapping should skip updates.
- Invalid search parameter should log errors.

---

## 8. Implementation Notes (Optional)
- Requires duplicate asset mapping on asset records.

---

## 9. Acceptance Criteria
- Given duplicate assets, when processed, then time entries reference active assets and old assets are inactivated.

---

## 10. Testing Notes
- Time entry with duplicate asset updates merge field and inactivates old asset.
- Missing duplicate mapping; verify updates skipped.

---

## 11. Deployment Notes
- Upload `sna_hul_mr_dupasset_time.js`.
- Deploy Map/Reduce with saved search.
- Rollback: disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should old asset references be preserved in an audit field?
- Risk: Inactivating assets still referenced elsewhere.

---
