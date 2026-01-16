# PRD: Add Temporary Item

**PRD ID:** PRD-UNKNOWN-AddTempItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_addtempitem.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet for the "Add Temporary Item" button that creates a popup form and inserts an item line into the parent transaction.

**What problem does it solve?**
Allows users to add temporary or special items to transactions with vendor and shipping details.

**Primary Goal:**
Collect temporary item details and insert a line on the parent record.

---

## 2. Goals

1. Display a form for selecting temporary items and related fields.
2. Provide shipping method options from custom record values.
3. Insert the selected item line into the parent transaction via client-side scripting.

---

## 3. User Stories

1. **As a** sales user, **I want to** add a temporary item quickly **so that** I can complete an order.
2. **As a** purchasing user, **I want to** specify vendor and PO rate **so that** costs are captured correctly.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must render a form with required fields: item, vendor, vendor item code, quantity, PO rate, description.
2. The Suitelet must list item options filtered by configured temporary item categories.
3. The Suitelet must list shipping methods from `customrecord_shipping_list`.
4. On submit, the Suitelet must inject a line item into the parent record using `window.opener` calls.
5. The Suitelet must set PO rate to `porate` for Sales Orders and `custcol_sna_hul_estimated_po_rate` for other records.

### Acceptance Criteria

- [ ] Temporary item options reflect configured categories.
- [ ] Required fields are enforced on the form.
- [ ] Line item is added to the parent record with all provided values.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate vendor-item relationships.
- Create inventory records.
- Persist data inside the Suitelet itself.

---

## 6. Design Considerations

### User Interface
- Popup form titled "Temporary Items" with required fields and submit buttons.

### User Experience
- "Submit and Create Again" option for rapid entry.

### Design References
- Client script `sna_hul_cs_addtempitem.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- item
- vendor
- customrecord_shipping_list
- transaction (salesorder and others)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Add temporary item popup
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Item | custitem_sna_hul_itemcategory | Item category filter
- Transaction Line | custcol_sna_hul_ship_meth_vendor | Shipping method (vendor)
- Transaction Line | custcol_sna_hul_item_vendor | Vendor
- Transaction Line | custcol_sna_hul_vendor_item_code | Vendor item code
- Transaction Line | custcol_sna_hul_estimated_po_rate | Estimated PO rate (non-SO)

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Client script `sna_hul_cs_addtempitem.js` for form behavior.

### Data Requirements

**Data Volume:**
- Item search by category.

**Data Sources:**
- Item records
- Shipping list custom record

**Data Retention:**
- Inserts line on parent record; no standalone records created.

### Technical Constraints
- Uses legacy `nlapi*` calls from the parent window.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Client script for Suitelet form

### Governance Considerations

- **Script governance:** Minimal; search and read of select options.
- **Search governance:** Item search and shipping list option lookup.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temporary items can be added with required details.
- Line fields are populated correctly on the parent transaction.

**How we'll measure:**
- User confirmation and line-level checks.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_addtempitem.js | Suitelet | Popup for adding temporary items | Implemented |

### Development Approach

**Phase 1:** Configure parameters
- [ ] Set temporary item category parameters

**Phase 2:** Validate behavior
- [ ] Test line insertion on Sales Orders and other records

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Form loads and lists temporary items.
2. Submission adds item line with vendor, quantity, rate, and description.

**Edge Cases:**
1. Non-SO record uses `custcol_sna_hul_estimated_po_rate` for rate.
2. No items available for categories results in empty item list.

**Error Handling:**
1. Missing required fields prevents submit.

### Test Data Requirements
- Items with category values for each configured parameter
- Shipping list custom record options

### Sandbox Setup
- Deploy Suitelet and configure script parameters

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Transaction entry roles

**Permissions required:**
- View access to items and vendors
- Edit access to parent transactions

### Data Security
- Uses transaction and item data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure category parameters
- [ ] Confirm client script deployment

### Deployment Steps

1. Deploy Suitelet.
2. Add button on parent transaction to launch Suitelet.

### Post-Deployment

- [ ] Verify line insertion behavior

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet button.
2. Fix configuration and re-deploy.

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

- [ ] Should the Suitelet validate vendor-item combinations?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Parent window scripting blocked by browser policies | Low | Med | Ensure popup origin matches NetSuite domain |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/ui/serverWidget module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
