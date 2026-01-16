# PRD: Document Distribution Config

**PRD ID:** PRD-UNKNOWN-DocDistributionConfig
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_doc_distribution_config.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that adds recipient selection to message records and sends transaction emails/prints based on document distribution configuration.

**What problem does it solve?**
Automates email distribution and printing of transactions based on configured recipients and templates.

**Primary Goal:**
Send transaction emails and print PDFs according to document distribution rules.

---

## 2. Goals

1. Add an "Add Recipients" button to message records.
2. On transaction creation, send emails or print PDFs based on distribution configuration.

---

## 3. User Stories

1. **As an** accounting user, **I want to** send invoices to configured recipients automatically **so that** manual emailing is reduced.

---

## 4. Functional Requirements

### Core Functionality

1. For message records, the script must attach client script and add an "Add Recipients" button.
2. On transaction create, the script must load document distribution configuration for customer/department/type.
3. The script must send transaction email using a configured email template, if enabled.
4. The script must generate and save a transaction PDF when print is enabled.

### Acceptance Criteria

- [ ] Message records show an Add Recipients button.
- [ ] Emails send when distribution config enables email and invoice is not on hold.
- [ ] Transaction PDFs are printed/saved when print is enabled.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Send faxes (stubbed for future use).
- Send emails if all lines are flagged do-not-print.

---

## 6. Design Considerations

### User Interface
- Adds a button to message records to add recipients.

### User Experience
- Transaction emails and prints are automated on creation.

### Design References
- Client script: `sna_hul_cs_document_distribution.js`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- message
- transaction (invoice, salesorder, creditmemo, estimate, opportunity)
- customrecord_sna_hul_doc_distribution

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Email/print processing
- [ ] Client Script - Recipient selection button

**Custom Fields:**
- transaction | custbody_sna_hold_invoice_sending | Hold email sending
- transaction line | custcol_sna_do_not_print | Line do not print
- revenue stream | custrecord_sna_hul_do_not_print | Revenue stream do not print
- doc distribution | custrecord_doc_distribution_customer | Customer
- doc distribution | custrecord_doc_distribution_doc_type | Document type
- doc distribution | custrecord_doc_distribution_email_check | Email enabled
- doc distribution | custrecord_doc_distribution_emailaddress | Email addresses
- doc distribution | custrecord_sna_employee_recipients | Employee recipients
- doc distribution | custrecord_doc_distribution_mailtemplate | Email template
- doc distribution | custrecord_doc_distribution_fax_check | Fax enabled
- doc distribution | custrecord_doc_distribution_fax_numbers | Fax numbers
- doc distribution | custrecord_doc_distribution_print_check | Print enabled
- doc distribution | custrecord_sna_doc_department | Department filter

**Saved Searches:**
- Search on document distribution records.

### Integration Points
- Uses email templates and PDF rendering for transactions.

### Data Requirements

**Data Volume:**
- One config lookup per created transaction.

**Data Sources:**
- Document distribution custom records

**Data Retention:**
- Creates message email activity; saves PDFs to File Cabinet.

### Technical Constraints
- Printed PDFs saved to folder ID 1830.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Document distribution configuration

### Governance Considerations

- **Script governance:** PDF render and email send per transaction.
- **Search governance:** One config search per transaction.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Emails and prints occur based on document distribution rules.

**How we'll measure:**
- Check email activity and printed PDFs for transactions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_doc_distribution_config.js | User Event | Email/print distribution | Implemented |

### Development Approach

**Phase 1:** Message UI
- [ ] Validate button and client script behavior

**Phase 2:** Transaction processing
- [ ] Validate email/print behavior by config

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create invoice with doc distribution config and confirm email sent.
2. Print enabled saves PDF to File Cabinet.

**Edge Cases:**
1. Hold invoice sending prevents email.
2. All lines do-not-print prevents email send.

**Error Handling:**
1. Template merge errors are logged.

### Test Data Requirements
- Document distribution configuration records

### Sandbox Setup
- Deploy User Event on relevant transaction types and message records.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Accounting roles

**Permissions required:**
- Send email
- Render/print transactions
- Access File Cabinet folder 1830

### Data Security
- Email recipients and PDFs restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Verify email template IDs and document type mapping

### Deployment Steps

1. Deploy User Event on message and transaction records.
2. Validate email and print behavior.

### Post-Deployment

- [ ] Monitor email logs and PDF storage

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Send emails manually if needed.

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

- [ ] Should fax sending be fully implemented?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing email template causes send failures | Low | Med | Validate template configuration in sandbox |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- Email and render modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
