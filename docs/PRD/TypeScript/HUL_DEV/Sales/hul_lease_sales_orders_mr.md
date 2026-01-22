# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_lease_sales_orders_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Sales/hul_lease_sales_orders_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
Map/Reduce script that builds a Lease Sales Orders dataset JSON file for the Suitelet to consume.

---

## 2. Business Goal
Provide a dataset for Lease Sales Orders reporting and UI consumption.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want a Lease Sales Orders dataset generated, so that the Suitelet can display and export it.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | TBD | Run for lease Sales Orders dataset | Build JSON file and cache file ID |

---

## 5. Functional Requirements
- Parameters:
  - custscript_hul_output_folder: File Cabinet folder internal ID for dataset JSON.
  - custscript_hul_run_token: Optional token for output filename and cache key (fallback to timestamp).
- getInputData: Search Sales Orders where:
  - type = SalesOrd
  - mainline = T
  - cseg_sna_revenue_st = 441
  - status != SalesOrd:C
- map:
  - Load each Sales Order to read total, location, and billing schedule dates.
  - Attempt billing schedule dates from billingschedule field; fallback to billing schedule sublist.
  - Normalize dates to YYYY-MM-DD.
  - Emit row JSON.
- reduce: Pass through the JSON row.
- summarize:
  - Collect rows into an array and write JSON file named hul_lease_so_dataset_<token>.json.
  - Save file in target folder.
  - Write saved file ID to cache key run_<token> in cache hul_dataset_runs (TTL 1 hour).
  - Log usage stats and errors from each stage.
- Output row fields: id, tranid, trandate, customer, memo, custbody1, total, location, firstBillDate, lastBillDate.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- cseg_sna_revenue_st
- status
- mainline
- tranid
- trandate
- entity/customer
- memo
- custbody1
- total
- location
- billingschedule
- Billing schedule sublist dates (field IDs TBD)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Billing schedule dates may be sourced from field or sublist.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Billing schedule sublist field IDs
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
