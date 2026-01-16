# PRD: Item Receipt Temporary Item Inventory Details

**PRD ID:** PRD-UNKNOWN-IRTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_ir_temporaryitem.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that validates temporary item inventory numbers on Item Receipt and updates inventory number fields for temporary items.

**What problem does it solve?**
Ensures inventory numbers match temporary item codes and populates inventory number metadata for temporary items.

**Primary Goal:**
Validate inventory detail consistency and update inventory number custom fields for temporary items received on POs.

---

## 2. Goals

1. Validate inventory detail numbers against temporary item codes.
2. Update inventory number records with vendor and cost data for temporary items.

---

## 3. User Stories

1. **As a** warehouse user, **I want to** validate temporary item inventory numbers **so that** receipts are consistent.
2. **As a** data admin, **I want to** populate inventory number metadata **so that** temporary items carry vendor and cost info.

---

## 4. Functional Requirements

### Core Functionality

1. Before submit, the script must validate Item Receipt lines from Purchase Orders for temporary item categories.
2. For temporary items, the inventory detail `receiptinventorynumber` must equal the temporary item code.
3. After submit, the script must populate Inventory Number fields (category, vendor, description, unit cost, UOM) for temporary items.

### Acceptance Criteria

- [ ] Inventory detail number mismatches throw an error.
- [ ] Inventory number records are updated with temporary item metadata.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Run for receipts not created from Purchase Orders.
- Modify non-temporary items.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Validation prevents incorrect inventory number entries.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- itemreceipt
- inventorynumber
- transaction

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Validation and updates
- [ ] Client Script - N/A

**Custom Fields:**
- itemreceipt line | custcol_sna_hul_temp_item_code | Temporary item code
- itemreceipt line | custcol_sna_hul_itemcategory | Item category
- itemreceipt line | custcol_sna_hul_vendor_item_code | Vendor item code
- inventorynumber | custitemnumber_sna_hul_item_category | Item category
- inventorynumber | custitemnumber_sna_hul_vendor_no | Vendor
- inventorynumber | custitemnumber_sna_hul_vendor_item_no | Vendor item code
- inventorynumber | custitemnumber_sna_hul_description | Description
- inventorynumber | custitemnumber_sna_hul_unit_cost | Unit cost
- inventorynumber | custitemnumber_sna_hul_uom | UOM

**Saved Searches:**
- Item Receipt search for temporary item lines and inventory numbers.

### Integration Points
- Script parameters for temporary item categories and UOM.

### Data Requirements

**Data Volume:**
- One inventory number update per unique inventory number.

**Data Sources:**
- Item Receipt lines and inventory detail data.

**Data Retention:**
- Updates inventory number records.

### Technical Constraints
- Only runs for Item Receipts created from Purchase Orders.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Temporary item category setup

### Governance Considerations

- **Script governance:** Search and submitFields per unique inventory number.
- **Search governance:** Item Receipt search per receipt.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temporary item inventory numbers are validated and updated with metadata.

**How we'll measure:**
- Verify inventory number fields after Item Receipt save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_ir_temporaryitem.js | User Event | Validate and update temporary items | Implemented |

### Development Approach

**Phase 1:** Validation
- [ ] Validate inventory detail matching

**Phase 2:** Inventory number updates
- [ ] Validate inventory number field updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Receipt of temp item with matching temp code updates inventory number fields.

**Edge Cases:**
1. Mismatched inventory number throws validation error.
2. Non-PO receipts skip processing.

**Error Handling:**
1. submitFields errors are logged.

### Test Data Requirements
- PO with temporary item categories and inventory details

### Sandbox Setup
- Deploy User Event on Item Receipt.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Warehouse and inventory roles

**Permissions required:**
- Edit inventory numbers
- Edit item receipts

### Data Security
- Inventory data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure temp item category and UOM parameters

### Deployment Steps

1. Deploy User Event on Item Receipt.
2. Validate temp item receipts.

### Post-Deployment

- [ ] Monitor logs for validation errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update inventory numbers manually.

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

- [ ] Should validation run for other transaction types besides PO receipts?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect temp item categories cause missed updates | Med | Low | Review parameter setup |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
