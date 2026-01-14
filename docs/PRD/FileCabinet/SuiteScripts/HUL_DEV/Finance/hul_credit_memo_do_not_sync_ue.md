# PRD: Credit Memo Do Not Sync (VersaPay)

**PRD ID:** PRD-20250804-CreditMemoDoNotSync
**Created:** August 4, 2025
**Last Updated:** August 4, 2025
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_credit_memo_do_not_sync_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that automatically flags new Credit Memos as “Do Not Sync” with VersaPay when the revenue stream is internal.

**What problem does it solve?**
Prevents internal revenue stream credit memos from syncing to VersaPay.

**Primary Goal:**
Ensure internal Credit Memos are excluded from VersaPay synchronization at creation time.

---

## 2. Goals

1. Automatically set `custbody_versapay_do_not_sync` when the revenue stream is internal.
2. Run only on Credit Memo create to avoid unintended edits.
3. Provide logging for audit/debug.

---

## 3. User Stories

1. **As a** finance user, **I want to** have internal credit memos excluded from VersaPay **so that** external syncs remain accurate.
2. **As an** admin, **I want to** enforce the internal revenue stream rule automatically **so that** users do not need to remember it.
3. **As a** developer, **I want to** see logging for revenue stream decisions **so that** I can troubleshoot behavior.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on Credit Memo create (`beforeSubmit`).
2. The system must read `cseg_sna_revenue_st` and compare against an internal ID list.
3. When the revenue stream is in the internal list, the system must set `custbody_versapay_do_not_sync = true`.
4. When the revenue stream is not in the list, the system must leave the flag unchanged.

### Acceptance Criteria

- [ ] Internal revenue stream Credit Memos are flagged as Do Not Sync on create.
- [ ] External revenue stream Credit Memos remain unchanged.
- [ ] Logs show the revenue stream and decision path.
- [ ] No errors are thrown on create.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update existing Credit Memos.
- Validate or modify VersaPay behavior beyond this flag.
- Maintain the revenue stream list dynamically.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Transparent automation; no user action required.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Credit Memo (transaction)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Set Do Not Sync on create
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_versapay_do_not_sync` | VersaPay Do Not Sync flag
- Transaction | `cseg_sna_revenue_st` | Revenue stream segment

**Saved Searches:**
- None.

### Integration Points
- VersaPay sync uses `custbody_versapay_do_not_sync`.

### Data Requirements

**Data Volume:**
- Per Credit Memo create.

**Data Sources:**
- Credit Memo body fields.

**Data Retention:**
- N/A.

### Technical Constraints
- Revenue stream list is hardcoded in the script.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** VersaPay integration respects the flag.

### Governance Considerations
- Minimal usage; single record update in beforeSubmit.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Internal credit memos consistently carry the Do Not Sync flag.
- VersaPay excludes internal credit memos from sync.

**How we'll measure:**
- Spot-check created credit memos by revenue stream.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_credit_memo_do_not_sync_ue.js | User Event | Set Do Not Sync on internal revenue streams | Implemented |

### Development Approach

**Phase 1:** Initial implementation
- [x] Add revenue stream list
- [x] Set Do Not Sync in beforeSubmit on create

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a Credit Memo with internal revenue stream → flag set to true.
2. Create a Credit Memo with external revenue stream → flag unchanged.

**Edge Cases:**
1. Revenue stream is blank or non-numeric → flag unchanged.
2. User Event errors are logged and do not block save.

**Error Handling:**
1. Exceptions are logged via `log.error`.

### Test Data Requirements
- Sample Credit Memos across internal and external revenue streams.

### Sandbox Setup
- Deploy script to Credit Memo.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance roles creating credit memos.

**Permissions required:**
- Edit Credit Memo.

### Data Security
- No sensitive data logged beyond revenue stream IDs.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy User Event on Credit Memo.
2. Validate with internal/external test memos.

### Post-Deployment

- [ ] Verify behavior in production
- [ ] Monitor logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2025-08-04 | 2025-08-04 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the revenue stream list be maintained via a custom list or parameter?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded revenue stream IDs become outdated | Medium | Medium | Review list periodically |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event docs.

### External Resources
- VersaPay integration documentation (internal).

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-08-04 | Jeremy Cady | 1.0 | Initial implementation |
