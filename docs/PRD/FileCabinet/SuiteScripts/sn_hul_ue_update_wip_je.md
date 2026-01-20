# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateWIPJE
title: Update WIP JE on IF Edit/Delete (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sn_hul_ue_update_wip_je.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Fulfillment

---

## 1. Overview
A User Event that blocks deletion of item fulfillments with related WIP JEs and tracks removed lines on edit.

---

## 2. Business Goal
Prevent deleting fulfillments with WIP reclass JEs and capture removed items for downstream JE updates.

---

## 3. User Story
As an accounting user, when I delete or edit an item fulfillment, I want deletions blocked if WIP JEs exist and removed items captured, so that WIP accounting stays consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custbody_sna_hul_je_wip | delete and WIP JE exists | Throw error to block deletion |
| beforeSubmit | custbody_sn_removed_lines | edit and itemreceive = false | Record removed item IDs |

---

## 5. Functional Requirements
- On delete, throw an error if `custbody_sna_hul_je_wip` is populated.
- On edit, identify item lines where `itemreceive` is false and record them in `custbody_sn_removed_lines`.
- Exclude items that are still received from the removed list.

---

## 6. Data Contract
### Record Types Involved
- Item Fulfillment

### Fields Referenced
- Item Fulfillment | custbody_sna_hul_je_wip
- Item Fulfillment | custbody_sn_removed_lines
- Item Fulfillment line | itemreceive

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Delete blocked when WIP JE references exist.
- No removed lines; field remains empty.
- Removed lines tracked by item IDs only.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: line iteration per edit.

---

## 9. Acceptance Criteria
- Given a fulfillment with WIP JE references, when delete is attempted, then deletion is blocked.
- Given item lines removed on edit, when saved, then `custbody_sn_removed_lines` is populated.

---

## 10. Testing Notes
- Edit fulfillment with removed lines; confirm field populated.
- Delete fulfillment with WIP JE; confirm deletion blocked.
- Edit with no removed lines; confirm field empty.

---

## 11. Deployment Notes
- Upload `sn_hul_ue_update_wip_je.js`.
- Deploy on Item Fulfillment.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should removed lines track line IDs instead of item IDs?
- Risk: Duplicate items in removed list.

---
