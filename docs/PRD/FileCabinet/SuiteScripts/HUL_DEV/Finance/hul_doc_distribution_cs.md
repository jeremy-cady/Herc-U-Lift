# PRD: Doc Distribution Shift-Click Selection
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DocDistributionShiftClick
title: Doc Distribution Shift-Click Selection
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_doc_distribution_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Doc Distribution Suitelet (custpage_results sublist)

---

## 1. Overview
A Client Script that enables Shift-click range selection for checkbox columns on the Doc Distribution results sublist.

---

## 2. Business Goal
Users can quickly select or clear multiple rows at once instead of clicking each checkbox individually.

---

## 3. User Story
- As a user, I want to Shift-click a checkbox range so that I can select multiple rows quickly.
- As a user, I want to bulk-clear a range so that I can reset selections easily.
- As an admin, I want to limit changes to visible rows so that pagination behavior remains predictable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged (Shift-click) | hide_line, dismiss, apply_email | Shift key held and prior line exists for the field | Toggle entire range to match current checkbox value; prevent re-entrant fieldChanged logic |

---

## 5. Functional Requirements
- The system must listen for Shift key down/up events to detect Shift-clicks.
- The system must target sublist custpage_results only.
- The system must apply range selection to fields: hide_line, dismiss, apply_email.
- When Shift is held and a prior line exists for the field, the system must toggle the entire range to match the current checkbox value.
- The system must prevent re-entrant fieldChanged logic while toggling a range.

---

## 6. Data Contract
### Record Types Involved
- Doc Distribution Suitelet (custpage_results sublist)

### Fields Referenced
- custpage_results
- hide_line
- dismiss
- apply_email

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Shift-click without a prior anchor line: only current line toggles.
- Shift-click across page boundaries: only current page affected.
- Non-target sublists or fields are unaffected.

---

## 8. Implementation Notes (Optional)
- Behavior is limited to the current visible sublist page.
- Shift detection is global to the window and only affects supported fields.

---

## 9. Acceptance Criteria
- Given a prior checkbox click, when Shift-clicking a supported column, then the range between the last click and current line is toggled.
- Given a range toggle, when the script updates lines, then no infinite loop or recursion occurs.
- Given multiple sublists, when Shift-clicking, then only custpage_results is affected.
- Given non-target fields, when clicked, then no range toggle occurs.

---

## 10. Testing Notes
- Click a checkbox, then Shift-click another in the same column and confirm the range toggles.
- Repeat in each supported column.
- Verify Shift-click without a prior anchor line only toggles the current line.
- Verify Shift-click across page boundaries affects only the current page.
- Verify no console errors during range toggles.

---

## 11. Deployment Notes
- Attach the client script to the Doc Distribution Suitelet.
- Validate Shift-click behavior in production.
- Rollback: remove the client script from the Suitelet.

---

## 12. Open Questions / TBDs
- Should additional checkbox columns be supported?
- Sublist field IDs change in the Suitelet.

---
