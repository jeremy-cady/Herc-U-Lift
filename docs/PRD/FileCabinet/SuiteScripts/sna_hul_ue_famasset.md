# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FAMAssetFleetCode
title: FAM Asset Fleet Code Sync
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_famasset.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_ncfar_asset
  - vendorbill

---

## 1. Overview
User Event that copies the Fleet Code from a vendor bill line to the fixed asset record.

---

## 2. Business Goal
Ensure fixed assets carry the fleet code from the originating purchase line.

---

## 3. User Story
As a finance user, when a fixed asset is created from a vendor bill line, I want the fleet code synced to the asset, so that asset records align with PO data.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Asset source bill/line | non-delete; source vendor bill/line present | Copy fleet code from vendor bill line to asset |

---

## 5. Functional Requirements
- Run afterSubmit on fixed asset record changes (non-delete).
- Load the vendor bill and line referenced by the asset fields.
- Write the fleet code to the fixed asset record.

---

## 6. Data Contract
### Record Types Involved
- customrecord_ncfar_asset
- vendorbill

### Fields Referenced
- fixed asset | custrecord_assetpurchaseorder | Purchase order
- fixed asset | custrecord_assetsourcetrn | Source vendor bill
- fixed asset | custrecord_assetsourcetrnline | Source bill line
- vendor bill line | custcol_sna_po_fleet_code | Fleet code
- fixed asset | custrecord_sna_hul_fleet_code | Fleet code

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing billline or bill skips update.
- Vendor bill load errors are logged.
- Bill line is calculated as `billline - 1` for sublist index.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One record load and submitFields per asset.

---

## 9. Acceptance Criteria
- Given a fixed asset with a source vendor bill line, when afterSubmit runs, then the fleet code matches the bill line value.

---

## 10. Testing Notes
- Fixed asset created from vendor bill line updates fleet code.
- Missing billline or bill skips update.
- Deploy User Event on fixed asset records.

---

## 11. Deployment Notes
- Confirm source bill line field mapping.
- Deploy User Event on fixed asset records and validate fleet code sync.
- Monitor logs for errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the bill line index logic handle missing line numbers?

---
