# PRD: Populate Equipment Asset on Objects (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-PopulateEquipAssetOnObjectMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_nxc_equipment_asset_on_object_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that backfills a custom equipment asset field on object records based on the asset‑to‑object relationship.

**What problem does it solve?**
Ensures object records have a direct reference to their equipment asset for downstream processes.

**Primary Goal:**
Set `custrecord_hul_nxcequipasset` on `customrecord_sna_objects` based on linked equipment assets.

---

## 2. Goals

1. Query asset/object pairs from the FSA relationship.
2. Map asset IDs to object IDs.
3. Update object records with the asset ID.

---

## 3. User Stories

1. **As an** admin, **I want** object records linked to equipment assets **so that** integrations can rely on a single field.
2. **As a** support user, **I want** a batch update **so that** data is consistent without manual edits.
3. **As a** developer, **I want** a Map/Reduce process **so that** updates scale.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query `customrecord_nx_asset` joined to `customrecord_sna_objects` where:
   - `custrecord_nxc_na_asset_type = '2'`
   - `customrecord_sna_objects.id > 1253190000`
   - `customrecord_sna_objects.id <= 1253192000`
2. The system must emit asset/object ID pairs.
3. The reduce stage must update each object with:
   - `custrecord_hul_nxcequipasset = <assetID>`
4. Errors must be logged without halting the run.

### Acceptance Criteria

- [ ] Object records in the ID range are updated with equipment asset IDs.
- [ ] Assets outside the range are not processed.
- [ ] Errors are logged without stopping execution.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Process objects outside the ID range.
- Validate asset/object relationships beyond the join.
- Update asset records.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Consistent object-to-asset references after backfill.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Field Service Asset (`customrecord_nx_asset`)
- Object (`customrecord_sna_objects`)

**Script Types:**
- [x] Map/Reduce - Backfill object fields
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Object | `custrecord_hul_nxcequipasset`
- Asset | `custrecord_sna_hul_nxcassetobject`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Objects within the specified ID range.

**Data Sources:**
- SuiteQL query on assets/objects.

**Data Retention:**
- Updates to object records only.

### Technical Constraints
- Hard‑coded object ID range (likely for testing).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Asset/object link must exist.

### Governance Considerations
- Map/Reduce handles batch updates.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Object records have the correct equipment asset ID populated.

**How we'll measure:**
- Spot checks on updated object records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_nxc_equipment_asset_on_object_mr.js | Map/Reduce | Backfill object equipment asset field | Implemented |

### Development Approach

**Phase 1:** Input data
- [x] Query asset/object pairs in ID range

**Phase 2:** Update
- [x] Submit asset ID to object field

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Objects in ID range update with equipment asset IDs.

**Edge Cases:**
1. No results in range; script completes without updates.

**Error Handling:**
1. submitFields errors logged.

### Test Data Requirements
- Asset/object pairs within the specified ID range.

### Sandbox Setup
- Ensure asset/object links exist in the test range.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to object records.

**Permissions required:**
- Edit access to `customrecord_sna_objects`
- View access to `customrecord_nx_asset`

### Data Security
- Updates only a single field on objects.

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

1. Remove or parameterize the ID range for production.
2. Upload `hul_populate_nxc_equipment_asset_on_object_mr.js`.
3. Create Map/Reduce script record.
4. Run in sandbox and validate updates.

### Post-Deployment

- [ ] Verify object records after run.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Revert object field values if needed.

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

- [ ] Should the object ID range be removed for production?
- [ ] Should the asset type filter be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| ID range left in place | Med | High | Parameterize before production |
| Incorrect asset-object mapping | Low | Med | Validate join and sample records |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_maintenance_info_on_field_service_asset_record_mr.md

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
