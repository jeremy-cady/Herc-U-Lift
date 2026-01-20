# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PrintInvoice
title: Invoice Item List Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sn_hul_sl_print_invoice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice (transaction)

---

## 1. Overview
A Suitelet that returns an item list from an invoice search as a FreeMarker assignment string.

---

## 2. Business Goal
Provide a data payload for templates or integrations that need invoice line item details in a preformatted FreeMarker variable.

---

## 3. User Story
As a report/template developer, when I request an invoice item list, I want a FreeMarker assignment string returned, so that I can render custom PDFs.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | recid | recid provided | Search invoice lines and return `<#assign itemList=.../>` |

---

## 5. Functional Requirements
- Accept `recid` as a request parameter.
- Search invoice lines excluding tax, shipping, mainline, and do-not-print lines.
- Return an assignment string with item details: make, model, serial, fleet code, start/end date, amount, tax amount.

---

## 6. Data Contract
### Record Types Involved
- Invoice (transaction)

### Fields Referenced
- Transaction line | custcol_sna_do_not_print
- Transaction line | custcol_sna_hul_fleet_no
- Transaction line | custcol_sna_object
- Transaction line | custcol_ava_taxamount
- Request parameter | recid

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No invoice lines match filters; list is empty.
- Handles up to 1000 grouped results.

---

## 8. Implementation Notes (Optional)
- Uses summary search grouping and hardcoded formula columns.

---

## 9. Acceptance Criteria
- Given a valid invoice ID, when the Suitelet runs, then the response contains a FreeMarker assignment of line data.
- Given lines flagged as do-not-print, when the Suitelet runs, then those lines are excluded.

---

## 10. Testing Notes
- Call Suitelet with valid invoice ID; verify response string.
- Invoice with no matching lines; verify empty list.

---

## 11. Deployment Notes
- Upload `sn_hul_sl_print_invoice.js`.
- Deploy Suitelet and test with a sample invoice.
- Rollback: disable Suitelet deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the Suitelet support paging beyond 1000 results?
- Risk: Large invoices exceed 1000 groups.

---
