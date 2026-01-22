# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_set_current_meter_reading_on_equip_obj_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Parts/hul_set_current_meter_reading_on_equip_obj_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
Map/Reduce script that sets each equipment object's current meter reading to the latest hour meter value.

---

## 2. Business Goal
Keep equipment object meter readings aligned with the latest hour meter data.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want each equipment object's current meter reading updated to the latest hour meter value, so that readings are current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custrecord_hul_meter_key_static | Object has equipment model and is in ID range | Set field to latest hour meter value (or null if 0) |

---

## 5. Functional Requirements
- getInputData: Search customrecord_sna_objects with a non-empty equipment model and internal ID range 1253220000 to 10000000000.
- map: Write each object internal ID to reduce.
- reduce:
  - Query maximum hour meter reading for the object.
  - Set custrecord_hul_meter_key_static to that value (or null if 0).
- summarize: No active logic (placeholder).

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects (equipment objects)
- customrecord_sna_hul_hour_meter (hour meter readings)

### Fields Referenced
- customrecord_sna_objects.equipment model (field ID TBD)
- customrecord_sna_objects.custrecord_hul_meter_key_static
- customrecord_sna_hul_hour_meter reading value (field ID TBD)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Uses SuiteQL MAX() to compute the latest reading.
- Internal ID range filter is hardcoded.

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
- Equipment model field ID
- Hour meter reading field ID
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
