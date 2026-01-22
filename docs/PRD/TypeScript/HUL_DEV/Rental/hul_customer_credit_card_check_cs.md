# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_customer_credit_card_check_cs
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: client
  file: TypeScript/HUL_DEV/Rental/hul_customer_credit_card_check_cs.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Customer

---

## 1. Overview
Client Script that warns and blocks Sales Orders when a customer with specific terms does not have a credit card on file.

---

## 2. Business Goal
Prevent Sales Orders that require a credit card from being saved when no card is on file.

---

## 3. User Story
As a user, when I create a Sales Order with terms that require a credit card, I want a warning and the save blocked if no card exists, so that required payment info is captured.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | TBD | Page initializes | Initialize state and listeners |
| postSourcing | entity, terms | Entity or terms sourced | Re-evaluate credit card requirement and warn if missing |
| saveRecord | entity, terms | Credit card required and missing | Show warning and block save |

---

## 5. Functional Requirements
- Apply only on form ID 121.
- Determine whether terms require a credit card (terms in ['8']).
  - If Sales Order terms don’t require it, use the customer’s terms.
- If a card is required, validate that the customer has at least one payment instrument of type 1 or 3.
- Show a warning message once when a missing card is detected.
- Block save with a warning if missing at save time.
- Log all payment instrument instrumenttype values when a customer is known.
- Use debounced logging to avoid UI storms (250ms).
- Use hul_swal to show the message, falling back to alert.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Customer

### Fields Referenced
- entity
- terms
- customer terms field (ID TBD)
- payment instrument instrumenttype

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Warning is shown once per missing-card detection.

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
- Customer terms field ID
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
