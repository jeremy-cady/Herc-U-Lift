# PRD: Support Case Email Backfill (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-SupportCaseEmailMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/Case/sn_hul_mr_supportcase.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that loads a saved search and updates support case email fields based on grouped search results.

**What problem does it solve?**
Automates backfilling or correcting support case email values from a saved search without manual edits.

**Primary Goal:**
Update the `email` field on support cases using search results keyed by internal ID.

---

## 2. Goals

1. Load a saved search from a script parameter.
2. Process search results and identify the case internal ID and email value.
3. Update support cases with the derived email value.

---

## 3. User Stories

1. **As an** admin, **I want to** backfill case emails in bulk **so that** data stays consistent.
2. **As a** developer, **I want** a parameterized search-driven update **so that** I can target specific cases.
3. **As a** support manager, **I want** accurate case emails **so that** communications are reliable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load a saved search ID from `custscript_sn_case_search_eml`.
2. The system must process each search result in the map stage and pass it to reduce.
3. The system must parse grouped search values in reduce to extract:
   - `GROUP(internalid)` for the case internal ID.
   - `GROUP(email.CUSTEVENT_NX_CUSTOMER)` for the case email.
4. The system must update `supportcase.email` with the grouped email value when present.
5. The system must log debug output during map and reduce.

### Acceptance Criteria

- [ ] The script loads the saved search specified by the script parameter.
- [ ] Cases are updated with the grouped email value when present.
- [ ] No update occurs when the grouped email value is empty.
- [ ] Errors do not halt the entire run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or delete cases.
- Validate email format.
- Update fields other than `email`.

---

## 6. Design Considerations

### User Interface
- None (server-side batch update).

### User Experience
- Case emails are updated in bulk based on saved search results.

### Design References
- Saved search referenced by `custscript_sn_case_search_eml`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case (`supportcase`)

**Script Types:**
- [x] Map/Reduce - Bulk update of case email
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None (uses `email` on supportcase and grouped email column).

**Saved Searches:**
- Saved search ID from `custscript_sn_case_search_eml`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One update per grouped search result.

**Data Sources:**
- Saved search results with grouped internal ID and email values.

**Data Retention:**
- Updates existing support case records only.

### Technical Constraints
- Assumes search results include `GROUP(internalid)` and `GROUP(email.CUSTEVENT_NX_CUSTOMER)`.
- The `summarize` stage is empty.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Saved search definition must match expected columns.

### Governance Considerations
- One `record.submitFields` per case update.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case email values are updated to match the saved search results.

**How we'll measure:**
- Spot check updated cases and compare to saved search output.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_mr_supportcase.js | Map/Reduce | Update case emails from saved search | Implemented |

### Development Approach

**Phase 1:** Load saved search
- [x] Read parameter and load the search.

**Phase 2:** Update cases
- [x] Parse grouped results and submit field updates.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Saved search returns grouped case IDs with email values; cases update.

**Edge Cases:**
1. Search returns a row with missing email; case is not updated.
2. Saved search ID is invalid.

**Error Handling:**
1. `record.submitFields` fails; error logged and run continues.

### Test Data Requirements
- Saved search with grouped internal ID and email columns.

### Sandbox Setup
- Map/Reduce deployment with access to saved search and case edit permissions.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with permission to edit support cases.

**Permissions required:**
- Edit support cases.
- View saved search results.

### Data Security
- Updates only the `email` field on support case records.

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

1. Upload `sn_hul_mr_supportcase.js`.
2. Set script parameter `custscript_sn_case_search_eml` to a saved search ID.
3. Deploy and run the Map/Reduce in sandbox.

### Post-Deployment

- [ ] Verify case email updates from the saved search output.
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

- [ ] Should the script validate the saved search columns before running?
- [ ] Should it update additional case fields based on the search?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Saved search schema changes | Med | Med | Lock search columns or validate before run |
| Large runs consume governance | Med | Med | Monitor usage and consider rescheduling |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- record.submitFields API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
