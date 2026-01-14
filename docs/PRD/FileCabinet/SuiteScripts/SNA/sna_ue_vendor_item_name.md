# PRD: Vendor Item Name Sourcing (User Event)

**PRD ID:** PRD-UNKNOWN-VendorItemName
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_ue_vendor_item_name.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that sources vendor item names from vendor price records onto purchase order lines for special orders and dropships.

**What problem does it solve?**
Ensures PO lines display the vendor-specific item name for purchasing accuracy.

**Primary Goal:**
Populate `custcol_sna_vendor_item_name` on PO lines based on vendor price data.

---

## 2. Goals

1. Identify special order and dropship POs after submit.
2. Lookup vendor item name by vendor and item.
3. Set the vendor item name on each PO line.

---

## 3. User Stories

1. **As a** buyer, **I want** vendor item names on POs **so that** I can align with vendor catalogs.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run after submit for `specialorder` and `dropship` contexts.
2. The system must load the PO and read `custbody_sna_buy_from`.
3. For each line item, the system must search `customrecord_sna_hul_vendorprice` for `custrecord_sna_vendor_item_name2`.
4. The system must set `custcol_sna_vendor_item_name` on the PO line when found.

### Acceptance Criteria

- [ ] Vendor item name is populated on PO lines for special orders/dropships.
- [ ] POs without vendor or item data are skipped safely.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Run on standard PO create/edit contexts.
- Update vendor item names on non-matching vendor price records.
- Validate vendor price records beyond existence.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Vendor item names appear on PO lines automatically.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Purchase Order
- Vendor Price (`customrecord_sna_hul_vendorprice`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Post-submit update
- [ ] Client Script - Not used

**Custom Fields:**
- Purchase Order | `custbody_sna_buy_from`
- PO line | `custcol_sna_vendor_item_name`
- Vendor Price | `custrecord_sna_vendor_item_name2`

**Saved Searches:**
- Vendor price search by vendor and item.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- All PO line items for specialorder/dropship.

**Data Sources:**
- Vendor price records.

**Data Retention:**
- Updates PO line field only.

### Technical Constraints
- Runs after submit; saves the PO again.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Vendor price records must be maintained.

### Governance Considerations
- Search per line can increase usage on large POs.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor item names populate consistently on special order/dropship POs.

**How we'll measure:**
- Spot check PO lines after creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_ue_vendor_item_name.js | User Event | Populate vendor item names | Implemented |

### Development Approach

**Phase 1:** Vendor price lookup
- [x] Search vendor price by vendor and item.

**Phase 2:** Line update
- [x] Set vendor item name on PO lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a dropship PO and verify vendor item name is set on lines.

**Edge Cases:**
1. Vendor price record not found; line remains unchanged.
2. Missing buy-from vendor; script skips.

**Error Handling:**
1. Record load/save errors are logged.

### Test Data Requirements
- Vendor price records with `custrecord_sna_vendor_item_name2` populated.

### Sandbox Setup
- None.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing users.

**Permissions required:**
- Edit purchase orders
- View vendor price records

### Data Security
- No additional data exposure.

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

1. Upload `sna_ue_vendor_item_name.js`.
2. Deploy User Event on Purchase Order.

### Post-Deployment

- [ ] Verify vendor item name population.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should vendor item names be updated on edit events too?
- [ ] Should the search be cached to avoid per-line searches?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large POs consume governance due to per-line searches | Med | Med | Use a single search and map results |
| Vendor price data missing causes incomplete names | Med | Low | Add validation or reporting for missing data |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
