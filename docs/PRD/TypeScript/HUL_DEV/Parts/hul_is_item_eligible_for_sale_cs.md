# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_is_item_eligible_for_sale_cs
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: client
  file: TypeScript/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction
  - Item

---

## 1. Overview
Client Script that blocks adding ineligible inventory items and prompts the user with an alternate part suggestion.

---

## 2. Business Goal
Prevent adding ineligible inventory items and guide users to alternate parts.

---

## 3. User Story
As a user, when I add an ineligible inventory item, I want a warning with an alternate part suggestion and the line blocked, so that I select an eligible item.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | TBD | Page initializes | Preload SweetAlert |
| validateLine | item | Item type is InvtPart and eligible flag is false | Show partsIsEligibleSwalMessage(altPartName) and block line |

---

## 5. Functional Requirements
- On pageInit, preload SweetAlert.
- On validateLine for item sublist:
  - Get current line item ID and item type.
  - If item type is InvtPart, query custitem_hul_eligible_for_sale and custitem_hul_alt_part.
  - If not eligible:
    - Look up the alternate part name.
    - Show partsIsEligibleSwalMessage(altPartName).
    - Return false to block the line.
  - If eligible, return true.
- Errors are logged to console and default to allowing the line.

---

## 6. Data Contract
### Record Types Involved
- Transaction
- Item

### Fields Referenced
- item sublist item field (ID)
- item type
- custitem_hul_eligible_for_sale
- custitem_hul_alt_part

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Errors default to allowing the line.

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
- Specific transaction type(s)
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
