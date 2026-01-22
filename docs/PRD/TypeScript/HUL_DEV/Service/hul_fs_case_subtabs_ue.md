# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_fs_case_subtabs_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Service/hul_fs_case_subtabs_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
User Event that adds an “Open Cases” tab/subtab and injects the related-cases UI for Field Service cases on create.

---

## 2. Business Goal
Provide an Open Cases tab with related case visibility during Field Service case creation.

---

## 3. User Story
As a user, when I create a Field Service case, I want an Open Cases tab with related cases, so that I can review existing open items.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (beforeLoad) | TBD | Field Service case create | Add Open Cases tab/subtab and inject related-cases UI |

---

## 5. Functional Requirements
- On CREATE, add the Open Cases tab and subtab (custpage_open_cases_tab / custpage_open_cases_subtab).
- Resolve the Suitelet URL (customscript4392 / customdeploy1) and store it in hidden field custpage_oc_sl_url.
- Render inline HTML card that hosts the related-cases table and styling.
- Inject inline client bootstrap JS that:
  - Loads SweetAlert2 on demand.
  - Reads customer and asset fields, calls the Suitelet, and renders a table.
  - Shows a one-time modal when related cases are found.
  - Watches field changes and waits for the container to appear before initializing.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- custpage_open_cases_tab
- custpage_open_cases_subtab
- custpage_oc_sl_url
- custpage_oc_container
- custevent_nx_customer
- custevent_nxc_case_assets

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Only applies on CREATE.

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
