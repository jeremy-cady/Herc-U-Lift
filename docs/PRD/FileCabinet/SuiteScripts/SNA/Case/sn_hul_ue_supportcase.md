# PRD: Support Case Email Update on Close (User Event)

**PRD ID:** PRD-UNKNOWN-SupportCaseEmailUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/Case/sn_hul_ue_supportcase.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event script that updates the support case `email` field when a case is edited and its status changes to Closed.

**What problem does it solve?**
Ensures the support case email is set from a custom notification email field when the case closes.

**Primary Goal:**
Copy `custevent_sna_hul_case_email_notif` into `email` on case close.

---

## 2. Goals

1. Detect status changes to Closed on support case edits.
2. Read the custom notification email field.
3. Update the standard `email` field on the case.

---

## 3. User Stories

1. **As a** support coordinator, **I want** case email set on close **so that** notifications go to the correct address.
2. **As an** admin, **I want** automated field updates **so that** manual edits are reduced.
3. **As a** developer, **I want** a simple status-driven rule **so that** logic is easy to maintain.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `afterSubmit` for `EDIT` and `XEDIT` events.
2. The system must compare old and new case statuses.
3. The system must detect a change to status value `5` (Closed).
4. The system must read `custevent_sna_hul_case_email_notif` from the case.
5. If the notification email exists, the system must update `email` on the case via `record.submitFields`.
6. The system must ignore mandatory fields during the update.

### Acceptance Criteria

- [ ] When a case transitions to Closed, the `email` field is updated from the notification email.
- [ ] If the notification email is blank, no update occurs.
- [ ] Non-close edits do not update the `email` field.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Send emails.
- Update the case on create or delete events.
- Validate email format.

---

## 6. Design Considerations

### User Interface
- None (server-side update).

### User Experience
- Case email updates automatically on close without user action.

### Design References
- Custom field `custevent_sna_hul_case_email_notif` on support cases.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case (`supportcase`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Update case email on close
- [ ] Client Script - Not used

**Custom Fields:**
- Support Case | `custevent_sna_hul_case_email_notif`
- Support Case | `custevent4` (read but unused in current logic)

**Saved Searches:**
- None (search helper is present but not used in active logic).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per case edit where status changes to Closed.

**Data Sources:**
- Support case fields `status`, `email`, and `custevent_sna_hul_case_email_notif`.

**Data Retention:**
- Updates only the case `email` field.

### Technical Constraints
- Status comparison is string-based with `STATUS_CLOSED = '5'`.
- `beforeLoad` is defined but empty.
- `checkSystemNotes` exists but is not used (commented block).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Custom field `custevent_sna_hul_case_email_notif` must exist.

### Governance Considerations
- One `record.submitFields` per qualifying case edit.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Closed cases have their `email` field updated from the notification email field.

**How we'll measure:**
- Spot check closed cases for updated email values.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_ue_supportcase.js | User Event | Update case email on close | Implemented |

### Development Approach

**Phase 1:** Detect close
- [x] Compare old and new status values on edit.

**Phase 2:** Update email
- [x] Copy notification email to `email` using submitFields.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Edit a case and change status to Closed with a notification email present.

**Edge Cases:**
1. Change status to Closed without a notification email.
2. Edit other fields without changing status.
3. XEDIT status change to Closed.

**Error Handling:**
1. submitFields fails due to permissions; error should be logged by NetSuite.

### Test Data Requirements
- A support case with `custevent_sna_hul_case_email_notif` populated.

### Sandbox Setup
- User Event deployment on support cases with edit permissions.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to support cases.

**Permissions required:**
- Edit support cases.

### Data Security
- Updates only the case `email` field.

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

1. Upload `sn_hul_ue_supportcase.js`.
2. Deploy as a User Event on support case edits.
3. Validate case close behavior in sandbox.

### Post-Deployment

- [ ] Verify `email` updates on close.
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

- [ ] Should the close status be derived from a list/enum instead of a hard-coded value?
- [ ] Should the script run on create if a case is created as Closed?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Status internal ID changes | Low | Med | Use status enum or search for closed status |
| Notification email missing | Med | Low | Keep no-op when email is blank |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- record.submitFields API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
