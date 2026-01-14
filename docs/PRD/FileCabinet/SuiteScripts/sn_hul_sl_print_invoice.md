# PRD: Invoice Item List Suitelet

**PRD ID:** PRD-UNKNOWN-PrintInvoice
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_sl_print_invoice.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that returns an item list from an invoice search as a FreeMarker assignment string.

**What problem does it solve?**
Provides a data payload for templates or integrations that need invoice line item details in a preformatted FreeMarker variable.

**Primary Goal:**
Return a FreeMarker assignment of invoice line data for a given invoice ID.

---

## 2. Goals

1. Accept an invoice record ID in the request.
2. Run a transaction search for invoice lines.
3. Return a formatted `<#assign itemList=.../>` string in the response.

---

## 3. User Stories

1. **As a** report/template developer, **I want** invoice line data in FreeMarker **so that** I can render custom PDFs.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `recid` as a request parameter.
2. The system must search invoice lines excluding tax, shipping, mainline, and do-not-print lines.
3. The system must return an assignment string with item details: make, model, serial, fleet code, start/end date, amount, tax amount.

### Acceptance Criteria

- [ ] Response contains a FreeMarker assignment of line data.
- [ ] Lines flagged as do-not-print are excluded.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Render a PDF or HTML page.
- Validate invoice permissions.
- Handle more than 1000 results.

---

## 6. Design Considerations

### User Interface
- No UI; response is a single assignment string.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice (transaction)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Item list response
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction line | `custcol_sna_do_not_print`
- Transaction line | `custcol_sna_hul_fleet_no`
- Transaction line | `custcol_sna_object`
- Transaction line | `custcol_ava_taxamount`

**Saved Searches:**
- None; search is built in the script.

### Integration Points
- Template or integration expecting FreeMarker assignment.

### Data Requirements

**Data Volume:**
- Up to 1000 grouped results.

**Data Sources:**
- Invoice lines and related item/segment fields.

**Data Retention:**
- No data changes.

### Technical Constraints
- Uses summary search grouping and hardcoded formula columns.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** FreeMarker template consumption.

### Governance Considerations
- Single search execution per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- The Suitelet returns a valid FreeMarker assignment for invoice lines.

**How we'll measure:**
- Verify output for a sample invoice.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_sl_print_invoice.js | Suitelet | Return invoice line data | Implemented |

### Development Approach

**Phase 1:** Search invoice lines
- [x] Build and run the transaction search.

**Phase 2:** Response formatting
- [x] Write `<#assign itemList=.../>` to response.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Call Suitelet with valid invoice ID and verify response string.

**Edge Cases:**
1. No invoice lines match filters; list is empty.

**Error Handling:**
1. Errors are logged; response may be empty.

### Test Data Requirements
- Invoice with multiple line items and tax.

### Sandbox Setup
- None.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users or integrations accessing the Suitelet.

**Permissions required:**
- View invoice transactions

### Data Security
- Ensure Suitelet deployment is restricted to authorized roles.

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

1. Upload `sn_hul_sl_print_invoice.js`.
2. Deploy Suitelet and test with a sample invoice.

### Post-Deployment

- [ ] Verify response output.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet deployment.

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

- [ ] Should the Suitelet support paging beyond 1000 results?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large invoices exceed 1000 groups | Low | Med | Add paging support |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Suitelet

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
