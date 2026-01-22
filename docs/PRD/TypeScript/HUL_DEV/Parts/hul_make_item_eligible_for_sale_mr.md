# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_make_item_eligible_for_sale_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Parts/hul_make_item_eligible_for_sale_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item

---

## 1. Overview
Map/Reduce script that sets custitem_hul_eligible_for_sale to true on inventory items that are currently ineligible.

---

## 2. Business Goal
Mark ineligible inventory items as eligible for sale.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want ineligible inventory items marked eligible, so that they can be sold.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custitem_hul_eligible_for_sale | Item eligible flag is false | Set custitem_hul_eligible_for_sale to true |

---

## 5. Functional Requirements
- getInputData: Search inventory items where custitem_hul_eligible_for_sale is F.
- map: Write item internal IDs to reduce.
- reduce: Set custitem_hul_eligible_for_sale to T via record.submitFields.
- summarize: No active logic (placeholder).
- Uses a paged search to avoid the 4,000 result limit.

---

## 6. Data Contract
### Record Types Involved
- Item (Inventory Item)

### Fields Referenced
- custitem_hul_eligible_for_sale

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- reduce ignores item name; only ID is used.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
