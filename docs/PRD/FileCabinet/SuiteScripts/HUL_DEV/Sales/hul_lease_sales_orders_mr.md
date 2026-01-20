# PRD: Lease Sales Orders Dataset Builder (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LeaseSalesOrdersMR
title: Lease Sales Orders Dataset Builder (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A Map/Reduce script that builds a JSON dataset of active lease sales orders and stores it in the File Cabinet for a Suitelet UI to consume.

---

## 2. Business Goal
Generate a consistent dataset for a Lease Sales Order viewer, with deterministic file IDs and reduced reliance on file searches.

---

## 3. User Story
- As a user, I want a current lease dataset so that I can view lease order details in the Suitelet.
- As an admin, I want deterministic file retrieval so that the Suitelet doesn’t rely on file searches.
- As a developer, I want the dataset built via Map/Reduce so that it scales safely.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_hul_output_folder, custscript_hul_run_token | Active lease sales orders | Build JSON dataset, write file, cache file ID |

---

## 5. Functional Requirements
- The system must search Sales Orders with type = SalesOrd, mainline = T, cseg_sna_revenue_st = 441, and status != SalesOrd:C.
- For each order, the system must collect internalid, tranid, trandate, entity, memo, custbody1, total, location, firstBillDate, lastBillDate.
- The system must normalize billing dates to YYYY-MM-DD.
- The system must output one JSON record per sales order and collect results in summarize.
- The system must write the dataset to a JSON file in the File Cabinet folder specified by custscript_hul_output_folder.
- The system must store the new file ID in cache: cache name hul_dataset_runs, key run_<token>.
- The token must come from custscript_hul_run_token (or timestamp fallback).
- Errors must be logged during map/reduce/summarize.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- type
- mainline
- cseg_sna_revenue_st
- status
- internalid
- tranid
- trandate
- entity
- memo
- custbody1
- total
- location
- billingschedule
- custscript_hul_output_folder
- custscript_hul_run_token

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No output folder parameter: script logs error and exits.
- Billing schedule missing: dates remain null.
- Map/reduce errors logged in summarize.

---

## 8. Implementation Notes (Optional)
- Billing schedule retrieval handles sublist and value array formats.

---

## 9. Acceptance Criteria
- Given active lease sales orders, when the script runs, then a JSON dataset is created.
- Given a valid output folder, when the script runs, then the JSON file is saved in that folder.
- Given a run token, when the script completes, then the cache entry stores the correct file ID.
- Given billing dates, when present, then they are normalized to YYYY-MM-DD.

---

## 10. Testing Notes
- Run MR with valid output folder and token and confirm file creation and cache entry.
- Run with missing output folder and confirm error logged.
- Verify billing schedule missing results in null dates.

---

## 11. Deployment Notes
- Upload hul_lease_sales_orders_mr.js.
- Create Map/Reduce script record.
- Configure custscript_hul_output_folder and optional custscript_hul_run_token.
- Rollback: disable Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should dataset retention be managed (purge old files)?
- Should search filters be configurable?
- Output folder not configured.
- Large order volume.

---
