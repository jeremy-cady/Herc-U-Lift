# PRD: SO Transfer Process Inventory Detail

**PRD ID:** PRD-UNKNOWN-SoTransprocInvdetail
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_so_transproc_invdetail.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays and captures inventory detail (bin assignments) for SO transfer processing.

**What problem does it solve?**
Provides a UI to select From/To bins and quantities for transfer transactions.

**Primary Goal:**
Collect inventory detail data for transfer orders or inventory transfers.

---

## 2. Goals

1. Display item, quantity, and bin selections.
2. Populate available bins from source and destination locations.
3. Return inventory detail selections to the calling process.

---

## 3. User Stories

1. **As a** warehouse user, **I want to** select bins for transfers **so that** inventory movement is tracked accurately.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept item, quantity, and location parameters.
2. The Suitelet must list available bins from the source location with available quantities.
3. The Suitelet must list destination bins for the target location.
4. The Suitelet must allow entry of quantities for bin assignments.

### Acceptance Criteria

- [ ] From and To bin lists populate based on locations.
- [ ] Inventory detail entries are captured in the sublist.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create transfer transactions directly.
- Validate bin quantities beyond available values.
- Persist data without parent suitelet usage.

---

## 6. Design Considerations

### User Interface
- Form titled "Inventory Details" with an inline editor sublist.

### User Experience
- Popup-style bin assignment editor.

### Design References
- Client script `sna_hul_cs_so_transproc_invdetail.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- inventoryitem
- bin

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Inventory detail UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- Used by `sna_hul_sl_so_transfer_process`.

### Data Requirements

**Data Volume:**
- Bin-level data per item/location.

**Data Sources:**
- Inventory item bin availability
- Bin records

**Data Retention:**
- No data changes; UI only.

### Technical Constraints
- Only items with bin usage will show bins.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Transfer processing suitelet

### Governance Considerations

- **Script governance:** Bin and item searches.
- **Search governance:** Inventory bin availability filters.
- **API limits:** Moderate for large bin sets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can select bins and quantities for transfers.

**How we'll measure:**
- Validation of returned bin data in transfer creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_so_transproc_invdetail.js | Suitelet | Capture inventory detail for transfers | Implemented |

### Development Approach

**Phase 1:** Bin data validation
- [ ] Confirm bin search filters

**Phase 2:** UI validation
- [ ] Test bin selection and return values

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Bin lists populate for a bin-enabled item.

**Edge Cases:**
1. No bins available results in empty options.

**Error Handling:**
1. Invalid item or location logs error.

### Test Data Requirements
- Bin-enabled inventory item with quantities

### Sandbox Setup
- Deploy Suitelet and client script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Warehouse roles

**Permissions required:**
- View access to bins and items

### Data Security
- Inventory data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Client script deployed

### Deployment Steps

1. Deploy Suitelet.
2. Link from transfer process UI.

### Post-Deployment

- [ ] Validate bin selection flow

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Remove UI link.

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

- [ ] Should bin selection enforce quantity available validation?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Bin availability changes between selection and transfer | Med | Med | Revalidate at transfer creation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- Bin and inventory item records

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
