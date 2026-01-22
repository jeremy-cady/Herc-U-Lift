# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_checkin_case_on_equip_asset_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - customrecord_nx_asset

---

## 1. Overview
User Event script that updates related equipment assets with the current check-in case when qualifying cases are created or edited.

---

## 2. Business Goal
Keep equipment assets updated with the most recent qualifying check-in case on create or edit.

---

## 3. User Story
As a user, when a qualifying check-in case is created or edited, I want related equipment assets updated with the case, so that assets reflect the latest check-in.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (afterSubmit) | custevent_nxc_case_assets | custevent_nx_case_type = 104 and status in 2,3,4,6 | Set custrecord_most_recent_checkin_case on related assets |
| EDIT (afterSubmit) | custevent_nxc_case_assets | custevent_nx_case_type = 104 and status in 2,3,4,6 | Set custrecord_most_recent_checkin_case on related assets |

---

## 5. Functional Requirements
- On CREATE and EDIT, proceed only when:
  - custevent_nx_case_type is 104
  - status is one of 2, 3, 4, 6
- Read custevent_nxc_case_assets and update each asset:
  - Set custrecord_most_recent_checkin_case to the current case ID.
- Handle both single and multi-select asset values.
- Log and skip if no equipment assets are present.

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
- Skips when no equipment assets are present.

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
