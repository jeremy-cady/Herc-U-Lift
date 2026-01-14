# PRD: Backdated Time Entry Report

**PRD ID:** PRD-20251021-BackdatedTimeReport
**Created:** October 21, 2025
**Last Updated:** October 21, 2025
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/backdated_time_report_sl.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that reports time entries where the created date is later than the transaction date, highlighting backdated time entry behavior.

**What problem does it solve?**
Provides visibility into employees entering timecards retroactively by comparing `datecreated` versus the time entry date.

**Primary Goal:**
Identify backdated time entries and export them for review.

---

## 2. Goals

1. Filter time entries by created date range.
2. Flag entries with a configurable minimum days backdated.
3. Support employee/location filters and CSV export.

---

## 3. User Stories

1. **As a** manager, **I want to** see which time entries were created late **so that** I can address compliance issues.
2. **As an** admin, **I want to** filter by employee or location **so that** I can focus on specific teams.
3. **As an** auditor, **I want to** export the results **so that** I can retain a record.

---

## 4. Functional Requirements

### Core Functionality

1. The system must display a Suitelet form with filters:
   - Date Created From/To (required)
   - Minimum Days Backdated (default 1)
   - Employee (optional)
   - Location (optional)
2. The system must search `timebill` records by `datecreated` within the selected range.
3. The system must compute days backdated as `datecreated` minus transaction date (date only).
4. The system must include entries where days backdated ≥ minimum.
5. The system must display results in a list sublist with key fields and a record link.
6. The system must provide CSV export of all matching results.

### Acceptance Criteria

- [ ] Entries with days backdated ≥ minimum appear in the results.
- [ ] Summary stats show counts, unique employees, total hours, max days.
- [ ] CSV export includes all results (not just the first 1000).
- [ ] Errors are logged and shown as user-friendly messages.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify time entries.
- Enforce time entry policies automatically.
- Provide paging beyond the 1000‑row display limit (export is used for full results).

---

## 6. Design Considerations

### User Interface
- Inline HTML banners for purpose and stats.
- Sublist list view with core fields.

### User Experience
- Defaults to last 30 days for first load.
- Clear “Export to CSV” call‑to‑action.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Time Entry (`timebill`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Report UI and export
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None (uses search API).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Search results processed in 1000‑row batches; sublist display capped at 1000.

**Data Sources:**
- `timebill` search with fields: date, datecreated, employee, hours, customer, casetaskevent, location, department, memo, subsidiary.

**Data Retention:**
- N/A.

### Technical Constraints
- Uses `search.run().getRange()` paging rather than `runPaged`.
- Display limited to 1000 rows for performance; export includes all.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Search paging in 1000‑row increments.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Backdated entries are accurately identified and reported.
- Users can export a complete dataset for review.

**How we'll measure:**
- Manager feedback and audit usage.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| backdated_time_report_sl.js | Suitelet | Backdated time entry report & CSV export | Implemented |

### Development Approach

**Phase 1:** Report UI
- [x] Filters and default date range
- [x] Search and diff calculation
- [x] Results table and stats

**Phase 2:** Export
- [x] CSV generation and download

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Filter last 30 days with min days = 1 → results display.
2. Export CSV and confirm full dataset.

**Edge Cases:**
1. No results → info banner displays.
2. Date fields missing → form requires input.

**Error Handling:**
1. Search errors log details and show an error message.

### Test Data Requirements
- Time entries created days after transaction date.

### Sandbox Setup
- Deploy Suitelet in sandbox and run with test data.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Managers and admins reviewing time entries.

**Permissions required:**
- View time entries.

### Data Security
- Time entry data is read-only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy Suitelet.
2. Validate search and export behavior.

### Post-Deployment

- [ ] Monitor for user feedback and errors.

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2025-10-21 | 2025-10-21 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should results use runPaged for consistency with large data sets?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large result sets exceed UI limit | Medium | Low | Export full results via CSV |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet docs.
- Search API docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-10-21 | Jeremy Cady | 1.0 | Production version |
