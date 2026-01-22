# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_doc_distribution_fix_sl
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: TypeScript/HUL_DEV/Finance/hul_doc_distribution_fix_sl.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Document Distribution (custom record)
  - Contact
  - Customer

---

## 1. Overview
Suitelet that lists Document Distribution records with contact/customer email context, applies filtering, and supports session hide, persistent dismiss, and customer email updates.

---

## 2. Business Goal
Surface Document Distribution records with email/domain mismatches and enable corrective actions.

---

## 3. User Story
As a user, when reviewing Document Distribution records, I want to filter and act on mismatched email data, so that I can hide, dismiss, or update customer emails.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | TBD | Suitelet requested | Render filtered results and UI |
| POST | hide_line, dismiss, apply_email | Submit actions selected | Hide for session, persist dismiss, and/or apply email to customer |

---

## 5. Functional Requirements
- Use SuiteQL (paged) to join Document Distribution, contacts, customers, and optional DD-linked customer.
- Render a form titled "Document Distribution – Contacts & Customers (Compacted)".
- Build sublist custpage_results with action checkboxes (hide_line, dismiss, apply_email), metadata, contact/customer identifiers/emails, and hidden target fields.
- Provide summary fields for raw vs filtered counts and current page size.
- Display a help block describing behavior and navigation.
- Apply rowPassesFilter rules to exclude rows per filtering rules.
- Support actions on submit:
  - Hide (session): store DD record IDs in a hidden CSV field.
  - Dismiss (persist): set custrecord_doc_distribution_dismissed = true on DD record.
  - Apply to Customer: update customer.email with selected target email, skipping if no change.
- Email selection logic when applying to customer:
  1. DD email matching customer email (no change).
  2. DD email matching customer domain.
  3. Contact email present in DD email list.
  4. First DD email as fallback.
- Use SuiteQL paging with page size 1000.
- Count filtered rows separately and rebuild filtered pages on demand.
- Support page navigation via dropdown custpage_fpage.
- Wrap onRequest in try/catch and render an error form with the message on failure.

---

## 6. Data Contract
### Record Types Involved
- Document Distribution (custom record)
- Contact
- Customer

### Fields Referenced
- custpage_results.hide_line
- custpage_results.dismiss
- custpage_results.apply_email
- custrecord_doc_distribution_dismissed
- customer.email
- custpage_fpage
- Hidden CSV field for session hide list (name TBD)
- Document Distribution email fields (TBD)
- Contact email field (TBD)
- Customer email field (customer.email)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Exclude rows when any filtering rule is met:
  - Hidden in current session (hidden IDs list).
  - Previously dismissed (persisted flag on DD record).
  - Any DD email domain matches customer domain.
  - Contact email matches customer email exactly.
  - Contact and customer domains match and DD email shares that domain.
  - DD customer email matches any DD email (for DD-linked customer).
  - All of DD emails, contact email, and customer email are blank.
- Apply email to customer only if the selected target email differs from current value.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Uses SuiteQL paging and page size 1000

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Hidden CSV field name for session hide list
- Specific Document Distribution email field IDs
- Contact email field ID
- Any other field IDs used for metadata and hidden targets
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
