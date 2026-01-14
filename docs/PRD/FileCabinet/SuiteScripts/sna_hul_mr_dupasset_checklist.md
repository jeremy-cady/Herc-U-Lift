# PRD: Duplicate Asset Cleanup for Rental Checklists

**PRD ID:** PRD-UNKNOWN-DupeAssetChecklist
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_dupasset_checklist.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that updates rental checklist records to reference merged assets and inactivate duplicates.

**What problem does it solve?**
It ensures checklist asset references point to the active asset after duplicate cleanup.

**Primary Goal:**
Update checklist merge fields and inactivate duplicate asset records.

---

## 2. Goals

1. Load a saved search of checklist records with duplicate assets.
2. Update the checklist merge asset field.
3. Mark duplicate assets as inactive and link active assets to duplicates.

---

## 3. User Stories

1. **As a** service admin, **I want** checklist assets normalized **so that** reports use the active asset.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from parameter `custscript_sna_dupe_checklist`.
2. The script must set `custrecord_sn_hul_mergequipassetchklst` to the duplicate-of asset.
3. The script must set `custrecord_sna_duplicate_asset` on the active asset.
4. The script must inactivate the old asset record.

### Acceptance Criteria

- [ ] Checklist merge field is populated.
- [ ] Old assets are inactivated and linked to active assets.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update related transactions or historical logs.

---

## 6. Design Considerations

### User Interface
- None; backend cleanup.

### User Experience
- Users see merged asset references on checklist records.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_sna_hul_rental_checklist`
- Custom Record | `customrecord_nx_asset`

**Script Types:**
- [x] Map/Reduce - Duplicate asset normalization
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Checklist | `custrecord_sna_nxc_rc_asset`
- Checklist | `custrecord_sn_hul_mergequipassetchklst`
- Asset | `custrecord_sna_dup_asset`
- Asset | `custrecord_sna_duplicate_asset`

**Saved Searches:**
- Search from parameter `custscript_sna_dupe_checklist`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Results from saved search.

**Data Sources:**
- Checklist records and asset records.

**Data Retention:**
- Updates checklist fields and asset status.

### Technical Constraints
- Assumes duplicate asset mapping is already stored on asset records.

### Dependencies
- **Libraries needed:** N/record, N/search, N/runtime, N/error.
- **External dependencies:** None.

### Governance Considerations
- SubmitFields calls per checklist and asset.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Checklists reference active assets and duplicates are inactivated.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_dupasset_checklist.js | Map/Reduce | Normalize checklist asset references | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load duplicate asset mappings.
- **Phase 2:** Update checklist and asset records.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Checklist with duplicate asset updates merge field and inactivates old asset.

**Edge Cases:**
1. Missing duplicate asset mapping should skip updates.

**Error Handling:**
1. Invalid search parameter should surface errors in logs.

### Test Data Requirements
- Saved search returning checklist records with asset fields.

### Sandbox Setup
- Ensure asset records have `custrecord_sna_dup_asset` populated.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or data cleanup role.

**Permissions required:**
- Edit checklist and asset custom records.

### Data Security
- Internal asset data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure `custscript_sna_dupe_checklist` search parameter.

### Deployment Steps
1. Upload `sna_hul_mr_dupasset_checklist.js`.
2. Deploy Map/Reduce with saved search.

### Post-Deployment
- Validate checklist merge fields and asset inactivation.

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
- [ ] Should old asset references be preserved in an audit field?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Assets referenced elsewhere are inactivated | Med | High | Validate usage before cleanup |

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
