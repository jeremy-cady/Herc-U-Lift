# PRD: Backfill Case Custom Form ID (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20250804-DupeCaseFormIdMR
title: Backfill Case Custom Form ID (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: August 4, 2025
last_updated: August 4, 2025

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
A Map/Reduce that re-saves Support Case records to trigger a User Event that backfills a custom form ID field.

---

## 2. Business Goal
Update cases where custevent_hul_custom_form_id is blank by triggering the User Event logic across a filtered set of cases.

---

## 3. User Story
- As an admin, I want to backfill the custom form ID on cases so that reporting is accurate.
- As a developer, I want to reuse the existing User Event logic so that I avoid duplicating code.
- As a manager, I want to ensure all cases have a form ID so that downstream processes work.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custevent_hul_custom_form_id, type, custevent_sna_hul_casedept | Field empty and type in 1–15 list and casedept in 3,4,18,23,28,34,35,36,37 | Load and save case to trigger User Event |

---

## 5. Functional Requirements
- The system must search Support Cases where custevent_hul_custom_form_id is empty.
- The system must filter by case type and department segments: type in 1–15 (specified list), custevent_sna_hul_casedept in 3,4,18,23,28,34,35,36,37.
- The system must load each case and save it to trigger the User Event.
- The system must log errors for map and reduce stages.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- custevent_hul_custom_form_id
- type
- custevent_sna_hul_casedept

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Cases missing expected fields: error logged.
- Map/reduce errors logged in summarize.

---

## 8. Implementation Notes (Optional)
- Relies on User Event side effects.

---

## 9. Acceptance Criteria
- Given cases with empty custevent_hul_custom_form_id, when the script runs, then those cases are processed.
- Given a processed case, when it is saved, then the User Event is triggered.
- Given errors, when they occur, then they are logged in summarize.

---

## 10. Testing Notes
- Run MR on cases with blank custevent_hul_custom_form_id and confirm UE populates.
- Verify errors are logged in summarize.

---

## 11. Deployment Notes
- Deploy Map/Reduce.
- Ensure User Event is active.
- Run on target case set.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the ID/type filters be parameterized?
- User Event disabled leads to no backfill.

---
