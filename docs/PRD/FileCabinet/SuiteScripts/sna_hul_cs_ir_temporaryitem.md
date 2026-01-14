# PRD: Item Receipt Temporary Item Validation Client Script

**PRD ID:** PRD-UNKNOWN-IRTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_ir_temporaryitem.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that validates temporary item handling and inventory detail on Item Receipts.

**What problem does it solve?**
It prevents unauthorized conversion to item and enforces temporary item code matching on inventory details.

**Primary Goal:**
Ensure temporary item receipts are handled and numbered correctly based on role and category rules.

---

## 2. Goals

1. Restrict conversion handling to approved roles.
2. Validate inventory detail numbers against temporary item codes.
3. Enforce checks only when receiving from purchase orders.

---

## 3. User Stories

1. **As a** receiving user, **I want** temp item inventory numbers validated **so that** receipts are consistent.
2. **As an** admin, **I want** conversion handling restricted **so that** only approved roles can convert temp items.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must load script parameters for temp item categories, convert-to-item value, and permitted roles.
2. On field validation for `custcol_sna_hul_returns_handling`, the script must block conversion for temp item categories if the user role is not allowed.
3. On save, the script must check if the Item Receipt is created from a purchase order.
4. For each received line in a PO-based Item Receipt, the script must verify that the inventory detail `receiptinventorynumber` matches `custcol_sna_hul_temp_item_code` when the item is in a temp category.
5. If a mismatch is detected, the script must alert the user and block save.

### Acceptance Criteria

- [ ] Unauthorized users cannot set temp returns handling to convert to item.
- [ ] Temp item inventory numbers must match the temp item code or save is blocked.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Change inventory detail values automatically.
- Validate receipts not created from purchase orders.

---

## 6. Design Considerations

### User Interface
- Uses alert messages for validation failures.

### User Experience
- Users are prevented from saving invalid temp item receipts.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Receipt
- Transaction (purchase order lookup)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Item receipt validation

**Custom Fields:**
- Line | `custcol_sna_hul_returns_handling`
- Line | `custcol_sna_hul_itemcategory`
- Line | `custcol_sna_hul_temp_item_code`
- Line | `itemreceive`
- Line | `inventorydetail.receiptinventorynumber`

**Saved Searches:**
- None.

### Integration Points
- Uses `search.lookupFields` to determine created-from transaction type.

### Data Requirements

**Data Volume:**
- Line-by-line validation per receipt.

**Data Sources:**
- Item receipt lines and inventory detail subrecords.

**Data Retention:**
- No data persisted beyond validation.

### Technical Constraints
- Relies on script parameters for category and role IDs.

### Dependencies
- **Libraries needed:** N/currentRecord, N/runtime, N/search.
- **External dependencies:** None.
- **Other features:** Script parameters for temp categories and roles.

### Governance Considerations
- Client-side lookups and subrecord reads on save.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temp item receipts fail validation when inventory numbers do not match the temp item code.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_ir_temporaryitem.js | Client Script | Validate temp item handling and inventory detail | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Role-based handling restriction.
- **Phase 2:** Inventory detail matching validation.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Receive a temp item with matching inventory detail number; save succeeds.

**Edge Cases:**
1. Temp item with mismatched inventory number; save blocked.
2. Non-temp items are not validated.
3. User without allowed role tries convert-to-item handling.

**Error Handling:**
1. Missing script parameters should not crash the form; validation should be conservative.

### Test Data Requirements
- PO with temp item lines and inventory detail entries.

### Sandbox Setup
- Deploy script to item receipt forms with required parameters.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Receiving users and admins.

**Permissions required:**
- Edit Item Receipts.

### Data Security
- Uses internal transaction data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm script parameters for temp categories and roles.

### Deployment Steps
1. Upload `sna_hul_cs_ir_temporaryitem.js`.
2. Deploy to Item Receipt forms.

### Post-Deployment
- Validate temp item receipts and role restrictions.

### Rollback Plan
- Remove the client script deployment.

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
- [ ] Should the script validate temp item categories for non-PO receipts?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing or incorrect script parameters | Med | Med | Validate parameters at deploy time |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
