# PRD: PandaDoc E-Sign Status Sync (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-PandaDocESignStatusMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/PandaDocs/sna_hul_mr_pd_esign_status.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that checks PandaDoc document statuses for pending transactions and updates NetSuite fields, downloading signed PDFs when documents are completed.

**What problem does it solve?**
Keeps PandaDoc document status synchronized with NetSuite transactions and automatically attaches signed documents.

**Primary Goal:**
Update transaction PandaDoc status and attach signed PDFs when complete.

---

## 2. Goals

1. Load a saved search of pending PandaDoc documents.
2. Fetch PandaDoc status for each transaction and update the status field.
3. Download and attach signed PDFs when documents are completed.

---

## 3. User Stories

1. **As a** sales rep, **I want** transaction status updated **so that** I can track e-signature progress.
2. **As an** admin, **I want** signed PDFs attached automatically **so that** documents are centralized in NetSuite.
3. **As a** developer, **I want** a batch sync process **so that** PandaDoc status stays current.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load a saved search ID from `SCRIPT_PARAMETERS.PENDING_DOCUMENT_SEARCH`.
2. The system must parse each search row and extract PandaDoc values.
3. The system must call `handlePdDocStatus` to retrieve PandaDoc status details.
4. The system must update transaction field `custbody_sna_pd_doc_status` via `updateDocStatusOnTransaction`.
5. When PandaDoc status is `document.completed`, the system must pass the record to reduce.
6. The system must download and attach the signed PDF in reduce via `getPDFSignedCopy`.

### Acceptance Criteria

- [ ] Pending documents are checked and statuses updated on transactions.
- [ ] Completed documents trigger signed PDF download and attachment.
- [ ] Errors are logged without stopping the entire run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create PandaDoc documents.
- Trigger e-signature requests.
- Update fields unrelated to PandaDoc status or attachment.

---

## 6. Design Considerations

### User Interface
- None (server-side batch processing).

### User Experience
- Transactions show updated PandaDoc status, and signed documents appear automatically.

### Design References
- PandaDoc integration module `sna_hul_mod_pd`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction records (Estimate, Sales Order)
- File (for signed PDFs)

**Script Types:**
- [x] Map/Reduce - PandaDoc status sync
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_sna_pd_doc_status`
- Transaction | `custbody_sna_pd_doc_id`
- Transaction | `custbody_sna_pd_document`

**Saved Searches:**
- Pending document search referenced by `SCRIPT_PARAMETERS.PENDING_DOCUMENT_SEARCH`.

### Integration Points
- PandaDoc API via `sna_hul_mod_pd` helpers.

### Data Requirements

**Data Volume:**
- One API status check per search result.

**Data Sources:**
- Saved search results and PandaDoc API responses.

**Data Retention:**
- Signed PDFs stored in File Cabinet and attached to transactions.

### Technical Constraints
- Relies on `sna_hul_mod_pd` to fetch status and attach PDFs.
- `summarize` stage is empty.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/SNA/PandaDocs/modules/sna_hul_mod_pd.js.
- **External dependencies:** PandaDoc API.
- **Other features:** Saved search for pending documents must be defined.

### Governance Considerations
- One status API call per record; additional calls for completed documents.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Transaction status fields match PandaDoc document statuses.
- Signed PDFs are attached when documents complete.

**How we'll measure:**
- Verify transaction fields and attached files for completed documents.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_pd_esign_status.js | Map/Reduce | Sync PandaDoc status and attachments | Implemented |

### Development Approach

**Phase 1:** Status update
- [x] Fetch PandaDoc status and update transactions.

**Phase 2:** Attachment
- [x] Download and attach signed PDFs when complete.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Pending documents update status successfully.
2. Completed documents result in attached signed PDFs.

**Edge Cases:**
1. PandaDoc API returns no status.
2. Saved search returns invalid record data.

**Error Handling:**
1. API request fails; error is logged and processing continues.

### Test Data Requirements
- Saved search with transactions that have PandaDoc document IDs.

### Sandbox Setup
- Map/Reduce deployment with PandaDoc script parameters set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with transaction and file access.

**Permissions required:**
- Edit transactions
- Create/attach files

### Data Security
- Signed documents stored in File Cabinet; ensure folder permissions are restricted.

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

1. Upload `sna_hul_mr_pd_esign_status.js`.
2. Set the pending document search script parameter.
3. Deploy and run in sandbox.

### Post-Deployment

- [ ] Verify status updates and signed PDF attachments.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

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

- [ ] Should completed documents be re-checked to avoid re-downloading?
- [ ] Should the script handle voided/declined documents differently?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| PandaDoc API downtime | Med | High | Add retries and alerts |
| Large pending search consumes governance | Med | Med | Limit search size or schedule frequency |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/SNA/PandaDocs/modules/sna_hul_mod_pd.md

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- record.submitFields and record.attach

### External Resources
- PandaDoc API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
