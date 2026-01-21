# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FAMDepreciationHistory
title: FAM Depreciation History Inventory Adjustment
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_famDespreciationHistory.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_ncfar_deprhistory
  - customrecord_ncfar_asset
  - journalentry
  - inventoryadjustment

---

## 1. Overview
User Event that creates an inventory adjustment for a Used Equipment item when an asset disposal depreciation history record is created.

---

## 2. Business Goal
Ensure disposed assets create corresponding used equipment inventory adjustments.

---

## 3. User Story
As a finance user, when a disposal depreciation history record is created, I want inventory adjustments created for used equipment, so that inventory stays accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custrecord_deprhisttype | disposal type; asset and JE present | Create inventory adjustment |

---

## 5. Functional Requirements
- Run afterSubmit on depreciation history records.
- When `custrecord_deprhisttype` matches the disposal type and asset/JE are present, create an inventory adjustment.
- Use the asset disposal account, location, and book value.
- Create an inventory assignment using the asset object as the receipt inventory number.

---

## 6. Data Contract
### Record Types Involved
- customrecord_ncfar_deprhistory
- customrecord_ncfar_asset
- journalentry
- inventoryadjustment

### Fields Referenced
- depreciation history | custrecord_deprhisttype | History type
- depreciation history | custrecord_deprhistasset | Asset
- depreciation history | custrecord_deprhistjournal | Journal entry
- depreciation history | custrecord_deprhistdate | History date
- asset | custrecord_assetsubsidiary | Subsidiary
- asset | custrecord_assetdisposalacc | Disposal account
- asset | custrecord_sna_object | Asset object
- asset | custrecord_assetbookvalue | Book value
- asset | custrecord_assetlocation | Location

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing asset or JE skips adjustment.
- Inventory adjustment creation errors are logged.
- Uses journal entry date for adjustment transaction date.

---

## 8. Implementation Notes (Optional)
- Script parameters for disposal type and used equipment item.
- Performance/governance considerations: One adjustment creation per record.

---

## 9. Acceptance Criteria
- Given a disposal depreciation history record, when afterSubmit runs, then an inventory adjustment is created.
- Given an asset with book value and disposal account, when adjustment is created, then it uses those values.

---

## 10. Testing Notes
- Disposal depreciation history entry creates inventory adjustment.
- Missing asset or JE skips adjustment.
- Deploy User Event on depreciation history record.

---

## 11. Deployment Notes
- Configure disposal type and used equipment item parameters.
- Deploy User Event on depreciation history record and validate inventory adjustment creation.
- Monitor logs for errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should adjustment use disposal history date instead of JE date?

---
