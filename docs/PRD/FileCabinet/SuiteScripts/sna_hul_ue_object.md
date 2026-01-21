# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-Object
title: Object Config Field Visibility and Updates
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_object.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_sna_object_config_rule
  - purchaseorder

---

## 1. Overview
User Event that controls visibility of configuration fields on Object records and triggers downstream updates when object values change.

---

## 2. Business Goal
Limit object configuration fields based on equipment segment rules and keep related Sales Orders and POs in sync when object values change.

---

## 3. User Story
As a user or sales admin, when object values change, I want relevant fields visible and related records updated, so that data stays consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Config fields | UI view mode | Show/hide fields based on `customrecord_sna_object_config_rule` |
| afterSubmit | custrecord_sna_hul_obj_commissionable_bv | edit/xedit | Trigger MR `customscript_sna_hul_mr_upd_socombookval` |
| afterSubmit | custrecord_sna_fleet_code, custrecord_sna_serial_no | edit/xedit | Update matching PO lines with new values |

---

## 5. Functional Requirements
- In UI view mode, show/hide fields based on configuration rules in `customrecord_sna_object_config_rule`.
- On edit/xedit, if commissionable book value changes, trigger MR `customscript_sna_hul_mr_upd_socombookval`.
- On edit/xedit, if fleet code or serial number changes, update matching PO lines with new values.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- customrecord_sna_object_config_rule
- purchaseorder

### Fields Referenced
- object | cseg_sna_hul_eq_seg | Equipment segment
- object | custrecord_sna_hul_obj_commissionable_bv | Commissionable book value
- object | custrecord_sna_fleet_code | Fleet code
- object | custrecord_sna_serial_no | Serial number
- PO line | custcol_sna_po_fleet_code | Fleet code
- PO line | custcol_sna_hul_eq_serial | Serial number
- PO line | custcol_sna_hul_fleet_no | Fleet object

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Object without matching config rule uses default rule.
- No related PO lines results in no updates.
- PO update errors are logged.

---

## 8. Implementation Notes (Optional)
- UI field hiding only runs in view mode and UI context.
- Map/Reduce `customscript_sna_hul_mr_upd_socombookval` used for SO updates.

---

## 9. Acceptance Criteria
- Given a configured object, when viewing, then only matching configuration fields are shown.
- Given commissionable book value changes, when afterSubmit runs, then MR update is triggered.
- Given fleet/serial changes, when afterSubmit runs, then matching PO lines update.

---

## 10. Testing Notes
- View object form and verify fields display per configuration rule.
- Update commissionable book value and verify MR triggers.
- No related PO lines results in no updates.
- Deploy User Event on Object record.

---

## 11. Deployment Notes
- Confirm configuration rule records exist.
- Deploy User Event on Object record and validate UI and update behavior.
- Monitor logs for MR and PO update errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should PO updates be restricted to specific PO types?

---
