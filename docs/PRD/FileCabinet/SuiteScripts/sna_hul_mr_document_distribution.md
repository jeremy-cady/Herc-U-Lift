# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DocumentDistributionMR
title: Document Distribution Bulk Email (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_document_distribution.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction (invoice, sales order, credit memo, estimate, opportunity)
  - Custom Record (customrecord_sna_hul_doc_distribution)

---

## 1. Overview
A Map/Reduce script that sends transaction documents in bulk based on document distribution settings.

---

## 2. Business Goal
Automate emailing and optional printing of invoices, sales orders, credit memos, estimates, and opportunities.

---

## 3. User Story
As an AR user, when I run document distribution, I want multiple transactions emailed automatically, so that manual email work is reduced.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_sna_saved_search_id | saved search provided | Email PDFs and save print files |

---

## 5. Functional Requirements
- Load the saved search identified by `custscript_sna_saved_search_id`.
- For each transaction, load the record and resolve distribution rules from `customrecord_sna_hul_doc_distribution`.
- If email delivery is enabled and the transaction is not on hold, send a PDF using the configured template.
- If print delivery is enabled, save an HTML render to the Transaction Prints folder.
- Set `custbody_sna_hul_doc_distributed` to true after successful email send.

---

## 6. Data Contract
### Record Types Involved
- Transaction (invoice, sales order, credit memo, estimate, opportunity)
- Custom Record (customrecord_sna_hul_doc_distribution)

### Fields Referenced
- Transaction | custbody_sna_hold_invoice_sending
- Transaction | custbody_sna_hul_doc_distributed
- Script parameter | custscript_sna_saved_search_id

Schemas (if known):
- Print folder ID: 10792

---

## 7. Validation & Edge Cases
- Transaction hold flag (`custbody_sna_hold_invoice_sending`) prevents email.
- No printable lines (all do-not-print) should skip email.
- Invalid email template should log errors and continue.

---

## 8. Implementation Notes (Optional)
- Requires valid email addresses and template IDs in distribution records.

---

## 9. Acceptance Criteria
- Given distribution rules, when processed, then emails are sent with PDF attachments.
- Given print delivery enabled, when processed, then print files are saved to folder 10792.
- Given hold flag set, when processed, then emails are not sent.

---

## 10. Testing Notes
- Run with saved search of invoices; verify email delivery and flag update.
- No printable lines; verify email skipped.
- Invalid template; verify errors logged.

---

## 11. Deployment Notes
- Upload `sna_hul_mr_document_distribution.js`.
- Deploy Map/Reduce with saved search parameter.
- Rollback: disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should fax distribution be handled by a separate process?
- Risk: Invalid recipient data.

---
