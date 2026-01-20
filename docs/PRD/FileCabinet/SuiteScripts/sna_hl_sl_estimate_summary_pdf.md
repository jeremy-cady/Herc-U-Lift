# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-EstimateSummaryPDF
title: Service Quote Summary PDF Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hl_sl_estimate_summary_pdf.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Estimate
  - Custom Task Code (customrecord_quotetaskcodes)

---

## 1. Overview
A Suitelet that generates a Service Quote Summary PDF for an estimate by grouping line items by task code.

---

## 2. Business Goal
Provide a summary PDF for service quotes with grouped task code sections.

---

## 3. User Story
As a service user, when I request a quote summary, I want a grouped PDF, so that I can share a clean summary.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | tranId | tranId provided | Load estimate, group lines by task code, render PDF |

---

## 5. Functional Requirements
- Accept `tranId` as a request parameter.
- Load the estimate and task code records.
- Group line items by task code and build a print data structure.
- Render a PDF using XML template file ID `2069`.
- Return the PDF inline in the response.

---

## 6. Data Contract
### Record Types Involved
- Estimate
- Custom Task Code (customrecord_quotetaskcodes)

### Fields Referenced
- Estimate line | custcol_sna_hul_taskcode
- Request parameter | tranId

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Estimate has no task codes; PDF still renders.

---

## 8. Implementation Notes (Optional)
- Uses hardcoded template file ID `2069`.

---

## 9. Acceptance Criteria
- Given an estimate with task codes, when the Suitelet runs, then the PDF renders with grouped task code sections.
- Given a valid request, when the Suitelet runs, then the response returns a PDF inline.

---

## 10. Testing Notes
- Generate summary PDF for estimate with task codes.
- Estimate with no task codes; verify PDF renders.

---

## 11. Deployment Notes
- Upload `sna_hl_sl_estimate_summary_pdf.js`.
- Deploy Suitelet and validate output.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should template ID be a script parameter?
- Risk: Hardcoded template ID changes.

---
