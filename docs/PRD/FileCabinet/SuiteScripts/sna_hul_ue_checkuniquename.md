# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CheckUniqueName
title: Check Unique Name
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_checkuniquename.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
User Event that enforces unique names for Item Category, Customer Pricing Group, and Item Discount Group custom records.

---

## 2. Business Goal
Prevent duplicate records based on normalized name values.

---

## 3. User Story
As an admin user, when creating or editing category and pricing group records, I want duplicate names blocked, so that data remains clean.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | name | create/edit on configured custom records | Normalize name, search for duplicates, and throw error if found |

---

## 5. Functional Requirements
- Run beforeSubmit on configured custom records.
- Normalize names (lowercase, remove spaces and symbols).
- Search for existing records with matching normalized name.
- Throw an error if a duplicate exists.

---

## 6. Data Contract
### Record Types Involved
- TBD

### Fields Referenced
- Custom record | name | Name field for uniqueness check

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate name with different spacing or punctuation is blocked.
- Existing record edits do not trigger false duplicates for the same record.
- Error message stops record save.

---

## 8. Implementation Notes (Optional)
- Uniqueness relies on formula normalization; special characters are stripped.
- Performance/governance considerations: Single search per submit.

---

## 9. Acceptance Criteria
- Given a duplicate normalized name on create/edit, when beforeSubmit runs, then the save is blocked with an error.
- Given an edit to the same record, when beforeSubmit runs, then no duplicate is falsely detected.

---

## 10. Testing Notes
- Create a unique record name successfully.
- Duplicate name with different spacing or punctuation is blocked.
- Deploy User Event on target custom record types.

---

## 11. Deployment Notes
- Confirm target custom record types are included.
- Deploy User Event on target custom record types and validate duplicate prevention.
- Monitor error logs for false positives; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the error message be customized by record type?

---
