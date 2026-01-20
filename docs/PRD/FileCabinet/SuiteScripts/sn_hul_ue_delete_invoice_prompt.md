# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DeleteInvoicePrompt
title: Block Invoice Delete When JE Exists (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sn_hul_ue_delete_invoice_prompt.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Journal Entry

---

## 1. Overview
A User Event that blocks invoice deletion when related Journal Entries exist, showing a custom message with JE links.

---

## 2. Business Goal
Prevent users from deleting invoices without first removing associated Journal Entries.

---

## 3. User Story
As an accounting user, when I delete an invoice, I want deletions blocked if related JEs exist, so that accounting remains consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | tranid | delete context and JEs found where memomain contains tranid | Throw error with JE links |

---

## 5. Functional Requirements
- Run on `beforeSubmit` and only on `delete` context.
- Search `journalentry` records where memomain contains the invoice `tranid`.
- If any JEs are found, throw an error that includes JE links.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Journal Entry

### Fields Referenced
- Invoice | tranid
- Journal Entry | memomain

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching JEs; delete proceeds.
- Matching is based on memo contains document number.

---

## 8. Implementation Notes (Optional)
- Search created dynamically in script.

---

## 9. Acceptance Criteria
- Given an invoice with related JEs, when delete is attempted, then the deletion is blocked with links to JEs.
- Given no matching JEs, when delete is attempted, then delete proceeds.

---

## 10. Testing Notes
- Delete invoice with related JE; confirm blocked with links.
- Delete invoice with no related JE; confirm delete proceeds.

---

## 11. Deployment Notes
- Upload `sn_hul_ue_delete_invoice_prompt.js`.
- Deploy on Invoice record.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the search use explicit linkage instead of memo match?
- Risk: Memo match is too broad and blocks valid deletes.

---
