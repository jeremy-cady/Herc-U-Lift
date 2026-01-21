# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LocationMarkup
title: Location Markup Uniqueness
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_locationmarkup.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_locationmarkup

---

## 1. Overview
User Event that enforces unique Item Category + Location combinations on Location Markup records.

---

## 2. Business Goal
Prevent duplicate location markup records for the same item category and location.

---

## 3. User Story
As an admin, when creating location markup records, I want duplicates blocked, so that pricing data remains clean.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | item category, location | any | Search for duplicates and throw error if found |

---

## 5. Functional Requirements
- Run beforeSubmit on Location Markup records.
- Search for existing records with the same item category and location.
- Throw an error when a duplicate exists.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_locationmarkup

### Fields Referenced
- customrecord_sna_hul_locationmarkup | custrecord_sna_hul_itemcat | Item category
- customrecord_sna_hul_locationmarkup | custrecord_sna_hul_loc | Location

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate combination is blocked.
- Search errors are logged.
- Duplicate records created via data load may bypass validation.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One search per submit.

---

## 9. Acceptance Criteria
- Given an existing item category/location record, when saving a duplicate, then the save is blocked with an error.

---

## 10. Testing Notes
- Create unique item category/location record successfully.
- Duplicate combination is blocked.
- Deploy User Event on Location Markup custom record.

---

## 11. Deployment Notes
- Confirm custom fields on Location Markup record.
- Deploy User Event on Location Markup custom record and validate duplicate prevention.
- Monitor logs for validation errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the uniqueness check be case-insensitive?

---
