# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FSAMaintDataNightlySS
title: FSA Maintenance Data Nightly (Scheduled Script)
status: Draft
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_nightly_ss.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case
  - Project (Job)
  - customrecord_nx_asset
  - customrecord_sna_hul_hour_meter
  - customrecord_nxc_mr

---

## 1. Overview
A scheduled script intended to query maintenance-related data nightly using a large SuiteQL statement.

---

## 2. Business Goal
Provide a nightly maintenance data query foundation; current implementation does not update records.

---

## 3. User Story
- As an admin, I want nightly maintenance data processed so that assets stay current.
- As a developer, I want a scheduled entry point so that I can extend it later.
- As a support user, I want a nightly job so that maintenance data is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled | SuiteQL query | Nightly run | Execute query, page results, log output |

---

## 5. Functional Requirements
- The system must execute a SuiteQL query that joins recent completed tasks, upcoming tasks, case details, equipment assets, hour meter readings, and maintenance records.
- The system must page results with runSuiteQLPaged.
- The system must log query results.
- Errors must be logged without stopping the schedule.

---

## 6. Data Contract
### Record Types Involved
- Task
- Support Case
- Project (Job)
- customrecord_nx_asset
- customrecord_sna_hul_hour_meter
- customrecord_nxc_mr

### Fields Referenced
- custevent_nxc_equip_asset_hidden
- cseg_sna_revenue_st
- custentity_nx_project_type
- custrecord_nxc_mr_field_222
- custrecord_sna_hul_actual_reading

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Query returns zero rows and script still completes.
- SuiteQL error logs and exits.

---

## 8. Implementation Notes (Optional)
- Current script does not persist results.

---

## 9. Acceptance Criteria
- Given the nightly run, when executed, then the SuiteQL query runs and results are paged and logged.
- Given errors, when they occur, then they are logged without crashing the script.

---

## 10. Testing Notes
- Run scheduled script and confirm it completes without error.
- Confirm zero-row results still complete.

---

## 11. Deployment Notes
- Upload hul_fsa_maint_data_nightly_ss.js.
- Create Scheduled Script record and schedule nightly execution.
- Rollback: disable the Scheduled Script deployment.

---

## 12. Open Questions / TBDs
- Should this script be replaced by the MR jobs?
- Should query results be persisted somewhere?
- Heavy query runtime.
- No updates applied.

---
