# PRD: Update Department and Location Client Script

**PRD ID:** PRD-UNKNOWN-UpdateDeptLoc
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_update_dept_loc.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that defaults Department and Location from the current user when creating a record.

**What problem does it solve?**
It ensures new records start with the user’s department and location without manual selection.

**Primary Goal:**
Set department and location defaults on create when the entity is selected.

---

## 2. Goals

1. Capture the record mode on page init.
2. Set department and location from the current user on entity change in create mode.

---

## 3. User Stories

1. **As a** user, **I want** department and location defaulted **so that** I do not manually select them.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must store the current mode.
2. When `entity` changes and the mode is create, the script must set:
   - `department` to the current user’s department
   - `location` to the current user’s location

### Acceptance Criteria

- [ ] Department and location default on create when entity is selected.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Override department or location on edit mode.
- Validate department or location permissions.

---

## 6. Design Considerations

### User Interface
- No UI changes; fields update automatically.

### User Experience
- Users see defaults applied only on create.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction record using entity field (not specified)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Default values

**Custom Fields:**
- Header | `entity`
- Header | `department`
- Header | `location`

**Saved Searches:**
- None.

### Integration Points
- Uses `runtime.getCurrentUser()`.

### Data Requirements

**Data Volume:**
- Single update per entity change on create.

**Data Sources:**
- Current user profile.

**Data Retention:**
- Updates header fields only.

### Technical Constraints
- Works only in create mode.

### Dependencies
- **Libraries needed:** N/runtime.
- **External dependencies:** None.
- **Other features:** User profile data.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- New records default to the user’s department and location.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_update_dept_loc.js | Client Script | Default department and location | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Capture mode and apply defaults on entity change.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a record, select entity, and verify department/location populate.

**Edge Cases:**
1. Edit an existing record; defaults should not reapply.

**Error Handling:**
1. User missing department or location; fields remain unchanged.

### Test Data Requirements
- User with department and location set.

### Sandbox Setup
- Deploy client script to applicable transaction form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users creating transactions.

**Permissions required:**
- Edit access to the record type.

### Data Security
- Uses user profile data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm deployment target record type.

### Deployment Steps
1. Upload `sna_hul_cs_update_dept_loc.js`.
2. Deploy to the applicable record.

### Post-Deployment
- Validate defaults on create.

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
- [ ] Should defaults also apply on copy mode?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| User profile missing location/department | Low | Low | Add validation or fallback values |

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
