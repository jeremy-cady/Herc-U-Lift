# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ItemPriceLevel
title: Item Price Level Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_itempricelevel.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Price Level (custom record)

---

## 1. Overview
A client script that enforces item category and customer pricing group rules on Item Price Level records.

---

## 2. Business Goal
Ensure unique category-pricing group combinations and manage min/max cost field behavior based on pricing group rules.

---

## 3. User Story
As an admin, when I manage item price levels, I want pricing records to be unique and follow min/max rules, so that pricing rules stay consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custrecord_sna_hul_itemcategory, custrecord_sna_hul_customerpricinggroup | form loads | Store current values for comparison |
| fieldChanged | custrecord_sna_hul_itemcategory, custrecord_sna_hul_customerpricinggroup | value changed | Toggle min/max cost fields based on pricing group ID 155 |
| saveRecord | custrecord_sna_hul_itemcategory, custrecord_sna_hul_customerpricinggroup | duplicate or invalid sequence | Block save |

---

## 5. Functional Requirements
- On page init, store the current item category and pricing group values.
- When item category or pricing group changes, toggle min and max cost field states based on pricing group ID 155 (List).
- For pricing group ID 155, the first combination must set min cost to 0 and disable editing; max cost is disabled when only one record exists.
- When pricing group is not 155, disable min and max cost and clear values.
- On save, block duplicate item category and pricing group combinations (except pricing group 155).
- On save, block changes that alter pricing group or item category in a way that breaks the max cost sequence for pricing group 155.

---

## 6. Data Contract
### Record Types Involved
- Item Price Level (custom record)

### Fields Referenced
- custrecord_sna_hul_itemcategory
- custrecord_sna_hul_customerpricinggroup
- custrecord_sna_hul_mincost
- custrecord_sna_hul_maxcost

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate item category and pricing group combinations are blocked.
- Min and max cost fields disabled for non-155 pricing groups.
- Search failures should not allow duplicates.

---

## 8. Implementation Notes (Optional)
- Pricing group ID 155 is hard-coded.
- Client-side searches for duplicate checks.

---

## 9. Acceptance Criteria
- Given a duplicate non-155 combination, when saving, then save is blocked.
- Given pricing group 155, when editing, then min/max cost fields behave according to rules.

---

## 10. Testing Notes
- Create pricing group 155 record for a category; confirm min cost set to 0.
- Create non-155 record; confirm min/max are disabled.
- Attempt duplicate non-155 combination; confirm save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_itempricelevel.js`.
- Deploy to item price level record forms.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the pricing group ID be parameterized instead of hard-coded?
- Risk: Pricing group ID changes.

---
