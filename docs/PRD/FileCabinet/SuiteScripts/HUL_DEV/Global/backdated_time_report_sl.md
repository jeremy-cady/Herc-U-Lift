# PRD: Backdated Time Entry Report
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20251021-BackdatedTimeReport
title: Backdated Time Entry Report
status: Implemented
owner: Jeremy Cady
created: October 21, 2025
last_updated: October 21, 2025

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/backdated_time_report_sl.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Time Entry (timebill)

---

## 1. Overview
A Suitelet that reports time entries where the created date is later than the transaction date, highlighting backdated time entry behavior.

---

## 2. Business Goal
Provide visibility into employees entering timecards retroactively by comparing datecreated versus the time entry date.

---

## 3. User Story
- As a manager, I want to see which time entries were created late so that I can address compliance issues.
- As an admin, I want to filter by employee or location so that I can focus on specific teams.
- As an auditor, I want to export the results so that I can retain a record.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | Date Created From/To, Minimum Days Backdated, Employee, Location | datecreated within selected range and days backdated >= minimum | Search timebill, compute days backdated, display list and CSV export |

---

## 5. Functional Requirements
- The system must display a Suitelet form with filters: Date Created From/To (required), Minimum Days Backdated (default 1), Employee (optional), Location (optional).
- The system must search timebill records by datecreated within the selected range.
- The system must compute days backdated as datecreated minus transaction date (date only).
- The system must include entries where days backdated >= minimum.
- The system must display results in a list sublist with key fields and a record link.
- The system must provide CSV export of all matching results.
- The system must show summary stats with counts, unique employees, total hours, and max days.
- Errors must be logged and shown as user-friendly messages.

---

## 6. Data Contract
### Record Types Involved
- Time Entry (timebill)

### Fields Referenced
- date
- datecreated
- employee
- hours
- customer
- casetaskevent
- location
- department
- memo
- subsidiary

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No results: info banner displays.
- Date fields missing: form requires input.
- Display capped at 1000 rows; export includes all results.
- Search errors are logged and shown as an error message.

---

## 8. Implementation Notes (Optional)
- Uses search.run().getRange() paging rather than runPaged.
- Display limited to 1000 rows for performance; export includes all.

---

## 9. Acceptance Criteria
- Given entries with days backdated >= minimum, when the Suitelet runs, then those entries appear in the results.
- Given a result set, when the summary stats render, then counts, unique employees, total hours, and max days are shown.
- Given a CSV export, when generated, then it includes all matching results, not just the first 1000.
- Given a search error, when it occurs, then the error is logged and shown as a user-friendly message.

---

## 10. Testing Notes
- Filter last 30 days with min days = 1 and confirm results display.
- Export CSV and confirm full dataset.
- Verify no results shows an info banner.
- Verify search errors log details and show an error message.

---

## 11. Deployment Notes
- Deploy Suitelet.
- Validate search and export behavior.
- Rollback: disable the Suitelet deployment.

---

## 12. Open Questions / TBDs
- Should results use runPaged for consistency with large data sets?
- Large result sets exceed UI limit.

---
