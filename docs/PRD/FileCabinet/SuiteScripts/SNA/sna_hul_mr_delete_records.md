# PRD: Bulk Record Deletion (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-DeleteRecordsMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_mr_delete_records.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that deletes records returned by a saved search and emails a detailed HTML summary report.

**What problem does it solve?**
Provides a configurable, auditable way to delete records in bulk using saved search criteria.

**Primary Goal:**
Delete records from a saved search and send a summary report to configured recipients.

---

## 2. Goals

1. Load a saved search defined by a script parameter.
2. Delete each record returned by the search.
3. Send a formatted email report with results and errors.

---

## 3. User Stories

1. **As an** admin, **I want** bulk deletions driven by a saved search **so that** criteria are configurable.
2. **As an** admin, **I want** a summary email **so that** I can review what happened.
3. **As a** developer, **I want** reusable deletion logic **so that** cleanup tasks are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read the saved search ID from `custscript_sna_hul_deletion_reference`.
2. If the search parameter is missing, the system must log an error and exit.
3. The system must delete each record from the search in the map stage.
4. The system must log deletions and write output rows for reporting.
5. The system must build HTML tables for deleted records and errors in summarize.
6. The system must load the email template `./custom-templates/record-deletion.html` and substitute placeholders.
7. The system must email the report to recipients in `custscript_sna_hul_deletion_recipients`.

### Acceptance Criteria

- [ ] Records returned by the saved search are deleted.
- [ ] Summary email includes deleted record IDs and error details.
- [ ] Missing search parameter is logged and prevents processing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate deletion eligibility beyond the saved search.
- Retry failed deletions.
- Delete records when the search parameter is missing.

---

## 6. Design Considerations

### User Interface
- None (batch process with email summary).

### User Experience
- Users receive an HTML email report after processing.

### Design References
- HTML template `custom-templates/record-deletion.html`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any record type returned by the saved search.

**Script Types:**
- [x] Map/Reduce - Bulk record deletion
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- Saved search provided via `custscript_sna_hul_deletion_reference`.

### Integration Points
- Email via `N/email` and template via `N/file`.

### Data Requirements

**Data Volume:**
- One delete per search result.

**Data Sources:**
- Saved search results.

**Data Retention:**
- Records are deleted and reported in email.

### Technical Constraints
- Email template path must be valid in the File Cabinet.
- Recipients parameter must be a comma-delimited list.

### Dependencies
- **Libraries needed:** `FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_utils.js` for `isEmpty`.
- **External dependencies:** None.
- **Other features:** Email template file and script parameters configured.

### Governance Considerations
- One delete per record plus email generation and search reload.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Records are deleted and the report is delivered to recipients.

**How we'll measure:**
- Compare saved search count with deletion summary email.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_delete_records.js | Map/Reduce | Bulk record deletion with email report | Implemented |

### Development Approach

**Phase 1:** Input validation
- [x] Load saved search parameter and exit if missing.

**Phase 2:** Deletion and reporting
- [x] Delete records, build report, and email summary.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Provide a saved search with test records; records delete and email sends.

**Edge Cases:**
1. Missing search parameter; script logs error and exits.
2. Empty search results; report shows no records processed.

**Error Handling:**
1. Record deletion fails; error appears in report.

### Test Data Requirements
- Saved search with removable test records.

### Sandbox Setup
- Map/Reduce deployment with search and recipient parameters set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with delete permissions for target records.

**Permissions required:**
- Delete access for record types in the search.
- Access to File Cabinet template.

### Data Security
- Deletion is permanent; ensure access is restricted.

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

1. Upload `sna_hul_mr_delete_records.js`.
2. Set `custscript_sna_hul_deletion_reference` and `custscript_sna_hul_deletion_recipients`.
3. Ensure the email template file exists.

### Post-Deployment

- [ ] Verify deletion and email report.
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

- [ ] Should deletions be limited to sandbox only?
- [ ] Should the report include record type names and links?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect search criteria deletes wrong records | Med | High | Review search before run |
| Missing email template breaks report | Low | Med | Validate template path in deployment |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_utils.md

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- record.delete and email.send APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
