# PRD: Set Current Meter Reading on Equipment Objects (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetCurrentMeterReadingMR
title: Set Current Meter Reading on Equipment Objects (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_set_current_meter_reading_on_equip_obj_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
A Map/Reduce script that calculates the latest hour meter reading for equipment objects and updates the object record with that value.

---

## 2. Business Goal
Ensure equipment object records reflect the most current meter reading derived from hour meter records.

---

## 3. User Story
- As a service user, I want equipment objects to show current meter readings so that maintenance data is accurate.
- As an admin, I want a bulk update process so that meter values are synchronized.
- As a developer, I want the script to scale so that large object lists are handled.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custrecord_sna_equipment_model, custrecord_hul_meter_key_static | Equipment object with model and ID in range | Set meter key to max hour meter reading |

---

## 5. Functional Requirements
- The system must search customrecord_sna_objects where custrecord_sna_equipment_model is not empty and internalidnumber between 1253220000 and 10000000000.
- The system must page results using runPaged (page size 1000).
- The reduce stage must query MAX(customrecord_sna_hul_hour_meter_reading) for custrecord_sna_hul_object_ref = object ID.
- If the max reading equals 0, the system must set it to null.
- The system must update custrecord_hul_meter_key_static on the object record.
- Errors must be logged and not stop processing.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- customrecord_sna_hul_hour_meter

### Fields Referenced
- custrecord_sna_equipment_model
- custrecord_hul_meter_key_static
- custrecord_sna_hul_object_ref
- custrecord_sna_hul_hour_meter_reading
- internalidnumber

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Object has no hour meter records: meter key may become null.
- SuiteQL query fails: error logged.
- submitFields errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses internalidnumber range filter as a gate.
- SuiteQL per object in reduce.

---

## 9. Acceptance Criteria
- Given equipment objects, when processed, then meter key updates to latest reading.
- Given max reading 0, when processed, then meter key is cleared to null.
- Given errors, when they occur, then they are logged without stopping the run.

---

## 10. Testing Notes
- Run with objects that have hour meter readings and confirm max reading is used.
- Run with max reading 0 and confirm meter key is cleared.
- Verify errors are logged.

---

## 11. Deployment Notes
- Upload hul_set_current_meter_reading_on_equip_obj_mr.js.
- Create Map/Reduce script record.
- Run in sandbox and validate meter updates.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the ID range filter be replaced with a field-based filter?
- Should a summary report be generated?
- Large datasets increase runtime.
- Missing hour meter data.

---
