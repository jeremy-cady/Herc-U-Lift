# PRD: Billing Schedule Details

**PRD ID:** PRD-UNKNOWN-BillingSchedDetails
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_billingscheddetails.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays billing schedule details and related invoices for a sales order line.

**What problem does it solve?**
Gives users visibility into billing dates and invoices tied to a specific line item.

**Primary Goal:**
Show billing schedule and invoice details for a selected sales order line.

---

## 2. Goals

1. Display sales order line summary fields.
2. Show billing schedule entries derived from the line and invoices.
3. Present related invoice amounts and dates.

---

## 3. User Stories

1. **As a** billing user, **I want to** see line-level billing schedule details **so that** I can verify invoice timing.
2. **As a** support user, **I want to** reference invoice amounts by schedule period **so that** I can answer customer questions.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `lineid` as a request parameter.
2. The Suitelet must load sales order line data using a search filtered by `lineuniquekey`.
3. The Suitelet must display header fields (sales order, item, line number, start date, end date, total amount).
4. The Suitelet must render a sublist of billing schedule rows with bill dates and invoice references.
5. If billing schedule JSON exists on the line, the Suitelet must parse and display those schedule entries.

### Acceptance Criteria

- [ ] Line data loads when `lineid` is provided.
- [ ] Schedule rows display bill dates and invoice links/amounts when available.
- [ ] The form is read-only and hides navigation.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify billing schedules or invoices.
- Create or update transactions.
- Validate billing schedule data beyond parsing.

---

## 6. Design Considerations

### User Interface
- Read-only form titled "Billing Schedule" with a list sublist.

### User Experience
- Quick review of schedule and invoice linkage per line.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- invoice

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Show billing schedule details
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Sales Order Line | custcol_sna_hul_bill_date | Bill date
- Sales Order Line | custcol_sn_hul_billingsched | Billing schedule JSON
- Sales Order Line | custcol_sna_hul_rent_start_date | Rental start
- Sales Order Line | custcol_sna_hul_rent_end_date | Rental end
- Invoice Line | custcol_sna_hul_rent_start_date | Invoice rental start
- Invoice Line | custcol_sna_hul_rent_end_date | Invoice rental end

**Saved Searches:**
- None (script builds search at runtime).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single line lookup per request.

**Data Sources:**
- Sales order line fields
- Applying transaction (invoice) data

**Data Retention:**
- No changes to data.

### Technical Constraints
- Billing schedule JSON must be valid to parse.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Billing schedule population on lines

### Governance Considerations

- **Script governance:** Single search and page render.
- **Search governance:** Summary search on sales order lines.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can view billing schedule and invoice details for a line.
- Data aligns with sales order and invoice values.

**How we'll measure:**
- Spot checks on schedule and invoice output.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_billingscheddetails.js | Suitelet | Display billing schedule details | Implemented |

### Development Approach

**Phase 1:** Validate search columns
- [ ] Confirm line fields and invoice joins

**Phase 2:** UI validation
- [ ] Test with scheduled and single-invoice lines

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Line with billing schedule shows multiple rows and invoice data.

**Edge Cases:**
1. Line without billing schedule shows invoice-only data.
2. Missing `lineid` results in no output.

**Error Handling:**
1. Invalid billing schedule JSON is handled without page crash.

### Test Data Requirements
- Sales order line with `custcol_sn_hul_billingsched` JSON
- Line with applying invoice

### Sandbox Setup
- Deploy Suitelet and call with a valid line unique key

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing or order management roles

**Permissions required:**
- View access to sales orders and invoices

### Data Security
- Financial data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Validate custom fields and searches

### Deployment Steps

1. Deploy Suitelet.
2. Launch from line-level UI button or link.

### Post-Deployment

- [ ] Verify output on sample lines

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet link/button.
2. Fix search logic and re-deploy.

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

- [ ] Should the Suitelet display invoice status or links?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Schedule JSON format changes | Med | Med | Keep line field format stable |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/search module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
