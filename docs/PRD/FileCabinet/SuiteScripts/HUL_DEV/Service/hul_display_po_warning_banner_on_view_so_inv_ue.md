# PRD: Display PO Warning on View (User Event)

**PRD ID:** PRD-UNKNOWN-POWarningBannerUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_display_po_warning_banner_on_view_so_inv_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that displays a warning banner on Sales Order or Invoice view pages when the customer requires a PO number and the PO# field is blank.

**What problem does it solve?**
Prompts users to enter a required purchase order number for customers flagged as PO‑required.

**Primary Goal:**
Show a page‑init warning message when `custentity_sna_hul_po_required` is true and `otherrefnum` is empty.

---

## 2. Goals

1. Detect PO-required customers on view.
2. Check whether a PO number is present.
3. Display a warning banner if missing.

---

## 3. User Stories

1. **As a** sales user, **I want** a warning when PO# is required **so that** I can add it.
2. **As an** admin, **I want** reminders on view **so that** missing POs are corrected.
3. **As a** support user, **I want** a clear banner **so that** the issue is visible immediately.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeLoad` for `VIEW`.
2. The system must read:
   - Customer ID (`entity`)
   - PO number (`otherrefnum`)
3. The system must look up customer field `custentity_sna_hul_po_required`.
4. If PO required is true and PO number is blank, the system must add a page init message:
   - Title: “PO is Required for this Customer”
   - Message: “Please Enter Purchase Order Number On PO# field”
5. Errors must be logged without blocking the page.

### Acceptance Criteria

- [ ] Warning banner appears when PO is required and missing.
- [ ] Banner does not appear when PO is present or not required.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Enforce PO entry on save.
- Run on edit or create.
- Update any record data.

---

## 6. Design Considerations

### User Interface
- NetSuite page init message banner (error style).

### User Experience
- Immediate visibility of missing PO requirement.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer
- Sales Order / Invoice (or any record with `otherrefnum`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - View-time warning
- [ ] Client Script - Not used

**Custom Fields:**
- Customer | `custentity_sna_hul_po_required`

**Saved Searches:**
- None (lookupFields used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per record view.

**Data Sources:**
- Customer lookup and record fields.

**Data Retention:**
- None.

### Technical Constraints
- Only runs on VIEW.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Customer PO required flag.

### Governance Considerations
- One lookupFields call per view.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users are prompted to enter PO numbers when required.

**How we'll measure:**
- Reduced missing PO numbers and user feedback.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_display_po_warning_banner_on_view_so_inv_ue.js | User Event | Show PO required warning banner | Implemented |

### Development Approach

**Phase 1:** Lookup
- [x] Check customer PO required flag

**Phase 2:** UI
- [x] Add page init message when missing PO

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. View a transaction for PO-required customer with blank PO#; banner appears.
2. View same transaction with PO# populated; no banner.

**Edge Cases:**
1. Customer lookup fails; no banner, error logged.

**Error Handling:**
1. Lookup errors logged without blocking page load.

### Test Data Requirements
- Customer with `custentity_sna_hul_po_required = true`.
- Transactions with and without `otherrefnum`.

### Sandbox Setup
- Ensure PO required field exists and is set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users viewing transactions.

**Permissions required:**
- View access to customer records.

### Data Security
- Read-only checks; no data updates.

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

1. Upload `hul_display_po_warning_banner_on_view_so_inv_ue.js`.
2. Deploy on Sales Order/Invoice record types.
3. Validate banner behavior on view.

### Post-Deployment

- [ ] Confirm warning banner displays as expected.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should the banner also appear on edit?
- [ ] Should the message be a warning instead of error?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Customer lookup fails | Low | Low | Log and continue |
| Users ignore banner | Med | Low | Add save-time enforcement |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.x User Event
- message API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
