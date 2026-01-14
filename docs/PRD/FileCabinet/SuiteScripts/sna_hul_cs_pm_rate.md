# PRD: PM Rate Equipment Type Client Script

**PRD ID:** PRD-UNKNOWN-PMRate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_pm_rate.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that sets the Equipment Type on a PM Rate record when an Object Number is selected.

**What problem does it solve?**
It keeps PM rate equipment type aligned to the selected object segment hierarchy.

**Primary Goal:**
Populate equipment type based on the selected object number's equipment segment.

---

## 2. Goals

1. Look up the equipment segment for the selected object.
2. Resolve the top-level equipment segment.
3. Set the PM Rate equipment type field automatically.

---

## 3. User Stories

1. **As an** admin, **I want** equipment type filled automatically **so that** PM rate records are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. When `custrecord_sna_hul_pmpriceobjectnum` changes, the script must look up `cseg_sna_hul_eq_seg` from `customrecord_sna_objects`.
2. The script must determine the top-level equipment segment from `customrecord_cseg_sna_hul_eq_seg`.
3. The script must set `custrecord_sna_hul_pmpriceequiptype` to the top-level segment ID.
4. If the object or segment is missing, the script must clear the equipment type field.

### Acceptance Criteria

- [ ] Equipment type is set automatically when an object number is selected.
- [ ] Equipment type clears when no object segment is found.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate that the selected object is active.
- Update any related records.

---

## 6. Design Considerations

### User Interface
- Field updates occur silently on field change.

### User Experience
- Users do not need to select equipment type manually.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_sna_objects`
- Custom Record | `customrecord_cseg_sna_hul_eq_seg`
- Custom Record | PM Rate (deployment target)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Field update

**Custom Fields:**
- PM Rate | `custrecord_sna_hul_pmpriceobjectnum`
- PM Rate | `custrecord_sna_hul_pmpriceequiptype`
- Object | `cseg_sna_hul_eq_seg`

**Saved Searches:**
- None (search created in script).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One lookup on object change.

**Data Sources:**
- Object record segment and equipment segment hierarchy.

**Data Retention:**
- Updates the PM Rate record only.

### Technical Constraints
- Requires equipment segment hierarchy to have parent-child relationships.

### Dependencies
- **Libraries needed:** N/record, N/runtime, N/search.
- **External dependencies:** None.
- **Other features:** Equipment segment custom record.

### Governance Considerations
- Client-side lookup and search for equipment segments.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PM Rate equipment type is consistently populated from selected object numbers.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_pm_rate.js | Client Script | Populate equipment type from object segment | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Implement object lookup and segment resolution.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select an object number and verify equipment type is populated.

**Edge Cases:**
1. Object has no equipment segment; equipment type cleared.

**Error Handling:**
1. Lookup fails; script should not block save.

### Test Data Requirements
- Objects with equipment segments and parent segments.

### Sandbox Setup
- Deploy client script to PM Rate custom record form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admins and pricing users.

**Permissions required:**
- View objects and equipment segment records.

### Data Security
- Uses internal record data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm segment hierarchy is configured.

### Deployment Steps
1. Upload `sna_hul_cs_pm_rate.js`.
2. Deploy to PM Rate record.

### Post-Deployment
- Validate equipment type population.

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
- [ ] Should equipment type derive from a different segment if hierarchy changes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Segment hierarchy missing parents | Low | Med | Ensure parent segments are configured |

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
