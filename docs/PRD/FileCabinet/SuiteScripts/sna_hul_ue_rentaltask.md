# PRD: Rental Task Updates

**PRD ID:** PRD-UNKNOWN-RentalTask
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_rentaltask.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that updates rental objects, assets, and related sales orders based on NextService task activity.

**What problem does it solve?**
Keeps rental asset status, sales order data, and task links in sync with delivery, pickup, check-in, and workshop tasks.

**Primary Goal:**
Apply task-driven status and transaction updates automatically when tasks are created or completed.

---

## 2. Goals

1. Update object and rental statuses based on task type and case type.
2. Update sales order return details and hour meter values from completed tasks.
3. Ensure related sales orders reference the originating task.

---

## 3. User Stories

1. **As a** dispatcher, **I want to** have task completion update asset and order statuses **so that** rental operations stay accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On task create/edit (excluding delete), the script must load the task, linked asset, and support case details.
2. For pickup and delivery tasks, the script must update object status and rental status per configured task/case types.
3. For completed pickup tasks, the script must update related sales order return values and latest hour meters.
4. For delivery tasks, the script must update the sales order and create fulfillment data as needed for delivered equipment.
5. When a case is linked and the sales order has no task reference, the script must set `custbody_nx_task` on the sales order.
6. For workshop tasks marked complete, the script must update asset site/customer based on employee location.

### Acceptance Criteria

- [ ] Object and rental statuses update based on task type and case type.
- [ ] Sales order return details update when pickup tasks complete.
- [ ] Sales orders link back to the task when missing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update tasks that are deleted.
- Change task scheduling or assignment.

---

## 6. Design Considerations

### User Interface
- No direct UI changes.

### User Experience
- Operational fields update automatically after task actions.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- task
- supportcase
- customrecord_sna_objects
- customrecord_sna_equipment_asset
- salesorder
- itemfulfillment

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Task-driven updates
- [ ] Client Script - N/A

**Custom Fields:**
- task | custevent_nx_task_type | Task type
- task | custevent_nx_task_asset | Task asset
- task | custevent_nxc_task_result | Task result
- supportcase | custevent_nx_case_type | Case type
- supportcase | custevent_nx_case_transaction | Related transaction
- salesorder | custbody_nx_task | Task reference
- customrecord_sna_objects | custrecord_sna_rental_status | Rental status
- customrecord_sna_objects | custrecord_sna_status | Object status

**Saved Searches:**
- customsearch_sn_hul_latest_hm (latest hour meters)

### Integration Points
- Sales Order updates and Item Fulfillment creation.

### Data Requirements

**Data Volume:**
- Per-task lookup of assets, cases, and related objects.

**Data Sources:**
- Task, support case, and object records.

**Data Retention:**
- Updates persist on object and sales order records.

### Technical Constraints
- Uses script parameters for task types and status values.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Task types, case types, and status values configured as script parameters

### Governance Considerations

- **Script governance:** Multiple searches and submitFields, plus fulfillment creation.
- **Search governance:** Support case and object lookups.
- **API limits:** Moderate on high task volume.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental status and sales order data remain in sync with task completion.

**How we'll measure:**
- Review task completion outcomes vs object and sales order updates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_rentaltask.js | User Event | Update objects and sales orders from task changes | Implemented |

### Development Approach

**Phase 1:** Task and case evaluation
- [ ] Validate task and case type mappings

**Phase 2:** Object and sales order updates
- [ ] Validate status changes and SO updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Complete a pickup task and verify SO return details update.
2. Complete a delivery task and verify object status and SO updates.

**Edge Cases:**
1. Task without asset or support case should not update records.

**Error Handling:**
1. Missing parameter values should log errors without breaking task save.

### Test Data Requirements
- Tasks with linked assets and support cases.

### Sandbox Setup
- Deploy User Event on task record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Dispatch and operations roles

**Permissions required:**
- Edit tasks
- Edit objects and sales orders

### Data Security
- Updates limited to operational records.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure script parameters for task and case types

### Deployment Steps

1. Deploy User Event on task record.
2. Validate updates on task completion.

### Post-Deployment

- [ ] Monitor logs for missing data warnings

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Perform manual updates until resolved.

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

- [ ] Which task types should create or update item fulfillments?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing or incorrect task parameters | Med | Med | Validate parameter setup and log warnings |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.
