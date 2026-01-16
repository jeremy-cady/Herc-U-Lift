# PRD: Generate Misc Fee Print PDF

**PRD ID:** PRD-UNKNOWN-GenerateMiscFeePrintPdf
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_generate_misc_fee_print_pdf.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that renders a PDF from invoice or sales order JSON using a template.

**What problem does it solve?**
Creates a printable PDF for service invoices or sales orders without manual rendering.

**Primary Goal:**
Generate and deliver a PDF using a template and supplied transaction data.

---

## 2. Goals

1. Provide a form that accepts transaction JSON and template ID.
2. Determine the correct template based on invoice vs. sales order.
3. Render and save a PDF to a configured folder and redirect to it.

---

## 3. User Stories

1. **As a** user, **I want to** generate a PDF from transaction data **so that** I can print or share it.
2. **As a** developer, **I want to** use templates **so that** PDF layout is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept JSON data in `custpage_inv_json_format`.
2. The Suitelet must select a template based on the presence of `internalid` in the JSON.
3. The Suitelet must load the template from `./TEMPLATES/`.
4. The Suitelet must render the PDF and save it to the folder specified by `custscript_invoice_folder`.
5. The Suitelet must redirect the user to the saved PDF.

### Acceptance Criteria

- [ ] Correct template is selected for invoice or sales order.
- [ ] PDF is created and saved to the target folder.
- [ ] User is redirected to the PDF file.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate JSON structure beyond parsing.
- Store PDFs outside the configured folder.
- Update the underlying transaction.

---

## 6. Design Considerations

### User Interface
- Form titled "Generate PDF" with hidden JSON and template fields.

### User Experience
- Submit action immediately renders and opens the PDF.

### Design References
- Templates under `./TEMPLATES/`:
  - `sna_hul_service_invoice_template.xml`
  - `sna_hul_service_sales_order_template.xml`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- file (templates and output)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - PDF generation
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None (uses request parameters).

**Saved Searches:**
- None.

### Integration Points
- Client script `sna_hul_cs_generate_misc_fee_print_pdf.js`.

### Data Requirements

**Data Volume:**
- Single transaction JSON per request.

**Data Sources:**
- Request parameter JSON
- Template file

**Data Retention:**
- PDF stored in file cabinet folder specified by parameter.

### Technical Constraints
- Template selection logic relies on JSON `internalid`.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** File cabinet templates

### Governance Considerations

- **Script governance:** File load/render/save per request.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PDFs render correctly from provided JSON.
- Files are saved and accessible.

**How we'll measure:**
- Sample PDF generation and file cabinet checks.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_generate_misc_fee_print_pdf.js | Suitelet | Render and save PDF | Implemented |

### Development Approach

**Phase 1:** Validate templates
- [ ] Confirm template files exist

**Phase 2:** PDF generation
- [ ] Generate sample invoice and sales order PDFs

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice JSON renders invoice template PDF.
2. Sales order JSON renders sales order template PDF.

**Edge Cases:**
1. Missing template ID defaults to invoice template.

**Error Handling:**
1. Invalid JSON stops processing without saving a file.

### Test Data Requirements
- Sample invoice and sales order JSON payloads

### Sandbox Setup
- Deploy Suitelet and client script
- Ensure template files are in `./TEMPLATES/`

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users generating PDFs

**Permissions required:**
- File cabinet access to templates and output folder

### Data Security
- Generated PDFs may include customer financial data; restrict access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Template files exist
- [ ] Output folder parameter configured

### Deployment Steps

1. Deploy Suitelet.
2. Link to transaction UI or button.

### Post-Deployment

- [ ] Verify PDF output and file storage

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Fix template path or JSON source.

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

- [ ] Should the folder parameter be required instead of optional?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Template file missing or renamed | Med | Med | Validate template IDs at deploy time |

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
