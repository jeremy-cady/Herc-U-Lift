# PRD: Print Vendor Return Authorization

**PRD ID:** PRD-UNKNOWN-PrintVra
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_printvra.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that renders a Vendor Return Authorization PDF using a configured template.

**What problem does it solve?**
Provides a printable VRA document without manual template handling.

**Primary Goal:**
Load a VRA record and return a rendered PDF inline.

---

## 2. Goals

1. Accept a VRA transaction ID from request parameters.
2. Load the VRA record and apply a template.
3. Return the PDF inline to the user.

---

## 3. User Stories

1. **As a** procurement user, **I want to** print VRAs **so that** I can send return documentation to vendors.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `tranId` as a request parameter.
2. The Suitelet must load the vendor return authorization record.
3. The Suitelet must load the template defined by script parameter `custscript_vrapdftemplate`.
4. The Suitelet must render and return the PDF inline.

### Acceptance Criteria

- [ ] VRA PDF renders from the provided record.
- [ ] Response is inline and viewable in the browser.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Save the PDF to the file cabinet.
- Update the VRA record.
- Validate template contents.

---

## 6. Design Considerations

### User Interface
- No UI; PDF returned directly.

### User Experience
- Immediate PDF output.

### Design References
- Template specified by `custscript_vrapdftemplate`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- vendorreturnauthorization

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Render VRA PDF
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- Template file referenced by script parameter.

### Data Requirements

**Data Volume:**
- Single VRA per request.

**Data Sources:**
- VRA record

**Data Retention:**
- No data changes.

### Technical Constraints
- Template file ID must be configured via parameter.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** VRA PDF template

### Governance Considerations

- **Script governance:** Record load and render.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- VRAs render correctly and are accessible to users.

**How we'll measure:**
- Sample VRA PDF generation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_printvra.js | Suitelet | Render VRA PDF | Implemented |

### Development Approach

**Phase 1:** Template validation
- [ ] Confirm template parameter is set

**Phase 2:** Output validation
- [ ] Test with a VRA record

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. VRA ID returns a rendered PDF.

**Edge Cases:**
1. Missing `tranId` results in no output.

**Error Handling:**
1. Invalid VRA ID logs an error.

### Test Data Requirements
- Vendor Return Authorization record

### Sandbox Setup
- Deploy Suitelet and configure template parameter

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Procurement or returns roles

**Permissions required:**
- View access to vendor return authorizations and template files

### Data Security
- Vendor return data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Template file parameter set

### Deployment Steps

1. Deploy Suitelet.
2. Add link/button on VRA.

### Post-Deployment

- [ ] Validate PDF output

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Fix template parameter or record access.

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

- [ ] Should the PDF be saved for audit purposes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Template parameter not set | Med | Med | Enforce deployment checklist |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/render module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
