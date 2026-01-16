# PRD: SO Transfer Process

**PRD ID:** PRD-UNKNOWN-SoTransferProcess
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_so_transfer_process.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays sales order lines and creates transfer orders or inventory transfers.

**What problem does it solve?**
Automates creation of inventory transfers/transfer orders for sales order lines requiring transfer shipping.

**Primary Goal:**
Create transfer transactions for selected sales order lines and link them back to the SO.

---

## 2. Goals

1. List eligible SO lines for transfer processing.
2. Collect inventory detail data for bin transfers when needed.
3. Create Transfer Orders or Inventory Transfers and link them to the SO.

---

## 3. User Stories

1. **As a** logistics user, **I want to** create transfers from SO lines **so that** inventory moves correctly.
2. **As an** inventory manager, **I want to** enter bin transfer details **so that** bin-level accuracy is maintained.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `soId` and subsidiary parameters.
2. The Suitelet must search SO lines meeting transfer criteria and build a sublist.
3. The Suitelet must distinguish Transfer Orders vs Inventory Transfers based on location type.
4. The Suitelet must create transfer transactions from selected lines, including inventory detail bins.
5. The Suitelet must update SO lines with `custcol_sna_hul_so_linked_transfer` references.

### Acceptance Criteria

- [ ] Eligible lines appear in the sublist with quantities and locations.
- [ ] Selected lines create transfer transactions successfully.
- [ ] SO lines link back to the created transfer transactions.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update SO quantities or shipping methods.
- Validate inventory availability beyond quantity checks.
- Create item fulfillments.

---

## 6. Design Considerations

### User Interface
- Form titled "Sales Order Transfer Process" with a selectable sublist.

### User Experience
- Users select lines and generate transfers in a single submission.

### Design References
- Client script `sna_hul_cs_so_transfer_process.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- transferorder
- inventorytransfer
- location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Transfer processing UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- SO Line | custcol_sna_hul_so_linked_transfer | Linked transfer
- SO Line | custcol_sna_hul_ship_meth_vendor | Ship method
- Location | custrecord_hul_loc_type | Location type

**Saved Searches:**
- None (uses search and SuiteQL).

### Integration Points
- Inventory detail popup Suitelet `sna_hul_sl_so_transproc_invdetail`.

### Data Requirements

**Data Volume:**
- Selected SO lines for transfer.

**Data Sources:**
- SO lines and location metadata

**Data Retention:**
- Creates transfer transactions and updates SO lines.

### Technical Constraints
- Inventory detail required for bin-enabled items.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Client script for UI handling

### Governance Considerations

- **Script governance:** Multiple record creates and SO updates.
- **Search governance:** SO and item location lookups.
- **API limits:** Moderate for large line selections.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Transfers are created and linked to the SO.
- Inventory detail is captured when required.

**How we'll measure:**
- Review created transfers and SO line links.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_so_transfer_process.js | Suitelet | Create transfer transactions from SO lines | Implemented |

### Development Approach

**Phase 1:** Search validation
- [ ] Confirm line filtering logic and location types

**Phase 2:** Transaction validation
- [ ] Test transfer order and inventory transfer creation

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Lines create Transfer Orders for non-van locations.
2. Lines create Inventory Transfers for van locations.

**Edge Cases:**
1. No eligible lines yields empty sublist.

**Error Handling:**
1. Inventory detail missing logs errors and skips lines.

### Test Data Requirements
- Sales order with transfer shipping method lines
- Locations with different location types

### Sandbox Setup
- Deploy Suitelet and client script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Inventory and logistics roles

**Permissions required:**
- Create transfer orders and inventory transfers
- Edit sales orders

### Data Security
- Inventory movement should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Client script deployed

### Deployment Steps

1. Deploy Suitelet.
2. Link to SO UI action.

### Post-Deployment

- [ ] Validate transfers and SO links

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Remove SO action link.

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

- [ ] Should transfer creation enforce quantity availability limits?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect location type mapping creates wrong transaction | Med | Med | Validate location type setup |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- Transfer Order and Inventory Transfer records

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
