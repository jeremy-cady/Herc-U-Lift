# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PMRate
title: PM Rate Equipment Type Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_pm_rate.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_sna_objects)
  - Custom Record (customrecord_cseg_sna_hul_eq_seg)
  - Custom Record (PM Rate)

---

## 1. Overview
A client script that sets the Equipment Type on a PM Rate record when an Object Number is selected.

---

## 2. Business Goal
Keep PM rate equipment type aligned to the selected object segment hierarchy.

---

## 3. User Story
As an admin, when I select an object number on a PM Rate record, I want equipment type filled automatically, so that PM rate records are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custrecord_sna_hul_pmpriceobjectnum | value changed | Set equipment type from object segment |

---

## 5. Functional Requirements
- When `custrecord_sna_hul_pmpriceobjectnum` changes, look up `cseg_sna_hul_eq_seg` from `customrecord_sna_objects`.
- Determine the top-level equipment segment from `customrecord_cseg_sna_hul_eq_seg`.
- Set `custrecord_sna_hul_pmpriceequiptype` to the top-level segment ID.
- If the object or segment is missing, clear the equipment type field.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_sna_objects)
- Custom Record (customrecord_cseg_sna_hul_eq_seg)
- Custom Record (PM Rate)

### Fields Referenced
- PM Rate | custrecord_sna_hul_pmpriceobjectnum
- PM Rate | custrecord_sna_hul_pmpriceequiptype
- Object | cseg_sna_hul_eq_seg

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Object has no equipment segment; equipment type cleared.
- Lookup fails; script should not block save.

---

## 8. Implementation Notes (Optional)
- Requires equipment segment hierarchy to have parent-child relationships.

---

## 9. Acceptance Criteria
- Given an object number is selected, when changed, then equipment type is populated.
- Given no object segment found, when changed, then equipment type is cleared.

---

## 10. Testing Notes
- Select an object number; verify equipment type populated.
- Object with no equipment segment; verify equipment type cleared.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_pm_rate.js`.
- Deploy to PM Rate record.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should equipment type derive from a different segment if hierarchy changes?
- Risk: Segment hierarchy missing parents.

---
