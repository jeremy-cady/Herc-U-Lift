# PRD: Backdated Time Entry Report (Scheduled)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20251021-BackdatedTimeReportSS
title: Backdated Time Entry Report (Scheduled)
status: Implemented
owner: Jeremy Cady
created: October 21, 2025
last_updated: October 21, 2025

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/backdated_time_report_ss.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Time Entry (timebill)

---

## 1. Overview
A scheduled script that runs daily to detect backdated time entries, email a report, and optionally save results to the File Cabinet.

---

## 2. Business Goal
Automate backdated time monitoring so managers receive regular visibility without manual report runs.

---

## 3. User Story
- As a manager, I want to receive a daily backdated time report so that I can monitor compliance.
- As an admin, I want to configure lookback and minimum days so that the report matches policy.
- As an auditor, I want to access historical CSVs so that I can review prior periods.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled (daily at 7:00 AM) | custscript_btr_email_recipients, custscript_btr_min_days_diff, custscript_btr_lookback_days, custscript_btr_send_empty_report | datecreated != trandate and days diff >= minimum | Email HTML report and save CSV when results exist |

---

## 5. Functional Requirements
- The system must run as a Scheduled Script (daily at 7:00 AM).
- The system must read script parameters: custscript_btr_email_recipients, custscript_btr_min_days_diff, custscript_btr_lookback_days, custscript_btr_send_empty_report.
- The system must search for time entries created in the lookback window where datecreated != trandate.
- The system must filter results by minimum days difference.
- The system must email an HTML report to each recipient.
- The system must save a CSV file to the File Cabinet when results exist.
- The system must send an error notification if execution fails.

---

## 6. Data Contract
### Record Types Involved
- Time Entry (timebill)

### Fields Referenced
- datecreated
- trandate
- custscript_btr_email_recipients
- custscript_btr_min_days_diff
- custscript_btr_lookback_days
- custscript_btr_send_empty_report

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No results: email sent only when sendEmptyReport is true.
- Missing recipients: script logs and skips sending.
- Search or email failure: error notification sent.

---

## 8. Implementation Notes (Optional)
- CSV saved to File Cabinet folder ID from getFolderId() (default -15, SuiteScripts).
- Uses runPaged to handle larger result sets.

---

## 9. Acceptance Criteria
- Given a daily run, when backdated entries exist, then an email is sent with correct summary and detail.
- Given no results, when sendEmptyReport is true, then an email is sent; when false, then no email is sent.
- Given results exist, when the run completes, then a CSV file is created.
- Given a failure, when an error occurs, then a notification email is sent and the error is logged.

---

## 10. Testing Notes
- Run with backdated entries and confirm email + CSV are created.
- Run with no results and confirm email only when sendEmptyReport is true.
- Verify missing recipients are logged and skipped.
- Verify search or email failures trigger error notification.

---

## 11. Deployment Notes
- Deploy scheduled script with parameters.
- Set schedule to daily 7:00 AM.
- Rollback: disable the scheduled script deployment.

---

## 12. Open Questions / TBDs
- Should the CSV folder ID be parameterized instead of hardcoded?
- Folder ID not configured.

---
