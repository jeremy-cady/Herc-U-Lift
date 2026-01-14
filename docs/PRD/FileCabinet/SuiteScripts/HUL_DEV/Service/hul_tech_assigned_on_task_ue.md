# PRD: Sync Case Task Assignee on Task Edit (User Event)

**PRD ID:** PRD-UNKNOWN-TechAssignedOnTaskUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_tech_assigned_on_task_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that keeps case task summary fields in sync when a task is created or its assignee changes.

**What problem does it solve?**
Ensures cases reflect the latest task technician and related task details, including backfilling in edit scenarios.

**Primary Goal:**
Update current/previous task fields on the case when a task is created or (re)assigned.

---

## 2. Goals

1. Capture assignee changes on task edit.
2. Backfill case task fields when they are blank.
3. Preserve prior case task details by shifting them into previous fields.

---

## 3. User Stories

1. **As a** service coordinator, **I want** case task summaries updated when a task is assigned **so that** I can see the current technician.
2. **As an** admin, **I want** automatic backfills on edit **so that** missing case data is corrected.
3. **As a** dispatcher, **I want** previous task details preserved **so that** history remains visible.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on task `beforeSubmit` for `EDIT` and `XEDIT`.
2. The system must run on task `afterSubmit` for `CREATE`, and for `EDIT`/`XEDIT` only when the case is missing the current tech.
3. The system must read task fields:
   - `supportcase`, `assigned`, `status`
   - `custevent_nx_end_date`, `custevent_nxc_task_result`
   - `custevent_nxc_internal_note`, `custevent_nx_actions_taken`
4. The system must read case task fields for current and previous values using `lookupFields`.
5. If the assignee changes or the case has no current tech assigned, the system must write task values into current case fields.
6. The system must shift existing current case task values into previous fields before writing new current values.
7. On XEDIT where `assigned` may be missing from the new record, the system must look up the assignee from the task record.
8. Errors must be logged without blocking task updates.

### Acceptance Criteria

- [ ] Task create updates case current task fields.
- [ ] Task assignee change updates case current task fields and shifts previous values.
- [ ] XEDIT backfill works when case current tech is blank.
- [ ] No updates occur when there is no linked case or no resolved assignee.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update task records.
- Validate case category or status.
- Handle client-side UI behavior.

---

## 6. Design Considerations

### User Interface
- None (server-side update).

### User Experience
- Case task summary fields stay current without manual edits.

### Design References
- Related case task population scripts in Service.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Task
- Support Case

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Task create/edit handler
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_previous_task_number`
- Case | `custevent_hul_prev_task_tech_assigned`
- Case | `custevent_hul_previous_start_date`
- Case | `custevent_hul_prev_task_date_completed`
- Case | `custevent_hul_prev_task_status`
- Case | `custevent_hul_prev_task_result`
- Case | `custevent_hul_prev_task_action_taken`
- Case | `custevent_hul_prev_task_internal_notes`

**Saved Searches:**
- None (lookupFields used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per task create or edit.

**Data Sources:**
- Task record fields and case lookup.

**Data Retention:**
- Updates case summary fields only.

### Technical Constraints
- XEDIT may omit non-changed fields; assignee is retrieved by lookup when missing.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case task summary fields must exist.

### Governance Considerations
- Two lookupFields calls and one submitFields per qualifying event.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case current task technician always matches the latest assigned task.

**How we'll measure:**
- Spot checks after task create and assignee edits.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_tech_assigned_on_task_ue.js | User Event | Sync case current/previous task fields | Implemented |

### Development Approach

**Phase 1:** Capture assignee and case data
- [x] Read task data and lookup case fields

**Phase 2:** Update case values
- [x] Shift previous values and write new current values

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a task with a linked case; case current task fields populate.
2. Edit task assignee; case current fields update and previous fields shift.

**Edge Cases:**
1. XEDIT assigned change where newRecord omits `assigned`; lookup fills assignee.
2. Case has current tech blank; backfill on edit.
3. Task has no supportcase; script skips.

**Error Handling:**
1. lookupFields or submitFields errors are logged without blocking updates.

### Test Data Requirements
- Tasks linked to cases with and without existing task summary fields.

### Sandbox Setup
- Ensure task-to-case fields exist and are viewable by the script role.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to cases.

**Permissions required:**
- Edit support cases
- View tasks

### Data Security
- Updates only case fields; no sensitive data written.

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

1. Upload `hul_tech_assigned_on_task_ue.js`.
2. Deploy as User Event on the task record.
3. Validate case updates on task create and assignee edit.

### Post-Deployment

- [ ] Verify case task fields update on create/edit.
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

- [ ] Should this run only for specific task statuses?
- [ ] Should previous task shifting be limited to one level?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| High task edit volume | Med | Med | Monitor UE performance |
| Assignee lookup failure | Low | Med | Log errors and verify assignments |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_on_case_when_created_ue.md
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case_when_assigned_ue.md

### NetSuite Documentation
- SuiteScript 2.x User Event
- search.lookupFields API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
