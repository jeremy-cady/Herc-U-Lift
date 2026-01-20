# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GenerateMiscFeePDF
title: Generate Invoice PDF (Misc Fee) Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_generate_misc_fee_print_pdf.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - File

---

## 1. Overview
A Suitelet that generates a PDF from invoice JSON data and a specified template, then saves and redirects to the PDF file.

## 2. Business Goal
Allows users to generate and view invoice PDFs (including misc fee invoices) using customizable templates.

## 3. User Story
As a billing user, when I need an invoice PDF, I want to generate invoice PDFs, so that I can share them with customers.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `custpage_inv_json_format`, `custpage_template_id` | Suitelet request | Render form with hidden fields |
| POST | `custpage_inv_json_format`, `custpage_template_id` | Suitelet request | Render and save PDF, then redirect to file URL |

## 5. Functional Requirements
- The system must display a Suitelet form with hidden fields for invoice JSON and template ID on GET.
- The system must accept `custpage_inv_json_format` and `custpage_template_id` on POST.
- The system must default the template to `sna_hul_service_invoice_template.xml` when not provided.
- The system must load the template from `./TEMPLATES/`.
- The system must render a PDF using `render.create()` and the invoice JSON data.
- The system must save the PDF to the folder specified by `custscript_invoice_folder`.
- The system must redirect the user to the PDF file URL after saving.

## 6. Data Contract
### Record Types Involved
- File

### Fields Referenced
- Script parameter `custscript_invoice_folder`
- `custpage_inv_json_format`
- `custpage_template_id`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing template ID uses default template.
- Missing JSON aborts processing.
- Template file missing; error logged and request fails.

## 8. Implementation Notes (Optional)
- Invoice JSON is passed as a string and cleaned for control characters.
- Template ID must exist in the `TEMPLATES` directory.

## 9. Acceptance Criteria
- Given a GET request, when the Suitelet runs, then the form with hidden fields is rendered.
- Given a POST request, when the Suitelet runs, then a PDF is saved in the target folder.
- Given a successful POST, when the Suitelet runs, then the user is redirected to the PDF file URL.

## 10. Testing Notes
- Submit valid invoice JSON and template ID; PDF renders and opens.
- Missing template ID uses default template.
- Missing JSON aborts processing.
- Template file missing; error logged and request fails.

## 11. Deployment Notes
- Upload `sna_hul_sl_generate_misc_fee_print_pdf.js`.
- Deploy the Suitelet and set `custscript_invoice_folder`.
- Validate PDF generation via client script.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the Suitelet attach the PDF to the invoice record?
- Should the template be selectable in the UI?
- Risk: Missing template file causes failure (Mitigation: Validate template IDs before use)
- Risk: Large JSON payload affects performance (Mitigation: Limit payload size or compress)

---
