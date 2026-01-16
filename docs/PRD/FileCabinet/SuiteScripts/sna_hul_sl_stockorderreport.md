# PRD: Stock Order Report

**PRD ID:** PRD-UNKNOWN-StockOrderReport
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_stockorderreport.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays a stock order report UI and triggers CSV generation via Map/Reduce.

**What problem does it solve?**
Provides a filtered report for stock ordering and generates CSV output for further processing.

**Primary Goal:**
Collect report filters and initiate CSV generation for stock order reporting.

---

## 2. Goals

1. Provide filter fields for item, vendor, location, and date ranges.
2. Validate inputs and pass filter data to a Map/Reduce CSV job.
3. Redirect back to the Suitelet after scheduling CSV generation.

---

## 3. User Stories

1. **As a** planner, **I want to** filter stock order data **so that** I can generate a relevant report.
2. **As a** user, **I want to** generate a CSV **so that** I can share or analyze results.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must render filter fields for item category, vendor, location, demand period, PO period, and ROP quantities.
2. The Suitelet must gather filter parameters and submit a Map/Reduce task for CSV generation.
3. The Suitelet must redirect back to the form after submission.

### Acceptance Criteria

- [ ] Filter fields appear and are validated.
- [ ] MR task submits with JSON filter parameters.
- [ ] User returns to the form after submission.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Generate the CSV directly in the Suitelet.
- Modify item or transaction data.
- Enforce complex validation beyond required fields.

---

## 6. Design Considerations

### User Interface
- Form titled "Stock Order Report" with filter group and submit button.

### User Experience
- Generate CSV via a button and return to the form.

### Design References
- Client script `sna_hul_cs_lib_stockordereport.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- item
- vendor
- location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Filter and submit report
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Uses item category custom record and related fields from saved searches.

**Saved Searches:**
- Underlying searches referenced by the MR job.

### Integration Points
- Map/Reduce `customscript_sna_hul_mr_stockorderrepcsv`.

### Data Requirements

**Data Volume:**
- Filters apply to potentially large item and transaction datasets.

**Data Sources:**
- Suitelet filters passed to MR.

**Data Retention:**
- No data changes in Suitelet.

### Technical Constraints
- Filter extraction only includes `custpage_filter_*` fields.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Stock order CSV generation MR

### Governance Considerations

- **Script governance:** MR submission and form rendering.
- **Search governance:** None in Suitelet; handled in MR.
- **API limits:** Low for Suitelet; MR handles heavy work.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- CSV generation tasks are scheduled with correct filters.

**How we'll measure:**
- Review MR logs and CSV output.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_stockorderreport.js | Suitelet | Submit stock order report CSV job | Implemented |

### Development Approach

**Phase 1:** Filter validation
- [ ] Confirm required filters are enforced

**Phase 2:** MR submission
- [ ] Verify task submission and redirect

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Submit filters and schedule CSV generation.

**Edge Cases:**
1. Missing required dates prevents submission.

**Error Handling:**
1. MR submission errors are surfaced in logs.

### Test Data Requirements
- Items and transactions matching search filters

### Sandbox Setup
- Deploy Suitelet and MR

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Inventory planning roles

**Permissions required:**
- Access to items, vendors, and locations

### Data Security
- Report data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] MR script deployed

### Deployment Steps

1. Deploy Suitelet.
2. Provide access to planning users.

### Post-Deployment

- [ ] Validate CSV generation

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Use manual reporting process.

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

- [ ] Should CSV generation include a completion notification in the UI?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large filters cause long-running MR jobs | Med | Med | Use off-hours scheduling and paging |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/task module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
