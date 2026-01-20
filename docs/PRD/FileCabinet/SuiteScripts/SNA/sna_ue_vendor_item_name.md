# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VendorItemName
title: Vendor Item Name Sourcing (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_ue_vendor_item_name.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Purchase Order
  - Vendor Price (`customrecord_sna_hul_vendorprice`)

---

## 1. Overview
A User Event that sources vendor item names from vendor price records onto purchase order lines for special orders and dropships.

## 2. Business Goal
Ensures PO lines display the vendor-specific item name for purchasing accuracy.

## 3. User Story
As a buyer, when I create special order or dropship POs, I want vendor item names on POs, so that I can align with vendor catalogs.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | `custbody_sna_buy_from` | specialorder or dropship context | Populate `custcol_sna_vendor_item_name` on PO lines |

## 5. Functional Requirements
- The system must run after submit for `specialorder` and `dropship` contexts.
- The system must load the PO and read `custbody_sna_buy_from`.
- For each line item, the system must search `customrecord_sna_hul_vendorprice` for `custrecord_sna_vendor_item_name2`.
- The system must set `custcol_sna_vendor_item_name` on the PO line when found.

## 6. Data Contract
### Record Types Involved
- Purchase Order
- Vendor Price (`customrecord_sna_hul_vendorprice`)

### Fields Referenced
- Purchase Order | `custbody_sna_buy_from`
- PO line | `custcol_sna_vendor_item_name`
- Vendor Price | `custrecord_sna_vendor_item_name2`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Vendor price record not found; line remains unchanged.
- Missing buy-from vendor; script skips.
- Record load/save errors are logged.

## 8. Implementation Notes (Optional)
- Runs after submit and saves the PO again.

## 9. Acceptance Criteria
- Given a special order or dropship PO, when the script runs, then vendor item names populate on PO lines.
- Given missing vendor or item data, when the script runs, then lines are skipped safely.

## 10. Testing Notes
- Create a dropship PO and verify vendor item name is set on lines.
- Vendor price record not found; line remains unchanged.
- Missing buy-from vendor; script skips.
- Record load/save errors are logged.

## 11. Deployment Notes
- Upload `sna_ue_vendor_item_name.js`.
- Deploy User Event on Purchase Order.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should vendor item names be updated on edit events too?
- Should the search be cached to avoid per-line searches?
- Risk: Large POs consume governance due to per-line searches (Mitigation: Use a single search and map results)
- Risk: Vendor price data missing causes incomplete names (Mitigation: Add validation or reporting for missing data)

---
