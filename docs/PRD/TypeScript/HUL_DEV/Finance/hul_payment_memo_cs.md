# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_payment_memo_cs
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: client
  file: TypeScript/HUL_DEV/Finance/hul_payment_memo_cs.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
Client script that auto-populates a payment memo field based on the selected payment option.

---

## 2. Business Goal
Automatically set a payment memo based on payment option selection.

---

## 3. User Story
As a user, when I select a payment option, I want the payment memo to populate automatically, so that the memo matches the payment method.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | paymentoption | paymentoption changes | Set custbody_hul_payment_memo based on payment method lookup |

---

## 5. Functional Requirements
- On fieldChanged for paymentoption, read the selected payment instrument ID.
- Use SuiteQL to map payment instrument to payment method.
- Build a memo based on payment method:
  - Static memo values for specific methods (cash/check/terminals/etc.).
  - Memo lookup on related records for card/token/ACH methods.
- Set custbody_hul_payment_memo to the derived memo text.
- Wrap fieldChanged logic in try/catch and log errors.
- Other client script entry points are defined but empty.

---

## 6. Data Contract
### Record Types Involved
- paymentInstrument
- paymentCard
- paymentCardToken
- generalToken
- AutomatedClearingHouse

### Fields Referenced
- paymentoption
- custbody_hul_payment_memo
- paymentInstrument.paymentmethod
- paymentCard.memo
- paymentCardToken.memo
- generalToken.memo
- AutomatedClearingHouse.memo

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No validation if SuiteQL returns no rows; memo may be undefined.

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
- Record type for the transaction with paymentoption
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
