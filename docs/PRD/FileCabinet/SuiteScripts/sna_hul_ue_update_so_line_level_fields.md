# PRD: Update SO Line-Level Fields from Header

**PRD ID:** PRD-UNKNOWN-UpdateSoLineLevelFields
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_update_so_line_level_fields.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Copies selected header values to item lines after submit and fills missing locations from assigned employees.

**What problem does it solve?**
Ensures line-level segments and assets match header values or are populated when missing.

**Primary Goal:**
Propagate header values to line fields with optional override behavior.

---

## 2. Goals

1. Apply header revenue stream and asset values to lines.
2. Fill missing locations from assigned-to employee location when header location is blank.
3. Respect override flags for line updates.

---

## 3. User Stories

1. **As a** sales user, **I want to** apply header segments to lines **so that** data entry is consistent.
2. **As a** dispatcher, **I want to** auto-populate locations from assigned employees **so that** routing uses the right location.
3. **As an** admin, **I want to** control override behavior **so that** manual line values are preserved.

---

## 4. Functional Requirements

### Core Functionality

1. On afterSubmit (non-delete), the system must load the transaction and gather header fields for location, revenue stream, and NXC assets.
2. If header location is empty, the system must look up assigned-to employee locations and set the header location to the first found.
3. For each line, the system must set line fields from header values when override flags are true, or when the line value is empty.
4. The system must save the transaction after updates.

### Acceptance Criteria

- [ ] Line revenue stream and asset fields are populated from header values as configured.
- [ ] Missing header location is set from assigned employee location when available.
- [ ] Line values are not overwritten when override flags are false and line values are present.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update department lines (currently commented out).
- Change header values other than location when missing.
- Handle delete context.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Line values are updated after save.

### Design References
- None

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (or deployed transaction type)
- Employee

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Line updates
- [ ] Client Script - N/A

**Custom Fields:**
- Transaction header | custbody_sna_hul_apply_dept_all | Apply department to all
- Transaction header | custbody_sna_hul_apply_rev_all | Apply revenue stream to all
- Transaction header | custbody_nx_asset | NXC site asset
- Transaction header | custbody_sna_hul_nxc_eq_asset | NXC equipment asset
- Item line | cseg_sna_revenue_st | Revenue stream
- Item line | custcol_nx_asset | NXC site asset
- Item line | custcol_nxc_equip_asset | NXC equipment asset
- Item line | custcol_sna_task_assigned_to | Assigned to
- Employee | custentity_nx_location | Employee location

**Saved Searches:**
- None (ad hoc search for employee locations)

### Integration Points
- Employee record lookup for location

### Data Requirements

**Data Volume:**
- Per transaction, all item lines.

**Data Sources:**
- Header values and assigned-to employee locations.

**Data Retention:**
- Line values persisted on transaction.

### Technical Constraints
- Override flags for site and equipment assets currently use custbody_sna_hul_apply_rev_all.
- Department propagation is commented out.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Assigned-to employee location values

### Governance Considerations

- **Script governance:** Loads and saves the transaction.
- **Search governance:** Employee lookup by assigned-to list.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Line-level segment values are consistent with header values.
- Missing location is filled based on assigned employees.

**How we'll measure:**
- Compare header and line values after save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_update_so_line_level_fields.js | User Event | Propagate header values to lines | Implemented |

### Development Approach

**Phase 1:** Header value collection
- [x] Read header values and override flags.

**Phase 2:** Line updates
- [x] Apply values to lines and save.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Set header revenue stream and assets, save, verify lines updated.

**Edge Cases:**
1. Header location blank, assigned-to has location, verify header and line location set.
2. Line already has value and override flag false, verify line not overwritten.

**Error Handling:**
1. Employee lookup fails, verify script logs error and continues.

### Test Data Requirements
- Sales order with assigned-to employees and header values.

### Sandbox Setup
- Deploy User Event on the target transaction type.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to transactions and employee records.

### Data Security
- Updates only the current transaction and line fields.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Confirm override fields are configured on the form.

### Deployment Steps
1. Deploy User Event to sales order.

### Post-Deployment
- Validate line values on a test order.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should override flags for assets use distinct header fields instead of custbody_sna_hul_apply_rev_all?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Override flags misconfigured | Unexpected line updates | Validate header flag mapping |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
