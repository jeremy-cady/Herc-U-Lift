# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ObjectConfigVisibility
title: Object Configuration Field Visibility Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_object.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_sna_object_config_rule)
  - Object record (custom record)

---

## 1. Overview
A client script that controls which configuration fields are visible on the Object record based on equipment segment rules.

---

## 2. Business Goal
Ensure only relevant configurable fields display for a given equipment segment and rule set.

---

## 3. User Story
As a user, when I select an equipment segment, I want only relevant configuration fields shown, so that the form is easier to complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | cseg_sna_hul_eq_seg | form loads | Apply field visibility rules |
| fieldChanged | cseg_sna_hul_eq_seg | segment changed | Reapply visibility rules |

---

## 5. Functional Requirements
- On page init, read the segment `cseg_sna_hul_eq_seg` and apply field visibility based on configuration rules.
- When `cseg_sna_hul_eq_seg` changes, reapply visibility rules.
- Load `customrecord_sna_object_config_rule` records to gather configurable field IDs.
- Show fields listed in the matching rule and hide all other fields listed across rules.
- If no segment match is found, fall back to the rule with no segment or the temporary default rule.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_sna_object_config_rule)
- Object record (custom record)

### Fields Referenced
- Object | cseg_sna_hul_eq_seg
- Config Rule | custrecord_sna_hul_configurable_fields
- Config Rule | cseg_sna_hul_eq_seg
- Object | various configuration fields listed in rules

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Segment does not match any rule; fallback rule applied.
- Segment is empty; rule with empty segment applied.
- Missing configuration rule records should not crash the form.

---

## 8. Implementation Notes (Optional)
- Relies on segment text inclusion matching for rule selection.

---

## 9. Acceptance Criteria
- Given a segment, when the form loads, then only fields configured for that segment are displayed.
- Given the segment changes, when updated, then visible fields update immediately.

---

## 10. Testing Notes
- Select a segment and verify fields display based on rule.
- Segment does not match any rule; verify fallback rule applied.
- Segment empty; verify no-segment rule applied.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_object.js`.
- Deploy to object record form.
- Rollback: remove client script deployment from object record.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should rule matching use internal IDs instead of segment text?
- Risk: Segment text mismatch leads to wrong rule.

---
