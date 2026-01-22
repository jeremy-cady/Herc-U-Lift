# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_hide_line_item_cols_on_create_cs
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: client
  file: TypeScript/HUL_DEV/Parts/hul_hide_line_item_cols_on_create_cs.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction

---

## 1. Overview
Client Script that hides a line-level column on create for specific roles.

---

## 2. Business Goal
Hide a specific item column for targeted roles on create.

---

## 3. User Story
As a user in an allowed role, when I create a transaction, I want the service hours column hidden, so that the form shows only relevant fields.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custcol_sna_hul_act_service_hours | Mode is create and role is in allowed list | Hide the line-level field |

---

## 5. Functional Requirements
- Run only in create mode.
- If current user role is in allowed list (3, 1175, 1174, 1185, 1163, 1168, 1152), hide item sublist field custcol_sna_hul_act_service_hours.
- Use getSublistField on line 0 and set isVisible to false.

---

## 6. Data Contract
### Record Types Involved
- Transaction

### Fields Referenced
- custcol_sna_hul_act_service_hours

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Uses line 0 to hide the column; no loop across lines.

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
- Specific transaction type(s)
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
