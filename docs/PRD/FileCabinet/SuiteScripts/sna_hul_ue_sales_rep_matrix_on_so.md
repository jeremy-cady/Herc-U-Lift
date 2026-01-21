# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SalesRepMatrixOnSO
title: Sales Rep Matrix on Sales Orders
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_sales_rep_matrix_on_so.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customrecord_sna_salesrep_matrix_mapping
  - customrecord_cseg_sna_revenue_st
  - customrecord_cseg_sna_hul_eq_seg
  - item

---

## 1. Overview
User Event that assigns sales reps and commission data to sales order lines based on matrix mappings.

---

## 2. Business Goal
Ensure sales reps and commission plans are applied consistently by customer, location, equipment category, revenue stream, and manufacturer.

---

## 3. User Story
As a sales admin, when sales orders are created, I want sales reps and commission plans assigned, so that commissions are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | line items | sales order create/edit/copy | Load matrix mappings, match lines, set sales rep and commission fields |

---

## 5. Functional Requirements
- On sales order create/edit/copy, load customer matrix mappings.
- Evaluate ship-to location (state/county/zip), revenue streams, and equipment categories to find a matching mapping.
- Load item details to determine equipment and revenue segments and eligibility for commission.
- For matching lines, set sales rep, matrix reference, commission plan, and commission fields.
- Respect override flags that bypass matrix matching.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- customrecord_sna_salesrep_matrix_mapping
- customrecord_cseg_sna_revenue_st
- customrecord_cseg_sna_hul_eq_seg
- item

### Fields Referenced
- salesorder | custcol_sna_sales_rep | Sales rep
- salesorder | custcol_sna_sales_rep_matrix | Matrix reference
- salesorder | custcol_sna_commission_plan | Commission plan
- salesorder | custcol_sna_commission_amount | Commission amount
- salesorder | custcol_sna_hul_comm_rate | Commission rate
- salesorder | custcol_sna_hul_sales_rep_comm_type | Commission type
- salesorder | custcol_sna_hul_eligible_for_comm | Eligible for commission
- salesorder | custcol_sna_override_commission | Override commission
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_customer | Customer
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_state | State
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_county | County
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_zipcode | Zip code
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_equipment | Equipment category
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_rev_stream | Revenue stream
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_manufacturer | Manufacturer
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_sales_reps | Sales reps
- customrecord_sna_salesrep_matrix_mapping | custrecord_sna_hul_sales_rep_comm_plan_2 | Commission plan

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching matrix records leave lines unchanged.
- Missing item segment data should be handled without script failure.
- Incorrect mapping due to incomplete zip data.

---

## 8. Implementation Notes (Optional)
- Matching relies on zip code and segment hierarchy logic.
- Performance/governance considerations: Multiple searches for mappings and item details.

---

## 9. Acceptance Criteria
- Given a matching matrix record, when beforeSubmit runs, then sales rep and commission fields are populated.
- Given override flags, when beforeSubmit runs, then automatic assignment is skipped.

---

## 10. Testing Notes
- Create sales order that matches a matrix record and verify line assignments.
- No matching matrix records should leave lines unchanged.
- Deploy User Event on sales order.

---

## 11. Deployment Notes
- Confirm matrix mappings are active and complete.
- Deploy User Event on sales order and validate assignment results on sample orders.
- Monitor logs for unmatched mapping conditions; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- How should conflicting matrix matches be prioritized?

---
