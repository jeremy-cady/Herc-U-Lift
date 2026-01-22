# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_dupe_custom_form_id_on_case_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
User Event script that copies the Case form ID into a custom field on create and edit.

---

## 2. Business Goal
Expose the Case form ID in a custom field for downstream processes.

---

## 3. User Story
As a user, when a Support Case is created or edited, I want the custom form ID copied to a custom field, so that other processes can read it.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (beforeSubmit) | customform | Case created | Copy customform to custevent_hul_custom_form_id |
| EDIT (beforeSubmit) | customform | Case edited | Copy customform to custevent_hul_custom_form_id |

---

## 5. Functional Requirements
- On CREATE and EDIT, read customform.
- Write customform to custevent_hul_custom_form_id.
- Log current and copied form ID.
- Wrap logic in try/catch and log errors with log.error.

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
TBD

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
- Validation & edge cases
- Acceptance criteria details
- Testing notes
- Deployment notes

---
