# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PrintWarrantyPdf
title: Print Warranty PDF
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_print_wty_pdf.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice

---

## 1. Overview
Suitelet that renders a warranty invoice PDF from an invoice record.

---

## 2. Business Goal
Generates a printable warranty invoice PDF using a dedicated template.

---

## 3. User Story
- As a service user, when I print warranty invoices, I want customers to receive proper documentation, so that warranty handling is clear.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | inv_rec_id | `inv_rec_id` provided | Render warranty invoice PDF and return inline |

---

## 5. Functional Requirements
- Accept `inv_rec_id` as a parameter.
- Load the invoice record.
- Render the PDF using `custtmpl_sna_warranty_invoice_template.xml`.
- Return the PDF inline in the response.

---

## 6. Data Contract
### Record Types Involved
- invoice

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing `inv_rec_id` returns no output.
- Invalid invoice ID logs an error.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Record load and render.

---

## 9. Acceptance Criteria
- Given an invoice record ID, when the Suitelet runs, then the PDF renders from the invoice record.
- Given the PDF is returned, when the response is received, then it is inline and viewable in the browser.

---

## 10. Testing Notes
Manual tests:
- Invoice ID returns a rendered PDF.
- Missing `inv_rec_id` returns no output.
- Invalid invoice ID logs an error.

---

## 11. Deployment Notes
- Template file exists in file cabinet.
- Deploy Suitelet.
- Link to invoice UI button.

---

## 12. Open Questions / TBDs
- Should the PDF be saved to the file cabinet for audit?

---
