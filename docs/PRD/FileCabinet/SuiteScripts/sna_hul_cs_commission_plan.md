# PRD: Commission Plan Client Script

**PRD ID:** PRD-UNKNOWN-CommissionPlan
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_commission_plan.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that calculates commission metrics and payouts based on sales rep selection and commission plan inputs.

**What problem does it solve?**
It automates commission calculations using invoice payment history, revenue metrics, and a configurable reference table.

**Primary Goal:**
Compute commission totals and payout fields when key inputs change.

---

## 2. Goals

1. Populate total invoices paid for the selected sales rep.
2. Calculate retention, revenue eligible for commission, and payout values.
3. Write calculated metrics back to the commission plan record.

---

## 3. User Stories

1. **As a** finance user, **I want** commission metrics calculated automatically **so that** payouts are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. When `custrecord_sna_hul_sales_rep` changes, the system must calculate total invoices paid from customer invoices tied to the sales rep.
2. When base pay, total invoices paid, and prior year retention are populated, the system must compute:
   - Percent revenue renewed
   - VARSS payout percent and amount
   - Excess retention quota
   - Total revenue generated
   - Direct estimate sales
   - Revenue eligible for commission
   - VESS payout percent and amount
3. The system must read a seven-row reference table from custom fields to determine payout thresholds.
4. The system must update all calculated fields on the current record.

### Acceptance Criteria

- [ ] Calculated fields populate after selecting a sales rep and required inputs.
- [ ] Revenue eligible and payout fields update when base pay or prior year retention changes.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Persist calculations to other records or transactions.
- Validate the correctness of reference table data.

---

## 6. Design Considerations

### User Interface
- Calculations run as fields are edited on the commission plan record.

### User Experience
- Users see immediate updates to payout fields.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Commission Plan custom record (exact ID not specified)
- Transaction | Customer Invoice
- Customer

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Commission calculations

**Custom Fields:**
- `custrecord_sna_hul_sales_rep`
- `custrecord_sna_hul_total_invoices_paid`
- `custrecord_sna_hul_base_pay`
- `custrecord_sna_hul_py_total_ret_revenue`
- `custrecord_per_rev_renew`
- `custrecord_var_ret_scale_payout`
- `custrecord_sna_hul_amount_payout`
- `custrecord_sna_hul_excess_ret_quota`
- `custrecord_sna_hul_total_revenue_gen`
- `custrecord_sna_hul_direct_est_sales`
- `custrecord_sna_hul_amount_rev_commission`
- `custrecord_sna_hul_percent_payout_vess`
- `custrecord_sna_hul_percent_payout_ness`
- `custrecord_sna_hul_percent_rev_renewed_1` .. `custrecord_sna_hul_percent_rev_renewed_7`
- `custrecord_sna_hul_percent_payout_1` .. `custrecord_sna_hul_percent_payout_7`
- `custrecord_sna_hul_percent_rev_gen_1` .. `custrecord_sna_hul_percent_rev_gen_7`
- `custrecord_sna_hul_percent_payout_vess_1` .. `custrecord_sna_hul_percent_payout_vess_7`
- `custbody_sna_hul_override_salesrep_csm` (transaction body field used in search)
- `custcol_sna_sales_rep` (transaction line field used in search)
- `custentity_sna_hul_csm` (customer field used in search)

**Saved Searches:**
- None (searches created in script).

### Integration Points
- Uses transaction searches to calculate invoice payments and revenue totals.

### Data Requirements

**Data Volume:**
- Aggregated search results for invoices.

**Data Sources:**
- Customer invoices and customer fields.

**Data Retention:**
- Writes to the commission plan record only.

### Technical Constraints
- Calculations depend on reference table fields being complete.
- Potential out-of-range index when selecting VESS reference data if table values are missing.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Commission plan custom record fields and invoice data.

### Governance Considerations
- Client-side searches may impact page performance for large datasets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Commission plan records consistently calculate payout fields without manual intervention.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_commission_plan.js | Client Script | Calculate commission metrics and payouts | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Build invoice searches and base calculations.
- **Phase 2:** Add reference-table driven payouts.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select a sales rep and populate base pay and prior year retention.
2. Confirm calculated payout fields update.

**Edge Cases:**
1. Missing reference table rows.
2. Zero or null prior year retention value.

**Error Handling:**
1. Search returns no invoices; totals should be zero.

### Test Data Requirements
- At least one sales rep with customer invoices and payments.

### Sandbox Setup
- Commission plan custom record with required fields.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Finance users managing commission plans.

**Permissions required:**
- View transactions and customers.
- Edit commission plan records.

### Data Security
- Reads transaction data; no external data sharing.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Verify reference table fields exist on the commission plan form.

### Deployment Steps
1. Upload `sna_hul_cs_commission_plan.js`.
2. Deploy to the commission plan custom record form.

### Post-Deployment
- Validate calculations with known data sets.

### Rollback Plan
- Remove client script deployment from the commission plan form.

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
- [ ] Should the VESS payout logic handle missing reference rows more safely?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large invoice search slows client form | Med | Med | Consider server-side calculation |
| Reference table fields incomplete | Med | Med | Validate required fields on form |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
