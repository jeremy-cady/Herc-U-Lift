# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreatePrintButtons
title: Quote and Estimate Print Buttons (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_createprintbuttons.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Estimate

---

## 1. Overview
A User Event that adds print buttons on estimate records based on the selected custom form to generate quote and estimate PDFs.

## 2. Business Goal
Provides quick access to Suitelet-driven PDF generation for specific estimate forms.

## 3. User Story
As a sales user, when viewing an estimate, I want print buttons on estimates, so that I can generate PDFs quickly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | `customform` | Estimate view mode | Add appropriate print buttons and open Suitelet URLs |

## 5. Functional Requirements
- The system must detect the current estimate custom form.
- For custom form `111` (Parts Quote), the system must add buttons to generate quote and estimate PDFs.
- For custom form `105` (Service Estimate), the system must add buttons to generate quote per task and quote summary PDFs.
- The system must open Suitelet URLs with `tranId` and `tranName` parameters in a new window.

## 6. Data Contract
### Record Types Involved
- Estimate

### Fields Referenced
- Estimate | `customform`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Other custom forms should not display buttons.
- Suitelet URL resolution fails; errors are logged.

## 8. Implementation Notes (Optional)
- Buttons only appear in view mode.
- Custom form IDs are hardcoded (105 and 111).

## 9. Acceptance Criteria
- Given the correct custom form, when the record is viewed, then the appropriate buttons appear.
- Given a button click, when the action runs, then the Suitelet opens in a new window.
- Given other custom forms, when the record is viewed, then no buttons appear.

## 10. Testing Notes
- Open Parts Quote estimate and verify Generate Quote/Estimate buttons.
- Open Service Estimate and verify per task/summary buttons.
- Other custom forms should not display buttons.
- Suitelet URL resolution fails; errors are logged.

## 11. Deployment Notes
- Upload `sna_hul_ue_createprintbuttons.js`.
- Deploy User Event on estimates.
- Verify Suitelet deployments are active.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should custom form IDs be moved to script parameters?
- Should buttons appear in edit mode as well?
- Risk: Custom form IDs change in production (Mitigation: Move IDs to parameters)
- Risk: Suitelet deployment missing breaks buttons (Mitigation: Add validation or user-facing warning)

---
