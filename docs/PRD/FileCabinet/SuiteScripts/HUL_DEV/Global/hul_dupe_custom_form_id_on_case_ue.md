# PRD: Copy Case Custom Form ID (User Event)

**PRD ID:** PRD-20250804-DupeCaseFormIdUE
**Created:** August 4, 2025
**Last Updated:** August 4, 2025
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that copies the Case’s `customform` ID into a dedicated custom field on create/edit.

**What problem does it solve?**
Provides a persistent form ID value on cases for reporting and downstream processing.

**Primary Goal:**
Populate `custevent_hul_custom_form_id` with the Case’s form ID.

---

## 2. Goals

1. Read `customform` on case create/edit.
2. Write `custevent_hul_custom_form_id`.
3. Log the update for debugging.

---

## 3. User Stories

1. **As an** admin, **I want to** store the case form ID in a field **so that** reports can filter by form.
2. **As a** developer, **I want to** centralize the form ID copy **so that** Map/Reduce can trigger it.
3. **As a** manager, **I want to** ensure all cases have the form ID stored **so that** data is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeSubmit` for CREATE and EDIT.
2. The system must read `customform` from the case record.
3. The system must set `custevent_hul_custom_form_id` to the form ID.

### Acceptance Criteria

- [ ] Case records have `custevent_hul_custom_form_id` set on create/edit.
- [ ] Errors are logged without blocking the save.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify any other case fields.
- Run on DELETE or VIEW.
- Validate the form ID against a list.

---

## 6. Design Considerations

### User Interface
- None (User Event logic only).

### User Experience
- Field is populated automatically; no user input required.

### Design References
- Used by Map/Reduce backfill script.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Copy form ID
- [ ] Client Script - Not used

**Custom Fields:**
- Support Case | `custevent_hul_custom_form_id` | Form ID cache

**Saved Searches:**
- None.

### Integration Points
- Map/Reduce `hul_dupe_custom_form_id_on_case_mr.js` triggers this on save.

### Data Requirements

**Data Volume:**
- Per case create/edit.

**Data Sources:**
- Case record `customform` field.

**Data Retention:**
- Stored on case record.

### Technical Constraints
- None.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Custom field must exist on Case.

### Governance Considerations
- Minimal usage; no record loads.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case records have populated `custevent_hul_custom_form_id`.

**How we'll measure:**
- Saved search or report on empty field count.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_dupe_custom_form_id_on_case_ue.js | User Event | Copy case form ID to custom field | Implemented |

### Development Approach

**Phase 1:** Field copy
- [x] Read customform on create/edit
- [x] Set custom field

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create or edit a case → custom form ID field populated.

**Edge Cases:**
1. customform blank → field set to blank.

**Error Handling:**
1. beforeSubmit errors are logged.

### Test Data Requirements
- Cases using different custom forms.

### Sandbox Setup
- Deploy User Event and create/edit a case.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins deploying the User Event.

**Permissions required:**
- Edit support cases.

### Data Security
- Stores only form ID (no sensitive data).

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy User Event on Support Case.
2. Validate field population on save.

### Post-Deployment

- [ ] Confirm backfill MR uses this successfully.

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2025-08-04 | 2025-08-04 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should this run on VIEW/OTHER context?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Field missing on case causes errors | Low | Medium | Ensure field exists before deploy |

---

## 15. References & Resources

### Related PRDs
- `docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_mr.md`

### NetSuite Documentation
- SuiteScript 2.x User Event docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-08-04 | Jeremy Cady | 1.0 | Initial implementation |
