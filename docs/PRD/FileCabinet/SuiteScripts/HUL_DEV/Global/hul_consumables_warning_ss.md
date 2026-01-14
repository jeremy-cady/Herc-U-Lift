# PRD: Consumables Closed Tasks Warning (Scheduled)

**PRD ID:** PRD-20240906-ConsumablesWarningSS
**Created:** September 6, 2024
**Last Updated:** September 6, 2024
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_consumables_warning_ss.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script that checks two consumables-related saved searches and emails a warning when counts meet or exceed a threshold.

**What problem does it solve?**
Alerts stakeholders when closed tasks without sales orders reach a critical count, helping drive follow‑up.

**Primary Goal:**
Send threshold-based email alerts for two consumables saved searches.

---

## 2. Goals

1. Count results for two saved searches.
2. Send alerts when counts are ≥ 20.
3. Notify a fixed distribution list.

---

## 3. User Stories

1. **As a** manager, **I want to** be alerted when consumables tasks exceed a threshold **so that** I can respond quickly.
2. **As an** admin, **I want to** monitor both “upload” and “today” searches **so that** I cover both scenarios.
3. **As a** stakeholder, **I want to** receive a clear alert **so that** I can review the searches.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load saved search `customsearch1833`.
2. The system must load saved search `customsearch1865`.
3. The system must send an email when count ≥ 20 for either search.
4. The system must send from employee ID `2363377` to the configured recipients.

### Acceptance Criteria

- [ ] Alerts are sent when counts reach 20 or more.
- [ ] Both searches are evaluated on each run.
- [ ] Errors are logged without halting execution.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Provide configuration for recipients or thresholds.
- Update any records based on results.
- Create a UI.

---

## 6. Design Considerations

### User Interface
- None (scheduled processing).

### User Experience
- Email alert only when threshold is met.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Saved Searches (consumables tasks).

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Threshold alert
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- `customsearch1833` (Closed Tasks without SO - Upload)
- `customsearch1865` (Closed Tasks without SO - Today)

### Integration Points
- Email notifications.

### Data Requirements

**Data Volume:**
- Saved search counts only.

**Data Sources:**
- Search count via `runPaged().count`.

**Data Retention:**
- N/A.

### Technical Constraints
- Hardcoded recipients and threshold.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Saved searches must exist and be accessible.

### Governance Considerations
- Minimal usage (count only).

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Alerts are sent when thresholds are exceeded.

**How we'll measure:**
- Email delivery logs and search counts.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_consumables_warning_ss.js | Scheduled Script | Threshold alerts for consumables searches | Implemented |

### Development Approach

**Phase 1:** Alerting
- [x] Load and count saved searches
- [x] Send email on threshold

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Search count ≥ 20 → alert email sent.

**Edge Cases:**
1. Count < 20 → no email.
2. Search missing → error logged.

**Error Handling:**
1. Email send errors are logged.

### Test Data Requirements
- Saved searches with counts above and below 20.

### Sandbox Setup
- Deploy scheduled script and run manually.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running scheduled scripts.

**Permissions required:**
- Saved search access.
- Email send permission.

### Data Security
- Email only includes counts and search names.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy scheduled script.
2. Set schedule as needed.

### Post-Deployment

- [ ] Monitor alert emails.

### Rollback Plan

**If deployment fails:**
1. Disable the scheduled script.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2024-09-06 | 2024-09-06 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should recipients and thresholds be parameterized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded emails become outdated | Medium | Medium | Move to script parameters |

---

## 15. References & Resources

### Related PRDs
- `docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_consumables_warning.md`

### NetSuite Documentation
- SuiteScript 2.x Scheduled Script docs.
- Search API docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2024-09-06 | Jeremy Cady | 1.0 | Initial implementation |
