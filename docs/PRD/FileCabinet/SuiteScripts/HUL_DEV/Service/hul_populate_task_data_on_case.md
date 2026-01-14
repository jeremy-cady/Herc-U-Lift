# PRD: Populate Task Data on Cases (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-PopulateTaskDataMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that backfills current and previous task details onto support cases of a specific category.

**What problem does it solve?**
Ensures case records have up‑to‑date task summary fields even if they were not populated at creation time.

**Primary Goal:**
Populate case task summary fields for category 4 cases using the latest two tasks.

---

## 2. Goals

1. Identify cases in category 4 with tasks.
2. Determine current and previous tasks per case.
3. Populate case task summary fields in bulk.

---

## 3. User Stories

1. **As a** service user, **I want** task summaries on cases **so that** I can review work history quickly.
2. **As an** admin, **I want** a batch backfill **so that** older cases are updated.
3. **As a** developer, **I want** the logic to pick current and previous tasks correctly **so that** the fields are reliable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query cases where:
   - `category = '4'`
   - `id > 1000000`
2. The system must identify the most recent task (`t1`) and previous task (`t2`) by task ID.
3. If no previous task exists, previous task fields must mirror current task fields.
4. The system must populate case fields:
   - Current task fields (`custevent_hul_current_task_*`)
   - Previous task fields (`custevent_hul_prev_task_*`)
5. Errors must be logged without stopping the run.

### Acceptance Criteria

- [ ] Category 4 cases receive current and previous task data.
- [ ] Cases with only one task copy current into previous fields.
- [ ] Errors are logged without halting execution.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update tasks themselves.
- Process cases outside category 4.
- Perform real‑time updates (handled by UEs/SS).

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Case task summary fields are available across older records.

### Design References
- Daily and UE task population scripts.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Task

**Script Types:**
- [x] Map/Reduce - Backfill case task fields
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_previous_task_number`
- Case | `custevent_hul_prev_task_start_date`
- Case | `custevent_hul_prev_task_date_completed`
- Case | `custevent_hul_prev_task_status`
- Case | `custevent_hul_prev_task_result`
- Case | `custevent_hul_prev_task_action_taken`
- Case | `custevent_hul_prev_task_internal_notes`
- Case | `custevent_hul_prev_task_tech_assigned`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Category 4 cases with tasks.

**Data Sources:**
- SuiteQL query on supportcase and task.

**Data Retention:**
- Updates to case records only.

### Technical Constraints
- Uses task ID ordering to determine current vs previous.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case task fields exist.

### Governance Considerations
- One submitFields per case.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case task summary fields are populated for targeted cases.

**How we'll measure:**
- Spot checks on case records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_task_data_on_case.js | Map/Reduce | Backfill case task summary fields | Implemented |

### Development Approach

**Phase 1:** Query
- [x] Identify current and previous tasks per case

**Phase 2:** Update
- [x] Submit current and previous task fields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Case with two tasks gets current and previous fields populated.
2. Case with one task copies current into previous.

**Edge Cases:**
1. No tasks found; case not updated.

**Error Handling:**
1. submitFields failures logged.

### Test Data Requirements
- Cases with varying numbers of tasks.

### Sandbox Setup
- Ensure category 4 cases exist with tasks.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to cases.

**Permissions required:**
- Edit access to support cases
- View access to tasks

### Data Security
- Updates only case fields.

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

1. Upload `hul_populate_task_data_on_case.js`.
2. Create Map/Reduce script record.
3. Run in sandbox and validate case updates.

### Post-Deployment

- [ ] Confirm case task summary fields are populated.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Revert case fields if needed.

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

- [ ] Should task ordering use dates instead of IDs?
- [ ] Should category ID be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Task ID ordering not chronological | Med | Med | Use dates if possible |
| Large case volume | Med | Med | Monitor MR usage |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_daily_ss.md
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.md

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
