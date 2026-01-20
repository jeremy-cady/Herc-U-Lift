# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RequisitionWorksheet
title: Requisition Worksheet Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_requisition_worksheet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Purchase Order
  - Custom Record (customrecord_sna_hul_vendorprice)

---

## 1. Overview
A client script that supports the Requisition Worksheet Suitelet for building purchase orders from selected items.

---

## 2. Business Goal
Streamline PO creation by managing item selections and vendor pricing in the worksheet.

---

## 3. User Story
As a buyer, when I use the requisition worksheet, I want rates and vendor details filled automatically, so that PO creation is faster.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | URL params | PO links present | Show confirmation links for created POs |
| fieldChanged | list_sna_select | line selected | Ensure vendor selected and update rates |
| saveRecord | list_sna_vendor | selected lines | Require vendor selection |
| fieldChanged | custpage_sna_location | location changed | Refresh Suitelet URL |

---

## 5. Functional Requirements
- On page init, load temp item category parameters and show confirmation links for created POs when present in the URL.
- When `list_sna_select` is toggled, ensure a vendor is selected and update item details and rates.
- Aggregate quantities per vendor and item to compute quantity break pricing.
- Set line rates using contract price, base price, purchase price, or quantity break pricing from `list_sna_rate_array`.
- Set line amounts when rate changes and update vendor item names.
- On save, require vendor selection for all selected lines.
- Prevent shipping method Transfer when selected.
- Update the Suitelet URL when location changes.

---

## 6. Data Contract
### Record Types Involved
- Purchase Order
- Custom Record (customrecord_sna_hul_vendorprice)

### Fields Referenced
- Suitelet | custpage_sna_location
- Suitelet | custpage_sna_vendor
- Suitelet | custpage_sna_po_type
- Suitelet | custpage_sna_department
- Suitelet | custpage_sna_item
- Suitelet | custpage_sna_sales_order
- Suitelet | custpage_sna_shipping_method
- Suitelet | custpage_sna_shipmethod_transfer
- Suitelet | custpage_sna_item_details
- Sublist | list_sna_select
- Sublist | list_sna_item
- Sublist | list_sna_item_id
- Sublist | list_sna_vendor
- Sublist | list_sna_quantity
- Sublist | list_sna_rate
- Sublist | list_sna_rate_array
- Sublist | list_sna_amount
- Sublist | list_sna_vendor_item_name
- Sublist | list_sna_item_category
- Sublist | list_sna_potype

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Transfer shipping method selected; validation blocks save.
- Selected line missing vendor; save blocked.
- Missing rate array should fall back to base or purchase price.

---

## 8. Implementation Notes (Optional)
- Uses JSON payloads in Suitelet fields for rate arrays.
- Suitelet `customscript_sna_hul_sl_req_worksheet` for refresh.

---

## 9. Acceptance Criteria
- Given selected lines, when vendors are assigned, then rates are calculated and applied.
- Given selected lines without vendors, when saving, then save is blocked.
- Given created PO links, when present, then confirmation links display.

---

## 10. Testing Notes
- Select item lines and assign vendors; verify rate calculation.
- Transfer shipping method selected; verify save blocked.
- Selected line missing vendor; verify save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_requisition_worksheet.js`.
- Deploy to the requisition worksheet Suitelet.
- Rollback: remove the client script deployment from the Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should temp item categories be excluded from rate updates by default?
- Risk: Quantity aggregation errors across lines.

---
