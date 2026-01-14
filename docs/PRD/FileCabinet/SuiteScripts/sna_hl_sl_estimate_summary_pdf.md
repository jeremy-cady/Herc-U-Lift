# PRD: Service Quote Summary PDF Suitelet

**PRD ID:** PRD-UNKNOWN-EstimateSummaryPDF
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hl_sl_estimate_summary_pdf.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that generates a Service Quote Summary PDF for an estimate by grouping line items by task code.

**What problem does it solve?**
Provides a summary PDF for service quotes with grouped task code sections.

**Primary Goal:**
Render a PDF from an estimate using a fixed XML template and task code grouping.

---

## 2. Goals

1. Load estimate and task code data for a given estimate ID.
2. Group estimate lines by task code.
3. Render and return a PDF using a fixed XML template.

---

## 3. User Stories

1. **As a** service user, **I want** a quote summary PDF **so that** I can share a clean grouped summary.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `tranId` as a request parameter.
2. The system must load the estimate and task code records.
3. The system must group line items by task code and build a print data structure.
4. The system must render a PDF using XML template file ID `2069`.
5. The system must return the PDF inline in the response.

### Acceptance Criteria

- [ ] PDF renders with grouped task code sections.
- [ ] Response returns a PDF file inline.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Save the PDF to the File Cabinet.
- Update the estimate record.
- Apply dynamic template selection.

---

## 6. Design Considerations

### User Interface
- No UI form; PDF is returned inline.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Estimate
- Custom Task Code record (`customrecord_quotetaskcodes`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - PDF generation
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Estimate line | `custcol_sna_hul_taskcode`

**Saved Searches:**
- Searches created dynamically for estimate lines and task codes.

### Integration Points
- N/render module for XML to PDF.

### Data Requirements

**Data Volume:**
- One PDF per request.

**Data Sources:**
- Estimate lines and task codes.

**Data Retention:**
- PDF generated on demand; not stored.

### Technical Constraints
- Uses hardcoded template file ID `2069`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.

### Governance Considerations
- Search and render usage per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Service quote summary PDFs generate correctly.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hl_sl_estimate_summary_pdf.js | Suitelet | Generate service quote summary PDF | Implemented |

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Generate summary PDF for estimate with task codes.

**Edge Cases:**
1. Estimate has no task codes; PDF still renders.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users generating quote summaries.

**Permissions required:**
- View estimates
- Access template file

---

## 12. Deployment Plan

### Deployment Steps

1. Upload `sna_hl_sl_estimate_summary_pdf.js`.
2. Deploy Suitelet and validate output.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should template ID be a script parameter?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded template ID changes | Med | Med | Use script parameter |

---

## 15. References & Resources

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- N/render module

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
