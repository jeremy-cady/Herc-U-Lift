# PRD: Sales Order Consolidate Client Script

**PRD ID:** PRD-UNKNOWN-SalesOrderConsolidate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_sales_order_consolidate.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A consolidated client script that provides Sales Order and Item Fulfillment validations and shipping-related actions, including Spee-Dee rate calculation and parcel printing.

**What problem does it solve?**
It centralizes client-side checks for PO-required customers, shipping validations, and parcel label workflow.

**Primary Goal:**
Validate PO requirements and support Spee-Dee shipping cost and parcel print workflows.

**Notes:**
Header comments indicate this script is deprecated by another script.

---

## 2. Goals

1. Enforce PO-required validation on sales orders and invoices.
2. Calculate Spee-Dee shipping rates when requested.
3. Support parcel printing actions and warranty printing helpers.

---

## 3. User Stories

1. **As a** sales user, **I want** PO-required validation **so that** orders are not saved without required PO numbers.
2. **As a** shipping user, **I want** Spee-Dee shipping rates calculated **so that** shipping costs are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The script must calculate Spee-Dee rates using customer and location address details and item weights.
2. The script must block Item Fulfillment save if Spee-Dee shipping is used and rate is not calculated (based on script parameters).
3. The script must check customer `custentity_sna_hul_po_required` and enforce `otherrefnum` when required.
4. The script must expose client actions to calculate shipping cost, print parcels, and print warranty documents.

### Acceptance Criteria

- [ ] PO-required customers cannot save without a PO number.
- [ ] Spee-Dee shipping requires rate calculation before saving fulfillment.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace server-side shipping calculations.
- Provide full shipping label rendering in the client.

---

## 6. Design Considerations

### User Interface
- Uses dialog alerts for missing required data.

### User Experience
- Warns users before saving when required shipping data is missing.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Invoice
- Item Fulfillment
- Customer
- Item
- Location

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Shipping and PO validation

**Custom Fields:**
- Header | `custentity_sna_hul_po_required`
- Header | `otherrefnum`
- Header | `custbody_sna_speedeeorderid`
- Header | `shipcarrier`
- Header | `shipmethod`
- Header | `shipaddresslist`
- Header | `location`
- Item | `weight`
- Item | `weightunit`

**Saved Searches:**
- None.

### Integration Points
- Spee-Dee rate calculation via external API (EasyPost endpoint).

### Data Requirements

**Data Volume:**
- Iterates over item lines to compute weight totals.

**Data Sources:**
- Customer and location address data, item weights, shipping parameters.

**Data Retention:**
- Updates shipping cost on the transaction.

### Technical Constraints
- Uses external API calls and requires valid tokens and carrier account parameters.

### Dependencies
- **Libraries needed:** N/runtime, N/search, N/url, N/ui/message, N/ui/dialog, N/https.
- **External dependencies:** EasyPost API for Spee-Dee rates.
- **Other features:** Script parameters for shipping methods and tokens.

### Governance Considerations
- Client-side external HTTP calls can be slow or fail.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Orders comply with PO-required rules and shipping validation checks pass.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_sales_order_consolidate.js | Client Script | Shipping and PO-required validation | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Add PO-required and Spee-Dee validations.
- **Phase 2:** Add parcel printing and warranty helpers.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales order with PO-required customer and PO number saves.
2. Spee-Dee shipping rate calculated and saved on fulfillment.

**Edge Cases:**
1. PO-required customer without PO number.
2. Spee-Dee fulfillment with missing rate.

**Error Handling:**
1. External API errors should show user alerts.

### Test Data Requirements
- Customer flagged as PO required.
- Items with weight values.

### Sandbox Setup
- Configure script parameters for Spee-Dee tokens and shipping methods.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales and shipping users.

**Permissions required:**
- Edit Sales Orders and Item Fulfillments.

### Data Security
- Uses customer address and shipping data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm script parameter values for Spee-Dee integration.

### Deployment Steps
1. Upload `sna_hul_cs_sales_order_consolidate.js`.
2. Deploy to Sales Order and Item Fulfillment as required.

### Post-Deployment
- Verify PO-required validation and shipping cost behavior.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Which script replaces this deprecated logic?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| External API latency | Med | Med | Provide user feedback and retries |
| Deprecated logic still deployed | Med | Med | Confirm active deployment scripts |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- EasyPost API

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
