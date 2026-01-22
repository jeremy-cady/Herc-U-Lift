# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_objects_with_zero_meter_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Parts/hul_objects_with_zero_meter_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects

---

## 1. Overview
Map/Reduce script that clears the static meter key field on Object records when it is set to 0.

---

## 2. Business Goal
Clear invalid zero values from the static meter key field on Object records.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want Object records with a static meter key of 0 to be cleared, so that the field is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custrecord_hul_meter_key_static | Field value is '0' | Set field to null |

---

## 5. Functional Requirements
- getInputData: SuiteQL query for Objects where custrecord_hul_meter_key_static = '0'.
- map: Set custrecord_hul_meter_key_static to null for each record.
- reduce: No logic (placeholder).
- summarize: No logic (placeholder).

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
- map parses ctx.value as JSON, but input may be a raw ID array.
- No paging; SuiteQL uses a single result set.

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
