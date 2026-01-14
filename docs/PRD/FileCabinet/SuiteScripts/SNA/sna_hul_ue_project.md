# PRD: Project Default Location (User Event)

**PRD ID:** PRD-UNKNOWN-ProjectDefaults
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_project.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event on Project records that defaults the project location from the current user when missing.

**What problem does it solve?**
Ensures projects are created with a location when users do not set one manually.

**Primary Goal:**
Populate `custentity_sna_hul_location` on project create when it is empty.

---

## 2. Goals

1. Default the project location to the current user's location if missing.
2. Run only on project creation.

---

## 3. User Stories

1. **As a** project admin, **I want** a default location **so that** projects are not created without one.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on project create events.
2. If `custentity_sna_hul_location` is empty, the system must set it to the current user's location.

### Acceptance Criteria

- [ ] Project location defaults to the current user's location on create when empty.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update location on edit or after submit.
- Enforce location selection for all users.
- Update other project fields (project-from-SO logic is present but not active).

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Location is prefilled automatically during create.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Project (Job)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Default location on create
- [ ] Client Script - Not used

**Custom Fields:**
- Project | `custentity_sna_hul_location`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One record per create.

**Data Sources:**
- Current user profile (location).

**Data Retention:**
- Updates project location field only.

### Technical Constraints
- Requires current user location to be set.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Minimal.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Projects are created with a location when users have a location set.

**How we'll measure:**
- Spot check newly created projects.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_project.js | User Event | Default project location | Implemented |

### Development Approach

**Phase 1:** Location defaulting
- [x] Set location on create when empty.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create project with empty location; location defaults to user location.

**Edge Cases:**
1. User has no location; field remains empty.

**Error Handling:**
1. Errors are logged without blocking create.

### Test Data Requirements
- User with and without a location set.

### Sandbox Setup
- None.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Project users.

**Permissions required:**
- Create projects

### Data Security
- No additional data exposure.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sna_hul_ue_project.js`.
2. Deploy on Project record.

### Post-Deployment

- [ ] Verify default location behavior.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should the project-from-SO field updates be re-enabled?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Users without location lead to empty field | Low | Low | Enforce location in UI or validation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
