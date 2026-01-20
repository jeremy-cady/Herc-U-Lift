# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FSAMaintDataMR
title: FSA Maintenance Data Backfill (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Project (Job)
  - Task
  - customrecord_nx_asset
  - customrecord_nxc_mr
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
A Map/Reduce script that backfills maintenance summary fields on Field Service Assets using the most recent and next upcoming PM tasks.

---

## 2. Business Goal
Provide a full maintenance data sync across all eligible projects, not just recent changes.

---

## 3. User Story
- As an admin, I want a full backfill so that all assets are aligned.
- As a service user, I want accurate maintenance fields so that scheduling is reliable.
- As a developer, I want a single MR so that backfills are repeatable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | PM/AN/CO revenue stream and project types | Eligible projects | Update asset maintenance fields by revenue stream |

---

## 5. Functional Requirements
- The system must run a SuiteQL query to gather equipment asset and object IDs, revenue stream and project type, most recent completed task dates, next upcoming task dates, maintenance record hours, and latest hour meter readings.
- The system must convert date strings to valid date formats (MM/DD/YYYY) or null.
- The map stage must group by equipment asset ID.
- The reduce stage must update asset fields based on revenue stream (PM/AN/CO).
- Errors must be logged without stopping the run.

---

## 6. Data Contract
### Record Types Involved
- Project (Job)
- Task
- customrecord_nx_asset
- customrecord_nxc_mr
- customrecord_sna_hul_hour_meter

### Fields Referenced
- custentity_hul_nxc_eqiup_asset
- custentity_hul_nxc_equip_object
- cseg_sna_revenue_st
- custentity_nx_project_type
- custrecord_nxc_mr_field_222
- custrecord_sna_hul_hour_meter_reading

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Invalid date formats result in null values.
- Assets with no tasks still process without errors.
- submitFields errors logged in reduce.

---

## 8. Implementation Notes (Optional)
- Uses fixed revenue stream and project type lists.

---

## 9. Acceptance Criteria
- Given eligible assets, when processed, then PM/AN/CO fields are updated.
- Given invalid dates, when processed, then date fields are null.
- Given errors, when they occur, then they are logged without halting execution.

---

## 10. Testing Notes
- Run MR and verify PM/AN/CO fields populate on assets.
- Verify invalid date formats result in null values.
- Verify errors are logged.

---

## 11. Deployment Notes
- Upload hul_fsa_maint_data_mr.js.
- Create Map/Reduce script record.
- Run in sandbox and validate updates.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should revenue stream lists be parameterized?
- Should date normalization use the format module?
- Large query runtime.
- Date parsing issues.

---
