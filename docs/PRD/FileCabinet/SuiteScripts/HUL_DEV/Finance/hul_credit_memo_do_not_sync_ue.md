# PRD: Credit Memo Do Not Sync (VersaPay)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20250804-CreditMemoDoNotSync
title: Credit Memo Do Not Sync (VersaPay)
status: Implemented
owner: Jeremy Cady
created: August 4, 2025
last_updated: August 4, 2025

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_credit_memo_do_not_sync_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Credit Memo (transaction)

---

## 1. Overview
A User Event that automatically flags new Credit Memos as "Do Not Sync" with VersaPay when the revenue stream is internal.

---

## 2. Business Goal
Prevent internal revenue stream credit memos from syncing to VersaPay.

---

## 3. User Story
- As a finance user, I want to have internal credit memos excluded from VersaPay so that external syncs remain accurate.
- As an admin, I want to enforce the internal revenue stream rule automatically so that users do not need to remember it.
- As a developer, I want to see logging for revenue stream decisions so that I can troubleshoot behavior.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit (create) | cseg_sna_revenue_st, custbody_versapay_do_not_sync | Revenue stream is in internal list | Set custbody_versapay_do_not_sync = true |

---

## 5. Functional Requirements
- The system must run on Credit Memo create (beforeSubmit).
- The system must read cseg_sna_revenue_st and compare against an internal ID list.
- When the revenue stream is in the internal list, the system must set custbody_versapay_do_not_sync = true.
- When the revenue stream is not in the list, the system must leave the flag unchanged.
- The system must provide logging for audit/debug.

---

## 6. Data Contract
### Record Types Involved
- Credit Memo (transaction)

### Fields Referenced
- cseg_sna_revenue_st
- custbody_versapay_do_not_sync

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Revenue stream is blank or non-numeric: flag unchanged.
- Errors are logged and do not block create.

---

## 8. Implementation Notes (Optional)
- Revenue stream list is hardcoded in the script.
- Runs on Credit Memo create in beforeSubmit.

---

## 9. Acceptance Criteria
- Given an internal revenue stream, when a Credit Memo is created, then custbody_versapay_do_not_sync is set to true.
- Given an external revenue stream, when a Credit Memo is created, then the flag remains unchanged.
- Given a Credit Memo create, when the script runs, then logs show the revenue stream and decision path.
- Given a Credit Memo create, when the script runs, then no errors are thrown.

---

## 10. Testing Notes
- Create a Credit Memo with internal revenue stream and confirm flag set to true.
- Create a Credit Memo with external revenue stream and confirm flag unchanged.
- Verify revenue stream blank or non-numeric leaves flag unchanged.
- Confirm errors are logged without blocking save.

---

## 11. Deployment Notes
- Deploy User Event on Credit Memo.
- Validate with internal/external test memos.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should the revenue stream list be maintained via a custom list or parameter?
- Hardcoded revenue stream IDs become outdated.

---
