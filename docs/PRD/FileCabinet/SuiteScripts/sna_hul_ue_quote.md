# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-Quote
title: Quote Document Numbering
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_quote.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - estimate
  - customrecord_sna_hul_document_numbering

---

## 1. Overview
User Event that assigns document numbers to Estimates/Quotes based on a document numbering custom record.

---

## 2. Business Goal
Ensure unique, sequential quote numbers with configured prefixes and digit lengths.

---

## 3. User Story
As a sales user, when creating a quote, I want a document number assigned automatically, so that quotes follow numbering rules.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | customform | quote create | Look up numbering settings, generate unique number, update numbering record |
| afterSubmit | tranid | UI context | Reload quote with assigned number |

---

## 5. Functional Requirements
- On quote create, look up document numbering settings by custom form.
- Generate a unique quote number using prefix and minimum digits.
- Update the document numbering current number.
- Set the quote `tranid` and reload the record in UI context.

---

## 6. Data Contract
### Record Types Involved
- estimate
- customrecord_sna_hul_document_numbering

### Fields Referenced
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_transaction_form | Transaction form
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_doc_num_prefix | Prefix
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_doc_num_min | Min digits
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_doc_current_number | Current number

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate number detected and retry succeeds (up to 20 attempts).
- Missing numbering configuration logs an error.
- Duplicate numbering from concurrent saves can occur.

---

## 8. Implementation Notes (Optional)
- Searches for existing quotes with the generated `tranid`.
- Performance/governance considerations: Multiple searches and submitFields.

---

## 9. Acceptance Criteria
- Given a new quote, when created, then `tranid` is generated and document numbering increments.
- Given a duplicate number, when generated, then the script retries and finds a unique number.

---

## 10. Testing Notes
- Create quote and verify generated `tranid`.
- Duplicate number detected and retry succeeds.
- Deploy User Event on Estimate/Quote.

---

## 11. Deployment Notes
- Confirm document numbering records per quote form.
- Deploy User Event on Estimate/Quote and validate quote numbering.
- Monitor logs for duplicate number errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should numbering reset per year or subsidiary?

---
