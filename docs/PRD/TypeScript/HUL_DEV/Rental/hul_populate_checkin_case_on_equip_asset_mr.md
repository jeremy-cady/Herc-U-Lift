# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_checkin_case_on_equip_asset_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - Support Case

---

## 1. Overview
Map/Reduce script that updates equipment assets with their most recent qualifying check-in case.

---

## 2. Business Goal
Keep equipment assets updated with the most recent qualifying check-in case.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want equipment assets updated with their most recent check-in case, so that asset records reflect current status.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custrecord_most_recent_checkin_case | Case type is 104, status in 2,3,4,6, and asset appears in case assets | Set asset's most recent check-in case to highest internal ID case |

---

## 5. Functional Requirements
- getInputData: Search equipment assets (customrecord_nx_asset) in internalidnumber range 150000 to 200000.
- map: For each asset, run SuiteQL to find most recent check-in case (highest internal ID) where:
  - custevent_nx_case_type = 104
  - status in 2, 3, 4, 6
  - Asset ID is present in custevent_nxc_case_assets
- reduce: Set custrecord_most_recent_checkin_case on the asset.
- summarize: No active logic (placeholder).
- Case search handles multi-select asset IDs with LIKE patterns.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset (equipment asset)
- Support Case

### Fields Referenced
- custevent_nx_case_type
- status
- custevent_nxc_case_assets
- custrecord_most_recent_checkin_case

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Asset search is limited to internalidnumber range 150000 to 200000 (test range).

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
