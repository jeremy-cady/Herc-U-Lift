# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FSCaseSubtabsUE
title: FS Case Open Cases Subtabs (User Event)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
A User Event that injects an Open Cases tab/subtab UI on FS case forms and bootstraps inline client logic to load related cases.

---

## 2. Business Goal
Add a lightweight, embedded UI for related open cases without requiring custom form development.

---

## 3. User Story
- As a service user, I want an Open Cases subtab so that I can see related cases quickly.
- As an admin, I want the UI injected automatically so that no form customization is needed.
- As a developer, I want inline bootstrap JS so that the list loads without extra dependencies.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad (create/edit) | custpage_oc_sl_url | FS case form | Add tab/subtab, inline HTML, and Suitelet URL |

---

## 5. Functional Requirements
- The system must run on beforeLoad for CREATE and EDIT.
- The system must add tab custpage_open_cases_tab (Open Cases) and subtab custpage_open_cases_subtab (Related Cases).
- The system must resolve Suitelet URL using script ID customscript4392 and deployment ID customdeploy1.
- The system must add hidden field custpage_oc_sl_url containing the Suitelet URL.
- The system must add inline HTML with a card wrapper and list container (openCasesList) and CSS styling.
- The system must inject inline bootstrap JS that loads SweetAlert2 from SWAL_MEDIA_URL, fetches related cases via the Suitelet, renders the table, and shows a modal when cases exist.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- custpage_oc_sl_url
- custpage_open_cases_tab
- custpage_open_cases_subtab
- openCasesList
- customscript4392
- customdeploy1

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Suitelet URL fails to resolve; list remains empty.
- SweetAlert fails to load; list still renders.
- Runs only on create/edit.

---

## 8. Implementation Notes (Optional)
- Inline JS does not use AMD modules.

---

## 9. Acceptance Criteria
- Given create/edit, when the form loads, then Open Cases tab and subtab are added.
- Given the subtab, when rendered, then the list container and CSS are present.
- Given customer/assets, when the inline JS runs, then related cases are loaded and rendered.

---

## 10. Testing Notes
- Create or edit an FS case and confirm Open Cases tab/subtab appear.
- Select customer/assets and confirm related cases list populates.
- Verify missing Suitelet URL results in empty list.

---

## 11. Deployment Notes
- Upload hul_fs_case_subtabs_ue.js.
- Deploy as User Event on support case record.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should Suitelet script/deploy IDs be parameterized?
- Should the inline bootstrap be replaced with the helper client script?
- Hard-coded Suitelet IDs.
- Inline JS maintenance.

---
