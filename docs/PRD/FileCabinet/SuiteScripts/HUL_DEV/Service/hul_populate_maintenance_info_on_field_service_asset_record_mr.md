# PRD: Populate Maintenance Info on FSA Records (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-FSAMaintInfoMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Draft
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_maintenance_info_on_field_service_asset_record_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that populates maintenance summary fields on Field Service Asset records by stitching together project, case, task, maintenance record, meter, and site data.

**What problem does it solve?**
Centralizes maintenance data on FSA records so service teams can view last PM, hours, and site metadata in one place.

**Primary Goal:**
Populate FSA maintenance fields using related PM project and task data.

---

## 2. Goals

1. Identify objects tied to equipment assets.
2. Resolve the related FSA and PM project chain.
3. Populate maintenance summary fields on the FSA.

---

## 3. User Stories

1. **As a** service user, **I want** FSA records updated with PM data **so that** I can review maintenance quickly.
2. **As an** admin, **I want** a batch job **so that** multiple assets are updated at once.
3. **As a** developer, **I want** the script to derive related records **so that** manual linking is unnecessary.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query object IDs linked to equipment assets (`custrecord_nxc_na_asset_type = '2'`).
2. The system must map each object to its FSA record.
3. The system must find PM projects for the asset (project types 4/5/6/7/8/10/12/13/14/15).
4. The system must find the most recent maintenance case and task for those projects.
5. The system must retrieve maintenance record hours and date.
6. The system must retrieve the latest hour meter reading for the object.
7. The system must retrieve warranty expiration date and site ZIP code.
8. The system must update FSA fields:
   - Current PM project/case/task
   - Last PM hours/date
   - Current hours and reading date
   - Current hours record ID
   - Site ZIP and warranty end date
9. Errors must be logged without stopping the run.

### Acceptance Criteria

- [ ] FSA records are updated with maintenance data when related records exist.
- [ ] Assets without related data are skipped gracefully.
- [ ] Errors are logged without halting execution.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update non‑equipment assets.
- Create maintenance records or tasks.
- Enforce real‑time updates (handled elsewhere).

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- FSA records show consolidated maintenance data.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Object (`customrecord_sna_objects`)
- Field Service Asset (`customrecord_nx_asset`)
- Project (Job)
- Support Case
- Task
- Maintenance Record (`customrecord_nxc_mr`)
- Hour Meter (`customrecord_sna_hul_hour_meter`)

**Script Types:**
- [x] Map/Reduce - Batch maintenance population
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Object | `custrecord_sna_hul_nxcassetobject`
- Asset | `custrecord_hul_current_pm_project`
- Asset | `custrecord_hul_current_pm_case`
- Asset | `custrecord_hul_recent_pm_task`
- Asset | `custrecord_hul_recent_pm_maint_rec`
- Asset | `custrecord_hul_last_serviced_hours`
- Asset | `custrecord_hul_last_pm_date`
- Asset | `custrecord_hul_current_hours`
- Asset | `custrecord_hul_current_hrs_read_date`
- Asset | `custrecord_hul_current_hours_record`
- Asset | `custrecord_hul_pm_zip`
- Asset | `custrecord_hul_warranty_end_date`

**Saved Searches:**
- None (SuiteQL and searches used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Equipment assets linked to objects.

**Data Sources:**
- SuiteQL queries and searches across assets, projects, cases, tasks, and meters.

**Data Retention:**
- Updates to asset records only.

### Technical Constraints
- Script currently filters to two object IDs in map (`1253185376`, `1253199340`), suggesting test scope.
- Some queries include hard‑coded IDs (e.g., maintenance record asset `80532`, hour meter object `1253199340`).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Related record relationships must exist.

### Governance Considerations
- Multiple SuiteQL queries per asset; may be heavy at scale.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- FSA records contain up-to-date PM and meter data.

**How we'll measure:**
- Spot checks on FSA records and maintenance reports.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_maintenance_info_on_field_service_asset_record_mr.js | Map/Reduce | Populate FSA maintenance fields | Draft |

### Development Approach

**Phase 1:** Data gathering
- [x] Find related project/case/task/maintenance data

**Phase 2:** Updates
- [x] Update FSA maintenance summary fields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Target object IDs return related records and update FSA fields.

**Edge Cases:**
1. Missing related records results in no updates.
2. SuiteQL errors logged without halting.

**Error Handling:**
1. submitFields errors logged in reduce.

### Test Data Requirements
- Equipment assets with PM projects, cases, tasks, and meter readings.

### Sandbox Setup
- Validate relationships for the test object IDs in the script.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to FSAs.

**Permissions required:**
- Edit access to `customrecord_nx_asset`
- View access to related records

### Data Security
- Updates only maintenance fields on assets.

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

1. Remove test object filters and hard‑coded IDs if moving to production.
2. Upload `hul_populate_maintenance_info_on_field_service_asset_record_mr.js`.
3. Create Map/Reduce script record.
4. Run in sandbox and validate updates.

### Post-Deployment

- [ ] Verify FSA fields populate correctly.
- [ ] Update PRD status to "Implemented" after production hardening.

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Restore FSA fields if needed.

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

- [ ] Should hard-coded IDs be removed or parameterized?
- [ ] Should the script handle all assets instead of two test IDs?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hard-coded IDs left in place | High | High | Parameterize before production |
| Heavy query load | Med | Med | Batch and optimize queries |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_mr.md

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
