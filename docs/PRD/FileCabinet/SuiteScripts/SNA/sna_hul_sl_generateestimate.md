# PRD: Generate Estimate PDF Suitelet

**PRD ID:** PRD-UNKNOWN-GenerateEstimatePDF
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_generateestimate.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that generates a PDF for an estimate by grouping line items by task code and rendering a template.

**What problem does it solve?**
Provides a structured estimate PDF output grouped by task codes with customized branding.

**Primary Goal:**
Render an estimate PDF using task code groupings and a specified XML template.

---

## 2. Goals

1. Load estimate and task code data for a given estimate ID.
2. Group estimate line items by task code.
3. Render and return a PDF using a template and logos.

---

## 3. User Stories

1. **As a** sales rep, **I want** estimate PDFs grouped by task code **so that** proposals are clearer.
2. **As an** admin, **I want** templates configurable **so that** branding is consistent.
3. **As a** developer, **I want** a Suitelet endpoint **so that** PDFs can be generated on demand.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `tranId` and `tranName` parameters.
2. The system must load the estimate record and task code records for the estimate.
3. The system must search estimate lines with task codes and group them by task code.
4. The system must build a print data structure for grouped lines.
5. The system must render a PDF using the template specified by `custscript_param_estimatepdftemplate`.
6. The system must inject subsidiary logo and right logo into the template.
7. The system must return the PDF file inline in the response.

### Acceptance Criteria

- [ ] Estimate PDF renders with grouped task code sections.
- [ ] Template and logos are applied correctly.
- [ ] Response returns a PDF file inline.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Save the PDF to the File Cabinet.
- Update the estimate record.
- Validate task code data beyond search results.

---

## 6. Design Considerations

### User Interface
- PDF is streamed back in response; no UI form.

### User Experience
- Users receive a formatted estimate PDF immediately.

### Design References
- Template file specified by script parameter `custscript_param_estimatepdftemplate`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Estimate
- Custom Task Code record (`customrecord_quotetaskcodes`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Estimate PDF generation
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Estimate line | `custcol_sna_hul_taskcode`

**Saved Searches:**
- Searches created dynamically for estimate and task code data.

### Integration Points
- NetSuite Render API and XML template.

### Data Requirements

**Data Volume:**
- One PDF per request.

**Data Sources:**
- Estimate lines and task codes.

**Data Retention:**
- PDF is generated and returned; not stored.

### Technical Constraints
- Template and logo URLs must be valid.
- Uses XML template replacements for logos and transaction name.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Script parameters for template and logos.

### Governance Considerations
- Render and search usage per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Estimate PDFs generate correctly and are readable by users.

**How we'll measure:**
- Spot check generated PDFs for correct grouping and branding.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_generateestimate.js | Suitelet | Generate estimate PDFs | Implemented |

### Development Approach

**Phase 1:** Data preparation
- [x] Load estimate, search lines, and task codes.

**Phase 2:** PDF rendering
- [x] Render XML template with data and return PDF.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Generate PDF for estimate with task codes and verify output.

**Edge Cases:**
1. Estimate has no task codes; output should still render.
2. Template ID missing; PDF generation fails.

**Error Handling:**
1. Record load or search fails; error logged.

### Test Data Requirements
- Estimate with task code lines.

### Sandbox Setup
- Suitelet deployed with template and logo parameters set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users generating estimate PDFs.

**Permissions required:**
- View estimate records
- Access to template files

### Data Security
- PDF is returned inline; ensure URL access is controlled.

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

1. Upload `sna_hul_sl_generateestimate.js`.
2. Set `custscript_param_estimatepdftemplate` and `custscript_param_rightlogourl`.
3. Validate PDF output.

### Post-Deployment

- [ ] Verify estimate PDF output.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

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

- [ ] Should PDFs be saved to the File Cabinet?
- [ ] Should task code grouping be optional?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing template parameter causes failure | Med | Med | Add fallback template or validation |
| Large estimates slow rendering | Med | Med | Optimize search and data grouping |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- N/render module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
