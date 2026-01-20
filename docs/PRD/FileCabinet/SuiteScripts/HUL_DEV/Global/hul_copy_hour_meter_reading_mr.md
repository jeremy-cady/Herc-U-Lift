# PRD: Copy Hour Meter Reading (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20240906-CopyHourMeterReading
title: Copy Hour Meter Reading (Map/Reduce)
status: Implemented (Partial/Stub)
owner: Jeremy Cady
created: September 6, 2024
last_updated: September 6, 2024

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_copy_hour_meter_reading_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects

---

## 1. Overview
A Map/Reduce intended to iterate equipment object records and copy an hour meter reading value.

---

## 2. Business Goal
Provide a batch mechanism to read hour meter data from equipment object records (currently limited to a specific object ID).

---

## 3. User Story
- As a developer, I want to batch read hour meter values so that I can test data extraction.
- As an admin, I want to process object records via Map/Reduce so that I can scale later.
- As a stakeholder, I want to see prototype output so that we can validate the approach.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custrecord_sna_meter_key_on_m1 | Object ID 3274 | Emit object ID and hours in map output |

---

## 5. Functional Requirements
- The system must query customrecord_sna_objects IDs via SuiteQL.
- The system must emit entries for matching object IDs (currently hardcoded to 3274).
- The system must attempt to read custrecord_sna_meter_key_on_m1 from the current record context.
- The system must write the object ID and hours to the map output.
- Errors are logged without stopping the script.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects

### Fields Referenced
- custrecord_sna_meter_key_on_m1

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Other object IDs are ignored.
- Hour meter field blank: logs empty value.
- Errors in map are logged.

---

## 8. Implementation Notes (Optional)
- Hardcoded object ID 3274.
- getMeterHours uses ctx.currentRecord, which is not available in Map/Reduce map context.

---

## 9. Acceptance Criteria
- Given customrecord_sna_objects IDs, when processed, then object ID 3274 triggers a meter read.
- Given object ID 3274, when processed, then map output includes object ID and hours.
- Given errors, when they occur, then they are logged without stopping the script.

---

## 10. Testing Notes
- Run Map/Reduce and confirm object 3274 logs meter reading.
- Verify other object IDs are ignored.
- Verify blank meter field logs empty value.

---

## 11. Deployment Notes
- Deploy Map/Reduce (prototype).
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should this be converted to a full map/reduce with record loads?
- Map context lacks currentRecord.

---
