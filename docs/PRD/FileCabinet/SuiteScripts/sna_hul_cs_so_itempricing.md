# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SOItemPricing
title: Sales Order Item Pricing Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_so_itempricing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Custom Record (customrecord_sna_hul_vendorprice)
  - Custom Record (item category pricing group, not specified)
  - Custom Record (location markup, not specified)

---

## 1. Overview
A client script that calculates pricing, markups, and rate values on Sales Order item lines based on pricing group, vendor price, and location markup rules.

---

## 2. Business Goal
Automate item price level selection and new unit cost calculation so line rates and amounts are consistent with pricing policies.

---

## 3. User Story
As a sales user, when I enter Sales Order items, I want pricing calculated automatically, so that I do not manually compute markups.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custbody_sna_hul_cus_pricing_grp | header pricing group changed | Recalculate price level for lines |
| fieldChanged | custbody_sna_hul_location | header location changed | Recalculate location markup for lines |
| fieldChanged | line fields (discounts, markups, basis, list price, replacement cost, item category, PO rate) | line changed | Recalculate new unit cost |
| fieldChanged | custcol_sna_hul_newunitcost, quantity | line changed | Update rate and amount |
| validateLine | line fields | line commit | Run full pricing pipeline |

---

## 5. Functional Requirements
- On header pricing group change, recalculate price level for item lines.
- On header location change, recalculate location markup for item lines.
- On item line changes to discounts, markups, basis, list price, replacement cost, item category, or PO rate, recalculate new unit cost.
- On item line changes to new unit cost or quantity, update line rate and amount.
- On line validation, run the full pricing pipeline: location markup, vendor price, price level, cumulative markup, new unit cost, and amount.
- For PO vendor changes on the line, set line rate using vendor price rules, including quantity break and contract price.
- Skip calculations for rental items, non-inventory items, and general product group lines.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Custom Record (customrecord_sna_hul_vendorprice)
- Custom Record (item category pricing group, not specified)
- Custom Record (location markup, not specified)

### Fields Referenced
- Header | custbody_sna_hul_cus_pricing_grp
- Header | custbody_sna_hul_location
- Line | custcol_sna_hul_itemcategory
- Line | custcol_sna_hul_item_pricelevel
- Line | custcol_sna_hul_list_price
- Line | custcol_sna_hul_replacementcost
- Line | custcol_sna_hul_markup
- Line | custcol_sna_hul_markupchange
- Line | custcol_sna_hul_loc_markupchange
- Line | custcol_sna_hul_loc_markup
- Line | custcol_sna_hul_cumulative_markup
- Line | custcol_sna_hul_basis
- Line | custcol_sna_hul_perc_disc
- Line | custcol_sna_hul_dollar_disc
- Line | custcol_sna_hul_newunitcost
- Line | custcol_sna_hul_gen_prodpost_grp
- Line | povendor
- Line | porate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Rental item line; pricing logic skipped.
- Non-inventory item; pricing logic skipped.
- Missing vendor price record; list price and replacement cost blank.

---

## 8. Implementation Notes (Optional)
- Relies on script parameters for temp item and rental item IDs.
- Client-side recalculation can be heavy on large orders.

---

## 9. Acceptance Criteria
- Given header changes, when updated, then price level and location markup update on lines.
- Given discounts or quantity changes, when updated, then new unit cost and amount update.
- Given vendor changes, when updated, then vendor pricing applies.

---

## 10. Testing Notes
- Add an inventory item and verify price level, new unit cost, and amount populate.
- Rental item line; verify pricing logic skipped.
- Non-inventory item; verify pricing logic skipped.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_so_itempricing.js`.
- Deploy to Sales Order form.
- Rollback: remove client script deployment from the Sales Order form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should header location changes recalc only affected lines?
- Risk: Large line counts slow client updates.

---
