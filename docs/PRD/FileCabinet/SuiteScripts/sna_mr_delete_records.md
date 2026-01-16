# PRD: Map/Reduce Delete Records

**PRD ID:** PRD-UNKNOWN-DeleteRecords
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_mr_delete_records.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Deletes records in bulk based on a saved search result set.

**What problem does it solve?**
Provides a controlled mechanism to remove records using a pre-defined search.

**Primary Goal:**
Delete records returned by saved search id 497 using record.delete.

---

## 2. Goals

1. Load saved search id 497 as input.
2. Parse record type and id from each result.
3. Delete each record and log errors.

---

## 3. User Stories

1. **As an** admin, **I want to** delete records in bulk **so that** cleanup is efficient.
2. **As a** developer, **I want to** control deletion via a saved search **so that** scope is explicit.
3. **As an** auditor, **I want to** see errors logged **so that** failures are traceable.

---

## 4. Functional Requirements

### Core Functionality

1. getInputData must load saved search id 497.
2. map must parse mapContext.value and extract recordType and id.
3. map must call record.delete for each record and log errors on failure.

### Acceptance Criteria

- [ ] Records in saved search 497 are deleted.
- [ ] Errors are logged without stopping the run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate record dependencies before deletion.
- Provide a rollback mechanism.
- Use reduce or summarize phases.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Deletion is handled in background via Map/Reduce.

### Design References
- Saved search id 497

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any record types returned by saved search 497

**Script Types:**
- [x] Map/Reduce - Bulk deletion
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None

**Saved Searches:**
- 497 | Records to delete (must provide recordType and id)

### Integration Points
- None

### Data Requirements

**Data Volume:**
- All results from saved search 497.

**Data Sources:**
- Saved search results.

**Data Retention:**
- Records are permanently deleted.

### Technical Constraints
- Deletion is performed in map phase only.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Saved search definition for deletion scope

### Governance Considerations

- **Script governance:** record.delete per result.
- **Search governance:** One saved search load.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- All intended records are deleted without unhandled errors.

**How we'll measure:**
- Compare saved search counts before and after run.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_mr_delete_records.js | Map/Reduce | Delete records from saved search | Implemented |

### Development Approach

**Phase 1:** Input
- [x] Load saved search 497.

**Phase 2:** Deletion
- [x] Delete each record in map phase.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run MR with search returning test records, verify deletion.

**Edge Cases:**
1. Search returns empty set, verify no errors.

**Error Handling:**
1. Delete fails due to dependencies, verify error logged.

### Test Data Requirements
- Saved search 497 configured with deletable records.

### Sandbox Setup
- Deploy MR and confirm search id 497 exists.

---

## 11. Security & Permissions

### Roles & Permissions
- Script deployment role must have delete permissions for target record types.

### Data Security
- Destructive deletion; ensure access is restricted.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Validate saved search 497 results.

### Deployment Steps
1. Deploy Map/Reduce and schedule as needed.

### Post-Deployment
- Confirm records are removed.

### Rollback Plan
- No rollback; restore from backup if needed.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should the saved search id be parameterized instead of hard-coded?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Wrong search scope | Accidental deletions | Validate search filters before run |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- Map/Reduce Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
