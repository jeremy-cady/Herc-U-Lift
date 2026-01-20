# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SOTransferProcess
title: SO Transfer Process Suitelet Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_so_transfer_process.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Suitelet for SO transfer process
  - Item

---

## 1. Overview
A client script for the SO Transfer Process Suitelet that manages inventory detail entry and validation on transfer lines.

---

## 2. Business Goal
Ensure from-location quantities and inventory details are entered before processing transfers.

---

## 3. User Story
As a user, when I process transfers, I want inventory details enforced, so that transfers are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | updateLine | Suitelet loads | Receive inventory detail JSON from inv detail Suitelet |
| fieldChanged | custpage_sublist_locinvdet | click | Open inv detail Suitelet |
| fieldChanged | custpage_sublist_fromloc | location changed | Clear inv detail data and update qty available |
| saveRecord | custpage_sublist_chk | save invoked | Validate required fields for checked lines |

---

## 5. Functional Requirements
- On page init, expose `updateLine` to receive inventory detail JSON from the inv detail Suitelet.
- When `custpage_sublist_locinvdet` is clicked, open the inv detail Suitelet with item, quantity, line, and location parameters.
- When `custpage_sublist_fromloc` changes, clear existing inv detail data and update available quantity using an item search.
- On save, require at least one checked line.
- For checked lines, require from location, inventory detail (for bin items and inventory transfer), and sufficient quantity available.

---

## 6. Data Contract
### Record Types Involved
- Suitelet for SO transfer process
- Item

### Fields Referenced
- Sublist | custpage_sublist_chk
- Sublist | custpage_sublist_item
- Sublist | custpage_sublist_qty
- Sublist | custpage_sublist_fromloc
- Sublist | custpage_sublist_toloc
- Sublist | custpage_sublist_locinvdet
- Sublist | custpage_sublist_locinvdetdata
- Sublist | custpage_sublist_locinvdetenter
- Sublist | custpage_sublist_qtyfrmloc
- Sublist | custpage_sublist_itemusebins
- Sublist | custpage_sublist_trtocreated

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- From location empty; save blocked.
- Inventory detail missing for bin item; save blocked.
- Qty requested exceeds available; save blocked.
- Item search returns no availability; qty available set to 0.

---

## 8. Implementation Notes (Optional)
- Suitelet `customscript_sna_hul_so_transproc_invdet` for inventory detail entry.
- Requires popup access for inventory detail entry.

---

## 9. Acceptance Criteria
- Given bin items on checked lines, when saving without inventory detail, then save is blocked.
- Given qty exceeds available, when saving, then save is blocked.

---

## 10. Testing Notes
- Select a line, set from location, enter inventory detail, and save.
- From location empty; save blocked.
- Inventory detail missing; save blocked.
- Qty exceeds available; save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_so_transfer_process.js`.
- Deploy to the SO Transfer Process Suitelet.
- Rollback: remove client script deployment from the Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should maximum checked lines be enforced (commented logic)?
- Risk: Users bypass inv detail by closing popup.

---
