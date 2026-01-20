# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RecalcRateRevStream
title: Recalculate Rates by Revenue Stream
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_recalc_rate_rev_stream.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (salesorder)
  - Support Case (supportcase)
  - Custom Record | customrecord_cseg_sna_revenue_st
  - Custom Record | customrecord_cseg_sna_hul_eq_seg
  - Custom Record | customrecord_sna_hul_so_lines_processed
  - Custom Record | customrecord_sna_hul_locationmarkup
  - Custom Record | customrecord_sna_hul_vendorprice
  - Custom Record | customrecord_sna_hul_itempricelevel
  - Custom Record | customrecord_sna_service_code_type
  - Custom Record | customrecord_sna_hul_resrcpricetable
  - Custom Record | customrecord_sna_sales_zone

---

## 1. Overview
A Map/Reduce script that recalculates Sales Order line rates and pricing based on the selected Revenue Stream and pricing tables, with planned maintenance handling.

---

## 2. Business Goal
Ensures Sales Order pricing and taxes stay consistent with Revenue Stream rules, item categories, and location markup logic.

---

## 3. User Story
As a service coordinator, when the Revenue Stream changes, I want Sales Order pricing to update, so that billing is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- The script must load the target Sales Order from parameter `custscript_sna_hul_so_id`.
- The script must use parameters (item categories, service items, planned maintenance) to control pricing logic.
- The script must read Revenue Stream from `cseg_sna_revenue_st` or fallback to the linked Support Case.
- The script must add or update a planned maintenance line when the Revenue Stream indicates it.
- The script must recalculate item line pricing, markup, and price levels using custom pricing tables.
- The script must update line Revenue Stream values when the action type is `updateRevStreamRecalcRate`.
- The script must update the processing tracker record (`customrecord_sna_hul_so_lines_processed`) every 5 lines and on completion/failure.
- The script must apply internal tax handling via `sna_hul_mod_sales_tax.updateLines` and set tax overrides accordingly.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (`salesorder`)
- Support Case (`supportcase`)
- Custom Record | `customrecord_cseg_sna_revenue_st`
- Custom Record | `customrecord_cseg_sna_hul_eq_seg`
- Custom Record | `customrecord_sna_hul_so_lines_processed`
- Custom Record | `customrecord_sna_hul_locationmarkup`
- Custom Record | `customrecord_sna_hul_vendorprice`
- Custom Record | `customrecord_sna_hul_itempricelevel`
- Custom Record | `customrecord_sna_service_code_type`
- Custom Record | `customrecord_sna_hul_resrcpricetable`
- Custom Record | `customrecord_sna_sales_zone`

### Fields Referenced
- Sales Order | `cseg_sna_revenue_st`
- Sales Order | `custbody_nx_case`
- Sales Order | `custbody_nx_task`
- Sales Order | `custbody_ava_disable_tax_calculation`
- Sales Order | `taxamountoverride`
- Sales Order | `custbody_sna_hul_location`
- Sales Order Item | `cseg_sna_revenue_st`
- Sales Order Item | `custcol_ava_taxamount`
- Sales Order Item | `taxcode`
- Sales Order Item | `custcol_sna_hul_dollar_disc`
- Sales Order Item | `custcol_sna_hul_perc_disc`
- Sales Order Item | `custcol_sna_hul_itemcategory`
- Sales Order Item | `custcol_sna_hul_gen_prodpost_grp`
- Sales Order Item | `custcol_sna_service_itemcode`
- Sales Order Item | `custcol_sna_hul_loc_markup`
- Sales Order Item | `custcol_sna_hul_list_price`
- Sales Order Item | `custcol_sna_hul_replacementcost`
- Sales Order Item | `custcol_sna_hul_item_pricelevel`
- Sales Order Item | `custcol_sna_hul_cumulative_markup`
- Sales Order Item | `custcol_sna_hul_newunitcost`
- Sales Order Item | `custcolsna_hul_newunitcost_wodisc`
- Sales Order Item | `custcol_sna_hul_list_price_prev`
- Sales Order Item | `custcol_sna_hul_replacementcost_prev`
- Sales Order Item | `custcol_sna_work_code`
- Sales Order Item | `custcol_sna_repair_code`
- Sales Order Item | `custcol_sna_group_code`
- Sales Order Item | `custcol_nxc_case`
- Sales Order Item | `custcol_nx_task`
- Sales Order Item | `custcol_nx_asset`
- Sales Order Item | `custcol_nxc_equip_asset`
- Sales Order Item | `custcol_sna_sales_description`
- Sales Order Item | `custcol_sna_so_service_code_type`
- Sales Order Item | `custcol_sna_hul_fleet_no`
- Revenue Stream | `custrecord_sna_hul_pnrevstream`
- Revenue Stream | `custrecord_sna_hul_flatrate`
- Revenue Stream | `custrecord_sna_price_calculation`
- Revenue Stream | `custrecord_sna_surcharge`
- SO Processing Tracker | `custrecord_sna_hul_so_lines_processed`
- SO Processing Tracker | `custrecord_sna_hul_process_status`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Sales Order without Revenue Stream falls back to Support Case Revenue Stream.
- Lines with missing pricing data are handled without script failure.
- Invalid Sales Order ID marks processing status as failed.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Updates progress every 5 lines to reduce reprocessing risk.
- Constraints: Requires dynamic record loading for line-level updates.
- Dependencies: `sna_hul_ue_pm_pricing_matrix`, `sna_hul_mod_sales_tax.js`.
- Risk: Incorrect pricing due to missing configuration.

---

## 9. Acceptance Criteria
- Given a Sales Order with a Revenue Stream, when the script runs, then Sales Order lines show recalculated rates and amounts based on the Revenue Stream.
- Given a Revenue Stream that requires planned maintenance, when the script runs, then a planned maintenance line is added or updated.
- Given processing completes, when the script runs, then the processing tracker record shows completed or failed status.
- Given internal tax is detected, when the script runs, then tax overrides are set.

---

## 10. Testing Notes
- Happy path: Sales Order with Revenue Stream updates all line rates and amounts.
- Happy path: Planned maintenance line is added with correct quantity and rate.
- Edge case: Sales Order without Revenue Stream falls back to Support Case Revenue Stream.
- Edge case: Lines with missing pricing data are handled without script failure.
- Error handling: Invalid Sales Order ID marks processing status as failed.
- Test data: Sales Orders with Revenue Stream, case, and multiple item lines.
- Sandbox setup: Ensure pricing tables and Revenue Stream configurations are available.

---

## 11. Deployment Notes
- Configure script parameters for item categories and planned maintenance item.
- Upload `sna_hul_mr_recalc_rate_rev_stream.js`.
- Deploy Map/Reduce with required parameters.
- Post-deployment: Validate pricing updates on a sample Sales Order.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Schema details are not specified.
- Which pricing tables are authoritative when multiple matches exist?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
