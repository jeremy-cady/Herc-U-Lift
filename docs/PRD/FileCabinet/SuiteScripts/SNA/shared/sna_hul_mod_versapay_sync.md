# PRD: VersaPay Sync Prevention Helper

**PRD ID:** PRD-UNKNOWN-VersaPaySyncModule
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_versapay_sync.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A shared module that marks transactions as "do not sync" with VersaPay based on the revenue stream configuration.

**What problem does it solve?**
Automatically prevents internal revenue stream transactions from syncing to VersaPay.

**Primary Goal:**
Set `custbody_versapay_do_not_sync` when the revenue stream is internal.

---

## 2. Goals

1. Identify the revenue stream on a transaction.
2. Determine if the revenue stream is internal.
3. Set the VersaPay sync flag accordingly.

---

## 3. User Stories

1. **As an** AR admin, **I want** internal transactions excluded from VersaPay **so that** only external invoices sync.
2. **As a** developer, **I want** a reusable helper **so that** multiple scripts can apply the same rule.
3. **As an** auditor, **I want** sync flags applied consistently **so that** data integrity is preserved.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read `cseg_sna_revenue_st` from the current record.
2. If no revenue stream is present, the system must exit without changes.
3. The system must lookup `custrecord_sna_hul_revstreaminternal` on the revenue stream record.
4. The system must set `custbody_versapay_do_not_sync` on the current record to the lookup value.
5. Errors in lookup must be logged without throwing.

### Acceptance Criteria

- [ ] Transactions with internal revenue streams have `custbody_versapay_do_not_sync` set to true.
- [ ] Transactions without a revenue stream are not modified.
- [ ] Lookup failures are logged.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Sync or transmit data to VersaPay.
- Validate revenue stream records beyond the internal flag.
- Update any other transaction fields.

---

## 6. Design Considerations

### User Interface
- None (helper module).

### User Experience
- Transactions are flagged automatically based on revenue stream configuration.

### Design References
- Custom segment `cseg_sna_revenue_st` and flag `custrecord_sna_hul_revstreaminternal`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)
- Transaction (caller record)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Used by consuming scripts
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `cseg_sna_revenue_st`
- Transaction | `custbody_versapay_do_not_sync`
- Revenue Stream | `custrecord_sna_hul_revstreaminternal`

**Saved Searches:**
- None.

### Integration Points
- None (VersaPay integration handled elsewhere).

### Data Requirements

**Data Volume:**
- One lookup per transaction update.

**Data Sources:**
- Revenue stream custom segment record.

**Data Retention:**
- Updates current transaction field only.

### Technical Constraints
- Uses `search.lookupFields.promise` and sets field asynchronously.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Called by scripts that process transactions.

### Governance Considerations
- One lookupFields call per invocation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Internal revenue stream transactions consistently skip VersaPay sync.

**How we'll measure:**
- Review transactions for `custbody_versapay_do_not_sync` flags.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mod_versapay_sync.js | Library | Prevent VersaPay sync for internal revenue | Implemented |

### Development Approach

**Phase 1:** Revenue stream lookup
- [x] Fetch internal flag from revenue stream record.

**Phase 2:** Flag update
- [x] Set `custbody_versapay_do_not_sync` on the current record.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Transaction with internal revenue stream sets do-not-sync flag.

**Edge Cases:**
1. Transaction with no revenue stream does nothing.
2. Revenue stream lookup fails; error logged.

**Error Handling:**
1. lookupFields promise rejection logs error.

### Test Data Requirements
- Revenue stream record with `custrecord_sna_hul_revstreaminternal` set.

### Sandbox Setup
- Consuming script deployed on transactions that reference revenue stream segment.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with permission to view revenue stream records.

**Permissions required:**
- View custom segment records
- Edit transactions (to set do-not-sync field)

### Data Security
- Updates only a boolean flag on the transaction.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Documentation updated

### Deployment Steps

1. Upload `sna_hul_mod_versapay_sync.js`.
2. Ensure consuming scripts import and call the helper.

### Post-Deployment

- [ ] Verify do-not-sync flags on internal revenue stream transactions.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove module reference from consuming scripts or redeploy prior version.

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

- [ ] Should the helper also clear the flag when revenue stream is not internal?
- [ ] Should lookup failures block record save?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Async lookup completes after record save | Med | Med | Ensure caller waits or runs in beforeSubmit |
| Incorrect revenue stream configuration | Low | Med | Validate configuration periodically |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x search.lookupFields

### External Resources
- VersaPay integration docs (if applicable)

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
