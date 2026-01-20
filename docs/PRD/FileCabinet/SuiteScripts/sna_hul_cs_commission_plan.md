# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CommissionPlan
title: Commission Plan Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_commission_plan.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Commission Plan custom record (ID TBD)
  - Transaction (Customer Invoice)
  - Customer

---

## 1. Overview
A client script that calculates commission metrics and payouts based on sales rep selection and commission plan inputs.

---

## 2. Business Goal
Automate commission calculations using invoice payment history, revenue metrics, and a configurable reference table.

---

## 3. User Story
As a finance user, when I select a sales rep and enter commission plan inputs, I want commission metrics calculated automatically, so that payouts are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custrecord_sna_hul_sales_rep | value changed | Calculate total invoices paid |
| fieldChanged | base pay, total invoices paid, prior year retention | inputs present | Calculate payout metrics and totals |

---

## 5. Functional Requirements
- When `custrecord_sna_hul_sales_rep` changes, calculate total invoices paid from customer invoices tied to the sales rep.
- When base pay, total invoices paid, and prior year retention are populated, compute:
  - Percent revenue renewed
  - VARSS payout percent and amount
  - Excess retention quota
  - Total revenue generated
  - Direct estimate sales
  - Revenue eligible for commission
  - VESS payout percent and amount
- Read a seven-row reference table from custom fields to determine payout thresholds.
- Update all calculated fields on the current record.

---

## 6. Data Contract
### Record Types Involved
- Commission Plan custom record (ID TBD)
- Transaction (Customer Invoice)
- Customer

### Fields Referenced
- custrecord_sna_hul_sales_rep
- custrecord_sna_hul_total_invoices_paid
- custrecord_sna_hul_base_pay
- custrecord_sna_hul_py_total_ret_revenue
- custrecord_per_rev_renew
- custrecord_var_ret_scale_payout
- custrecord_sna_hul_amount_payout
- custrecord_sna_hul_excess_ret_quota
- custrecord_sna_hul_total_revenue_gen
- custrecord_sna_hul_direct_est_sales
- custrecord_sna_hul_amount_rev_commission
- custrecord_sna_hul_percent_payout_vess
- custrecord_sna_hul_percent_payout_ness
- custrecord_sna_hul_percent_rev_renewed_1 .. custrecord_sna_hul_percent_rev_renewed_7
- custrecord_sna_hul_percent_payout_1 .. custrecord_sna_hul_percent_payout_7
- custrecord_sna_hul_percent_rev_gen_1 .. custrecord_sna_hul_percent_rev_gen_7
- custrecord_sna_hul_percent_payout_vess_1 .. custrecord_sna_hul_percent_payout_vess_7
- Transaction body | custbody_sna_hul_override_salesrep_csm
- Transaction line | custcol_sna_sales_rep
- Customer | custentity_sna_hul_csm

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing reference table rows.
- Zero or null prior year retention value.
- Search returns no invoices; totals should be zero.

---

## 8. Implementation Notes (Optional)
- Calculations depend on reference table fields being complete.
- Client-side searches may impact page performance for large datasets.

---

## 9. Acceptance Criteria
- Given a sales rep and required inputs, when fields change, then calculated fields populate.
- Given base pay or prior year retention changes, when updated, then revenue eligible and payout fields update.

---

## 10. Testing Notes
- Select a sales rep and populate base pay and prior year retention; confirm calculated payout fields update.
- Missing reference table rows; confirm behavior is handled.
- No invoices found; confirm totals are zero.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_commission_plan.js`.
- Deploy to the commission plan custom record form.
- Rollback: remove client script deployment from the commission plan form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Commission plan record ID is TBD.
- Should the VESS payout logic handle missing reference rows more safely?
- Risk: Large invoice search slows client form.
- Risk: Reference table fields incomplete.

---
