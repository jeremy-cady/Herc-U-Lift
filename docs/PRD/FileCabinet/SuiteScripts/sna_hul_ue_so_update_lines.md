# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoUpdateLines
title: Sales Order Update Lines
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_so_update_lines.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - estimate
  - supportcase
  - customrecord_nx_asset
  - customrecord_sna_hul_resrcpricetable
  - customrecord_cseg_sna_revenue_st

---

## 1. Overview
Updates sales order and estimate line fields using NextService asset data, revenue stream rules, and resource price tables after save.

---

## 2. Business Goal
Keep line-level segments, revenue streams, and resource pricing consistent with NextService asset context and pricing rules.

---

## 3. User Story
As a service or pricing user, when I save a transaction with resource lines, I want asset-based segments and price table rates applied so that line data stays consistent and accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custcol_sna_quoted_qty | create, non-UI, created from another record | Copy quantity into quoted quantity for each line. |
| beforeSubmit | N/A | any | Call pricing matrix `pmPricingBeforeSubmit`. |
| afterSubmit | cseg_sna_revenue_st | create/edit/xedit | Load transaction and evaluate NextService asset and case data. |
| afterSubmit | cseg_sna_revenue_st | revenue stream empty | Source header revenue stream from NextService case. |
| afterSubmit | cseg_sna_revenue_st | context allows or update flag set | Set line revenue stream based on context. |
| afterSubmit | custcol_sna_service_itemcode, custcol_sna_cpg_resource | resource service code type | Calculate rate/amount using price table and discounts. |
| afterSubmit | custcol_sna_hul_lock_rate, quantity | resource line | Set final quantity and lock rate where required. |
| afterSubmit | custbody_sna_hul_update_rev_stream | updates applied | Clear update flag and save transaction. |
| afterSubmit | N/A | any | Call pricing matrix `pmPricingAfterSubmit`. |

---

## 5. Functional Requirements
- On create (non-UI) when created from another record, copy quantity into `custcol_sna_quoted_qty` per line.
- Call pricing matrix `pmPricingBeforeSubmit` during beforeSubmit.
- After submit on create/edit/xedit, load the transaction and evaluate NextService asset and case data.
- If header revenue stream is empty on sales orders, source it from the NextService case.
- Set line revenue stream based on execution context or update flag.
- For resource service code type lines, compute rate from `customrecord_sna_hul_resrcpricetable` and apply dollar/percent discounts.
- Set resource line quantity to the final quantity logic and lock the rate as required.
- Clear `custbody_sna_hul_update_rev_stream` after updates and save the transaction.
- Call pricing matrix `pmPricingAfterSubmit` after updates.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Estimate
- Support Case
- Custom record: customrecord_nx_asset
- Custom record: customrecord_sna_hul_resrcpricetable
- Custom segment: customrecord_cseg_sna_revenue_st

### Fields Referenced
- Transaction header | cseg_sna_revenue_st | Header revenue stream
- Transaction header | custbody_nx_asset | NextService asset
- Transaction header | custbody_nx_case | NextService case
- Transaction header | custbody_sna_equipment_object | Equipment object (estimate)
- Transaction header | custbody_sna_hul_update_rev_stream | Update flag
- Item line | cseg_sna_revenue_st | Line revenue stream
- Item line | cseg_hul_mfg | Manufacturer segment
- Item line | cseg_sna_hul_eq_seg | Equipment segment
- Item line | custcol_sna_hul_fleet_no | Fleet number
- Item line | custcol_sna_quoted_qty | Quoted quantity
- Item line | custcol_sna_hul_act_service_hours | Actual service hours
- Item line | custcol_sna_used_qty_exc | Used qty exception flag
- Item line | custcol_sna_time_posted | Time posted flag
- Item line | custcol_sna_amt_manual | Override rate flag
- Item line | custcol_sna_service_itemcode | Service code type
- Item line | custcol_sna_hul_dollar_disc | Dollar discount
- Item line | custcol_sna_hul_perc_disc | Percent discount
- Item line | custcol_sna_cpg_resource | Pricing group
- Item line | custcol_sna_hul_newunitcost | New unit cost
- Item line | custcol_sna_hul_lock_rate | Lock rate

Schemas (if known):
- Library | FileCabinet/SuiteScripts/sna_hul_ue_pm_pricing_matrix | Pricing matrix hooks

---

## 7. Validation & Edge Cases
- When the override rate flag is set, resource line rates should not be updated.
- If pricing table matches are missing, the rate may fall back to parent revenue stream logic.
- Missing asset data should be logged without blocking save.

---

## 8. Implementation Notes (Optional)
- Uses NextService asset and case data to set segments and revenue stream.
- Updates are applied after submit to cover non-UI entry contexts.
- Governance: transaction load/save plus multiple lookup/search operations per line.

---

## 9. Acceptance Criteria
- Given a non-UI create-from transaction, when the record is created, then each line has `custcol_sna_quoted_qty` set to the line quantity.
- Given a sales order with a blank header revenue stream and a NextService case, when the record is saved, then the header revenue stream is sourced from the case.
- Given a resource service code type line without override, when the record is saved, then rate and amount are computed from the resource price table and discounts.
- Given the update flag is set, when updates complete, then `custbody_sna_hul_update_rev_stream` is cleared.

---

## 10. Testing Notes
- Create a sales order linked to NextService asset/case and verify header/line segments and revenue stream updates.
- Save a resource line with dollar/percent discounts and verify rate/amount updates.
- Set override rate and confirm rates are not updated.

---

## 11. Deployment Notes
- Deploy the user event to Sales Order and Estimate.
- Ensure the pricing matrix library `sna_hul_ue_pm_pricing_matrix` is available.
- Ensure resource price table records are populated.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should revenue stream updates be restricted to specific execution contexts only?

---
