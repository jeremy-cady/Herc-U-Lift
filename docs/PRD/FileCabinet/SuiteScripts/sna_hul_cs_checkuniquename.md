# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CheckUniqueName
title: Unique Name Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_checkuniquename.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Category (custom record)
  - Customer Pricing Group (custom record)
  - Item Discount Group (custom record)

---

## 1. Overview
A client script that prevents duplicate names on selected custom records by checking normalized name values on save.

---

## 2. Business Goal
Enforce uniqueness for Item Category, Customer Pricing Group, and Item Discount Group records to avoid duplicates with similar formatting.

---

## 3. User Story
As an admin, when I save a custom record, I want duplicate names blocked, so that reporting and selection lists stay consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| saveRecord | name | name normalized matches existing record | Alert user and block save |

---

## 5. Functional Requirements
- On save, read the `name` field and normalize it by lowering case, removing whitespace, and stripping non-alphanumeric characters.
- Search for records of the same type with a matching normalized name.
- If the record is being edited, exclude the current record ID from the search.
- If a duplicate exists, alert the user and prevent save.

---

## 6. Data Contract
### Record Types Involved
- Item Category (custom record)
- Customer Pricing Group (custom record)
- Item Discount Group (custom record)

### Fields Referenced
- name

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate names are blocked even if punctuation or spacing differs.
- Existing records can be saved without false positives.

---

## 8. Implementation Notes (Optional)
- Client-side alert only; does not provide inline field errors.

---

## 9. Acceptance Criteria
- Given a duplicate normalized name exists, when the record is saved, then save is blocked with an alert.
- Given an existing record is edited without changing the name, when saved, then it succeeds.

---

## 10. Testing Notes
- Create a unique name; confirm save succeeds.
- Create a name differing only by punctuation or spacing; confirm save is blocked.
- Edit an existing record without name change; confirm save succeeds.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_checkuniquename.js`.
- Deploy to the Item Category, Customer Pricing Group, and Item Discount Group records.
- Rollback: remove client script deployments from the records.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the alert be replaced with an inline field error?
- Risk: False positives from normalization rules.

---
