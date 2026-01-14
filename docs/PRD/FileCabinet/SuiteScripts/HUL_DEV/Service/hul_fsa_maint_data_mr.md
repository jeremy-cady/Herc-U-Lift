# PRD: FSA Maintenance Data Backfill (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-FSAMaintDataMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_mr.js (Map/Reduce)
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_daily_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that backfills maintenance summary fields on Field Service Assets using the most recent and next upcoming PM tasks.

**What problem does it solve?**
Provides a full maintenance data sync across all eligible projects, not just recent changes.

**Primary Goal:**
Populate PM/AN/CO maintenance fields on equipment assets using a comprehensive SuiteQL query.

---

## 2. Goals

1. Query most recent completed and next upcoming tasks per project.
2. Pull maintenance record hours and latest hour meter reading.
3. Update asset maintenance summary fields by revenue stream.

---

## 3. User Stories

1. **As an** admin, **I want** a full backfill **so that** all assets are aligned.
2. **As a** service user, **I want** accurate maintenance fields **so that** scheduling is reliable.
3. **As a** developer, **I want** a single MR **so that** backfills are repeatable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run a SuiteQL query to gather:
   - Equipment asset and object IDs
   - Revenue stream and project type
   - Most recent completed task dates
   - Next upcoming task dates
   - Maintenance record hours
   - Latest hour meter readings
2. The system must convert date strings to valid date formats (MM/DD/YYYY) or null.
3. The map stage must group by equipment asset ID.
4. The reduce stage must update asset fields based on revenue stream:
   - PM → PM fields
   - AN → AN fields
   - CO → CO fields
5. Errors must be logged without stopping the run.

### Acceptance Criteria

- [ ] Assets receive updated maintenance fields across PM/AN/CO.
- [ ] Date fields are normalized or set to null when invalid.
- [ ] Errors are logged without halting execution.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Process revenue streams outside PM/AN/CO.
- Create or update tasks.
- Enforce real‑time updates (daily MR handles that).

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Accurate maintenance data across assets after a backfill.

### Design References
- Daily maintenance MR for incremental updates.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Project (Job)
- Task
- Equipment Asset (`customrecord_nx_asset`)
- Maintenance Record (`customrecord_nxc_mr`)
- Hour Meter (`customrecord_sna_hul_hour_meter`)

**Script Types:**
- [x] Map/Reduce - Maintenance backfill
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Project | `custentity_hul_nxc_eqiup_asset`
- Project | `custentity_hul_nxc_equip_object`
- Project | `cseg_sna_revenue_st`
- Project | `custentity_nx_project_type`
- Maintenance | `custrecord_nxc_mr_field_222`
- Asset | PM/AN/CO maintenance summary fields

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- All eligible projects in PM/AN/CO streams.

**Data Sources:**
- SuiteQL query over task, job, maintenance, and hour meter data.

**Data Retention:**
- Updates to asset records only.

### Technical Constraints
- Uses fixed revenue stream and project type lists.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Daily MR for incremental updates.

### Governance Considerations
- Large SuiteQL query and asset updates.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- All eligible assets show up-to-date maintenance summary fields.

**How we'll measure:**
- Spot checks and maintenance dashboards.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_fsa_maint_data_mr.js | Map/Reduce | Full maintenance data backfill | Implemented |

### Development Approach

**Phase 1:** Data selection
- [x] SuiteQL CTEs for recent/next tasks and readings

**Phase 2:** Updates
- [x] Map/reduce asset updates by revenue stream

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run MR and verify PM/AN/CO fields populate on assets.

**Edge Cases:**
1. Invalid date formats result in null values.
2. Assets with no tasks still process without errors.

**Error Handling:**
1. submitFields errors logged in reduce.

### Test Data Requirements
- Projects with completed and upcoming tasks.

### Sandbox Setup
- Ensure maintenance summary fields exist on assets.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to assets.

**Permissions required:**
- Edit on `customrecord_nx_asset`
- View on tasks, projects, maintenance, and hour meter records

### Data Security
- Updates maintenance fields only.

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

1. Upload `hul_fsa_maint_data_mr.js`.
2. Create Map/Reduce script record.
3. Run in sandbox and validate updates.

### Post-Deployment

- [ ] Confirm maintenance fields on assets.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Restore asset fields if needed.

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

- [ ] Should revenue stream lists be parameterized?
- [ ] Should date normalization use the format module?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large query runtime | Med | High | Run off-hours and monitor |
| Date parsing issues | Med | Med | Use format module or ISO |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_daily_mr.md

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
