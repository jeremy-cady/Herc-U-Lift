# PRD: RA/IR Temporary Item Returns

**PRD ID:** PRD-UNKNOWN-RAIRTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_rair_temporaryitem.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that handles temporary item returns by setting restock flags, creating inventory adjustments or transfers, and updating Item Receipt lines.

**What problem does it solve?**
Automates inventory and item conversions for temporary item returns based on handling type.

**Primary Goal:**
Process temporary item returns into inventory adjustments or transfers when required.

---

## 2. Goals

1. Set restock flags based on handling type during Item Receipt creation.
2. Convert temp items to regular items via inventory adjustment when required.
3. Transfer defective items to defective locations when required.

---

## 3. User Stories

1. **As an** inventory user, **I want to** handle temp item returns automatically **so that** inventory stays accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeLoad, the script must set restock flags based on handling values for temp item categories.
2. On afterSubmit, if handling is Convert, the script must create an inventory adjustment to move temp items to regular items.
3. On afterSubmit, if handling is Defective, the script must create an inventory transfer to the defective location.
4. The script must update Item Receipt lines with created IA/IT references.

### Acceptance Criteria

- [ ] Restock flags are set correctly for temp items.
- [ ] Inventory adjustments are created for Convert handling.
- [ ] Inventory transfers are created for Defective handling.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Process non-temp item categories.
- Handle returns not created from Return Authorizations.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Return processing generates IA/IT automatically.

### Design References
- Saved search: `customsearch_hul_tempitem_cost`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- itemreceipt
- returnauthorization
- inventoryadjustment
- inventorytransfer
- inventoryitem

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Temp return processing
- [ ] Client Script - N/A

**Custom Fields:**
- itemreceipt line | custcol_sna_hul_temp_item_code | Temp item code
- itemreceipt line | custcol_sna_hul_itemcategory | Item category
- itemreceipt line | custcol_sna_hul_returns_handling | Handling type
- itemreceipt line | custcol_sna_hul_regular_itm | Regular item
- itemreceipt line | custcol_sna_hul_ia | Inventory adjustment
- itemreceipt line | custcol_sna_hul_it | Inventory transfer
- inventoryitem | custitemnumber_sna_hul_uom | UOM

**Saved Searches:**
- `customsearch_hul_tempitem_cost` to fetch unit costs.

### Integration Points
- Uses location lookup to find defective location.

### Data Requirements

**Data Volume:**
- IA/IT creation per temp item return.

**Data Sources:**
- Item Receipt lines, temp item parameters, locations.

**Data Retention:**
- Creates inventory adjustments/transfers and updates Item Receipt lines.

### Technical Constraints
- Only processes Item Receipts created from Return Authorizations.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Temp item category parameters

### Governance Considerations

- **Script governance:** Record create and save per temp item line.
- **Search governance:** Cost search per receipt.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temp item returns generate correct IA/IT records.

**How we'll measure:**
- Review Item Receipt lines for IA/IT links after save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_rair_temporaryitem.js | User Event | Handle temp item return processing | Implemented |

### Development Approach

**Phase 1:** Restock logic
- [ ] Validate handling-driven restock flags

**Phase 2:** IA/IT creation
- [ ] Validate inventory adjustments and transfers

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Return with Convert handling creates IA and updates line.
2. Return with Defective handling creates IT to defective location.

**Edge Cases:**
1. Missing regular item uses existing item lookup.

**Error Handling:**
1. Record creation errors are logged.

### Test Data Requirements
- Item Receipt created from RA with temp item lines

### Sandbox Setup
- Deploy User Event on Item Receipt.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Inventory roles

**Permissions required:**
- Create inventory adjustments/transfers
- Edit item receipts

### Data Security
- Inventory data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure temp item category and handling parameters

### Deployment Steps

1. Deploy User Event on Item Receipt.
2. Validate IA/IT creation for returns.

### Post-Deployment

- [ ] Monitor logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Create IA/IT manually as needed.

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

- [ ] Should defective location be configurable per subsidiary?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect defective location lookup | Low | Med | Validate location naming conventions |

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
