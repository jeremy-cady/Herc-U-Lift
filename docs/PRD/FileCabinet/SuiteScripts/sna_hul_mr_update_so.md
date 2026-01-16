# PRD: Update Sales Order

**PRD ID:** PRD-UNKNOWN-UpdateSalesOrder
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_update_so.js (Map/Reduce)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Triggers a save on Sales Orders returned by a saved search to fire downstream User Event logic.

**What problem does it solve?**
Allows bulk invocation of the "SNA HUL | UE | SO/Quote Lines Update" User Event without manual edits.

**Primary Goal:**
Reload and save targeted Sales Orders to refresh line-level processing.

---

## 2. Goals

1. Load Sales Orders from a configurable saved search.
2. Save each Sales Order to trigger User Event processing.
3. Log execution metrics for tracking usage and throughput.

---

## 3. User Stories

1. **As an** administrator, **I want to** re-run SO/Quote line updates in bulk **so that** data stays consistent.
2. **As an** analyst, **I want to** target a saved search **so that** only relevant orders are processed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load a saved search specified by script parameter.
2. The system must load each Sales Order record from the search results.
3. The system must save each Sales Order record to trigger User Event logic.

### Acceptance Criteria

- [ ] Saved search parameter drives the record set.
- [ ] Each Sales Order is loaded and saved once.
- [ ] Execution summary logs usage, concurrency, and yields.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify Sales Order fields directly.
- Validate search criteria or results.
- Handle Quote records directly (only Sales Orders returned by search).

---

## 6. Design Considerations

### User Interface
- No UI; Map/Reduce runs via deployment.

### User Experience
- Admins configure the saved search to define scope.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder

**Script Types:**
- [x] Map/Reduce - Save Sales Orders to trigger UE logic
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None (script does not set fields).

**Saved Searches:**
- Script parameter `custscript_sna_update_so_srch` supplies the search ID.

### Integration Points
- Downstream User Event "SNA HUL | UE | SO/Quote Lines Update".

### Data Requirements

**Data Volume:**
- Depends on saved search results.

**Data Sources:**
- Sales Order records.

**Data Retention:**
- No data created; only saves existing records.

### Technical Constraints
- Map/Reduce governance limits for large searches.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** User Event "SNA HUL | UE | SO/Quote Lines Update"

### Governance Considerations

- **Script governance:** Record load/save per Sales Order.
- **Search governance:** Uses saved search as input.
- **API limits:** Consider batching for large searches.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- All Sales Orders in the saved search are saved without errors.
- User Event updates are observed post-run.

**How we'll measure:**
- Map/Reduce summary logs and targeted record validation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_update_so.js | Map/Reduce | Save Sales Orders to trigger UE | Implemented |

### Development Approach

**Phase 1:** Configure search and parameters
- [ ] Confirm search returns intended Sales Orders

**Phase 2:** Execute and validate
- [ ] Run Map/Reduce
- [ ] Verify SO line updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Saved search returns a small set of Sales Orders; each is saved.

**Edge Cases:**
1. Saved search returns no results; script exits cleanly.
2. Record load error is logged and does not stop execution.

**Error Handling:**
1. Invalid saved search ID is logged and stops input stage.

### Test Data Requirements
- Saved search with known Sales Orders.

### Sandbox Setup
- Ensure User Event is deployed for validation.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator or scripting role

**Permissions required:**
- Edit access to Sales Orders

### Data Security
- No sensitive data beyond Sales Order access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Set saved search parameter
- [ ] Validate target search in sandbox

### Deployment Steps

1. Deploy Map/Reduce with search parameter.
2. Execute script on target set.

### Post-Deployment

- [ ] Review logs for errors
- [ ] Confirm UE updates are applied

### Rollback Plan

**If deployment fails:**
1. Disable deployment.
2. Fix saved search or permissions and re-run.

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

- [ ] Should Quotes be included in the search scope?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large search results may consume governance | Med | Med | Use smaller search windows or run off-hours |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce
- N/record module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
