# PRD: Set Tax Non-Taxable

**PRD ID:** PRD-UNKNOWN-SetTaxNonTaxable
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_set_tax_nontaxable.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that updates invoice or credit memo tax codes based on revenue stream and internal tax logic.

**What problem does it solve?**
Ensures lines are set to Not Taxable for internal revenue streams and correct tax calculation behavior.

**Primary Goal:**
Update tax codes and tax calculation flags for invoices or credit memos.

---

## 2. Goals

1. Load the transaction and update line tax codes based on revenue stream.
2. Disable AvaTax calculation for internal revenue streams.
3. Reapply credit memo lines after tax updates when necessary.

---

## 3. User Stories

1. **As a** finance user, **I want to** set internal lines to non-taxable **so that** tax is calculated correctly.
2. **As an** admin, **I want to** trigger tax updates via a Suitelet **so that** UE logic is invoked.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `custparam_recordId` and `custparam_recordType`.
2. The Suitelet must load the transaction and call `mod_tax.updateLines`.
3. For internal revenue streams, the Suitelet must set `taxcode` to Not Taxable and `custcol_ava_taxamount` to 0.
4. For external revenue streams on invoices, the Suitelet must set `taxcode` to AvaTax.
5. For credit memos, the Suitelet must unapply and reapply applied documents when internal logic is used.
6. The Suitelet must save the transaction and redirect back to the record.

### Acceptance Criteria

- [ ] Internal lines are set to Not Taxable and tax amounts reset.
- [ ] External lines retain AvaTax tax code where applicable.
- [ ] Credit memo applications are restored after update.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace AvaTax configuration.
- Validate tax codes beyond set values.
- Run without explicit record parameters.

---

## 6. Design Considerations

### User Interface
- No UI; Suitelet updates record and redirects.

### User Experience
- Single action to update tax logic.

### Design References
- Module `sna_hul_mod_sales_tax.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice
- creditmemo

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Tax update trigger
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Transaction | custbody_ava_disable_tax_calculation | AvaTax disable flag
- Transaction Line | cseg_sna_revenue_st | Revenue stream
- Transaction Line | custcol_ava_taxamount | AvaTax tax amount

**Saved Searches:**
- None.

### Integration Points
- Uses `./sna_hul_mod_sales_tax.js` to update lines.

### Data Requirements

**Data Volume:**
- Single transaction per request.

**Data Sources:**
- Transaction lines and revenue stream values

**Data Retention:**
- Updates transaction line tax fields.

### Technical Constraints
- Requires revenue stream text to detect 'Internal' or 'External'.

### Dependencies
- **Libraries needed:** ./sna_hul_mod_sales_tax.js
- **External dependencies:** AvaTax configuration
- **Other features:** Revenue stream configuration

### Governance Considerations

- **Script governance:** Record load/save and line updates.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Tax codes reflect internal or external revenue streams.
- Transactions save without errors.

**How we'll measure:**
- Review updated invoice and credit memo tax fields.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_set_tax_nontaxable.js | Suitelet | Update tax codes for internal revenue | Implemented |

### Development Approach

**Phase 1:** Tax logic validation
- [ ] Confirm mod_tax.updateLines behavior

**Phase 2:** Transaction validation
- [ ] Test on invoices and credit memos

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Internal lines set to Not Taxable on invoice.
2. External lines keep AvaTax tax code.

**Edge Cases:**
1. Credit memo with applied docs re-applies after update.

**Error Handling:**
1. Missing record ID redirects back without changes.

### Test Data Requirements
- Invoice with Internal and External revenue stream lines
- Credit memo with applied transactions

### Sandbox Setup
- Deploy Suitelet and mod_sales_tax library

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance or admin roles

**Permissions required:**
- Edit access to invoices and credit memos

### Data Security
- Tax data should be limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Validate AvaTax settings

### Deployment Steps

1. Deploy Suitelet.
2. Add link/button on transactions.

### Post-Deployment

- [ ] Verify tax updates

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert tax logic to prior process.

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

- [ ] Should internal detection use a field ID instead of text match?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Revenue stream text changes break detection | Med | Med | Use an internal flag field instead of text match |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- AvaTax integration docs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
