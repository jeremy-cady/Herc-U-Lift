# PRD: Quote and Estimate Print Buttons (User Event)

**PRD ID:** PRD-UNKNOWN-CreatePrintButtons
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_createprintbuttons.js (User Event)
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_generatequote.js (Suitelet)
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_generateestimate.js (Suitelet)
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_generatequotetask.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that adds print buttons on estimate records based on the selected custom form to generate quote and estimate PDFs.

**What problem does it solve?**
Provides quick access to Suitelet-driven PDF generation for specific estimate forms.

**Primary Goal:**
Expose context-appropriate print buttons on estimate records.

---

## 2. Goals

1. Add "Generate Quote" and "Generate Estimate" buttons for parts quote form.
2. Add "Generate Service Quote per Task" and "Generate Service Quote Summary" buttons for service estimate form.
3. Open Suitelet URLs in a new window for PDF rendering.

---

## 3. User Stories

1. **As a** sales user, **I want** print buttons on estimates **so that** I can generate PDFs quickly.
2. **As an** admin, **I want** buttons to appear only for specific forms **so that** UI stays clean.

---

## 4. Functional Requirements

### Core Functionality

1. The system must detect the current estimate custom form.
2. For custom form `111` (Parts Quote), the system must add buttons to generate quote and estimate PDFs.
3. For custom form `105` (Service Estimate), the system must add buttons to generate quote per task and quote summary PDFs.
4. The system must open Suitelet URLs with `tranId` and `tranName` parameters in a new window.

### Acceptance Criteria

- [ ] Buttons appear for the correct custom forms.
- [ ] Clicking buttons opens the appropriate Suitelet.
- [ ] PDFs are generated in a new window.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Generate PDFs directly inside the User Event.
- Add buttons to forms outside the specified custom forms.
- Validate permissions beyond standard NetSuite access.

---

## 6. Design Considerations

### User Interface
- Buttons added on estimate record view.

### User Experience
- Users can generate PDFs without navigating to separate menu items.

### Design References
- Suitelets:
  - `customscript_sna_hul_sl_generatequote`
  - `customscript_sna_hul_sl_generateestimate`
  - `customscript_sna_hul_sl_generatequotetas`
  - `customscript_sna_hul_sl_serv_quote_summ`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Estimate

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used for PDF generation
- [ ] RESTlet - Not used
- [x] User Event - Adds print buttons
- [ ] Client Script - Not used

**Custom Fields:**
- Estimate | `customform`

**Saved Searches:**
- None.

### Integration Points
- Suitelet endpoints for PDF generation.

### Data Requirements

**Data Volume:**
- One PDF per button click.

**Data Sources:**
- Estimate record and related data in Suitelet.

**Data Retention:**
- PDFs generated on demand.

### Technical Constraints
- Buttons only appear in view mode.
- Custom form IDs are hardcoded (105 and 111).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Suitelets for PDF generation.

### Governance Considerations
- Minimal; URL resolution only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can generate the correct PDFs from the estimate record.

**How we'll measure:**
- Spot check button visibility and generated PDFs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_createprintbuttons.js | User Event | Add print buttons | Implemented |

### Development Approach

**Phase 1:** Button logic
- [x] Add buttons based on custom form.

**Phase 2:** Suitelet invocation
- [x] Resolve Suitelet URLs and open in new window.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open Parts Quote estimate and verify Generate Quote/Estimate buttons.
2. Open Service Estimate and verify per task/summary buttons.

**Edge Cases:**
1. Other custom forms should not display buttons.

**Error Handling:**
1. Suitelet URL resolution fails; errors are logged.

### Test Data Requirements
- Estimate records with custom forms 105 and 111.

### Sandbox Setup
- Ensure Suitelets are deployed for PDF generation.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and service users.

**Permissions required:**
- View estimates
- Access Suitelets for PDF generation

### Data Security
- PDFs should only be accessible to authorized users.

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

1. Upload `sna_hul_ue_createprintbuttons.js`.
2. Deploy User Event on estimates.
3. Verify Suitelet deployments are active.

### Post-Deployment

- [ ] Verify buttons appear and generate PDFs.
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

- [ ] Should custom form IDs be moved to script parameters?
- [ ] Should buttons appear in edit mode as well?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Custom form IDs change in production | Med | Med | Move IDs to parameters |
| Suitelet deployment missing breaks buttons | Med | Med | Add validation or user-facing warning |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- N/url module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
