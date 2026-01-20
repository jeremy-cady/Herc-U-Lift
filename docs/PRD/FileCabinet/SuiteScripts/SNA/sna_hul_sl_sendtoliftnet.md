# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SendToLiftNet
title: Send to LiftNet Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_sendtoliftnet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Opportunity (transaction)

---

## 1. Overview
A Suitelet that presents a "Send To LiftNet" form, generates an XML payload from an opportunity, and provides buttons to open/configure LiftNet workflows.

## 2. Business Goal
Gives users a guided UI to send opportunity data to LiftNet and run related configurator actions.

## 3. User Story
As a sales rep, when I need to send opportunity data to LiftNet, I want to send opportunity data to LiftNet, so that configurations can be created.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `quote_id`, `param_id`, `estimate_id` | Suitelet request | Render form with XML payload and LiftNet actions |

## 5. Functional Requirements
- The system must accept `quote_id`, `param_id` (transaction ID), and `estimate_id` parameters.
- The system must load LiftNet URL from script parameter `custscript_param_liftneturl`.
- The system must search opportunity data by transaction ID.
- The system must generate a customer XML payload from the opportunity data.
- The system must render a form with salesperson code, MCFA credentials, quote ID, and XML payload.
- The system must attach client script `sna_hul_cs_sendtoliftnet.js`.
- The system must provide buttons to open configurator, process LiftNet configuration, print quote, and download worksheet when a quote ID is present.

## 6. Data Contract
### Record Types Involved
- Opportunity (transaction)

### Fields Referenced
- Opportunity | `custbody_sna_mfr`
- Request parameters | `quote_id`, `param_id`, `estimate_id`
- Script parameter | `custscript_param_liftneturl`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Opportunity not found; XML payload empty and form still renders.
- Missing LiftNet URL parameter; buttons may fail.
- Search fails; error is logged.

## 8. Implementation Notes (Optional)
- XML is constructed manually and may require escaping.
- Client script functions must exist in `sna_hul_cs_sendtoliftnet.js`.

## 9. Acceptance Criteria
- Given valid opportunity data, when the Suitelet runs, then the form renders with required fields and XML payload.
- Given a quote ID, when the Suitelet runs, then buttons invoke client script functions with LiftNet URL.
- Given opportunity data, when the Suitelet runs, then XML payload matches opportunity data.

## 10. Testing Notes
- Open Suitelet with valid opportunity ID and verify XML payload and buttons.
- Opportunity not found; XML payload empty and form still renders.
- Missing LiftNet URL parameter; buttons may fail.
- Search fails; error is logged.

## 11. Deployment Notes
- Upload `sna_hul_sl_sendtoliftnet.js` and `sna_hul_cs_sendtoliftnet.js`.
- Set `custscript_param_liftneturl` for the deployment.
- Validate form actions.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should XML be persisted for audit or re-use?
- Should LiftNet URL be validated in the Suitelet?
- Risk: XML output contains unescaped characters (Mitigation: Escape special characters in XML values)
- Risk: Missing LiftNet URL breaks client actions (Mitigation: Add validation for URL parameter)

---
