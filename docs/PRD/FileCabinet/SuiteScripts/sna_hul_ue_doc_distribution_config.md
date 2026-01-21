# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DocDistributionConfig
title: Document Distribution Config
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_doc_distribution_config.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - message
  - transaction
  - customrecord_sna_hul_doc_distribution

---

## 1. Overview
User Event that adds recipient selection to message records and sends transaction emails/prints based on document distribution configuration.

---

## 2. Business Goal
Automate email distribution and printing of transactions based on configured recipients and templates.

---

## 3. User Story
As an accounting user, when transactions are created, I want emails and prints sent based on document distribution rules, so that manual emailing is reduced.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Message form | message records | Attach client script and add "Add Recipients" button |
| afterSubmit | Transaction fields | create | Load distribution config, send email, and/or print PDF |

---

## 5. Functional Requirements
- For message records, attach client script and add an "Add Recipients" button.
- On transaction create, load document distribution configuration for customer/department/type.
- Send transaction email using a configured email template, if enabled.
- Generate and save a transaction PDF when print is enabled.

---

## 6. Data Contract
### Record Types Involved
- message
- transaction (invoice, salesorder, creditmemo, estimate, opportunity)
- customrecord_sna_hul_doc_distribution

### Fields Referenced
- transaction | custbody_sna_hold_invoice_sending | Hold email sending
- transaction line | custcol_sna_do_not_print | Line do not print
- revenue stream | custrecord_sna_hul_do_not_print | Revenue stream do not print
- doc distribution | custrecord_doc_distribution_customer | Customer
- doc distribution | custrecord_doc_distribution_doc_type | Document type
- doc distribution | custrecord_doc_distribution_email_check | Email enabled
- doc distribution | custrecord_doc_distribution_emailaddress | Email addresses
- doc distribution | custrecord_sna_employee_recipients | Employee recipients
- doc distribution | custrecord_doc_distribution_mailtemplate | Email template
- doc distribution | custrecord_doc_distribution_fax_check | Fax enabled
- doc distribution | custrecord_doc_distribution_fax_numbers | Fax numbers
- doc distribution | custrecord_doc_distribution_print_check | Print enabled
- doc distribution | custrecord_sna_doc_department | Department filter

Schemas (if known):
- Printed PDFs saved to folder ID 1830.

---

## 7. Validation & Edge Cases
- Hold invoice sending prevents email.
- All lines do-not-print prevents email send.
- Template merge errors are logged.

---

## 8. Implementation Notes (Optional)
- Client script: `sna_hul_cs_document_distribution.js`.
- Performance/governance considerations: PDF render and email send per transaction; one config search per transaction.

---

## 9. Acceptance Criteria
- Given a message record, when beforeLoad runs, then an "Add Recipients" button is available.
- Given a transaction with distribution config enabling email, when afterSubmit runs, then the email is sent.
- Given a transaction with print enabled, when afterSubmit runs, then a PDF is generated and saved.

---

## 10. Testing Notes
- Create invoice with doc distribution config and confirm email sent.
- Print enabled saves PDF to File Cabinet.
- Hold invoice sending prevents email.
- Deploy User Event on relevant transaction types and message records.

---

## 11. Deployment Notes
- Verify email template IDs and document type mapping.
- Deploy User Event on message and transaction records and validate email and print behavior.
- Monitor email logs and PDF storage; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should fax sending be fully implemented?

---
