# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SalesOrder
title: Sales Order Numbering and Transfer Button
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_salesorder.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customrecord_sna_hul_document_numbering
  - supportcase
  - customer

---

## 1. Overview
User Event that assigns sales order document numbers, sets blanket PO values, controls VersaPay sync, and adds a transfer button.

---

## 2. Business Goal
Ensure sales orders follow numbering rules, inherit PO values when needed, avoid syncing internal revenue streams, and allow transfer processing.

---

## 3. User Story
As a sales or operations user, when creating/viewing sales orders, I want numbering and transfer controls applied, so that operations are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | customform | sales order create | Assign document number and set PO values |
| beforeSubmit | revenue stream | create/edit/xedit | Prevent VersaPay sync for internal revenue streams |
| beforeLoad | status/lines | view | Add Transfer button when eligible |

---

## 5. Functional Requirements
- On sales order create, assign a document number from the document numbering custom record.
- On sales order create, set `otherrefnum` from the case PO or customer blanket PO when missing.
- On create/edit/xedit, prevent VersaPay sync for internal revenue stream orders.
- On view, add a Transfer button when status and line conditions are met.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- customrecord_sna_hul_document_numbering
- supportcase
- customer

### Fields Referenced
- salesorder | otherrefnum | PO number
- salesorder | custbody_nx_case | Linked case
- supportcase | custevent_nx_case_purchaseorder | Case PO number
- customer | custentity_sna_blanket_po | Blanket PO
- customer | custentity_sna_hul_po_required | PO required flag
- salesorder | custcol_sna_hul_ship_meth_vendor | Line ship method
- salesorder | custcol_sna_hul_so_linked_transfer | Transfer link

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing document numbering record should log an error.
- Duplicate `tranid` should retry or log without breaking save.
- Transfer button logic depends on line shipping method and fulfillment quantities.

---

## 8. Implementation Notes (Optional)
- Suitelet: customscript_sna_hul_sl_so_transfer_proc.
- Modules: sna_hul_mod_utils, sna_hul_mod_versapay_sync.

---

## 9. Acceptance Criteria
- Given a new sales order, when created, then `tranid` is generated and PO values populate when missing.
- Given internal revenue stream orders, when saving, then VersaPay sync is skipped.
- Given eligible orders, when viewing, then Transfer button appears.

---

## 10. Testing Notes
- Create sales order and verify `tranid` and PO values.
- View eligible order and verify Transfer button appears.
- Missing document numbering record logs an error.
- Deploy User Event on sales order.

---

## 11. Deployment Notes
- Confirm document numbering records per sales order form.
- Confirm transfer suitelet deployment.
- Deploy User Event on sales order and validate numbering and transfer button behavior.
- Monitor logs for numbering and PO lookup errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should numbering reset by subsidiary or year?

---
