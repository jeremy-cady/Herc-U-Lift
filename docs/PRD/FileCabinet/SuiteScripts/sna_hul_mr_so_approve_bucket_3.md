# PRD: Sales Order Approval Forwarding (Bucket 3)

**PRD ID:** PRD-UNKNOWN-SoApproveBucket3
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_so_approve_bucket_3.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that forwards Sales Orders out of Service Bucket 3 by triggering a workflow action.

**What problem does it solve?**
Automates routing of Sales Orders that should move out of Bucket 3 without manual workflow triggers.

**Primary Goal:**
Trigger the approval workflow for Sales Orders returned from a saved search.

---

## 2. Goals

1. Load a saved search configured for Bucket 3 routing.
2. Extract Sales Order IDs from the search results.
3. Trigger the workflow action for each Sales Order.

---

## 3. User Stories

1. **As a** service manager, **I want** Bucket 3 orders automatically forwarded **so that** approval routing is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from parameter `custscript_so_appr_fwd_bucket_3`.
2. The script must read `custevent_nx_case_transaction` from each search result to obtain the Sales Order ID.
3. The script must trigger workflow `customworkflow_sna_hul_so_approval_2` with action `workflowaction271` on the Sales Order.
4. The script must log errors without aborting the entire run.

### Acceptance Criteria

- [ ] Each Sales Order from the search triggers the workflow action.
- [ ] Errors are logged per record and do not stop processing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update Sales Order fields directly.
- Change search criteria within the script.

---

## 6. Design Considerations

### User Interface
- None; backend workflow trigger.

### User Experience
- Orders move through approval without manual intervention.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (`salesorder`)
- Support Case (`supportcase`) or search source record containing `custevent_nx_case_transaction`

**Script Types:**
- [x] Map/Reduce - Workflow trigger
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Case/Source Record | `custevent_nx_case_transaction`

**Saved Searches:**
- Search from parameter `custscript_so_appr_fwd_bucket_3`.

### Integration Points
- Workflow `customworkflow_sna_hul_so_approval_2` (action `workflowaction271`).

### Data Requirements

**Data Volume:**
- Processes all results from the configured search.

**Data Sources:**
- Saved search results containing Sales Order references.

**Data Retention:**
- No data retention beyond workflow triggers.

### Technical Constraints
- Requires workflow action to be active and accessible.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Workflow deployment and search configuration.

### Governance Considerations
- One workflow trigger per result row.

---

## 8. Success Metrics

- Sales Orders in Bucket 3 are forwarded via workflow without manual steps.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_so_approve_bucket_3.js | Map/Reduce | Trigger approval workflow for Bucket 3 orders | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load search and extract Sales Order IDs.
- **Phase 2:** Trigger approval workflow action per Sales Order.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Search returns Sales Orders and workflow triggers succeed.

**Edge Cases:**
1. Search result with missing `custevent_nx_case_transaction` is skipped.

**Error Handling:**
1. Workflow trigger failure is logged for the affected order.

### Test Data Requirements
- Saved search returning Sales Orders in Bucket 3.

### Sandbox Setup
- Ensure workflow `customworkflow_sna_hul_so_approval_2` is active.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or workflow admin roles.

**Permissions required:**
- Execute workflows on Sales Orders.

### Data Security
- Standard Sales Order access controls.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure search parameter `custscript_so_appr_fwd_bucket_3`.

### Deployment Steps
1. Upload `sna_hul_mr_so_approve_bucket_3.js`.
2. Deploy Map/Reduce with search parameter.

### Post-Deployment
- Validate a sample Sales Order moves forward in workflow.

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
- [ ] Which saved search should be used for production routing?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Workflow action disabled | Low | High | Validate workflow deployment before run |

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
