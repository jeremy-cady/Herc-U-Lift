# PRD: Update Asset Check-In Case on Case Save (User Event)

**PRD ID:** PRD-UNKNOWN-PopulateCheckinCaseUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that updates equipment asset records with the most recent check‑in case when qualifying support cases are created or edited.

**What problem does it solve?**
Keeps asset records synced in real time with the latest check‑in case data without waiting for a batch job.

**Primary Goal:**
Write the current case ID to `custrecord_most_recent_checkin_case` on related equipment assets when the case meets criteria.

---

## 2. Goals

1. Run on create and edit of support cases.
2. Filter to qualifying case type and status.
3. Update related equipment assets immediately.

---

## 3. User Stories

1. **As a** rental user, **I want** assets updated when cases change **so that** check‑in data is current.
2. **As an** admin, **I want** automated asset updates **so that** no manual maintenance is needed.
3. **As a** support user, **I want** only qualifying cases to update assets **so that** irrelevant cases are ignored.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `afterSubmit` for `CREATE` and `EDIT`.
2. The system must check case type `custevent_nx_case_type` equals `104`.
3. The system must check case status is one of: `2`, `3`, `4`, `6`.
4. The system must read `custevent_nxc_case_assets` and handle:
   - Single asset ID
   - Multiple asset IDs (array)
5. For each asset, the system must update `custrecord_most_recent_checkin_case` with the case ID.
6. Errors on individual asset updates must be logged without stopping the script.

### Acceptance Criteria

- [ ] Qualifying cases update related assets.
- [ ] Non-qualifying cases are ignored.
- [ ] Multiple assets are updated when present.
- [ ] Errors are logged per asset without stopping processing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update case records.
- Run for non‑qualifying case types or statuses.
- Backfill older cases (handled by MR).

---

## 6. Design Considerations

### User Interface
- None (server-side update).

### User Experience
- Real-time asset updates for check‑in cases.

### Design References
- Map/Reduce backfill script for historical updates.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Equipment Asset (`customrecord_nx_asset`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Update assets on case save
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_nx_case_type`
- Case | `custevent_nxc_case_assets`
- Asset | `custrecord_most_recent_checkin_case`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single case per trigger.

**Data Sources:**
- Case fields and asset records.

**Data Retention:**
- Updates only asset records.

### Technical Constraints
- Assumes case status values are correct (2/3/4/6).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Map/Reduce script can be used for backfill.

### Governance Considerations
- submitFields per asset ID.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Assets show the most recent check‑in case immediately after case creation/edit.

**How we'll measure:**
- Spot checks on asset records after case updates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_checkin_case_on_equip_asset_ue.js | User Event | Update assets with check‑in case | Implemented |

### Development Approach

**Phase 1:** Filters
- [x] Case type and status checks

**Phase 2:** Asset updates
- [x] Update asset fields for all linked assets

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a case of type 104 with status 2 and linked assets; assets update.
2. Edit the case and confirm assets update again.

**Edge Cases:**
1. Case has no linked assets; script exits.
2. Case status not in allowed list; script exits.
3. Asset update fails for one asset; others continue.

**Error Handling:**
1. Errors are logged with asset ID and message.

### Test Data Requirements
- Case with `custevent_nxc_case_assets` populated.

### Sandbox Setup
- Ensure asset records and case type/status values exist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles creating/editing cases (script deployment role).

**Permissions required:**
- Edit access to `customrecord_nx_asset`
- View/Edit access to support cases

### Data Security
- Updates only the asset check‑in case reference.

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

1. Upload `hul_populate_checkin_case_on_equip_asset_ue.js`.
2. Deploy as a User Event on support case record.
3. Validate with a test case.

### Post-Deployment

- [ ] Confirm assets update on case create/edit.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should case type/status values be configurable?
- [ ] Should updates occur only on create (not edit)?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Case status IDs change | Med | Med | Centralize config |
| Many linked assets | Low | Med | Monitor governance usage |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_mr.md

### NetSuite Documentation
- SuiteScript 2.x User Event
- record.submitFields API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
