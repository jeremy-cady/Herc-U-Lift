# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TimeAllocUpdate
title: Time Allocation Update
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_time_alloc_update.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record | customrecord_sna_time_allocation

---

## 1. Overview
A Map/Reduce script that computes actual and allocated travel/service times for Time Allocation records.

---

## 2. Business Goal
Automates calculation of time allocation metrics based on start, arrival, and completion timestamps.

---

## 3. User Story
As a service manager, when time allocation records are updated, I want metrics computed automatically, so that reporting is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Saved search result | Compute and update allocation times |

---

## 5. Functional Requirements
- The script must load a saved search from parameter `custscript_sna_time_alloc_srch`.
- The script must read time allocation fields to compute travel and service time.
- The script must detect Travel Home tasks by task type value `20`.
- The script must allocate Travel Home time across non-Travel-Home entries.
- The script must update each time allocation record with calculated values.

---

## 6. Data Contract
### Record Types Involved
- Custom Record | `customrecord_sna_time_allocation`

### Fields Referenced
- Time Allocation | `custrecord_sna_ta_start_time`
- Time Allocation | `custrecord_sna_ta_arrival_time`
- Time Allocation | `custrecord_sna_ta_completion_time`
- Time Allocation | `custrecord_sna_ta_task.custevent_nx_task_type`
- Time Allocation | `custrecord_sna_ta_actual_travel_time`
- Time Allocation | `custrecord_sna_ta_actual_service_time`
- Time Allocation | `custrecord_sna_ta_allocated_travel_time`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No Travel Home task present results in no allocated travel time.
- Missing timestamps should not break processing.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: submitFields update per record in reduce stage.
- Constraints: Requires valid timestamps on Time Allocation records.
- Dependencies: Task type configuration where value 20 represents Travel Home.
- Risk: Missing time values causing incorrect calculations.

---

## 9. Acceptance Criteria
- Given Time Allocation records in the search, when the script runs, then actual travel and service times are updated.
- Given Travel Home records exist, when the script runs, then allocated travel time is distributed across non-Travel-Home records.

---

## 10. Testing Notes
- Happy path: Time Allocation record with start/arrival/completion times is updated correctly.
- Edge case: No Travel Home task present results in no allocated travel time.
- Error handling: Missing timestamps should not break processing.
- Test data: Time Allocation records with various task types and timestamps.
- Sandbox setup: Ensure task type 20 is used for Travel Home tasks.

---

## 11. Deployment Notes
- Configure `custscript_sna_time_alloc_srch` saved search parameter.
- Upload `sna_hul_mr_time_alloc_update.js`.
- Deploy Map/Reduce with search parameter.
- Post-deployment: Verify updated time allocation fields on sample records.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Schema details are not specified.
- Should Travel Home allocation be skipped when only one record exists?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
