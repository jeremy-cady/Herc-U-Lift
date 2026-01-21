# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-BalanceForward
title: Balance Forward Statement Data
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_balanceforward.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customer
  - transaction

---

## 1. Overview
Suitelet that returns FreeMarker assignments used by the Balance Forward statement template.

---

## 2. Business Goal
Provides aging, invoice, and payment data for statement rendering without embedding search logic in the template.

---

## 3. User Story
- As a billing user, when I generate statements, I want customers to see accurate balances, so that statements are correct.
- As a template developer, when I use precomputed data, I want the template to stay simple, so that rendering is straightforward.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | intCustomer, strDate, statementDate | Statement template invokes Suitelet | Return FreeMarker assignments for balances, aging, payments, and invoices |

---

## 5. Functional Requirements
- Read parameters `intCustomer`, `strDate`, and `statementDate`.
- Compute invoice balance forward from `customsearch_sna_balanceforward_srch_2`.
- Compute payment balance forward from `customsearch_sna_balanceforward_srch_2_4`.
- Return a payment list from `customsearch_sna_balanceforward_srch_2_5`.
- Return aging buckets from `customsearch_sna_agingbalance`.
- Return invoice details from `customsearch_sna_invoicetable_srch`.
- Output FreeMarker assignments for use in a PDF/HTML template.

---

## 6. Data Contract
### Record Types Involved
- customer
- transaction

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Customer with no invoices returns empty arrays and zero balances.
- Date filters limit results correctly.
- Missing parameters return empty FreeMarker assignments.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple saved searches executed per request.

---

## 9. Acceptance Criteria
- Given valid inputs, when the Suitelet runs, then FreeMarker assignments include balances, aging, payments, and invoices.
- Given customer and date inputs, when the Suitelet runs, then data is filtered by customer and date range.

---

## 10. Testing Notes
Manual tests:
- Generate statement data for a customer with invoices and payments.
- Customer with no invoices returns empty arrays and zero balances.
- Date filters limit results correctly.
- Missing parameters return empty FreeMarker assignments.

---

## 11. Deployment Notes
- Saved searches verified.
- Template points to Suitelet.
- Deploy Suitelet.
- Update template or process to call Suitelet.

---

## 12. Open Questions / TBDs
- Should customer deposits be included in balance forward logic?

---
