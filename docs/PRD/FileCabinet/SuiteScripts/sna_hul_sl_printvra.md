# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PrintVra
title: Print Vendor Return Authorization
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_printvra.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - vendorreturnauthorization

---

## 1. Overview
Suitelet that renders a Vendor Return Authorization PDF using a configured template.

---

## 2. Business Goal
Provides a printable VRA document without manual template handling.

---

## 3. User Story
- As a procurement user, when I print VRAs, I want to send return documentation to vendors, so that returns are processed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | tranId | `tranId` provided | Render VRA PDF inline |

---

## 5. Functional Requirements
- Accept `tranId` as a request parameter.
- Load the vendor return authorization record.
- Load the template defined by script parameter `custscript_vrapdftemplate`.
- Render and return the PDF inline.

---

## 6. Data Contract
### Record Types Involved
- vendorreturnauthorization

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing `tranId` results in no output.
- Invalid VRA ID logs an error.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Record load and render.

---

## 9. Acceptance Criteria
- Given a VRA record ID, when the Suitelet runs, then the VRA PDF renders from the provided record.
- Given the PDF is returned, when the response is received, then it is inline and viewable in the browser.

---

## 10. Testing Notes
Manual tests:
- VRA ID returns a rendered PDF.
- Missing `tranId` results in no output.
- Invalid VRA ID logs an error.

---

## 11. Deployment Notes
- Template file parameter set.
- Deploy Suitelet.
- Add link/button on VRA.

---

## 12. Open Questions / TBDs
- Should the PDF be saved for audit purposes?

---
