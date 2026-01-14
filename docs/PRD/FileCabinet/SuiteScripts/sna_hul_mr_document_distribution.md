# PRD: Document Distribution Bulk Email (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-DocumentDistributionMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_document_distribution.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that sends transaction documents in bulk based on document distribution settings.

**What problem does it solve?**
It automates emailing and optional printing of invoices, sales orders, credit memos, estimates, and opportunities.

**Primary Goal:**
Send transaction PDFs using distribution rules and mark transactions as distributed.

---

## 2. Goals

1. Load a saved search of transactions to distribute.
2. Determine recipients and templates from document distribution records.
3. Email PDFs and optionally save print files.

---

## 3. User Stories

1. **As an** AR user, **I want** to send multiple invoices automatically **so that** manual email work is reduced.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load the saved search identified by `custscript_sna_saved_search_id`.
2. For each transaction, the script must load the record and resolve distribution rules from `customrecord_sna_hul_doc_distribution`.
3. If email delivery is enabled and the transaction is not on hold, the script must send a PDF using the configured template.
4. If print delivery is enabled, the script must save an HTML render to the Transaction Prints folder.
5. The script must set `custbody_sna_hul_doc_distributed` to true after successful email send.

### Acceptance Criteria

- [ ] Transaction emails are sent to configured addresses with PDF attachments.
- [ ] Transactions with hold flag (`custbody_sna_hold_invoice_sending`) are not emailed.
- [ ] Print files are saved when print delivery is enabled.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Send fax documents (fax data is read but not processed here).
- Validate email templates beyond merge execution.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Transactions are distributed in bulk without manual intervention.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction records (invoice, sales order, credit memo, estimate, opportunity)
- Custom Record | `customrecord_sna_hul_doc_distribution`

**Script Types:**
- [x] Map/Reduce - Bulk distribution processing
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_sna_hold_invoice_sending`
- Transaction | `custbody_sna_hul_doc_distributed`

**Saved Searches:**
- Saved search from parameter `custscript_sna_saved_search_id`.

### Integration Points
- Email templates and PDF/HTML transaction rendering.

### Data Requirements

**Data Volume:**
- Each transaction from the saved search.

**Data Sources:**
- Distribution records, transaction records, email templates.

**Data Retention:**
- Saves print PDFs to folder ID 10792.

### Technical Constraints
- Requires valid email addresses and template IDs in distribution records.

### Dependencies
- **Libraries needed:** N/record, N/search, N/render, N/email, N/runtime.
- **External dependencies:** None.

### Governance Considerations
- Email and render operations per transaction and per recipient rule.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Bulk distributions send without manual follow-up and transactions are flagged as distributed.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_document_distribution.js | Map/Reduce | Bulk email and print distribution | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load search and distribution rules.
- **Phase 2:** Send email and save print files.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run with a saved search of invoices; verify email delivery and flag update.

**Edge Cases:**
1. No printable lines (all do-not-print) should skip email.

**Error Handling:**
1. Invalid email template should log errors and continue.

### Test Data Requirements
- Distribution records with email recipients and templates.

### Sandbox Setup
- Ensure folder ID 10792 exists for print files.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- AR users running distribution.

**Permissions required:**
- View transactions, email permission, create files in print folder.

### Data Security
- Emails contain transaction PDFs; access controlled by recipient list.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure `custscript_sna_saved_search_id` and `custscript_sna_dd_author` parameters.

### Deployment Steps
1. Upload `sna_hul_mr_document_distribution.js`.
2. Deploy Map/Reduce with saved search parameter.

### Post-Deployment
- Verify emails are delivered and print files saved.

### Rollback Plan
- Disable script deployment.

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
- [ ] Should fax distribution be handled by a separate process?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Invalid recipient data | Med | Med | Validate distribution record fields |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
