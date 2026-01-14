# PRD: Clone Project Notes to Task (User Event)

**PRD ID:** PRD-UNKNOWN-CloneProjectNotesUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_clone_project_userNotes_to_task_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that clones project‑attached user notes to a target task when the note is created using the HUL User Note form.

**What problem does it solve?**
Ensures notes entered on projects are also visible on related tasks without manual duplication.

**Primary Goal:**
On note creation, clone the note to a task and link it via `activity` only.

---

## 2. Goals

1. Run only on note creation.
2. Ensure source note is on a Project (Job).
3. Clone the note to the target Task specified on the note.

---

## 3. User Stories

1. **As a** project user, **I want** my notes to appear on tasks **so that** task context is complete.
2. **As an** admin, **I want** cloning only for project notes **so that** other notes aren’t duplicated.
3. **As a** support user, **I want** the cloned note linked to the task **so that** it appears in task activity.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `afterSubmit` for `CREATE`.
2. The system must only run for notes created on form ID `218`.
3. The system must read target Task ID from `custrecord_hul_sync_note_to_task`.
4. The system must only proceed if the note is associated with a Project (Job) via:
   - `record` field or
   - `entity` field
5. The system must clone the note and:
   - Copy `title`, `note`, `notetype`, and `direction`
   - Clear `record` and `entity`
   - Set `activity` to the Task ID
6. The system must log the new note ID.
7. Errors must be logged without breaking note creation.

### Acceptance Criteria

- [ ] Notes created on form 218 and linked to a project clone to the task.
- [ ] Cloned notes link only via `activity`.
- [ ] Notes without task ID or non‑project context are skipped.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Run on edit/delete of notes.
- Copy the sync field to the cloned note.
- Attach clones to projects.

---

## 6. Design Considerations

### User Interface
- No UI changes; server‑side note creation only.

### User Experience
- Users see notes on tasks without extra steps.

### Design References
- HUL User Note form (internal ID 218).

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Note
- Task
- Project (Job)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Note cloning
- [ ] Client Script - Not used

**Custom Fields:**
- Note | `custrecord_hul_sync_note_to_task`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per note creation.

**Data Sources:**
- Note record fields.

**Data Retention:**
- New note records created on tasks.

### Technical Constraints
- Form ID guard requires HUL User Note form (218).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Task ID stored on note record.

### Governance Considerations
- One record.create per note.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Project notes are duplicated onto tasks as expected.

**How we'll measure:**
- Spot checks on task activity notes.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_clone_project_userNotes_to_task_ue.js | User Event | Clone project notes to tasks | Implemented |

### Development Approach

**Phase 1:** Guards
- [x] Create-only
- [x] Form ID and project context checks

**Phase 2:** Clone
- [x] Create new note linked to task via `activity`

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a note on a project using form 218 with task ID; note clones to task.

**Edge Cases:**
1. Note created without task ID; no clone.
2. Note attached to non‑project record; no clone.

**Error Handling:**
1. Record create failure logs an error.

### Test Data Requirements
- Project, task, and note using form 218.

### Sandbox Setup
- Ensure custom field `custrecord_hul_sync_note_to_task` exists.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with create access to notes and tasks.

**Permissions required:**
- Create note records
- View tasks and projects

### Data Security
- Cloned notes should follow standard note access rules.

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

1. Upload `hul_clone_project_userNotes_to_task_ue.js`.
2. Deploy on Note record type.
3. Verify with a test note on a project.

### Post-Deployment

- [ ] Confirm notes clone to tasks.
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

- [ ] Should the form ID (218) be configurable?
- [ ] Should cloning happen on edit as well?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Form ID changes | Med | Med | Move to script parameter |
| Task ID missing | Med | Low | Log and skip clone |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- record.create API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
