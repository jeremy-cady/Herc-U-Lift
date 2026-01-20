# PRD: Versapay Daily Invoice Sync Reset
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VersapayDailyUncheck
title: Versapay Daily Invoice Sync Reset
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_sync_invoices_daily_ss.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice (transaction)

---

## 1. Overview
A nightly scheduled script that unchecks the VersaPay "Do Not Sync" flag on invoices created today when the revenue stream is external, then emails a summary.

---

## 2. Business Goal
Ensure newly created external-revenue invoices are eligible to sync to VersaPay while keeping internal revenue invoices excluded.

---

## 3. User Story
- As a finance user, I want to have external invoices automatically eligible for VersaPay sync so that daily sync is accurate.
- As an admin, I want to receive a summary email so that I can audit the changes.
- As a developer, I want to avoid touching internal invoices so that integrations remain correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled (nightly) | createddate, cseg_sna_revenue_st, custbody_versapay_do_not_sync | Invoice created today and revenue stream is external | Set custbody_versapay_do_not_sync = false and email summary |

---

## 5. Functional Requirements
- The system must run as a Scheduled Script.
- The system must query invoices by createddate for the current day.
- The system must check cseg_sna_revenue_st against the external list.
- For external streams, the system must set custbody_versapay_do_not_sync to false.
- For non-external streams, the system must skip updates.
- The system must send a summary email to the current user.

---

## 6. Data Contract
### Record Types Involved
- Invoice (transaction)

### Fields Referenced
- createddate
- cseg_sna_revenue_st
- custbody_versapay_do_not_sync

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Invoice without revenue stream is counted in no-revstream.
- Internal revenue stream invoice is skipped.
- submitFields failure logs error and continues.

---

## 8. Implementation Notes (Optional)
- External revenue stream list is hardcoded.
- Uses created date (UTC truncation).

---

## 9. Acceptance Criteria
- Given an external revenue stream invoice created today, when the script runs, then the invoice is updated.
- Given an internal or unknown revenue stream invoice created today, when the script runs, then it is not updated.
- Given a run, when the summary email is sent, then it includes counts for updated/skipped/no-revstream/errors.
- Given an error, when it occurs, then it is logged without stopping the script.

---

## 10. Testing Notes
- Create an external invoice today and confirm the flag is cleared by the script.
- Create an invoice without revenue stream and confirm it is counted in no-revstream.
- Create an internal revenue stream invoice and confirm it is skipped.
- Verify submitFields failures are logged and processing continues.

---

## 11. Deployment Notes
- Deploy scheduled script and schedule nightly execution.
- Monitor summary email for errors.
- Rollback: disable the scheduled script deployment.

---

## 12. Open Questions / TBDs
- Should recipients be configurable rather than current user?
- Hardcoded external revenue stream list becomes outdated.

---
