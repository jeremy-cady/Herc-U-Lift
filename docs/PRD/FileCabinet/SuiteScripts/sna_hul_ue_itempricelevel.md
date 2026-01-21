# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ItemPriceLevel
title: Item Price Level Validation
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_itempricelevel.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_itempricelevel

---

## 1. Overview
User Event that enforces uniqueness and UI rules for Item Price Level records, and adjusts min/max cost ranges for List pricing.

---

## 2. Business Goal
Prevent duplicate item category/pricing group combinations and maintain consistent min/max cost ranges for List pricing.

---

## 3. User Story
As an admin, when maintaining item price levels, I want duplicates blocked and min/max ranges maintained, so that pricing data stays consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | min/max cost fields | any | Enable/disable field behavior based on pricing group |
| beforeSubmit | pricing group | non-List pricing group | Block duplicates for item category + pricing group |
| afterSubmit | min/max cost fields | List pricing group (ID 155) | Update min/max ranges based on record order |

---

## 5. Functional Requirements
- On beforeLoad, enable/disable min/max cost fields based on pricing group.
- For pricing group List (ID 155), set min cost and adjust max cost behavior based on record order.
- On beforeSubmit, block duplicates for non-List pricing groups.
- On afterSubmit, update max cost of prior List records and ensure current max cost equals next record min cost.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_itempricelevel

### Fields Referenced
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_itemcategory | Item category
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_customerpricinggroup | Pricing group
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_mincost | Min unit cost
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_maxcost | Max unit cost

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate record for non-List pricing is blocked.
- Search errors are logged.
- Pricing group List is hard-coded as internal ID 155.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Multiple searches and submitFields per save.

---

## 9. Acceptance Criteria
- Given a non-List pricing group, when saving a duplicate item category/pricing group, then the save is blocked.
- Given List pricing records, when saved, then min/max ranges are updated based on record order.
- Given UI create/edit, when beforeLoad runs, then min/max fields reflect the pricing group rules.

---

## 10. Testing Notes
- Create List pricing records and verify max cost updates.
- Duplicate record for non-List pricing is blocked.
- Deploy User Event on Item Price Level custom record.

---

## 11. Deployment Notes
- Confirm List pricing group internal ID (155).
- Deploy User Event on Item Price Level custom record and validate UI and range updates.
- Monitor logs for duplicate errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the List pricing group ID be configurable?

---
