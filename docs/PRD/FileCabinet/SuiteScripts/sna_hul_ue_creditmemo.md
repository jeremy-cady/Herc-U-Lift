# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreditMemo
title: Credit Memo WIP Reclass and Rental Qty Update
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_creditmemo.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - creditmemo
  - invoice
  - salesorder

---

## 1. Overview
User Event on Credit Memo that reverses WIP reclass entries and updates rental quantities on Sales Orders when credit memos apply.

---

## 2. Business Goal
Keep WIP accounting and rental quantities aligned after credit memos are created or edited.

---

## 3. User Story
As a finance user, when a credit memo is created or edited for a rental invoice, I want WIP reclass reversed and rental quantities adjusted, so that accounting and Sales Orders remain accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | createdfrom | create/edit/copy; createdfrom exists | Reverse WIP reclass and update rental SO quantities |

---

## 5. Functional Requirements
- Run afterSubmit on Credit Memo create/edit/copy.
- On create, if the credit memo has `createdfrom`, call `reverseWIPAccount`.
- Search applied invoice/SO lines for rental orders and recalculate quantities based on date range and credited quantity.
- Update Sales Order line quantities using line unique keys.

---

## 6. Data Contract
### Record Types Involved
- creditmemo
- invoice
- salesorder

### Fields Referenced
- creditmemo | createdfrom | Source invoice
- salesorder | custbody_sna_hul_last_invoice_seq | Last invoice sequence
- salesorder line | lineuniquekey | Line key for updates

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Credit memo not created from invoice does not reverse WIP.
- Search/load errors are logged.
- Date range parsing errors can affect quantity calculation.

---

## 8. Implementation Notes (Optional)
- Uses `./sn_hul_mod_reclasswipaccount.js` and `./moment.js`.
- Rental form ID provided via script parameter `custscript_sn_hul_sorentalform`.

---

## 9. Acceptance Criteria
- Given a credit memo created from an invoice, when afterSubmit runs, then WIP reclass reversal occurs.
- Given rental SO lines tied to the credit memo, when afterSubmit runs, then rental quantities are adjusted based on credited quantities.

---

## 10. Testing Notes
- Create credit memo from invoice and verify WIP reversal.
- Credit memo reduces rental SO line quantities.
- Credit memo not created from invoice does not reverse WIP.
- Deploy User Event on Credit Memo.

---

## 11. Deployment Notes
- Confirm rental form parameter value.
- Deploy User Event on Credit Memo and validate WIP reversal and rental qty updates.
- Monitor logs for errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should updates occur on credit memo deletes?

---
