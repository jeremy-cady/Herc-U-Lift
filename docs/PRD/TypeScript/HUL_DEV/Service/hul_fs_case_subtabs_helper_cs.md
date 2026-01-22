# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_fs_case_subtabs_helper_cs
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: client
  file: TypeScript/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
Client Script that loads and displays related open cases for a Field Service case, and optionally prompts users to jump to the Open Cases tab.

---

## 2. Business Goal
Surface related open cases and guide users to the Open Cases tab when relevant.

---

## 3. User Story
As a user, when I edit a Field Service case, I want to see related open cases and a prompt to review them, so that I can address related work.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custevent_nx_customer, custevent_nxc_case_assets | Customer or assets change | Reload related open cases list |
| pageInit | TBD | Page initializes | Initialize list loading and observers |

---

## 5. Functional Requirements
- Watch customer and asset field changes and reload the list.
- Build Suitelet URL with customerId and assetIds query params and fetch JSON.
- Render a table with columns: Open, Case ID, Case #, Start Date, Customer (ID), Assigned To, Revenue Stream, Subject.
- Show "Loading..." while fetching and "No related cases." when empty.
- If rows are found, show a SweetAlert prompt to jump to the Open Cases tab (one-time per customer+asset selection unless FORCE_NOTIFY is true).
- Use MutationObserver to wait for the list container before initializing.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- custevent_nxc_case_assets
- custevent_nx_customer
- company (fallback)
- custpage_oc_sl_url
- custpage_open_cases_tab
- custpage_open_cases_subtab
- openCasesList (container ID)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Uses FORCE_NOTIFY to force modal each time (true for testing).

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
