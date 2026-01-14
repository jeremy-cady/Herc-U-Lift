# PRD: Document Distribution Client Script

**PRD ID:** PRD-UNKNOWN-DocumentDistribution
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_document_distribution.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script used on the Document Distribution custom record and Message record to manage contact selections and populate recipient emails.

**What problem does it solve?**
It streamlines document distribution by auto-loading customer contacts and populating email recipients for invoices and sales orders.

**Primary Goal:**
Keep document distribution contacts and email recipients in sync with customer data.

---

## 2. Goals

1. Auto-populate document distribution contacts for non-person customers.
2. Populate email address fields based on selected contacts.
3. Auto-add recipient emails and templates on Message records.

---

## 3. User Stories

1. **As an** AR user, **I want** email recipients prefilled **so that** I do not manually collect addresses.
2. **As an** admin, **I want** contact options filtered by customer **so that** users only choose valid contacts.

---

## 4. Functional Requirements

### Core Functionality

1. On Message record page init, the system must add email recipients from document distribution records for the transaction and customer.
2. On Document Distribution record page init, the system must load contact options and hide the native contact field in favor of the custom selector.
3. When the customer changes on the document distribution record, the system must reload the contact list for non-person customers.
4. When document distribution contacts change, the system must set the email address field with all contact emails.
5. The script must support adding recipients and template to the Message record via a client action.

### Acceptance Criteria

- [ ] Contact selections are prefilled on new document distribution records.
- [ ] Email address field is populated from selected contact emails.
- [ ] Message records receive recipient emails and template from distribution setup.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate email format beyond contact data.
- Manage fax numbers (fax validation removed).

---

## 6. Design Considerations

### User Interface
- Custom contact selector replaces the native field on the document distribution record.

### User Experience
- Contacts are auto-loaded for non-person customers.
- Users receive an alert if selected contacts have no emails.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_sna_hul_doc_distribution`
- Message
- Contact
- Customer
- Transaction

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Contact and recipient handling

**Custom Fields:**
- Document Distribution | `custrecord_doc_distribution_customer`
- Document Distribution | `custrecord_doc_distribution_contact`
- Document Distribution | `custrecord_doc_distribution_emailaddress`
- Document Distribution | `custrecord_doc_distribution_doc_type`
- Document Distribution | `custrecord_doc_distribution_email_check`
- Document Distribution | `custrecord_doc_distribution_mailtemplate`
- Document Distribution | `custpage_sna_doc_distri_contact`
- Message | `transaction`
- Message | `entity`
- Message | `template`
- Message Sublist | `otherrecipientslist.otherrecipient`
- Message Sublist | `otherrecipientslist.email`

**Saved Searches:**
- None (scripted searches only).

### Integration Points
- Uses transaction type lookup to map invoice or sales order document types.

### Data Requirements

**Data Volume:**
- Contact lookups per customer and message load.

**Data Sources:**
- Customer contacts and document distribution custom records.

**Data Retention:**
- Writes selected contacts and email strings to the custom record and message.

### Technical Constraints
- Relies on DOM manipulation to reposition contact field labels.

### Dependencies
- **Libraries needed:** N/currentRecord, N/record, N/search.
- **External dependencies:** None.
- **Other features:** Document distribution custom record configuration.

### Governance Considerations
- Client-side searches for contacts and custom record data.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Document distribution records and message recipients are populated without manual email entry.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_document_distribution.js | Client Script | Manage contacts and recipients for distribution | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Document distribution contact and email handling.
- **Phase 2:** Message recipient population.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a document distribution record for a non-person customer; contacts populate.
2. Select contacts and verify email address field updates.
3. Open a message for an invoice and verify recipients are inserted.

**Edge Cases:**
1. Customer marked as person; contact population skipped.
2. Selected contacts have no email addresses.

**Error Handling:**
1. Missing document distribution records should not block message load.

### Test Data Requirements
- Customer with contacts, plus a document distribution record for invoice or sales order.

### Sandbox Setup
- Deploy script to the document distribution record and message form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- AR users, administrators.

**Permissions required:**
- View contacts and document distribution records.

### Data Security
- Uses contact email addresses already visible to the user.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm custom field IDs for document distribution record.

### Deployment Steps
1. Upload `sna_hul_cs_document_distribution.js`.
2. Deploy to document distribution and message record contexts.

### Post-Deployment
- Verify contact population and recipient insertion.

### Rollback Plan
- Remove the client script deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Should contact email validation be enforced beyond presence?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| DOM changes break field repositioning | Low | Low | Limit DOM dependency or use form layout changes |
| Large contact lists slow client load | Low | Med | Add pagination or limit contact options |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
