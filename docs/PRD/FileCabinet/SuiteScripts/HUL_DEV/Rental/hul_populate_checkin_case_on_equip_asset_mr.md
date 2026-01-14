# PRD: Populate Most Recent Check-In Case on Assets (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-PopulateCheckinCaseMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that finds the most recent qualifying check‑in case for each equipment asset and writes it to the asset record.

**What problem does it solve?**
Automates population of the “most recent check‑in case” field on equipment assets without manual updates.

**Primary Goal:**
Set `custrecord_most_recent_checkin_case` on equipment assets based on latest matching support case.

---

## 2. Goals

1. Search equipment assets in a specified ID range.
2. Find the most recent qualifying case per asset.
3. Update the asset record with that case ID.

---

## 3. User Stories

1. **As a** rental user, **I want** assets to show the most recent check‑in case **so that** I can review last service quickly.
2. **As an** admin, **I want** a batch process **so that** assets are updated consistently.
3. **As a** developer, **I want** the logic to select the latest case **so that** the field stays accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search active equipment assets (`custrecord_nxc_na_asset_type = '2'`) within an ID range.
2. For each asset, the system must query support cases where:
   - `custevent_nx_case_type = '104'`
   - `status` in `('2','3','4','6')`
   - `custevent_nxc_case_assets` contains the asset ID
3. The system must select the most recent case by highest internal ID.
4. The system must update `custrecord_most_recent_checkin_case` on the asset record.
5. Errors must be logged without stopping the run.

### Acceptance Criteria

- [ ] Assets in the search range are processed.
- [ ] The latest qualifying case is identified per asset.
- [ ] Assets are updated with the case ID.
- [ ] Assets with no qualifying cases are skipped.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Process assets outside the defined ID range.
- Update case records.
- Provide a UI for execution.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Accurate “most recent check‑in case” field on assets.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Equipment Asset (`customrecord_nx_asset`)
- Support Case

**Script Types:**
- [x] Map/Reduce - Batch update of assets
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Asset | `custrecord_most_recent_checkin_case`
- Case | `custevent_nx_case_type`
- Case | `custevent_nxc_case_assets`

**Saved Searches:**
- None (search + SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Assets within the ID range.

**Data Sources:**
- Asset search and case SuiteQL query.

**Data Retention:**
- Updates to asset records only.

### Technical Constraints
- Asset search is limited by an internal ID range for testing.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case statuses and case type must be consistent.

### Governance Considerations
- SuiteQL per asset in map; may be heavy for large ranges.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Assets reflect the latest check‑in case.

**How we'll measure:**
- Spot checks on asset records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_checkin_case_on_equip_asset_mr.js | Map/Reduce | Set most recent check‑in case on assets | Implemented |

### Development Approach

**Phase 1:** Input
- [x] Search active equipment assets in range

**Phase 2:** Case lookup + update
- [x] SuiteQL for latest qualifying case
- [x] Update asset field

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Asset with qualifying cases updates to most recent case.

**Edge Cases:**
1. Asset with no qualifying cases is skipped.
2. Case field list contains multiple assets and still matches.

**Error Handling:**
1. Update failures are logged.

### Test Data Requirements
- Equipment assets with related check‑in cases.

### Sandbox Setup
- Ensure case type 104 and statuses 2/3/4/6 exist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to assets.

**Permissions required:**
- Edit on `customrecord_nx_asset`
- View on support cases

### Data Security
- Updates only a single field on assets.

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

1. Remove or expand the ID range filter for production.
2. Upload `hul_populate_checkin_case_on_equip_asset_mr.js`.
3. Create Map/Reduce script record.
4. Run in sandbox and validate updates.

### Post-Deployment

- [ ] Verify asset updates in production.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Clear or revert asset field values if needed.

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

- [ ] Should the asset ID range be removed for production?
- [ ] Should case selection be based on date instead of internal ID?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| ID range left in place | Med | High | Remove range filter before prod |
| Large asset counts | Med | Med | Batch or schedule during off-hours |

---

## 15. References & Resources

### Related PRDs
- None identified.

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
