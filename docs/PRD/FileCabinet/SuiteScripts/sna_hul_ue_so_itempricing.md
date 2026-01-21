# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoItemPricing
title: Sales Order Item Pricing
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_so_itempricing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - estimate
  - customer
  - item
  - customrecord_sna_hul_itempricelevel
  - customrecord_sna_hul_locationmarkup
  - customrecord_sna_hul_vendorprice
  - customrecord_sna_service_code_type

---

## 1. Overview
Populates and recalculates pricing-related fields for Sales Orders and Estimates based on item category, customer pricing group, revenue stream, and location markup.

---

## 2. Business Goal
Ensure line pricing and cost fields are consistently derived when records are created, copied, or edited outside the normal UI client script flow.

---

## 3. User Story
As a sales user, when orders are created or imported, I want pricing fields synchronized with pricing rules, so that rates are correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | custcol_sna_pricing_details | view | Inject "Other Details" link when empty |
| beforeSubmit | custbody_sna_order_fulfillment_method | create/copy | Set fulfillment method and lock rate flags |
| afterSubmit | price level / revenue stream | create/edit | Recalculate pricing when needed |

---

## 5. Functional Requirements
- On VIEW, inject an "Other Details" link into `custcol_sna_pricing_details` when empty.
- On CREATE/COPY from an Estimate, copy `custcol_sna_hul_estimated_po_rate` to `porate`.
- On beforeSubmit, set `custbody_sna_order_fulfillment_method` to Will Call when header revenue stream equals the CSHOP parameter.
- On beforeSubmit, set `custcol_sna_hul_lock_rate` for qualifying item lines (excluding rental/service exclusions).
- On afterSubmit, recalculate pricing fields if the line price level is empty or the revenue stream changed.
- Use customer pricing group, item category, location markup, vendor price, and revenue stream surcharge rules in calculations.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- estimate
- customer
- item
- customrecord_sna_hul_itempricelevel
- customrecord_sna_hul_locationmarkup
- customrecord_sna_hul_vendorprice
- customrecord_sna_service_code_type

### Fields Referenced
- Sales Order | custbody_sna_order_fulfillment_method | Order fulfillment method
- Sales Order | cseg_sna_revenue_st | Header revenue stream
- Item line | custcol_sna_pricing_details | Pricing details link HTML
- Item line | custcol_sna_hul_estimated_po_rate | Estimated PO rate
- Item line | custcol_sna_hul_lock_rate | Lock rate flag
- Item line | custcol_sna_hul_itemcategory | Item category
- Item line | custcol_item_discount_grp | Discount group
- Item line | custcol_sna_hul_markupchange | Item markup change
- Item line | custcol_sna_hul_loc_markup | Location markup record
- Item line | custcol_sna_hul_loc_markupchange | Location markup change
- Item line | custcol_sna_hul_list_price | List price
- Item line | custcol_sna_hul_replacementcost | Replacement cost
- Item line | custcol_sna_hul_list_price_init | Initial list price
- Item line | custcol_sna_hul_replacementcost_init | Initial replacement cost
- Item line | custcol_sna_hul_item_pricelevel | Item price level
- Item line | custcol_sna_hul_basis | Pricing basis
- Item line | custcol_sna_hul_markup | Pricing markup
- Item line | custcol_sna_hul_cumulative_markup | Cumulative markup
- Item line | custcol_sna_hul_newunitcost | New unit cost
- Item line | custcolsna_hul_newunitcost_wodisc | Unit cost without discount
- Item line | custcol_sna_hul_list_price_prev | Previous list price
- Item line | custcol_sna_hul_replacementcost_prev | Previous replacement cost
- Item line | custcol_sna_hul_item_pricelevel | Price level
- Shipping address subrecord | custrecord_sna_cpg_parts | Customer pricing group

Schemas (if known):
- Suitelet: customscript_sna_hul_sl_itempricingdet

---

## 7. Validation & Edge Cases
- Repricing runs only when price level is missing or revenue stream changed.
- Customer pricing group missing defaults to List (155).
- Missing pricing configuration logs an error and skips line.

---

## 8. Implementation Notes (Optional)
- Uses ad hoc searches for items, location markup, price levels, vendor price, and revenue stream.
- Module `sna_hul_mod_sales_tax.js` referenced but not active.

---

## 9. Acceptance Criteria
- Given a CSV import with missing price level, when afterSubmit runs, then price/rate/amount are recalculated.
- Given view mode with empty pricing details, when beforeLoad runs, then the Other Details link appears.
- Given qualifying lines, when beforeSubmit runs, then lock rate is set.

---

## 10. Testing Notes
- CSV import Sales Order with missing price level, verify fields and rate populated after save.
- View Sales Order with empty pricing details, verify link appears.
- Revenue stream changes between edits trigger repricing.
- Ensure custom records exist with pricing and markup configurations.

---

## 11. Deployment Notes
- Custom records for pricing and markup are populated.
- Suitelet for pricing details is deployed.
- Deploy User Event on Sales Order and Estimate.
- Confirm script parameters are set (item categories, service types, pricing groups).

---

## 12. Open Questions / TBDs
- Which revenue stream price calculation modes are currently active for production?

---
