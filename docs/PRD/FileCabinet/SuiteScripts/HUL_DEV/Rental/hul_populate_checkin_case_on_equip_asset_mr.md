# PRD: Populate Most Recent Check-In Case on Assets (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateCheckinCaseMR
title: Populate Most Recent Check-In Case on Assets (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - Support Case

---

## 1. Overview
A Map/Reduce script that finds the most recent qualifying check-in case for each equipment asset and writes it to the asset record.

---

## 2. Business Goal
Automate population of the most recent check-in case field on equipment assets without manual updates.

---

## 3. User Story
- As a rental user, I want assets to show the most recent check-in case so that I can review last service quickly.
- As an admin, I want a batch process so that assets are updated consistently.
- As a developer, I want the logic to select the latest case so that the field stays accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custrecord_nxc_na_asset_type, custevent_nx_case_type, custevent_nxc_case_assets | Asset type 2 and qualifying case | Update custrecord_most_recent_checkin_case with latest case ID |

---

## 5. Functional Requirements
- The system must search active equipment assets (custrecord_nxc_na_asset_type = '2') within an ID range.
- For each asset, the system must query support cases where custevent_nx_case_type = '104', status in ('2','3','4','6'), and custevent_nxc_case_assets contains the asset ID.
- The system must select the most recent case by highest internal ID.
- The system must update custrecord_most_recent_checkin_case on the asset record.
- Errors must be logged without stopping the run.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- Support Case

### Fields Referenced
- custrecord_nxc_na_asset_type
- custrecord_most_recent_checkin_case
- custevent_nx_case_type
- custevent_nxc_case_assets
- status

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Assets with no qualifying cases are skipped.
- Case field list contains multiple assets and still matches.
- Update failures are logged.

---

## 8. Implementation Notes (Optional)
- Asset search limited by internal ID range for testing.

---

## 9. Acceptance Criteria
- Given assets in range, when processed, then the latest qualifying case is identified.
- Given a qualifying case, when processed, then the asset is updated with the case ID.
- Given no qualifying case, when processed, then the asset is skipped.
- Given errors, when they occur, then they are logged.

---

## 10. Testing Notes
- Run with assets that have qualifying cases and confirm updates.
- Run with assets that have no qualifying cases and confirm skip.
- Verify update failures are logged.

---

## 11. Deployment Notes
- Remove or expand the ID range filter for production.
- Upload hul_populate_checkin_case_on_equip_asset_mr.js.
- Create Map/Reduce script record.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the asset ID range be removed for production?
- Should case selection be based on date instead of internal ID?
- ID range left in place.
- Large asset counts.

---
