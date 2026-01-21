# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ConsolidatedStatement
title: Consolidated Customer Statement
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_consolidated_statement.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customer
  - companyinformation
  - transaction

---

## 1. Overview
Suitelet that generates a consolidated customer statement PDF for parent customers.

---

## 2. Business Goal
Creates a consolidated statement without manual PDF assembly by pulling balances, invoices, and payments.

---

## 3. User Story
- As a billing user, when I generate consolidated statements, I want parent customers to see total balances, so that exposure is visible.
- As a finance user, when I download the PDF, I want to distribute statements, so that customers receive them.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | statement date, start date, customer | Form submitted | Render and save consolidated statement PDF and redirect to file URL |

---

## 5. Functional Requirements
- Display a form to select statement date, optional start date, and customer.
- List parent customers with non-zero consolidated balance.
- Load customer and company address data on submit.
- Retrieve consolidated balance, aging, invoice, and payment data via saved searches.
- Render a PDF from `sna_hul_consolidated_customer_statement.xml`.
- Save the PDF to folder ID 1570401 and redirect to the file URL.

---

## 6. Data Contract
### Record Types Involved
- customer
- companyinformation
- transaction

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Customer with no balances still renders empty tables.
- Missing start date defaults to full history.
- Template not found should log an error and stop.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple saved searches and record loads.

---

## 9. Acceptance Criteria
- Given a selected customer and date range, when the Suitelet runs, then a PDF is generated.
- Given consolidated searches, when the PDF renders, then balances and detail lines are included.
- Given the file is saved, when the Suitelet completes, then the user is redirected to the PDF.

---

## 10. Testing Notes
Manual tests:
- Parent customer with balance generates PDF.
- Customer with no balances still renders empty tables.
- Missing start date defaults to full history.
- Template not found should log an error and stop.

---

## 11. Deployment Notes
- Template exists in file cabinet.
- Output folder ID validated.
- Deploy Suitelet.
- Provide access to billing roles.

---

## 12. Open Questions / TBDs
- Should output folder be configurable via parameter?

---
