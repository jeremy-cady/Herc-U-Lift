# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_invoice_warning_batch_proc_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Parts/hul_invoice_warning_batch_proc_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Sales Order

---

## 1. Overview
User Event script that blocks invoice creation when the source Sales Order contains restricted items.

---

## 2. Business Goal
Prevent invoice creation when restricted items exist on the source Sales Order.

---

## 3. User Story
As a user, when an Invoice is created from a Sales Order that contains restricted items, I want the creation blocked, so that restricted items are not invoiced.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (beforeSubmit) | createdfrom, item | Invoice created from Sales Order with restricted items | Throw error to block invoice creation |

---

## 5. Functional Requirements
- On Invoice CREATE, if createdfrom is a Sales Order:
  - Load the Sales Order.
  - Scan the item sublist for restricted item IDs: 88727, 86344, 94479.
  - If found, throw an error to block invoice creation with a detailed message.
- Log unexpected errors and allow invoice creation to proceed.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Sales Order

### Fields Referenced
- createdfrom
- Sales Order item sublist item field (ID)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Only blocks when restricted items are detected.
- Unexpected errors are logged and do not block creation.

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
