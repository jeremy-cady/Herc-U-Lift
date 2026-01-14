# PRD: PandaDoc Integration Module

**PRD ID:** PRD-UNKNOWN-PandaDocModule
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/PandaDocs/modules/sna_hul_mod_pd.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A shared module that integrates NetSuite transactions with PandaDoc, supporting document creation, sending for e-signature, status updates, and signed document retrieval.

**What problem does it solve?**
Centralizes PandaDoc API calls and NetSuite updates so multiple PandaDoc scripts can reuse the same integration logic.

**Primary Goal:**
Provide reusable helpers for PandaDoc document lifecycle management in NetSuite.

---

## 2. Goals

1. Fetch PandaDoc document status and update NetSuite transactions.
2. Create and send PandaDoc documents for e-signature.
3. Download and attach signed PDFs to NetSuite transactions.

---

## 3. User Stories

1. **As a** sales rep, **I want** transactions sent for e-signature **so that** customers can sign digitally.
2. **As an** admin, **I want** document status synced **so that** NetSuite reflects PandaDoc progress.
3. **As a** developer, **I want** reusable PandaDoc helpers **so that** integration logic stays consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read PandaDoc credentials and configuration from script parameters:
   - `custsecret_sna_hul_pd_api_key_1`
   - `custscript_sna_hul_pd_api_url`
   - `custscript_sna_hul_pd_pending_doc_search`
   - `custscript_sna_pd_doc_ds_signed_doc_fold`
2. The system must map PandaDoc document statuses to NetSuite status values.
3. The system must call PandaDoc APIs to:
   - Get document details (`/documents/{id}/details`).
   - Send a document for signature (`/documents/{id}/send`).
   - Download a signed document (`/documents/{id}/download`).
4. The system must update transaction `custbody_sna_pd_doc_status` based on PandaDoc status.
5. The system must create a PandaDoc document by uploading a rendered PDF and metadata.
6. The system must send the created document for e-signature.
7. The system must store PandaDoc document ID, status, and API response on the transaction.
8. The system must download a signed PDF, save it to a file cabinet folder, attach it to the transaction, and update `custbody_sna_pd_document`.

### Acceptance Criteria

- [ ] PandaDoc status lookups update NetSuite transaction status fields.
- [ ] Document creation uploads the rendered PDF and returns a document ID.
- [ ] E-signature requests are sent after document creation.
- [ ] Signed PDFs are saved, attached, and linked on the transaction.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Provide UI components for document management.
- Manage PandaDoc templates beyond the provided template ID.
- Handle retries or advanced error recovery beyond exceptions.

---

## 6. Design Considerations

### User Interface
- None (server-side module).

### User Experience
- Transactions reflect current PandaDoc status, and signed documents attach automatically.

### Design References
- PandaDoc API endpoints and e-signature workflow.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction records (Estimate, Sales Order)
- Customer (lookup fields)
- File (for saved PDFs)

**Script Types:**
- [ ] Map/Reduce - Not used directly
- [ ] Scheduled Script - Not used directly
- [ ] Suitelet - Used by downstream scripts
- [ ] RESTlet - Not used
- [ ] User Event - Not used directly
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_sna_pd_doc_id`
- Transaction | `custbody_sna_pd_doc_status`
- Transaction | `custbody_sna_pd_api_resp`
- Transaction | `custbody_sna_pd_document`

**Saved Searches:**
- Pending document search referenced by `custscript_sna_hul_pd_pending_doc_search` (used by other scripts).

### Integration Points
- PandaDoc public API (`https://api.pandadoc.com/public/v1`).

### Data Requirements

**Data Volume:**
- One API call per document operation (details/send/download).

**Data Sources:**
- Transaction records and customer details.
- PandaDoc API responses.

**Data Retention:**
- API responses stored in `custbody_sna_pd_api_resp`.
- Signed PDF stored in File Cabinet.

### Technical Constraints
- Uses SuiteScript 2.x modules (`N/https`, `N/file`, `N/record`, `N/search`).
- Uses a busy-wait delay loop before sending documents.
- Uses script parameters for API key and folder ID.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** PandaDoc API.
- **Other features:** Suitelet deployment referenced by `SUITELET.request_esginature`.

### Governance Considerations
- API calls and file operations consume governance units per document.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PandaDoc status is accurately reflected on transactions.
- Signed documents are stored and attached to transactions.

**How we'll measure:**
- Verify transaction status fields and attached PDF files.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mod_pd.js | Library | PandaDoc API integration helpers | Implemented |

### Development Approach

**Phase 1:** API operations
- [x] Implement get, send, and download calls.

**Phase 2:** NetSuite updates
- [x] Update transaction fields and attach signed PDFs.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a PandaDoc document for a transaction and send for signature.
2. Update transaction status after PandaDoc status changes.
3. Download and attach a signed PDF.

**Edge Cases:**
1. Missing customer email or name.
2. PandaDoc API returns an error response.

**Error Handling:**
1. API calls fail; errors should surface to calling scripts.

### Test Data Requirements
- Transactions with valid customer data and templates.

### Sandbox Setup
- Script parameters populated with PandaDoc API key and folder ID.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script execution role with permissions to edit transactions and files.

**Permissions required:**
- Edit transactions
- Create and attach files
- View customers

### Data Security
- PandaDoc API key stored in a script secret.
- Signed documents stored in File Cabinet.

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

1. Upload `sna_hul_mod_pd.js`.
2. Set script parameters for API key, base URL, and folders.
3. Validate document creation and status updates.

### Post-Deployment

- [ ] Verify transaction updates and PDF attachments.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable scripts depending on the module or redeploy prior version.

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

- [ ] Should API failures be retried with backoff?
- [ ] Should the busy-wait delay be replaced with a scheduled retry?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| PandaDoc API downtime | Med | High | Add retries and error alerts |
| Busy-wait delay consumes governance | Med | Med | Replace with scheduled processing |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x N/https and N/file
- record.submitFields and record.attach

### External Resources
- PandaDoc API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
