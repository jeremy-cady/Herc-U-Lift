# PRD: Backdated Time Entry Report (Scheduled)

**PRD ID:** PRD-20251021-BackdatedTimeReportSS
**Created:** October 21, 2025
**Last Updated:** October 21, 2025
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/backdated_time_report_ss.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script that runs daily to detect backdated time entries, email a report, and optionally save results to the File Cabinet.

**What problem does it solve?**
Automates backdated time monitoring so managers receive regular visibility without manual report runs.

**Primary Goal:**
Send a daily backdated time entry report with summary stats and detail.

---

## 2. Goals

1. Query backdated time entries created within a configurable lookback window.
2. Email an HTML report to configured recipients.
3. Save CSV results to the File Cabinet for audit history.

---

## 3. User Stories

1. **As a** manager, **I want to** receive a daily backdated time report **so that** I can monitor compliance.
2. **As an** admin, **I want to** configure lookback and minimum days **so that** the report matches policy.
3. **As an** auditor, **I want to** access historical CSVs **so that** I can review prior periods.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run as a Scheduled Script (daily at 7:00 AM).
2. The system must read script parameters:
   - `custscript_btr_email_recipients`
   - `custscript_btr_min_days_diff`
   - `custscript_btr_lookback_days`
   - `custscript_btr_send_empty_report`
3. The system must search for time entries created in the lookback window where `datecreated` != `trandate`.
4. The system must filter results by minimum days difference.
5. The system must email an HTML report to each recipient.
6. The system must save a CSV file to the File Cabinet when results exist.
7. The system must send an error notification if execution fails.

### Acceptance Criteria

- [ ] Daily run produces email with correct summary and detail.
- [ ] Empty results trigger email only when `sendEmptyReport` is true.
- [ ] CSV file is created when results exist.
- [ ] Errors generate a notification email and are logged.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Provide an interactive UI.
- Update time entries.
- Enforce policies beyond reporting.

---

## 6. Design Considerations

### User Interface
- HTML email report with summary and detail tables.

### User Experience
- Recipients receive a clear daily summary with a per‑employee breakdown.

### Design References
- Backdated Time Entry Suitelet UI/report.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Time Entry (`timebill`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Daily report
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None (search API with formula filters).

### Integration Points
- Email delivery via `N/email`.

### Data Requirements

**Data Volume:**
- Time entries created within the lookback window.

**Data Sources:**
- Transaction search with formula: `{datecreated} - {trandate}`.

**Data Retention:**
- CSV saved to File Cabinet folder ID from `getFolderId()` (currently placeholder).

### Technical Constraints
- Folder ID must be configured (default is `-15`, SuiteScripts).
- Uses formula filters for backdated detection.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Email recipients configured in script parameters.

### Governance Considerations
- Uses runPaged to handle larger result sets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Daily reports are delivered on schedule.
- Managers can identify backdated entries without manual queries.

**How we'll measure:**
- Email delivery logs and manager feedback.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| backdated_time_report_ss.js | Scheduled Script | Daily backdated time report + CSV archive | Implemented |

### Development Approach

**Phase 1:** Scheduled reporting
- [x] Parameterized search filters
- [x] HTML email report
- [x] CSV file output

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Backdated entries found → email + CSV saved.

**Edge Cases:**
1. No results → email sent only when `sendEmptyReport` is true.
2. Missing recipients → script logs and skips sending.

**Error Handling:**
1. Search or email failure → error notification sent.

### Test Data Requirements
- Time entries with created date different from transaction date.

### Sandbox Setup
- Configure script parameters and run on demand.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running the scheduled script.

**Permissions required:**
- View time entries.
- Create files in File Cabinet.
- Send email.

### Data Security
- Email includes time entry details; restrict recipients accordingly.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy scheduled script with parameters.
2. Set schedule to daily 7:00 AM.

### Post-Deployment

- [ ] Verify email delivery and CSV creation.

### Rollback Plan

**If deployment fails:**
1. Disable the scheduled script deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2025-10-21 | 2025-10-21 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the CSV folder ID be parameterized instead of hardcoded?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Folder ID not configured | Medium | Medium | Update `getFolderId()` |

---

## 15. References & Resources

### Related PRDs
- `docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/backdated_time_report_sl.md`

### NetSuite Documentation
- SuiteScript 2.1 Scheduled Script docs.
- Search API docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-10-21 | Jeremy Cady | 1.0 | Initial scheduled report |
