# PRD: Mass Delete Invoices (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-MassDeleteInvoices
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/mass_delete_invoices.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce utility that deletes invoices in bulk using a list of internal IDs provided via script parameters.

**What problem does it solve?**
Mass cleanup of incorrect or test invoices is time-consuming through the UI; this script automates deletion with a dry-run option.

**Primary Goal:**
Allow safe, parameter-driven bulk deletion of invoice records.

---

## 2. Goals

1. Accept invoice IDs from a file or pasted text.
2. Support a dry-run mode for validation.
3. Delete valid invoice IDs efficiently.

---

## 3. User Stories

1. **As an** admin, **I want to** delete a list of invoices **so that** cleanup is fast and consistent.
2. **As a** reviewer, **I want** a dry-run mode **so that** I can verify IDs before deleting.
3. **As a** support user, **I want** errors logged **so that** failed deletions can be investigated.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept invoice IDs from:
   - `custscript_inv_ids_text` (comma/newline/tab-separated)
   - `custscript_inv_ids_file` (CSV/TXT file)
2. The system must parse IDs, stripping quotes and non-numeric values.
3. The system must de-duplicate IDs.
4. The system must throw an error if no IDs are provided.
5. The system must support `custscript_inv_delete_dryrun` to log actions without deleting.
6. For each ID, the system must delete the invoice using `record.delete`.
7. The system must log failures per ID.

### Acceptance Criteria

- [ ] IDs are loaded from file and/or text and de-duplicated.
- [ ] Dry-run logs “would delete” messages and deletes nothing.
- [ ] Valid invoice IDs are deleted when dry-run is off.
- [ ] Errors are logged with the invoice ID.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate invoices beyond ID format.
- Provide UI-based confirmation.
- Handle non-invoice record types.

---

## 6. Design Considerations

### User Interface
- None (script parameters only).

### User Experience
- Clear audit logs for deletes and dry-run actions.

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
- Variable, based on provided ID list.

**Data Sources:**
- Script parameters and File Cabinet file.

**Data Retention:**
- None; deletes records.

### Technical Constraints
- ID inputs must be numeric.
- No output summary beyond logs.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Map/Reduce scales for large ID lists.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoices in the provided list are deleted (or logged in dry-run).

**How we'll measure:**
- Execution logs and record counts.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| mass_delete_invoices.js | Map/Reduce | Delete invoices by ID list | Implemented |

### Development Approach

**Phase 1:** Input parsing
- [x] Parse IDs from file and text
- [x] De-duplicate and validate numeric IDs

**Phase 2:** Deletion
- [x] Delete invoices or log dry-run actions

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Provide a CSV of invoice IDs and delete them.
2. Provide pasted IDs and delete them.

**Edge Cases:**
1. Provide invalid/non-numeric IDs (they are ignored).
2. Provide no IDs (script errors out).

**Error Handling:**
1. Deletion error logs include invoice ID and message.

### Test Data Requirements
- Test invoices with known internal IDs.

### Sandbox Setup
- Configure script parameters for test run; use dry-run first.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins or roles with delete permissions on invoices.

**Permissions required:**
- Delete permission on invoice records.
- File Cabinet access to read uploaded ID file.

### Data Security
- Use in controlled environments; deletion is destructive.

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

1. Upload `mass_delete_invoices.js`.
2. Create Map/Reduce script record.
3. Configure script parameters (`custscript_inv_ids_text`, `custscript_inv_ids_file`, `custscript_inv_delete_dryrun`).
4. Run in sandbox with dry-run enabled.
5. Run in production if validated.

### Post-Deployment

- [ ] Confirm invoices are deleted as expected.
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

- [ ] Should the script produce a summary file of deleted IDs?
- [ ] Should there be a confirmation email after completion?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Accidental deletion | Med | High | Use dry-run and restricted access |
| Incorrect ID list | Med | High | Validate inputs and log results |

---

## 15. References & Resources

### Related PRDs
- None identified.

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
