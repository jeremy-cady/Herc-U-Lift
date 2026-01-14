# PRD: Item Van Bin Assignment Validation Client Script

**PRD ID:** PRD-UNKNOWN-ItemVanBin
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_item_van_bin.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that validates Van Bin Assignment sublist entries on Item records.

**What problem does it solve?**
It prevents duplicate item-location assignments in the Van Bin Assignment custom record.

**Primary Goal:**
Block creation of duplicate van bin assignments for the same item and location.

---

## 2. Goals

1. Detect existing van bin assignments for the selected item and location.
2. Prevent saving duplicate sublist lines.

---

## 3. User Stories

1. **As an** inventory admin, **I want** duplicate van bin assignments blocked **so that** data stays clean.

---

## 4. Functional Requirements

### Core Functionality

1. When a line is validated on `recmachcustrecord_sna_vba_item`, the script must read `custrecord_sna_vba_item` and `custrecord_sna_vba_loc`.
2. The script must search for existing `customrecord_sna_van_bin_assignment` records with the same item and location.
3. If a duplicate exists, the script must show an alert and block the line insert.

### Acceptance Criteria

- [ ] Duplicate item-location van bin assignments are blocked.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Auto-merge or remove existing assignments.
- Validate bin fields beyond item and location.

---

## 6. Design Considerations

### User Interface
- Uses dialog alert when duplicates are found.

### User Experience
- Users are immediately notified before saving a duplicate.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item
- Custom Record | `customrecord_sna_van_bin_assignment`
- Location

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Sublist validation

**Custom Fields:**
- Sublist | `recmachcustrecord_sna_vba_item`
- Van Bin Assignment | `custrecord_sna_vba_item`
- Van Bin Assignment | `custrecord_sna_vba_loc`

**Saved Searches:**
- None (scripted search only).

### Integration Points
- Uses a saved-search-style query against `customrecord_sna_van_bin_assignment`.

### Data Requirements

**Data Volume:**
- One search per sublist line validation.

**Data Sources:**
- Item sublist values and van bin assignment records.

**Data Retention:**
- No data persisted beyond validation.

### Technical Constraints
- Uses client-side search and dialog alerts.

### Dependencies
- **Libraries needed:** N/record, N/ui/dialog, N/search.
- **External dependencies:** None.
- **Other features:** Van bin assignment custom record.

### Governance Considerations
- Client-side search per validation event.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate item-location van bin assignments are prevented.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_item_van_bin.js | Client Script | Block duplicate van bin assignment lines | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Validate sublist line on insert.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add a van bin assignment for a new item-location pair; save succeeds.

**Edge Cases:**
1. Add a duplicate item-location pair; alert shown and line blocked.

**Error Handling:**
1. Missing item or location should allow user to correct before validation.

### Test Data Requirements
- Existing van bin assignment record for a known item and location.

### Sandbox Setup
- Deploy client script to the item record.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Inventory admins.

**Permissions required:**
- Edit items and van bin assignment records.

### Data Security
- Uses internal item and location data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm sublist and field IDs for van bin assignments.

### Deployment Steps
1. Upload `sna_hul_cs_item_van_bin.js`.
2. Deploy to item record forms.

### Post-Deployment
- Validate duplicate detection on van bin assignment sublist.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should the duplicate check include bin or subsidiary filters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Search latency during line validation | Low | Low | Keep search minimal |

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
