# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_maintenance_info_on_field_service_asset_record_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Service/hul_populate_maintenance_info_on_field_service_asset_record_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - customrecord_sna_objects
  - Project (Job)
  - Support Case
  - Task
  - customrecord_sna_hul_hour_meter
  - customrecord_nx_maintenancerecord

---

## 1. Overview
Map/Reduce that assembles maintenance details for Field Service Assets and writes current PM info and hour meter data to the asset record.

---

## 2. Business Goal
Populate Field Service Asset records with current PM and hour meter details.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want Field Service Asset records updated with current PM and hour meter data, so that maintenance information is current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | PM and hour meter fields on customrecord_nx_asset | Asset type is 2 and object IDs processed | Update maintenance and hour meter fields |

---

## 5. Functional Requirements
- getInputData: Load equipment object IDs for assets of type 2.
- map:
  - Filter to specific equipment object IDs (hardcoded to 1253185376 and 1253199340).
  - Resolve the FSA, related project/case/task, and maintenance/hour meter data.
  - Emit a consolidated maintenance object keyed by FSA ID.
- reduce: Write the maintenance values to the Field Service Asset record.
- summarize: No custom logic.
- Some queries are hardcoded:
  - Maintenance record query uses asset 80532.
  - Hour meter query uses object 1253199340.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- customrecord_sna_objects
- Project (Job)
- Support Case
- Task
- customrecord_sna_hul_hour_meter
- customrecord_nx_maintenancerecord

### Fields Referenced
- customrecord_nx_asset fields:
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
- Logic is currently hardcoded to specific asset/object IDs.

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
