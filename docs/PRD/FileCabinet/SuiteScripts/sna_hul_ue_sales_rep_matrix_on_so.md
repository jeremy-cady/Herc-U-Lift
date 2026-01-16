# PRD: Sales Rep Matrix on Sales Orders

**PRD ID:** PRD-UNKNOWN-SalesRepMatrixOnSO
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_sales_rep_matrix_on_so.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that assigns sales reps and commission data to sales order lines based on matrix mappings.

**What problem does it solve?**
Ensures sales reps and commission plans are applied consistently by customer, location, equipment category, revenue stream, and manufacturer.

**Primary Goal:**
Populate sales order line sales rep and commission fields using matrix rules.

---

## 2. Goals

1. Determine the correct sales rep mapping for each sales order line.
2. Apply commission plan, rate, and type to eligible lines.
3. Respect override and eligibility flags in the mapping logic.

---

## 3. User Stories

1. **As a** sales admin, **I want to** auto-assign sales reps and commission plans **so that** commissions are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On sales order create/edit/copy, the script must load customer matrix mappings.
2. The script must evaluate ship-to location (state/county/zip), revenue streams, and equipment categories to find a matching mapping.
3. The script must load item details to determine equipment and revenue segments and eligibility for commission.
4. For matching lines, the script must set sales rep, matrix reference, commission plan, and commission fields.
5. The script must respect override flags that bypass matrix matching.

### Acceptance Criteria

- [ ] Sales order lines receive the correct sales rep from the mapping.
- [ ] Commission fields populate for eligible lines.
- [ ] Overrides skip automatic assignment.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Calculate or post commission transactions.
- Update sales rep assignments on other transaction types.

---

## 6. Design Considerations

### User Interface
- No direct UI changes.

### User Experience
- Sales reps and commissions appear automatically on line items.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- customrecord_sna_salesrep_matrix_mapping
- customrecord_cseg_sna_revenue_st
- customrecord_cseg_sna_hul_eq_seg
- item

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Sales rep assignment
- [ ] Client Script - N/A

**Custom Fields:**
- salesorder | custcol_sna_sales_rep | Sales rep
- salesorder | custcol_sna_sales_rep_matrix | Matrix reference
- salesorder | custcol_sna_commission_plan | Commission plan
- salesorder | custcol_sna_commission_amount | Commission amount
- salesorder | custcol_sna_hul_comm_rate | Commission rate
- salesorder | custcol_sna_hul_sales_rep_comm_type | Commission type
- salesorder | custcol_sna_hul_eligible_for_comm | Eligible for commission
- salesorder | custcol_sna_override_commission | Override commission
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_customer | Customer
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_state | State
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_county | County
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_zipcode | Zip code
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_equipment | Equipment category
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_rev_stream | Revenue stream
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_manufacturer | Manufacturer
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_sales_reps | Sales reps
- customrecord_sna_salesrep_matrix_mapping | custrecord_sna_hul_sales_rep_comm_plan_2 | Commission plan

**Saved Searches:**
- Item search for line segment and eligibility data.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Loads all line items and matrix mappings per sales order.

**Data Sources:**
- Sales order line items and matrix mapping records.

**Data Retention:**
- Updates line-level commission fields.

### Technical Constraints
- Matching relies on zip code and segment hierarchy logic.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Matrix mapping configuration records

### Governance Considerations

- **Script governance:** Multiple searches for mappings and item details.
- **Search governance:** Line item and matrix searches per order.
- **API limits:** Moderate for large orders.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales rep and commission fields are applied consistently across orders.

**How we'll measure:**
- Spot-check orders across different regions and equipment categories.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_sales_rep_matrix_on_so.js | User Event | Apply sales rep matrix on sales orders | Implemented |

### Development Approach

**Phase 1:** Matrix matching logic
- [ ] Validate location and segment matching

**Phase 2:** Line updates
- [ ] Validate commission field updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create sales order that matches a matrix record and verify line assignments.

**Edge Cases:**
1. No matching matrix records should leave lines unchanged.

**Error Handling:**
1. Missing item segment data should be handled without script failure.

### Test Data Requirements
- Matrix mappings for a test customer.
- Sales order with multiple item segments.

### Sandbox Setup
- Deploy User Event on sales order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales operations

**Permissions required:**
- Edit sales orders
- View matrix mappings

### Data Security
- Commission data limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm matrix mappings are active and complete

### Deployment Steps

1. Deploy User Event on sales order.
2. Validate assignment results on sample orders.

### Post-Deployment

- [ ] Monitor logs for unmatched mapping conditions

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Assign sales reps manually.

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

- [ ] How should conflicting matrix matches be prioritized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect mapping due to incomplete zip data | Med | Med | Validate customer address data |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.
