# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VanBinAssignment
title: Validate Van Bin Assignment Uniqueness
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_van_bin.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_van_bin_assignment
  - item
  - location

---

## 1. Overview
Validates that an item/location pair is not duplicated across van bin assignment records.

---

## 2. Business Goal
Prevent multiple van bin assignments for the same item and location.

---

## 3. User Story
As an inventory admin, when I save a van bin assignment, I want duplicates blocked so that bin routing stays consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custrecord_sna_vba_item, custrecord_sna_vba_loc | create/edit | Search for existing assignments with the same item and location; throw error if found. |

---

## 5. Functional Requirements
- On create/edit, read `custrecord_sna_vba_item` and `custrecord_sna_vba_loc`.
- Search for existing `customrecord_sna_van_bin_assignment` records with the same item and location.
- If a duplicate exists, throw an error and prevent save.

---

## 6. Data Contract
### Record Types Involved
- Custom record: customrecord_sna_van_bin_assignment
- Item
- Location

### Fields Referenced
- Van Bin Assignment | custrecord_sna_vba_item | Item
- Van Bin Assignment | custrecord_sna_vba_loc | Location

Schemas (if known):
- Custom record | customrecord_sna_van_bin_assignment | Van bin assignment

---

## 7. Validation & Edge Cases
- Duplicate detection should exclude the current record on edit.
- Missing item or location may result in no match; behavior should be logged if needed.

---

## 8. Implementation Notes (Optional)
- Uses a simple search count to detect duplicates.

---

## 9. Acceptance Criteria
- Given an existing assignment with the same item and location, when a new one is saved, then the save is blocked with an error.
- Given a unique item/location pair, when the record is saved, then it saves successfully.

---

## 10. Testing Notes
- Create a van bin assignment with unique values and verify save.
- Create a duplicate assignment and verify error.
- Edit an existing record and verify duplicate search excludes the current record.

---

## 11. Deployment Notes
- Deploy the user event to `customrecord_sna_van_bin_assignment`.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should duplicate check explicitly exclude the current record id on edit?

---
