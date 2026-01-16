# PRD: Quote Document Numbering

**PRD ID:** PRD-UNKNOWN-Quote
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_quote.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that assigns document numbers to Estimates/Quotes based on a document numbering custom record.

**What problem does it solve?**
Ensures unique, sequential quote numbers with configured prefixes and digit lengths.

**Primary Goal:**
Set the Estimate/Quote `tranid` using the document numbering configuration.

---

## 2. Goals

1. Generate unique quote numbers using prefix and minimum digits.
2. Update the document numbering record to increment the current number.

---

## 3. User Stories

1. **As a** sales user, **I want to** auto-assign quote numbers **so that** quotes follow numbering rules.

---

## 4. Functional Requirements

### Core Functionality

1. On quote create, the script must lookup document numbering settings by custom form.
2. The script must generate a unique quote number using prefix and minimum digits.
3. The script must update the document numbering current number.
4. The script must set the quote `tranid` and reload the record in UI context.

### Acceptance Criteria

- [ ] Quote records receive a generated `tranid`.
- [ ] Document numbering current number is incremented.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Renumber existing quotes.
- Handle non-quote transaction types.

---

## 6. Design Considerations

### User Interface
- Redirects to the quote after numbering in UI context.

### User Experience
- Users see the assigned quote number immediately after save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- estimate
- customrecord_sna_hul_document_numbering

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Quote numbering
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_transaction_form | Transaction form
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_doc_num_prefix | Prefix
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_doc_num_min | Min digits
- customrecord_sna_hul_document_numbering | custrecord_sna_hul_doc_current_number | Current number

**Saved Searches:**
- Search for existing quotes with the generated `tranid`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One numbering lookup per quote.

**Data Sources:**
- Document numbering custom record.

**Data Retention:**
- Updates document numbering record and quote `tranid`.

### Technical Constraints
- Attempts up to 20 iterations to find a unique doc number.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Document numbering record setup

### Governance Considerations

- **Script governance:** Multiple searches and submitFields.
- **Search governance:** Search for existing `tranid` values.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Quotes receive unique document numbers without duplicates.

**How we'll measure:**
- Verify quote numbers increment and remain unique.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_quote.js | User Event | Generate quote document number | Implemented |

### Development Approach

**Phase 1:** Document number generation
- [ ] Validate prefix/min digits formatting

**Phase 2:** Uniqueness checks
- [ ] Validate duplicate prevention

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create quote and verify generated `tranid`.

**Edge Cases:**
1. Duplicate number detected and retry succeeds.

**Error Handling:**
1. Missing numbering configuration logs an error.

### Test Data Requirements
- Document numbering record for the quote custom form

### Sandbox Setup
- Deploy User Event on Estimate/Quote.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales roles

**Permissions required:**
- Edit quotes
- Edit document numbering records

### Data Security
- Numbering data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm document numbering records per quote form

### Deployment Steps

1. Deploy User Event on Estimate/Quote.
2. Validate quote numbering.

### Post-Deployment

- [ ] Monitor logs for duplicate number errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Assign quote numbers manually.

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

- [ ] Should numbering reset per year or subsidiary?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Duplicate numbering from concurrent saves | Low | Med | Monitor and adjust numbering logic if collisions occur |

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
