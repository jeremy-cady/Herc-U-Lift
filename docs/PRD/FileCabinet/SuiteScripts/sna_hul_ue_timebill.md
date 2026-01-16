# PRD: Time Bill Linked Sales Order Sync

**PRD ID:** PRD-UNKNOWN-TimeBillLinkedSo
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_timebill.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Triggers a Suitelet to sync time bill changes to a linked sales order line.

**What problem does it solve?**
Ensures time entry updates are propagated to the related sales order workflow for resource items.

**Primary Goal:**
Initiate a Suitelet call after time bill save when a linked sales order exists.

---

## 2. Goals

1. Detect time bills linked to sales orders.
2. Pass time bill details to the Suitelet for downstream processing.
3. Avoid processing deletes.

---

## 3. User Stories

1. **As a** dispatcher, **I want to** sync time bill changes **so that** sales order service hours stay accurate.
2. **As a** system admin, **I want to** run the sync via Suitelet **so that** logic stays centralized.
3. **As a** user, **I want to** avoid sync on delete **so that** no stale updates occur.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit, the system must read custcol_sna_linked_so, hours, and posted for the time bill.
2. If linked to a sales order, the system must locate the linked line via custcol_sna_linked_time.
3. On afterSubmit (non-delete), the system must call the Suitelet with time bill and sales order details.
4. In UI context, the system must redirect to the Suitelet; in Suitelet context, it must POST to the Suitelet URL.

### Acceptance Criteria

- [ ] Time bills with linked sales orders trigger a Suitelet call.
- [ ] Deletes do not trigger Suitelet calls.
- [ ] Suitelet receives parameters: recid, linkedso, hours, timeposted, resource.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Directly update sales order lines in the User Event script.
- Validate time bill hours against sales order status (checks are logged only).
- Handle Suitelet failures beyond logging.

---

## 6. Design Considerations

### User Interface
- UI saves redirect to the Suitelet for processing.

### User Experience
- Users may experience a redirect after saving time bills in UI.

### Design References
- Suitelet: customscript_sna_hul_sl_time_so

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Time Bill
- Sales Order

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Time bill sync handler
- [ ] RESTlet - N/A
- [x] User Event - Trigger suitelet
- [ ] Client Script - N/A

**Custom Fields:**
- Time Bill | custcol_sna_linked_so | Linked sales order
- Sales Order line | custcol_sna_linked_time | Linked time id
- Sales Order line | custcol_sna_hul_act_service_hours | Actual service hours
- Sales Order line | custcol_nx_task | NXC task
- Sales Order line | custcol_sna_service_itemcode | Service code type

**Saved Searches:**
- None

### Integration Points
- Suitelet: customscript_sna_hul_sl_time_so

### Data Requirements

**Data Volume:**
- Per time bill save.

**Data Sources:**
- Time bill and linked sales order.

**Data Retention:**
- No new data stored by this script.

### Technical Constraints
- UI context uses redirect, which changes user flow after save.
- Suitelet context uses HTTPS POST to the resolved URL.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Suitelet processing for time bill to sales order sync

### Governance Considerations

- **Script governance:** Loads linked sales order in beforeSubmit when linkedso is present.
- **Search governance:** None.
- **API limits:** HTTPS call to Suitelet in non-UI context.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Linked sales order updates occur via Suitelet after time bill save.

**How we'll measure:**
- Verify Suitelet logs for incoming parameters.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_timebill.js | User Event | Trigger time bill Suitelet sync | Implemented |

### Development Approach

**Phase 1:** Link detection
- [x] Read linked sales order and time bill details.

**Phase 2:** Suitelet trigger
- [x] Redirect or POST to Suitelet based on context.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a time bill linked to a sales order, verify Suitelet is called.

**Edge Cases:**
1. Time bill without linked sales order, verify no Suitelet call.
2. Delete a time bill, verify no Suitelet call.

**Error Handling:**
1. Suitelet unreachable, verify error logged and save completes.

### Test Data Requirements
- Sales order with line linked to time bill.

### Sandbox Setup
- Deploy Suitelet customscript_sna_hul_sl_time_so.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to time bills and sales orders.

### Data Security
- Only passes identifiers and hours to the Suitelet.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Suitelet deployment is active and accessible.

### Deployment Steps
1. Deploy User Event to Time Bill.

### Post-Deployment
- Validate a linked time bill save triggers the Suitelet.

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
- Should UI redirect be replaced with background processing to avoid navigation?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Suitelet failure | Linked SO not updated | Monitor logs and retry manually |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script
- Time Bill record

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
