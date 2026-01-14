# PRD: Populate Latest Task Data on Cases (Daily Scheduled)

**PRD ID:** PRD-UNKNOWN-PopulateTaskDataDailySS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_daily_ss.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script that backfills current and previous task details onto support cases using the two most recent tasks per case.

**What problem does it solve?**
Ensures case records reflect task history even when task data wasn’t populated at the time of creation.

**Primary Goal:**
Populate case fields for current and previous task metadata using the latest two tasks by ID.

---

## 2. Goals

1. Identify cases missing `custevent_hul_current_task_number`.
2. Pull the most recent and previous tasks for each case.
3. Update task detail fields on the case.

---

## 3. User Stories

1. **As a** service user, **I want** case task history visible **so that** I can review recent work.
2. **As an** admin, **I want** a daily backfill **so that** missing data is corrected.
3. **As a** developer, **I want** the script to normalize tech assignments **so that** inactive techs are excluded.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query cases where `custevent_hul_current_task_number` is null.
2. The system must join the latest two tasks per case using row-number ordering by task ID.
3. The system must populate current task fields:
   - `custevent_hul_current_task_number`
   - `custevent_hul_current_start_date`
   - `custevent_current_task_date_completed`
   - `custevent_hul_current_task_status`
   - `custevent_hul_current_task_result`
   - `custevent_hul_curr_task_action_taken`
   - `custevent_hul_curr_task_internal_notes`
   - `custevent_hul_curr_task_tech_assigned`
4. The system must populate previous task fields:
   - `custevent_hul_previous_task_number`
   - `custevent_hul_prev_task_start_date`
   - `custevent_hul_prev_task_date_completed`
   - `custevent_hul_prev_task_status`
   - `custevent_hul_prev_task_result`
   - `custevent_hul_prev_task_action_taken`
   - `custevent_hul_prev_task_internal_notes`
   - `custevent_hul_prev_task_tech_assigned`
5. The system must validate assigned technicians:
   - If a tech is inactive, clear the assignment field.
6. Errors must be logged without stopping the run.

### Acceptance Criteria

- [ ] Cases missing current task numbers are updated with latest task data.
- [ ] Previous task fields are populated when available.
- [ ] Inactive technicians are cleared.
- [ ] Errors are logged without halting the script.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update cases that already have current task data.
- Modify task records.
- Enforce real‑time updates (handled by UEs/SS).

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Case task history appears consistently after nightly backfill.

### Design References
- Task-to-case population scripts.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Task
- Employee

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Daily backfill
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
- Employee lookups to determine active/inactive status.

### Data Requirements

**Data Volume:**
- Cases missing current task data.

**Data Sources:**
- SuiteQL results and employee lookups.

**Data Retention:**
- Updates to case fields only.

### Technical Constraints
- Uses task ID ordering to infer “current” and “previous” tasks.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Task-to-case relationships must exist.

### Governance Considerations
- SuiteQL query plus employee lookups per case.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case task fields are populated daily for missing records.

**How we'll measure:**
- Case field spot checks and reduced null values.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_new_task_data_on_case_daily_ss.js | Scheduled Script | Backfill current/previous task data | Implemented |

### Development Approach

**Phase 1:** Query
- [x] SuiteQL to find cases and latest tasks

**Phase 2:** Update
- [x] Submit case field updates and validate techs

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Case without current task fields receives updates.

**Edge Cases:**
1. No tasks found; case not updated.
2. Assigned tech inactive; assignment cleared.

**Error Handling:**
1. submitFields errors logged.

### Test Data Requirements
- Cases with and without tasks.

### Sandbox Setup
- Ensure tasks and employees exist with active/inactive statuses.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to cases.

**Permissions required:**
- Edit access to support cases
- View access to tasks and employees

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

1. Upload `hul_populate_new_task_data_on_case_daily_ss.js`.
2. Create Scheduled Script record.
3. Schedule daily execution.

### Post-Deployment

- [ ] Verify case fields populate after job runs.
- [ ] Update PRD status to "Implemented".

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

- [ ] Should task ordering use completed date instead of ID?
- [ ] Should this logic move to a Map/Reduce for scale?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Task ID ordering not chronological | Med | Med | Use dates if possible |
| High case volume | Med | Med | Monitor runtime and consider MR |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.md

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
