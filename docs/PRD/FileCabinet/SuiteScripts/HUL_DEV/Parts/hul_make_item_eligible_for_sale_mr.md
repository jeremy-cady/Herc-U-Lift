# PRD: Make Items Eligible for Sale (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-MakeItemEligibleMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_make_item_eligible_for_sale_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that finds inventory items marked as not eligible for sale and flips the eligibility flag to true.

**What problem does it solve?**
Enables bulk correction of inventory items that were mistakenly marked ineligible.

**Primary Goal:**
Set `custitem_hul_eligible_for_sale` to `T` for all inventory items where it is `F`.

---

## 2. Goals

1. Identify all ineligible inventory items.
2. Update the eligibility flag in bulk.
3. Use Map/Reduce paging for scale.

---

## 3. User Stories

1. **As an** admin, **I want to** bulk-enable eligible items **so that** sales can proceed.
2. **As a** support user, **I want** the process automated **so that** I don’t update hundreds of items manually.
3. **As a** developer, **I want** the script to scale **so that** large item lists are handled safely.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search for inventory items with:
   - `type = InvtPart`
   - `custitem_hul_eligible_for_sale = F`
2. The system must page results using `runPaged` with a page size of 1000.
3. The system must write each item ID to reduce stage.
4. The reduce stage must set `custitem_hul_eligible_for_sale` to `T` via `submitFields`.
5. Errors must be logged and not stop processing.

### Acceptance Criteria

- [ ] All ineligible inventory items are updated to eligible.
- [ ] Script handles more than 4,000 items via paging.
- [ ] Errors are logged per item.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update non-inventory item types.
- Validate alternate part fields.
- Revert any eligibility changes.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Bulk updates without manual intervention.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Inventory Item

**Script Types:**
- [x] Map/Reduce - Bulk eligibility updates
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Item | `custitem_hul_eligible_for_sale`

**Saved Searches:**
- None (search created in script).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Potentially thousands of inventory items.

**Data Sources:**
- Inventory item search.

**Data Retention:**
- Updates to item records only.

### Technical Constraints
- Uses `inventoryitem` record type for updates.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Map/Reduce handles large record sets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- All targeted inventory items are marked eligible for sale.

**How we'll measure:**
- Post-run item search results and logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_make_item_eligible_for_sale_mr.js | Map/Reduce | Bulk enable item eligibility | Implemented |

### Development Approach

**Phase 1:** Input data
- [x] Search and paginate inventory items

**Phase 2:** Updates
- [x] Set eligibility field to true

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run script with a small set of ineligible items and confirm updates.

**Edge Cases:**
1. No items match criteria; script completes without errors.

**Error Handling:**
1. Record update failure logs an error.

### Test Data Requirements
- Inventory items with `custitem_hul_eligible_for_sale = F`.

### Sandbox Setup
- Create test items marked ineligible.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with item edit permissions.

**Permissions required:**
- Edit access to inventory items.

### Data Security
- Updates only eligibility flag.

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

1. Upload `hul_make_item_eligible_for_sale_mr.js`.
2. Create Map/Reduce script record.
3. Run in sandbox and verify updates.

### Post-Deployment

- [ ] Validate updated items.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Revert eligibility flags if needed.

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

- [ ] Should this script be run on demand only?
- [ ] Should eligibility changes be logged to a custom record?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Accidental mass enable | Med | High | Restrict deployments and runs |
| Eligibility should remain false | Low | Med | Validate selection criteria |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.md

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- Search and Record APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
