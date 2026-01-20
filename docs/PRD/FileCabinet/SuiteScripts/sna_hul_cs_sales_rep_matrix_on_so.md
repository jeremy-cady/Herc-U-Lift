# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SalesRepMatrixOnSO
title: Sales Rep Matrix on Sales Order Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_sales_rep_matrix_on_so.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Custom Record (customrecord_sna_salesrep_matrix_mapping)
  - Item
  - Customer
  - Employee

---

## 1. Overview
A client script that assigns sales reps and commission data on Sales Order lines based on a customer sales rep matrix.

---

## 2. Business Goal
Automate sales rep assignment and commission calculations using customer mapping rules and item attributes.

---

## 3. User Story
As a sales user, when I add items to a Sales Order, I want sales reps auto-assigned, so that commission tracking is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | customer | edit mode | Load customer sales rep matrix records |
| fieldChanged | entity | customer changed | Reload matrix and determine ship-to zip |
| postSourcing | item | item sourced | Match matrix and set sales rep and commission fields |

---

## 5. Functional Requirements
- On page init (edit mode), load customer sales rep matrix records.
- When the customer changes, reload the matrix and determine the ship-to zip code.
- When an item is sourced on the item sublist, look up item attributes (equipment segment, revenue stream, manufacturer, commission eligibility).
- Match mapping rules by zip, equipment category, and revenue stream, and optionally manufacturer.
- Set line fields for sales rep, sales rep matrix record, commission plan, commission rate, commission type, eligibility, and commission amount.
- Commission amount must be calculated as gross margin or revenue based on commission type.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Custom Record (customrecord_sna_salesrep_matrix_mapping)
- Item
- Customer
- Employee

### Fields Referenced
- Line | custcol_sna_sales_rep
- Line | custcol_sna_sales_rep_matrix
- Line | custcol_sna_hul_eligible_for_comm
- Line | custcol_sna_hul_comm_rate
- Line | custcol_sna_hul_sales_rep_comm_type
- Line | custcol_sna_commission_plan
- Line | custcol_sna_commission_amount
- Item | cseg_sna_hul_eq_seg
- Item | cseg_sna_revenue_st
- Item | cseg_hul_mfg
- Item | custitem_sna_hul_eligible_for_comm
- Customer Mapping | custrecord_salesrep_mapping_customer
- Customer Mapping | custrecord_salesrep_mapping_state
- Customer Mapping | custrecord_salesrep_mapping_county
- Customer Mapping | custrecord_salesrep_mapping_zipcode
- Customer Mapping | custrecord_salesrep_mapping_equipment
- Customer Mapping | custrecord_salesrep_mapping_rev_stream
- Customer Mapping | custrecord_salesrep_mapping_manufacturer
- Customer Mapping | custrecord_salesrep_mapping_sales_reps
- Customer Mapping | custrecord_salesrep_mapping_override
- Customer Mapping | custrecord_sna_hul_sales_rep_comm_plan_2

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No mapping found; no updates applied.
- Manufacturer not specified; use zip/equipment/revenue match only.
- Missing ship address ID should not crash the script.

---

## 8. Implementation Notes (Optional)
- Uses employee search to pick the assigned sales rep based on a custom sort field.
- Zip code matching relies on ship address internal ID.

---

## 9. Acceptance Criteria
- Given an item line, when sourced, then sales rep and commission fields populate.
- Given a commission type, when applied, then commission amount matches the type and rate.

---

## 10. Testing Notes
- Add an item line and verify sales rep and commission values populate.
- No mapping found; verify no updates.
- Manufacturer not specified; verify zip/equipment/revenue match only.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_sales_rep_matrix_on_so.js`.
- Deploy to Sales Order form.
- Rollback: remove client script deployment from Sales Order form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should mapping consider county or state fields (currently not used in matching)?
- Risk: No match due to zip formatting.

---
