# PRD: Make Items Eligible for Sale (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-MakeItemEligibleMR
title: Make Items Eligible for Sale (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_make_item_eligible_for_sale_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Inventory Item

---

## 1. Overview
A Map/Reduce script that finds inventory items marked as not eligible for sale and flips the eligibility flag to true.

---

## 2. Business Goal
Enable bulk correction of inventory items that were mistakenly marked ineligible.

---

## 3. User Story
- As an admin, I want to bulk-enable eligible items so that sales can proceed.
- As a support user, I want the process automated so that I don’t update hundreds of items manually.
- As a developer, I want the script to scale so that large item lists are handled safely.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custitem_hul_eligible_for_sale | InvtPart with eligibility false | Set custitem_hul_eligible_for_sale to true |

---

## 5. Functional Requirements
- The system must search for inventory items with type = InvtPart and custitem_hul_eligible_for_sale = F.
- The system must page results using runPaged with a page size of 1000.
- The system must write each item ID to reduce stage.
- The reduce stage must set custitem_hul_eligible_for_sale to T via submitFields.
- Errors must be logged and not stop processing.

---

## 6. Data Contract
### Record Types Involved
- Inventory Item

### Fields Referenced
- custitem_hul_eligible_for_sale

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No items match: script completes without errors.
- Record update failure logs an error per item.

---

## 8. Implementation Notes (Optional)
- Uses inventoryitem record type for updates.

---

## 9. Acceptance Criteria
- Given ineligible inventory items, when processed, then all are updated to eligible.
- Given more than 4000 items, when processed, then paging handles the results.
- Given errors, when they occur, then they are logged per item.

---

## 10. Testing Notes
- Run with a small set of ineligible items and confirm updates.
- Run with no matches and confirm completion without errors.
- Verify record update failures are logged.

---

## 11. Deployment Notes
- Upload hul_make_item_eligible_for_sale_mr.js.
- Create Map/Reduce script record.
- Run in sandbox and verify updates.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should this script be run on demand only?
- Should eligibility changes be logged to a custom record?
- Accidental mass enable.
- Eligibility should remain false.

---
