# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateSalesRepCmPlan
title: Update Sales Rep Commission Plan on SO Lines
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_update_sales_rep_cm_plan.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customer
  - item
  - employee
  - customrecord_sna_salesrep_matrix_mapping

---

## 1. Overview
Populates sales rep and commission fields on sales order lines by matching customer sales rep matrix rules and calculating commission amounts.

---

## 2. Business Goal
Ensure line-level commission assignments and amounts are accurate based on customer, item, and revenue stream criteria.

---

## 3. User Story
As a sales manager, when a sales order is saved, I want commission fields set from matrix rules so that payouts align with configured eligibility and rates.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | shipaddresslist | non-delete | Load customer matrix records and resolve ship-to zip. |
| beforeSubmit | custcol_sna_sales_rep, custcol_sna_sales_rep_matrix | matching matrix entry | Set sales rep and matrix id on matching lines. |
| beforeSubmit | commission fields | eligible item | Set commission plan, rate, type, and calculated amount. |

---

## 5. Functional Requirements
- On beforeSubmit (non-delete), load customer matrix records for the transaction customer.
- Determine ship-to zip code from `shipaddresslist` and item details (equipment category, revenue stream, manufacturer, eligibility).
- Select a matrix entry matching zip, equipment category, and revenue stream; prefer manufacturer match when available.
- Set `custcol_sna_sales_rep` and `custcol_sna_sales_rep_matrix` on matching lines.
- When item is eligible for commission, set commission plan, rate, and type fields.
- Calculate commission amount as gross margin or revenue based on commission type.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Customer
- Item
- Employee
- Custom record: customrecord_sna_salesrep_matrix_mapping

### Fields Referenced
- Transaction header | shipaddresslist | Shipping address id
- Item line | custcol_sna_sales_rep | Sales rep
- Item line | custcol_sna_sales_rep_matrix | Matrix record id
- Item line | custcol_sna_hul_eligible_for_comm | Eligible for commission
- Item line | custcol_sna_hul_comm_rate | Commission rate
- Item line | custcol_sna_hul_sales_rep_comm_type | Commission type
- Item line | custcol_sna_commission_plan | Commission plan
- Item line | custcol_sna_commission_amount | Commission amount
- Item | cseg_sna_hul_eq_seg | Equipment category
- Item | cseg_sna_revenue_st | Revenue stream
- Item | cseg_hul_mfg | Manufacturer
- Item | custitem_sna_hul_eligible_for_comm | Eligible for commission
- Employee | custentity_sna_sales_rep_tran_assignedon | Assignment date

Schemas (if known):
- Custom record | customrecord_sna_salesrep_matrix_mapping | Sales rep matrix mappings

---

## 7. Validation & Edge Cases
- If no matching matrix entry exists, leave fields unchanged.
- If item is not eligible for commission, do not set commission fields.
- If ship-to zip is missing, log and skip updates.

---

## 8. Implementation Notes (Optional)
- Matching logic prioritizes manufacturer when multiple entries match zip/category/revenue stream.
- Sales rep selection uses earliest assigned-on date when multiple reps apply.

---

## 9. Acceptance Criteria
- Given a matching matrix entry, when the sales order is saved, then sales rep and matrix id are set on the line.
- Given an eligible item, when the sales order is saved, then commission plan, rate, type, and amount are populated.
- Given no matrix match, when the sales order is saved, then commission fields remain unchanged.

---

## 10. Testing Notes
- Save an SO with a matching matrix entry and verify rep and commission fields.
- Save an SO with a non-eligible item and verify commission fields are not set.
- Save an SO with missing ship-to zip and verify no updates and logged error.

---

## 11. Deployment Notes
- Ensure customer matrix records include commission plan data.
- Deploy the user event to Sales Order.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should zip matching use 5-digit prefix as in customer matrix maintenance?

---
