# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_je_bad_debt_sl
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: TypeScript/HUL_DEV/Finance/hul_je_bad_debt_sl.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Journal Entry

---

## 1. Overview
Suitelet that generates an HTML report of Journal Entries for a fixed account, date range, and subsidiary, intended for audit review.

---

## 2. Business Goal
Provide an HTML report of Journal Entries for a specific audit period and account.

---

## 3. User Story
As an auditor, when I access the Suitelet, I want an HTML report of Journal Entries for the specified period and account, so that I can review the entries.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | TBD | Suitelet requested | Run saved search, load entries, and render HTML report |

---

## 5. Functional Requirements
- Run a saved search for Journal Entries with filters:
  - Type: Journal
  - Account internal ID 774
  - Date range 10/01/2024 to 10/31/2024
  - Subsidiary internal ID 2
- Load each Journal Entry record and collect line details:
  - Account display
  - Cleared flag
  - Debit/Credit amounts
  - Entity display
  - Location display
- Write a full HTML page titled "Journal Entry Report" with a table per entry.
- Include inline CSS for layout and page breaks.
- Wrap execution in try/catch, log error, and write a simple HTML error message on failure.

---

## 6. Data Contract
### Record Types Involved
- Journal Entry

### Fields Referenced
- Account (display)
- Cleared (flag)
- Debit amount
- Credit amount
- Entity (display)
- Location (display)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Filters are hardcoded; no parameters or UI inputs.
- Uses record.load for each entry; may be slow at high volumes.
- Intended for October 2024 and account 774.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Uses record.load per entry

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
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
