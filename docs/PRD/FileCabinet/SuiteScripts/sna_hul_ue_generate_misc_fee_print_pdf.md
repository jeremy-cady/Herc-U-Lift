# PRD: Generate Misc Fee and PDF Buttons

**PRD ID:** PRD-UNKNOWN-GenerateMiscFeePrintPdf
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_generate_misc_fee_print_pdf.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that adds "Generate PDF" and "Generate MISC Fee" buttons to invoices before saving.

**What problem does it solve?**
Provides quick UI actions to generate PDFs or misc fee calculations from the invoice form.

**Primary Goal:**
Expose invoice actions via custom buttons on the invoice form.

---

## 2. Goals

1. Add a Generate PDF button to the invoice form.
2. Add a Generate MISC Fee button to the invoice form.

---

## 3. User Stories

1. **As a** billing user, **I want to** generate PDFs and misc fee actions **so that** I can complete invoice processing quickly.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeLoad on invoice create/edit.
2. The script must attach client script `sna_hul_cs_generate_misc_fee_print_pdf.js`.
3. The script must add the two buttons and wire them to client functions.

### Acceptance Criteria

- [ ] Generate PDF button appears on the invoice form.
- [ ] Generate MISC Fee button appears on the invoice form.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Generate PDFs server-side in this script.
- Execute misc fee logic directly.

---

## 6. Design Considerations

### User Interface
- Adds two buttons to the invoice form.

### User Experience
- Users can trigger actions without leaving the invoice.

### Design References
- Client script: `sna_hul_cs_generate_misc_fee_print_pdf.js`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Add buttons
- [ ] Client Script - Handles button actions

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- Client script functions `generatePDF` and `generateMiscFee`.

### Data Requirements

**Data Volume:**
- None.

**Data Sources:**
- Invoice form only.

**Data Retention:**
- No record updates in this script.

### Technical Constraints
- Buttons are not added in view or delete modes.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Client script logic

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoice form shows the two buttons and actions run from client script.

**How we'll measure:**
- UI verification in sandbox.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_generate_misc_fee_print_pdf.js | User Event | Add invoice buttons | Implemented |

### Development Approach

**Phase 1:** Button display
- [ ] Validate buttons show in create/edit

**Phase 2:** Client script actions
- [ ] Validate button functions execute

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open invoice in edit mode and verify both buttons.

**Edge Cases:**
1. View mode does not show buttons.

**Error Handling:**
1. Button add errors are logged.

### Test Data Requirements
- Any invoice record

### Sandbox Setup
- Deploy User Event on invoice and include client script.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing roles

**Permissions required:**
- Access invoice form

### Data Security
- No data changes from this script.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm client script file exists

### Deployment Steps

1. Deploy User Event on Invoice.
2. Verify buttons on form.

### Post-Deployment

- [ ] Monitor logs for UI errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Remove buttons from form.

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

- [ ] Should buttons be hidden for non-misc fee invoices?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Client script missing prevents button actions | Low | Low | Validate script deployment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
