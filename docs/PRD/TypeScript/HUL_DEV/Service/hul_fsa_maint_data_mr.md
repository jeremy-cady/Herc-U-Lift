# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_fsa_maint_data_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Service/hul_fsa_maint_data_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - Project (Job)
  - Task
  - customrecord_sna_objects

---

## 1. Overview
Map/Reduce that builds a full maintenance snapshot per equipment asset and writes PM/AN/CO fields to the asset record.

---

## 2. Business Goal
Provide a comprehensive maintenance snapshot for each equipment asset.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want equipment assets updated with full maintenance data, so that PM/AN/CO details are current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | Maintenance fields on customrecord_nx_asset | Task/project data matches filters | Update PM/AN/CO fields and current hours |

---

## 5. Functional Requirements
- getInputData: Run SuiteQL query joining:
  - Jobs (Projects) filtered to revenue streams 263/18/19 and PM project types.
  - Most recent completed task per project (past).
  - Next upcoming task per project (future).
  - Latest maintenance record hours per task.
  - Latest hour meter reading per equipment object.
- Map rows into MaintenanceDataObject and normalize date fields to MM/DD/YYYY.
- map: Emit each row keyed by equipmentAsset.
- reduce: Write maintenance fields to equipment asset record based on revenue stream.
- summarize: No custom logic.
- Revenue stream labels: 263 → PM, 18 → AN, 19 → CO.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- Project (Job)
- Task
- customrecord_sna_objects

### Fields Referenced
- cseg_sna_revenue_st
- custentity_nx_project_type
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
- Date normalization expects MM/DD/YYYY and nulls invalid or missing dates.

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
