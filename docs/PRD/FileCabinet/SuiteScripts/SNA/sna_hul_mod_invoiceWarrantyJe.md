# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InvoiceWarrantyJE
title: Invoice Warranty Journal Entry Module
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: library
  file: FileCabinet/SuiteScripts/SNA/sna_hul_mod_invoiceWarrantyJe.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Journal Entry
  - Customer Payment
  - Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)

---

## 1. Overview
A module that creates or updates a warranty journal entry for invoice line items flagged for warranty recognition.

## 2. Business Goal
Automates warranty recognition postings by creating balanced JE lines and applying the JE as a customer payment credit.

## 3. User Story
As an accountant, when invoices include warranty-eligible lines, I want warranty JEs created automatically, so that warranty revenue is recognized properly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Warranty-eligible invoice lines | Create JE lines and apply a customer payment credit |

## 5. Functional Requirements
- The system must gather invoice line items including amount, service code, revenue stream, and segment values.
- The system must determine warranty eligibility using `custrecord_sn_for_warranty` on the revenue stream.
- The system must map service codes to GL accounts using `customsearch_sna_servicecode_lookup`.
- For warranty-eligible lines, the system must create JE lines: debit the mapped GL account (or default warranty account if claim) and credit the invoice account.
- The system must set JE header fields including subsidiary, revenue stream, and invoice/claim references.
- The system must save the JE and store its ID on the invoice (`custbody_sna_jeforwarranty`).
- The system must create a customer payment applying the JE against the invoice.

## 6. Data Contract
### Record Types Involved
- Invoice
- Journal Entry
- Customer Payment
- Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)

### Fields Referenced
- Invoice | `custbody_sna_jeforwarranty`, `custbody_sna_inv_claimid`
- Invoice line | `custcol_sn_for_warranty_claim`, `custcol_sna_service_itemcode`
- Revenue Stream | `custrecord_sn_for_warranty`
- Journal Entry | `custbody_sna_invforwarranty`, `custbody_sna_claim_id`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No eligible lines; no JE should be created.
- Missing service code mapping; fallback to default warranty account when claim.
- JE save fails; error logged.

## 8. Implementation Notes (Optional)
- Uses dynamic JE creation and line insertion at index 0.
- Uses current user preference `custscript_sna_default_warranty_accnt` as fallback account.

## 9. Acceptance Criteria
- Given warranty-eligible invoice lines, when the module runs, then matching JE debit/credit lines are generated.
- Given a warranty JE is created, when the module runs, then the JE is linked to the invoice in `custbody_sna_jeforwarranty`.
- Given a warranty JE is created, when the module runs, then a customer payment is created applying the JE credit.

## 10. Testing Notes
- Invoice with warranty-eligible lines creates a JE and payment.
- No eligible lines; no JE should be created.
- Missing service code mapping; fallback to default warranty account when claim.
- JE save fails; error logged.

## 11. Deployment Notes
- Upload `sna_hul_mod_invoiceWarrantyJe.js`.
- Ensure calling script invokes `createWarrantyJournalEntry`.
- Validate JE creation on invoice creation.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should warranty JEs be created only on create events?
- Should payment creation be optional?
- Risk: Large invoices create many JE lines (Mitigation: Consider grouping lines by account)
- Risk: Payment transform fails due to missing credit lines (Mitigation: Add validation before payment creation)

---
