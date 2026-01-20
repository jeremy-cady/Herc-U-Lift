# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VendorItemNameCS
title: Vendor Item Name Sourcing (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_source_vendor_item_name.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Purchase Order
  - Custom Vendor Price (`customrecord_sna_hul_vendorprice`)
  - Custom Object (`customrecord_sna_objects`)

---

## 1. Overview
A client script that sources and populates a vendor's item name on purchase order lines based on the selected vendor and item.

## 2. Business Goal
Ensures vendor item names are automatically populated on purchase orders to improve vendor communication and accuracy.

## 3. User Story
As a buyer, when I select an item on a PO line, I want vendor item names auto-filled, so that POs match vendor catalogs.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | Item field | PO line item selected | Search vendor price and populate `custcol_sna_vendor_item_name` |
| TBD | TBD | Purchase equipment action | Open Suitelet to create object records |

## 5. Functional Requirements
- When an item is selected on the PO line, the system must search `customrecord_sna_hul_vendorprice` for the current vendor and item.
- If `custrecord_sna_vendor_item_name2` is found, the system must set `custcol_sna_vendor_item_name`.
- The system must support a `purchaseEquipmentFxn` that validates PO header fields and opens a Suitelet to create object records.
- The system must provide a `setPOItems` helper to add lines to the PO from a child window payload.

## 6. Data Contract
### Record Types Involved
- Purchase Order
- Custom Vendor Price (`customrecord_sna_hul_vendorprice`)
- Custom Object (`customrecord_sna_objects`)

### Fields Referenced
- PO | `custbody_sna_buy_from`
- PO | `custbody_po_type`
- PO | `custbody_sna_hul_object_subsidiary`
- PO line | `custcol_sna_vendor_item_name`
- PO line | `custcol_sna_hul_fleet_no`
- Vendor Price | `custrecord_sna_vendor_item_name2`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No vendor price record; field remains empty.
- Missing vendor/location/department; user receives dialog error.
- Suitelet errors do not corrupt PO data.

## 8. Implementation Notes (Optional)
- Uses `window.opener` to update PO lines from a child window.
- Uses `tranDate.toLocaleDateString()` to avoid timezone discrepancies.

## 9. Acceptance Criteria
- Given a vendor/item match, when the item is selected, then the vendor item name is populated.
- Given missing vendor or item, when the item is selected, then no changes occur.
- Given the purchase equipment action, when required fields are missing, then the action is blocked.

## 10. Testing Notes
- Select an item with vendor pricing; vendor item name populates.
- Run purchase equipment action with required fields; Suitelet opens.
- No vendor price record; field remains empty.
- Missing vendor/location/department; user receives dialog error.
- Suitelet errors do not corrupt PO data.

## 11. Deployment Notes
- Upload `sna_hul_cs_source_vendor_item_name.js`.
- Deploy to purchase order form.
- Validate vendor item name sourcing and equipment purchase flow.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should vendor item names be updated on vendor change as well?
- Should PO line creation be validated for duplicate items?
- Risk: Client-side window communication fails (Mitigation: Add error handling for window.opener)
- Risk: Suitelet unavailable (Mitigation: Provide user-friendly error messaging)

---
