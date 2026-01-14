# PRD: Sales Rep Matrix on Sales Order Client Script

**PRD ID:** PRD-UNKNOWN-SalesRepMatrixOnSO
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_sales_rep_matrix_on_so.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that assigns sales reps and commission data on Sales Order lines based on a customer sales rep matrix.

**What problem does it solve?**
It automates sales rep assignment and commission calculations using customer mapping rules and item attributes.

**Primary Goal:**
Populate line-level sales rep and commission fields when items are selected.

---

## 2. Goals

1. Load sales rep matrix mappings for the selected customer.
2. Match items to mapping rules using zip, equipment category, revenue stream, and manufacturer.
3. Set sales rep, commission plan, and commission amount on the line.

---

## 3. User Stories

1. **As a** sales user, **I want** sales reps auto-assigned **so that** commission tracking is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On page init (edit mode), the script must load customer sales rep matrix records.
2. When the customer changes, the script must reload the matrix and determine the ship-to zip code.
3. When an item is sourced on the item sublist, the script must look up item attributes (equipment segment, revenue stream, manufacturer, commission eligibility).
4. The script must match mapping rules by zip, equipment category, and revenue stream, and optionally manufacturer.
5. The script must set line fields for sales rep, sales rep matrix record, commission plan, commission rate, commission type, eligibility, and commission amount.
6. Commission amount must be calculated as gross margin or revenue based on commission type.

### Acceptance Criteria

- [ ] Sales rep and commission fields populate when item is selected.
- [ ] Commission amount matches the configured commission type and rate.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify sales rep mapping records.
- Recalculate commission on rate change (code is present but commented).

---

## 6. Design Considerations

### User Interface
- Line fields populate automatically.

### User Experience
- Users see sales rep and commission values without manual entry.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Custom Record | `customrecord_sna_salesrep_matrix_mapping`
- Item
- Customer
- Employee

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Sales rep assignment

**Custom Fields:**
- Line | `custcol_sna_sales_rep`
- Line | `custcol_sna_sales_rep_matrix`
- Line | `custcol_sna_hul_eligible_for_comm`
- Line | `custcol_sna_hul_comm_rate`
- Line | `custcol_sna_hul_sales_rep_comm_type`
- Line | `custcol_sna_commission_plan`
- Line | `custcol_sna_commission_amount`
- Item | `cseg_sna_hul_eq_seg`
- Item | `cseg_sna_revenue_st`
- Item | `cseg_hul_mfg`
- Item | `custitem_sna_hul_eligible_for_comm`
- Customer Mapping | `custrecord_salesrep_mapping_customer`
- Customer Mapping | `custrecord_salesrep_mapping_state`
- Customer Mapping | `custrecord_salesrep_mapping_county`
- Customer Mapping | `custrecord_salesrep_mapping_zipcode`
- Customer Mapping | `custrecord_salesrep_mapping_equipment`
- Customer Mapping | `custrecord_salesrep_mapping_rev_stream`
- Customer Mapping | `custrecord_salesrep_mapping_manufacturer`
- Customer Mapping | `custrecord_salesrep_mapping_sales_reps`
- Customer Mapping | `custrecord_salesrep_mapping_override`
- Customer Mapping | `custrecord_sna_hul_sales_rep_comm_plan_2`

**Saved Searches:**
- None.

### Integration Points
- Uses employee search to pick the assigned sales rep based on a custom sort field.

### Data Requirements

**Data Volume:**
- One matrix search per customer and lookup per line item.

**Data Sources:**
- Customer mapping records, item attributes, and customer address.

**Data Retention:**
- Updates Sales Order line fields only.

### Technical Constraints
- Zip code matching relies on ship address internal ID.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Sales rep matrix mapping custom records.

### Governance Considerations
- Client-side searches and line updates.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales rep and commission fields are populated correctly on Sales Order lines.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_sales_rep_matrix_on_so.js | Client Script | Assign sales reps and commission on SO lines | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load matrix and item attributes.
- **Phase 2:** Assign sales rep and compute commission.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add an item line and verify sales rep and commission values populate.

**Edge Cases:**
1. No mapping found; no updates applied.
2. Manufacturer not specified; use zip/equipment/revenue match only.

**Error Handling:**
1. Missing ship address ID should not crash the script.

### Test Data Requirements
- Customer mapping records with zip and equipment criteria.

### Sandbox Setup
- Deploy client script to Sales Order form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- View sales rep mapping and item records.

### Data Security
- Uses internal sales data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm mapping records and commission plan fields.

### Deployment Steps
1. Upload `sna_hul_cs_sales_rep_matrix_on_so.js`.
2. Deploy to Sales Order form.

### Post-Deployment
- Validate sales rep and commission population.

### Rollback Plan
- Remove client script deployment from Sales Order form.

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
- [ ] Should mapping consider county or state fields (currently not used in matching)?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| No match due to zip formatting | Med | Low | Normalize zip codes for comparisons |

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
