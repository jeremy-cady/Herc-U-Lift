# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-JEForWarranty
title: Warranty Journal Entry Creation
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_jeforwarranty.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice
  - journalentry
  - customerpayment

---

## 1. Overview
User Event that creates or updates warranty Journal Entries for invoices and auto-applies the JE as a customer payment.

---

## 2. Business Goal
Automate warranty accounting entries and apply credits to invoices for warranty claims.

---

## 3. User Story
As a finance user, when invoices contain warranty lines, I want warranty JEs created and applied automatically, so that warranty claims are accounted for consistently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custbody_sna_jeforwarranty | invoice create/edit (non-delete) | Create/update warranty JE and apply via customer payment |

---

## 5. Functional Requirements
- Run afterSubmit on invoice create/edit (non-delete).
- Create or reload the JE referenced by `custbody_sna_jeforwarranty`.
- Add debit lines for warranty items and a credit line for the invoice account.
- Set JE fields for subsidiary, revenue stream, invoice, and claim ID.
- Update the invoice with the JE ID and auto-apply it via customer payment.

---

## 6. Data Contract
### Record Types Involved
- invoice
- journalentry
- customerpayment

### Fields Referenced
- invoice | custbody_sna_jeforwarranty | Warranty JE reference
- invoice | custbody_sna_inv_claimid | Claim ID
- invoice line | custcol_sn_for_warranty_claim | Warranty claim line flag
- invoice line | cseg_sna_revenue_st | Revenue stream
- invoice line | custcol_sna_service_itemcode | Service code
- revenue stream | custrecord_sn_for_warranty | Warranty flag
- warranty lookup | custrecord_sn_warranty_gl | Warranty GL account

Schemas (if known):
- Saved search: customsearch_sna_servicecode_lookup

---

## 7. Validation & Edge Cases
- No warranty lines results in no JE creation.
- JE or payment creation errors are logged.
- Payment option ID depends on environment (sandbox vs production).

---

## 8. Implementation Notes (Optional)
- Uses runtime user preference `custscript_sna_claimwarranty` for claim account.
- Auto-creates customer payment to apply JE to invoice.

---

## 9. Acceptance Criteria
- Given invoice warranty lines, when afterSubmit runs, then JE debit lines are created and linked to the invoice.
- Given a created JE, when afterSubmit runs, then the JE is auto-applied as a customer payment.

---

## 10. Testing Notes
- Invoice with warranty lines creates JE and auto-applies payment.
- No warranty lines results in no JE creation.
- Deploy User Event on Invoice and ensure saved search exists.

---

## 11. Deployment Notes
- Confirm saved search `customsearch_sna_servicecode_lookup`.
- Validate payment option IDs for sandbox/production.
- Deploy User Event on Invoice and validate warranty JE and payment creation.
- Monitor logs for JE/payment errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should warranty GL mapping be cached to reduce searches?

---
