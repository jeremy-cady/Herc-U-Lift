# PRD: Populate Task Data on Case on Edit (User Event)

**PRD ID:** PRD-UNKNOWN-PopulateTaskDataUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that captures task data on edit, compares changes, and updates current/previous task fields on the related support case.

**What problem does it solve?**
Keeps support case task summary fields synchronized with task edits in near real time.

**Primary Goal:**
Update case task summary fields when a task is edited and values change.

---

## 2. Goals

1. Capture task data before save for comparison.
2. Detect changes after edit.
3. Update case fields accordingly.

---

## 3. User Stories

1. **As a** service user, **I want** case task data updated when tasks change **so that** summaries stay current.
2. **As an** admin, **I want** edits to sync automatically **so that** manual updates are avoided.
3. **As a** developer, **I want** change detection **so that** only relevant updates occur.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeLoad`, `beforeSubmit`, and `afterSubmit` for `EDIT`.
2. The system must build a task data JSON object with fields:
   - Support case, task ID, start/end dates, status, result, notes, actions, assigned tech, case type
3. The system must store the JSON object in `custevent_hul_task_data_json`.
4. On `afterSubmit`, the system must parse the stored JSON and compare it to new task values.
5. If data changed and case type is `4`, the system must update the case:
   - If current/previous task numbers match, populate both sets of fields.
   - Otherwise, populate only current task fields.
6. Errors must be logged without blocking task edits.

### Acceptance Criteria

- [ ] Case task summary fields update when task values change.
- [ ] Current/previous fields update based on task number comparison.
- [ ] Errors are logged without stopping edits.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Run on task create or delete.
- Update tasks themselves.
- Handle case types other than `4`.

---

## 6. Design Considerations

### User Interface
- None (server-side sync).

### User Experience
- Case fields stay aligned with task updates.

### Design References
- Daily scheduled backfill script.

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
- [x] User Event - Task-to-case sync on edit
- [ ] Client Script - Not used

**Custom Fields:**
- Task | `custevent_hul_task_data_json`
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_previous_task_number`
- Case | Various task summary fields (current/previous)

**Saved Searches:**
- None (lookupFields used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per task edit.

**Data Sources:**
- Task record fields and case lookups.

**Data Retention:**
- Updates to case fields.

### Technical Constraints
- The case type check (`caseType === '4'`) gates updates.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case task summary fields exist.

### Governance Considerations
- Case lookup and submitFields on edit.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case summary fields reflect the latest task edits.

**How we'll measure:**
- Spot checks on cases after task edits.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_populate_new_task_data_on_case_ue.js | User Event | Sync case fields from task edits | Implemented |

### Development Approach

**Phase 1:** Capture
- [x] Store task data JSON on edit

**Phase 2:** Sync
- [x] Compare old vs new and update case fields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Edit a task and confirm case fields update.

**Edge Cases:**
1. Missing JSON data triggers a rebuild in beforeSubmit.
2. Case type not 4 results in no updates.

**Error Handling:**
1. JSON parse errors are logged and exit.

### Test Data Requirements
- Tasks linked to cases of type 4.

### Sandbox Setup
- Ensure `custevent_hul_task_data_json` exists on tasks.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles editing tasks and cases (script deployment role).

**Permissions required:**
- Edit access to tasks and support cases.

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

1. Upload `hul_populate_new_task_data_on_case_ue.js`.
2. Deploy as User Event on task record.
3. Validate case updates on edit.

### Post-Deployment

- [ ] Confirm case fields update as expected.
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

- [ ] Should the case type filter be configurable?
- [ ] Should this logic run on create as well?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| JSON compare order mismatch | Low | Low | Normalize data before compare |
| Field name changes | Med | Med | Centralize in config |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_daily_ss.md

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
