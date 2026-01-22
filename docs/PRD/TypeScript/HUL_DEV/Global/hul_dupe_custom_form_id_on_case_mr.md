# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_dupe_custom_form_id_on_case_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case

---

## 1. Overview
Map/Reduce script that re-saves selected Support Case records to trigger a User Event that populates missing custom form IDs.

---

## 2. Business Goal
Populate missing custom form IDs on Support Cases by re-saving targeted records.

---

## 3. User Story
As a user, when I run the Map/Reduce, I want targeted Support Cases re-saved to trigger form ID population, so that missing custom form IDs are filled in.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custevent_hul_custom_form_id | Support Case matches filters | Load and save case to trigger User Event |

---

## 5. Functional Requirements
- getInputData: Search active Support Cases where custevent_hul_custom_form_id is empty, filtered by case type and department lists.
- map: Write case IDs forward to reduce.
- reduce: Load each case and save it to trigger the related User Event script.
- summarize: Log map/reduce errors and counts processed cases.
- Log errors in map/reduce/summarize via log.error.

---

## 6. Data Contract
### Record Types Involved
- Support Case

### Fields Referenced
- custevent_hul_custom_form_id
- isinactive
- casetype
- department

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Script does not set the custom form ID directly; relies on User Event logic triggered by save().

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
