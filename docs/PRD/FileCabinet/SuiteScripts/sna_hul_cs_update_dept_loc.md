# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateDeptLoc
title: Update Department and Location Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_update_dept_loc.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction record using entity field (not specified)

---

## 1. Overview
A client script that defaults Department and Location from the current user when creating a record.

---

## 2. Business Goal
Ensure new records start with the user’s department and location without manual selection.

---

## 3. User Story
As a user, when I create a record and select an entity, I want department and location defaulted, so that I do not manually select them.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | mode | form loads | Store current mode |
| fieldChanged | entity | create mode | Set department and location from current user |

---

## 5. Functional Requirements
- On page init, store the current mode.
- When `entity` changes and the mode is create, set:
  - `department` to the current user’s department
  - `location` to the current user’s location

---

## 6. Data Contract
### Record Types Involved
- Transaction record using entity field (not specified)

### Fields Referenced
- Header | entity
- Header | department
- Header | location

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Edit mode; defaults should not reapply.
- User missing department or location; fields remain unchanged.

---

## 8. Implementation Notes (Optional)
- Uses `runtime.getCurrentUser()`.

---

## 9. Acceptance Criteria
- Given create mode and entity selected, when changed, then department and location default from the current user.

---

## 10. Testing Notes
- Create a record, select entity, and verify department/location populate.
- Edit an existing record; defaults should not reapply.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_update_dept_loc.js`.
- Deploy to the applicable record.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should defaults also apply on copy mode?
- Risk: User profile missing location/department.

---
