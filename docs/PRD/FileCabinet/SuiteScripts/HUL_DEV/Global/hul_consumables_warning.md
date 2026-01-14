# PRD: Consumables Closed Tasks Warning

**PRD ID:** PRD-UNKNOWN-ConsumablesWarning
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_consumables_warning.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script that checks two saved searches for consumables-related closed tasks and emails a warning when counts meet or exceed a threshold.

**What problem does it solve?**
Provides proactive alerts when the number of closed tasks without SO upload or closed tasks today reaches a defined threshold.

**Primary Goal:**
Notify stakeholders when saved search counts reach the target threshold.

---

## 2. Goals

1. Load two consumables saved searches and count results.
2. Compare counts against a target threshold.
3. Email a warning to a fixed distribution list when thresholds are met.

---

## 3. User Stories

1. **As a** manager, **I want to** be alerted when consumables tasks exceed a threshold **so that** I can intervene.
2. **As an** admin, **I want to** monitor two distinct saved searches **so that** I can track different scenarios.
3. **As a** stakeholder, **I want to** receive an email alert **so that** I know when to review the searches.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load saved search `customsearch1833`.
2. The system must load saved search `customsearch1865`.
3. The system must send an email when a search count is ≥ `TARGET_COUNT` (20).
4. The system must send from employee ID `2363377` and to the configured recipients list.

### Acceptance Criteria

- [ ] Search counts are evaluated for both saved searches.
- [ ] Email is sent when count ≥ 20.
- [ ] Errors are logged without crashing the script.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Dynamically configure recipients or thresholds.
- Update any records based on the results.
- Provide UI or CSV output.

---

## 6. Design Considerations

### User Interface
- None (scheduled processing).

### User Experience
- Email alert only when thresholds are hit.

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
- `customsearch1833` (Consumables Closed Tasks WO SO Upload)
- `customsearch1865` (Consumables Closed Tasks WO SO Today)

### Integration Points
- Email notifications to stakeholders.

### Data Requirements

**Data Volume:**
- Saved search counts only.

**Data Sources:**
- Search results count via `runPaged().count`.

**Data Retention:**
- N/A.

### Technical Constraints
- Recipient list is hardcoded.
- Target count is hardcoded.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Saved searches must exist and be accessible.

### Governance Considerations
- Minimal search usage (count only).

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Alerts are sent when search counts reach threshold.

**How we'll measure:**
- Email delivery logs and saved search counts.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_consumables_warning.js | Scheduled Script | Alert when consumables searches exceed threshold | Implemented |

### Development Approach

**Phase 1:** Threshold checks
- [x] Load and count saved searches
- [x] Send email alerts

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Saved search count ≥ 20 → email sent.

**Edge Cases:**
1. Count < 20 → no email.
2. Saved search missing → error logged.

**Error Handling:**
1. Email send failure is logged.

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
- Email includes search names only.

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

- [ ] Monitor email alerts.

### Rollback Plan

**If deployment fails:**
1. Disable the scheduled script.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should recipients and target count be script parameters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded recipients become outdated | Medium | Medium | Move to script parameters |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Scheduled Script docs.
- Search API docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
