# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_fsa_maint_data_daily_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Service/hul_fsa_maint_data_daily_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - Project (Job)
  - Task
  - Support Case
  - customrecord_sna_objects

---

## 1. Overview
Map/Reduce that refreshes maintenance data on equipment asset records using recent completed tasks and newly created future tasks.

---

## 2. Business Goal
Keep equipment asset maintenance fields current based on recent and upcoming tasks.

---

## 3. User Story
As a user, when the Map/Reduce runs daily, I want maintenance fields on equipment assets updated from recent and upcoming tasks, so that asset maintenance data stays current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | Maintenance fields on customrecord_nx_asset | Task data matches revenue stream and category filters | Update PM/AN/CO and current hours fields |

---

## 5. Functional Requirements
- getInputData:
  - Fetch recent completed PM/AN/CO tasks (completed within last day) with current hour meter readings and next upcoming task per project.
  - Fetch newly created future PM/AN/CO tasks (created within last day) with current hour meter readings and most recent completed task per project.
  - Concatenate both datasets for processing.
- map: Emit each row keyed by equipment_asset.
- reduce:
  - Iterate each maintenance data object for the equipment ID.
  - Call populateFields to update the equipment asset record.
- summarize: No custom logic.
- Revenue stream filter: cseg_sna_revenue_st IN (263, 18, 19) mapped to PM/AN/CO.
- Project type filter: custentity_nx_project_type IN (4,5,6,7,8,10,12,13,14,15).
- Asset linking uses:
  - job.custentity_hul_nxc_eqiup_asset
  - job.custentity_hul_nxc_equip_object
  - MAP_supportcase_custevent_nxc_case_assets

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- Project (Job)
- Task
- Support Case
- customrecord_sna_objects

### Fields Referenced
- cseg_sna_revenue_st
- custentity_nx_project_type
- job.custentity_hul_nxc_eqiup_asset
- job.custentity_hul_nxc_equip_object
- MAP_supportcase_custevent_nxc_case_assets
- Equipment asset maintenance fields:
  - custrecord_hul_pm_project
  - custrecord_hul_last_pm_task
  - custrecord_hul_next_pm_task
  - custrecord_hul_last_pm_date
  - custrecord_hul_next_pm_date
  - custrecord_hul_last_pm_hours
  - custrecord_hul_an_project
  - custrecord_hul_last_an_task
  - custrecord_hul_next_an_task
  - custrecord_hul_last_an_date
  - custrecord_hul_next_an_date
  - custrecord_hul_last_an_hours
  - custrecord_hul_co_project
  - custrecord_hul_last_co_task
  - custrecord_hul_next_co_task
  - custrecord_hul_last_co_date
  - custrecord_hul_next_co_date
  - custrecord_hul_last_co_hours
  - custrecord_hul_current_hours
  - custrecord_hul_current_hours_date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Uses two datasets (recent completed vs newly created future tasks) merged for processing.

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
