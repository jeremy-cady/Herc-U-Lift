# PRD: PO Required Warning Banner (Client Script)

**PRD ID:** PRD-UNKNOWN-POWarningBannerCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_po_warning_banner_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that displays a SweetAlert warning banner when a customer requires a PO number.

**What problem does it solve?**
Provides a user-visible alert on Sales Orders or Invoices when the customer is flagged as PO‑required.

**Primary Goal:**
Show a warning banner when `custentity_sna_hul_po_required` is true.

---

## 2. Goals

1. Detect PO-required customers on page init.
2. Display a SweetAlert warning.
3. Leave non‑required customers unchanged.

---

## 3. User Stories

1. **As a** sales user, **I want** a warning when PO is required **so that** I remember to enter it.
2. **As an** admin, **I want** a visible alert **so that** missing POs are reduced.
3. **As a** support user, **I want** the warning on load **so that** I don’t miss it.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `pageInit`.
2. The system must read the customer ID from `entity`.
3. The system must lookup `custentity_sna_hul_po_required` on the customer.
4. If PO required is true, the system must display a SweetAlert warning:
   - Title: `WARNING`
   - Text: `This customer requires a PO`
   - Icon: `warning`
5. The script includes a `fieldChanged` entry point but currently has no functional logic.

### Acceptance Criteria

- [ ] Warning appears on page init when PO is required.
- [ ] No warning appears when PO is not required.
- [ ] Errors are logged to console without blocking.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Enforce PO entry on save.
- Validate PO number presence.
- Run on server-side events.

---

## 6. Design Considerations

### User Interface
- SweetAlert modal warning.

### User Experience
- Immediate warning on load for PO-required customers.

### Design References
- SweetAlert2 warning modal.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer
- Sales Order / Invoice (as host records)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Warning banner

**Custom Fields:**
- Customer | `custentity_sna_hul_po_required`

**Saved Searches:**
- None (lookupFields used).

### Integration Points
- SweetAlert2 library at `SuiteScripts/Third_Party_Applications/sweetalert2.all.js`.

### Data Requirements

**Data Volume:**
- Per record load.

**Data Sources:**
- Customer lookup field.

**Data Retention:**
- None.

### Technical Constraints
- SweetAlert loaded as a module dependency.

### Dependencies
- **Libraries needed:** SweetAlert2.
- **External dependencies:** None.
- **Other features:** Customer PO required checkbox.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PO-required customers consistently trigger a warning on load.

**How we'll measure:**
- User feedback and reduced PO omissions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_po_warning_banner_cs.js | Client Script | Show PO required warning | Implemented |

### Development Approach

**Phase 1:** Customer check
- [x] Lookup PO required flag

**Phase 2:** UI warning
- [x] SweetAlert warning modal

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Load record with PO-required customer; warning appears.

**Edge Cases:**
1. Customer ID missing; no warning and no crash.

**Error Handling:**
1. Lookup failures log to console.

### Test Data Requirements
- Customer with PO required flag set.

### Sandbox Setup
- Ensure SweetAlert module path is valid.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users viewing or editing sales orders/invoices.

**Permissions required:**
- View access to customer records.

### Data Security
- Read-only checks; no updates.

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

1. Upload `hul_po_warning_banner_cs.js`.
2. Deploy as client script on Sales Order/Invoice forms.
3. Verify SweetAlert module path.

### Post-Deployment

- [ ] Confirm warning appears for PO-required customers.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the client script deployment.

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

- [ ] Should this logic be moved to a User Event for enforcement?
- [ ] Should fieldChanged logic be completed?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| SweetAlert path invalid | Med | Low | Validate module path |
| Users ignore modal | Med | Low | Add save-time enforcement |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_display_po_warning_banner_on_view_so_inv_ue.md

### NetSuite Documentation
- SuiteScript 2.x Client Script
- search.lookupFields API

### External Resources
- SweetAlert2 documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
