# PRD: Sales Order Vendor Item Pricing (Client Script)

**PRD ID:** PRD-UNKNOWN-SOVendorItemPrice
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_so_vendor_itemprice.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that sets item line rates based on vendor-specific pricing records and quantity break pricing.

**What problem does it solve?**
Ensures sales order line rates reflect the selected vendor's pricing and quantity breaks without manual entry.

**Primary Goal:**
Populate item line rates from vendor pricing records for inventory parts.

---

## 2. Goals

1. Load script parameters for rental item exclusions.
2. Apply vendor pricing to item lines when item or quantity changes.
3. Use quantity break pricing when available.

---

## 3. User Stories

1. **As a** salesperson, **I want** vendor pricing applied automatically **so that** line rates are accurate.
2. **As an** admin, **I want** pricing based on vendor records **so that** policies are enforced.
3. **As a** buyer, **I want** quantity break pricing used **so that** bulk orders are priced correctly.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read script parameters:
   - `custscript_sna_hul_tempitemcat`
   - `custscript_sna_rental_serviceitem`
   - `custscript_sna_rental_equipment`
2. The system must ignore rental charge and rental equipment items.
3. The system must only apply pricing to inventory part items.
4. When item or quantity changes, the system must look up vendor pricing for the current item and `custbody_sna_buy_from`.
5. If quantity break pricing exists, the system must set `rate` based on the highest eligible break.
6. If no quantity breaks exist, the system must set `rate` from item purchase price.

### Acceptance Criteria

- [ ] Item line rates update when item or quantity changes.
- [ ] Quantity break pricing overrides base purchase price when applicable.
- [ ] Rental items are excluded from pricing updates.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update non-inventory items.
- Validate vendor pricing data beyond presence.
- Apply pricing to rental charge lines.

---

## 6. Design Considerations

### User Interface
- Client-side rate updates on item lines.

### User Experience
- Line rates update automatically as users change items and quantities.

### Design References
- Custom vendor pricing record `customrecord_sna_hul_vendorprice`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Custom Vendor Price (`customrecord_sna_hul_vendorprice`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Line pricing logic

**Custom Fields:**
- Transaction | `custbody_sna_buy_from`
- Vendor Price | `custrecord_sna_hul_item`, `custrecord_sna_hul_vendor`, `custrecord_sna_hul_listprice`, `custrecord_sna_hul_itempurchaseprice`, `custrecord_sna_hul_qtybreakprices`

**Saved Searches:**
- None (search created dynamically).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search per item/quantity change.

**Data Sources:**
- Vendor price records.

**Data Retention:**
- Updates line rate field only.

### Technical Constraints
- Uses `search.create` and `run().getRange(0,1)` for vendor pricing lookup.
- Relies on JSON quantity break pricing string.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Vendor pricing records must be maintained.

### Governance Considerations
- Client-side searches per line change may impact performance.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor-based rates populate correctly for inventory items.

**How we'll measure:**
- Validate line rates against vendor pricing records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_so_vendor_itemprice.js | Client Script | Vendor-based line pricing | Implemented |

### Development Approach

**Phase 1:** Vendor pricing lookup
- [x] Retrieve vendor pricing by item and vendor.

**Phase 2:** Rate application
- [x] Apply quantity break or purchase price to line rate.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Item with quantity breaks sets rate to correct break.
2. Item without breaks uses purchase price.

**Edge Cases:**
1. Vendor price record missing; rate unchanged.
2. Non-inventory item; no pricing applied.

**Error Handling:**
1. Quantity break JSON parse fails; fallback to purchase price.

### Test Data Requirements
- Vendor pricing records with and without quantity breaks.

### Sandbox Setup
- Client script deployed on sales order form.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users entering sales orders.

**Permissions required:**
- View vendor pricing custom records.

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_cs_so_vendor_itemprice.js`.
2. Deploy to sales order forms.
3. Validate vendor pricing behavior.

### Post-Deployment

- [ ] Verify line rates update on item/quantity changes.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the form.

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

- [ ] Should pricing apply on postSourcing as well as fieldChanged?
- [ ] Should vendor pricing fallback to list price if purchase price is empty?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Vendor pricing record missing | Med | Low | Add alert or fallback to item price |
| Large orders cause slow UI | Med | Med | Cache vendor pricing per item/vendor |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/search module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
