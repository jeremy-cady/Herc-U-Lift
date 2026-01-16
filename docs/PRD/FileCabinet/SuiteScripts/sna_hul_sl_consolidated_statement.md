# PRD: Consolidated Customer Statement

**PRD ID:** PRD-UNKNOWN-ConsolidatedStatement
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_consolidated_statement.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that generates a consolidated customer statement PDF for parent customers.

**What problem does it solve?**
Creates a consolidated statement without manual PDF assembly by pulling balances, invoices, and payments.

**Primary Goal:**
Render and deliver a consolidated statement PDF for a selected customer and date range.

---

## 2. Goals

1. Provide a UI to select statement date, start date, and customer.
2. Build consolidated balances, aging, invoice, and payment data.
3. Render and save a PDF using the consolidated statement template.

---

## 3. User Stories

1. **As a** billing user, **I want to** generate consolidated statements **so that** parent customers see total balances.
2. **As a** finance user, **I want to** download the PDF **so that** I can distribute statements.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must display a form to select statement date, optional start date, and customer.
2. The Suitelet must list parent customers with non-zero consolidated balance.
3. On submit, the Suitelet must load customer and company address data.
4. The Suitelet must retrieve consolidated balance, aging, invoice, and payment data via saved searches.
5. The Suitelet must render a PDF from `sna_hul_consolidated_customer_statement.xml`.
6. The Suitelet must save the PDF to folder ID 1570401 and redirect to the file URL.

### Acceptance Criteria

- [ ] PDF is generated for selected customer and date range.
- [ ] Output includes balances and detail lines from consolidated searches.
- [ ] File is saved and user is redirected to the PDF.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update customer or transaction records.
- Validate consolidation beyond search logic.
- Support non-parent customer selection.

---

## 6. Design Considerations

### User Interface
- Form titled "Generate Consolidated Customer Statement" with date and customer fields.

### User Experience
- Single submit generates and opens PDF.

### Design References
- Template: `./TEMPLATES/sna_hul_consolidated_customer_statement.xml`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customer
- company information (config)
- transaction (invoice, payment)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Generate consolidated statement PDF
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None (uses saved search results).

**Saved Searches:**
- customsearch_sna_balanceforward_srch__11
- customsearch_sna_balanceforward_srch__12
- customsearch_sna_balanceforward_srch__10
- customsearch_sna_agingbalance_4
- customsearch_sna_invoicetable_srch_2

### Integration Points
- File cabinet template and PDF rendering.

### Data Requirements

**Data Volume:**
- Consolidated transactions for a customer group.

**Data Sources:**
- Customer record and address book
- Company information record
- Saved searches for balances and aging

**Data Retention:**
- Saves a PDF file in the file cabinet.

### Technical Constraints
- Hard-coded output folder ID (1570401).

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Consolidated statement template

### Governance Considerations

- **Script governance:** Multiple saved searches and record loads.
- **Search governance:** Formula-based filtering by parent name.
- **API limits:** Single customer per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PDFs generate successfully with correct consolidated data.
- Users can download the PDF without errors.

**How we'll measure:**
- Spot checks of generated statements and file cabinet entries.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_consolidated_statement.js | Suitelet | Generate consolidated statement PDF | Implemented |

### Development Approach

**Phase 1:** Validate searches and template
- [ ] Confirm saved searches and template availability

**Phase 2:** Generate sample PDFs
- [ ] Test with a parent customer

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Parent customer with balance generates PDF.

**Edge Cases:**
1. Customer with no balances still renders empty tables.
2. Missing start date defaults to full history.

**Error Handling:**
1. Template not found should log an error and stop.

### Test Data Requirements
- Parent customer with child transactions

### Sandbox Setup
- Deploy Suitelet and ensure template exists

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing roles

**Permissions required:**
- View access to customer and transaction data
- File cabinet access to templates and output folder

### Data Security
- Consolidated financial data must be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Template exists in file cabinet
- [ ] Output folder ID validated

### Deployment Steps

1. Deploy Suitelet.
2. Provide access to billing roles.

### Post-Deployment

- [ ] Verify output file and contents

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Fix template or search configuration.

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

- [ ] Should output folder be configurable via parameter?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Parent name changes break formula searches | Med | Med | Prefer internal ID filters if possible |

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
