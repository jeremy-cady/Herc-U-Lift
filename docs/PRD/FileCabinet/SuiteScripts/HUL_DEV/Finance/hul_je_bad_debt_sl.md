# PRD: Journal Entry Bad Debt Audit Suitelet
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20250115-JEBadDebt
title: Journal Entry Bad Debt Audit Suitelet
status: Implemented
owner: Jeremy Cady
created: January 15, 2025
last_updated: January 15, 2025

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_je_bad_debt_sl.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Journal Entry

---

## 1. Overview
A Suitelet that produces an HTML report of journal entries (and line details) for a specified account, date range, and subsidiary to support audit review.

---

## 2. Business Goal
Provide a formatted, printable view of journal entries tied to a bad debt account for a defined audit period.

---

## 3. User Story
- As an accountant, I want to export a journal entry report for a specific period so that I can support audit requests.
- As a controller, I want to see line-level details for each JE so that I can validate balances.
- As an auditor, I want to review a clean HTML report so that I can verify bad debt entries quickly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet GET | account, date range, subsidiary | Account 774, date range 10/01/2024 to 10/31/2024, subsidiary 2 | Render HTML report with JE line details |

---

## 5. Functional Requirements
- The system must run on Suitelet GET requests.
- The system must search journalentry records filtered by account 774, date range 10/01/2024 to 10/31/2024, and subsidiary 2.
- The system must load each Journal Entry and capture all line values: account_display, cleared, debit, credit, entity_display, location_display.
- The system must render an HTML page with a table per Journal Entry.

---

## 6. Data Contract
### Record Types Involved
- Journal Entry

### Fields Referenced
- account_display
- cleared
- debit
- credit
- entity_display
- location_display

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching JEs: report should show empty (no entries).
- Large JE with many lines: table renders all lines.
- Record load failures are logged and return an error page.

---

## 8. Implementation Notes (Optional)
- Filters are hardcoded in the script.
- Uses record.load per JE to capture line details.

---

## 9. Acceptance Criteria
- Given the hardcoded filter set, when the Suitelet runs, then the report lists all matching Journal Entries.
- Given a matching Journal Entry, when the Suitelet renders, then each JE includes all line details in the output.
- Given the report output, when viewed, then the HTML renders with readable formatting for audit use.
- Given a failure, when an error occurs, then the error is logged and a simple error page is returned.

---

## 10. Testing Notes
- Load the Suitelet in October 2024 data range and confirm report renders.
- Verify no matching JEs produces an empty report.
- Verify large JEs render all lines.
- Confirm record load failures are logged and return an error page.

---

## 11. Deployment Notes
- Deploy Suitelet script.
- Validate report output for the audit period.
- Rollback: disable the Suitelet deployment.

---

## 12. Open Questions / TBDs
- Should date range/account be parameterized?
- Hardcoded filters become outdated.

---
