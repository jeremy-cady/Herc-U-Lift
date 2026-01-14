# PRD: Populate Field Service Asset on Objects (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-PopulateFSAOnObjectsMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_populate_fsa_on_object_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce that backfills the Field Service Asset (FSA) link onto object records by scanning FSA assets and applying the related object reference.

**What problem does it solve?**
Objects need a reliable reference to their associated FSA asset; this script populates that field in bulk.

**Primary Goal:**
Populate `custrecord_hul_field_service_asset` on object records from FSA assets of type 2.

---

## 2. Goals

1. Gather all FSA assets of type 2.
2. Resolve each asset to its related object record.
3. Write the FSA reference onto the object record.

---

## 3. User Stories

1. **As an** admin, **I want to** backfill FSA references on objects **so that** object records are properly linked.
2. **As a** support user, **I want to** see the correct FSA on an object **so that** I can navigate between records.
3. **As an** operator, **I want** bulk processing **so that** updates complete without manual edits.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query `customrecord_nx_asset` where `custrecord_nxc_na_asset_type = '2'`.
2. The system must return an array of FSA asset IDs for processing.
3. For each FSA asset, the system must look up its related object record via `custrecord_sna_hul_nxcassetobject`.
4. The system must update the related object record, setting `custrecord_hul_field_service_asset` to the FSA ID.
5. Updates must use `submitFields` with `ignoreMandatoryFields` enabled.

### Acceptance Criteria

- [ ] Only FSA assets of type 2 are processed.
- [ ] Each FSA with a related object updates that object successfully.
- [ ] Objects are updated with `custrecord_hul_field_service_asset`.
- [ ] Errors are logged for failed lookups or updates.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or modify FSA assets.
- Create or modify object records beyond the FSA link.
- Provide a user interface.

---

## 6. Design Considerations

### User Interface
- None.

### User Experience
- Background update only; no end-user interaction.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Field Service Asset (`customrecord_nx_asset`)
- Object (`customrecord_sna_objects`)

**Script Types:**
- [x] Map/Reduce - Bulk population of FSA references
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Field Service Asset | `custrecord_nxc_na_asset_type` | Filter to type 2 assets
- Field Service Asset | `custrecord_sna_hul_nxcassetobject` | Related object link
- Object | `custrecord_hul_field_service_asset` | Target FSA reference

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None (standalone batch process).

### Data Requirements

**Data Volume:**
- All FSA assets with type 2.

**Data Sources:**
- `customrecord_nx_asset` and `customrecord_sna_objects` via SuiteQL.

**Data Retention:**
- Updated field values on object records only.

### Technical Constraints
- Requires valid object linkage on the asset record.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Map/Reduce paging used to limit SuiteQL result sets (page size 1000).

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Object records show the correct FSA in `custrecord_hul_field_service_asset`.
- The Map/Reduce completes without excessive errors.

**How we'll measure:**
- Spot checks on object records and script logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_fsa_on_object_mr.js | Map/Reduce | Populate FSA on object records | Implemented |

### Development Approach

**Phase 1:** Input + lookup
- [x] Query FSA assets of type 2
- [x] Resolve related object IDs

**Phase 2:** Update
- [x] Submit FSA field update to object record

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Asset of type 2 with a valid object link updates the object FSA field.
2. Multiple assets process in a single run.

**Edge Cases:**
1. Asset with no related object link is skipped or logs an error.
2. Object record is inactive or inaccessible.
3. Duplicate assets referencing the same object.

**Error Handling:**
1. SuiteQL query failure logs an error in `getInputData`.
2. `submitFields` failure logs an error in `setFSAOnObjectRecord`.

### Test Data Requirements
- Sample FSA assets of type 2 with and without object links.

### Sandbox Setup
- Ensure object records exist and are linked to FSA assets.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script execution role with edit access to object records.

**Permissions required:**
- Edit permission for `customrecord_sna_objects`.
- View permission for `customrecord_nx_asset`.

### Data Security
- No sensitive data stored; updates are limited to reference fields.

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

1. Upload `hul_populate_fsa_on_object_mr.js` to FileCabinet.
2. Create Map/Reduce script record.
3. Configure deployment parameters (if any).
4. Execute in sandbox with sample data.
5. Deploy to production and run.

### Post-Deployment

- [ ] Verify object records have FSA populated.
- [ ] Monitor logs for errors.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Revert object field changes if needed.

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

- [ ] Should assets without an object link be reported or tracked separately?
- [ ] Should this script run on a schedule or be one-time only?
- [ ] Is the asset type filter (`'2'`) always the correct definition of FSA?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing object links | Med | Med | Log and review exceptions |
| Incorrect asset type filter | Low | High | Validate against business rules |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce Script
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
