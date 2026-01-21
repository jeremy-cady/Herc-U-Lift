# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SalesRepMatrixConfig
title: Sales Rep Matrix Configuration
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_sales_rep_matrix_config.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_salesrep_matrix_mapping
  - customrecord_sna_sales_rep_matrix
  - salesorder
  - employee

---

## 1. Overview
User Event that controls Sales Rep Matrix editing and triggers downstream updates when matrix records change.

---

## 2. Business Goal
Prevent unintended edits to sales rep assignments and ensure customer mappings refresh when matrix criteria change.

---

## 3. User Story
As an admin or sales operations user, when matrix criteria change, I want edits controlled and updates triggered, so that commissions are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | sales reps field | matrix mapping | Disable sales reps field unless `editSalesRep` is set |
| afterSubmit | matrix fields | matrix record edit | Compare fields and run MR update if changed |
| afterSubmit | sales reps | sales order create | Update employee assigned-on date |

---

## 5. Functional Requirements
- On matrix mapping load, disable the sales reps field unless `editSalesRep` is passed in the request.
- On matrix record edit, compare key fields and run the Map/Reduce update when changes are detected.
- On sales order create, update each referenced sales rep with an assigned-on date.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_salesrep_matrix_mapping
- customrecord_sna_sales_rep_matrix
- salesorder
- employee

### Fields Referenced
- customrecord_sna_sales_rep_matrix | custrecord_sna_state | State
- customrecord_sna_sales_rep_matrix | custrecord_sna_county | County
- customrecord_sna_sales_rep_matrix | custrecord_sna_zip_code | Zip code
- customrecord_sna_sales_rep_matrix | custrecord_sna_rep_matrix_equipment_cat | Equipment category
- customrecord_sna_sales_rep_matrix | custrecord_sna_revenue_streams | Revenue streams
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_manufacturer_cs | Manufacturer
- customrecord_sna_sales_rep_matrix | custrecord_sna_rep_matrix_sales_reps | Sales reps
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_sales_rep_comm_plan | Commission plan
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_comm_plan_end_date | Plan end date
- salesorder | custcol_sna_sales_rep | Sales rep
- employee | custentity_sna_sales_rep_tran_assignedon | Assigned-on date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Edit matrix without changes should not schedule MR.
- Missing MR deployments should log errors without failing save.
- Cache-based throttling prevents MR task contention.

---

## 8. Implementation Notes (Optional)
- Uses N/cache and N/task.
- MR: customscript_sna_hul_mr_upd_matrix_oncus.

---

## 9. Acceptance Criteria
- Given matrix mapping, when beforeLoad runs, then sales rep field is disabled unless explicitly unlocked.
- Given matrix changes, when afterSubmit runs, then MR update is scheduled.
- Given sales order create, when afterSubmit runs, then employee assigned-on dates are updated.

---

## 10. Testing Notes
- Edit matrix criteria and verify MR task submits.
- Create sales order and verify employee assigned-on date.
- Edit matrix without changes should not schedule MR.
- Deploy User Event on matrix and sales order records.

---

## 11. Deployment Notes
- Confirm MR deployments are active.
- Deploy User Event on matrix and sales order records and validate MR scheduling and assigned-on updates.
- Monitor cache entries and MR task status; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should sales rep edits be logged for audit purposes?

---
