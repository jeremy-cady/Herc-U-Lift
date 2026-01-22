# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_sync_invoices_daily_ss
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: TypeScript/HUL_DEV/Finance/hul_sync_invoices_daily_ss.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice

---

## 1. Overview
Scheduled script that unchecks "Do Not Sync to Versapay" on invoices created today when the Revenue Stream is in an external allowlist, then emails a summary.

---

## 2. Business Goal
Automatically enable syncing for today’s invoices with approved Revenue Streams and report the results.

---

## 3. User Story
As a user, when the daily job runs, I want qualifying invoices to have "Do Not Sync to Versapay" unchecked and receive a summary, so that approved invoices can sync.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled (daily) | cseg_sna_revenue_st | Invoice created today and Revenue Stream in revStreamExternalValues | Set custbody_versapay_do_not_sync = false |

---

## 5. Functional Requirements
- Run a SuiteQL query for invoices created today using a UTC day window (TRUNC(CURRENT_DATE) to TRUNC(CURRENT_DATE)+1).
- For each invoice:
  - If Revenue Stream is blank/invalid, track as noRevStream.
  - If Revenue Stream is in revStreamExternalValues, set custbody_versapay_do_not_sync to false.
  - Otherwise, track as skipped.
- Send a summary email to the current user including updates, skips, missing Revenue Streams, and errors.
- Log audit details and errors.
- Collect per-record submit errors; log and continue.
- Log fatal errors and rethrow.

---

## 6. Data Contract
### Record Types Involved
- Invoice (transaction CustInvc)

### Fields Referenced
- custbody_versapay_do_not_sync
- cseg_sna_revenue_st
- createddate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Date window is based on createddate in UTC.
- Revenue Stream blank or invalid is tracked as noRevStream.

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
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
