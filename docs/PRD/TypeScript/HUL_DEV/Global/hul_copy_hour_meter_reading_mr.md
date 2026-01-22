# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_copy_hour_meter_reading_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Global/hul_copy_hour_meter_reading_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects

---

## 1. Overview
Map/Reduce script stub intended to copy hour meter readings from object records, currently scoped to a single object ID.

---

## 2. Business Goal
TBD

---

## 3. User Story
As a user, when the Map/Reduce runs, I want hour meter readings copied from object records, so that they can be processed consistently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custrecord_sna_meter_key_on_m1 | Object ID is 3274 | Read meter hours and write id → hours to context |

---

## 5. Functional Requirements
- getInputData: Query all customrecord_sna_objects IDs via SuiteQL.
- map: Parse each object ID and only process ID 3274.
  - Call getMeterHours and write id → hours to context.
- reduce: No logic (placeholder).
- summarize: No logic (placeholder).

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
- getMeterHours references ctx.currentRecord but Map/Reduce context does not provide currentRecord.
- reduce and summarize are placeholders with no logic.
- Script is scoped to object ID 3274 only.

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
- Business goal
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
