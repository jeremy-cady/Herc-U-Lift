# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RAIRTemporaryItem
title: RA/IR Temporary Item Returns
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_rair_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - itemreceipt
  - returnauthorization
  - inventoryadjustment
  - inventorytransfer
  - inventoryitem

---

## 1. Overview
User Event that handles temporary item returns by setting restock flags, creating inventory adjustments or transfers, and updating Item Receipt lines.

---

## 2. Business Goal
Automate inventory and item conversions for temporary item returns based on handling type.

---

## 3. User Story
As an inventory user, when temp items are returned, I want processing automated, so that inventory stays accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | returns handling | Item Receipt | Set restock flags for temp item categories |
| afterSubmit | handling type | Item Receipt from RA | Create IA for Convert or IT for Defective; update IR lines |

---

## 5. Functional Requirements
- On beforeLoad, set restock flags based on handling values for temp item categories.
- On afterSubmit, if handling is Convert, create an inventory adjustment to move temp items to regular items.
- On afterSubmit, if handling is Defective, create an inventory transfer to the defective location.
- Update Item Receipt lines with created IA/IT references.

---

## 6. Data Contract
### Record Types Involved
- itemreceipt
- returnauthorization
- inventoryadjustment
- inventorytransfer
- inventoryitem

### Fields Referenced
- itemreceipt line | custcol_sna_hul_temp_item_code | Temp item code
- itemreceipt line | custcol_sna_hul_itemcategory | Item category
- itemreceipt line | custcol_sna_hul_returns_handling | Handling type
- itemreceipt line | custcol_sna_hul_regular_itm | Regular item
- itemreceipt line | custcol_sna_hul_ia | Inventory adjustment
- itemreceipt line | custcol_sna_hul_it | Inventory transfer
- inventoryitem | custitemnumber_sna_hul_uom | UOM

Schemas (if known):
- Saved search: customsearch_hul_tempitem_cost

---

## 7. Validation & Edge Cases
- Missing regular item uses existing item lookup.
- Record creation errors are logged.
- Only processes Item Receipts created from Return Authorizations.

---

## 8. Implementation Notes (Optional)
- Uses location lookup to find defective location.
- Performance/governance considerations: Record create and save per temp item line.

---

## 9. Acceptance Criteria
- Given Convert handling, when afterSubmit runs, then an inventory adjustment is created and linked.
- Given Defective handling, when afterSubmit runs, then an inventory transfer is created and linked.

---

## 10. Testing Notes
- Return with Convert handling creates IA and updates line.
- Return with Defective handling creates IT to defective location.
- Deploy User Event on Item Receipt.

---

## 11. Deployment Notes
- Configure temp item category and handling parameters.
- Deploy User Event on Item Receipt and validate IA/IT creation for returns.
- Monitor logs for errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should defective location be configurable per subsidiary?

---
