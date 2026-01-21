# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TaskPreferredRouteCode
title: Task Preferred Route Code
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_taskl_preferred_route_code.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - task
  - supportcase
  - customrecord_nx_asset

---

## 1. Overview
Sets the task route code based on preferred route codes from NextService assets linked to the related support case.

---

## 2. Business Goal
Automatically apply routing preferences to tasks so scheduling aligns with the related job site or equipment assets.

---

## 3. User Story
As a dispatcher, when I save a task tied to a support case, I want the route code populated from linked assets so that scheduling is faster and consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custevent_sna_hul_task_route_code | create/edit | Read support case assets and set route code based on asset type rules. |

---

## 5. Functional Requirements
- On create/edit, read the task support case.
- If no job site or equipment assets are linked, do nothing.
- If the job site asset type is Site, look for equipment assets and set the task route code from the first equipment asset with a preferred route code.
- If the job site asset type is Equipment, set the task route code from that asset's preferred route code.

---

## 6. Data Contract
### Record Types Involved
- Task
- Support Case
- Custom record: customrecord_nx_asset

### Fields Referenced
- Task | custevent_sna_hul_task_route_code | Task route code
- Support Case | custevent_nx_case_asset | Job site asset
- Support Case | custevent_nxc_case_assets | Equipment assets
- NextService Asset | custrecord_nxc_na_asset_type | Asset type
- NextService Asset | custrecord_sna_preferred_route_code | Preferred route code

Schemas (if known):
- NextService asset | customrecord_nx_asset | Asset master data

---

## 7. Validation & Edge Cases
- If no assets are linked, the task route code is not updated.
- If equipment assets have no preferred route code, no update occurs.
- Missing asset records should be logged without blocking save.

---

## 8. Implementation Notes (Optional)
- Uses lookups on support case and asset records during beforeSubmit.

---

## 9. Acceptance Criteria
- Given a support case with job site type Site and equipment assets with preferred route codes, when the task is saved, then the task route code is set from the first matching equipment asset.
- Given a support case with job site type Equipment, when the task is saved, then the task route code is set from that asset's preferred route code.
- Given a support case with no linked assets, when the task is saved, then the task route code remains unchanged.

---

## 10. Testing Notes
- Save a task with a support case that has job site and equipment assets; verify route code selection.
- Save a task with job site type Site but no equipment assets; verify no update.
- Save a task with missing asset data; verify the record still saves.

---

## 11. Deployment Notes
- Deploy the user event to the task record type.
- Confirm asset records include preferred route code values.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- If multiple equipment assets have route codes, should a specific one be preferred?

---
