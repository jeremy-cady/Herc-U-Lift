# PRD: Fixed Asset Location Mass Update

**PRD ID:** PRD-UNKNOWN-MassUpdateFALoc
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_massupdatefaloc.js (Map/Reduce)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Map/Reduce script that updates fixed asset locations to match the owning location code on related object records.

**What problem does it solve?**
Ensures fixed asset location values stay aligned with object owning locations.

**Primary Goal:**
Update fixed asset `custrecord_assetlocation` based on object owning location code.

---

## 2. Goals

1. Load fixed assets with associated objects and owning location codes.
2. Update fixed asset location fields in bulk.

---

## 3. User Stories

1. **As a** finance user, **I want to** align asset locations with object locations **so that** reporting remains accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load input data from `customsearch_sna_hul_assetlocmatch`.
2. For each result, the script must set `custrecord_assetlocation` on `customrecord_ncfar_asset` to the object owning location.
3. The script must log errors and summarize stage results.

### Acceptance Criteria

- [ ] Fixed assets are updated with correct location values from objects.
- [ ] Errors are logged in summarize stage.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update objects or other asset fields.
- Create new assets.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Bulk update runs via Map/Reduce.

### Design References
- Saved search: `customsearch_sna_hul_assetlocmatch`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_ncfar_asset
- customrecord_sna_objects

**Script Types:**
- [x] Map/Reduce - Update asset locations
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_ncfar_asset | custrecord_assetlocation | Asset location
- customrecord_ncfar_asset | custrecord_sna_object | Object reference
- customrecord_sna_objects | custrecord_sna_owning_loc_code | Owning location code

**Saved Searches:**
- `customsearch_sna_hul_assetlocmatch`

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One asset update per search result.

**Data Sources:**
- Fixed asset and object records.

**Data Retention:**
- Updates fixed asset locations.

### Technical Constraints
- Input and output governed by the saved search results.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Saved search configuration

### Governance Considerations

- **Script governance:** submitFields per asset record.
- **Search governance:** Based on saved search.
- **API limits:** Moderate for large asset sets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Fixed assets reflect the owning location code from their objects.

**How we'll measure:**
- Compare asset location fields to object owning locations after run.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_massupdatefaloc.js | Map/Reduce | Update asset locations | Implemented |

### Development Approach

**Phase 1:** Input validation
- [ ] Validate saved search results

**Phase 2:** Updates
- [ ] Validate asset location updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run script and verify asset location updates.

**Edge Cases:**
1. Missing object or location values skip updates.

**Error Handling:**
1. Reduce stage errors logged in summarize.

### Test Data Requirements
- Fixed assets linked to objects with owning location codes

### Sandbox Setup
- Run Map/Reduce in sandbox with saved search populated.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance and admin roles

**Permissions required:**
- Edit fixed assets
- View object records

### Data Security
- Asset location updates restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm saved search `customsearch_sna_hul_assetlocmatch`

### Deployment Steps

1. Deploy Map/Reduce script.
2. Execute against test dataset.

### Post-Deployment

- [ ] Review logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable Map/Reduce deployment.
2. Revert asset locations manually if needed.

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

- [ ] Should the script also update inactive assets?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Saved search criteria drift from data model | Low | Med | Review search filters periodically |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
