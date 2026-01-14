# PRD: SFA Territory Add Sales Reps Client Script

**PRD ID:** PRD-UNKNOWN-SFATerriAddSalesReps
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_sfa_terri_add_sales_reps.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that populates sales rep list fields based on selected items and customers.

**What problem does it solve?**
It ensures sales rep lists are prefilled using territory and customer mapping data.

**Primary Goal:**
Populate sales rep lists from item territory mapping and customer sales rep assignment.

**Notes:**
The script header indicates it is not in use.

---

## 2. Goals

1. Set `custcol_sna_sales_rep_list` based on item territory mapping.
2. Set header `salesrep` based on customer assignment.

---

## 3. User Stories

1. **As a** user, **I want** sales reps prefilled **so that** I do not manually search territory assignments.

---

## 4. Functional Requirements

### Core Functionality

1. When an item is selected on the item sublist, the script must set `custcol_sna_sales_rep_list` to the list of sales reps for that item territory.
2. When the customer is sourced, the script must set `salesrep` to the customer's assigned sales rep.

### Acceptance Criteria

- [ ] Sales rep list populates when item is selected.
- [ ] Header sales rep defaults from customer.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate sales rep eligibility.
- Update territory records.

---

## 6. Design Considerations

### User Interface
- No UI changes; fields update automatically.

### User Experience
- Users see sales rep fields populated when selecting items or customers.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer
- Item
- Custom Record | `customrecord_sna_sr_shell`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Sales rep assignment

**Custom Fields:**
- Line | `custcol_sna_sales_rep_list`
- Item | `custitem_sna_sales_territory`
- Custom Record | `custrecord_sna_sfa_ter_sales_territory`
- Custom Record | `custrecord_sna_sr_shell_sales_rep`
- Header | `salesrep`

**Saved Searches:**
- None (scripted search only).

### Integration Points
- Uses `customrecord_sna_sr_shell` to resolve sales reps per territory.

### Data Requirements

**Data Volume:**
- One lookup per item selection.

**Data Sources:**
- Item territory field and sales rep shell records.

**Data Retention:**
- Updates transaction fields only.

### Technical Constraints
- Marked as not in use; verify deployment before relying on behavior.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Sales territory configuration.

### Governance Considerations
- Client-side searches per item selection.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales rep lists populate correctly on item selection.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_sfa_terri_add_sales_reps.js | Client Script | Populate sales rep lists from territory | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Populate sales rep list from item territory.
- **Phase 2:** Set customer sales rep on sourcing.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select an item with territory mapping and verify sales rep list.
2. Select a customer and verify header sales rep.

**Edge Cases:**
1. Item has no territory mapping; list remains empty.
2. Customer has no sales rep; header remains unchanged.

**Error Handling:**
1. Missing mapping records should not break line entry.

### Test Data Requirements
- Item with `custitem_sna_sales_territory` and matching sales rep shell records.

### Sandbox Setup
- Deploy script if in use and validate behavior.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- View customers, items, and sales rep shell records.

### Data Security
- Uses internal territory data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm script is intended for use and deployed.

### Deployment Steps
1. Upload `sna_hul_cs_sfa_terri_add_sales_reps.js`.
2. Deploy to the applicable transaction form if needed.

### Post-Deployment
- Validate sales rep list and header defaults.

### Rollback Plan
- Remove client script deployment if not used.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Is this script currently deployed anywhere?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Script is not deployed and behavior is untested | Med | Med | Confirm deployment before relying on logic |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
