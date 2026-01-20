# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DupAssetMaintenance
title: Duplicate Asset Maintenance Map/Reduce
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_dupasset_maintenance.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_nxc_mr) (Maintenance)
  - Custom Record (customrecord_nx_asset) (Asset)

---

## 1. Overview
A Map/Reduce script that merges duplicate assets referenced in maintenance records.

---

## 2. Business Goal
Consolidate duplicate assets by updating maintenance records and inactivating the old asset.

---

## 3. User Story
As an admin, when duplicate assets are found, I want maintenance records updated to the correct asset, so that maintenance history is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_sna_dupe_maintenance | saved search provided | Update maintenance and asset links |

---

## 5. Functional Requirements
- Read a saved search ID from `custscript_sna_dupe_maintenance` and use it as input.
- For each record group in reduce:
  - Set `custrecord_sn_hul_mergequipassetmaint` on the maintenance record to the duplicate asset.
  - Set `custrecord_sna_duplicate_asset` on the duplicate asset to the original asset.
  - Inactivate the original asset.
- Log errors in summarize when errors occur in any stage.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_nxc_mr) (Maintenance)
- Custom Record (customrecord_nx_asset) (Asset)

### Fields Referenced
- Maintenance | custrecord_nxc_mr_asset
- Maintenance | custrecord_sn_hul_mergequipassetmaint
- Asset | custrecord_sna_dup_asset
- Asset | custrecord_sna_duplicate_asset
- Asset | isinactive

Schemas (if known):
- Script parameter: custscript_sna_dupe_maintenance

---

## 7. Validation & Edge Cases
- Missing duplicate asset field; script logs and skips.
- Submit fields errors captured in summarize.

---

## 8. Implementation Notes (Optional)
- Assumes saved search returns maintenance records with duplicate asset info.

---

## 9. Acceptance Criteria
- Given duplicate assets, when the script runs, then maintenance records link to the duplicate asset and original assets are inactivated.

---

## 10. Testing Notes
- Run with saved search containing duplicate assets; verify maintenance and asset updates.
- Missing duplicate asset field; verify errors logged.

---

## 11. Deployment Notes
- Upload `sna_hul_dupasset_maintenance.js`.
- Deploy Map/Reduce with saved search parameter.
- Rollback: re-activate assets manually if needed.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script skip already inactive assets?
- Risk: Incorrect duplicate mapping in saved search.

---
