# PRD: Commission Backfill for Sales Orders (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CommissionBackfillMR
title: Commission Backfill for Sales Orders (Map/Reduce)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_update_2025_so_for_commission_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A Map/Reduce script that processes sales orders from a saved search and marks them as processed for commission, triggering the commission User Event on edit.

---

## 2. Business Goal
Backfill commission processing for historical sales orders by programmatically toggling the processed flag.

---

## 3. User Story
- As an admin, I want to backfill commission processing so that historical orders are handled.
- As a finance user, I want the commission UE to run so that payouts are correct.
- As a developer, I want a batch process so that many orders can be updated safely.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | customsearch_hul_commission_backfill, custbody_hul_processed_for_commission | Orders in saved search | Set processed flag and save order |

---

## 5. Functional Requirements
- The system must load the saved search customsearch_hul_commission_backfill.
- For each sales order, the system must load the record and check custbody_hul_processed_for_commission.
- The system must skip orders already marked true.
- The system must set custbody_hul_processed_for_commission to true and save the record.
- The system must log audit entries for processed records and debug entries for skipped ones.
- Errors must be logged per sales order.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- custbody_hul_processed_for_commission
- customsearch_hul_commission_backfill

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Saved search empty: no updates.
- Record load fails: error logged and continue.
- Map errors logged in summarize.

---

## 8. Implementation Notes (Optional)
- Saved search ID is hard-coded in script.

---

## 9. Acceptance Criteria
- Given orders in the saved search, when processed, then unprocessed orders are flagged and saved.
- Given processed orders, when encountered, then they are skipped.
- Given errors, when they occur, then they are logged without halting the run.

---

## 10. Testing Notes
- Run MR with mixed processed/unprocessed orders and confirm behavior.
- Run MR with an empty search and confirm no updates.
- Verify load errors are logged and script continues.

---

## 11. Deployment Notes
- Upload hul_update_2025_so_for_commission_mr.js.
- Create Map/Reduce script record.
- Verify saved search ID and permissions.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the saved search ID be parameterized?
- Should processed records be tracked in a log file?
- Saved search ID changes.
- Large order volume.

---
