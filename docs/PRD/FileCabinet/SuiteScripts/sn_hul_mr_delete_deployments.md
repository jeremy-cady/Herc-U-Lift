# PRD: Delete Unsheduled M/R Deployments (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-DeleteMRDeployments
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_mr_delete_deployments.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that finds script deployments in NOTSCHEDULED status for a specific Map/Reduce script and deletes them.

**What problem does it solve?**
Cleans up unused deployments to reduce clutter and maintain deployment hygiene.

**Primary Goal:**
Delete NOTSCHEDULED deployments for `customscript_sna_hul_mr_upd_matrix_oncus`, excluding a single exception deployment.

---

## 2. Goals

1. Search for script deployments that match a specific M/R script and status.
2. Skip a configured exception deployment ID.
3. Delete all remaining deployments.

---

## 3. User Stories

1. **As an** admin, **I want** unused deployments removed **so that** deployments stay manageable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search `scriptdeployment` records where:
   - Script ID is `customscript_sna_hul_mr_upd_matrix_oncus`
   - `isdeployed` is true
   - `status` is `NOTSCHEDULED`
2. The system must skip deployment ID `1026` (production exception).
3. The system must delete each remaining deployment.

### Acceptance Criteria

- [ ] All matching NOTSCHEDULED deployments are deleted except the exception.
- [ ] Exceptions and errors are logged.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Delete scheduled or inactive deployments.
- Remove deployments for other scripts.

---

## 6. Design Considerations

### User Interface
- No UI; background Map/Reduce.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Script Deployment

**Script Types:**
- [x] Map/Reduce - Deployment cleanup
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None; search is built in the script.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- All deployments matching the search criteria.

**Data Sources:**
- Script deployments.

**Data Retention:**
- Deletes deployment records.

### Technical Constraints
- Hardcoded exception deployment ID (`1026`).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Deployment IDs must remain valid.

### Governance Considerations
- Deletions occur one per map entry.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Non-exempt NOTSCHEDULED deployments are removed.

**How we'll measure:**
- Verify deployment list before and after run.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_mr_delete_deployments.js | Map/Reduce | Delete unscheduled deployments | Implemented |

### Development Approach

**Phase 1:** Search deployments
- [x] Load deployments matching criteria.

**Phase 2:** Delete deployments
- [x] Delete all except exception.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run against deployments in NOTSCHEDULED status; all deleted except exception.

**Edge Cases:**
1. No matching deployments; script completes without deletes.

**Error Handling:**
1. Deletion errors are logged and surfaced in summarize.

### Test Data Requirements
- Script deployments matching criteria.

### Sandbox Setup
- Update exception ID for sandbox if needed.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running Map/Reduce.

**Permissions required:**
- Delete script deployments

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

1. Upload `sn_hul_mr_delete_deployments.js`.
2. Deploy and run as needed.

### Post-Deployment

- [ ] Verify deployments removed.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Recreate deleted deployments as needed.

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

- [ ] Should the script accept the script ID and exception ID as parameters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect exception ID deletes a needed deployment | Med | High | Move exception ID to parameter |

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
