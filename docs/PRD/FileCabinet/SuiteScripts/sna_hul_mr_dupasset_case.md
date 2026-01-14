# PRD: Duplicate Asset Cleanup for Cases

**PRD ID:** PRD-UNKNOWN-DupeAssetCase
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_dupasset_case.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that resolves duplicate equipment assets referenced on Support Case records.

**What problem does it solve?**
It replaces duplicate asset references with the active asset, records merge fields, and inactivates old assets.

**Primary Goal:**
Normalize case asset references and mark duplicate assets as merged/inactive.

---

## 2. Goals

1. Identify duplicate assets from a saved search.
2. Update case fields with merged asset values.
3. Mark duplicate assets as inactive and link active assets to their duplicates.

---

## 3. User Stories

1. **As a** service admin, **I want** cases to reference the correct active asset **so that** data stays consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from parameter `custscript_sna_dupe_case`.
2. For each case, the script must derive active assets using `custrecord_sna_dup_asset` on asset records.
3. The script must write merged asset values to `custevent_sna_case_mergedsite` and `custevent_sna_case_mergedequipment`.
4. The script must set `custrecord_sna_duplicate_asset` on the active asset to reference the old asset.
5. The script must inactivate old asset records referenced by the case.

### Acceptance Criteria

- [ ] Case merged fields are populated with active assets.
- [ ] Old assets are inactivated and linked to active assets.
- [ ] Script completes without failing when assets are empty.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Rebuild case history or transactions related to assets.
- Reactivate previously inactivated assets.

---

## 6. Design Considerations

### User Interface
- None; backend cleanup.

### User Experience
- Users see merged asset fields populated automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case (`supportcase`)
- Custom Record | `customrecord_nx_asset`

**Script Types:**
- [x] Map/Reduce - Duplicate asset normalization
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_nx_case_asset`
- Case | `custevent_nxc_case_assets`
- Case | `custevent_sna_case_mergedsite`
- Case | `custevent_sna_case_mergedequipment`
- Asset | `custrecord_sna_dup_asset`
- Asset | `custrecord_sna_duplicate_asset`

**Saved Searches:**
- Search from parameter `custscript_sna_dupe_case`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Processes results from the saved search.

**Data Sources:**
- Case records and asset records.

**Data Retention:**
- Updates case fields and asset status.

### Technical Constraints
- Multi-select asset fields are rewritten to merged assets only.

### Dependencies
- **Libraries needed:** N/record, N/search, N/runtime, N/error.
- **External dependencies:** None.

### Governance Considerations
- Multiple submitFields calls per case and asset.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Cases reference active assets and duplicates are inactivated.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_dupasset_case.js | Map/Reduce | Normalize case asset references | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Identify duplicates and merge target assets.
- **Phase 2:** Update case fields and inactivate old assets.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Case with duplicate asset references updates merged fields and inactivates old assets.

**Edge Cases:**
1. Case with no duplicate asset values should remain unchanged.

**Error Handling:**
1. Missing search parameter should fail gracefully.

### Test Data Requirements
- Saved search returning cases with asset references.

### Sandbox Setup
- Ensure asset records contain `custrecord_sna_dup_asset` mappings.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or data cleanup role.

**Permissions required:**
- Edit support cases and asset custom records.

### Data Security
- Internal asset data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure `custscript_sna_dupe_case` search parameter.

### Deployment Steps
1. Upload `sna_hul_mr_dupasset_case.js`.
2. Deploy Map/Reduce with saved search.

### Post-Deployment
- Review a sample case for merged asset fields.

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
- [ ] Should original multi-select assets be retained anywhere for audit?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Inactivating assets still referenced elsewhere | Med | High | Validate usage before running cleanup |

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
