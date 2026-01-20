# PRD: Rental Credit Card Required Check (Client Script)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalCreditCardCheckCS
title: Rental Credit Card Required Check (Client Script)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_customer_credit_card_check_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (rental form 121)
  - Customer

---

## 1. Overview
A client script that enforces credit card-on-file requirements for rental sales orders based on terms, with warnings and save blocking.

---

## 2. Business Goal
Prevent rental transactions from proceeding when customer or sales order terms require a credit card but none is on file.

---

## 3. User Story
- As a rental user, I want a warning when a card is required so that I can add one before saving.
- As an admin, I want saves blocked without a card so that policy is enforced.
- As a support user, I want clear prompts so that I know why save failed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | terms, paymentinstruments | Form 121 and customer known | Log instrument types and schedule warning check |
| postSourcing | entity, terms | entity or terms changes | Re-evaluate and warn if required |
| saveRecord | terms, paymentinstruments | Card required and missing | Show warning and block save |

---

## 5. Functional Requirements
- The system must only run on form ID 121.
- The system must treat terms ID 8 as requiring a credit card.
- The system must evaluate requirements based on sales order terms and customer terms if SO terms not required.
- The system must load the customer record and inspect the paymentinstruments sublist.
- A credit card is considered present if instrumenttype is 1 or 3.
- On pageInit, the system must log payment instrument types when a customer is known and schedule a warning check.
- On postSourcing, the system must re-evaluate on entity or terms changes and log payment instruments when entity changes.
- On saveRecord, the system must block save if a card is required and missing.
- Warnings must be displayed using hul_swal with a fallback alert.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (rental form 121)
- Customer

### Fields Referenced
- terms
- paymentinstruments
- instrumenttype

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Form not 121: no checks run.
- Customer has no payment instruments: warning and block on save.
- Load errors fail open and do not block save.

---

## 8. Implementation Notes (Optional)
- Terms requiring credit card are hard-coded.
- Uses hul_swal with native alert fallback.

---

## 9. Acceptance Criteria
- Given required terms and no card, when saving, then save is blocked and a warning is shown.
- Given required terms and a valid card, when saving, then save succeeds.
- Given a customer is known, when pageInit runs, then instrument types are logged.

---

## 10. Testing Notes
- Use form 121 with terms requiring a card and no payment instruments; verify warning and blocked save.
- Use form 121 with a valid card on file; verify save succeeds.
- Use a non-121 form; verify no checks run.

---

## 11. Deployment Notes
- Upload hul_customer_credit_card_check_cs.js.
- Deploy as a client script on rental sales order form ID 121.
- Verify SweetAlert library access.
- Rollback: disable the client script deployment.

---

## 12. Open Questions / TBDs
- Should TERMS_REQUIRE_CC be configurable?
- Should there be server-side enforcement as well?
- Terms ID changes.
- Client-side bypass.

---
