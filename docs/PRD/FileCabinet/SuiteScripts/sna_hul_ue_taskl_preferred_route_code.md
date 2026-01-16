# PRD: Task Preferred Route Code

**PRD ID:** PRD-UNKNOWN-TaskPreferredRouteCode
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_taskl_preferred_route_code.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Sets the task route code on a task record based on the preferred route code from related NextService assets.

**What problem does it solve?**
Ensures tasks inherit routing preferences from the related job site or equipment assets tied to the support case.

**Primary Goal:**
Populate custevent_sna_hul_task_route_code automatically on create/edit.

---

## 2. Goals

1. Read support case assets linked to the task.
2. Prefer equipment asset route codes when job site assets are linked.
3. Default to job site route code when job site asset is equipment.

---

## 3. User Stories

1. **As a** dispatcher, **I want to** auto-fill route codes **so that** scheduling is faster.
2. **As a** service coordinator, **I want to** prioritize equipment asset routes **so that** routing follows the equipment location.
3. **As an** admin, **I want to** skip updates when no assets are linked **so that** unnecessary changes are avoided.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit for create/edit, the system must read the task support case (supportcase).
2. If the support case has no job site or equipment assets, the system must exit.
3. If the job site asset type is Site, the system must check linked equipment assets and set custevent_sna_hul_task_route_code using the first equipment asset with a preferred route code.
4. If the job site asset type is Equipment, the system must set custevent_sna_hul_task_route_code from that asset's preferred route code.

### Acceptance Criteria

- [ ] Task route code is set from equipment assets when job site type is Site.
- [ ] Task route code is set from job site asset when it is Equipment.
- [ ] No update occurs when assets are missing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate route code values beyond presence.
- Update other task fields.
- Modify the support case.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Route code is set during save and visible immediately after.

### Design References
- NextService asset records.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Task (or deployed record type)
- Support Case
- Custom record: customrecord_nx_asset

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Route code sourcing
- [ ] Client Script - N/A

**Custom Fields:**
- Task | custevent_sna_hul_task_route_code | Task route code
- Support Case | custevent_nx_case_asset | Job site asset
- Support Case | custevent_nxc_case_assets | Equipment assets
- NextService Asset | custrecord_nxc_na_asset_type | Asset type
- NextService Asset | custrecord_sna_preferred_route_code | Preferred route code

**Saved Searches:**
- None

### Integration Points
- Support case and NextService asset lookups

### Data Requirements

**Data Volume:**
- One task per save.

**Data Sources:**
- Support case linked assets.

**Data Retention:**
- Route code stored on task record.

### Technical Constraints
- Only runs on create/edit contexts.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** NextService asset data

### Governance Considerations

- **Script governance:** Uses lookupFields for support case and assets.
- **Search governance:** None.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Tasks are saved with the correct route code when asset data exists.

**How we'll measure:**
- Compare task route code to asset preferred route code after save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_taskl_preferred_route_code.js | User Event | Set task route code from assets | Implemented |

### Development Approach

**Phase 1:** Asset resolution
- [x] Look up case job site and equipment assets.

**Phase 2:** Route code selection
- [x] Choose preferred route code based on asset type.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Task with support case and equipment asset, verify route code set.

**Edge Cases:**
1. Support case has only job site asset of type Site and no equipment assets, verify no route code set.
2. Support case has equipment assets with no preferred route code, verify no update.

**Error Handling:**
1. Missing asset record, verify script logs error and exits.

### Test Data Requirements
- Support cases with job site and equipment assets.

### Sandbox Setup
- Deploy User Event on task record type.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to support cases and NextService assets.

### Data Security
- Only task route code is updated.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Confirm asset records include preferred route code values.

### Deployment Steps
1. Deploy User Event to the task record.

### Post-Deployment
- Validate a task save from a support case.

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
- If multiple equipment assets have route codes, should the script prefer a specific one?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Asset data missing | Route code not set | Validate case asset data |

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
