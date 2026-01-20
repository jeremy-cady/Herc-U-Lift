# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FSCaseSubtabsHelperCS
title: FS Case Subtabs Helper (Client Script)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
A client script that populates and manages the Open Cases subtab on Field Service cases, including dynamic loading, filtering, and SweetAlert notifications.

---

## 2. Business Goal
Provide a responsive UI for related open cases based on customer and asset selections, with a guided Show me flow to the subtab.

---

## 3. User Story
- As a service user, I want related cases displayed so that I can see open work immediately.
- As an admin, I want the list to update on changes so that it stays accurate.
- As a user, I want a prompt to jump to the tab so that I can find the list quickly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custevent_nx_customer, custevent_nxc_case_assets | Customer/assets present | Fetch and render related cases |
| fieldChanged | custevent_nx_customer, custevent_nxc_case_assets | Customer/assets changed | Refresh related cases list |
| DOM change | openCasesList | Container inserted | Initialize listeners and render |

---

## 5. Functional Requirements
- The system must read customer field custevent_nx_customer (fallback company) and asset field custevent_nxc_case_assets.
- The system must build a Suitelet URL using hidden field custpage_oc_sl_url.
- The system must fetch JSON from the Suitelet and expect ok: true and rows: [].
- The system must render a table with columns: Open link, Case ID, Case #, Start Date, Customer, Assigned To, Revenue Stream, Subject.
- The system must display "No related cases" when empty.
- The system must notify the user via SweetAlert one time per selection (customer + assets), with optional FORCE_NOTIFY override.
- The notification must offer Show me to activate the Open Cases tab and scroll to the list.
- The system must watch for dynamic DOM insertion of openCasesList and initialize listeners.
- The system must refresh the list on pageInit, fieldChanged for customer/assets, and DOM change listeners.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- custevent_nx_customer
- company
- custevent_nxc_case_assets
- custpage_oc_sl_url

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing Suitelet URL or errors return an empty list.
- No related cases shows empty message.
- FORCE_NOTIFY enabled in script for testing.

---

## 8. Implementation Notes (Optional)
- Uses DOM APIs and fetch with XHR fallback.

---

## 9. Acceptance Criteria
- Given customer/assets, when present, then related cases render in the Open Cases list.
- Given related cases, when present, then a SweetAlert prompt offers Show me.
- Given no cases, when fetched, then the empty message is shown.
- Given errors, when they occur, then the list is empty and no crash occurs.

---

## 10. Testing Notes
- Set customer/assets and confirm related cases list renders.
- Confirm SweetAlert prompt appears and navigates to subtab.
- Remove Suitelet URL and confirm empty state.

---

## 11. Deployment Notes
- Upload hul_fs_case_subtabs_helper_cs.js.
- Deploy as client script on FS case form.
- Verify Suitelet URL field and subtab IDs.
- Rollback: disable the client script deployment.

---

## 12. Open Questions / TBDs
- Should FORCE_NOTIFY be disabled in production?
- Should notifications be per-session only?
- Subtab IDs change.
- Suitelet URL missing.

---
