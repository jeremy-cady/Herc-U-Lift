# PRD: Clear Zero Meter Key on Objects (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ObjectsZeroMeterMR
title: Clear Zero Meter Key on Objects (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_objects_with_zero_meter_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects

---

## 1. Overview
A Map/Reduce script that finds object records with a meter key value of '0' and clears the field.

---

## 2. Business Goal
Remove invalid zero meter key values from object records to keep meter tracking accurate.

---

## 3. User Story
- As an admin, I want to clear invalid meter values so that reports are accurate.
- As a support user, I want a bulk process so that cleanup is efficient.
- As a developer, I want the script to be simple and reliable so that it can be rerun if needed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custrecord_hul_meter_key_static | custrecord_hul_meter_key_static = '0' | Set custrecord_hul_meter_key_static to null |

---

## 5. Functional Requirements
- The system must query customrecord_sna_objects where custrecord_hul_meter_key_static = '0'.
- The system must return a list of matching object IDs.
- The map stage must submit fields to set custrecord_hul_meter_key_static to null.
- Errors must be logged without stopping the process.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects

### Fields Referenced
- custrecord_hul_meter_key_static

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No objects match: script completes without errors.
- submitFields errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses map stage only; no reduce stage.

---

## 9. Acceptance Criteria
- Given objects with meter key '0', when processed, then the field is cleared.
- Given non-matching objects, when processed, then they are not updated.
- Given errors, when they occur, then they are logged.

---

## 10. Testing Notes
- Run with sample objects having meter key '0' and confirm values are cleared.
- Run with no matches and confirm completion without errors.

---

## 11. Deployment Notes
- Upload hul_objects_with_zero_meter_mr.js.
- Create Map/Reduce script record.
- Run in sandbox and validate updates.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should this script run on a schedule or be one-time only?
- Should a summary email be sent after completion?
- Clearing valid zero values.

---
