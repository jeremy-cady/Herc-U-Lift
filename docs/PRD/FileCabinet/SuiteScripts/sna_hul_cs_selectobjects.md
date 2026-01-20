# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SelectObjects
title: Select Objects Suitelet Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_selectobjects.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Suitelet for object selection
  - Originating transaction (Sales Order or Quote)

---

## 1. Overview
A client script for the Select Objects Suitelet that manages filter changes, pagination, and object selection from a list.

---

## 2. Business Goal
Keep Suitelet filters synchronized with the originating transaction and enforce selecting at least one object.

---

## 3. User Story
As a sales user, when I select objects, I want to filter the list and pick the correct equipment, so that selection is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | filters | missing values | Set defaults from opener transaction |
| fieldChanged | filters, page | value changed | Redirect Suitelet with retained filters |
| saveRecord | custpage_selectedfld | no selection | Block save and alert |

---

## 5. Functional Requirements
- On page init, capture current filter values into a global state and set defaults from the opener transaction when missing.
- When pagination changes, redirect the Suitelet while retaining selected objects and filter values.
- When filter fields change, refresh the Suitelet with updated parameters.
- On save, ensure at least one object is selected and set `custpage_selectedfld`.
- Support canceling the Suitelet by closing the window.

---

## 6. Data Contract
### Record Types Involved
- Suitelet for object selection
- Originating transaction (Sales Order or Quote)

### Fields Referenced
- Suitelet | custpage_selectedfld
- Suitelet | custpage_objfld
- Suitelet | custpage_fleetnofld
- Suitelet | custpage_segmfld
- Suitelet | custpage_segmkeyfld
- Suitelet | custpage_respcenterfld
- Suitelet | custpage_manuffld
- Suitelet | custpage_modelfld
- Suitelet | custpage_custfld
- Suitelet | custpage_custprgrpfld
- Suitelet | custpage_trandtefld
- Suitelet | custpage_loccodefld
- Suitelet | custpage_dummyfld
- Suitelet | custpage_earliestfld
- Suitelet | custpage_equipsublist.custpage_selectsubfld
- Suitelet | custpage_equipsublist.custpage_objidsubfld

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No objects selected; save blocked.
- Missing opener record should not crash page load.
- Filters persist across page changes.

---

## 8. Implementation Notes (Optional)
- Redirects to Suitelet `customscript_sna_hul_sl_selectobject` with filter parameters.
- Uses `window.opener` to read originating transaction fields.

---

## 9. Acceptance Criteria
- Given filter changes, when updated, then Suitelet refreshes with filters retained.
- Given no objects selected, when saving, then save is blocked with an alert.

---

## 10. Testing Notes
- Open Suitelet from Sales Order; filters prefill from transaction.
- Select an object and save; selected value stored.
- Change page and ensure filters persist.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_selectobjects.js`.
- Deploy to the Select Objects Suitelet.
- Rollback: remove client script deployment from the Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should multiple object selection be allowed (radio vs checkbox)?
- Risk: Large filters cause slow Suitelet reloads.

---
