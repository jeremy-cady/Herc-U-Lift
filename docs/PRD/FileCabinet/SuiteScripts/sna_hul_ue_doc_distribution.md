# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DocDistribution
title: Document Distribution Contacts
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_doc_distribution.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_doc_distribution
  - customer
  - contact

---

## 1. Overview
User Event that populates Document Distribution contact, email, and fax fields during CSV import.

---

## 2. Business Goal
Automate contact and communication data for document distribution records created by import.

---

## 3. User Story
As an admin, when I import document distribution records, I want contacts and communication fields populated, so that records are complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Form | UI create/edit | Add contacts multiselect field |
| beforeSubmit | Customer/contact fields | CSV import; customer is not a person | Populate contact, email, and fax fields |

---

## 5. Functional Requirements
- Add a contacts multiselect field on create/edit UI.
- On CSV import, load customer contacts when the customer is not a person.
- Set contact, email, and fax fields based on contact data.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_doc_distribution
- customer
- contact

### Fields Referenced
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_customer | Customer
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_contact | Contact
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_emailaddress | Email addresses
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_fax_numbers | Fax numbers

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Person customer skips contact population.
- Contact lookup errors are logged.
- Only runs in CSV import context for data population.

---

## 8. Implementation Notes (Optional)
- Contact search by company.

---

## 9. Acceptance Criteria
- Given a CSV import for a business customer, when beforeSubmit runs, then contact, email, and fax fields are populated.
- Given a UI create/edit, when beforeLoad runs, then a contacts multiselect field is available.

---

## 10. Testing Notes
- CSV import record with business customer sets contact emails and fax numbers.
- Person customer skips contact population.
- Deploy User Event on document distribution record.

---

## 11. Deployment Notes
- Confirm CSV import process for distribution records.
- Deploy User Event on document distribution record and run a test CSV import.
- Monitor logs for import errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should UI multiselect values be saved back to the record?

---
