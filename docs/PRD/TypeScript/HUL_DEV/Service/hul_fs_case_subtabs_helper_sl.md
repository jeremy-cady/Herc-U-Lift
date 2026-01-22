# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_fs_case_subtabs_helper_sl
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: TypeScript/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
Suitelet that returns related open support cases for a customer and selected assets (used by the Field Service case UI).

---

## 2. Business Goal
Provide related open cases for Field Service case UI rendering.

---

## 3. User Story
As a user, when viewing a Field Service case, I want related open cases loaded, so that I can review them.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | customerId, assetIds | Valid params provided | Return matching open cases as JSON |

---

## 5. Functional Requirements
- GET only; return { ok: false, error } for non-GET requests.
- Validate params; return { ok: true, rows: [] } when inputs are missing/empty.
- Use SuiteQL to fetch distinct support cases matching:
  - custevent_nx_customer = customerId
  - cseg_sna_revenue_st in 106, 107, 108, 263, 18, 19, 204, 205, 206
  - status in 1, 2, 4
  - Asset match via MAP_supportcase_custevent_nxc_case_assets
- Map results to JSON payload with:
  - case_id, case_number, case_start_date, custevent_nx_customer, case_assigned_to, revenue_stream, subject, open_url

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- custevent_nx_customer
- cseg_sna_revenue_st
- status
- custevent_nxc_case_assets

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Returns ok: true with empty rows when params missing/empty.
- Returns ok: false on non-GET requests.

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
