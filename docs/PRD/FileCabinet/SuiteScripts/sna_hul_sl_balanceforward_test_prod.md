# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-BalanceForwardTestProd
title: Balance Forward Test Prod
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_balanceforward_test_prod.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customer
  - transaction

---

## 1. Overview
Suitelet that returns FreeMarker assignments for balance forward statement data in a test/prod context.

---

## 2. Business Goal
Provides statement templates with balances, aging, invoice details, and payment details without embedding search logic in the template.

---

## 3. User Story
- As a billing user, when I generate accurate statements, I want customer balances to be correct, so that statements are reliable.
- As a template developer, when I consume precomputed data, I want the template to remain simple, so that rendering is straightforward.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | intCustomer, strDate, statementDate | Template or script invokes Suitelet | Return FreeMarker assignments for balances, aging, payments, and invoices |

---

## 5. Functional Requirements
- Accept `intCustomer`, `strDate`, and `statementDate` request parameters.
- Compute invoice balance forward using `customsearch_sna_balanceforward_srch_2`.
- Compute payment balance forward using `customsearch_sna_balanceforward_srch_2_4`.
- Return payments from `customsearch_sna_balanceforward_srch_2_5`.
- Return aging buckets from `customsearch_sna_agingbalance_3_2`.
- Return invoices from `customsearch_sna_invoicetable_srch`.
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
- Customer with no activity returns empty arrays and zero balances.
- Date filters constrain results correctly.
- Missing parameters return empty FreeMarker assignments.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple searches per request.

---

## 9. Acceptance Criteria
- Given valid parameters, when the Suitelet runs, then assignments include balance forward totals, aging buckets, and arrays for payments/invoices.
- Given customer and date parameters, when the Suitelet runs, then searches are filtered by those parameters.

---

## 10. Testing Notes
Manual tests:
- Customer with invoices and payments returns populated arrays.
- Customer with no activity returns empty arrays and zero balances.
- Date filters constrain results correctly.
- Missing parameters return empty FreeMarker assignments.

---

## 11. Deployment Notes
- Verify saved searches.
- Confirm template caller uses Suitelet.
- Deploy Suitelet.
- Update template or process to call Suitelet.

---

## 12. Open Questions / TBDs
- Should customer deposits be included in the balance forward logic?

---
