# PRD: Sales Order Item Pricing

**PRD ID:** PRD-UNKNOWN-SoItemPricing
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_so_itempricing.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Populates and recalculates pricing-related fields for Sales Orders and Estimates based on item category, customer pricing group, revenue stream, and location markup.

**What problem does it solve?**
Ensures line pricing and cost fields are consistently derived when records are created, copied, or edited outside the normal UI client script flow.

**Primary Goal:**
Keep line pricing fields and rates in sync with pricing rules and revenue stream configuration.

---

## 2. Goals

1. Populate pricing details links on view.
2. Lock rates where required by item/service rules.
3. Recalculate pricing fields when price level is missing or revenue stream changes.

---

## 3. User Stories

1. **As a** sales user, **I want to** see pricing details links **so that** I can review pricing logic per line.
2. **As a** pricing admin, **I want to** enforce lock rate rules **so that** manual changes do not bypass pricing policy.
3. **As a** sales user, **I want to** have rates recalculated after imports **so that** CSV-loaded lines are priced correctly.

---

## 4. Functional Requirements

### Core Functionality

1. On VIEW, the system must inject an "Other Details" link into custcol_sna_pricing_details when empty.
2. On CREATE/COPY, when created from an Estimate, the system must copy custcol_sna_hul_estimated_po_rate to porate.
3. On beforeSubmit, the system must set custbody_sna_order_fulfillment_method to Will Call when header revenue stream equals the CSHOP parameter.
4. On beforeSubmit, the system must set custcol_sna_hul_lock_rate for qualifying item lines (excluding rental/service exclusions).
5. On afterSubmit, the system must recalculate pricing fields if the line price level is empty or the revenue stream changed.
6. Pricing calculations must use customer pricing group, item category, location markup, vendor price, and revenue stream surcharge rules.

### Acceptance Criteria

- [ ] VIEW shows an "Other Details" link for each line missing custcol_sna_pricing_details.
- [ ] COPY/CREATE from Estimate copies estimated PO rate into porate.
- [ ] Lines meeting criteria have custcol_sna_hul_lock_rate set to true.
- [ ] Lines with missing price level are recalculated and updated with price, rate, and amount.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace the client script pricing logic.
- Alter tax processing (legacy logic is commented out).
- Modify non-item sublists.

---

## 6. Design Considerations

### User Interface
- VIEW mode adds an "Other Details" hyperlink per line.

### User Experience
- Repricing occurs after submit for non-UI contexts (e.g., CSV import) to match UI behavior.

### Design References
- Suitelet: customscript_sna_hul_sl_itempricingdet
- Related client script behavior for pricing.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Estimate
- Customer (lookup)
- Item
- Custom records (pricing and markup)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - Pricing details viewer
- [ ] RESTlet - N/A
- [x] User Event - Pricing updates
- [ ] Client Script - N/A

**Custom Fields:**
- Sales Order | custbody_sna_order_fulfillment_method | Order fulfillment method
- Sales Order | cseg_sna_revenue_st | Header revenue stream
- Item line | custcol_sna_pricing_details | Pricing details link HTML
- Item line | custcol_sna_hul_estimated_po_rate | Estimated PO rate
- Item line | custcol_sna_hul_lock_rate | Lock rate flag
- Item line | custcol_sna_hul_itemcategory | Item category
- Item line | custcol_item_discount_grp | Discount group
- Item line | custcol_sna_hul_markupchange | Item markup change
- Item line | custcol_sna_hul_loc_markup | Location markup record
- Item line | custcol_sna_hul_loc_markupchange | Location markup change
- Item line | custcol_sna_hul_list_price | List price
- Item line | custcol_sna_hul_replacementcost | Replacement cost
- Item line | custcol_sna_hul_list_price_init | Initial list price
- Item line | custcol_sna_hul_replacementcost_init | Initial replacement cost
- Item line | custcol_sna_hul_item_pricelevel | Item price level
- Item line | custcol_sna_hul_basis | Pricing basis
- Item line | custcol_sna_hul_markup | Pricing markup
- Item line | custcol_sna_hul_cumulative_markup | Cumulative markup
- Item line | custcol_sna_hul_newunitcost | New unit cost
- Item line | custcolsna_hul_newunitcost_wodisc | Unit cost without discount
- Item line | custcol_sna_hul_list_price_prev | Previous list price
- Item line | custcol_sna_hul_replacementcost_prev | Previous replacement cost
- Item line | custcol_sna_hul_item_pricelevel | Price level
- Shipping address subrecord | custrecord_sna_cpg_parts | Customer pricing group

**Saved Searches:**
- None (script uses ad hoc searches)

### Integration Points
- Suitelet: customscript_sna_hul_sl_itempricingdet (line-level details)
- Custom record: customrecord_sna_hul_itempricelevel
- Custom record: customrecord_sna_hul_locationmarkup
- Custom record: customrecord_sna_hul_vendorprice
- Custom record: customrecord_sna_service_code_type

### Data Requirements

**Data Volume:**
- Per Sales Order/Estimate, all item lines.

**Data Sources:**
- Item records, customer address pricing group, rate card custom records.

**Data Retention:**
- Pricing values stored on the transaction line.

### Technical Constraints
- Repricing runs only when price level is missing or revenue stream changed.
- Revenue stream defaults to header cseg_sna_revenue_st if line is empty.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/sna_hul_mod_sales_tax.js (referenced, currently not active)
- **External dependencies:** None
- **Other features:** Suitelet for pricing details link

### Governance Considerations

- **Script governance:** Uses record.load and multiple searches; may be heavy on large orders.
- **Search governance:** Uses multiple searches for items, location markup, price levels, vendor price, revenue stream.
- **API limits:** None external.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Pricing fields are populated after CSV import or non-UI create.
- Line rate and amount match pricing rules.
- Lock rate is set where required.

**How we'll measure:**
- Compare line pricing vs expected for sample items.
- Script logs indicate no errors.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_so_itempricing.js | User Event | Populate and recalc item pricing | Implemented |

### Development Approach

**Phase 1:** UI support
- [x] Add pricing details link on VIEW.
- [x] Copy estimated PO rate on CREATE/COPY.

**Phase 2:** Repricing logic
- [x] Apply lock rate and repricing after submit.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. CSV import Sales Order with missing price level, verify fields and rate populated after save.
2. View Sales Order with empty pricing details, verify link appears.

**Edge Cases:**
1. Revenue stream changes between edits, verify repricing occurs.
2. Customer pricing group missing, default to List (155).

**Error Handling:**
1. Missing pricing configuration records, verify script logs error and skips line.

### Test Data Requirements
- Items with vendor price and item category mappings.
- Customer with shipping address pricing group.

### Sandbox Setup
- Ensure custom records exist with pricing and markup configurations.

---

## 11. Security & Permissions

### Roles & Permissions
- Users must have access to Sales Orders/Estimates and referenced custom records.

### Data Security
- Pricing fields are updated only on the current transaction.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Custom records for pricing and markup are populated.
- [ ] Suitelet for pricing details is deployed.

### Deployment Steps
1. Deploy User Event on Sales Order and Estimate.
2. Confirm script parameters are set (item categories, service types, pricing groups).

### Post-Deployment
- Verify pricing on a new and imported transaction.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Which revenue stream price calculation modes are currently active for production?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing pricing configuration | Incorrect pricing | Validate custom record setup |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script
- Custom record searches

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
