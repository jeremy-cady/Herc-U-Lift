# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_set_new_meter_readings_daily_ss
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: scheduled
  file: TypeScript/HUL_DEV/Parts/hul_set_new_meter_readings_daily_ss.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
Scheduled script that updates object records with the latest meter reading and reading date from the last 24 hours.

---

## 2. Business Goal
Keep object meter readings and reading dates up to date based on recent hour meter data.

---

## 3. User Story
As a user, when the scheduled job runs, I want object records updated with the latest meter reading and reading date from the last day, so that readings are current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled execution (daily) | custrecord_hul_meter_key_static, custrecord_sna_last_meter_reading_m1 | Hour meter readings created within last day | Update object reading value and reading date |

---

## 5. Functional Requirements
- Query objects that have hour meter readings created within the last day.
- For each object:
  - Set custrecord_hul_meter_key_static to the latest reading.
  - Set custrecord_sna_last_meter_reading_m1 to the reading date.
- Uses SuiteQL with a subquery on readings from CURRENT_DATE - 1.
- convertToDate parses an MM/DD/YYYY string to a Date object.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- customrecord_sna_hul_hour_meter

### Fields Referenced
- custrecord_hul_meter_key_static
- custrecord_sna_last_meter_reading_m1
- customrecord_sna_hul_hour_meter created date (field ID TBD)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Reading date is parsed from an MM/DD/YYYY string.

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
- Hour meter reading created date field ID
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
