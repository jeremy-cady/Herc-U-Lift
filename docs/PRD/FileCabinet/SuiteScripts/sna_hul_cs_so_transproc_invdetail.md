# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SOTransProcInvDetail
title: SO Transfer Process Inventory Detail Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_so_transproc_invdetail.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Inventory Item
  - Suitelet for transfer inventory detail

---

## 1. Overview
A client script for the inventory detail popup used by the SO Transfer Process Suitelet.

---

## 2. Business Goal
Capture and validate inventory detail lines for transfer processing.

---

## 3. User Story
As a user, when I enter inventory details, I want quantities validated, so that transfers are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custpage_sublist_invdetdata | popup loads | Populate inventory detail from JSON |
| fieldChanged | custpage_sublist_frombins | from bin changed | Populate qty available and set to-bin |
| client action | OK | user submits | Validate quantities and return JSON |

---

## 5. Functional Requirements
- On page init, read JSON inventory detail data from the opener and populate `custpage_sublist_invdetdata`.
- When `custpage_sublist_frombins` changes, populate `custpage_sublist_qtyavail` from the selected bin.
- When `custpage_sublist_frombins` changes, set `custpage_sublist_tobins` to the preferred bin at the destination location.
- On OK, validate:
  - Each line quantity <= available quantity
  - Total quantity equals header quantity
- If valid, send JSON back to the opener via `updateLine` and close the window.

---

## 6. Data Contract
### Record Types Involved
- Inventory Item
- Suitelet for transfer inventory detail

### Fields Referenced
- Header | custpage_itemfield
- Header | custpage_qtyfield
- Sublist | custpage_sublist_frombins
- Sublist | custpage_sublist_tobins
- Sublist | custpage_sublist_qty
- Sublist | custpage_sublist_qtyavail

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Quantity exceeds available; alert shown.
- Total quantity mismatch; alert shown.
- Missing JSON data allows entry from scratch.

---

## 8. Implementation Notes (Optional)
- Communicates with parent Suitelet via `window.opener.updateLine`.
- Requires popup access and opener reference.

---

## 9. Acceptance Criteria
- Given existing JSON, when popup loads, then lines populate.
- Given invalid quantities, when submitting, then validation blocks return.

---

## 10. Testing Notes
- Open popup with existing data; verify lines populate.
- Enter quantities exceeding available; verify alert.
- Total quantity mismatch; verify alert.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_so_transproc_invdetail.js`.
- Deploy to the inv detail Suitelet.
- Rollback: remove client script deployment from the Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script enforce bin selection for all lines?
- Risk: Opener window unavailable.

---
