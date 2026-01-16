# PRD: Item Fulfillment and Invoice Controls

**PRD ID:** PRD-UNKNOWN-ItemFulfillment
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_itemfulfillment.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that enforces rental configuration rules, adjusts shipping/handling costs, and updates object statuses based on invoice fulfillment.

**What problem does it solve?**
Prevents fulfillment/invoicing when rental configuration is incomplete and ensures shipping/handling and rental billing logic are applied consistently.

**Primary Goal:**
Validate fulfillment/invoice conditions and apply shipping, handling, rental billing, and object status updates.

---

## 2. Goals

1. Enforce rental configuration completion before fulfillment/invoicing.
2. Apply shipping and handling cost rules on item fulfillments.
3. Adjust invoice line quantities and rates based on rental billing logic.
4. Update object status when new/used equipment is invoiced.

---

## 3. User Stories

1. **As a** fulfillment user, **I want to** block fulfillment when rentals are not configured **so that** incomplete orders are not shipped.
2. **As a** billing user, **I want to** calculate rental invoice quantities accurately **so that** charges match usage.

---

## 4. Functional Requirements

### Core Functionality

1. On Item Fulfillment create/edit, the script must set shipping and handling costs based on script parameters.
2. On Item Fulfillment view, the script must remove the Invoice button if the Sales Order has unconfigured or dummy lines.
3. On Invoice create from Sales Order, the script must remove non-billable lines and adjust quantities for returned items.
4. The script must recalculate rental line quantities/rates based on billing schedules and previously billed amounts.
5. On Invoice afterSubmit, the script must update object status for new/used equipment lines.

### Acceptance Criteria

- [ ] Item Fulfillments use configured shipping and handling costs.
- [ ] Invoice creation is blocked when Sales Order configuration is incomplete.
- [ ] Rental invoice quantities are adjusted based on billing schedules.
- [ ] Object records update to sold status on invoicing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create invoices directly.
- Modify Sales Orders beyond validation checks.

---

## 6. Design Considerations

### User Interface
- Removes the Invoice button on Item Fulfillment view when configuration is incomplete.

### User Experience
- Prevents billing/fulfillment for incomplete rental configurations.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- itemfulfillment
- invoice
- salesorder
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Fulfillment/invoice validation
- [ ] Client Script - N/A

**Custom Fields:**
- itemfulfillment | shippingcost | Shipping cost
- itemfulfillment | handlingcost | Handling cost
- invoice line | custcol_sna_qty_returned | Returned qty
- invoice line | custcol_sna_hul_object_configurator | Config JSON
- invoice line | custcol_sna_hul_object_configurator_2 | Config JSON
- invoice line | custcol_sna_hul_dummy | Dummy flag
- invoice line | custcol_sna_hul_bill_date | Bill date
- invoice line | custcol_sn_hul_billingsched | Billing schedule JSON
- invoice line | custcol_sna_hul_fleet_no | Fleet object
- invoice line | custcol_sna_hul_rent_contractidd | Contract ID
- invoice | custbody_sn_hul_allow_prebilling | Allow prebilling
- salesorder line | custcol_sna_hul_fleet_no | Fleet object
- salesorder line | custcol_sna_hul_rent_contractidd | Contract ID
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_status | Object status

**Saved Searches:**
- Searches for configuration status and billed totals.

### Integration Points
- Uses `SuiteScripts/moment.js` for date calculations.

### Data Requirements

**Data Volume:**
- Multiple searches and line updates per invoice/fulfillment.

**Data Sources:**
- Sales Orders, Invoices, Return Authorizations.

**Data Retention:**
- Updates invoice lines and object records.

### Technical Constraints
- Uses script parameters for rates, item groups, and status IDs.

### Dependencies
- **Libraries needed:** `SuiteScripts/moment.js`
- **External dependencies:** None
- **Other features:** Rental billing schedules

### Governance Considerations

- **Script governance:** Heavy on invoices with many lines.
- **Search governance:** Multiple searches for billing and configuration.
- **API limits:** High in complex invoices.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Fulfillment/invoice actions are blocked for incomplete configurations and rental charges are correct.

**How we'll measure:**
- Review invoice outputs and object status updates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_itemfulfillment.js | User Event | Enforce fulfillment and invoice rules | Implemented |

### Development Approach

**Phase 1:** Fulfillment controls
- [ ] Validate button removal and shipping/handling adjustments

**Phase 2:** Invoice adjustments
- [ ] Validate rental line adjustments and object updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Fulfillment with configured rentals allows invoicing.
2. Invoice creation adjusts quantities for returned items.

**Edge Cases:**
1. Dummy object lines block fulfillment/invoicing.
2. Billing schedules exclude future dates when prebilling is off.

**Error Handling:**
1. Search errors are logged without blocking saves.

### Test Data Requirements
- Rental Sales Order with billing schedules and return activity

### Sandbox Setup
- Deploy User Event on Item Fulfillment and Invoice as configured.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Fulfillment and billing roles

**Permissions required:**
- Edit invoices and item fulfillments
- Edit object records

### Data Security
- Rental and pricing data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure script parameters for shipping/handling and rental items

### Deployment Steps

1. Deploy User Event on Item Fulfillment and Invoice.
2. Validate fulfillment and billing behavior.

### Post-Deployment

- [ ] Monitor logs for billing calculation errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Use manual adjustments for affected invoices.

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

- [ ] Should rental billing calculations be refactored into shared utilities?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Complex billing logic produces unexpected rates | Med | High | Validate billing outputs on sample orders |

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
