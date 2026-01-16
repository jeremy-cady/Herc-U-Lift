# PRD: Case Site Asset Button and Project Sync

**PRD ID:** PRD-UNKNOWN-CaseSiteAssetButton
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_case.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event on support cases that adds a "Save and Create NXC Site Asset" button and syncs location/revenue/asset data to the related project.

**What problem does it solve?**
Streamlines site asset creation from cases and keeps project fields aligned with case data.

**Primary Goal:**
Provide a case UI button and automatically populate project fields based on case details.

---

## 2. Goals

1. Add a UI button for creating NXC Site Assets on case forms.
2. Default case location from the related project.
3. Sync revenue stream, equipment asset, and location to the project when missing.

---

## 3. User Stories

1. **As a** support user, **I want to** create an NXC Site Asset from a case **so that** asset records are created quickly.
2. **As a** project manager, **I want to** keep project fields aligned with case data **so that** reporting remains consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The script must add a "Save and Create NXC Site Asset" button on case forms in UI mode (non-view).
2. The script must attach client script `sna_hul_cs_case.js` to handle the prompt.
3. On case create, the script must default `custevent_sna_hul_caselocation` from the related project location.
4. After submit, if the project is Billable and key fields are missing, the script must update project fields from the case.

### Acceptance Criteria

- [ ] Case form shows the button in UI create/edit.
- [ ] Case location defaults from the related project on create.
- [ ] Project fields update when missing and case has values.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create site assets automatically without user interaction.
- Override project fields if they already have values.

---

## 6. Design Considerations

### User Interface
- Adds a custom button on the case form.

### User Experience
- Users can create site assets directly from the case screen.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- supportcase
- job (project)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - UI button and data sync
- [ ] Client Script - Button handler (separate script)

**Custom Fields:**
- supportcase | custevent_nx_case_asset | Site asset reference
- supportcase | custevent_sna_hul_caselocation | Case location
- supportcase | cseg_sna_revenue_st | Revenue stream
- supportcase | custevent_nxc_case_assets | Equipment asset reference
- job | custentity_nx_project_type | Project type
- job | cseg_sna_revenue_st | Revenue stream
- job | custentity_nxc_project_assets | Project equipment asset
- job | custentity_sna_hul_location | Project location

**Saved Searches:**
- None (uses lookupFields).

### Integration Points
- Client script `sna_hul_cs_case.js` for UI prompt handling.

### Data Requirements

**Data Volume:**
- Single project lookup/update per case.

**Data Sources:**
- Case and project records.

**Data Retention:**
- Updates project fields when missing.

### Technical Constraints
- Button only shows for UI contexts that are not View.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Client script prompt handling

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** Single lookup per case.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case button appears and project fields sync as expected.

**How we'll measure:**
- Spot-check cases and related project records for updates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_case.js | User Event | Case button and project sync | Implemented |

### Development Approach

**Phase 1:** UI button
- [ ] Validate button appears in UI create/edit

**Phase 2:** Project sync
- [ ] Validate project field updates on case submit

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a case and confirm location defaults from project.
2. Save a Billable case with revenue stream and equipment asset to update project.

**Edge Cases:**
1. Case in view mode should not show the button.
2. Project fields already set should not be overwritten.

**Error Handling:**
1. lookupFields errors are logged without blocking save.

### Test Data Requirements
- Billable project with missing revenue stream and equipment asset

### Sandbox Setup
- Deploy User Event on Case and include client script file.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Support roles
- Project managers

**Permissions required:**
- Edit support cases and jobs

### Data Security
- Project data updates restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm client script `sna_hul_cs_case.js` is deployed and accessible

### Deployment Steps

1. Deploy User Event on Support Case.
2. Validate UI button and project updates.

### Post-Deployment

- [ ] Monitor logs for lookup/update errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Remove button from the form.

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

- [ ] Should the button be hidden if a site asset already exists?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Project type text changes | Low | Med | Validate project type values in environment |

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
