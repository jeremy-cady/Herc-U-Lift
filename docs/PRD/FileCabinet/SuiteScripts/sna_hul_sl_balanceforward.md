# PRD: Balance Forward Statement Data

**PRD ID:** PRD-UNKNOWN-BalanceForward
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_balanceforward.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that returns FreeMarker assignments used by the Balance Forward statement template.

**What problem does it solve?**
Provides aging, invoice, and payment data for statement rendering without embedding search logic in the template.

**Primary Goal:**
Return statement data for a single customer and date range.

---

## 2. Goals

1. Calculate invoice and payment balance forward amounts.
2. Return aging buckets for the customer.
3. Return detailed invoice and payment lists for the statement template.

---

## 3. User Stories

1. **As a** billing user, **I want to** generate statements **so that** customers see accurate balances.
2. **As a** template developer, **I want to** use precomputed data **so that** the template stays simple.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must read parameters `intCustomer`, `strDate`, and `statementDate`.
2. The Suitelet must compute invoice balance forward from `customsearch_sna_balanceforward_srch_2`.
3. The Suitelet must compute payment balance forward from `customsearch_sna_balanceforward_srch_2_4`.
4. The Suitelet must return a payment list from `customsearch_sna_balanceforward_srch_2_5`.
5. The Suitelet must return aging buckets from `customsearch_sna_agingbalance`.
6. The Suitelet must return invoice details from `customsearch_sna_invoicetable_srch`.
7. The Suitelet must output FreeMarker assignments for use in a PDF/HTML template.

### Acceptance Criteria

- [ ] Returned FreeMarker assignments include balances, aging, payments, and invoices.
- [ ] Inputs filter data by customer and date range.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Render the statement PDF itself.
- Modify invoice or payment records.
- Validate customer eligibility for statements.

---

## 6. Design Considerations

### User Interface
- No UI; Suitelet is invoked by a template.

### User Experience
- Statement template consumes `arrPayments`, `arrInvoices`, and balance values.

### Design References
- Balance Forward statement PDF/HTML template.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customer
- transaction (invoices, payments)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Provide statement data
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None (uses search results only).

**Saved Searches:**
- customsearch_sna_balanceforward_srch_2
- customsearch_sna_balanceforward_srch_2_4
- customsearch_sna_balanceforward_srch_2_5
- customsearch_sna_agingbalance
- customsearch_sna_invoicetable_srch

### Integration Points
- Statement PDF/HTML template uses Suitelet output.

### Data Requirements

**Data Volume:**
- Customer-level invoice/payment history within date filters.

**Data Sources:**
- Transaction searches and aging balances.

**Data Retention:**
- No new records created.

### Technical Constraints
- Output must be valid FreeMarker assignments.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Statement template and search definitions

### Governance Considerations

- **Script governance:** Multiple saved searches executed per request.
- **Search governance:** Search filters are appended at runtime.
- **API limits:** Request should be limited to single customer.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Statements render with correct balances and detail lines.
- Suitelet responds without errors for valid inputs.

**How we'll measure:**
- Sample statement generation and reconciliation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_balanceforward.js | Suitelet | Provide balance forward data | Implemented |

### Development Approach

**Phase 1:** Confirm searches
- [ ] Validate saved searches and filters

**Phase 2:** Template validation
- [ ] Generate sample statements

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Generate statement data for a customer with invoices and payments.

**Edge Cases:**
1. Customer with no invoices returns empty arrays and zero balances.
2. Date filters limit results correctly.

**Error Handling:**
1. Missing parameters return empty FreeMarker assignments.

### Test Data Requirements
- Customer with invoice and payment activity
- Customer with no activity

### Sandbox Setup
- Deploy Suitelet and ensure searches exist

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing or statement generation roles

**Permissions required:**
- View access to customer and transaction data

### Data Security
- Output includes customer financial data; restrict access accordingly.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Saved searches verified
- [ ] Template points to Suitelet

### Deployment Steps

1. Deploy Suitelet.
2. Update template or process to call Suitelet.

### Post-Deployment

- [ ] Validate statement output

### Rollback Plan

**If deployment fails:**
1. Revert template to previous data source.
2. Disable Suitelet deployment.

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

- [ ] Should customer deposits be included in balance forward logic?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Saved search changes alter statement output | Med | High | Version control and review search updates |

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
