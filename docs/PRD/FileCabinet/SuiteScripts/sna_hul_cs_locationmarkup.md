# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LocationMarkup
title: Location Markup Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_locationmarkup.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_sna_hul_locationmarkup)

---

## 1. Overview
A client script that enforces unique Item Category and Location combinations on Location Markup records.

---

## 2. Business Goal
Prevent duplicate location markup configurations for the same item category and location.

---

## 3. User Story
As an admin, when I save location markup records, I want duplicates blocked, so that pricing rules are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| saveRecord | custrecord_sna_hul_itemcat, custrecord_sna_hul_loc | duplicate exists | Alert and block save |

---

## 5. Functional Requirements
- Search for existing records with the same `custrecord_sna_hul_itemcat` and `custrecord_sna_hul_loc`.
- Exclude the current record ID from the duplicate check.
- If a duplicate is found, alert the user and block save.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_sna_hul_locationmarkup)

### Fields Referenced
- custrecord_sna_hul_itemcat
- custrecord_sna_hul_loc

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate combination; save blocked.
- False positives when fields are blank.

---

## 8. Implementation Notes (Optional)
- Client-side search on save.

---

## 9. Acceptance Criteria
- Given a duplicate item category/location combination, when saving, then save is blocked with an alert.

---

## 10. Testing Notes
- Save a unique combination; save succeeds.
- Attempt duplicate combination; save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_locationmarkup.js`.
- Deploy to location markup record forms.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should duplicate check include inactive records?
- Risk: False positives when fields are blank.

---
