# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-BalanceForwardConsolidated
title: Balance Forward Consolidated Statement Data
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_balanceforward_consolidated.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customer
  - transaction

---

## 1. Overview
Suitelet that returns FreeMarker assignments for consolidated customer statements across child customers.

---

## 2. Business Goal
Generates consolidated statement data without embedding search logic in the template.

---

## 3. User Story
- As a billing user, when I generate consolidated statements, I want parent customers to see total exposure, so that balances are visible.
- As a template developer, when I use Suitelet data, I want the template to remain simple, so that rendering is straightforward.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | intCustomer, strDate, statementDate | Consolidated statement template invokes Suitelet | Return FreeMarker assignments for consolidated balances, aging, and lists |

---

## 5. Functional Requirements
- Read parameters `intCustomer`, `strDate`, and `statementDate`.
- Look up the customer name for consolidated filtering.
- Compute invoice and payment balance forward using consolidated saved searches.
- Return payment and invoice lists based on consolidated filters.
- Return aging buckets for consolidated balances.
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
- Parent customer has no child transactions; returns empty lists.
- Date filters limit results correctly.
- Missing parameters result in no data output.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple searches per request and runtime formula filters on parent name.

---

## 9. Acceptance Criteria
- Given valid inputs, when the Suitelet runs, then output includes balances, aging, and lists for consolidated data.
- Given parent customer identification, when the Suitelet runs, then filters use parent customer identification correctly.

---

## 10. Testing Notes
Manual tests:
- Generate consolidated statement data for a parent customer with child activity.
- Parent customer has no child transactions; returns empty lists.
- Date filters limit results correctly.
- Missing parameters result in no data output.

---

## 11. Deployment Notes
- Saved searches verified.
- Template points to Suitelet.
- Deploy Suitelet.
- Update consolidated template to call Suitelet.

---

## 12. Open Questions / TBDs
- Should consolidation be based on internal ID rather than name?

---
