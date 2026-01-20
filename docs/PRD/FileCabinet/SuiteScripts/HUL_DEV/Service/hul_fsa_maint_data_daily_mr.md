# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FSAMaintDataDailyMR
title: FSA Maintenance Data Daily (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_daily_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Project (Job)
  - customrecord_nx_asset
  - customrecord_nxc_mr
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
A Map/Reduce script that updates Field Service Asset (FSA) maintenance summary fields by combining recently completed PM tasks and newly created future PM tasks.

---

## 2. Business Goal
Keep asset maintenance fields current with the latest completed and upcoming PM tasks, including meter readings and dates.

---

## 3. User Story
- As a service user, I want maintenance fields updated daily so that asset records stay current.
- As an admin, I want automated data synchronization so that manual updates are unnecessary.
- As a developer, I want a structured MR so that logic scales to many assets.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | PM/AN/CO revenue stream and task category | Recent completed and future PM tasks | Update asset maintenance fields |

---

## 5. Functional Requirements
- The system must fetch recent completed PM tasks (last day) and find the next upcoming PM task per asset.
- The system must fetch newly created future PM tasks (last day) and find the most recent completed task per asset.
- The system must combine both result sets and map by equipment asset ID.
- The system must update equipment asset fields based on revenue stream (PM, AN, CO) and task category (COMPLETED_TASK, FUTURE_TASK).
- The system must populate fields including project, last task, next task, last/next PM dates, last maintenance hours, current hours, and current hours date.
- Errors must be logged without stopping the run.

---

## 6. Data Contract
### Record Types Involved
- Task
- Project (Job)
- customrecord_nx_asset
- customrecord_nxc_mr
- customrecord_sna_hul_hour_meter

### Fields Referenced
- custentity_hul_nxc_eqiup_asset
- custentity_hul_nxc_equip_object
- cseg_sna_revenue_st
- custentity_nx_project_type
- completeddate
- startdate
- supportcase
- custrecord_nxc_mr_field_222
- custrecord_sna_hul_hour_meter_reading

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No recent/future tasks: MR completes with no updates.
- Unknown revenue stream logs an error.
- submitFields failures logged in reduce.

---

## 8. Implementation Notes (Optional)
- SuiteQL queries include fixed revenue stream and project type lists.

---

## 9. Acceptance Criteria
- Given recent and future tasks, when processed, then PM/AN/CO maintenance fields update on assets.
- Given errors, when they occur, then they are logged without halting execution.

---

## 10. Testing Notes
- Create completed and future PM tasks in last day and confirm asset fields update.
- Run with no tasks and confirm no updates.
- Verify errors are logged.

---

## 11. Deployment Notes
- Upload hul_fsa_maint_data_daily_mr.js.
- Create Map/Reduce script record.
- Schedule or run daily as needed.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the lookback window be configurable?
- Should task category labels be normalized to CURRENT_TASK/FUTURE_TASK?
- Heavy SuiteQL usage.
- Revenue stream mapping changes.

---
