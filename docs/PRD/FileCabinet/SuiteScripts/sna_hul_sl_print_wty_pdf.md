# PRD: Print Warranty PDF

**PRD ID:** PRD-UNKNOWN-PrintWarrantyPdf
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_print_wty_pdf.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that renders a warranty invoice PDF from an invoice record.

**What problem does it solve?**
Generates a printable warranty invoice PDF using a dedicated template.

**Primary Goal:**
Load an invoice record and return a rendered PDF in the response.

---

## 2. Goals

1. Accept an invoice record ID from request parameters.
2. Load the invoice record and apply a PDF template.
3. Stream the PDF inline to the user.

---

## 3. User Stories

1. **As a** service user, **I want to** print warranty invoices **so that** customers receive proper documentation.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `inv_rec_id` as a parameter.
2. The Suitelet must load the invoice record.
3. The Suitelet must render the PDF using `custtmpl_sna_warranty_invoice_template.xml`.
4. The Suitelet must return the PDF inline in the response.

### Acceptance Criteria

- [ ] PDF renders from the invoice record.
- [ ] Response is inline and viewable in the browser.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Save the PDF to the file cabinet.
- Update the invoice record.
- Support non-invoice record types.

---

## 6. Design Considerations

### User Interface
- No UI; PDF is returned directly.

### User Experience
- Immediate PDF output.

### Design References
- Template: `SuiteScripts/TEMPLATES/custtmpl_sna_warranty_invoice_template.xml`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Render warranty invoice PDF
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None (uses record fields in template).

**Saved Searches:**
- None.

### Integration Points
- Template file in the file cabinet.

### Data Requirements

**Data Volume:**
- Single invoice per request.

**Data Sources:**
- Invoice record

**Data Retention:**
- No new records created.

### Technical Constraints
- Template file path is hard-coded.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Warranty invoice template

### Governance Considerations

- **Script governance:** Record load and render.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Warranty PDFs render correctly from invoice records.

**How we'll measure:**
- Sample warranty invoice PDF generation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_print_wty_pdf.js | Suitelet | Render warranty invoice PDF | Implemented |

### Development Approach

**Phase 1:** Template validation
- [ ] Confirm template availability

**Phase 2:** Output validation
- [ ] Test with sample invoice

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice ID returns a rendered PDF.

**Edge Cases:**
1. Missing `inv_rec_id` returns no output.

**Error Handling:**
1. Invalid invoice ID logs an error.

### Test Data Requirements
- Invoice record with warranty data

### Sandbox Setup
- Deploy Suitelet and confirm template path

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Service or billing roles

**Permissions required:**
- View access to invoices and template files

### Data Security
- Warranty invoice data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Template file exists in file cabinet

### Deployment Steps

1. Deploy Suitelet.
2. Link to invoice UI button.

### Post-Deployment

- [ ] Validate PDF output

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Fix template path or record access.

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

- [ ] Should the PDF be saved to the file cabinet for audit?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Template path changes break rendering | Low | Med | Keep template ID stable |

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
