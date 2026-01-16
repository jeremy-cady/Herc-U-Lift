# PRD: Balance Forward Consolidated Statement Data

**PRD ID:** PRD-UNKNOWN-BalanceForwardConsolidated
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_balanceforward_consolidated.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that returns FreeMarker assignments for consolidated customer statements across child customers.

**What problem does it solve?**
Generates consolidated statement data without embedding search logic in the template.

**Primary Goal:**
Provide balances, aging, and transaction lists for consolidated statements by parent customer.

---

## 2. Goals

1. Compute balance forward totals for consolidated customers.
2. Provide aging buckets for consolidated balances.
3. Return invoice and payment lists for the consolidated statement template.

---

## 3. User Stories

1. **As a** billing user, **I want to** generate consolidated statements **so that** parent customers see total exposure.
2. **As a** template developer, **I want to** use Suitelet data **so that** the template remains simple.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must read parameters `intCustomer`, `strDate`, and `statementDate`.
2. The Suitelet must look up the customer name for consolidated filtering.
3. The Suitelet must compute invoice and payment balance forward using consolidated saved searches.
4. The Suitelet must return payment and invoice lists based on consolidated filters.
5. The Suitelet must return aging buckets for consolidated balances.
6. The Suitelet must output FreeMarker assignments for use in a PDF/HTML template.

### Acceptance Criteria

- [ ] Output includes balances, aging, and lists for consolidated data.
- [ ] Filters use parent customer identification correctly.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Render the statement PDF itself.
- Update customer or transaction records.
- Validate consolidation rules beyond the saved search logic.

---

## 6. Design Considerations

### User Interface
- No UI; Suitelet is invoked by a template.

### User Experience
- Statement template consumes the Suitelet assignments.

### Design References
- Consolidated statement PDF/HTML template.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customer
- transaction (invoices, payments)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Provide consolidated statement data
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None (uses search results only).

**Saved Searches:**
- customsearch_sna_balanceforward_srch__11
- customsearch_sna_balanceforward_srch__12
- customsearch_sna_balanceforward_srch__10
- customsearch_sna_agingbalance_4
- customsearch_sna_invoicetable_srch_2

### Integration Points
- Consolidated statement PDF/HTML template.

### Data Requirements

**Data Volume:**
- Consolidated transaction history for a customer group.

**Data Sources:**
- Customer lookup
- Saved searches for invoices and payments

**Data Retention:**
- No new records created.

### Technical Constraints
- Consolidation depends on formula filters using parent customer name.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Statement template and search definitions

### Governance Considerations

- **Script governance:** Multiple searches per request.
- **Search governance:** Runtime formula filters on parent name.
- **API limits:** Limited to one customer per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Consolidated statements render with correct balances and details.
- Suitelet responds without errors for valid inputs.

**How we'll measure:**
- Sample consolidated statements and reconciliation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_balanceforward_consolidated.js | Suitelet | Provide consolidated statement data | Implemented |

### Development Approach

**Phase 1:** Confirm consolidated searches
- [ ] Validate saved searches and formula filters

**Phase 2:** Template validation
- [ ] Generate sample consolidated statements

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Generate consolidated statement data for a parent customer with child activity.

**Edge Cases:**
1. Parent customer has no child transactions; returns empty lists.
2. Date filters limit results correctly.

**Error Handling:**
1. Missing parameters result in no data output.

### Test Data Requirements
- Parent customer with child customers and transactions

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
- Consolidated data is sensitive; restrict Suitelet access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Saved searches verified
- [ ] Template points to Suitelet

### Deployment Steps

1. Deploy Suitelet.
2. Update consolidated template to call Suitelet.

### Post-Deployment

- [ ] Validate consolidated statements

### Rollback Plan

**If deployment fails:**
1. Revert template to previous source.
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

- [ ] Should consolidation be based on internal ID rather than name?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Parent name changes may break filters | Med | Med | Use internal ID-based filters if possible |

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
