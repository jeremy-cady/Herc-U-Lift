# PRD: SO Transfer Process Inventory Detail Client Script

**PRD ID:** PRD-UNKNOWN-SOTransProcInvDetail
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_so_transproc_invdetail.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_so_transproc_invdetail.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for the inventory detail popup used by the SO Transfer Process Suitelet.

**What problem does it solve?**
It populates existing inventory detail data, validates quantities, and returns inventory detail JSON back to the parent Suitelet.

**Primary Goal:**
Capture and validate inventory detail lines for transfer processing.

---

## 2. Goals

1. Load existing inventory detail JSON into the sublist.
2. Auto-select to-bin based on preferred bin at destination.
3. Validate total quantity and availability before returning data.

---

## 3. User Stories

1. **As a** user, **I want** inventory detail quantities validated **so that** transfers are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must read JSON inventory detail data from the opener and populate `custpage_sublist_invdetdata`.
2. When `custpage_sublist_frombins` changes, the script must populate `custpage_sublist_qtyavail` from the selected bin.
3. When `custpage_sublist_frombins` changes, the script must set `custpage_sublist_tobins` to the preferred bin at the destination location.
4. On OK, the script must validate:
   - Each line quantity <= available quantity
   - Total quantity equals header quantity
5. If valid, the script must send JSON back to the opener via `updateLine` and close the window.

### Acceptance Criteria

- [ ] Inventory detail lines load from existing JSON.
- [ ] Quantity validation blocks invalid entries.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create inventory transfers directly.
- Validate bin availability beyond displayed quantity.

---

## 6. Design Considerations

### User Interface
- Uses popup window for inventory detail entry.

### User Experience
- Users are alerted if quantities exceed available or totals mismatch.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Inventory Item
- Suitelet for transfer inventory detail

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Inventory detail UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Inventory detail handling

**Custom Fields:**
- Header | `custpage_itemfield`
- Header | `custpage_qtyfield`
- Sublist | `custpage_sublist_frombins`
- Sublist | `custpage_sublist_tobins`
- Sublist | `custpage_sublist_qty`
- Sublist | `custpage_sublist_qtyavail`

**Saved Searches:**
- Inventory item search for preferred bin at destination.

### Integration Points
- Communicates with parent Suitelet via `window.opener.updateLine`.

### Data Requirements

**Data Volume:**
- Inventory detail lines per transfer line.

**Data Sources:**
- Inventory detail JSON and bin data from item search.

**Data Retention:**
- Returns JSON to parent Suitelet.

### Technical Constraints
- Requires popup access and opener reference.

### Dependencies
- **Libraries needed:** N/url, N/currentRecord, N/format, N/search.
- **External dependencies:** None.
- **Other features:** SO transfer process Suitelet.

### Governance Considerations
- Client-side search for preferred bin.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Inventory detail JSON is returned correctly and validates quantities.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_so_transproc_invdetail.js | Client Script | Inventory detail entry and validation | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load and display existing inventory detail data.
- **Phase 2:** Validate and return inventory detail JSON.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open inventory detail popup with existing data; lines populate.
2. Enter valid quantities; JSON returned to parent.

**Edge Cases:**
1. Quantity exceeds available; alert shown.
2. Total quantity mismatch; alert shown.

**Error Handling:**
1. Missing JSON data should allow entry from scratch.

### Test Data Requirements
- Item with bins and preferred bin set at destination location.

### Sandbox Setup
- Deploy client script to the inv detail Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users processing transfers.

**Permissions required:**
- Access to inventory items and Suitelet.

### Data Security
- Uses internal inventory data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm inventory detail Suitelet deployment.

### Deployment Steps
1. Upload `sna_hul_cs_so_transproc_invdetail.js`.
2. Deploy to the inv detail Suitelet.

### Post-Deployment
- Validate popup behavior and JSON return.

### Rollback Plan
- Remove client script deployment from the Suitelet.

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
- [ ] Should the script enforce bin selection for all lines?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Opener window unavailable | Low | Med | Guard and show error message |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
