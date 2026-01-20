# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ChildTransactionsModule
title: Child Transaction Update Helpers
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: library
  file: FileCabinet/SuiteScripts/SNA/shared/sna_hul_update_child_transactions.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order, Time Bill, Item Fulfillment, Invoice, Purchase Order
  - Vendor Bill, Item Receipt, Vendor Return Authorization, Vendor Credit
  - Return Authorization, Credit Memo, Journal Entry, Customer Payment

---

## 1. Overview
A shared module that updates child transactions (time bills, fulfillments, invoices, purchase orders, and related transactions) when sales order line segment values change.

## 2. Business Goal
Keeps revenue stream, manufacturer, and equipment segment values consistent across related transactions derived from a sales order.

## 3. User Story
As an accounting user, when sales order segments change, I want child transactions updated, so that segment reporting stays accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | Segment fields | Helper invoked | Propagate segment values to child transactions |

## 5. Functional Requirements
- The system must retrieve related transactions using saved searches and line links.
- The system must update time bills with revenue stream and related segment values.
- The system must update linked journal entries when time bills or fulfillments update.
- The system must update item fulfillments and propagate segment values to WIP JEs.
- The system must update invoices and propagate segment values to linked internal billing JEs and customer payments.
- The system must update purchase orders and cascade updates to vendor bills, item receipts, and vendor return authorizations.
- The system must update vendor return authorizations and cascade updates to fulfillments and vendor credits.
- The system must update return authorizations and cascade updates to item receipts and credit memos.
- The system must log audit and error messages for key operations.

## 6. Data Contract
### Record Types Involved
- Sales Order, Time Bill, Item Fulfillment, Invoice, Purchase Order
- Vendor Bill, Item Receipt, Vendor Return Authorization, Vendor Credit
- Return Authorization, Credit Memo, Journal Entry, Customer Payment

### Fields Referenced
- Segment fields: `cseg_sna_revenue_st`, `cseg_hul_mfg`, `cseg_sna_hul_eq_seg`
- Link fields: `custcol_sna_linked_so`, `custcol_sna_linked_time`, `custcol_sna_hul_linked_je`
- WIP JE field: `custbody_sna_hul_je_wip`
- Other link fields: `custcol_sn_hul_so_line_id`, `custcol_sna_linked_transaction`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing order lines on returns; fallback to created-from sales order.
- No related transactions found.
- Record load/save failures logged and do not stop overall process.

## 8. Implementation Notes (Optional)
- Uses a mix of synchronous and promise-based record saves.
- Some update paths depend on line matching (`orderline` and custom line IDs).

## 9. Acceptance Criteria
- Given sales order segment changes, when the helper runs, then child transactions reflect updated segment values.
- Given linked journals and payments, when the helper runs, then they are updated when applicable.
- Given errors occur, when the helper runs, then they are logged without stopping the process.

## 10. Testing Notes
- Update sales order segments and verify updates on time bills, fulfillments, invoices, and POs.
- Verify linked journal entries and payments update.
- Missing order lines on returns; fallback to created-from sales order.
- No related transactions found.
- Record load/save failures logged and do not stop overall process.

## 11. Deployment Notes
- Upload `sna_hul_update_child_transactions.js`.
- Ensure consuming scripts import and use the helper.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should updates be batched to reduce governance usage?
- Should the helper validate that segment values are present before updating?
- Risk: Large transaction trees consume governance (Mitigation: Add batching or scheduled processing)
- Risk: Line matching fails when orderline is missing (Mitigation: Use alternate line matching strategies)

---
