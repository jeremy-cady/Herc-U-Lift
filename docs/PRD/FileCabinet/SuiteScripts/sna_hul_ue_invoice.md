# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-Invoice
title: Invoice Document Numbering and JE Creation
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_invoice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice
  - salesorder
  - journalentry

---

## 1. Overview
User Event on Invoice that updates document numbers, triggers WIP reclass journal entries, and creates warranty JEs.

---

## 2. Business Goal
Ensure invoice numbering matches Sales Order sequencing and automate accounting reclass and warranty entries.

---

## 3. User Story
As a billing and finance user, when invoices are created or edited, I want document numbers sequenced and JEs created, so that billing and accounting stay accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | tranid | bulk operations | Update document number based on Sales Order sequence |
| beforeSubmit | entryformquerystring | item fulfillment ID present | Set `custbody_sn_related_if` |
| afterSubmit | createdfrom | create | Set tranid sequence, call COGS JE suitelet, reclass WIP |
| afterSubmit | custbody_sna_inv_create_je | edit (UI or CSV) | Create or reclass WIP based on flag |
| afterSubmit | n/a | non-delete | Invoke warranty JE library |

---

## 5. Functional Requirements
- On create, set the invoice `tranid` based on the Sales Order `tranid` plus sequence.
- For bulk operations, update the document number in beforeSubmit.
- Set `custbody_sn_related_if` when an item fulfillment ID is in the entry form query string.
- On create, call the COGS JE suitelet and reclass WIP.
- On edit (UI or CSV), create or reclass WIP based on `custbody_sna_inv_create_je`.
- Invoke the warranty JE library on non-delete actions.

---

## 6. Data Contract
### Record Types Involved
- invoice
- salesorder
- journalentry

### Fields Referenced
- invoice | createdfrom | Source Sales Order
- invoice | custbody_sna_hul_last_invoice_seq | Last invoice sequence
- invoice | entryformquerystring | Form query string
- invoice | custbody_sn_related_if | Related item fulfillment
- invoice | custbody_sna_inv_create_je | Create JE flag

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Bulk invoice creation still updates document number.
- Edit without Create JE flag does not create new JE.
- Suitelet or library errors are logged.

---

## 8. Implementation Notes (Optional)
- Suitelet `customscript_sna_hul_bksl_createcogsje` for JE creation.
- Libraries: `./sn_hul_mod_reclasswipaccount`, `./SNA/sna_hul_mod_invoiceWarrantyJe`.
- Uses query string to detect bulk operations and item fulfillment IDs.

---

## 9. Acceptance Criteria
- Given an invoice created from a Sales Order, when afterSubmit runs, then `tranid` is sequenced from the Sales Order.
- Given create/edit conditions, when afterSubmit runs, then WIP reclass JEs are created as specified.
- Given a non-delete action, when afterSubmit runs, then warranty JE creation is invoked.

---

## 10. Testing Notes
- Create invoice from Sales Order and verify `tranid` sequencing.
- Create invoice and verify WIP reclass JE creation.
- Bulk invoice creation still updates document number.
- Deploy User Event on Invoice and ensure suitelet is available.

---

## 11. Deployment Notes
- Confirm suitelet deployment IDs and library availability.
- Deploy User Event on Invoice and validate document numbering and JE creation.
- Monitor JE creation logs; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should document numbering consider voided invoices?

---
