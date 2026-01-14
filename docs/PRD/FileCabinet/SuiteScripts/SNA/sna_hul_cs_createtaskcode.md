# PRD: Task Code Entry and Validation (Client Script)

**PRD ID:** PRD-UNKNOWN-TaskCodeCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_createtaskcode.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that manages task code entry, validation, and synchronization between a custom task code sublist and item lines.

**What problem does it solve?**
Ensures task codes are unique and that item lines inherit the correct group/work/repair codes and descriptions from the task code list.

**Primary Goal:**
Keep task code sublist data consistent and populate related fields on item lines.

---

## 2. Goals

1. Prevent duplicate task codes in the task code sublist.
2. Require task code and description when adding task codes.
3. Populate item line fields based on selected task codes.

---

## 3. User Stories

1. **As a** service coordinator, **I want** task codes validated **so that** duplicates are prevented.
2. **As a** sales rep, **I want** item lines to inherit task details **so that** task metadata is accurate.
3. **As an** admin, **I want** consistent task descriptions **so that** reporting is clean.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `fieldChanged` and `validateLine` for task code and item sublists.
2. When adding/updating a task code in `recmachcustrecord_tc_quoteestimateid`, the system must:
   - Require `custrecord_tc_taskcode` and `custrecord_tc_description`.
   - Prevent duplicate task codes by checking existing lines.
3. When `custrecord_tc_workcode` or `custrecord_tc_groupcode` changes, the system must update `custrecord_tc_description` using sublist text values.
4. When `custcol_sna_task_code` changes on item lines, the system must populate:
   - `custcol_sna_group_code`
   - `custcol_sna_work_code`
   - `custcol_sna_repair_code`
   - `custcol_sna_task_description`

### Acceptance Criteria

- [ ] Duplicate task codes are blocked with an alert.
- [ ] Missing task code or description prevents line validation.
- [ ] Item line task fields are populated from the task code sublist.
- [ ] Task description updates when group/work code changes.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create task codes server-side.
- Validate task codes against external records.
- Update non-related sublists.

---

## 6. Design Considerations

### User Interface
- Task code management occurs in a custom sublist (`recmachcustrecord_tc_quoteestimateid`).

### User Experience
- Users receive immediate validation feedback when entering task codes.

### Design References
- Task code custom record fields used in the sublist.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transactions that include the task code sublist and item sublist.
- Custom Task Code record linked via `recmachcustrecord_tc_quoteestimateid`.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Task code UI handling

**Custom Fields:**
- Task Code sublist: `custrecord_tc_taskcode`, `custrecord_tc_description`, `custrecord_tc_groupcode`, `custrecord_tc_workcode`, `custrecord_tc_repaircode`
- Item line: `custcol_sna_task_code`, `custcol_sna_group_code`, `custcol_sna_work_code`, `custcol_sna_repair_code`, `custcol_sna_task_description`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per line entry on task code and item sublists.

**Data Sources:**
- Task code sublist values.

**Data Retention:**
- Updates line-level fields only.

### Technical Constraints
- Uses `getCurrentSublistText` to derive display values for description.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Task code custom record must be present on the form.

### Governance Considerations
- Client-side operations only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Task codes are unique and item lines reflect correct task details.

**How we'll measure:**
- Review saved transactions for task code consistency.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_createtaskcode.js | Client Script | Task code validation and field sync | Implemented |

### Development Approach

**Phase 1:** Validation
- [x] Enforce mandatory fields and prevent duplicates.

**Phase 2:** Field sync
- [x] Populate item line fields and descriptions.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add a task code line with valid values; line saves.
2. Select a task code on an item line; fields populate.

**Edge Cases:**
1. Duplicate task code entered; validation stops line save.
2. Missing description; validation stops line save.

**Error Handling:**
1. Task code not found in sublist for item line; no values set.

### Test Data Requirements
- Task code sublist lines with group/work/repair codes.

### Sandbox Setup
- Client script deployed on forms with task code sublist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users managing task code sublist and item lines.

**Permissions required:**
- Standard edit access to the transaction form.

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_cs_createtaskcode.js`.
2. Deploy to forms that include the task code sublist.
3. Validate task code entry behavior.

### Post-Deployment

- [ ] Verify task code validations and item line updates.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the form.

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

- [ ] Should the script block duplicate descriptions as well as codes?
- [ ] Should task code validation run on saveRecord?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Task code sublist not present on form | Med | Med | Add form validation or guard clauses |
| Client script conflicts with other pricing scripts | Low | Med | Coordinate deployment order |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
