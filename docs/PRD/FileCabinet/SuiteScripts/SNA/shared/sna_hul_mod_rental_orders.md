# PRD: Rental Orders Helper Module

**PRD ID:** PRD-UNKNOWN-RentalOrdersModule
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_rental_orders.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A shared module that updates linked time entry records when a rental sales order is copied.

**What problem does it solve?**
Ensures copied rental orders keep their linked time entries pointing to the new sales order and updates time entry descriptions accordingly.

**Primary Goal:**
Update time entry references and descriptions to match the copied sales order.

---

## 2. Goals

1. Identify all linked time entries on a copied sales order.
2. Update the time entry sales order reference.
3. Update time entry description fields with the new sales order tranid.

---

## 3. User Stories

1. **As an** admin, **I want** time entries updated when orders are copied **so that** links remain accurate.
2. **As a** dispatcher, **I want** time entry descriptions updated **so that** they match the current order.
3. **As a** developer, **I want** a reusable helper **so that** copy logic stays consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read `custcol_sna_linked_time` values from each item line on the sales order.
2. The system must de-duplicate time entry IDs and ignore empty values.
3. For each time entry ID, the system must update `custcol_sna_linked_so` to the new sales order ID.
4. After updating, the system must look up the sales order `tranid` and set:
   - `custcol_nxc_time_desc`
   - `memo`
5. The system must log audit details for successful updates and log errors on failure.

### Acceptance Criteria

- [ ] Linked time entries point to the new sales order after copy.
- [ ] Time entry description and memo match the new sales order tranid.
- [ ] Errors are logged without crashing the process.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or delete time entries.
- Update non-linked time entries.
- Validate sales order eligibility beyond linked fields.

---

## 6. Design Considerations

### User Interface
- None (server-side helper module).

### User Experience
- Linked time entries remain consistent after sales order copies.

### Design References
- Field `custcol_sna_linked_time` on sales order item lines.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Time Bill (Time Entry)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Used by consuming scripts
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order line | `custcol_sna_linked_time`
- Time Entry | `custcol_sna_linked_so`
- Time Entry | `custcol_nxc_time_desc`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One update per unique time entry referenced on the order.

**Data Sources:**
- Sales order line items and time entry records.

**Data Retention:**
- Updates existing time entry fields only.

### Technical Constraints
- Uses `record.submitFields.promise` followed by a synchronous submitFields.
- Assumes `custcol_sna_linked_time` contains time entry IDs.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Called by sales order copy logic.

### Governance Considerations
- One submitFields per time entry plus one lookupFields per update.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Linked time entries correctly reference the copied sales order.

**How we'll measure:**
- Spot check time entries for updated `custcol_sna_linked_so`, `custcol_nxc_time_desc`, and `memo`.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mod_rental_orders.js | Library | Update time entries on order copy | Implemented |

### Development Approach

**Phase 1:** Identify linked time entries
- [x] Extract and de-duplicate `custcol_sna_linked_time` values.

**Phase 2:** Update time entries
- [x] Update links and descriptions with the new order tranid.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Copy a sales order with linked time entries; time entries update.

**Edge Cases:**
1. Sales order has no linked time entries.
2. Duplicate time entry IDs in multiple lines.

**Error Handling:**
1. submitFields fails for a time entry; error logged.

### Test Data Requirements
- Sales order with `custcol_sna_linked_time` populated.

### Sandbox Setup
- Script using this module deployed on sales order copy workflow.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to time entries.

**Permissions required:**
- Edit Time Bill records
- View Sales Order records

### Data Security
- Updates only referenced time entry fields.

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

1. Upload `sna_hul_mod_rental_orders.js`.
2. Ensure consuming scripts reference the module.

### Post-Deployment

- [ ] Verify time entry updates after order copy.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove references to the module or redeploy prior version.

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

- [ ] Should the update be skipped if the time entry is locked or approved?
- [ ] Should the memo updates be optional?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Time entry update fails due to permissions | Med | Med | Ensure deployment role has edit access |
| Large number of time entries | Low | Med | Batch or limit updates if needed |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x record.submitFields and search.lookupFields

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
