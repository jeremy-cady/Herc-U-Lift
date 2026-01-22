# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_doc_distribution_cs
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: client
  file: TypeScript/HUL_DEV/Finance/hul_doc_distribution_cs.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
NetSuite Client Script that adds shift-click range selection for checkbox columns on a results sublist.

---

## 2. Business Goal
Enable efficient multi-line checkbox selection on the results sublist.

---

## 3. User Story
As a user, when I shift-click a checkbox on the results sublist, I want a range of lines to toggle together, so that I can update multiple rows quickly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | TBD | Page initializes | Register global Shift key listeners |
| fieldChanged | hide_line, dismiss, apply_email | Shift key held and a prior line exists for that column | Toggle range between last line and current line to match current checkbox state |
| fieldChanged | hide_line, dismiss, apply_email | Any checkbox change | Update last line anchor for that column |

---

## 5. Functional Requirements
- Track Shift key state using keydown/keyup listeners.
- On fieldChanged for sublist custpage_results checkbox columns, if Shift is held and a prior line exists for that column, toggle the range to match the current checkbox state.
- Update the last selected line per checkbox column.
- Operate only on the visible page (no cross-page selection).
- Read checkbox values with getSublistValue and normalize to boolean.
- Use setSublistValue when available; otherwise selectLine → setCurrentSublistValue → commitLine.
- Use a batching guard to avoid re-entrant fieldChanged calls while toggling ranges.
- No explicit try/catch in main handlers; rely on NetSuite to surface errors.

---

## 6. Data Contract
### Record Types Involved
- TBD

### Fields Referenced
- custpage_results.hide_line
- custpage_results.dismiss
- custpage_results.apply_email

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Range selection applies only when Shift is held and a prior line exists for that column.
- Range selection is limited to the visible page.
- No explicit error handling in event handlers.

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
- Record types involved
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
