# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_fsa_maint_data_nightly_ss
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: TypeScript/HUL_DEV/Service/hul_fsa_maint_data_nightly_ss.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case
  - customrecord_nx_asset
  - customrecord_sna_objects

---

## 1. Overview
Scheduled script that runs a SuiteQL maintenance data query and logs the result rows (no record updates).

---

## 2. Business Goal
Generate and log maintenance data for review without updating records.

---

## 3. User Story
As a user, when the nightly script runs, I want maintenance data queried and logged, so that I can review results.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled execution | TBD | Nightly run | Execute SuiteQL and log rows |

---

## 5. Functional Requirements
- Run SuiteQL query joining:
  - Recent completed tasks.
  - Upcoming tasks per project.
  - Support cases with revenue streams 263/18/19.
  - Equipment assets and related objects.
  - Latest hour meter readings per object.
  - Maintenance records tied to tasks.
- Execute query with paging.
- Log each row from the results.
- Build a resultsArray of raw rows (not persisted or returned).

---

## 6. Data Contract
### Record Types Involved
- Task
- Support Case
- customrecord_nx_asset
- customrecord_sna_objects

### Fields Referenced
- Revenue streams: cseg_sna_revenue_st
- Other fields used by query (IDs TBD)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- MaintenanceDataObject interface is defined but not used to map results.

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
