# PRD: Tax Automation Map/Reduce

**PRD ID:** PRD-UNKNOWN-TaxAutomation
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_tax_automation.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that applies tax codes on transactions based on order fulfillment method.

**What problem does it solve?**
Automates tax code updates for transactions by applying POS or ship tax codes across header and lines.

**Primary Goal:**
Set shipping and line tax codes and mark transactions as tax-processed.

---

## 2. Goals

1. Load transactions from the bulk tax automation saved search.
2. Determine the correct tax code based on fulfillment method.
3. Update header and line tax fields and mark processed.

---

## 3. User Stories

1. **As a** tax admin, **I want** tax codes applied consistently **so that** transactions use correct tax settings.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load saved search `customsearch_sna_bulk_tax_automation`.
2. The script must read `custbody_sna_order_fulfillment_method` from each transaction.
3. The script must select a tax code based on parameters `custscript_sna_ofm_willcall`, `custscript_sna_ofm_ship`, `custscript_sna_tax_avataxpos`, and `custscript_sna_tax_avatax`.
4. The script must set `shippingtaxcode` and `custbody_sna_tax_processed` on the transaction.
5. The script must update each item line `taxcode` with the selected tax code.

### Acceptance Criteria

- [ ] Transactions are updated with the correct header and line tax codes.
- [ ] `custbody_sna_tax_processed` is set to true.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Recalculate taxes beyond setting tax codes.
- Update transactions outside the saved search scope.

---

## 6. Design Considerations

### User Interface
- None; backend tax processing.

### User Experience
- Tax codes are applied automatically without manual updates.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transactions (Sales Order or other transaction types returned by search)

**Script Types:**
- [x] Map/Reduce - Tax code updates
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_sna_order_fulfillment_method`
- Transaction | `custbody_sna_tax_processed`

**Saved Searches:**
- `customsearch_sna_bulk_tax_automation`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Processes search results grouped by internal ID.

**Data Sources:**
- Saved search results and transaction records.

**Data Retention:**
- No data retention beyond transaction updates.

### Technical Constraints
- Requires correct configuration of order fulfillment method values and tax codes.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Saved search configuration.

### Governance Considerations
- Updates each line in dynamic mode per transaction.

---

## 8. Success Metrics

- Transactions have correct tax codes and are marked processed.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_tax_automation.js | Map/Reduce | Apply tax codes by fulfillment method | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Identify transactions and determine tax code.
- **Phase 2:** Update header and line tax fields.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Transaction with will-call method gets POS tax code.
2. Transaction with ship method gets standard AvaTax code.

**Edge Cases:**
1. Missing fulfillment method results in no update.

**Error Handling:**
1. Invalid tax code values are logged.

### Test Data Requirements
- Transactions matching the saved search with differing fulfillment methods.

### Sandbox Setup
- Configure script parameters for fulfillment method and tax codes.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Tax admin or accounting roles.

**Permissions required:**
- Edit transactions and line tax codes.

### Data Security
- Standard transaction access controls.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Validate saved search `customsearch_sna_bulk_tax_automation`.

### Deployment Steps
1. Upload `sna_hul_mr_tax_automation.js`.
2. Deploy Map/Reduce with required parameters.

### Post-Deployment
- Review a sample transaction for tax code updates.

### Rollback Plan
- Disable the script deployment.

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
- [ ] Should tax updates run for transaction types beyond Sales Orders?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Misconfigured tax code parameters | Low | High | Validate parameters before scheduling |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
