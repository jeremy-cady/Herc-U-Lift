# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SOVendorItemPrice
title: Sales Order Vendor Item Pricing (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_so_vendor_itemprice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Custom Vendor Price (`customrecord_sna_hul_vendorprice`)

---

## 1. Overview
A client script that sets item line rates based on vendor-specific pricing records and quantity break pricing.

## 2. Business Goal
Ensures sales order line rates reflect the selected vendor's pricing and quantity breaks without manual entry.

## 3. User Story
As a salesperson, when I change item or quantity, I want vendor pricing applied automatically, so that line rates are accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | `item`, `quantity` | Inventory part items | Apply vendor pricing and quantity breaks |

## 5. Functional Requirements
- The system must read script parameters `custscript_sna_hul_tempitemcat`, `custscript_sna_rental_serviceitem`, `custscript_sna_rental_equipment`.
- The system must ignore rental charge and rental equipment items.
- The system must only apply pricing to inventory part items.
- When item or quantity changes, the system must look up vendor pricing for the current item and `custbody_sna_buy_from`.
- If quantity break pricing exists, the system must set `rate` based on the highest eligible break.
- If no quantity breaks exist, the system must set `rate` from item purchase price.

## 6. Data Contract
### Record Types Involved
- Sales Order
- Custom Vendor Price (`customrecord_sna_hul_vendorprice`)

### Fields Referenced
- Transaction | `custbody_sna_buy_from`
- Vendor Price | `custrecord_sna_hul_item`, `custrecord_sna_hul_vendor`, `custrecord_sna_hul_listprice`, `custrecord_sna_hul_itempurchaseprice`, `custrecord_sna_hul_qtybreakprices`
- Script parameters | `custscript_sna_hul_tempitemcat`, `custscript_sna_rental_serviceitem`, `custscript_sna_rental_equipment`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Vendor price record missing; rate unchanged.
- Non-inventory item; no pricing applied.
- Quantity break JSON parse fails; fallback to purchase price.

## 8. Implementation Notes (Optional)
- Uses `search.create` and `run().getRange(0,1)` for vendor pricing lookup.
- Relies on JSON quantity break pricing string.

## 9. Acceptance Criteria
- Given item or quantity changes, when the script runs, then item line rates update.
- Given quantity breaks, when the script runs, then quantity break pricing overrides base purchase price.
- Given rental items, when the script runs, then pricing updates are skipped.

## 10. Testing Notes
- Item with quantity breaks sets rate to correct break.
- Item without breaks uses purchase price.
- Vendor price record missing; rate unchanged.
- Non-inventory item; no pricing applied.
- Quantity break JSON parse fails; fallback to purchase price.

## 11. Deployment Notes
- Upload `sna_hul_cs_so_vendor_itemprice.js`.
- Deploy to sales order forms.
- Validate vendor pricing behavior.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should pricing apply on postSourcing as well as fieldChanged?
- Should vendor pricing fallback to list price if purchase price is empty?
- Risk: Vendor pricing record missing (Mitigation: Add alert or fallback to item price)
- Risk: Large orders cause slow UI (Mitigation: Cache vendor pricing per item/vendor)

---
