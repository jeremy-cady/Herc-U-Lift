# PRD: Block Invoice Creation for Restricted Items (User Event)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InvoiceWarningBatchUE
title: Block Invoice Creation for Restricted Items (User Event)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_invoice_warning_batch_proc_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Sales Order

---

## 1. Overview
A User Event that blocks invoice creation when the originating sales order contains restricted item IDs.

---

## 2. Business Goal
Prevent invoicing of bogus or restricted parts by enforcing a server-side check at invoice creation.

---

## 3. User Story
- As a billing user, I want restricted items blocked so that invalid invoices are not created.
- As an admin, I want a server-side check so that users cannot bypass the restriction.
- As a support user, I want a clear error message so that I know how to resolve it.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit (create) | createdfrom, item | Sales order contains restricted item IDs | Throw error to block invoice creation |

---

## 5. Functional Requirements
- The system must run on beforeSubmit for CREATE.
- The system must read the invoice createdfrom (sales order ID).
- The system must load the sales order and scan the item sublist.
- The system must block invoice creation if any item ID matches 88727, 86344, 94479.
- When blocked, the system must throw an error with the sales order ID and line number.
- Unexpected errors must be logged and not block invoice creation.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Sales Order

### Fields Referenced
- createdfrom
- item

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- createdfrom is empty: script does nothing.
- Sales order load fails: invoice still proceeds.
- Blocking error includes sales order ID and line number.

---

## 8. Implementation Notes (Optional)
- Restricted item IDs are hard-coded.

---

## 9. Acceptance Criteria
- Given a sales order with restricted items, when an invoice is created, then invoice creation is blocked.
- Given a block, when the error is thrown, then the message includes sales order ID and offending line.
- Given unexpected errors, when they occur, then they are logged and invoice creation is not blocked.

---

## 10. Testing Notes
- Create invoice from a sales order without restricted items and confirm creation succeeds.
- Create invoice from a sales order with item 88727 and confirm creation is blocked.
- Verify createdfrom empty allows invoice creation.

---

## 11. Deployment Notes
- Upload hul_invoice_warning_batch_proc_ue.js.
- Deploy as User Event on invoice record type.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should restricted item IDs be configured in a custom record or parameter?
- Should a user-facing UI warning be added before creation?
- Restricted IDs change.
- Sales order load fails.

---
