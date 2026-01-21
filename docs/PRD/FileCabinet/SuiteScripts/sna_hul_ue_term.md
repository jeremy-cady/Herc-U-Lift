# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TermDescription
title: Terms Description Custom Field
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_term.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - term
  - customrecord_sna_term_desc

---

## 1. Overview
Adds a Description field to the Terms form and persists its value in a related custom record.

---

## 2. Business Goal
Allow managed term descriptions without changing the native Terms record schema.

---

## 3. User Story
As an accounting admin, when I edit a term, I want to view and update its description so that the details are stored safely outside native fields.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | custpage_desc | view/edit | Add Description field to the form and load existing description from the custom record. |
| afterSubmit | custrecord_sna_term_desc | create/edit | Update existing custom record or create a new one for the term. |

---

## 5. Functional Requirements
- Add a LONGTEXT field `custpage_desc` labeled Description to the Terms form.
- Load the existing description from `customrecord_sna_term_desc` for the current term.
- On save, update the existing custom record if present.
- If no custom record exists, create a new `customrecord_sna_term_desc` linked to the term.

---

## 6. Data Contract
### Record Types Involved
- Terms
- Custom record: customrecord_sna_term_desc

### Fields Referenced
- Custom record | custrecord_sna_payment_term | Linked term
- Custom record | custrecord_sna_term_desc | Description
- UI field | custpage_desc | Form-only description field

Schemas (if known):
- Custom record | customrecord_sna_term_desc | Terms description storage

---

## 7. Validation & Edge Cases
- If no custom description record exists, create one on save.
- If the custom record creation fails, log the error and continue.

---

## 8. Implementation Notes (Optional)
- Uses a form-only field and a custom record to avoid modifying native fields.

---

## 9. Acceptance Criteria
- Given a term with an existing description, when the form loads, then the Description field is pre-filled.
- Given a term without a custom description record, when the term is saved, then a new custom record is created.
- Given an updated Description field, when the term is saved, then the custom record is updated.

---

## 10. Testing Notes
- Open a term with an existing description and verify the field pre-populates.
- Update the description and save; verify the custom record updates.
- Save a term with no custom description record; verify creation.

---

## 11. Deployment Notes
- Ensure `customrecord_sna_term_desc` exists and is active.
- Deploy the user event to the Terms record.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should inactive custom description records be reused or replaced?

---
