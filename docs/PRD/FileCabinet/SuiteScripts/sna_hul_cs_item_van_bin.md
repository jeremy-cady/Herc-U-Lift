# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ItemVanBin
title: Item Van Bin Assignment Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_item_van_bin.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item
  - Custom Record (customrecord_sna_van_bin_assignment)
  - Location

---

## 1. Overview
A client script that validates Van Bin Assignment sublist entries on Item records.

---

## 2. Business Goal
Prevent duplicate item-location assignments in the Van Bin Assignment custom record.

---

## 3. User Story
As an inventory admin, when I add van bin assignments, I want duplicates blocked, so that data stays clean.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| validateLine | custrecord_sna_vba_item, custrecord_sna_vba_loc | sublist line added | Search for duplicates and block if found |

---

## 5. Functional Requirements
- On line validation for `recmachcustrecord_sna_vba_item`, read `custrecord_sna_vba_item` and `custrecord_sna_vba_loc`.
- Search for existing `customrecord_sna_van_bin_assignment` records with the same item and location.
- If a duplicate exists, show an alert and block the line insert.

---

## 6. Data Contract
### Record Types Involved
- Item
- Custom Record (customrecord_sna_van_bin_assignment)
- Location

### Fields Referenced
- Sublist | recmachcustrecord_sna_vba_item
- Van Bin Assignment | custrecord_sna_vba_item
- Van Bin Assignment | custrecord_sna_vba_loc

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing item or location should allow user to correct before validation.
- Duplicate item-location pair; alert shown and line blocked.

---

## 8. Implementation Notes (Optional)
- Uses client-side search and dialog alerts.

---

## 9. Acceptance Criteria
- Given an existing item-location assignment, when a duplicate is entered, then the line is blocked with an alert.

---

## 10. Testing Notes
- Add a new item-location pair; save succeeds.
- Add a duplicate pair; alert shown and line blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_item_van_bin.js`.
- Deploy to item record forms.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the duplicate check include bin or subsidiary filters?
- Risk: Search latency during line validation.

---
