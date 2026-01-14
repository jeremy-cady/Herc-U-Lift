# PRD: Generate Invoice PDF (Misc Fee) Suitelet

**PRD ID:** PRD-UNKNOWN-GenerateMiscFeePDF
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_generate_misc_fee_print_pdf.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that generates a PDF from invoice JSON data and a specified template, then saves and redirects to the PDF file.

**What problem does it solve?**
Allows users to generate and view invoice PDFs (including misc fee invoices) using customizable templates.

**Primary Goal:**
Render invoice data into a PDF file and provide access to the generated file.

---

## 2. Goals

1. Display a form to trigger PDF generation.
2. Accept invoice JSON and template ID from POST requests.
3. Render and save a PDF file to the configured folder.

---

## 3. User Stories

1. **As a** billing user, **I want** to generate invoice PDFs **so that** I can share them with customers.
2. **As an** admin, **I want** to use templates **so that** PDF output is consistent.
3. **As a** developer, **I want** a Suitelet endpoint **so that** client scripts can request PDFs.

---

## 4. Functional Requirements

### Core Functionality

1. The system must display a Suitelet form with hidden fields for invoice JSON and template ID on GET.
2. The system must accept `custpage_inv_json_format` and `custpage_template_id` on POST.
3. The system must default the template to `sna_hul_service_invoice_template.xml` when not provided.
4. The system must load the template from `./TEMPLATES/`.
5. The system must render a PDF using `render.create()` and the invoice JSON data.
6. The system must save the PDF to the folder specified by `custscript_invoice_folder`.
7. The system must redirect the user to the PDF file URL after saving.

### Acceptance Criteria

- [ ] GET request renders the form with hidden fields.
- [ ] POST request saves a PDF in the target folder.
- [ ] User is redirected to the PDF file URL.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate invoice JSON contents beyond parseability.
- Provide a selection UI for templates.
- Attach the PDF to the invoice record.

---

## 6. Design Considerations

### User Interface
- Minimal Suitelet form; primarily used by client scripts.

### User Experience
- PDF opens immediately after generation.

### Design References
- Template files in `FileCabinet/SuiteScripts/SNA/TEMPLATES`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- File

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - PDF generation endpoint
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Triggered by `sna_hul_cs_generate_misc_fee_print_pdf.js`

**Custom Fields:**
- Script parameter `custscript_invoice_folder`

**Saved Searches:**
- None.

### Integration Points
- NetSuite Render API.

### Data Requirements

**Data Volume:**
- One PDF per request.

**Data Sources:**
- Invoice JSON provided in request.

**Data Retention:**
- PDF stored in File Cabinet folder.

### Technical Constraints
- Invoice JSON is passed as a string and cleaned for control characters.
- Template ID must exist in the `TEMPLATES` directory.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Client script `sna_hul_cs_generate_misc_fee_print_pdf.js`.

### Governance Considerations
- PDF rendering and file save consume usage units.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoice PDFs generate and open successfully.

**How we'll measure:**
- Verify PDFs are saved in the configured folder and open in the browser.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_generate_misc_fee_print_pdf.js | Suitelet | Generate invoice PDFs | Implemented |

### Development Approach

**Phase 1:** Form handling
- [x] Render hidden fields on GET.

**Phase 2:** PDF rendering
- [x] Render PDF from JSON and save to file.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Submit valid invoice JSON and template ID; PDF renders and opens.

**Edge Cases:**
1. Missing template ID uses default template.
2. Missing JSON aborts processing.

**Error Handling:**
1. Template file missing; error logged and request fails.

### Test Data Requirements
- Valid invoice JSON payload.

### Sandbox Setup
- Suitelet deployment with `custscript_invoice_folder` parameter set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users triggering PDF generation.

**Permissions required:**
- File Cabinet create access

### Data Security
- Generated PDFs stored in File Cabinet; ensure folder permissions are restricted.

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

1. Upload `sna_hul_sl_generate_misc_fee_print_pdf.js`.
2. Deploy the Suitelet and set `custscript_invoice_folder`.
3. Validate PDF generation via client script.

### Post-Deployment

- [ ] Verify PDF saves and redirects.
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

- [ ] Should the Suitelet attach the PDF to the invoice record?
- [ ] Should the template be selectable in the UI?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing template file causes failure | Med | Med | Validate template IDs before use |
| Large JSON payload affects performance | Low | Med | Limit payload size or compress |

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
