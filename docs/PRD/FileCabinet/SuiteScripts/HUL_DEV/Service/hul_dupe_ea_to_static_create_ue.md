# PRD: Duplicate Equipment Asset to Static Field (User Event)

**PRD ID:** PRD-UNKNOWN-DupeEquipmentAssetUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_dupe_ea_to_static_create_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that copies the equipment asset field from a project to a static equipment asset field on create and edit.

**What problem does it solve?**
Ensures a static equipment asset reference is populated for downstream processes when a project’s equipment asset changes.

**Primary Goal:**
Copy `custentity_nxc_project_assets` into `custentity_hul_nxc_eqiup_asset` on project create/edit.

---

## 2. Goals

1. Detect project create or edit.
2. Read the project’s equipment asset field.
3. Populate the static equipment asset field.

---

## 3. User Stories

1. **As an** admin, **I want** equipment asset data copied **so that** reports use a stable field.
2. **As a** support user, **I want** updates to run on edit **so that** changes are synchronized.
3. **As a** developer, **I want** the script to run automatically **so that** manual updates are not needed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `afterSubmit` for `CREATE` and `EDIT`.
2. The system must read `custentity_nxc_project_assets`.
3. If the equipment asset is missing, the system must log and exit.
4. The system must set `custentity_hul_nxc_eqiup_asset` to the equipment asset ID via `submitFields`.
5. Errors must be logged without blocking the transaction.

### Acceptance Criteria

- [ ] Projects with equipment assets populate the static field on create/edit.
- [ ] Projects without equipment assets are skipped.
- [ ] Errors are logged without breaking the save.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate the equipment asset value.
- Update any other project fields.
- Run on delete.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Background synchronization of equipment asset fields.

### Design References
- None.

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
- [x] User Event - Project field sync
- [ ] Client Script - Not used

**Custom Fields:**
- Project | `custentity_nxc_project_assets`
- Project | `custentity_hul_nxc_eqiup_asset`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per project save.

**Data Sources:**
- Project record fields.

**Data Retention:**
- Updates to project record only.

### Technical Constraints
- Uses submitFields on the project record after submit.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Downstream processes expecting the static field.

### Governance Considerations
- One submitFields per project save.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Static equipment asset field is populated after project save.

**How we'll measure:**
- Spot checks on project records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_dupe_ea_to_static_create_ue.js | User Event | Copy equipment asset to static field | Implemented |

### Development Approach

**Phase 1:** Trigger
- [x] Run on create/edit

**Phase 2:** Update
- [x] Copy equipment asset field via submitFields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a project with equipment asset; static field is set.
2. Edit the equipment asset; static field updates.

**Edge Cases:**
1. Equipment asset blank; script logs and exits.

**Error Handling:**
1. submitFields error logged without blocking save.

### Test Data Requirements
- Projects with and without equipment assets.

### Sandbox Setup
- Ensure both fields exist on the project record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles editing projects.

**Permissions required:**
- Edit access to project records.

### Data Security
- Updates only project field values.

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

1. Upload `hul_dupe_ea_to_static_create_ue.js`.
2. Deploy as a User Event on project (job) record.
3. Verify field sync on create/edit.

### Post-Deployment

- [ ] Confirm static equipment asset field is populated.
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

- [ ] Should the sync happen only on create, not edit?
- [ ] Should the static field be updated via beforeSubmit instead?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Field ID typo (`eqiup`) | Low | Low | Validate field IDs in sandbox |
| Project save re-triggers downstream logic | Low | Low | Monitor UE side effects |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.x User Event
- record.submitFields API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
