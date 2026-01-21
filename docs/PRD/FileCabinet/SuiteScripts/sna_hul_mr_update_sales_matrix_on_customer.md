# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateSalesMatrixOnCustomer
title: Update Sales Matrix On Customer
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_update_sales_matrix_on_customer.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_sales_rep_matrix
  - customrecord_sna_salesrep_matrix_mapping
  - customer

---

## 1. Overview
Synchronizes Sales Rep Matrix records to Sales Rep Matrix Mapping records for a customer, including updates and inactivation.

---

## 2. Business Goal
Keeps customer-specific sales rep mappings aligned with matrix definitions and supports global resync or targeted updates.

---

## 3. User Story
- As a sales ops admin, when I resync a customer's sales rep mapping from the matrix, I want assignments to stay current, so that exceptions remain intact.
- As a sales ops admin, when inactivation is needed, I want to inactivate mappings, so that stale assignments are removed.
- As a sales ops admin, when mappings are marked override, I want to preserve them, so that manual exceptions remain intact.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | TBD | Deployment run or Suitelet trigger | Create/update/inactivate sales rep matrix mapping records for a customer |

---

## 5. Functional Requirements
- Read zip codes for the target customer when add/update mode is enabled.
- Find Sales Rep Matrix records that match the customer's zip codes.
- Create or update Sales Rep Matrix Mapping records for the customer and matrix.
- Skip updates for mappings marked override.
- Set mapping records to inactive when inactivation is requested.
- Refresh mapping fields from the matrix when updating from a matrix record.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_sales_rep_matrix
- customrecord_sna_salesrep_matrix_mapping
- customer

### Fields Referenced
- customrecord_sna_sales_rep_matrix.custrecord_sna_state
- customrecord_sna_sales_rep_matrix.custrecord_sna_county
- customrecord_sna_sales_rep_matrix.custrecord_sna_zip_code
- customrecord_sna_sales_rep_matrix.custrecord_sna_rep_matrix_equipment_cat
- customrecord_sna_sales_rep_matrix.custrecord_sna_revenue_streams
- customrecord_sna_sales_rep_matrix.custrecord_sna_hul_manufacturer_cs
- customrecord_sna_sales_rep_matrix.custrecord_sna_rep_matrix_sales_reps
- customrecord_sna_sales_rep_matrix.custrecord_sna_hul_sales_rep_comm_plan
- customrecord_sna_sales_rep_matrix.custrecord_sna_hul_comm_plan_end_date
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_customer
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_state
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_county
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_zipcode
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_equipment
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_rev_stream
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_manufacturer
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_sales_reps
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_override
- customrecord_sna_salesrep_matrix_mapping.custrecord_salesrep_mapping_sales_matrix
- customrecord_sna_salesrep_matrix_mapping.custrecord_sna_hul_sales_rep_comm_plan_2
- customrecord_sna_salesrep_matrix_mapping.custrecord_sna_hul_comm_plan_end_date_2
- customrecord_sna_salesrep_matrix_mapping.isinactive

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- If a mapping is marked override, it is not updated.
- If inactivate mode is enabled, `isinactive` is set without changing fields.
- If customer has no zip codes, no mappings are created.
- Invalid zip code values are filtered out.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Map/Reduce runtime limits when resyncing large customer sets.

---

## 9. Acceptance Criteria
- Given add/update mode is enabled and customer zip codes match matrix records, when the job runs, then mappings are created for all matching matrix records.
- Given existing mappings are marked override, when the job runs, then those mappings are not changed.
- Given inactivate mode is requested, when the job runs, then matching mappings have `isinactive` set to true.
- Given matrix records are updated, when the job runs, then mapping fields match the latest matrix values.

---

## 10. Testing Notes
Manual tests:
- Add/update mode creates mappings for a customer with matching zip codes.
- Update mode refreshes mapping fields from matrix values.
- Customer with no zip codes results in no mappings.
- Mapping with override set is skipped.
- Inactivate mode sets `isinactive` without changing fields.
- Missing matrix or customer parameter logs error and skips.

---

## 11. Deployment Notes
- Script parameters configured.
- Dependency library deployed.
- Deploy script and schedule or trigger via Suitelet.
- Configure parameter values for target resync.
- Run Map/Reduce and review logs.

---

## 12. Open Questions / TBDs
- Should the script resync be scheduled for recurring maintenance?

---
