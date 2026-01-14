# PRD: FSA Maintenance Data Nightly (Scheduled Script)

**PRD ID:** PRD-UNKNOWN-FSAMaintDataNightlySS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Draft
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_nightly_ss.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script intended to query maintenance‑related data nightly using a large SuiteQL statement.

**What problem does it solve?**
Appears to be a foundation for nightly maintenance data refresh, but the current implementation does not update records.

**Primary Goal:**
Run a nightly maintenance data query (implementation appears incomplete).

---

## 2. Goals

1. Execute the nightly maintenance SuiteQL query.
2. Collect results for future processing.
3. Log data for debugging.

---

## 3. User Stories

1. **As an** admin, **I want** nightly maintenance data processed **so that** assets stay current.
2. **As a** developer, **I want** a scheduled entry point **so that** I can extend it later.
3. **As a** support user, **I want** a nightly job **so that** maintenance data is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must execute a SuiteQL query that joins:
   - Recent completed tasks
   - Upcoming tasks
   - Case details
   - Equipment assets
   - Hour meter readings
   - Maintenance records
2. The system must page results with `runSuiteQLPaged`.
3. The system must log query results.
4. Errors must be logged without stopping the schedule.

### Acceptance Criteria

- [ ] Query executes successfully.
- [ ] Results are paged and logged.
- [ ] Script completes without crashing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update asset records (not implemented).
- Write output to files or custom records.
- Replace the Map/Reduce maintenance sync.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- No visible UI changes; back‑end job only.

### Design References
- FSA maintenance Map/Reduce scripts.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Task
- Support Case
- Project (Job)
- Equipment Asset (`customrecord_nx_asset`)
- Hour Meter (`customrecord_sna_hul_hour_meter`)
- Maintenance Record (`customrecord_nxc_mr`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Nightly query
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_nxc_equip_asset_hidden`
- Case | `cseg_sna_revenue_st`
- Project | `custentity_nx_project_type`
- Maintenance | `custrecord_nxc_mr_field_222`
- Hour Meter | `custrecord_sna_hul_actual_reading`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None (no outputs).

### Data Requirements

**Data Volume:**
- All maintenance‑related tasks/projects in PM/AN/CO streams.

**Data Sources:**
- SuiteQL query.

**Data Retention:**
- None.

### Technical Constraints
- Current script does not persist results.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Maintenance MRs for actual updates.

### Governance Considerations
- Potentially heavy SuiteQL query nightly.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Nightly query runs without errors.

**How we'll measure:**
- Script logs and execution status.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_fsa_maint_data_nightly_ss.js | Scheduled Script | Nightly maintenance query | Draft |

### Development Approach

**Phase 1:** Query execution
- [x] Build SuiteQL with required joins
- [x] Page and log results

**Phase 2:** (Future) Updates
- [ ] Apply results to assets

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run scheduled script and confirm it completes without error.

**Edge Cases:**
1. Query returns zero rows; script still completes.

**Error Handling:**
1. SuiteQL error logs and exits.

### Test Data Requirements
- Tasks/cases/projects with PM/AN/CO values.

### Sandbox Setup
- Ensure relevant records exist for query.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with view permissions on tasks/cases/assets.

**Permissions required:**
- View access to tasks, cases, projects, assets, hour meters, and maintenance records.

### Data Security
- Read-only query; no updates.

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

1. Upload `hul_fsa_maint_data_nightly_ss.js`.
2. Create Scheduled Script record.
3. Schedule nightly execution.

### Post-Deployment

- [ ] Confirm job runs nightly.
- [ ] Update PRD status when update logic is added.

### Rollback Plan

**If deployment fails:**
1. Disable the Scheduled Script deployment.

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

- [ ] Should this script be replaced by the MR jobs?
- [ ] Should query results be persisted somewhere?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Heavy query runtime | Med | Med | Schedule off-hours |
| No updates applied | High | Med | Implement update logic or retire script |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_daily_mr.md
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_mr.md

### NetSuite Documentation
- SuiteScript 2.x Scheduled Script
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
