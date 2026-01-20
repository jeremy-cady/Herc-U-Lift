# PRD: Consumables Closed Tasks Warning
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ConsumablesWarning
title: Consumables Closed Tasks Warning
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_consumables_warning.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Saved Search

---

## 1. Overview
A scheduled script that checks two saved searches for consumables-related closed tasks and emails a warning when counts meet or exceed a threshold.

---

## 2. Business Goal
Provide proactive alerts when the number of closed tasks without SO upload or closed tasks today reaches a defined threshold.

---

## 3. User Story
- As a manager, I want to be alerted when consumables tasks exceed a threshold so that I can intervene.
- As an admin, I want to monitor two distinct saved searches so that I can track different scenarios.
- As a stakeholder, I want to receive an email alert so that I know when to review the searches.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled | customsearch1833, customsearch1865 | Count >= TARGET_COUNT (20) | Send warning email to recipients list |

---

## 5. Functional Requirements
- The system must load saved search customsearch1833.
- The system must load saved search customsearch1865.
- The system must send an email when a search count is >= TARGET_COUNT (20).
- The system must send from employee ID 2363377 and to the configured recipients list.
- Errors must be logged without crashing the script.

---

## 6. Data Contract
### Record Types Involved
- Saved Search

### Fields Referenced
- customsearch1833
- customsearch1865
- TARGET_COUNT (20)
- 2363377

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Count < 20: no email.
- Saved search missing: error logged.
- Email send failure is logged.

---

## 8. Implementation Notes (Optional)
- Recipient list is hardcoded.
- Target count is hardcoded.

---

## 9. Acceptance Criteria
- Given both saved searches, when counts are evaluated, then alerts are sent when count >= 20.
- Given counts below 20, when evaluated, then no email is sent.
- Given errors, when they occur, then they are logged without crashing the script.

---

## 10. Testing Notes
- Run with count >= 20 and confirm email sent.
- Run with count < 20 and confirm no email.
- Verify missing search logs error.
- Verify email send failure is logged.

---

## 11. Deployment Notes
- Deploy scheduled script.
- Set schedule as needed.
- Rollback: disable the scheduled script.

---

## 12. Open Questions / TBDs
- Should recipients and target count be script parameters?
- Hardcoded recipients become outdated.

---
