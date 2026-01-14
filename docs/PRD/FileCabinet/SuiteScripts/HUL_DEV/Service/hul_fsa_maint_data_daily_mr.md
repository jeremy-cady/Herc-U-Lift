# PRD: FSA Maintenance Data Daily (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-FSAMaintDataDailyMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fsa_maint_data_daily_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that updates Field Service Asset (FSA) maintenance summary fields by combining recently completed PM tasks and newly created future PM tasks.

**What problem does it solve?**
Keeps asset maintenance fields current with the latest completed and upcoming PM tasks, including meter readings and dates.

**Primary Goal:**
Populate PM/AN/CO maintenance fields on equipment assets from recent and future maintenance task activity.

---

## 2. Goals

1. Pull recently completed PM tasks from the last day.
2. Pull newly created future PM tasks from the last day.
3. Update asset maintenance fields based on revenue stream and task category.

---

## 3. User Stories

1. **As a** service user, **I want** maintenance fields updated daily **so that** asset records stay current.
2. **As an** admin, **I want** automated data synchronization **so that** manual updates are unnecessary.
3. **As a** developer, **I want** a structured MR **so that** logic scales to many assets.

---

## 4. Functional Requirements

### Core Functionality

1. The system must fetch recent completed PM tasks (last day) and find the next upcoming PM task per asset.
2. The system must fetch newly created future PM tasks (last day) and find the most recent completed task per asset.
3. The system must combine both result sets and map by equipment asset ID.
4. The system must update equipment asset fields based on:
   - Revenue stream: PM, AN, CO
   - Task category: CURRENT_TASK or FUTURE_TASK
5. The system must populate fields including:
   - Project, last task, next task
   - Last/next PM dates
   - Last maintenance hours
   - Current hours and current hours date
6. Errors must be logged without stopping the run.

### Acceptance Criteria

- [ ] Equipment assets receive updated PM/AN/CO maintenance fields.
- [ ] Both recent and future task data are used.
- [ ] Errors are logged without halting execution.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or update tasks.
- Update assets outside the PM/AN/CO streams.
- Backfill older historical data beyond the last day.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Asset records reflect up‑to‑date maintenance info.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Task
- Project (Job)
- Equipment Asset (`customrecord_nx_asset`)
- Maintenance Record (`customrecord_nxc_mr`)
- Hour Meter (`customrecord_sna_hul_hour_meter`)

**Script Types:**
- [x] Map/Reduce - Daily maintenance updates
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
- Task | `completeddate`, `startdate`, `supportcase`
- Maintenance | `custrecord_nxc_mr_field_222`
- Asset | PM/AN/CO maintenance summary fields (multiple)

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- PM-related tasks created or completed in the last day.

**Data Sources:**
- SuiteQL queries over tasks, jobs, assets, maintenance, and hour meter records.

**Data Retention:**
- Updates to asset records only.

### Technical Constraints
- SuiteQL queries include fixed revenue stream and project type lists.
- Task category labels: `COMPLETED_TASK` and `FUTURE_TASK`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Asset maintenance summary fields must exist.

### Governance Considerations
- Multiple SuiteQL queries per task in map stage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Asset maintenance fields align with latest completed and upcoming tasks.

**How we'll measure:**
- Spot checks on assets and maintenance dashboards.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_fsa_maint_data_daily_mr.js | Map/Reduce | Update asset maintenance fields daily | Implemented |

### Development Approach

**Phase 1:** Input data
- [x] Recent completed task query
- [x] Future task query

**Phase 2:** Updates
- [x] Populate PM/AN/CO maintenance fields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Completed PM task in last day updates last PM fields.
2. Future PM task created in last day updates next PM fields.

**Edge Cases:**
1. No recent/future tasks; MR completes with no updates.
2. Unknown revenue stream logs an error.

**Error Handling:**
1. submitFields failures logged in reduce.

### Test Data Requirements
- Tasks and projects in PM/AN/CO streams with recent dates.

### Sandbox Setup
- Ensure maintenance fields exist on asset record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to assets.

**Permissions required:**
- Edit on `customrecord_nx_asset`
- View on tasks, projects, and related records

### Data Security
- Updates maintenance summary fields only.

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

1. Upload `hul_fsa_maint_data_daily_mr.js`.
2. Create Map/Reduce script record.
3. Schedule or run daily as needed.

### Post-Deployment

- [ ] Verify asset maintenance fields.
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

- [ ] Should the lookback window be configurable?
- [ ] Should task category labels be normalized to CURRENT_TASK/FUTURE_TASK?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Heavy SuiteQL usage | Med | Med | Monitor performance |
| Revenue stream mapping changes | Med | Med | Parameterize mappings |

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
