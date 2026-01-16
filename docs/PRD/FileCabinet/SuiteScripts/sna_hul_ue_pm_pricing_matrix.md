# PRD: PM Pricing Matrix Update

**PRD ID:** PRD-UNKNOWN-PMPricingMatrix
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_pm_pricing_matrix.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event on Sales Orders that calculates planned maintenance rates using the PM pricing matrix and updates service line rates.

**What problem does it solve?**
Ensures planned maintenance charges are calculated consistently based on equipment, service action, zip, and pricing group rules.

**Primary Goal:**
Apply PM pricing matrix rates to Sales Order service lines on create/edit.

---

## 2. Goals

1. Calculate PM rates using sales zone, equipment type, and pricing group rules.
2. Update PM line quantities/rates for flat rate and non-flat rate scenarios.
3. Lock rates when PM pricing is applied.

---

## 3. User Stories

1. **As a** service billing user, **I want to** auto-calculate PM rates **so that** billing matches pricing rules.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit (non-closed statuses), the script must calculate PM rates and update line rates/amounts.
2. On afterSubmit (non-closed statuses), the script must zero out non-PM service lines and roll totals into PM line.
3. The script must use sales zone, equipment segment, service action, frequency, quantity, and pricing group rules to find PM rates.
4. The script must set `custcol_sna_hul_lock_rate` when a PM rate is applied.

### Acceptance Criteria

- [ ] PM service lines receive calculated rates based on pricing matrix rules.
- [ ] Non-PM service lines are zeroed and rolled into PM line as required.
- [ ] Rates are locked when PM pricing is applied.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Apply rates when order status is closed.
- Modify non-service line items.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- PM rates are applied automatically on Sales Order save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- customrecord_sna_hul_pmpricingrate
- customrecord_sna_sales_zone
- customrecord_cseg_sna_hul_eq_seg

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - PM rate calculation
- [ ] Client Script - N/A

**Custom Fields:**
- salesorder | cseg_sna_revenue_st | Revenue stream
- salesorder | custbody_sna_pm_added | PM added flag
- salesorder line | custcol_sna_hul_lock_rate | Lock rate flag
- salesorder line | custcol_sna_service_itemcode | Service action
- salesorder line | custcol_sna_hul_object_frequency | Frequency
- salesorder line | custcol_sna_hul_fleet_no | Object number
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmpricepmrate | PM rate
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmcustpricegroup | Customer pricing group
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmpricezip | Zip code
- customrecord_sna_hul_pmpricingrate | custrecord_sna_hul_pmpriceequiptype | Equipment type

**Saved Searches:**
- PM pricing searches built at runtime.

### Integration Points
- Uses sales zone and equipment segment lookups.

### Data Requirements

**Data Volume:**
- Multiple searches per Sales Order depending on lines.

**Data Sources:**
- Sales Order lines, sales zones, PM pricing records.

**Data Retention:**
- Updates Sales Order line rates and amounts.

### Technical Constraints
- Skips processing when order status is G or H.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Sales zone and PM pricing setup

### Governance Considerations

- **Script governance:** Multiple searches and line updates.
- **Search governance:** PM pricing searches per line.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PM rates are calculated and applied correctly on Sales Orders.

**How we'll measure:**
- Compare PM line rates to pricing matrix results.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_pm_pricing_matrix.js | User Event | Calculate and apply PM rates | Implemented |

### Development Approach

**Phase 1:** Rate calculation
- [ ] Validate PM pricing search filters

**Phase 2:** Line updates
- [ ] Validate PM line and service line updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales Order with PM lines applies correct PM rates.

**Edge Cases:**
1. Order status G/H skips updates.

**Error Handling:**
1. Search errors are logged.

### Test Data Requirements
- PM pricing matrix records and Sales Orders with service lines

### Sandbox Setup
- Deploy User Event on Sales Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and service billing roles

**Permissions required:**
- Edit Sales Orders
- View PM pricing and sales zone records

### Data Security
- Pricing data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm PM pricing matrix and sales zone records

### Deployment Steps

1. Deploy User Event on Sales Order.
2. Validate PM rate updates.

### Post-Deployment

- [ ] Monitor logs for pricing errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Adjust rates manually if needed.

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

- [ ] Should PM pricing be cached to reduce search load?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Pricing matrix gaps lead to zero rates | Med | Med | Validate PM pricing configuration |

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
