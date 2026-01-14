# PRD: Delete Finance Charge Invoices (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-DeleteFinanceChargeMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_mr_delete_finance_charge_invoice.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that deletes finance charge invoices based on a saved search and emails a summary of successes and failures.

**What problem does it solve?**
Automates bulk deletion of finance charge invoices for customers flagged as no-finance-charge and reports results to the user.

**Primary Goal:**
Delete invoices from a saved search and notify the requester with results.

---

## 2. Goals

1. Load the saved search `customsearch_sna_fin_chrg_cust`.
2. Delete invoices returned by the search.
3. Email a success/failure summary to the configured recipient.

---

## 3. User Stories

1. **As an** AR admin, **I want** finance charge invoices removed in bulk **so that** accounts are corrected.
2. **As an** admin, **I want** a summary email **so that** I can review what was deleted.
3. **As a** developer, **I want** deletions driven by a saved search **so that** criteria are configurable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load saved search `customsearch_sna_fin_chrg_cust` as input.
2. The system must delete each record returned by the search using `record.delete`.
3. The system must log successful deletions and track failures.
4. The system must generate a summary email with counts and failed record links.
5. The system must send the email to `custscript_sna_delete_inv_emailto`.

### Acceptance Criteria

- [ ] Invoices in the saved search are deleted.
- [ ] Failures are captured with record links.
- [ ] Summary email contains counts and failures.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Delete records outside the saved search.
- Validate finance charge rules beyond the search.
- Retry deletions after failures.

---

## 6. Design Considerations

### User Interface
- None (batch process with email summary).

### User Experience
- Users receive an email summary after the run completes.

### Design References
- Saved search `customsearch_sna_fin_chrg_cust`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice (or record types returned by the search)

**Script Types:**
- [x] Map/Reduce - Bulk deletion
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- `customsearch_sna_fin_chrg_cust`

### Integration Points
- Email service via `N/email`.

### Data Requirements

**Data Volume:**
- One delete per search result.

**Data Sources:**
- Saved search results.

**Data Retention:**
- Deleted invoices removed from the system.

### Technical Constraints
- Deletion is unconditional (no sandbox-only guard enabled).
- Emails are sent to a single configured recipient.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Email recipient script parameter.

### Governance Considerations
- One delete per record; governance usage scales with search size.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Finance charge invoices are deleted and reported accurately.

**How we'll measure:**
- Compare saved search results to deletion summary email.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_delete_finance_charge_invoice.js | Map/Reduce | Delete finance charge invoices | Implemented |

### Development Approach

**Phase 1:** Deletion
- [x] Load search and delete records in map stage.

**Phase 2:** Notification
- [x] Build and send summary email in summarize stage.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Saved search returns invoices; script deletes and emails summary.

**Edge Cases:**
1. No results; summary email indicates no deletions.
2. Delete fails for a record; failure included in email.

**Error Handling:**
1. Email send fails; error logged.

### Test Data Requirements
- A saved search with test invoices to delete.

### Sandbox Setup
- Run in sandbox with email parameter set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with delete access to invoices.

**Permissions required:**
- Delete invoices
- Send email

### Data Security
- Deleted data cannot be recovered without backups.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sna_hul_mr_delete_finance_charge_invoice.js`.
2. Set `custscript_sna_delete_inv_emailto` recipient.
3. Run in sandbox before production.

### Post-Deployment

- [ ] Verify deletion summary email.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Start | | | |
| Development Complete | | | |
| Testing Complete | | | |
| Stakeholder Review | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should deletions be restricted to sandbox environments?
- [ ] Should failed deletions be retried automatically?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Accidental deletion of valid invoices | Med | High | Review saved search criteria before run |
| Email recipient misconfigured | Low | Med | Validate parameter before running |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- record.delete and email.send APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
