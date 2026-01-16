# PRD: Validate Van Bin Assignment Uniqueness

**PRD ID:** PRD-UNKNOWN-VanBinAssignment
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_van_bin.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Validates that an item-location pair is not duplicated across Van Bin Assignment records.

**What problem does it solve?**
Prevents multiple van bin assignments for the same item and location.

**Primary Goal:**
Enforce uniqueness of custrecord_sna_vba_item and custrecord_sna_vba_loc combinations.

---

## 2. Goals

1. Detect duplicate item-location assignments on create/edit.
2. Block save when duplicates exist.
3. Provide a clear error message referencing item and location.

---

## 3. User Stories

1. **As an** inventory admin, **I want to** avoid duplicate van bin assignments **so that** bin routing is consistent.
2. **As a** user, **I want to** see a clear error **so that** I can correct the assignment.
3. **As an** admin, **I want to** enforce uniqueness without manual checks.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit for create/edit, the system must read custrecord_sna_vba_item and custrecord_sna_vba_loc.
2. The system must search for existing customrecord_sna_van_bin_assignment records with the same item and location.
3. If a duplicate exists, the system must throw an error and prevent save.

### Acceptance Criteria

- [ ] Duplicate item-location assignments are blocked with an error.
- [ ] Unique assignments save successfully.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Auto-merge or update duplicate records.
- Validate bin values or item status.
- Run on delete.

---

## 6. Design Considerations

### User Interface
- Error message includes item and location names.

### User Experience
- Save is blocked when a duplicate assignment exists.

### Design References
- Custom record: customrecord_sna_van_bin_assignment

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom record: customrecord_sna_van_bin_assignment
- Item
- Location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Validation on submit
- [ ] Client Script - N/A

**Custom Fields:**
- Van Bin Assignment | custrecord_sna_vba_item | Item
- Van Bin Assignment | custrecord_sna_vba_loc | Location

**Saved Searches:**
- None (ad hoc search)

### Integration Points
- None

### Data Requirements

**Data Volume:**
- Per assignment record.

**Data Sources:**
- Existing van bin assignment records.

**Data Retention:**
- No data written by this script.

### Technical Constraints
- Uses search count to detect duplicates.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Van bin assignment custom record

### Governance Considerations

- **Script governance:** One search per save.
- **Search governance:** Simple filter on item and location.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate item-location assignments are prevented.

**How we'll measure:**
- Attempt duplicate save and confirm error.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_van_bin.js | User Event | Prevent duplicate van bin assignments | Implemented |

### Development Approach

**Phase 1:** Duplicate detection
- [x] Search for item-location duplicates.

**Phase 2:** Error handling
- [x] Throw error with item and location details.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a new van bin assignment with unique item/location, verify save.

**Edge Cases:**
1. Create a duplicate assignment, verify error is thrown.

**Error Handling:**
1. Missing item or location, verify script behavior (likely search with empty values).

### Test Data Requirements
- At least one existing van bin assignment record.

### Sandbox Setup
- Deploy User Event on customrecord_sna_van_bin_assignment.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to van bin assignment, item, and location records.

### Data Security
- No data stored; only validation.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Confirm customrecord_sna_van_bin_assignment is deployed.

### Deployment Steps
1. Deploy User Event to van bin assignment record.

### Post-Deployment
- Attempt duplicate entry to verify validation.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should duplicates be checked excluding the current record id on edit?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Duplicate allowed on edit | Data inconsistency | Exclude current record id in search |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
