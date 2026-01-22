# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_consumables_warning_ss
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: TypeScript/HUL_DEV/Global/hul_consumables_warning_ss.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task

---

## 1. Overview
Scheduled script that monitors two saved searches for consumables tasks without sales orders and emails an alert when counts hit a threshold.

---

## 2. Business Goal
Alert stakeholders when consumables tasks without sales orders reach a threshold.

---

## 3. User Story
As a user, when the scheduled job runs and counts reach the threshold, I want to receive an alert, so that I can take action.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled execution | TBD | Saved search count >= 20 | Send email alert to configured recipients |

---

## 5. Functional Requirements
- Load saved searches:
  - customsearch1833 (Closed Tasks without SO - Upload)
  - customsearch1865 (Closed Tasks without SO - Today)
- For each search, compare result count to target threshold 20.
- If count >= 20, send an email alert to configured recipients.
- Email subject/body include current count and search name.
- Sender is Employee ID 2363377.
- Wrap execution in try/catch and log errors with log.error.

---

## 6. Data Contract
### Record Types Involved
- Task

### Fields Referenced
- Saved search IDs: customsearch1833, customsearch1865

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Threshold comparison uses >= TARGET_COUNT.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
