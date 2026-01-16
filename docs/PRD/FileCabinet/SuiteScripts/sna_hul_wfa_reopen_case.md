# PRD: Reopen Case from Sales Order Workflow Action

**PRD ID:** PRD-UNKNOWN-ReopenCase
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_wfa_reopen_case.js (Workflow Action)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Workflow action that reopens a linked support case and clears the sales order case-closed flag based on service bucket.

**What problem does it solve?**
Ensures cases are reopened when a sales order is routed back to Parts service bucket.

**Primary Goal:**
Set the linked support case status to 4 and clear custbody_sna_hul_case_closed when service bucket is Parts.

---

## 2. Goals

1. Detect when the sales order service bucket is Parts (id 1).
2. Reopen the linked support case.
3. Clear the sales order case-closed flag.

---

## 3. User Stories

1. **As a** service manager, **I want to** reopen cases when orders return to Parts **so that** case status stays accurate.
2. **As an** admin, **I want to** automate the update **so that** manual edits are unnecessary.
3. **As a** user, **I want to** avoid errors if no case is linked.

---

## 4. Functional Requirements

### Core Functionality

1. On action, the system must read custbody_sna_hul_service_bucket_ from the sales order.
2. If the bucket equals 1, the system must submitFields to set the linked support case status to 4.
3. If the bucket equals 1, the system must set custbody_sna_hul_case_closed to false on the sales order record in context.

### Acceptance Criteria

- [ ] When service bucket is Parts, linked case status is set to 4.
- [ ] The sales order case-closed flag is cleared.
- [ ] No error is thrown when there is no linked case.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update the sales order via submitFields.
- Change case status for other service buckets.
- Validate case status transitions beyond setting status 4.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Workflow action performs updates during workflow execution.

### Design References
- Support case status value 4 (reopen).

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Support Case

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A
- [x] Workflow Action - Reopen case

**Custom Fields:**
- Sales Order | custbody_sna_hul_service_bucket_ | Service bucket
- Sales Order | custbody_nx_case | Linked case
- Sales Order | custbody_sna_hul_case_closed | Case closed flag

**Saved Searches:**
- None

### Integration Points
- Support case record update

### Data Requirements

**Data Volume:**
- Per workflow action execution.

**Data Sources:**
- Sales order header fields.

**Data Retention:**
- Updates persisted on support case and sales order.

### Technical Constraints
- Case status id is hard-coded to 4.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Workflow that calls this action

### Governance Considerations

- **Script governance:** One submitFields call when case is linked.
- **Search governance:** None.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Cases are reopened and sales order flags are cleared when service bucket is Parts.

**How we'll measure:**
- Audit logs and field values on linked case and sales order.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_wfa_reopen_case.js | Workflow Action | Reopen linked case and clear flag | Implemented |

### Development Approach

**Phase 1:** Case update
- [x] Update support case status to 4.

**Phase 2:** Sales order flag
- [x] Clear custbody_sna_hul_case_closed.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales order with service bucket 1 and linked case, verify case status set to 4 and flag cleared.

**Edge Cases:**
1. Sales order without linked case, verify no error.

**Error Handling:**
1. Case update fails, verify error logged.

### Test Data Requirements
- Sales order linked to a support case.

### Sandbox Setup
- Deploy workflow action and attach to workflow condition.

---

## 11. Security & Permissions

### Roles & Permissions
- Workflow execution role must have permission to edit support cases.

### Data Security
- Updates limited to status and case-closed flag.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Confirm status id 4 is correct for reopen.

### Deployment Steps
1. Deploy workflow action script.
2. Attach to workflow on sales order.

### Post-Deployment
- Validate with a test sales order.

### Rollback Plan
- Remove action from workflow or disable script.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should the sales order field be updated with submitFields instead of in-memory setValue?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Status id changes | Case not reopened | Validate status mapping in each environment |

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
