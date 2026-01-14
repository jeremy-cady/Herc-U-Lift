# PRD: SpeeDee Shipping Cost Client Script

**PRD ID:** PRD-UNKNOWN-CalcShippingCostCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_calcshippingcost.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that manages SpeeDee shipping workflows, including parcel field enablement and shipping cost calculations for sales orders and item fulfillments.

**What problem does it solve?**
Enables users to calculate SpeeDee shipping costs and manage parcel details directly on the transaction form.

**Primary Goal:**
Calculate and populate shipping costs and parcel data for SpeeDee shipments.

---

## 2. Goals

1. Enable or disable parcel fields based on the selected shipping method.
2. Calculate shipping costs using the SpeeDee/EasyPost API.
3. Prevent saving item fulfillments without a SpeeDee order ID when required.

---

## 3. User Stories

1. **As a** shipping user, **I want** parcel fields enabled only for SpeeDee **so that** I only enter needed data.
2. **As a** dispatcher, **I want** shipping costs calculated automatically **so that** rates are accurate.
3. **As an** admin, **I want** validation on save **so that** SpeeDee shipments are complete.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read the SpeeDee shipping method script parameter `custscript_param_speedeeshipmethod`.
2. On `pageInit` and `fieldChanged`, the system must enable parcel fields only when the ship method is SpeeDee.
3. On `saveRecord` for item fulfillments with carrier `nonups`, the system must require `custbody_sna_speedeeorderid`.
4. The system must calculate shipping cost using:
   - NetSuite Shipping.calculateRates for non-SpeeDee methods.
   - EasyPost API calls for SpeeDee methods.
5. The system must update `shippingcost` and SpeeDee order fields based on API responses.
6. The system must write SpeeDee order payload and response to:
   - `custbody_sna_speedeeorderdetails`
   - `custbody_sna_speedeeorderreturn`
   - `custbody_sna_speedeeorderid`
   - `custbody_sna_speedeeorderbought`
7. The system must support printing parcel labels by reading `custbody_sna_parceljson` and opening label URLs.

### Acceptance Criteria

- [ ] Parcel fields are disabled when shipping method is not SpeeDee.
- [ ] SpeeDee shipping cost is calculated and written to `shippingcost`.
- [ ] Save is blocked if SpeeDee order ID is missing on item fulfillment.
- [ ] Parcel label URLs open when available.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Perform server-side shipping calculations.
- Validate address eligibility beyond API responses.
- Handle non-SpeeDee carriers beyond calling Shipping.calculateRates.

---

## 6. Design Considerations

### User Interface
- Client-side enable/disable of parcel sublist columns.

### User Experience
- Users calculate rates and print labels without leaving the record.

### Design References
- SpeeDee/EasyPost API workflow.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Item Fulfillment
- Customer
- Location

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Shipping UI and API integration

**Custom Fields:**
- Transaction | `custbody_sna_speedeeorderdetails`
- Transaction | `custbody_sna_speedeeorderreturn`
- Transaction | `custbody_sna_speedeeorderid`
- Transaction | `custbody_sna_speedeeorderbought`
- Transaction | `custbody_sna_parceljson`

**Saved Searches:**
- None.

### Integration Points
- EasyPost API (`https://www.easypost.com/api/v2`).

### Data Requirements

**Data Volume:**
- Per rate calculation or parcel label request.

**Data Sources:**
- Customer address, location address, item weights, parcel sublist.

**Data Retention:**
- SpeeDee payload and response stored in transaction fields.

### Technical Constraints
- Uses client-side HTTPS calls.
- Parcel field enablement depends on custom sublist `custpage_sublist_parcel`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** EasyPost/SpeeDee API.
- **Other features:** Shipping.calculateRates for non-SpeeDee methods.

### Governance Considerations
- Client-side API calls can affect UI responsiveness.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Shipping rates and parcel fields behave correctly for SpeeDee shipments.

**How we'll measure:**
- Verify calculated costs and label links on test transactions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_calcshippingcost.js | Client Script | SpeeDee shipping calculation and parcel control | Implemented |

### Development Approach

**Phase 1:** UI enablement
- [x] Enable/disable parcel fields based on ship method.

**Phase 2:** Rate calculation
- [x] Call EasyPost for SpeeDee and update shipping fields.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales order with SpeeDee ship method calculates rates.
2. Item fulfillment calculates SpeeDee order and updates parcel lines.

**Edge Cases:**
1. SpeeDee API error returns; shipping cost set to 0 and alert shown.
2. Missing customer or location address.

**Error Handling:**
1. Save record blocked when order ID missing and carrier is nonups.

### Test Data Requirements
- Customers and locations with valid addresses.
- Items with weights and units.

### Sandbox Setup
- Client script deployed on sales order and item fulfillment forms.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users entering shipping transactions.

**Permissions required:**
- Access to sales orders and fulfillments.

### Data Security
- API token used client-side; ensure deployment is controlled.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sna_hul_cs_calcshippingcost.js`.
2. Deploy to sales order and item fulfillment forms.
3. Configure SpeeDee shipping method parameter.

### Post-Deployment

- [ ] Verify shipping calculation and parcel field behavior.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from affected forms.

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

- [ ] Should SpeeDee API calls move server-side to protect tokens?
- [ ] Should shipping cost be recalculated on item changes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Client-side API token exposure | Med | High | Move API calls to Suitelet or RESTlet |
| Large parcel lists slow UI | Med | Med | Optimize parcel iteration |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/https and N/search modules

### External Resources
- EasyPost API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
