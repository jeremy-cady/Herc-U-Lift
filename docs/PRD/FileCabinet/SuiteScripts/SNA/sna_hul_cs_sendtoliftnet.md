# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LiftNetCS
title: LiftNet Quote Integration (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_sendtoliftnet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Opportunity/Estimate
  - Item (inventory and non-inventory)

---

## 1. Overview
A client script that integrates NetSuite estimates/opportunities with LiftNet by creating or updating quotes, launching the configurator, and importing quote results.

## 2. Business Goal
Automates the LiftNet quote workflow from NetSuite, including item creation, estimate generation, and quote document actions.

## 3. User Story
As a sales rep, when I need to configure a quote, I want to launch LiftNet from NetSuite, so that I can configure quotes quickly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | TBD | TBD | Hide the standard UI table block |
| TBD | TBD | LiftNet quote actions invoked | Create/update LiftNet quote, launch configurator, or import quote results |

## 5. Functional Requirements
- The system must hide the standard UI table block on page init.
- The system must resolve and open the LiftNet Suitelet for sending quotes (`customscript_sna_hul_sl_sendtoliftnet`).
- The system must send email quotes via Suitelet (`customscript_sna_hul_sl_sendquoteviaemai`).
- The system must create or update LiftNet quotes via LiftNet API endpoints using credentials and XML payloads.
- The system must launch the LiftNet configurator using the quote ID.
- The system must retrieve LiftNet quote data and parse XML into JSON.
- The system must search for or create NetSuite items based on LiftNet quote lines.
- The system must create or update an estimate from the opportunity and add quote items.
- The system must support printing quote documents and worksheets from LiftNet.

## 6. Data Contract
### Record Types Involved
- Opportunity/Estimate
- Item (inventory and non-inventory)

### Fields Referenced
- Opportunity/Estimate | `custbody_liftnetquoteid`
- Custom page fields | `custpage_quoteid`, `custpage_salespersoncode`, `custpage_mcfausername`, `custpage_mcfapassword`, `custpage_customerapiinformation`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- LiftNet API returns empty response.
- Item creation fails or item already exists.
- LiftNet request errors show alerts and halt processing.

## 8. Implementation Notes (Optional)
- Uses client-side HTTPS requests to external LiftNet endpoints.
- Includes XML-to-JSON conversion logic in the client script.

## 9. Acceptance Criteria
- Given LiftNet quote creation, when the action runs, then a quote ID is returned and saved to NetSuite.
- Given a quote ID, when the configurator is launched, then it opens for the provided quote ID.
- Given LiftNet quote data, when it is imported, then items are created or selected and the estimate is updated.
- Given print actions, when they run, then LiftNet quote and worksheet documents open.

## 10. Testing Notes
- Create LiftNet quote and store quote ID on opportunity.
- Retrieve quote and create/update estimate with items.
- Print quote and worksheet documents.
- LiftNet API returns empty response.
- Item creation fails or item already exists.
- LiftNet request errors show alerts and halt processing.

## 11. Deployment Notes
- Upload `sna_hul_cs_sendtoliftnet.js`.
- Deploy to opportunity/estimate forms.
- Validate LiftNet workflow end-to-end.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should LiftNet credentials be stored server-side instead of client-side?
- Should item creation be moved to a backend script?
- Risk: Client-side credentials exposure (Mitigation: Move LiftNet calls to Suitelet/RESTlet)
- Risk: Large quotes cause long UI delays (Mitigation: Move processing to scheduled script)

---
