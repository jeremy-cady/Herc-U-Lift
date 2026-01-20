# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DocumentDistribution
title: Document Distribution Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_document_distribution.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_sna_hul_doc_distribution)
  - Message
  - Contact
  - Customer
  - Transaction

---

## 1. Overview
A client script used on the Document Distribution custom record and Message record to manage contact selections and populate recipient emails.

---

## 2. Business Goal
Streamline document distribution by auto-loading customer contacts and populating email recipients for invoices and sales orders.

---

## 3. User Story
As an AR user, when I prepare document distribution and messages, I want recipients prefilled, so that I do not manually collect addresses.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit (Message) | transaction, entity | message opened | Add recipients from document distribution records |
| pageInit (Doc Dist) | custrecord_doc_distribution_customer | record opened | Load contact options and hide native contact field |
| fieldChanged | custrecord_doc_distribution_customer | customer changed | Reload contact list for non-person customers |
| fieldChanged | custpage_sna_doc_distri_contact | contact selection changed | Set email address field with contact emails |

---

## 5. Functional Requirements
- On Message record page init, add email recipients from document distribution records for the transaction and customer.
- On Document Distribution record page init, load contact options and hide the native contact field in favor of the custom selector.
- When the customer changes on the document distribution record, reload the contact list for non-person customers.
- When document distribution contacts change, set the email address field with all contact emails.
- Support adding recipients and template to the Message record via a client action.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_sna_hul_doc_distribution)
- Message
- Contact
- Customer
- Transaction

### Fields Referenced
- Document Distribution | custrecord_doc_distribution_customer
- Document Distribution | custrecord_doc_distribution_contact
- Document Distribution | custrecord_doc_distribution_emailaddress
- Document Distribution | custrecord_doc_distribution_doc_type
- Document Distribution | custrecord_doc_distribution_email_check
- Document Distribution | custrecord_doc_distribution_mailtemplate
- Document Distribution | custpage_sna_doc_distri_contact
- Message | transaction
- Message | entity
- Message | template
- Message Sublist | otherrecipientslist.otherrecipient
- Message Sublist | otherrecipientslist.email

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Customer marked as person; contact population skipped.
- Selected contacts have no email addresses; alert shown.
- Missing document distribution records should not block message load.

---

## 8. Implementation Notes (Optional)
- Relies on DOM manipulation to reposition contact field labels.
- Uses transaction type lookup to map invoice or sales order document types.

---

## 9. Acceptance Criteria
- Given a non-person customer, when creating a document distribution record, then contacts populate.
- Given contacts selected, when updated, then the email address field is populated.
- Given a message for an invoice or sales order, when opened, then recipients and template are inserted.

---

## 10. Testing Notes
- Create a document distribution record; confirm contacts populate.
- Select contacts; confirm email address field updates.
- Open message for an invoice; confirm recipients inserted.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_document_distribution.js`.
- Deploy to document distribution and message record contexts.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should contact email validation be enforced beyond presence?
- Risk: DOM changes break field repositioning.
- Risk: Large contact lists slow client load.

---
