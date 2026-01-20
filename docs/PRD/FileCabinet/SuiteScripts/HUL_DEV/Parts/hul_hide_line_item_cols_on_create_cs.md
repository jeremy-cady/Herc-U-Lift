# PRD: Hide Line Item Columns on Create (Client Script)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-HideLineItemColsCreateCS
title: Hide Line Item Columns on Create (Client Script)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_cols_on_create_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transactions with item sublist

---

## 1. Overview
A client script that hides a specific item sublist column when creating transactions for certain roles.

---

## 2. Business Goal
Reduce line-item clutter for partner roles during record creation by hiding an internal service hours column.

---

## 3. User Story
- As a partner user, I want internal service hour fields hidden so that data entry is simpler.
- As an admin, I want partner roles limited to relevant fields so that forms are clean.
- As a support user, I want the rule applied only on create so that edit views remain unchanged.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custcol_sna_hul_act_service_hours | ctx.mode == create and role in 3, 1175, 1174, 1185, 1163, 1168, 1152 | Hide item sublist field |

---

## 5. Functional Requirements
- The system must execute on pageInit.
- The system must only run when ctx.mode == create.
- The system must check the current user role against 3, 1175, 1174, 1185, 1163, 1168, 1152.
- When role matches, the system must hide custcol_sna_hul_act_service_hours on the item sublist.
- Errors must be logged but not block the page.

---

## 6. Data Contract
### Record Types Involved
- Transactions with item sublist

### Fields Referenced
- custcol_sna_hul_act_service_hours

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Sublist field missing on form: script logs error.
- Script does not run on edit/copy.

---

## 8. Implementation Notes (Optional)
- Uses getSublistField for line 0 only.

---

## 9. Acceptance Criteria
- Given a listed role in create mode, when pageInit runs, then the target column is hidden.
- Given a non-listed role, when pageInit runs, then the column remains visible.
- Given edit/copy modes, when pageInit runs, then the script does nothing.

---

## 10. Testing Notes
- Create a transaction as a listed role and confirm the column is hidden.
- Create a transaction as a non-listed role and confirm the column is visible.
- Verify missing field logs error without blocking.

---

## 11. Deployment Notes
- Upload hul_hide_line_item_cols_on_create_cs.js.
- Deploy as a client script on target transaction forms.
- Rollback: disable the client script deployment.

---

## 12. Open Questions / TBDs
- Should additional columns be hidden on create?
- Should line-based hiding apply to all lines, not just line 0?
- Field not present on form.
- Role list changes.

---
