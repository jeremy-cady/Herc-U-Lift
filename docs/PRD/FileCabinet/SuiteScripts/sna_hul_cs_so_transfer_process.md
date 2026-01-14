# PRD: SO Transfer Process Suitelet Client Script

**PRD ID:** PRD-UNKNOWN-SOTransferProcess
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_so_transfer_process.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_so_transfer_process.js (Suitelet)
- FileCabinet/SuiteScripts/sna_hul_sl_so_transproc_invdetail.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for the SO Transfer Process Suitelet that manages inventory detail entry and validation on transfer lines.

**What problem does it solve?**
It ensures from-location quantities and inventory details are entered before processing transfers.

**Primary Goal:**
Validate transfer line data and open inventory detail entry when required.

---

## 2. Goals

1. Open inventory detail Suitelet for selected lines.
2. Update quantity available based on from-location selection.
3. Validate required fields before processing transfers.

---

## 3. User Stories

1. **As a** user, **I want** inventory details enforced **so that** transfers are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must expose `updateLine` to receive inventory detail JSON from the inv detail Suitelet.
2. When `custpage_sublist_locinvdet` is clicked, the script must open the inv detail Suitelet with item, quantity, line, and location parameters.
3. When `custpage_sublist_fromloc` changes, the script must clear existing inv detail data and update available quantity using an item search.
4. On save, the script must require at least one checked line.
5. For checked lines, the script must require from location, inventory detail (for bin items and inventory transfer), and sufficient quantity available.

### Acceptance Criteria

- [ ] Inventory detail entry is required for bin items on inventory transfer lines.
- [ ] Transfers cannot proceed when quantity available is insufficient.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Perform the transfer creation itself.
- Validate item availability beyond location quantity available.

---

## 6. Design Considerations

### User Interface
- Opens a popup Suitelet for inventory detail.

### User Experience
- Users are prompted with alerts when required data is missing.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Suitelet for SO transfer process
- Item

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Transfer process UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Transfer validation

**Custom Fields:**
- Sublist | `custpage_sublist_chk`
- Sublist | `custpage_sublist_item`
- Sublist | `custpage_sublist_qty`
- Sublist | `custpage_sublist_fromloc`
- Sublist | `custpage_sublist_toloc`
- Sublist | `custpage_sublist_locinvdet`
- Sublist | `custpage_sublist_locinvdetdata`
- Sublist | `custpage_sublist_locinvdetenter`
- Sublist | `custpage_sublist_qtyfrmloc`
- Sublist | `custpage_sublist_itemusebins`
- Sublist | `custpage_sublist_trtocreated`

**Saved Searches:**
- Item search for location quantity available.

### Integration Points
- Suitelet `customscript_sna_hul_so_transproc_invdet` for inventory detail entry.

### Data Requirements

**Data Volume:**
- Line-level validations and lookups.

**Data Sources:**
- Suitelet sublist values and item search results.

**Data Retention:**
- Writes inventory detail JSON to Suitelet sublist fields.

### Technical Constraints
- Requires popup access for inventory detail entry.

### Dependencies
- **Libraries needed:** N/url, N/currentRecord, N/format, N/search.
- **External dependencies:** None.
- **Other features:** Transfer process Suitelet.

### Governance Considerations
- Client-side search per from-location change.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Transfer lines cannot be processed without required inventory details.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_so_transfer_process.js | Client Script | SO transfer validation and inv detail launch | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Open inv detail Suitelet and update qty available.
- **Phase 2:** Validate required fields on save.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select a line, set from location, enter inventory detail, and save.

**Edge Cases:**
1. From location empty; save blocked.
2. Inventory detail missing for bin item; save blocked.
3. Qty requested exceeds available; save blocked.

**Error Handling:**
1. Item search returns no availability; qty available set to 0.

### Test Data Requirements
- Items with and without bin usage and location availability.

### Sandbox Setup
- Deploy client script to the SO Transfer Process Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users processing transfers.

**Permissions required:**
- Access to Suitelets and item data.

### Data Security
- Uses internal item and transfer data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet IDs for transfer process and inventory detail.

### Deployment Steps
1. Upload `sna_hul_cs_so_transfer_process.js`.
2. Deploy to the SO Transfer Process Suitelet.

### Post-Deployment
- Validate inventory detail entry and save behavior.

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
- [ ] Should maximum checked lines be enforced (commented logic)?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Users bypass inv detail by closing popup | Low | Med | Require inv detail flag on save |

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
