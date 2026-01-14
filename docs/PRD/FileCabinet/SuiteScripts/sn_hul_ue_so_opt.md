# PRD: Optimized SO Line Codes and PO Link (User Event)

**PRD ID:** PRD-UNKNOWN-SOOpt
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_ue_so_opt.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
An optimized User Event that sets task code fields on Sales Order item lines based on case revenue stream and links created POs back to the line.

**What problem does it solve?**
Ensures consistent repair/work/group code population and maintains PO linkage on Sales Order lines.

**Primary Goal:**
Populate item line codes and link created POs, with optional auto-close logic for specific rental lines.

---

## 2. Goals

1. Set repair/work/group codes on SO lines using the case revenue stream.
2. Preserve task codes when flagged to retain them.
3. Link created PO IDs to `custcol_sna_linked_po`.
4. Auto-close rental delivery lines under specific conditions.

---

## 3. User Stories

1. **As a** service user, **I want** line codes set automatically **so that** coding is consistent.
2. **As a** purchasing user, **I want** linked POs on SO lines **so that** I can trace procurement.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on create, edit, dropship, special order, and approve contexts.
2. When `custbody_nx_case` is present, the system must lookup revenue stream codes and set `custcol_sna_repair_code`, `custcol_sna_work_code`, and `custcol_sna_group_code` on each item line.
3. If revenue stream codes are empty and `custcol_sna_hul_nxc_retain_task_codes` is true, the system must copy prior line codes.
4. The system must set `custcol_sna_linked_po` when `createdpo` is present.
5. On edit, the system must set `isclosed` for rental delivery lines when item, task type, and amount conditions are met.

### Acceptance Criteria

- [ ] Item lines receive correct codes based on revenue stream.
- [ ] Created PO IDs are copied to linked PO field.
- [ ] Rental delivery lines are closed when criteria match.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or edit POs directly.
- Modify codes when no case is present and no retain flag is set.

---

## 6. Design Considerations

### User Interface
- No UI changes; beforeSubmit logic only.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Support Case
- Revenue Stream (`customrecord_cseg_sna_revenue_st`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - SO line updates
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `custbody_nx_case`
- Sales Order line | `custcol_sna_repair_code`
- Sales Order line | `custcol_sna_work_code`
- Sales Order line | `custcol_sna_group_code`
- Sales Order line | `custcol_sna_linked_po`
- Sales Order line | `custcol_sna_hul_nxc_retain_task_codes`
- Sales Order line | `custcol_sn_nx_task_type`

**Saved Searches:**
- None; lookupFields used.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- All item lines on Sales Orders.

**Data Sources:**
- Support case revenue stream fields.

**Data Retention:**
- Updates line fields on the transaction.

### Technical Constraints
- Uses script parameters `custscript_sn_rental_delivery_internal` and `custscript_sn_task_type_check_in`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.

### Governance Considerations
- lookupFields per transaction; line updates per line.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- SO lines have consistent codes and PO links.

**How we'll measure:**
- Spot check SOs created from cases.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_ue_so_opt.js | User Event | Set line codes and link POs | Implemented |

### Development Approach

**Phase 1:** Code population
- [x] Set codes from revenue stream or retain previous.

**Phase 2:** PO link and auto-close
- [x] Link PO IDs and close rental lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. SO with case and revenue stream codes sets line codes.
2. SO line with created PO sets linked PO field.

**Edge Cases:**
1. Revenue stream codes missing and retain flag false; no code updates.
2. Rental delivery line meets criteria; line is closed.

**Error Handling:**
1. Lookup errors logged without blocking save.

### Test Data Requirements
- Sales Orders with linked cases and line items.

### Sandbox Setup
- Configure script parameters for rental delivery and check-in task type.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and service users.

**Permissions required:**
- Edit Sales Orders
- View support cases and revenue stream records

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

1. Upload `sn_hul_ue_so_opt.js`.
2. Deploy on Sales Order.
3. Configure required script parameters.

### Post-Deployment

- [ ] Verify line code updates and PO links.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should code values be re-applied on edit when case changes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect retain logic results in wrong codes | Low | Med | Add validation for prior line availability |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
