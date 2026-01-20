# PRD: Consumables Closed Tasks Warning (Scheduled)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20240906-ConsumablesWarningSS
title: Consumables Closed Tasks Warning (Scheduled)
status: Implemented
owner: Jeremy Cady
created: September 6, 2024
last_updated: September 6, 2024

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_consumables_warning_ss.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Saved Search

---

## 1. Overview
A scheduled script that checks two consumables-related saved searches and emails a warning when counts meet or exceed a threshold.

---

## 2. Business Goal
Alert stakeholders when closed tasks without sales orders reach a critical count, helping drive follow-up.

---

## 3. User Story
- As a manager, I want to be alerted when consumables tasks exceed a threshold so that I can respond quickly.
- As an admin, I want to monitor both “upload” and “today” searches so that I cover both scenarios.
- As a stakeholder, I want to receive a clear alert so that I can review the searches.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled | customsearch1833, customsearch1865 | Count >= 20 | Send alert email to recipients |

---

## 5. Functional Requirements
- The system must load saved search customsearch1833.
- The system must load saved search customsearch1865.
- The system must send an email when count >= 20 for either search.
- The system must send from employee ID 2363377 to the configured recipients.
- Errors must be logged without halting execution.

---

## 6. Data Contract
### Record Types Involved
- Saved Search

### Fields Referenced
- customsearch1833
- customsearch1865
- 2363377

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Count < 20: no email.
- Search missing: error logged.
- Email send errors are logged.

---

## 8. Implementation Notes (Optional)
- Recipients and threshold are hardcoded.

---

## 9. Acceptance Criteria
- Given both searches, when counts are evaluated, then alerts are sent when counts reach 20 or more.
- Given counts below 20, when evaluated, then no email is sent.
- Given errors, when they occur, then they are logged without halting execution.

---

## 10. Testing Notes
- Run with search count >= 20 and confirm alert email sent.
- Run with count < 20 and confirm no email.
- Verify missing search logs error.
- Verify email send errors are logged.

---

## 11. Deployment Notes
- Deploy scheduled script.
- Set schedule as needed.
- Rollback: disable the scheduled script.

---

## 12. Open Questions / TBDs
- Should recipients and thresholds be parameterized?
- Hardcoded emails become outdated.

---
