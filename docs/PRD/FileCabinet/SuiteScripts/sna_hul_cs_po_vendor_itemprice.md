# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-POVendorItemPrice
title: PO Vendor Item Pricing Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_po_vendor_itemprice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Purchase Order
  - Custom Record (customrecord_sna_hul_vendorprice)

---

## 1. Overview
A client script that sets purchase order item line rates based on vendor price records and item quantities.

---

## 2. Business Goal
Enforce vendor pricing rules, including quantity break pricing and contract pricing, when item or quantity changes.

---

## 3. User Story
As a buyer, when I add or change items on a PO, I want vendor pricing applied automatically, so that PO rates are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| postSourcing | item | item sourced | Call setVendorPrice using custbody_sna_buy_from |
| fieldChanged | quantity | quantity changed | Recalculate vendor price using summed quantity |
| validateLine | department | item present | Set line department to header department |

---

## 5. Functional Requirements
- When an item is sourced on the item sublist, call `setVendorPrice` using `custbody_sna_buy_from`.
- When line quantity changes, recalculate vendor price using the summed quantity across all lines for the same item.
- Set the line `rate` based on the first available pricing rule in this order: quantity break price, contract price, item purchase price.
- Update all matching item lines with the computed rate when quantity changes.
- On line validation, set the line `department` to the header `department` when an item is present.

---

## 6. Data Contract
### Record Types Involved
- Purchase Order
- Custom Record (customrecord_sna_hul_vendorprice)

### Fields Referenced
- PO | custbody_sna_buy_from
- Line | item
- Line | quantity
- Line | rate
- Line | department
- Vendor Price | custrecord_sna_hul_item
- Vendor Price | custrecord_sna_hul_vendor
- Vendor Price | custrecord_sna_hul_listprice
- Vendor Price | custrecord_sna_hul_itempurchaseprice
- Vendor Price | custrecord_sna_hul_qtybreakprices
- Vendor Price | custrecord_sna_hul_contractprice

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Contract price exists; rate set to contract price when no qty breaks.
- No vendor price record; rate remains unchanged.
- Search errors should not block line entry.

---

## 8. Implementation Notes (Optional)
- Quantity break pricing uses summed quantities across all lines for the same item.

---

## 9. Acceptance Criteria
- Given vendor pricing rules and quantities, when items or quantities change, then rates update based on the rules.
- Given a line is committed with an item, when validated, then line department matches header department.

---

## 10. Testing Notes
- Add item with vendor pricing and quantity break; verify rate set based on total quantity.
- Contract price exists; verify rate set to contract price when no qty breaks.
- No vendor price record; verify rate unchanged.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_po_vendor_itemprice.js`.
- Deploy to Purchase Order forms.
- Rollback: remove client script deployment from Purchase Orders.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should pricing ignore non-inventory item types explicitly?
- Risk: Quantity sum logic may be slow on large POs.

---
