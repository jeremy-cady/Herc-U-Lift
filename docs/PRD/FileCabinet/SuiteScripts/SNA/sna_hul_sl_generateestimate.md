# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GenerateEstimatePDF
title: Generate Estimate PDF Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_generateestimate.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Estimate
  - Custom Task Code record (`customrecord_quotetaskcodes`)

---

## 1. Overview
A Suitelet that generates a PDF for an estimate by grouping line items by task code and rendering a template.

## 2. Business Goal
Provides a structured estimate PDF output grouped by task codes with customized branding.

## 3. User Story
As a sales rep, when I need an estimate PDF, I want estimate PDFs grouped by task code, so that proposals are clearer.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `tranId`, `tranName` | Suitelet request | Render and return PDF |

## 5. Functional Requirements
- The system must accept `tranId` and `tranName` parameters.
- The system must load the estimate record and task code records for the estimate.
- The system must search estimate lines with task codes and group them by task code.
- The system must build a print data structure for grouped lines.
- The system must render a PDF using the template specified by `custscript_param_estimatepdftemplate`.
- The system must inject subsidiary logo and right logo into the template.
- The system must return the PDF file inline in the response.

## 6. Data Contract
### Record Types Involved
- Estimate
- Custom Task Code record (`customrecord_quotetaskcodes`)

### Fields Referenced
- Estimate line | `custcol_sna_hul_taskcode`
- Script parameters | `custscript_param_estimatepdftemplate`, `custscript_param_rightlogourl`

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
- Upload `sna_hul_sl_generateestimate.js`.
- Set `custscript_param_estimatepdftemplate` and `custscript_param_rightlogourl`.
- Validate PDF output.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should PDFs be saved to the File Cabinet?
- Should task code grouping be optional?
- Risk: Missing template parameter causes failure (Mitigation: Add fallback template or validation)
- Risk: Large estimates slow rendering (Mitigation: Optimize search and data grouping)

---
