# PRD: Commission Backfill for Sales Orders (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-CommissionBackfillMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_update_2025_so_for_commission_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that processes sales orders from a saved search and marks them as processed for commission, triggering the commission User Event on edit.

**What problem does it solve?**
Backfills commission processing for historical sales orders by programmatically toggling the processed flag.

**Primary Goal:**
Set `custbody_hul_processed_for_commission` to true for sales orders from a saved search.

---

## 2. Goals

1. Load a saved search of target sales orders.
2. Skip orders already marked as processed.
3. Update and save remaining orders to trigger commission logic.

---

## 3. User Stories

1. **As an** admin, **I want to** backfill commission processing **so that** historical orders are handled.
2. **As a** finance user, **I want** the commission UE to run **so that** payouts are correct.
3. **As a** developer, **I want** a batch process **so that** many orders can be updated safely.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load the saved search `customsearch_hul_commission_backfill`.
2. For each sales order, the system must:
   - Load the sales order record
   - Check `custbody_hul_processed_for_commission`
   - Skip if already true
3. The system must set `custbody_hul_processed_for_commission` to `true` and save the record.
4. The system must log audit entries for processed records and debug entries for skipped ones.
5. Errors must be logged per sales order.

### Acceptance Criteria

- [ ] Sales orders in the saved search are processed unless already flagged.
- [ ] The commission processed flag is set to true on unprocessed orders.
- [ ] Errors are logged without halting the run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create commission records directly.
- Process sales orders outside the saved search.
- Modify any fields besides `custbody_hul_processed_for_commission`.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Commission processing triggered without manual edits.

### Design References
- Commission User Event script (not included here).

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order

**Script Types:**
- [x] Map/Reduce - Commission backfill
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Commission UE triggered by edits
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `custbody_hul_processed_for_commission`

**Saved Searches:**
- `customsearch_hul_commission_backfill`

### Integration Points
- Commission User Event triggered on save.

### Data Requirements

**Data Volume:**
- All sales orders returned by the saved search.

**Data Sources:**
- Saved search results.

**Data Retention:**
- Updates to sales orders only.

### Technical Constraints
- Saved search ID is hard-coded in script.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Commission User Event logic.

### Governance Considerations
- One record load/save per sales order.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Target sales orders are marked processed and commission UE fires.

**How we'll measure:**
- Script logs and commission outputs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_update_2025_so_for_commission_mr.js | Map/Reduce | Backfill commission processing | Implemented |

### Development Approach

**Phase 1:** Input
- [x] Load saved search of target sales orders

**Phase 2:** Processing
- [x] Skip processed orders, update remaining

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run MR; unprocessed sales orders get flagged and saved.

**Edge Cases:**
1. Saved search is empty; MR completes with no updates.
2. Record load fails; error logged and continue.

**Error Handling:**
1. Map errors logged in summarize.

### Test Data Requirements
- Sales orders with processed flag true and false.

### Sandbox Setup
- Ensure saved search `customsearch_hul_commission_backfill` exists.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to sales orders.

**Permissions required:**
- Edit access to Sales Orders
- Run saved searches

### Data Security
- Updates only a single boolean field.

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

1. Upload `hul_update_2025_so_for_commission_mr.js`.
2. Create Map/Reduce script record.
3. Verify saved search ID and permissions.
4. Run in sandbox to validate commission UE triggers.

### Post-Deployment

- [ ] Confirm processed flag set on target orders.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Revert processed flags if needed.

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

- [ ] Should the saved search ID be parameterized?
- [ ] Should processed records be tracked in a log file?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Saved search ID changes | Med | High | Move to script parameter |
| Large order volume | Med | Med | Monitor usage and yields |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce
- Search and Record APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
