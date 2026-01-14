# PRD: PO Vendor Item Pricing Client Script

**PRD ID:** PRD-UNKNOWN-POVendorItemPrice
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_po_vendor_itemprice.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that sets purchase order item line rates based on vendor price records and item quantities.

**What problem does it solve?**
It enforces vendor pricing rules, including quantity break pricing and contract pricing, when item or quantity changes.

**Primary Goal:**
Automatically populate item rates on PO lines based on vendor pricing configuration.

---

## 2. Goals

1. Calculate rate based on vendor price and quantity break rules.
2. Apply contract price when available.
3. Keep line department in sync with header department.

---

## 3. User Stories

1. **As a** buyer, **I want** vendor pricing applied automatically **so that** PO rates are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. When an item is sourced on the item sublist, the script must call `setVendorPrice` using `custbody_sna_buy_from`.
2. When line quantity changes, the script must recalculate vendor price using the summed quantity across all lines for the same item.
3. The script must set the line `rate` based on the first available pricing rule in this order: quantity break price, contract price, item purchase price.
4. The script must update all matching item lines with the computed rate when quantity changes.
5. On line validation, the script must set the line `department` to the header `department` when an item is present.

### Acceptance Criteria

- [ ] Rates update based on vendor pricing rules and summed quantities.
- [ ] Line department matches header department on commit.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Set department defaults from a custom form (pageInit is present but not deployed in return).
- Apply pricing to non-item sublists.

---

## 6. Design Considerations

### User Interface
- Rates are updated automatically; no UI changes.

### User Experience
- Users see consistent pricing without manual lookup.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Purchase Order
- Custom Record | `customrecord_sna_hul_vendorprice`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - PO line pricing

**Custom Fields:**
- PO | `custbody_sna_buy_from`
- Line | `item`
- Line | `quantity`
- Line | `rate`
- Line | `department`
- Vendor Price | `custrecord_sna_hul_item`
- Vendor Price | `custrecord_sna_hul_vendor`
- Vendor Price | `custrecord_sna_hul_listprice`
- Vendor Price | `custrecord_sna_hul_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_qtybreakprices`
- Vendor Price | `custrecord_sna_hul_contractprice`

**Saved Searches:**
- None (scripted search only).

### Integration Points
- Uses vendor price custom record as the pricing source.

### Data Requirements

**Data Volume:**
- One vendor price search per item update.

**Data Sources:**
- PO line items and vendor price configuration.

**Data Retention:**
- Updates PO line rates only.

### Technical Constraints
- Quantity break pricing uses summed quantities across all lines for the same item.

### Dependencies
- **Libraries needed:** N/search, N/runtime, N/currentRecord.
- **External dependencies:** None.
- **Other features:** Vendor price custom records.

### Governance Considerations
- Client-side search and line updates per change event.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PO lines consistently reflect vendor pricing rules.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_po_vendor_itemprice.js | Client Script | Apply vendor pricing to PO lines | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Implement vendor price lookup and rate selection.
- **Phase 2:** Handle quantity sum logic across lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add item with vendor pricing and quantity break; rate is set based on total quantity.

**Edge Cases:**
1. Contract price exists; rate set to contract price when no qty breaks.
2. No vendor price record; rate remains unchanged.

**Error Handling:**
1. Search errors should not block line entry.

### Test Data Requirements
- Vendor price records with qty break and contract price values.

### Sandbox Setup
- Deploy client script to Purchase Order form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Purchasing users.

**Permissions required:**
- Edit Purchase Orders and view vendor price records.

### Data Security
- Uses internal pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Verify vendor price records and fields are configured.

### Deployment Steps
1. Upload `sna_hul_cs_po_vendor_itemprice.js`.
2. Deploy to Purchase Order forms.

### Post-Deployment
- Validate rate updates on item and quantity changes.

### Rollback Plan
- Remove client script deployment from Purchase Orders.

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
- [ ] Should pricing ignore non-inventory item types explicitly?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Quantity sum logic may be slow on large POs | Med | Med | Optimize or limit to edited item |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
