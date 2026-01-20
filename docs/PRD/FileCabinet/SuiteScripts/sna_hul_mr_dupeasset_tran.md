# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DupeAssetTransaction
title: Duplicate Asset Cleanup for Transactions
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_dupeasset_tran.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction records (record type varies)
  - Custom Record | customrecord_nx_asset

---

## 1. Overview
A Map/Reduce script that updates transaction body and line asset references to merged assets and inactivates duplicates.

---

## 2. Business Goal
It standardizes transaction asset references by replacing duplicates with active assets.

---

## 3. User Story
As a finance user, when transactions have duplicate asset references, I want transactions to use active assets, so that reporting is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- The script must load a saved search from parameter `custscript_sna_dupe_tran`.
- The script must set transaction merge asset field `custbody_sna_mergedequipasset` when duplicates exist.
- The script must set line merge asset field `custcol_sn_hul_mergequipassettime` for duplicate line assets.
- The script must flag `custbody_sn_asset_dup_checking` during processing and reset it after save.
- The script must set `custrecord_sna_duplicate_asset` on the active asset and inactivate old assets.

---

## 6. Data Contract
### Record Types Involved
- Transaction records (record type varies)
- Custom Record | `customrecord_nx_asset`

### Fields Referenced
- Transaction | `custbody_sna_hul_nxc_eq_asset`
- Transaction | `custbody_sna_mergedequipasset`
- Transaction | `custbody_sn_asset_dup_checking`
- Line | `custcol_nxc_equip_asset`
- Line | `custcol_sn_hul_mergequipassettime`
- Asset | `custrecord_sna_dup_asset`
- Asset | `custrecord_sna_duplicate_asset`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Transaction lines without duplicate assets remain unchanged.
- Invalid search parameter should log errors.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Loads transactions and updates multiple lines per transaction.

---

## 9. Acceptance Criteria
- Given transactions have duplicate body and line assets, when the script runs, then transaction and line merged asset fields are populated.
- Given duplicate assets exist, when the script runs, then old assets are inactivated and linked to active assets.
- Given a transaction is processed, when the script completes, then the asset duplication checking flag resets to false.

---

## 10. Testing Notes
- Happy path: Transaction with duplicate body and line assets updates merge fields and inactivates old assets.
- Edge case: Transaction lines without duplicate assets remain unchanged.
- Error handling: Invalid search parameter should log errors.
- Test data: Saved search returning transaction rows with asset fields and record type.
- Sandbox setup: Ensure assets have `custrecord_sna_dup_asset` populated.

---

## 11. Deployment Notes
- Configure `custscript_sna_dupe_tran` search parameter.
- Upload `sna_hul_mr_dupeasset_tran.js`.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Schema details are not specified.

---
