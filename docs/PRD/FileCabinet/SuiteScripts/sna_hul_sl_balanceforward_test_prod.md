# PRD: Balance Forward Test Prod

**PRD ID:** PRD-UNKNOWN-BalanceForwardTestProd
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_balanceforward_test_prod.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that returns FreeMarker assignments for balance forward statement data in a test/prod context.

**What problem does it solve?**
Provides statement templates with balances, aging, invoice details, and payment details without embedding search logic in the template.

**Primary Goal:**
Return balance forward data for a single customer within a date range.

---

## 2. Goals

1. Calculate invoice and payment balance forward values.
2. Provide aging bucket amounts for the customer.
3. Return detailed payment and invoice lists for template rendering.

---

## 3. User Stories

1. **As a** billing user, **I want to** generate accurate statements **so that** customer balances are correct.
2. **As a** template developer, **I want to** consume precomputed data **so that** the template remains simple.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `intCustomer`, `strDate`, and `statementDate` request parameters.
2. The Suitelet must compute invoice balance forward using `customsearch_sna_balanceforward_srch_2`.
3. The Suitelet must compute payment balance forward using `customsearch_sna_balanceforward_srch_2_4`.
4. The Suitelet must return payments from `customsearch_sna_balanceforward_srch_2_5`.
5. The Suitelet must return aging buckets from `customsearch_sna_agingbalance_3_2`.
6. The Suitelet must return invoices from `customsearch_sna_invoicetable_srch`.
7. The Suitelet must output FreeMarker assignments for use in a PDF/HTML template.

### Acceptance Criteria

- [ ] Returned assignments include balance forward totals, aging buckets, and arrays for payments/invoices.
- [ ] Searches are filtered by customer and date parameters.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Render the statement PDF.
- Update transaction records.
- Validate parameter values beyond search filters.

---

## 6. Design Considerations

### User Interface
- No UI; Suitelet is called by templates or scripts.

### User Experience
- Outputs FreeMarker assignment strings for template usage.

### Design References
- Balance forward statement template.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customer
- transaction (invoice, payment)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Provide statement data
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None (uses saved search results).

**Saved Searches:**
- customsearch_sna_balanceforward_srch_2
- customsearch_sna_balanceforward_srch_2_4
- customsearch_sna_balanceforward_srch_2_5
- customsearch_sna_agingbalance_3_2
- customsearch_sna_invoicetable_srch

### Integration Points
- Statement PDF/HTML template uses Suitelet output.

### Data Requirements

**Data Volume:**
- Customer-level transactions within date filters.

**Data Sources:**
- Saved searches and transaction data.

**Data Retention:**
- No new records created.

### Technical Constraints
- Output must be valid FreeMarker assignments.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Statement template and search definitions

### Governance Considerations

- **Script governance:** Multiple searches per request.
- **Search governance:** Search filters appended at runtime.
- **API limits:** Limited to single customer per call.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Statements render with correct balances and detail lines.
- Suitelet returns data without errors for valid inputs.

**How we'll measure:**
- Sample statement generation and reconciliation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_balanceforward_test_prod.js | Suitelet | Provide balance forward data | Implemented |

### Development Approach

**Phase 1:** Validate searches
- [ ] Confirm saved searches exist and return expected data

**Phase 2:** Validate template output
- [ ] Generate sample statements

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Customer with invoices and payments returns populated arrays.

**Edge Cases:**
1. Customer with no activity returns empty arrays and zero balances.
2. Date filters constrain results correctly.

**Error Handling:**
1. Missing parameters return empty FreeMarker assignments.

### Test Data Requirements
- Customer with invoice and payment activity
- Customer with no activity

### Sandbox Setup
- Deploy Suitelet and verify searches

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing or statement generation roles

**Permissions required:**
- View access to customer and transaction data

### Data Security
- Output contains customer financial data; restrict access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Verify saved searches
- [ ] Confirm template caller uses Suitelet

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

- [ ] Should customer deposits be included in the balance forward logic?

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
