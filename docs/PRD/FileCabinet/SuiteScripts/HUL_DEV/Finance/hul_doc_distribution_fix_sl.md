# PRD: Document Distribution Contacts & Customers Fix Suitelet
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DocDistributionFix
title: Document Distribution Contacts & Customers Fix Suitelet
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_doc_distribution_fix_sl.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_doc_distribution
  - Contact
  - Customer

---

## 1. Overview
A Suitelet that audits Document Distribution records and related contacts/customers, presenting a compacted, filtered list with actions to hide, dismiss, and apply corrected email values to customers.

---

## 2. Business Goal
Provide a controlled UI to review Document Distribution rows, filter out valid matches, and fix customer email data when needed.

---

## 3. User Story
- As a finance user, I want to see only mismatched DD/contact/customer rows so that I can focus on fixes.
- As an admin, I want to dismiss resolved rows permanently so that they do not reappear.
- As a user, I want to apply a selected DD email to the customer so that customer records stay accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet GET | customrecord_sna_hul_doc_distribution, Contact, Customer | Email/domain rules and dismissed flag | Display compacted, filtered list |
| Suitelet POST | custrecord_doc_distribution_dismissed, custrecord_doc_distribution_emailaddress, custrecord_doc_distribution_email_check, custrecord_doc_distribution_customer, Customer email | User selects hide/dismiss/apply actions | Hide (session), dismiss (persist), apply email to customer |

---

## 5. Functional Requirements
- The system must query customrecord_sna_hul_doc_distribution with related contacts and customers via SuiteQL.
- The system must filter rows using email/domain rules and a persisted dismissed flag.
- The system must support per-row actions: hide (session), dismiss (persist), apply email to customer.
- The system must page results with a filtered page selector and 1000-row page size.
- The system must display raw and filtered counts for visibility.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_doc_distribution
- Contact
- Customer

### Fields Referenced
- custrecord_doc_distribution_dismissed
- custrecord_doc_distribution_emailaddress
- custrecord_doc_distribution_email_check
- custrecord_doc_distribution_customer
- email

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Rows with blank emails on all sides are excluded.
- DD email equals customer email: excluded.
- DD email shares customer domain: excluded.
- Failed submitFields operations are surfaced in the summary.

---

## 8. Implementation Notes (Optional)
- SuiteQL is used for DD/contact/customer joins.
- Only current page actions are processed per submit.
- Hide state is stored in a hidden CSV field (session-level).
- Client script hul_doc_distribution_cs.js provides Shift-click selection.

---

## 9. Acceptance Criteria
- Given email/domain matches, when the Suitelet loads, then those rows are excluded.
- Given a dismissed row, when the Suitelet loads, then it does not reappear unless the flag is cleared.
- Given a hide action, when submitted, then the row is hidden for the current session.
- Given an apply action, when submitted, then the customer email is updated and a summary is logged.
- Given pagination, when results display, then paging uses the filtered row count.

---

## 10. Testing Notes
- Load the Suitelet and confirm only mismatched rows display.
- Dismiss a row and verify it does not reappear.
- Apply email to customer and confirm customer email changes.
- Verify rows with blank emails or matching domains are excluded.
- Verify failed updates appear in the summary.

---

## 11. Deployment Notes
- Deploy Suitelet script.
- Attach the client script module path.
- Validate update actions in production with test records.
- Rollback: disable the Suitelet deployment.

---

## 12. Open Questions / TBDs
- Should email matching rules be configurable (domain whitelist/blacklist)?
- Incorrect email selection applied to customer.
- Dismiss hides a row permanently in error.

---
