# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GenerateQuotePDF
title: Generate Quote PDF Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_generatequote.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Estimate
  - Custom Task Code record (`customrecord_quotetaskcodes`)
  - Subsidiary

---

## 1. Overview
A Suitelet that generates a quote PDF by grouping estimate line items by task code and rendering an Advanced PDF/HTML template with logos.

## 2. Business Goal
Provides a formatted quote document grouped by task codes for clearer presentation to customers.

## 3. User Story
As a sales rep, when I need a quote PDF, I want quote PDFs grouped by task code, so that proposals are easy to read.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `tranId`, `tranName` | Suitelet request | Render and return a PDF |

## 5. Functional Requirements
- The system must accept `tranId` and `tranName` parameters.
- The system must load the estimate record for the provided `tranId`.
- The system must search estimate lines with task codes and group them by task code.
- The system must load task code records tied to the estimate.
- The system must build a print data structure for grouped line items.
- The system must render a PDF using the Advanced PDF/HTML template specified by `custscript_param_quote_advpdf_template`.
- The system must inject left and right logos into the template using `custscript_param_quote_rightlogourl` and subsidiary logo.
- The system must return the PDF file inline in the response.

## 6. Data Contract
### Record Types Involved
- Estimate
- Custom Task Code record (`customrecord_quotetaskcodes`)
- Subsidiary

### Fields Referenced
- Estimate line | `custcol_sna_hul_taskcode`
- Task Code record | `custrecord_tc_quoteestimateid`
- Task Code record | `custrecord_tc_taskcode`
- Task Code record | `custrecord_tc_description`
- Script parameters | `custscript_param_quotepdftemplate`, `custscript_param_quote_advpdf_template`, `custscript_param_quote_rightlogourl`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Estimate has no task codes; output should still render.
- Template ID missing; PDF generation fails.
- Record load or search fails; error logged.

## 8. Implementation Notes (Optional)
- XML template replacements for logos and transaction name.

## 9. Acceptance Criteria
- Given an estimate with task codes, when the Suitelet runs, then the PDF renders with grouped task code sections.
- Given template and logos are configured, when the Suitelet runs, then they are applied correctly.
- Given a request, when the Suitelet runs, then the response returns a PDF file inline.

## 10. Testing Notes
- Generate PDF for estimate with task codes and verify output.
- Estimate has no task codes; output still renders.
- Template ID missing; PDF generation fails.
- Record load or search fails; error logged.

## 11. Deployment Notes
- Upload `sna_hul_sl_generatequote.js`.
- Set `custscript_param_quotepdftemplate`, `custscript_param_quote_advpdf_template`, and `custscript_param_quote_rightlogourl`.
- Validate PDF output.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should quote PDFs be saved to the File Cabinet?
- Should task code grouping be optional?
- Risk: Missing template parameter causes failure (Mitigation: Add fallback template or validation)
- Risk: Large estimates slow rendering (Mitigation: Optimize search and data grouping)

---
