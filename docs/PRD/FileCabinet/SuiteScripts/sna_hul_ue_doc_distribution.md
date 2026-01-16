# PRD: Document Distribution Contacts

**PRD ID:** PRD-UNKNOWN-DocDistribution
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_doc_distribution.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that populates Document Distribution contact, email, and fax fields during CSV import.

**What problem does it solve?**
Automates contact and communication data for document distribution records created by import.

**Primary Goal:**
Populate contact, email, and fax fields from customer contacts during CSV import.

---

## 2. Goals

1. Add a contacts multiselect field on create/edit UI forms.
2. For CSV imports, auto-populate contacts and communication fields.

---

## 3. User Stories

1. **As an** admin, **I want to** auto-populate distribution contacts on CSV import **so that** records are complete.

---

## 4. Functional Requirements

### Core Functionality

1. The script must add a multiselect contacts field on create/edit UI.
2. On CSV import, the script must load customer contacts when the customer is not a person.
3. The script must set contact, email, and fax fields based on contact data.

### Acceptance Criteria

- [ ] CSV-imported records have contact, email, and fax fields populated.
- [ ] UI create/edit shows a contacts multiselect field.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Populate contacts for person customers.
- Send emails or faxes directly.

---

## 6. Design Considerations

### User Interface
- Adds a Contacts multiselect field on create/edit.

### User Experience
- CSV imports automatically fill distribution contacts.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_doc_distribution
- customer
- contact

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Populate contact details
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_customer | Customer
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_contact | Contact
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_emailaddress | Email addresses
- customrecord_sna_hul_doc_distribution | custrecord_doc_distribution_fax_numbers | Fax numbers

**Saved Searches:**
- Contact search by company.

### Integration Points
- CSV import context only for data population.

### Data Requirements

**Data Volume:**
- One contact search per imported record.

**Data Sources:**
- Customer contacts

**Data Retention:**
- Updates distribution record fields.

### Technical Constraints
- Only runs in CSV import context for data population.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Document Distribution record

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** One contact search per record.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- CSV-imported distribution records include contact and email data.

**How we'll measure:**
- Review imported distribution records for contact values.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_doc_distribution.js | User Event | Populate contacts on CSV import | Implemented |

### Development Approach

**Phase 1:** UI field
- [ ] Validate contacts field appears on create/edit

**Phase 2:** Import data
- [ ] Validate CSV import population

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. CSV import record with business customer sets contact emails and fax numbers.

**Edge Cases:**
1. Person customer skips contact population.

**Error Handling:**
1. Contact lookup errors are logged.

### Test Data Requirements
- Customer with multiple contacts and email/fax data

### Sandbox Setup
- Deploy User Event on document distribution record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admin roles

**Permissions required:**
- View customers and contacts
- Edit document distribution records

### Data Security
- Contact details restricted to authorized users.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm CSV import process for distribution records

### Deployment Steps

1. Deploy User Event on document distribution record.
2. Run test CSV import.

### Post-Deployment

- [ ] Monitor logs for import errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Populate contacts manually.

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

- [ ] Should UI multiselect values be saved back to the record?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Contact data missing for customer | Low | Low | Allow empty contact lists |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
