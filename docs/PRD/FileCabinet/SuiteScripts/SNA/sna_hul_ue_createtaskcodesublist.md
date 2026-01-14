# PRD: Update Task Code Details on Item Lines (User Event)

**PRD ID:** PRD-UNKNOWN-CreateTaskCodeSublist
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_createtaskcodesublist.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that updates item sublist task detail fields based on the selected task code.

**What problem does it solve?**
Ensures item lines inherit group, work, repair, and description details from the task code sublist.

**Primary Goal:**
Synchronize task code details from the task code sublist to item line fields before submit.

---

## 2. Goals

1. Read task code values on item lines.
2. Find matching task code records on the task code sublist.
3. Populate group/work/repair/description fields on item lines.

---

## 3. User Stories

1. **As a** service user, **I want** task details filled automatically **so that** I do not have to retype them.
2. **As an** admin, **I want** item line task fields consistent with task code records **so that** reporting is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run before submit on supported records.
2. The system must read `custcol_sna_task_code` on each item line.
3. The system must find the matching task code line on the `recmachcustrecord_tc_quoteestimateid` sublist.
4. The system must set `custcol_sna_group_code`, `custcol_sna_work_code`, `custcol_sna_repair_code`, and `custcol_sna_task_description` based on the task code sublist values.

### Acceptance Criteria

- [ ] Item line task detail fields populate when task code is set.
- [ ] No changes occur if task code is empty or not found.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or edit task code records.
- Provide a UI for task code management.
- Validate task code data beyond matching values.

---

## 6. Design Considerations

### User Interface
- No UI changes; data is updated before submit.

### User Experience
- Users see task detail fields populated after save.

### Design References
- Task code sublist `recmachcustrecord_tc_quoteestimateid`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Records with item sublist and task code sublist (e.g., Estimate, Sales Order, Invoice)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Updates item sublist fields
- [ ] Client Script - Not used

**Custom Fields:**
- Item line | `custcol_sna_task_code`
- Item line | `custcol_sna_group_code`
- Item line | `custcol_sna_work_code`
- Item line | `custcol_sna_repair_code`
- Item line | `custcol_sna_task_description`
- Task code sublist | `custrecord_tc_groupcode`, `custrecord_tc_workcode`, `custrecord_tc_repaircode`, `custrecord_tc_description`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Updates per item line on submit.

**Data Sources:**
- Task code sublist on the transaction.

**Data Retention:**
- Updates item line fields only.

### Technical Constraints
- Depends on task code sublist being available on the record.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Task code sublist configuration.

### Governance Considerations
- Minimal per-submit operations.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Item lines have the correct task details after save.

**How we'll measure:**
- Verify saved item line fields match task code details.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_createtaskcodesublist.js | User Event | Populate task details on item lines | Implemented |

### Development Approach

**Phase 1:** Task code lookup
- [x] Find matching task code line.

**Phase 2:** Field updates
- [x] Copy task details to item lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add a task code to an item line and save; task detail fields populate.

**Edge Cases:**
1. Task code not found in sublist; no changes.
2. Item line without task code; no changes.

**Error Handling:**
1. Exceptions logged without blocking save.

### Test Data Requirements
- Record with task code sublist populated.

### Sandbox Setup
- Ensure task code sublist is present on the record form.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users editing transactions with task codes.

**Permissions required:**
- Edit transaction records

### Data Security
- No additional sensitive data exposure.

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

1. Upload `sna_hul_ue_createtaskcodesublist.js`.
2. Deploy User Event on supported transaction types.

### Post-Deployment

- [ ] Verify task detail updates on save.
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

- [ ] Should task details update on edit only when the task code changes?
- [ ] Should this run on additional record types?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Task code sublist missing on form | Med | Med | Validate sublist presence before update |
| Large item counts increase save time | Low | Med | Optimize lookup or limit updates |

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
