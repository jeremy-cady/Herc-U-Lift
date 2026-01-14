# PRD: Populate Case Task Fields on Task Create (User Event)

**PRD ID:** PRD-UNKNOWN-PopulateTaskOnCreateUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_on_case_when_created_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that updates current/previous task summary fields on a case when a new task is created.

**What problem does it solve?**
Ensures case task summary fields stay current with newly created tasks.

**Primary Goal:**
On task create, shift existing case task data to previous fields and write new task data to current fields.

---

## 2. Goals

1. Detect new task creation.
2. Read existing task summary fields from the case.
3. Update case current/previous task fields appropriately.

---

## 3. User Stories

1. **As a** service user, **I want** new tasks reflected on cases **so that** task summaries stay current.
2. **As an** admin, **I want** automatic updates **so that** users don’t edit cases manually.
3. **As a** developer, **I want** consistent shifting logic **so that** previous/current fields remain ordered.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `afterSubmit` for `CREATE`.
2. The system must read task fields:
   - `supportcase`, `id`, `custevent_nx_start_date`, `custevent_nx_end_date`
   - `custevent_nxc_task_result`, `status`, `custevent_nxc_internal_note`
   - `custevent_nx_actions_taken`, `assigned`
3. The system must lookup case fields for current/previous task data.
4. If both current and previous task IDs are blank, the system must populate only current fields.
5. If current is set and previous is blank, the system must:
   - Move current values into previous fields
   - Set new task values into current fields
6. If both current and previous are set, the system must:
   - Shift current values into previous fields
   - Set new task values into current fields
7. Errors must be logged without blocking task creation.

### Acceptance Criteria

- [ ] New task creation updates current fields on the case.
- [ ] Existing current data shifts to previous fields.
- [ ] Errors are logged and do not block creation.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle task edits (handled by other scripts).
- Update task records.
- Validate case type.

---

## 6. Design Considerations

### User Interface
- None (server-side update).

### User Experience
- Cases immediately show latest task data after creation.

### Design References
- Task-to-case population scripts.

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
- [x] User Event - Task create handler
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_current_start_date`
- Case | `custevent_current_task_date_completed`
- Case | `custevent_hul_current_task_result`
- Case | `custevent_hul_current_task_status`
- Case | `custevent_hul_curr_task_internal_notes`
- Case | `custevent_hul_curr_task_action_taken`
- Case | `custevent_hul_curr_task_tech_assigned`
- Case | `custevent_hul_previous_task_number`
- Case | `custevent_hul_prev_task_date_completed`
- Case | `custevent_hul_prev_task_result`
- Case | `custevent_hul_prev_task_status`
- Case | `custevent_hul_prev_task_internal_notes`
- Case | `custevent_hul_prev_task_action_taken`
- Case | `custevent_hul_prev_task_tech_assigned`

**Saved Searches:**
- None (lookupFields used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per task creation.

**Data Sources:**
- Task record fields and case lookup.

**Data Retention:**
- Updates to case fields only.

### Technical Constraints
- Uses lookupFields arrays for list fields; handles undefined values.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case task fields must exist.

### Governance Considerations
- Case lookup and submitFields per task.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case task summary fields reflect the latest created task.

**How we'll measure:**
- Spot checks on cases after task creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_task_on_case_when_created_ue.js | User Event | Update case on task create | Implemented |

### Development Approach

**Phase 1:** Gather data
- [x] Read task data and existing case fields

**Phase 2:** Shift and update
- [x] Move current to previous and set new current

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a task for a case with no task data; current fields populate.
2. Create a new task for a case with current data; previous fields shift and current updates.

**Edge Cases:**
1. Case lookup returns undefined list values; script handles as empty.

**Error Handling:**
1. submitFields errors logged without blocking creation.

### Test Data Requirements
- Cases with and without existing task fields.

### Sandbox Setup
- Ensure case task summary fields are present.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to cases.

**Permissions required:**
- Edit support cases
- View tasks

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

1. Upload `hul_populate_task_on_case_when_created_ue.js`.
2. Deploy as User Event on task record.
3. Validate case updates on task create.

### Post-Deployment

- [ ] Confirm case fields update on task creation.
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

- [ ] Should this run only for certain case categories?
- [ ] Should previous task shifting be capped to one level?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| High task volume | Med | Med | Monitor UE performance |
| Inconsistent field values | Low | Low | Standardize inputs |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.md
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_task_data_on_case.md

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
