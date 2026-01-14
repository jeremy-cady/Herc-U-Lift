# PRD: Block Invoice Delete When JE Exists (User Event)

**PRD ID:** PRD-UNKNOWN-DeleteInvoicePrompt
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_ue_delete_invoice_prompt.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that blocks invoice deletion when related Journal Entries exist, showing a custom message with JE links.

**What problem does it solve?**
Prevents users from deleting invoices without first removing associated Journal Entries.

**Primary Goal:**
Stop invoice deletion if JEs with memos containing the invoice number are found.

---

## 2. Goals

1. Detect invoice delete attempts.
2. Search for related JEs by invoice document number.
3. Throw a message with JE links to block deletion.

---

## 3. User Stories

1. **As an** accounting user, **I want** to prevent deleting invoices with JEs **so that** accounting remains consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeSubmit` and only on `delete` context.
2. The system must search `journalentry` records where memomain contains the invoice `tranid`.
3. If any JEs are found, the system must throw an error that includes JE links.

### Acceptance Criteria

- [ ] Invoice delete is blocked when JEs exist.
- [ ] Message includes links to the related JEs.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Delete or modify Journal Entries.
- Validate if the JE is truly linked beyond memo match.

---

## 6. Design Considerations

### User Interface
- Custom error message on delete attempt.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Journal Entry

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Prevent invoice delete
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- Search created dynamically in script.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- JEs matching the invoice document number.

**Data Sources:**
- Journal Entry memomain and tranid.

**Data Retention:**
- No data changes.

### Technical Constraints
- Matching is based on memo contains document number.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.

### Governance Considerations
- Single JE search per delete attempt.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users are blocked from deleting invoices with related JEs.

**How we'll measure:**
- Attempt invoice deletion with matching JE and verify message.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_ue_delete_invoice_prompt.js | User Event | Block invoice deletion with JEs | Implemented |

### Development Approach

**Phase 1:** JE lookup
- [x] Search JEs by invoice document number.

**Phase 2:** Block delete
- [x] Throw custom message.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Delete invoice with related JE; deletion blocked with link.

**Edge Cases:**
1. No matching JEs; delete proceeds.

**Error Handling:**
1. Search errors are logged; behavior may allow delete.

### Test Data Requirements
- Invoice with JE whose memomain contains invoice number.

### Sandbox Setup
- None.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Accounting users.

**Permissions required:**
- Delete invoices
- View journal entries

### Data Security
- JE links visible to authorized users only.

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

1. Upload `sn_hul_ue_delete_invoice_prompt.js`.
2. Deploy on Invoice record.

### Post-Deployment

- [ ] Verify delete blocking behavior.
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

- [ ] Should the search use explicit linkage instead of memo match?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Memo match is too broad and blocks valid deletes | Med | Med | Use explicit link fields |

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
