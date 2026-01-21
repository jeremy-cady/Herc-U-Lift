# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-IRTemporaryItem
title: Item Receipt Temporary Item Inventory Details
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_ir_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - itemreceipt
  - inventorynumber
  - transaction

---

## 1. Overview
User Event that validates temporary item inventory numbers on Item Receipt and updates inventory number fields for temporary items.

---

## 2. Business Goal
Ensure inventory numbers match temporary item codes and populate inventory number metadata for temporary items.

---

## 3. User Story
As a warehouse or data admin user, when temporary items are received, I want inventory numbers validated and updated, so that receipts and metadata are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | Item Receipt lines | created from PO; temporary item category | Validate `receiptinventorynumber` matches temp item code |
| afterSubmit | Inventory numbers | created from PO; temporary item category | Populate inventory number metadata |

---

## 5. Functional Requirements
- Before submit, validate Item Receipt lines from Purchase Orders for temporary item categories.
- For temporary items, the inventory detail `receiptinventorynumber` must equal the temporary item code.
- After submit, populate Inventory Number fields (category, vendor, description, unit cost, UOM) for temporary items.

---

## 6. Data Contract
### Record Types Involved
- itemreceipt
- inventorynumber
- transaction

### Fields Referenced
- itemreceipt line | custcol_sna_hul_temp_item_code | Temporary item code
- itemreceipt line | custcol_sna_hul_itemcategory | Item category
- itemreceipt line | custcol_sna_hul_vendor_item_code | Vendor item code
- inventorynumber | custitemnumber_sna_hul_item_category | Item category
- inventorynumber | custitemnumber_sna_hul_vendor_no | Vendor
- inventorynumber | custitemnumber_sna_hul_vendor_item_no | Vendor item code
- inventorynumber | custitemnumber_sna_hul_description | Description
- inventorynumber | custitemnumber_sna_hul_unit_cost | Unit cost
- inventorynumber | custitemnumber_sna_hul_uom | UOM

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Inventory detail number mismatches throw an error.
- Non-PO receipts skip processing.
- submitFields errors are logged.

---

## 8. Implementation Notes (Optional)
- Script parameters for temporary item categories and UOM.
- Performance/governance considerations: Search and submitFields per unique inventory number.

---

## 9. Acceptance Criteria
- Given a temp item receipt with matching code, when afterSubmit runs, then inventory number metadata is updated.
- Given a temp item receipt with mismatched inventory number, when beforeSubmit runs, then an error is thrown.

---

## 10. Testing Notes
- Receipt of temp item with matching temp code updates inventory number fields.
- Mismatched inventory number throws validation error.
- Non-PO receipts skip processing.
- Deploy User Event on Item Receipt.

---

## 11. Deployment Notes
- Configure temp item category and UOM parameters.
- Deploy User Event on Item Receipt and validate temp item receipts.
- Monitor logs for validation errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should validation run for other transaction types besides PO receipts?

---
