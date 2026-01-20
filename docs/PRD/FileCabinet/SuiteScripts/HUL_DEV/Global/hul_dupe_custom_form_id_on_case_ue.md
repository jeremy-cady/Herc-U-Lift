# PRD: Copy Case Custom Form ID (User Event)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20250804-DupeCaseFormIdUE
title: Copy Case Custom Form ID (User Event)
status: Implemented
owner: Jeremy Cady
created: August 4, 2025
last_updated: August 4, 2025

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
A User Event that copies the Case’s customform ID into a dedicated custom field on create/edit.

---

## 2. Business Goal
Provide a persistent form ID value on cases for reporting and downstream processing.

---

## 3. User Story
- As an admin, I want to store the case form ID in a field so that reports can filter by form.
- As a developer, I want to centralize the form ID copy so that Map/Reduce can trigger it.
- As a manager, I want to ensure all cases have the form ID stored so that data is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit (create/edit) | customform, custevent_hul_custom_form_id | Case create or edit | Set custevent_hul_custom_form_id to customform ID |

---

## 5. Functional Requirements
- The system must run on beforeSubmit for CREATE and EDIT.
- The system must read customform from the case record.
- The system must set custevent_hul_custom_form_id to the form ID.
- Errors are logged without blocking the save.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- customform
- custevent_hul_custom_form_id

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- customform blank: field set to blank.
- beforeSubmit errors are logged.

---

## 8. Implementation Notes (Optional)
- None.

---

## 9. Acceptance Criteria
- Given a case create/edit, when beforeSubmit runs, then custevent_hul_custom_form_id is set to the form ID.
- Given an error, when it occurs, then it is logged without blocking the save.

---

## 10. Testing Notes
- Create or edit a case and confirm the custom form ID field is populated.
- Verify customform blank sets the custom field to blank.

---

## 11. Deployment Notes
- Deploy User Event on Support Case.
- Validate field population on save.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should this run on VIEW/OTHER context?
- Field missing on case causes errors.

---
