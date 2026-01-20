# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FSCaseSubtabsHelperSL
title: FS Case Subtabs Helper Suitelet
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
A Suitelet that returns JSON for related open cases based on customer and asset IDs for use in the FS case subtab UI.

---

## 2. Business Goal
Provide a lightweight, query-based API to fetch related case data without loading heavy searches in the client.

---

## 3. User Story
- As a service user, I want related cases returned so that I can view them in the subtab.
- As an admin, I want controlled filtering so that only relevant cases appear.
- As a developer, I want a fast JSON endpoint so that the UI stays responsive.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet GET | customerId, assetIds | Parameters provided | Query and return related cases JSON |

---

## 5. Functional Requirements
- The Suitelet must accept GET parameters customerId and assetIds (comma-separated).
- The Suitelet must filter cases where custevent_nx_customer equals customerId, cseg_sna_revenue_st in ['106','107','108','263','18','19','204','205','206'], status in ['1','2','4'], and case assets include any provided asset IDs.
- The Suitelet must return JSON with case_id, case_number, case_start_date, custevent_nx_customer, case_assigned_to, revenue_stream, subject, and open_url pointing to the case.
- Missing or invalid parameters must return ok: true with empty rows.
- Non-GET requests must return ok: false with an error.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- customerId
- assetIds
- custevent_nx_customer
- cseg_sna_revenue_st
- status
- custevent_nxc_case_assets

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing parameters return ok: true and empty rows.
- Non-GET request returns ok: false with error.
- SuiteQL failure returns ok: false with error.

---

## 8. Implementation Notes (Optional)
- Uses MAP_supportcase_custevent_nxc_case_assets join table.
- Revenue segment and status lists are hard-coded.

---

## 9. Acceptance Criteria
- Given valid parameters, when requested, then matching case rows are returned.
- Given missing parameters, when requested, then empty rows are returned.
- Given errors, when they occur, then ok: false is returned.

---

## 10. Testing Notes
- GET with valid customer and asset IDs returns rows.
- GET with missing parameters returns empty rows.
- POST returns error response.

---

## 11. Deployment Notes
- Upload hul_fs_case_subtabs_helper_sl.js.
- Create Suitelet deployment and provide URL to client script.
- Rollback: disable the Suitelet deployment.

---

## 12. Open Questions / TBDs
- Should revenue segments be configurable?
- Should status list include additional values?
- Revenue/status lists change.
- MAP table name changes.

---
