# PRD: Sales Order and Item Fulfillment Client Utilities

**PRD ID:** PRD-UNKNOWN-SNACSMulti
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that handles sales order and item fulfillment UI behaviors, including vendor selection, PO rates, SpeeDee shipping workflow, and parcel/label interactions.

**What problem does it solve?**
Automates line-level vendor/price defaults and shipping actions so users do not have to manually maintain PO vendor, PO rate, and shipping details.

**Primary Goal:**
Streamline sales order line defaults and shipping/parcel workflows in the UI.

---

## 2. Goals

1. Default PO vendor and PO rate based on item vendor configuration.
2. Manage SpeeDee shipping behaviors and parcel sublist interactions.
3. Provide client-side actions for printing labels and calculating shipping costs.

---

## 3. User Stories

1. **As a** sales rep, **I want** PO vendors and rates auto-filled **so that** line entry is faster.
2. **As a** warehouse user, **I want** SpeeDee parcel info managed **so that** labels print correctly.
3. **As an** admin, **I want** consistent shipping logic **so that** costs and fields are standardized.

---

## 4. Functional Requirements

### Core Functionality

1. The system must set line-level `location` on item lines to match the transaction location when items are sourced.
2. The system must resolve PO vendor and rate based on:
   - Primary vendor custom record data.
   - Quantity break pricing.
   - Contract price or item purchase price fallbacks.
3. The system must update `custcol_sna_csi_povendor` and `povendor` on item lines when vendor data is found.
4. The system must recalculate PO rates when `povendor` or `quantity` changes.
5. On sales order create/copy, the system must populate line vendors using the primary vendor configuration.
6. On item fulfillment, the system must disable or enable parcel fields based on shipping method.
7. The system must set shipping cost to 0 for item fulfillment context.
8. The system must support client actions to calculate shipping cost, print parcel labels, and generate SpeeDee order payloads.
9. The system must manage parcel sublist values and shipping cost fields based on API responses.

### Acceptance Criteria

- [ ] Item lines default to the correct PO vendor and rate when items are selected.
- [ ] Quantity changes update the PO rate based on quantity breaks.
- [ ] Item fulfillment parcel fields are enabled only for SpeeDee shipping.
- [ ] Shipping cost and SpeeDee order fields update based on API responses.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle server-side shipping rate calculations.
- Create or submit transactions.
- Replace backend shipping integrations.

---

## 6. Design Considerations

### User Interface
- Uses standard NetSuite client behaviors: fieldChanged, postSourcing, pageInit, validateLine.
- Parcel sublist is manipulated by client logic.

### User Experience
- Users see fewer manual steps when selecting items or managing shipping.

### Design References
- Custom item vendor records and SpeeDee shipping API workflow.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Item Fulfillment
- Item
- Customer
- Location

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used indirectly for label printing
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - UI behaviors and shipping actions

**Custom Fields:**
- Line fields: `custcol_sna_csi_povendor`, `custcol_sna_hul_primaryvendor`, `custcol_sna_hul_qtybreakprices`, `custcol_sna_hul_contractprice`, `custcol_sna_hul_itempurchaseprice`
- Transaction fields: `custbody_sna_speedeeorderdetails`, `custbody_sna_speedeeorderreturn`, `custbody_sna_speedeeorderid`, `custbody_sna_speedeeorderbought`

**Saved Searches:**
- Item search for vendor pricing and primary vendor data.

### Integration Points
- SpeeDee/EasyPost API via `N/https`.

### Data Requirements

**Data Volume:**
- Per line entry and per shipping action.

**Data Sources:**
- Item vendor custom records, customer and location addresses.

**Data Retention:**
- Writes shipping order and response data into transaction fields.

### Technical Constraints
- Client script is large and handles multiple responsibilities.
- Depends on script parameters for shipping method IDs.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** EasyPost/SpeeDee API.
- **Other features:** Label printing Suitelet URLs.

### Governance Considerations
- Client-side calls to external APIs and saved searches may be heavy.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Line vendor/rate defaults and shipping actions reduce manual entry.

**How we'll measure:**
- User feedback and reduced manual corrections on orders.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_.js | Client Script | Sales order and fulfillment UI automation | Implemented |

### Development Approach

**Phase 1:** Line defaults
- [x] Populate vendor and PO rate by item and quantity.

**Phase 2:** Shipping actions
- [x] SpeeDee order generation and parcel handling.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add an item with a primary vendor and confirm PO vendor/rate defaults.
2. Change quantity and verify PO rate updates.
3. Run SpeeDee shipping flow and confirm parcel sublist updates.

**Edge Cases:**
1. Items without primary vendor records.
2. SpeeDee API error responses.

**Error Handling:**
1. API call failures show alerts and do not corrupt parcel data.

### Test Data Requirements
- Items with vendor pricing and quantity break data.
- Customer and location addresses suitable for SpeeDee shipments.

### Sandbox Setup
- Client script deployed on sales order and item fulfillment forms.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users entering sales orders and fulfillments.

**Permissions required:**
- Standard UI access; API keys handled in script parameters.

### Data Security
- API tokens are used client-side; ensure appropriate protection and deployment context.

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

1. Upload `sna_hul_cs_.js`.
2. Deploy to sales order and item fulfillment forms.
3. Set script parameters for shipping methods.

### Post-Deployment

- [ ] Verify vendor defaults and shipping actions.
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

- [ ] Should SpeeDee logic be split into a dedicated module?
- [ ] Should rate calculation run server-side for consistency?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Client-side API exposure | Med | High | Move API calls server-side |
| Large client script affects performance | Med | Med | Refactor into smaller modules |

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
