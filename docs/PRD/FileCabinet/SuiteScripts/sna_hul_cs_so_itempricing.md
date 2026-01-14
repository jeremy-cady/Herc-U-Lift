# PRD: Sales Order Item Pricing Client Script

**PRD ID:** PRD-UNKNOWN-SOItemPricing
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_so_itempricing.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that calculates pricing, markups, and rate values on Sales Order item lines based on pricing group, vendor price, and location markup rules.

**What problem does it solve?**
It automates item price level selection and new unit cost calculation so line rates and amounts are consistent with pricing policies.

**Primary Goal:**
Populate item pricing fields and compute line rates and amounts using pricing group, vendor price, and location markup logic.

---

## 2. Goals

1. Set item price level based on customer pricing group and item category rules.
2. Apply location markup and cumulative markup calculations.
3. Compute new unit cost and line amount automatically.

---

## 3. User Stories

1. **As a** sales user, **I want** item pricing to calculate automatically **so that** I do not manually compute markups.

---

## 4. Functional Requirements

### Core Functionality

1. On header pricing group change, the script must recalculate price level for item lines.
2. On header location change, the script must recalculate location markup for item lines.
3. On item line changes to discounts, markups, basis, list price, replacement cost, item category, or PO rate, the script must recalculate new unit cost.
4. On item line changes to new unit cost or quantity, the script must update line rate and amount.
5. On line validation, the script must run the full pricing pipeline: location markup, vendor price, price level, cumulative markup, new unit cost, and amount.
6. For PO vendor changes on the line, the script must set line rate using vendor price rules, including quantity break and contract price.
7. The script must skip calculations for rental items, non-inventory items, and general product group lines.

### Acceptance Criteria

- [ ] Price level and location markup update based on header changes.
- [ ] New unit cost and amount update when discounts or quantity change.
- [ ] Vendor pricing applies on item/quantity/vendor changes.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate inventory availability.
- Apply pricing to rental or non-inventory items.

---

## 6. Design Considerations

### User Interface
- No UI changes; line fields update automatically.

### User Experience
- Users see pricing fields populate without manual calculations.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Custom Record | `customrecord_sna_hul_vendorprice`
- Custom Record | item category pricing group (not specified)
- Custom Record | location markup (not specified)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Line pricing

**Custom Fields:**
- Header | `custbody_sna_hul_cus_pricing_grp`
- Header | `custbody_sna_hul_location`
- Line | `custcol_sna_hul_itemcategory`
- Line | `custcol_sna_hul_item_pricelevel`
- Line | `custcol_sna_hul_list_price`
- Line | `custcol_sna_hul_replacementcost`
- Line | `custcol_sna_hul_markup`
- Line | `custcol_sna_hul_markupchange`
- Line | `custcol_sna_hul_loc_markupchange`
- Line | `custcol_sna_hul_loc_markup`
- Line | `custcol_sna_hul_cumulative_markup`
- Line | `custcol_sna_hul_basis`
- Line | `custcol_sna_hul_perc_disc`
- Line | `custcol_sna_hul_dollar_disc`
- Line | `custcol_sna_hul_newunitcost`
- Line | `custcol_sna_hul_gen_prodpost_grp`
- Line | `povendor`
- Line | `porate`

**Saved Searches:**
- None.

### Integration Points
- Uses vendor price custom records and location markup configuration.

### Data Requirements

**Data Volume:**
- Iterates line items for pricing updates.

**Data Sources:**
- Line fields, vendor price records, pricing group rules.

**Data Retention:**
- Updates Sales Order line fields only.

### Technical Constraints
- Relies on script parameters for temp item and rental item IDs.

### Dependencies
- **Libraries needed:** N/search, N/runtime.
- **External dependencies:** None.
- **Other features:** Pricing group and location markup configuration records.

### Governance Considerations
- Client-side recalculation can be heavy on large orders.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales Order line pricing fields populate consistently with pricing rules.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_so_itempricing.js | Client Script | Compute pricing fields and rates | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Vendor price and price level selection.
- **Phase 2:** Markup, discount, and new unit cost calculation.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add an inventory item and verify price level, new unit cost, and amount populate.

**Edge Cases:**
1. Rental item line; pricing logic skipped.
2. Non-inventory item; pricing logic skipped.

**Error Handling:**
1. Missing vendor price record should leave list price and replacement cost blank.

### Test Data Requirements
- Vendor price records and pricing group configuration.

### Sandbox Setup
- Deploy client script to Sales Order form with required fields.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Edit Sales Orders and view pricing configuration records.

### Data Security
- Uses internal pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm script parameters for temp and rental item IDs.

### Deployment Steps
1. Upload `sna_hul_cs_so_itempricing.js`.
2. Deploy to Sales Order form.

### Post-Deployment
- Validate pricing calculations on line entry.

### Rollback Plan
- Remove client script deployment from the Sales Order form.

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
- [ ] Should header location changes recalc only affected lines?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large line counts slow client updates | Med | Med | Optimize to update only changed line |

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
