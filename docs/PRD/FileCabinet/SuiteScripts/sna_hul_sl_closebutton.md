# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CloseReturnAuthorization
title: Close Return Authorization
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_closebutton.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - returnauthorization

---

## 1. Overview
Suitelet that closes all item lines on a Return Authorization and redirects back to the record.

---

## 2. Business Goal
Provides a custom close action that triggers associated User Event logic by saving the record.

---

## 3. User Story
- As a returns user, when I close an RA quickly, I want processing to complete, so that the return can move forward.
- As an admin, when I close an RA, I want UE logic to trigger, so that downstream updates run.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | recid | `recid` provided | Close all item lines and save the Return Authorization |

---

## 5. Functional Requirements
- Accept `recid` as a request parameter.
- Load the Return Authorization record.
- Set `isclosed` to true on each item line.
- Save the record and redirect to the Return Authorization.

---

## 6. Data Contract
### Record Types Involved
- returnauthorization

### Fields Referenced
- returnauthorizationline.isclosed

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Return Authorization already closed; save still succeeds.
- Invalid `recid` logs an error and stops.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: One record load/save.

---

## 9. Acceptance Criteria
- Given `recid` is provided, when the Suitelet runs, then all item lines are marked closed.
- Given the record saves, when the Suitelet completes, then the user is redirected to the Return Authorization.

---

## 10. Testing Notes
Manual tests:
- RA with open lines is closed by Suitelet.
- RA already closed; save still succeeds.
- Invalid `recid` logs an error and stops.

---

## 11. Deployment Notes
- Suitelet deployed and linked on Return Authorization.
- Deploy Suitelet.
- Add button/link to trigger Suitelet.

---

## 12. Open Questions / TBDs
- Should this action enforce additional validation before closing?

---
