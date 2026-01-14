# PRD: Task Notification Email Sync (User Event)

**PRD ID:** PRD-UNKNOWN-TaskNotifEmail
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_task.js (User Event)
- FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_utils.js (Utility)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event on Task records that manages notification email defaults and updates the related support case when a task is completed.

**What problem does it solve?**
Ensures task and case notification emails are set based on asset and customer data, and keeps the case updated when tasks complete.

**Primary Goal:**
Default task notification emails and sync them to the support case on completion.

---

## 2. Goals

1. Set task notification email on create/edit using case, asset, and customer data.
2. Clear notification email for shop cases or customers that opt out.
3. Update support case notification email when task status changes to complete.

---

## 3. User Stories

1. **As a** service user, **I want** task notification emails set automatically **so that** I do not maintain them manually.
2. **As an** admin, **I want** case emails updated when tasks complete **so that** communications are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On task create/edit, the system must read the related support case.
2. If the case is a shop case, the system must clear `custevent_sna_hul_nx_notif_email`.
3. If notification email is empty, the system must set it from the asset site contact email, else from customer email fields.
4. On edit, if customer has `custentity_sn_hul_no_servicereport`, the system must clear the notification email.
5. On task completion, the system must copy the task notification email to the support case field `custevent_sna_hul_nx_notif_email`.

### Acceptance Criteria

- [ ] Notification email defaults on task create/edit.
- [ ] Shop cases clear the notification email.
- [ ] Support case email updates when task becomes complete.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Send emails directly.
- Update case email for non-complete status changes.
- Validate email formatting.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Emails are set automatically in the background.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Task
- Support Case
- Customer
- Asset (`customrecord_nx_asset`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Task email defaults and case sync
- [ ] Client Script - Not used

**Custom Fields:**
- Task | `custevent_sna_hul_nx_notif_email`
- Task | `supportcase`
- Support Case | `custevent_sna_hul_nx_notif_email`
- Support Case | `custevent_hul_shopcase`
- Support Case | `custevent_nx_case_asset`
- Customer | `custentity_sna_hul_case_email_notif`
- Customer | `custentity_sn_hul_no_servicereport`
- Asset | `custrecord_sn_hul_site_contact_email`

**Saved Searches:**
- Lookup fields on support case, asset, and customer.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per task create/edit and status change.

**Data Sources:**
- Support case, customer, and asset fields.

**Data Retention:**
- Updates task and support case fields only.

### Technical Constraints
- Notification email logic depends on support case lookup fields.

### Dependencies
- **Libraries needed:** `shared/sna_hul_mod_utils` for `isEmpty`.
- **External dependencies:** None.
- **Other features:** Support case fields and asset record setup.

### Governance Considerations
- Multiple lookupFields calls per event.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Tasks and cases have the correct notification email values.

**How we'll measure:**
- Verify updates on task create/edit and on completion.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_task.js | User Event | Task email defaults and case sync | Implemented |

### Development Approach

**Phase 1:** Default notification email
- [x] Set email based on case/asset/customer.

**Phase 2:** Completion sync
- [x] Update case email when task completes.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create task with empty notification email; it is populated.
2. Complete task; support case email is updated.

**Edge Cases:**
1. Shop case; notification email cleared.
2. Customer with no-service-report flag; notification email cleared.

**Error Handling:**
1. Lookup failures are logged without blocking save.

### Test Data Requirements
- Support cases with and without assets and shop flag.

### Sandbox Setup
- Ensure asset records contain site contact emails.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Service users.

**Permissions required:**
- Edit tasks
- Edit support cases
- View customer and asset records

### Data Security
- No additional data exposure beyond existing permissions.

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

1. Upload `sna_hul_ue_task.js`.
2. Deploy User Event on Task record.

### Post-Deployment

- [ ] Verify notification email behavior on tasks.
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

- [ ] Should notification email update on task edit when status is not complete?
- [ ] Should support case email also be updated in beforeSubmit?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing asset contact email results in blank notification | Low | Med | Add fallback to customer email | 
| Multiple updates on edit add governance usage | Low | Low | Optimize lookup usage |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
