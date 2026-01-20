# PRD: Payment Memo Auto-Fill
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20250428-PaymentMemo
title: Payment Memo Auto-Fill
status: Implemented
owner: Jeremy Cady
created: April 28, 2025
last_updated: April 28, 2025

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_payment_memo_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Payment Card Token (paymentCardToken)

---

## 1. Overview
A Client Script that auto-fills a payment memo field when a payment instrument is selected.

---

## 2. Business Goal
Users need the payment card memo surfaced on the transaction without manually looking up the token record.

---

## 3. User Story
- As a finance user, I want to see the payment token memo auto-filled so that I do not have to look it up.
- As an admin, I want to ensure memo data is consistent so that payment reviews are accurate.
- As a developer, I want to limit logic to a single field change so that performance stays fast.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | paymentoption | Payment instrument selected | Query paymentCardToken memo and set custbody_hul_payment_memo |

---

## 5. Functional Requirements
- The system must listen for fieldChanged on paymentoption.
- The system must query paymentCardToken by selected ID to fetch memo.
- The system must set custbody_hul_payment_memo when a memo is returned.
- The system must log errors if SuiteQL fails.

---

## 6. Data Contract
### Record Types Involved
- Payment Card Token (paymentCardToken)

### Fields Referenced
- paymentoption
- memo
- custbody_hul_payment_memo

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Payment option is blank: no action.
- Token has no memo: memo remains unchanged.
- SuiteQL error is logged and does not interrupt the UI.

---

## 8. Implementation Notes (Optional)
- Uses SuiteQL from the client context.

---

## 9. Acceptance Criteria
- Given a payment instrument selection, when paymentoption changes, then custbody_hul_payment_memo is populated.
- Given no memo returned, when paymentoption changes, then no change occurs.
- Given a SuiteQL error, when the lookup fails, then the error is logged without blocking the user.

---

## 10. Testing Notes
- Select a payment instrument with a memo and confirm the memo field populates.
- Select a blank payment option and confirm no action.
- Select a token with no memo and confirm the memo remains unchanged.
- Verify SuiteQL errors are logged without interrupting the UI.

---

## 11. Deployment Notes
- Deploy client script on the relevant transaction form.
- Validate memo population in sandbox.
- Rollback: remove client script from the form.

---

## 12. Open Questions / TBDs
- Should this be moved server-side for stricter control?
- SuiteQL access restricted in client context.

---
