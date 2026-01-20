# PRD: Set New Meter Readings Daily (Scheduled Script)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetNewMeterReadingsSS
title: Set New Meter Readings Daily (Scheduled Script)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_set_new_meter_readings_daily_ss.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
A scheduled script that finds objects with new hour meter readings in the last day and updates the object’s current meter and last reading date.

---

## 2. Business Goal
Keep object records synchronized with newly entered hour meter readings without manual updates.

---

## 3. User Story
- As a service user, I want meter readings updated daily so that object records stay current.
- As an admin, I want automation so that manual updates are not needed.
- As a developer, I want a scheduled sync so that it runs consistently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled | custrecord_sna_hul_object_ref, custrecord_sna_hul_actual_reading, custrecord_hul_meter_key_static, custrecord_sna_last_meter_reading_m1 | Hour meter readings created within last day | Update object meter and last reading date |

---

## 5. Functional Requirements
- The system must query objects with hour meter readings created within the last day.
- The system must return object ID, reading date, and reading value for each match.
- For each match, the system must update custrecord_hul_meter_key_static with the latest reading and custrecord_sna_last_meter_reading_m1 with the reading date.
- The system must convert reading date strings into Date objects before updating.
- Errors must be logged without stopping the run.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- customrecord_sna_hul_hour_meter

### Fields Referenced
- custrecord_sna_hul_object_ref
- custrecord_sna_hul_actual_reading
- custrecord_hul_meter_key_static
- custrecord_sna_last_meter_reading_m1

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No readings in last day: script exits early.
- Invalid date format: update skipped for that record.
- submitFields errors are logged.

---

## 8. Implementation Notes (Optional)
- Date parsing assumes MM/DD/YYYY format.

---

## 9. Acceptance Criteria
- Given objects with new readings, when the script runs, then meter values are updated.
- Given reading dates, when updated, then last meter reading date is set correctly.
- Given errors, when they occur, then they are logged without blocking the schedule.

---

## 10. Testing Notes
- Create a new hour meter reading and verify object updates next run.
- Run with no readings and confirm script exits quietly.
- Verify invalid date formats are skipped.

---

## 11. Deployment Notes
- Upload hul_set_new_meter_readings_daily_ss.js.
- Create Scheduled Script record and schedule daily execution.
- Rollback: disable the Scheduled Script deployment.

---

## 12. Open Questions / TBDs
- Should the query use created or createddate consistently?
- Should time zone adjustments be applied?
- Date format mismatch.
- Multiple readings per object.

---
