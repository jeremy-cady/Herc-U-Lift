# PRD: Duplicate Asset Cleanup for Projects

**PRD ID:** PRD-UNKNOWN-DupeAssetProject
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_dupeasset_proj.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that updates project (job) records to reference merged assets and inactivate duplicates.

**What problem does it solve?**
It ensures project asset references point to active assets after duplicate cleanup.

**Primary Goal:**
Normalize project asset references and inactivate duplicate assets.

---

## 2. Goals

1. Load a saved search of projects with duplicate assets.
2. Update project merge fields with active assets.
3. Mark duplicate assets as inactive and link active assets to duplicates.

---

## 3. User Stories

1. **As a** project admin, **I want** project asset references normalized **so that** reporting uses the active asset.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from parameter `custscript_sna_dupe_proj`.
2. The script must write merged asset values to `custentity_sn_hul_mergesiteassetproj` and `custentity_sn_hul_mergequipassetproj`.
3. The script must set `custrecord_sna_duplicate_asset` on the active asset.
4. The script must inactivate old asset records referenced by the project.

### Acceptance Criteria

- [ ] Project merge fields are populated with active assets.
- [ ] Old assets are inactivated and linked to active assets.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update project history or transactions tied to assets.

---

## 6. Design Considerations

### User Interface
- None; backend cleanup.

### User Experience
- Users see merged asset fields populated on projects.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Project/Job (`job`)
- Custom Record | `customrecord_nx_asset`

**Script Types:**
- [x] Map/Reduce - Duplicate asset normalization
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Project | `custentity_nx_asset`
- Project | `custentity_nxc_project_assets`
- Project | `custentity_sn_hul_mergesiteassetproj`
- Project | `custentity_sn_hul_mergequipassetproj`
- Asset | `custrecord_sna_dup_asset`
- Asset | `custrecord_sna_duplicate_asset`

**Saved Searches:**
- Search from parameter `custscript_sna_dupe_proj`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Results from saved search.

**Data Sources:**
- Project records and asset records.

**Data Retention:**
- Updates project fields and asset status.

### Technical Constraints
- Multi-select asset fields are rewritten to merged assets only.

### Dependencies
- **Libraries needed:** N/record, N/search, N/runtime, N/error.
- **External dependencies:** None.

### Governance Considerations
- Multiple submitFields calls per project and asset.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Projects reference active assets and duplicates are inactivated.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_dupeasset_proj.js | Map/Reduce | Normalize project asset references | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load duplicate asset mappings.
- **Phase 2:** Update project and asset records.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Project with duplicate assets updates merge fields and inactivates old assets.

**Edge Cases:**
1. Project without duplicate mapping should remain unchanged.

**Error Handling:**
1. Invalid search parameter should log errors.

### Test Data Requirements
- Saved search returning projects with asset references.

### Sandbox Setup
- Ensure assets have `custrecord_sna_dup_asset` populated.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or data cleanup role.

**Permissions required:**
- Edit project and asset records.

### Data Security
- Internal asset data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure `custscript_sna_dupe_proj` search parameter.

### Deployment Steps
1. Upload `sna_hul_mr_dupeasset_proj.js`.
2. Deploy Map/Reduce with saved search.

### Post-Deployment
- Validate project merge fields and asset inactivation.

### Rollback Plan
- Disable script deployment.

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
- [ ] Should original asset selections be retained for audit?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Inactivating assets still referenced elsewhere | Med | High | Validate usage before cleanup |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
