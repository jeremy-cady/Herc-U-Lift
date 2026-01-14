# PRD: Vendor Item Name Sourcing (Client Script)

**PRD ID:** PRD-UNKNOWN-VendorItemNameCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_source_vendor_item_name.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that sources and populates a vendor's item name on purchase order lines based on the selected vendor and item.

**What problem does it solve?**
Ensures vendor item names are automatically populated on purchase orders to improve vendor communication and accuracy.

**Primary Goal:**
Populate `custcol_sna_vendor_item_name` from vendor pricing records on item selection.

---

## 2. Goals

1. Look up vendor item name for the selected vendor and item.
2. Populate vendor item name on the PO line.
3. Provide a utility action to create object records from PO data.

---

## 3. User Stories

1. **As a** buyer, **I want** vendor item names auto-filled **so that** POs match vendor catalogs.
2. **As an** admin, **I want** a consistent vendor item name field **so that** reporting is standardized.
3. **As a** purchaser, **I want** a quick way to create object records **so that** equipment purchases are streamlined.

---

## 4. Functional Requirements

### Core Functionality

1. When an item is selected on the PO line, the system must search `customrecord_sna_hul_vendorprice` for the current vendor and item.
2. If `custrecord_sna_vendor_item_name2` is found, the system must set `custcol_sna_vendor_item_name`.
3. The system must support a `purchaseEquipmentFxn` that validates PO header fields and opens a Suitelet to create object records.
4. The system must provide a `setPOItems` helper to add lines to the PO from a child window payload.

### Acceptance Criteria

- [ ] Vendor item name is populated when vendor/item match exists.
- [ ] No changes occur when vendor or item is missing.
- [ ] Purchase equipment action requires vendor, location, and department.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate vendor item names beyond search results.
- Persist PO changes server-side without user save.
- Handle inventory detail assignment automatically (commented out in script).

---

## 6. Design Considerations

### User Interface
- Runs on PO item line field changes and provides custom actions.

### User Experience
- Vendor item names fill in automatically and PO equipment actions open in a new window.

### Design References
- Custom vendor price record and PO custom fields.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Purchase Order
- Custom Vendor Price (`customrecord_sna_hul_vendorprice`)
- Custom Object (`customrecord_sna_objects`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used for object creation
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - PO line sourcing and actions

**Custom Fields:**
- PO | `custbody_sna_buy_from`, `custbody_po_type`, `custbody_sna_hul_object_subsidiary`
- Line | `custcol_sna_vendor_item_name`, `custcol_sna_hul_fleet_no`
- Vendor Price | `custrecord_sna_vendor_item_name2`

**Saved Searches:**
- None (search created dynamically).

### Integration Points
- Suitelet `customscript_sna_hul_sl_create_obj_rec` for object creation.

### Data Requirements

**Data Volume:**
- One search per item change.

**Data Sources:**
- Vendor price records and PO header fields.

**Data Retention:**
- Updates line fields on the current PO.

### Technical Constraints
- Uses `window.opener` to update PO lines from a child window.
- Uses `tranDate.toLocaleDateString()` to avoid timezone discrepancies.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Suitelet must accept PO details and return object record data.

### Governance Considerations
- Client-side search per item selection; moderate usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor item names populate correctly and equipment purchase flow works.

**How we'll measure:**
- Verify `custcol_sna_vendor_item_name` values and PO line creation from object records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_source_vendor_item_name.js | Client Script | Source vendor item names and PO actions | Implemented |

### Development Approach

**Phase 1:** Vendor item name lookup
- [x] Search vendor price and set line field.

**Phase 2:** Equipment purchase helper
- [x] Launch Suitelet and add PO lines from returned data.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select an item with vendor pricing; vendor item name populates.
2. Run purchase equipment action with required fields; Suitelet opens.

**Edge Cases:**
1. No vendor price record; field remains empty.
2. Missing vendor/location/department; user receives dialog error.

**Error Handling:**
1. Suitelet errors do not corrupt PO data.

### Test Data Requirements
- Vendor price record with `custrecord_sna_vendor_item_name2`.

### Sandbox Setup
- Client script deployed on purchase order form with Suitelet available.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users entering purchase orders.

**Permissions required:**
- View vendor price records
- Access to Suitelet deployment

### Data Security
- PO details passed to Suitelet; ensure role access is limited.

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

1. Upload `sna_hul_cs_source_vendor_item_name.js`.
2. Deploy to purchase order form.
3. Validate vendor item name sourcing and equipment purchase flow.

### Post-Deployment

- [ ] Verify vendor item names and PO line creation.
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

- [ ] Should vendor item names be updated on vendor change as well?
- [ ] Should PO line creation be validated for duplicate items?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Client-side window communication fails | Low | Med | Add error handling for window.opener |
| Suitelet unavailable | Med | Med | Provide user-friendly error messaging |

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
