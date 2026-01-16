# PRD: Workflow Action - Check NextService Task Results

**PRD ID:** PRD-UNKNOWN-GetNxtSrvTask
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_wfa_get_nxtsrvctask.js (Workflow Action)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Workflow action script that checks sales order line tasks for a specific NextService task result.

**What problem does it solve?**
Enables workflow decisions based on whether any linked tasks have a "Job Complete & CPMNO" result.

**Primary Goal:**
Return true when any line task has result code 6, otherwise false.

---

## 2. Goals

1. Inspect each line's custcol_nx_task.
2. Check task result field custevent_nxc_task_result.
3. Return T when any task result is 6.

---

## 3. User Stories

1. **As a** workflow designer, **I want to** branch based on task results **so that** approvals reflect field outcomes.
2. **As a** service manager, **I want to** detect job completion tasks **so that** workflows can proceed.
3. **As an** admin, **I want to** avoid errors on empty task fields.

---

## 4. Functional Requirements

### Core Functionality

1. On action, the script must iterate item lines and read custcol_nx_task.
2. For each task id, the script must lookup custevent_nxc_task_result on the task record.
3. If any task result equals 6, the script must return 'T'.
4. If no task result equals 6, the script must return 'F'.

### Acceptance Criteria

- [ ] Returns 'T' when a line task result is 6.
- [ ] Returns 'F' when no line task has result 6.
- [ ] Handles empty task ids without errors.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update any records.
- Validate task ownership or status beyond result code.
- Load the sales order record explicitly (uses context.newRecord).

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Workflow action result is used for routing logic.

### Design References
- Task field: custevent_nxc_task_result

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (or deployed record type)
- Task

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A
- [x] Workflow Action - Task result checker

**Custom Fields:**
- Item line | custcol_nx_task | NextService task
- Task | custevent_nxc_task_result | Task result

**Saved Searches:**
- None

### Integration Points
- Task record lookups

### Data Requirements

**Data Volume:**
- Per sales order, all item lines.

**Data Sources:**
- Task records linked from line fields.

**Data Retention:**
- No data written.

### Technical Constraints
- Returns string 'T' or 'F' for workflow use.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Workflow using this action result

### Governance Considerations

- **Script governance:** One lookup per line with a task.
- **Search governance:** lookupFields per task id.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Workflow conditions correctly reflect task result presence.

**How we'll measure:**
- Validate workflow branch behavior on sales orders with tasks.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_wfa_get_nxtsrvctask.js | Workflow Action | Return true if any task result is 6 | Implemented |

### Development Approach

**Phase 1:** Line scan
- [x] Read custcol_nx_task values per line.

**Phase 2:** Task result check
- [x] Return T if any result equals 6.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales order with a task result 6, verify workflow action returns T.

**Edge Cases:**
1. Sales order with no tasks, verify action returns F.
2. Task without result field, verify action returns F.

**Error Handling:**
1. Task lookup fails, verify error logged and returns F.

### Test Data Requirements
- Sales order with item lines linked to tasks.

### Sandbox Setup
- Attach workflow action to a workflow for validation.

---

## 11. Security & Permissions

### Roles & Permissions
- Workflow execution role must have access to task records.

### Data Security
- No data is written.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Workflow action script deployed and assigned.

### Deployment Steps
1. Deploy workflow action script.
2. Attach to workflow condition.

### Post-Deployment
- Validate workflow branch behavior.

### Rollback Plan
- Remove the action from workflow or disable script.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should task result values be parameterized instead of hard-coded to 6?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Task result missing | Workflow branch fails | Validate task result configuration |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- Workflow Action Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
