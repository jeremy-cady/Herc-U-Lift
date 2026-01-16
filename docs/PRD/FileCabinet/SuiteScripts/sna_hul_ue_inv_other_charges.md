# PRD: Invoice Other Charges

**PRD ID:** PRD-UNKNOWN-InvOtherCharges
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_inv_other_charges.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that calculates and adds "Other Charges" (shop fee) lines to invoices based on service code type and revenue stream rules.

**What problem does it solve?**
Automates shop fee calculation and line insertion on invoices, including tax handling.

**Primary Goal:**
Add an Other Charge line for each service type/revenue stream grouping when misc fee is allowed.

---

## 2. Goals

1. Calculate shop fee amounts by service type and revenue stream.
2. Insert Other Charge lines with correct item, amount, and tax code.
3. Update tax processed flag when Avatax POS is detected.

---

## 3. User Stories

1. **As a** billing user, **I want to** auto-add shop fees **so that** invoices reflect required other charges.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeSubmit on invoice records.
2. The script must exit if `custbody_sna_misc_fee_allowed` is false or `custbody_sna_misc_fee_generated` is true.
3. The script must group invoice lines by `cseg_sna_revenue_st` and `custcol_sna_so_service_code_type` and sum amounts.
4. The script must look up shop fee configuration from `customrecord_sna_service_code_type`.
5. The script must insert an Other Charge item line with computed amount and tax code when applicable.
6. The script must update `custbody_sna_tax_processed` when Avatax POS tax code is detected.

### Acceptance Criteria

- [ ] Other Charge lines are inserted for eligible revenue stream/service type combinations.
- [ ] Shop fee amount respects min/max constraints.
- [ ] Tax code is set on new lines when applicable.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Process non-invoice records.
- Recalculate existing misc fee lines.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Other charges appear automatically on invoice save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice
- customrecord_sna_service_code_type

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Insert other charges
- [ ] Client Script - N/A

**Custom Fields:**
- invoice | custbody_sna_misc_fee_allowed | Misc fee allowed
- invoice | custbody_sna_misc_fee_generated | Misc fee generated
- invoice | custbody_sna_tax_processed | Tax processed
- invoice | custbody_sna_order_fulfillment_method | Fulfillment method
- invoice line | cseg_sna_revenue_st | Revenue stream
- invoice line | custcol_sna_so_service_code_type | Service code type
- invoice line | taxcode | Tax code
- invoice line | location | Location
- customrecord_sna_service_code_type | custrecord_sna_shop_fee_code_item | Other charge item
- customrecord_sna_service_code_type | custrecord_sna_shop_fee_percent | Shop fee percent
- customrecord_sna_service_code_type | custrecord_sna_min_shop_fee | Minimum shop fee
- customrecord_sna_service_code_type | custrecord_sna_max_shop_fee | Maximum shop fee

**Saved Searches:**
- None (uses ad-hoc searches).

### Integration Points
- Uses `./sna_hul_mod_sales_tax.js` for tax line updates.

### Data Requirements

**Data Volume:**
- One search per unique revenue stream/service type combination.

**Data Sources:**
- Invoice line data and service code configuration.

**Data Retention:**
- Inserts new invoice lines.

### Technical Constraints
- Misc fee logic only runs when allowed and not yet generated.

### Dependencies
- **Libraries needed:** `./sna_hul_mod_sales_tax.js`
- **External dependencies:** None
- **Other features:** Avatax tax handling

### Governance Considerations

- **Script governance:** Iterates invoice lines and inserts new lines.
- **Search governance:** Service code search per grouping.
- **API limits:** Moderate for invoices with many lines.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Shop fee lines are created with correct amounts and tax codes.

**How we'll measure:**
- Validate invoice line totals and fee amounts.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_inv_other_charges.js | User Event | Add other charges lines | Implemented |

### Development Approach

**Phase 1:** Grouping and calculation
- [ ] Validate grouping and shop fee calculation

**Phase 2:** Line insertion
- [ ] Validate other charge line insertion and tax code

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice with misc fee allowed inserts other charge line.

**Edge Cases:**
1. Misc fee generated flag prevents insertion.
2. Revenue stream/service type missing skips calculation.

**Error Handling:**
1. Service code lookup errors are logged.

### Test Data Requirements
- Invoice with service code types and revenue streams

### Sandbox Setup
- Deploy User Event on Invoice.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing roles

**Permissions required:**
- Edit invoices
- View service code configuration

### Data Security
- Invoice data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm service code configuration records exist

### Deployment Steps

1. Deploy User Event on Invoice.
2. Validate other charge line insertion.

### Post-Deployment

- [ ] Monitor logs for calculation errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Add other charge lines manually.

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

- [ ] Should other charge lines be re-evaluated on invoice edits?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect shop fee config leads to wrong charge amounts | Med | Med | Validate service code configuration |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
