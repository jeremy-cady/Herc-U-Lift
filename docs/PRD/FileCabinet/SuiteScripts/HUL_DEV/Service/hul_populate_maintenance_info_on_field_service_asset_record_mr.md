# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FSAMaintInfoMR
title: Populate Maintenance Info on FSA Records (Map/Reduce)
status: Draft
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_maintenance_info_on_field_service_asset_record_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_nx_asset
  - Project (Job)
  - Support Case
  - Task
  - customrecord_nxc_mr
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
A Map/Reduce script that populates maintenance summary fields on Field Service Asset records by stitching together project, case, task, maintenance record, meter, and site data.

---

## 2. Business Goal
Centralize maintenance data on FSA records so service teams can view last PM, hours, and site metadata in one place.

---

## 3. User Story
- As a service user, I want FSA records updated with PM data so that I can review maintenance quickly.
- As an admin, I want a batch job so that multiple assets are updated at once.
- As a developer, I want the script to derive related records so that manual linking is unnecessary.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custrecord_nxc_na_asset_type | Equipment assets (type 2) | Populate maintenance summary fields on FSA |

---

## 5. Functional Requirements
- The system must query object IDs linked to equipment assets (custrecord_nxc_na_asset_type = '2').
- The system must map each object to its FSA record.
- The system must find PM projects for the asset (project types 4/5/6/7/8/10/12/13/14/15).
- The system must find the most recent maintenance case and task for those projects.
- The system must retrieve maintenance record hours and date.
- The system must retrieve the latest hour meter reading for the object.
- The system must retrieve warranty expiration date and site ZIP code.
- The system must update FSA fields: current PM project/case/task, last PM hours/date, current hours and reading date, current hours record ID, site ZIP, warranty end date.
- Errors must be logged without stopping the run.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- customrecord_nx_asset
- Project (Job)
- Support Case
- Task
- customrecord_nxc_mr
- customrecord_sna_hul_hour_meter

### Fields Referenced
- custrecord_sna_hul_nxcassetobject
- custrecord_hul_current_pm_project
- custrecord_hul_current_pm_case
- custrecord_hul_recent_pm_task
- custrecord_hul_recent_pm_maint_rec
- custrecord_hul_last_serviced_hours
- custrecord_hul_last_pm_date
- custrecord_hul_current_hours
- custrecord_hul_current_hrs_read_date
- custrecord_hul_current_hours_record
- custrecord_hul_pm_zip
- custrecord_hul_warranty_end_date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Assets without related data are skipped.
- Script currently filters to object IDs 1253185376 and 1253199340.
- Some queries include hard-coded IDs (maintenance record asset 80532, hour meter object 1253199340).
- submitFields errors logged in reduce.

---

## 8. Implementation Notes (Optional)
- Uses SuiteQL and searches across related records.

---

## 9. Acceptance Criteria
- Given related records exist, when processed, then FSA fields are updated with maintenance data.
- Given missing related data, when processed, then assets are skipped without errors.
- Given errors, when they occur, then they are logged without halting execution.

---

## 10. Testing Notes
- Use the test object IDs to confirm updates.
- Verify missing related records result in no updates.
- Verify submitFields errors are logged.

---

## 11. Deployment Notes
- Remove test object filters and hard-coded IDs before production.
- Upload hul_populate_maintenance_info_on_field_service_asset_record_mr.js.
- Create Map/Reduce script record.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should hard-coded IDs be removed or parameterized?
- Should the script handle all assets instead of two test IDs?
- Hard-coded IDs left in place.
- Heavy query load.

---
