# PRD: Trigger Sales Order Approval Workflow

**PRD ID:** PRD-UNKNOWN-TriggerSoWorkflow
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_trigger_so_workflow.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Triggers a sales order approval workflow based on changes to a related support case.

**What problem does it solve?**
Keeps sales order case-closed flags and approval workflow in sync with the support case status.

**Primary Goal:**
Update custbody_sna_hul_case_closed on related sales orders and trigger the approval workflow when a case is closed.

---

## 2. Goals

1. Find sales orders linked to the case via custbody_nx_case.
2. Set or clear the case closed flag on the sales order.
3. Trigger the workflow when the case closes and the sales order is in service bucket 3.

---

## 3. User Stories

1. **As a** service manager, **I want to** sync case closure to sales orders **so that** approval state is accurate.
2. **As an** admin, **I want to** auto-trigger the approval workflow **so that** manual action is minimized.
3. **As a** user, **I want to** avoid updates on delete **so that** data is not changed unnecessarily.

---

## 4. Functional Requirements

### Core Functionality

1. On afterSubmit (non-delete), the system must search for sales orders where custbody_nx_case equals the case id.
2. If the case status is 5 (Closed) and the sales order service bucket equals 14, the system must set custbody_sna_hul_case_closed to true.
3. When the case is closed and bucket criteria match, the system must trigger workflow id 10 on the sales order.
4. When the case is not closed, the system must set custbody_sna_hul_case_closed to false.
5. The system must retry submitFields when encountering RCRD_HAS_BEEN_CHANGED errors (up to 5 attempts).

### Acceptance Criteria

- [ ] Related sales orders are updated with case closed true/false based on case status.
- [ ] Workflow is triggered when case status is Closed and service bucket is 14.
- [ ] Delete context does not trigger updates.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update sales orders not linked by custbody_nx_case.
- Change workflow id or approval logic beyond triggering.
- Handle case status values outside the configured Closed value.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Updates occur automatically after case save.

### Design References
- Workflow: SNA HUL Sales Order Approval (workflow id 10).

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Sales Order

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Case-based updates
- [ ] Client Script - N/A

**Custom Fields:**
- Sales Order | custbody_nx_case | Linked case
- Sales Order | custbody_sna_hul_case_closed | Case closed flag
- Sales Order | custbody_sna_hul_service_bucket_ | Service bucket

**Saved Searches:**
- None (ad hoc search)

### Integration Points
- Workflow trigger task on sales order

### Data Requirements

**Data Volume:**
- Per case, all linked sales orders.

**Data Sources:**
- Support case status

**Data Retention:**
- Case closed flag persisted on sales order

### Technical Constraints
- Workflow id is hard-coded to 10.
- RCRD_HAS_BEEN_CHANGED is handled with retries.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Sales order approval workflow

### Governance Considerations

- **Script governance:** Search and submitFields per linked order.
- **Search governance:** Simple sales order search by case id.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case closure consistently updates linked sales orders.
- Workflow triggers without manual intervention.

**How we'll measure:**
- Audit sales order field and workflow execution logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_trigger_so_workflow.js | User Event | Update SO and trigger workflow on case status | Implemented |

### Development Approach

**Phase 1:** Search and update
- [x] Find linked sales orders and set case closed flag.

**Phase 2:** Workflow trigger
- [x] Trigger workflow when case is closed and bucket criteria match.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Close a case linked to an SO with bucket 14, verify case closed flag and workflow trigger.

**Edge Cases:**
1. Case not closed, verify flag cleared on linked SO.
2. Case closed but bucket not 14, verify workflow not triggered.

**Error Handling:**
1. Record changed during update, verify retries occur.

### Test Data Requirements
- Support case linked to at least one sales order

### Sandbox Setup
- Ensure workflow id 10 exists in sandbox.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need permission to update sales orders and run workflows.

### Data Security
- Only updates the linked sales order flags.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Confirm workflow id 10 is active.

### Deployment Steps
1. Deploy User Event on Support Case.

### Post-Deployment
- Validate case closure updates in a test case.

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
- Should workflow id be parameterized instead of hard-coded?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Workflow id changes | Trigger fails | Update script or parameterize id |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script
- Workflow trigger task

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
