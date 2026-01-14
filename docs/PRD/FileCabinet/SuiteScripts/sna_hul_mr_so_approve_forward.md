# PRD: Sales Order Approval Forwarding (Parts Bucket)

**PRD ID:** PRD-UNKNOWN-SoApproveForward
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_so_approve_forward.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that sets the Sales Order Service Bucket to Parts and triggers the approval workflow.

**What problem does it solve?**
Ensures Sales Orders flagged for parts processing move forward in the approval workflow with the correct bucket.

**Primary Goal:**
Update the Service Bucket and trigger the approval workflow for qualifying Sales Orders.

---

## 2. Goals

1. Load Sales Orders from a saved search parameter.
2. Set `custbody_sna_hul_service_bucket_` to Parts (1).
3. Trigger workflow `customworkflow_sna_hul_so_approval`.

---

## 3. User Stories

1. **As a** service coordinator, **I want** Sales Orders routed to Parts automatically **so that** approvals follow the correct flow.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from parameter `custscript_so_appr_fwd_bucket_search`.
2. The script must read `custevent_nx_case_transaction` from each result to obtain the Sales Order ID.
3. The script must update `custbody_sna_hul_service_bucket_` to `1` (Parts).
4. If submitFields fails, the script must retry via record load and save.
5. The script must trigger workflow `customworkflow_sna_hul_so_approval` action `workflowaction271`.

### Acceptance Criteria

- [ ] Sales Orders have Service Bucket set to Parts.
- [ ] Approval workflow action is triggered for each order.
- [ ] Errors are logged without halting the run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify other Sales Order fields.
- Change workflow definitions or routing rules.

---

## 6. Design Considerations

### User Interface
- None; backend automation.

### User Experience
- Orders progress through approval with correct bucket assignment.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (`salesorder`)
- Support Case (`supportcase`) or search source record containing `custevent_nx_case_transaction`

**Script Types:**
- [x] Map/Reduce - Bucket update and workflow trigger
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `custbody_sna_hul_service_bucket_`
- Case/Source Record | `custevent_nx_case_transaction`

**Saved Searches:**
- Search from parameter `custscript_so_appr_fwd_bucket_search`.

### Integration Points
- Workflow `customworkflow_sna_hul_so_approval` (action `workflowaction271`).

### Data Requirements

**Data Volume:**
- Processes all results from the configured search.

**Data Sources:**
- Saved search results containing Sales Order references.

**Data Retention:**
- No data retention beyond Sales Order updates.

### Technical Constraints
- Requires Service Bucket field and workflow to be active.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Workflow deployment and search configuration.

### Governance Considerations
- One Sales Order update and workflow trigger per result row.

---

## 8. Success Metrics

- Sales Orders are routed to Parts bucket and approval workflow is triggered.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_so_approve_forward.js | Map/Reduce | Update bucket and trigger approval workflow | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load search results and identify Sales Orders.
- **Phase 2:** Update Service Bucket and trigger workflow.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales Orders from the search update bucket and trigger workflow.

**Edge Cases:**
1. SubmitFields failure retries via record load and save.

**Error Handling:**
1. Workflow trigger failure is logged.

### Test Data Requirements
- Saved search returning Sales Orders that should move to Parts.

### Sandbox Setup
- Ensure workflow `customworkflow_sna_hul_so_approval` is active.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or workflow admin roles.

**Permissions required:**
- Edit Sales Orders and execute workflows.

### Data Security
- Standard Sales Order access controls.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure search parameter `custscript_so_appr_fwd_bucket_search`.

### Deployment Steps
1. Upload `sna_hul_mr_so_approve_forward.js`.
2. Deploy Map/Reduce with search parameter.

### Post-Deployment
- Validate Service Bucket changes on sample orders.

### Rollback Plan
- Disable the script deployment.

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
- [ ] Should the workflow trigger be conditional on current bucket value?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect bucket assignment | Low | Med | Validate search criteria and bucket value |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- Workflow.trigger

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
