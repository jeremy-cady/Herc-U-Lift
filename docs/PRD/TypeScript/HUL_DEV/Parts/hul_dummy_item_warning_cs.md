# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_dummy_item_warning_cs
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: client
  file: TypeScript/HUL_DEV/Parts/hul_dummy_item_warning_cs.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction

---

## 1. Overview
Client Script that blocks saving a transaction if a dummy item appears on the item sublist, showing a SweetAlert warning.

---

## 2. Business Goal
Prevent transactions from being saved when dummy items are present.

---

## 3. User Story
As a user, when I try to save a transaction that includes a dummy item, I want a warning and the save blocked, so that invalid transactions are prevented.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | TBD | Page initializes | Preload SweetAlert |
| saveRecord | item | Any line item ID in restricted list | Show doNotInvoiceDummyItemSwalMessage() and block save |

---

## 5. Functional Requirements
- On pageInit, preload SweetAlert.
- On saveRecord, scan the item sublist for target item IDs: 88727, 86344, 94479.
- If any target item is found:
  - Display doNotInvoiceDummyItemSwalMessage().
  - Return false to block save/bill action.
- If no target items are found, return true.
- If errors occur in saveRecord, allow the save to proceed.
- Other client entry points are present but empty.

---

## 6. Data Contract
### Record Types Involved
- Transaction

### Fields Referenced
- item sublist item field (ID)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Errors in saveRecord default to allowing the save.

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
