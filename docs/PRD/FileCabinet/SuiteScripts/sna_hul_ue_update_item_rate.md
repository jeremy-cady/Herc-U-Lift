# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateItemRate
title: Update Item Rates by PO Type
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_update_item_rate.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder
  - vendor

---

## 1. Overview
Recalculates item line rates and amounts using vendor markup/discount percentages tied to PO type, while preserving original rates.

---

## 2. Business Goal
Apply vendor-specific pricing adjustments consistently without compounding rate changes over time.

---

## 3. User Story
As a buyer, when I create or edit a PO, I want line rates recalculated from vendor PO type percentages so that pricing is consistent and traceable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custbody_po_type, custbody_sna_buy_from | create/edit | Resolve vendor percentage field based on PO type. |
| beforeSubmit | custcol_sna_original_item_rate | create | Store original line rate. |
| beforeSubmit | rate, amount | create/edit, update checkbox on edit | Recalculate line rate and amount using vendor percentage. |

---

## 5. Functional Requirements
- On create/edit, read `custbody_po_type` and map it to the vendor markup/discount field.
- Load the vendor percentage from the buy-from vendor.
- On create, store the current line rate in `custcol_sna_original_item_rate`.
- On edit, use `custcol_sna_original_item_rate` as the baseline for recalculation.
- Update line rate and amount using the vendor markup/discount percentage.
- On edit, only run recalculation when `custbody_sna_update_price_markup_disc` is true.

---

## 6. Data Contract
### Record Types Involved
- Purchase Order (or deployed transaction type)
- Vendor

### Fields Referenced
- Transaction header | custbody_po_type | PO type
- Transaction header | custbody_sna_buy_from | Buy-from vendor
- Transaction header | custbody_sna_update_price_markup_disc | Update price checkbox
- Item line | custcol_sna_original_item_rate | Original rate
- Vendor | custentity_sna_hul_emergency | Emergency markup/discount
- Vendor | custentity_sna_hul_truckdown | Truck down markup/discount
- Vendor | custentity_sna_hul_dropship_percent | Drop ship markup/discount
- Vendor | custentity_sna_hul_stock_order | Stock order markup/discount

Schemas (if known):
- Vendor | PO type markup/discount fields | Mapping used for recalculation

---

## 7. Validation & Edge Cases
- If no vendor or PO type is present, no recalculation occurs.
- If vendor percentage is missing, line updates are skipped.
- Original rate is preserved on create to prevent compounding on edits.

---

## 8. Implementation Notes (Optional)
- Uses a single vendor lookup per transaction and iterates all item lines.
- Edit recalculation is gated by `custbody_sna_update_price_markup_disc`.

---

## 9. Acceptance Criteria
- Given a new transaction with a PO type and vendor percentage, when the record is saved, then line rates and amounts are updated and original rates are stored.
- Given an edited transaction with update checkbox true, when the record is saved, then line rates are recalculated from `custcol_sna_original_item_rate`.
- Given update checkbox false, when the record is saved, then no recalculation occurs.

---

## 10. Testing Notes
- Create a PO with PO type and vendor percentage and verify rate/amount updates.
- Edit with update checkbox true and verify recalculation uses original rate.
- Edit with update checkbox false and verify no changes.

---

## 11. Deployment Notes
- Configure vendor percentage fields for PO type mappings.
- Deploy the user event to the target transaction type.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should drop ship and special order contexts be excluded explicitly?

---
