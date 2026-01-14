# PRD: Hide Line Item Columns on Create (Client Script)

**PRD ID:** PRD-UNKNOWN-HideLineItemColsCreateCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_cols_on_create_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that hides a specific item sublist column when creating transactions for certain roles.

**What problem does it solve?**
Reduces line-item clutter for partner roles during record creation by hiding an internal service hours column.

**Primary Goal:**
Hide `custcol_sna_hul_act_service_hours` on create for specific roles.

---

## 2. Goals

1. Run only in create mode.
2. Match current user role to a defined list.
3. Hide the target item sublist field.

---

## 3. User Stories

1. **As a** partner user, **I want** internal service hour fields hidden **so that** data entry is simpler.
2. **As an** admin, **I want** partner roles limited to relevant fields **so that** forms are clean.
3. **As a** support user, **I want** the rule applied only on create **so that** edit views remain unchanged.

---

## 4. Functional Requirements

### Core Functionality

1. The system must execute on `pageInit`.
2. The system must only run when `ctx.mode === 'create'`.
3. The system must check the current user role against:
   - 3, 1175, 1174, 1185, 1163, 1168, 1152
4. When role matches, the system must hide `custcol_sna_hul_act_service_hours` on the item sublist.
5. Errors must be logged but not block the page.

### Acceptance Criteria

- [ ] The target column is hidden for listed roles on create.
- [ ] Other roles see the column normally.
- [ ] Script does not run on edit/copy.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Hide other columns.
- Apply to view/edit modes.
- Enforce server-side security.

---

## 6. Design Considerations

### User Interface
- Hides a single item sublist field on create.

### User Experience
- Less clutter for partner roles during item entry.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transactions with `item` sublist.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Hide column on create

**Custom Fields:**
- Item sublist | `custcol_sna_hul_act_service_hours`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- N/A.

**Data Sources:**
- Current record and user role.

**Data Retention:**
- None.

### Technical Constraints
- Relies on `getSublistField` for line 0 only.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Role IDs must remain accurate.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- The specified roles no longer see the service hours column on create.

**How we'll measure:**
- UI checks in create mode.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_hide_line_item_cols_on_create_cs.js | Client Script | Hide service hours column on create | Implemented |

### Development Approach

**Phase 1:** Role gate
- [x] Check role list on create

**Phase 2:** Hide field
- [x] Hide `custcol_sna_hul_act_service_hours`

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a transaction as a listed role; column is hidden.
2. Create a transaction as a non-listed role; column is visible.

**Edge Cases:**
1. Sublist field missing on form; script logs error.

**Error Handling:**
1. Exceptions in pageInit do not block the page.

### Test Data Requirements
- Any transaction with an item sublist.

### Sandbox Setup
- Ensure the target field is on the form for testing.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles listed in the script.

**Permissions required:**
- Standard create permissions on target transactions.

### Data Security
- UI control only; not a security control.

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

1. Upload `hul_hide_line_item_cols_on_create_cs.js`.
2. Deploy as a client script on target transaction forms.
3. Verify role behavior in create mode.

### Post-Deployment

- [ ] Confirm column visibility by role.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the client script deployment.

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

- [ ] Should additional columns be hidden on create?
- [ ] Should line-based hiding apply to all lines, not just line 0?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Field not present on form | Med | Low | Log error; no blocking |
| Role list changes | Med | Med | Validate role IDs per environment |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_cs_partner_script_ue.md

### NetSuite Documentation
- SuiteScript 2.x Client Script
- currentRecord.getSublistField

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
