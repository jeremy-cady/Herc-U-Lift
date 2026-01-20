# PRD: Update Asset Check-In Case on Case Save (User Event)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateCheckinCaseUE
title: Update Asset Check-In Case on Case Save (User Event)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - customrecord_nx_asset

---

## 1. Overview
A User Event that updates equipment asset records with the most recent check-in case when qualifying support cases are created or edited.

---

## 2. Business Goal
Keep asset records synced in real time with the latest check-in case data without waiting for a batch job.

---

## 3. User Story
- As a rental user, I want assets updated when cases change so that check-in data is current.
- As an admin, I want automated asset updates so that no manual maintenance is needed.
- As a support user, I want only qualifying cases to update assets so that irrelevant cases are ignored.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit (create/edit) | custevent_nx_case_type, status, custevent_nxc_case_assets | Case type 104 and status in 2,3,4,6 | Update custrecord_most_recent_checkin_case on linked assets |

---

## 5. Functional Requirements
- The system must run on afterSubmit for CREATE and EDIT.
- The system must check case type custevent_nx_case_type equals 104.
- The system must check case status is one of 2, 3, 4, 6.
- The system must read custevent_nxc_case_assets and handle single or multiple asset IDs.
- For each asset, the system must update custrecord_most_recent_checkin_case with the case ID.
- Errors on individual asset updates must be logged without stopping the script.

---

## 6. Data Contract
### Record Types Involved
- Support Case
- customrecord_nx_asset

### Fields Referenced
- custevent_nx_case_type
- status
- custevent_nxc_case_assets
- custrecord_most_recent_checkin_case

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Case has no linked assets: script exits.
- Case status not in allowed list: script exits.
- Asset update fails for one asset: others continue.

---

## 8. Implementation Notes (Optional)
- None.

---

## 9. Acceptance Criteria
- Given a qualifying case, when saved, then linked assets update with the case ID.
- Given a non-qualifying case, when saved, then assets are not updated.
- Given multiple assets, when saved, then all linked assets update.
- Given update errors, when they occur, then they are logged without stopping processing.

---

## 10. Testing Notes
- Create a case of type 104 with status 2 and linked assets; confirm assets update.
- Edit the case and confirm assets update again.
- Use a non-qualifying status and confirm no updates.

---

## 11. Deployment Notes
- Upload hul_populate_checkin_case_on_equip_asset_ue.js.
- Deploy as a User Event on support case record.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should case type/status values be configurable?
- Should updates occur only on create (not edit)?
- Case status IDs change.
- Many linked assets.

---
