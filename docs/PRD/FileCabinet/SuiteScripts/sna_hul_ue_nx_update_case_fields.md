# PRD: NX Task Updates Case Fields

**PRD ID:** PRD-UNKNOWN-NXUpdateCaseFields
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_nx_update_case_fields.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that copies revenue stream and equipment asset fields from a newly created task to its linked support case.

**What problem does it solve?**
Keeps support case fields in sync when tasks are created through NX "add new task" flow.

**Primary Goal:**
Update support case revenue stream and equipment asset from task values on creation.

---

## 2. Goals

1. Detect newly created tasks with support case references.
2. Copy revenue stream and equipment asset to the case.

---

## 3. User Stories

1. **As a** service coordinator, **I want to** sync case fields from tasks **so that** case data stays current.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeSubmit on task create.
2. If `supportcase` and `custevent_nx_task_type` are set, the script must update the support case.
3. The script must set `cseg_sna_revenue_st` and `custevent_nxc_case_assets` when values are present.

### Acceptance Criteria

- [ ] Support case revenue stream and equipment asset update from task values.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update cases on task edits.
- Modify tasks themselves.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Case fields update automatically when tasks are created.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- task
- supportcase

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Update case fields
- [ ] Client Script - N/A

**Custom Fields:**
- task | custevent_nx_task_type | Task type
- task | supportcase | Support case
- task | cseg_sna_revenue_st | Revenue stream
- task | custevent_sn_hul_equip_asset | Equipment asset
- supportcase | cseg_sna_revenue_st | Revenue stream
- supportcase | custevent_nxc_case_assets | Equipment asset

**Saved Searches:**
- None.

### Integration Points
- NX task creation flow.

### Data Requirements

**Data Volume:**
- One submitFields call per created task.

**Data Sources:**
- Task fields.

**Data Retention:**
- Updates support case fields.

### Technical Constraints
- Only runs on create events.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** NX task creation

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Support case fields are updated from task values at creation.

**How we'll measure:**
- Review cases linked to newly created tasks.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_nx_update_case_fields.js | User Event | Update case fields from task | Implemented |

### Development Approach

**Phase 1:** Task detection
- [ ] Validate task type and case checks

**Phase 2:** Case update
- [ ] Validate case field updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create task with case and revenue stream; case updates accordingly.

**Edge Cases:**
1. Task without case does nothing.

**Error Handling:**
1. submitFields errors are logged.

### Test Data Requirements
- Task created with support case and equipment asset

### Sandbox Setup
- Deploy User Event on Task.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Service roles

**Permissions required:**
- Edit support cases

### Data Security
- Case data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm task and case custom fields

### Deployment Steps

1. Deploy User Event on Task.
2. Validate case updates.

### Post-Deployment

- [ ] Monitor logs for submitFields errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update cases manually if needed.

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

- [ ] Should case updates occur on task edits?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Task values missing lead to no case updates | Low | Low | Validate task creation process |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
