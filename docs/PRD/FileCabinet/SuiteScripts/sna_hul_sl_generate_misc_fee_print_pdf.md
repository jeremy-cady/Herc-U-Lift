# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GenerateMiscFeePrintPdf
title: Generate Misc Fee Print PDF
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_generate_misc_fee_print_pdf.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - file

---

## 1. Overview
Suitelet that renders a PDF from invoice or sales order JSON using a template.

---

## 2. Business Goal
Creates a printable PDF for service invoices or sales orders without manual rendering.

---

## 3. User Story
- As a user, when I generate a PDF from transaction data, I want to print or share it, so that documents are distributed.
- As a developer, when I use templates, I want PDF layout to be consistent, so that output is standardized.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | custpage_inv_json_format | JSON provided | Select template, render PDF, save to folder, and redirect |

---

## 5. Functional Requirements
- Accept JSON data in `custpage_inv_json_format`.
- Select a template based on the presence of `internalid` in the JSON.
- Load the template from `./TEMPLATES/`.
- Render the PDF and save it to the folder specified by `custscript_invoice_folder`.
- Redirect the user to the saved PDF.

---

## 6. Data Contract
### Record Types Involved
- file

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing template ID defaults to invoice template.
- Invalid JSON stops processing without saving a file.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: File load/render/save per request.

---

## 9. Acceptance Criteria
- Given invoice or sales order JSON, when the Suitelet runs, then the correct template is selected.
- Given valid JSON, when the Suitelet runs, then the PDF is created and saved to the target folder.
- Given the PDF is saved, when the Suitelet completes, then the user is redirected to the PDF file.

---

## 10. Testing Notes
Manual tests:
- Invoice JSON renders invoice template PDF.
- Sales order JSON renders sales order template PDF.
- Missing template ID defaults to invoice template.
- Invalid JSON stops processing without saving a file.

---

## 11. Deployment Notes
- Template files exist.
- Output folder parameter configured.
- Deploy Suitelet.
- Link to transaction UI or button.

---

## 12. Open Questions / TBDs
- Should the folder parameter be required instead of optional?

---
