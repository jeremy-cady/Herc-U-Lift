# PRD: Send Quote via Email Suitelet

**PRD ID:** PRD-UNKNOWN-SendQuoteViaEmail
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_sendquoteviaemail.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet endpoint that emails a quote (transaction) by merging an email template and attaching the latest file on the transaction.

**What problem does it solve?**
Enables users or integrations to send a quote email directly from NetSuite with the latest attached document.

**Primary Goal:**
Send a merged email with the latest transaction attachment to the specified user.

---

## 2. Goals

1. Accept transaction and user identifiers via request parameters.
2. Merge an email template for the transaction.
3. Attach the latest transaction file and send an email.

---

## 3. User Stories

1. **As a** sales rep, **I want** to email the latest quote PDF **so that** customers receive the most recent version.
2. **As an** admin, **I want** email templates to be used **so that** messaging is consistent.
3. **As a** developer, **I want** a Suitelet endpoint **so that** external UI can trigger sending emails.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `tranId` and `userId` parameters.
2. The system must merge email content using template ID `6` with the transaction.
3. The system must locate the latest file attachment on the transaction.
4. The system must send an email to `userId` with the merged subject/body and the attachment.
5. The system must return a boolean response indicating success.

### Acceptance Criteria

- [ ] Email sends with merged subject/body from the template.
- [ ] Latest attachment is included in the email.
- [ ] Response returns `true` on success and `false` on failure.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate whether the transaction is a quote versus other transaction types.
- Persist email send status on the transaction.
- Dynamically select the email template (hardcoded template ID is used).

---

## 6. Design Considerations

### User Interface
- No UI; Suitelet responds with a simple boolean value.

### User Experience
- Users get the latest quote document emailed quickly.

### Design References
- Email template ID `6` (hardcoded).

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction (for file attachments)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Send quote via email
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None referenced.

**Saved Searches:**
- Transaction search with file join to fetch the latest attachment.

### Integration Points
- NetSuite Email and Render APIs.

### Data Requirements

**Data Volume:**
- One email per request.

**Data Sources:**
- Transaction file attachments.

**Data Retention:**
- No storage changes.

### Technical Constraints
- Email template ID is hardcoded to `6`.
- `userId` is treated as an employee internal ID for sender and recipient.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Email template and file attachment on transaction.

### Governance Considerations
- Search and email send usage per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Quote emails are sent with the correct attachment and content.

**How we'll measure:**
- Verify sent email content and attachments for a test transaction.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_sendquoteviaemail.js | Suitelet | Email quote with latest attachment | Implemented |

### Development Approach

**Phase 1:** Email merge
- [x] Merge template for transaction.

**Phase 2:** Attachment and send
- [x] Load latest attachment and send email.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Send email for a transaction with attachments and verify success.

**Edge Cases:**
1. Transaction has no file attachments; email fails or sends without attachment.
2. Invalid `userId` or `tranId` results in failure.

**Error Handling:**
1. Merge or send fails; error is logged and `false` is returned.

### Test Data Requirements
- Transaction with at least one file attachment.

### Sandbox Setup
- Ensure email template ID `6` exists.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users triggering quote emails.

**Permissions required:**
- Access to transaction records and file attachments
- Permission to send email

### Data Security
- Ensure email recipients are valid and authorized.

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

1. Upload `sna_hul_sl_sendquoteviaemail.js`.
2. Confirm email template ID `6` exists in target environment.
3. Validate email send and attachment.

### Post-Deployment

- [ ] Verify email send for a test transaction.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

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

- [ ] Should the email template ID be a script parameter?
- [ ] Should recipients be external customers instead of employees?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded template ID breaks in other accounts | Med | Med | Move template ID to script parameter |
| No attachment found results in invalid email | Med | Med | Add validation and fallback behavior |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- N/email module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
