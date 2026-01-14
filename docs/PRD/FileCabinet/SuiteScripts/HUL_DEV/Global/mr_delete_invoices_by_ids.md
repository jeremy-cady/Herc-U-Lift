# PRD: Delete Invoices by IDs (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-DeleteInvoicesByIds
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/mr_delete_invoices_by_ids.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that deletes invoices in bulk based on a list of internal IDs provided via parameters.

**What problem does it solve?**
Enables fast cleanup of invoices without manual deletion, with a dry-run option for safety.

**Primary Goal:**
Delete specified invoice records using a parameter-driven ID list.

---

## 2. Goals

1. Accept invoice IDs from file or text.
2. Support dry-run auditing.
3. Log failures with full error detail.

---

## 3. User Stories

1. **As an** admin, **I want to** delete a list of invoices **so that** cleanup is efficient.
2. **As a** reviewer, **I want** a dry-run mode **so that** I can verify IDs before deletion.
3. **As a** support user, **I want** detailed error logs **so that** failures are diagnosable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept IDs from:
   - `custscript_inv_ids_text` (comma/newline/tab-separated)
   - `custscript_inv_ids_file` (CSV/TXT file)
2. The system must parse IDs, remove quotes/spaces, and keep numeric IDs only.
3. The system must de-duplicate IDs.
4. The system must error if no IDs are provided.
5. The system must respect `custscript_inv_delete_dryrun` for dry-run mode.
6. The system must delete invoices using `record.delete`.
7. The system must log detailed error messages (and stack if available).

### Acceptance Criteria

- [ ] IDs are loaded and de-duplicated from text/file inputs.
- [ ] Dry-run logs actions without deleting.
- [ ] Deletions occur for valid IDs when dry-run is off.
- [ ] Errors include the invoice ID and message/stack.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate business logic for invoice eligibility.
- Provide user-facing UI confirmations.
- Process non-invoice record types.

---

## 6. Design Considerations

### User Interface
- None (parameter-driven).

### User Experience
- Dry-run option and detailed logs reduce risk.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice

**Script Types:**
- [x] Map/Reduce - Bulk deletion
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Variable based on provided ID list.

**Data Sources:**
- Script parameters and File Cabinet files.

**Data Retention:**
- None; deletes records.

### Technical Constraints
- Numeric ID validation only; no additional verification.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Map/Reduce handles large ID lists.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Requested invoices are deleted or logged in dry-run mode.

**How we'll measure:**
- Script execution logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| mr_delete_invoices_by_ids.js | Map/Reduce | Delete invoices by ID list | Implemented |

### Development Approach

**Phase 1:** Input handling
- [x] Parse and de-duplicate IDs
- [x] Validate numeric format

**Phase 2:** Deletion and logging
- [x] Delete or dry-run
- [x] Log error details

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Provide IDs via file and delete them.
2. Provide IDs via text and delete them.

**Edge Cases:**
1. Invalid/non-numeric IDs are ignored.
2. No IDs provided triggers an error.

**Error Handling:**
1. Deletion failure logs the invoice ID and stack when available.

### Test Data Requirements
- Test invoices with known internal IDs.

### Sandbox Setup
- Configure parameters; run with dry-run first.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins or roles with delete permission for invoices.

**Permissions required:**
- Delete permission on invoice records.
- File Cabinet access for ID files.

### Data Security
- Restrict script access due to destructive behavior.

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

1. Upload `mr_delete_invoices_by_ids.js`.
2. Create Map/Reduce script record.
3. Configure parameters (`custscript_inv_ids_text`, `custscript_inv_ids_file`, `custscript_inv_delete_dryrun`).
4. Run in sandbox with dry-run enabled.
5. Run in production if validated.

### Post-Deployment

- [ ] Confirm deletions and review logs.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Restore invoices from backup if needed.

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

- [ ] Should deletions be emailed to admins after completion?
- [ ] Should a confirmation summary file be generated?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Accidental deletion | Med | High | Use dry-run and restrict access |
| Hidden dependencies block delete | Med | Med | Review error stacks and dependencies |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/mass_delete_invoices.md

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce
- Record.delete API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
