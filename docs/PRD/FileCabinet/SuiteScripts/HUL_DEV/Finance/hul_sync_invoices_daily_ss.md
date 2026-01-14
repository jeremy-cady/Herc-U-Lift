# PRD: Versapay Daily Invoice Sync Reset

**PRD ID:** PRD-UNKNOWN-VersapayDailyUncheck
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_sync_invoices_daily_ss.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A nightly scheduled script that unchecks the VersaPay “Do Not Sync” flag on invoices created today when the revenue stream is external, then emails a summary.

**What problem does it solve?**
Ensures newly created external‑revenue invoices are eligible to sync to VersaPay while keeping internal revenue invoices excluded.

**Primary Goal:**
Automatically clear the Do Not Sync flag for today’s external invoices and report the results.

---

## 2. Goals

1. Query invoices created today.
2. Clear `custbody_versapay_do_not_sync` for external revenue stream invoices.
3. Email a summary of updates, skips, and errors.

---

## 3. User Stories

1. **As a** finance user, **I want to** have external invoices automatically eligible for VersaPay sync **so that** daily sync is accurate.
2. **As an** admin, **I want to** receive a summary email **so that** I can audit the changes.
3. **As a** developer, **I want to** avoid touching internal invoices **so that** integrations remain correct.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run as a Scheduled Script.
2. The system must query invoices by `createddate` for the current day.
3. The system must check `cseg_sna_revenue_st` against the external list.
4. For external streams, the system must set `custbody_versapay_do_not_sync` to false.
5. For non‑external streams, the system must skip updates.
6. The system must send a summary email to the current user.

### Acceptance Criteria

- [ ] External revenue stream invoices created today are updated.
- [ ] Internal or unknown revenue stream invoices are not updated.
- [ ] Summary email includes counts for updated/skipped/no‑revstream/errors.
- [ ] Errors are logged without stopping the script.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update invoices outside today’s create date.
- Use transaction date instead of created date.
- Sync invoices to VersaPay directly.

---

## 6. Design Considerations

### User Interface
- None (scheduled processing).

### User Experience
- Audit summary delivered by email.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice (transaction)

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Nightly update
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_versapay_do_not_sync` | VersaPay Do Not Sync flag
- Transaction | `cseg_sna_revenue_st` | Revenue stream segment

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- VersaPay integration respects `custbody_versapay_do_not_sync`.

### Data Requirements

**Data Volume:**
- All invoices created today.

**Data Sources:**
- SuiteQL query on `transaction`.

**Data Retention:**
- N/A.

### Technical Constraints
- External revenue stream list is hardcoded.
- Uses created date (UTC truncation).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** VersaPay integration.

### Governance Considerations
- record.submitFields per matching invoice.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- External invoices are cleared for sync daily without manual intervention.
- Summary emails provide clear audit trails.

**How we'll measure:**
- Daily email review and spot checks of updated invoices.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_sync_invoices_daily_ss.js | Scheduled Script | Clear Do Not Sync for today’s external invoices | Implemented |

### Development Approach

**Phase 1:** Nightly automation
- [x] SuiteQL query for today’s invoices
- [x] Update Do Not Sync flag for external streams
- [x] Email summary to current user

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create external invoice today → flag cleared by script.

**Edge Cases:**
1. Invoice without revenue stream → counted in no‑revstream.
2. Internal revenue stream invoice → skipped.

**Error Handling:**
1. submitFields failure logs error and continues.

### Test Data Requirements
- Invoices created today with a mix of external/internal streams.

### Sandbox Setup
- Deploy scheduled script and run on demand.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance/admin users monitoring VersaPay sync.

**Permissions required:**
- Edit Invoices.

### Data Security
- No sensitive data beyond invoice IDs in email summary.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy scheduled script.
2. Schedule nightly execution.

### Post-Deployment

- [ ] Monitor summary email for errors.

### Rollback Plan

**If deployment fails:**
1. Disable the scheduled script deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should recipients be configurable rather than current user?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded external revenue stream list becomes outdated | Medium | Medium | Periodic review/update |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Scheduled Script docs.
- SuiteQL reference.

### External Resources
- VersaPay integration documentation (internal).

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
