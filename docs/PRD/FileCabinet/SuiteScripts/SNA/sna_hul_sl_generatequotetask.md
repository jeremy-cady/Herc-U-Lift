# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GenerateQuoteTaskPDF
title: Generate Quote Per Task PDF Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_generatequotetask.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Estimate
  - Custom Task Code record (`customrecord_quotetaskcodes`)
  - Subsidiary

---

## 1. Overview
A Suitelet that generates a quote PDF grouped by task code using a per-task XML template and logo placeholders.

## 2. Business Goal
Provides a formatted quote document that breaks out estimate lines by task code for clearer review.

## 3. User Story
As a sales rep, when I need a quote per task, I want quote PDFs grouped by task code, so that proposals are easy to understand.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `tranId`, `tranName` | Suitelet request | Render and return PDF |

## 5. Functional Requirements
- The system must accept `tranId` and `tranName` parameters.
- The system must load the estimate record for the provided `tranId`.
- The system must search estimate lines with task codes and group them by task code.
- The system must load task code records tied to the estimate.
- The system must build a print data structure for grouped line items.
- The system must render a PDF using the XML template specified by `custscript_param_quotetaskpdftemplate`.
- The system must inject left and right logos into the template using `custscript_param_qt_rightlogourl` and subsidiary logo.
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
- Script parameters | `custscript_param_quotetaskpdftemplate`, `custscript_param_qt_rightlogourl`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Estimate has no task codes; output should still render.
- Template ID missing; PDF generation fails.
- Record load or search fails; error logged.

## 8. Implementation Notes (Optional)
- Template and logo URLs must be valid.
- Uses XML template replacements for logos and transaction name.

## 9. Acceptance Criteria
- Given an estimate with task codes, when the Suitelet runs, then the PDF renders with grouped task code sections.
- Given template and logos are configured, when the Suitelet runs, then they are applied correctly.
- Given a request, when the Suitelet runs, then the response returns a PDF file inline.

## 10. Testing Notes
- Generate PDF for estimate with task codes and verify output.
- Estimate has no task codes; output should still render.
- Template ID missing; PDF generation fails.
- Record load or search fails; error logged.

## 11. Deployment Notes
- Upload `sna_hul_sl_generatequotetask.js`.
- Set `custscript_param_quotetaskpdftemplate` and `custscript_param_qt_rightlogourl`.
- Validate PDF output.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should quote PDFs per task be saved to the File Cabinet?
- Should task code grouping be optional?
- Risk: Missing template parameter causes failure (Mitigation: Add fallback template or validation)
- Risk: Large estimates slow rendering (Mitigation: Optimize search and data grouping)

---
