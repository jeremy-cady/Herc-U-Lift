# PRD: Populate Task Data on Case When Assigned (Scheduled Script)

**PRD ID:** PRD-UNKNOWN-PopTaskDataOnAssignSS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case_when_task_is_assigned_ss.js (Scheduled Script)
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case_when_assigned_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: `customscript_hul_pop_task_on_case_assign`
- Deployment ID: `customdeploy_hul_pop_task_on_case_assign`

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script that detects recent task assignment changes and updates task summary fields on the related case.

**What problem does it solve?**
Keeps case task fields updated when a technician is assigned, using system notes to detect recent changes.

**Primary Goal:**
Backfill current task summary fields on cases when assignment changes occur.

---

## 2. Goals

1. Detect recent task assignment changes.
2. Update case fields with the latest task data.
3. Reschedule itself for near‑continuous monitoring.

---

## 3. User Stories

1. **As a** dispatcher, **I want** case task fields updated on assignment **so that** case data reflects the latest tech.
2. **As an** admin, **I want** automated assignment updates **so that** case fields are consistent.
3. **As a** developer, **I want** a scheduled polling approach **so that** task assignments are captured regularly.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query tasks with recent system note changes in the last 4 minutes where:
   - `sn.field` includes `EVENT.KASSIGNED`
   - `sn.type` in (2, 4)
2. The system must map task data including case ID, status, dates, notes, and assigned tech.
3. The system must update the case fields:
   - `custevent_hul_current_start_date`
   - `custevent_current_task_date_completed`
   - `custevent_hul_current_task_status`
   - `custevent_hul_current_task_result`
   - `custevent_hul_curr_task_action_taken`
   - `custevent_hul_curr_task_internal_notes`
   - `custevent_hul_curr_task_tech_assigned`
   - `custevent_hul_is_assigned = true`
4. The system must skip records without a valid case ID.
5. The script must pause for ~4 minutes and reschedule itself.
6. Errors must be logged and rescheduling must still occur.

### Acceptance Criteria

- [ ] Recent assignment changes update case fields.
- [ ] Cases without IDs are skipped.
- [ ] Script reschedules after each run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update tasks.
- Run in real time (uses scheduled polling).
- Process non‑assignment changes.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Case assignment data stays up to date with minimal delay.

### Design References
- Task assignment UE stub.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Task
- Support Case
- System Note

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Polling assignment changes
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_is_assigned`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Tasks with assignment changes in the last 4 minutes.

**Data Sources:**
- SuiteQL query over task + systemnote + supportcase.

**Data Retention:**
- Updates to case fields only.

### Technical Constraints
- Busy‑wait loop is used to delay reschedule (governance heavy).
- Script reschedules itself every ~4 minutes.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case fields must exist.

### Governance Considerations
- Busy‑wait may consume governance/time; consider `task.submit` scheduling without loop.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Assigned technician data appears on cases shortly after assignment.

**How we'll measure:**
- Case field spot checks and script logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_task_data_on_case_when_task_is_assigned_ss.js | Scheduled Script | Update case fields on assignment | Implemented |

### Development Approach

**Phase 1:** Query recent assignments
- [x] SuiteQL filter by system notes

**Phase 2:** Update cases
- [x] submitFields updates

**Phase 3:** Reschedule
- [x] Loop delay and resubmit scheduled script

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Assign a tech to a task; case fields update within the polling window.

**Edge Cases:**
1. Task with no case ID is skipped.
2. Multiple assignments in 4 minutes are processed.

**Error Handling:**
1. Query errors logged and rescheduling still occurs.

### Test Data Requirements
- Tasks with assignment changes and linked cases.

### Sandbox Setup
- Ensure system notes capture assignment changes.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to cases.

**Permissions required:**
- View access to tasks and system notes
- Edit access to support cases

### Data Security
- Updates only case summary fields.

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

1. Upload `hul_populate_task_data_on_case_when_task_is_assigned_ss.js`.
2. Create Scheduled Script record with IDs above.
3. Run and verify auto‑rescheduling.

### Post-Deployment

- [ ] Confirm case fields update for assignment changes.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the scheduled script deployment.

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

- [ ] Should this be rewritten as a Map/Reduce or use a scheduled interval without busy‑wait?
- [ ] Should assignment changes be handled by User Event instead?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Busy‑wait loop consumes governance | High | Med | Replace with proper scheduling |
| Missed assignments outside window | Med | Low | Increase window or schedule frequency |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case_when_assigned_ue.md

### NetSuite Documentation
- SuiteScript 2.x Scheduled Script
- System Note records

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
