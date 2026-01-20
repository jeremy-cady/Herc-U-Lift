# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PandaDocESignButtonCS
title: PandaDoc E-Signature Request Button (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/PandaDocs/sna_hul_cs_pd_esign_button.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transactions supported by the PandaDoc Suitelet

---

## 1. Overview
A client script that triggers a PandaDoc e-signature request from the current transaction using a Suitelet endpoint.

## 2. Business Goal
Provides a user-initiated action to send the current transaction for PandaDoc e-signature.

## 3. User Story
As a sales rep, when I click the e-signature button, I want to request e-signatures from a button, so that I can send documents quickly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Button click | `templateId` | User invokes e-signature | POST to PandaDoc Suitelet and reload on success |

## 5. Functional Requirements
- The system must resolve a Suitelet URL using `sna_hul_mod_pd.SUITELET.request_esginature`.
- The system must send a POST request to the Suitelet with parameters: `action: eSignatureRequest`, `id`, `record_type`, `templateId`.
- The system must display an information message while the request is in progress.
- On success response (`status === 'success'`), the system must reload the page.
- On failure response, the system must display an alert with the error message.
- Errors in the request flow must be logged to the console.

## 6. Data Contract
### Record Types Involved
- Transactions supported by the PandaDoc Suitelet

### Fields Referenced
- Request parameters: `id`, `record_type`, `templateId`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Suitelet returns error status; alert is shown.
- Network error while posting; error logged in console.
- Invalid template ID results in error response.

## 8. Implementation Notes (Optional)
- Requires module `./modules/sna_hul_mod_pd` for Suitelet IDs.
- Uses `https.post.promise` for async request.

## 9. Acceptance Criteria
- Given a button click, when the request runs, then the Suitelet POST includes correct parameters.
- Given a success response, when the request completes, then the page reloads.
- Given a failure response, when the request completes, then an alert is shown.
- Given a request in progress, when the request runs, then a progress message is shown.

## 10. Testing Notes
- Click e-signature button with a valid template ID; page reloads after success.
- Suitelet returns error status; alert is shown.
- Network error while posting; error logged in console.
- Invalid template ID results in error response.

## 11. Deployment Notes
- Upload `sna_hul_cs_pd_esign_button.js`.
- Deploy on target transaction forms.
- Verify Suitelet URL resolution and request flow.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the client script validate template IDs before sending?
- Should the progress message auto-hide on error?
- Risk: Suitelet unavailable or misconfigured (Mitigation: Validate deployment IDs and permissions)
- Risk: User cancels before reload (Mitigation: Provide clearer status messaging)

---
