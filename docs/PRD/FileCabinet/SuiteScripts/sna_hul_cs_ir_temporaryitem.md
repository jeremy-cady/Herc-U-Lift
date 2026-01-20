# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-IRTemporaryItem
title: Item Receipt Temporary Item Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_ir_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Receipt
  - Transaction (purchase order lookup)

---

## 1. Overview
A client script that validates temporary item handling and inventory detail on Item Receipts.

---

## 2. Business Goal
Prevent unauthorized conversion to item and enforce temporary item code matching on inventory details.

---

## 3. User Story
As a receiving user, when I receive temporary items, I want inventory numbers validated and conversion restricted by role, so that receipts are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | script parameters | form loads | Load temp item categories, convert-to-item value, permitted roles |
| validateField | custcol_sna_hul_returns_handling | temp item category and role not allowed | Block conversion to item |
| saveRecord | custcol_sna_hul_temp_item_code, receiptinventorynumber | PO-based receipt and temp item | Validate inventory number matches temp item code |

---

## 5. Functional Requirements
- On page init, load script parameters for temp item categories, convert-to-item value, and permitted roles.
- On field validation for `custcol_sna_hul_returns_handling`, block conversion for temp item categories if the user role is not allowed.
- On save, check if the Item Receipt is created from a purchase order.
- For each received line in a PO-based Item Receipt, verify that the inventory detail `receiptinventorynumber` matches `custcol_sna_hul_temp_item_code` when the item is in a temp category.
- If a mismatch is detected, alert the user and block save.

---

## 6. Data Contract
### Record Types Involved
- Item Receipt
- Transaction (purchase order lookup)

### Fields Referenced
- Line | custcol_sna_hul_returns_handling
- Line | custcol_sna_hul_itemcategory
- Line | custcol_sna_hul_temp_item_code
- Line | itemreceive
- Line | inventorydetail.receiptinventorynumber

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Temp item with mismatched inventory number; save blocked.
- Non-temp items are not validated.
- Missing script parameters should not crash the form; validation should be conservative.

---

## 8. Implementation Notes (Optional)
- Relies on script parameters for category and role IDs.
- Uses `search.lookupFields` to determine created-from transaction type.

---

## 9. Acceptance Criteria
- Given an unauthorized role, when attempting convert-to-item handling, then the action is blocked.
- Given temp items received from PO, when inventory numbers do not match, then save is blocked.

---

## 10. Testing Notes
- Receive a temp item with matching inventory detail number; save succeeds.
- Temp item with mismatched inventory number; save blocked.
- Non-temp items; no validation error.
- User without allowed role tries convert-to-item handling; blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_ir_temporaryitem.js`.
- Deploy to Item Receipt forms with required parameters.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script validate temp item categories for non-PO receipts?
- Risk: Missing or incorrect script parameters.

---
