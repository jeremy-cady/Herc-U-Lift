# PRD: Edit/Save Transactions Map/Reduce

**PRD ID:** PRD-UNKNOWN-EditSaveTransaction
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_mr_editsave_transaction.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that loads transactions from a saved search and re-saves them.

**What problem does it solve?**
Allows batch re-save of transactions to trigger workflows, updates, or recalculations.

**Primary Goal:**
Load and save each transaction returned by a saved search.

---

## 2. Goals

1. Load a saved search specified by script parameter.
2. Iterate each result and save the record.
3. Log summarize statistics for the run.

---

## 3. User Stories

1. **As an** admin, **I want** to resave a set of transactions **so that** dependent logic re-runs.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load the saved search from `custscript_editsave_savedsearch`.
2. The system must load each record from the search results.
3. The system must save each record with `ignoreMandatoryFields` set to true.
4. The system must log summary details after execution.

### Acceptance Criteria

- [ ] Transactions in the saved search are re-saved.
- [ ] Errors are logged without stopping the entire run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify record fields directly.
- Run reduce logic (reduce is not implemented).
- Validate mandatory fields on save.

---

## 6. Design Considerations

### User Interface
- No UI; background Map/Reduce.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any transaction types returned by the saved search.

**Script Types:**
- [x] Map/Reduce - Batch re-save
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None required.

**Saved Searches:**
- Provided by `custscript_editsave_savedsearch` parameter.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- All results in the saved search.

**Data Sources:**
- Saved search results.

**Data Retention:**
- No explicit data changes beyond re-save.

### Technical Constraints
- Errors during save are logged and processing continues.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Saved search must exist and return valid records.

### Governance Considerations
- Each record load/save consumes governance units.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- All records in the saved search are processed without fatal errors.

**How we'll measure:**
- Review Map/Reduce summary logs for successes and errors.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_mr_editsave_transaction.js | Map/Reduce | Resave transactions | Implemented |

### Development Approach

**Phase 1:** Input search
- [x] Load saved search.

**Phase 2:** Processing
- [x] Load and save each record.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run against a saved search with a few transactions and confirm resave.

**Edge Cases:**
1. Search returns records of multiple types; all should process.
2. Record save fails; error is logged and next record continues.

**Error Handling:**
1. Load/save errors logged in map stage.

### Test Data Requirements
- Saved search with known transaction results.

### Sandbox Setup
- Configure script parameter with saved search ID.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running Map/Reduce.

**Permissions required:**
- Edit transaction records in the search

### Data Security
- No additional data exposure.

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

1. Upload `sna_mr_editsave_transaction.js`.
2. Set `custscript_editsave_savedsearch` parameter.
3. Schedule or run the Map/Reduce script.

### Post-Deployment

- [ ] Review summary logs.
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

- [ ] Should reduce stage aggregate results for reporting?
- [ ] Should mandatory fields be enforced for certain records?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large searches consume governance or time | Med | Med | Limit search results or use batches |
| Resaving triggers unintended workflows | Med | Med | Confirm scope of saved search |

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
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
