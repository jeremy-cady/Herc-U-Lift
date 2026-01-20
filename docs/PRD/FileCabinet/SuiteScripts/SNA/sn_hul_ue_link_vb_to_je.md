# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LinkVBCreditToJE
title: Link Vendor Credit to Journal Entry (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sn_hul_ue_link_vb_to_je.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Credit
  - Journal Entry

---

## 1. Overview
A User Event script that links a vendor credit to a related journal entry after the credit is submitted.

## 2. Business Goal
Ensures the journal entry record references the vendor credit for tracking and reconciliation.

## 3. User Story
As an accountant, when I create a vendor credit with a related JE, I want journal entries linked to vendor credits, so that I can trace claim activity.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | `custbody_sna_claims_je` | Vendor credit saved | Update JE field `custbody_sn_claimsbillcredit` |

## 5. Functional Requirements
- The system must run on `afterSubmit`.
- The system must read `custbody_sna_claims_je` on the vendor credit.
- If a journal entry ID is present, the system must update the journal entry field `custbody_sn_claimsbillcredit` with the vendor credit ID.
- The system must log debug messages for the JE ID and update result.
- Errors must be logged and rethrown as a NetSuite error.

## 6. Data Contract
### Record Types Involved
- Vendor Credit
- Journal Entry

### Fields Referenced
- Vendor Credit | `custbody_sna_claims_je`
- Journal Entry | `custbody_sn_claimsbillcredit`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- JE field is empty; no update occurs.
- JE update fails due to permissions; error is logged and thrown.

## 8. Implementation Notes (Optional)
- Runs after submit to ensure vendor credit ID is available.
- Throws a NetSuite error on failure.

## 9. Acceptance Criteria
- Given `custbody_sna_claims_je` is set, when the script runs, then the JE is updated with the vendor credit ID.
- Given the JE field is empty, when the script runs, then no update occurs.
- Given an error, when the script runs, then it is logged and raised.

## 10. Testing Notes
- Save a vendor credit with `custbody_sna_claims_je` populated; JE field updates.
- Vendor credit without `custbody_sna_claims_je` does nothing.
- JE update fails due to permissions; error is logged and thrown.

## 11. Deployment Notes
- Upload `sn_hul_ue_link_vb_to_je.js`.
- Deploy on Vendor Credit `afterSubmit`.
- Test with a vendor credit linked to a journal entry.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the script validate the JE is not already linked to a different vendor credit?
- Should it run on create only instead of all edits?
- Risk: Missing JE ID prevents linking (Mitigation: Ensure `custbody_sna_claims_je` is set earlier)
- Risk: JE update fails due to permissions (Mitigation: Verify deployment role permissions)

---
