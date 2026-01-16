# PRD: Link Sales Order on Purchase Orders

**PRD ID:** PRD-UNKNOWN-LinkSO
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_link_so.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that links Purchase Order lines to the originating Sales Order and sets PO type for dropship or special order.

**What problem does it solve?**
Ensures Purchase Orders maintain a direct reference to the originating Sales Order and correct PO type classification.

**Primary Goal:**
Populate `custcol_sna_linked_so` on PO lines and set PO type for dropship/special order.

---

## 2. Goals

1. Set PO type for dropship and special order POs.
2. Populate linked Sales Order on PO lines when created from a Sales Order.

---

## 3. User Stories

1. **As a** buyer, **I want to** see the originating Sales Order on PO lines **so that** I can track fulfillment context.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on PO create/dropship/special order events.
2. If dropship, set `custbody_po_type` to 3.
3. If special order, set `custbody_po_type` to 6.
4. If `createdfrom` exists, set `custcol_sna_linked_so` on all item lines.

### Acceptance Criteria

- [ ] PO type is set for dropship and special order POs.
- [ ] Linked Sales Order is populated on PO lines.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate Sales Order status.
- Populate linked SO on POs without createdfrom.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Linked Sales Order appears automatically on PO lines.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- purchaseorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Link Sales Order
- [ ] Client Script - N/A

**Custom Fields:**
- purchaseorder | custbody_po_type | PO type
- purchaseorder line | custcol_sna_linked_so | Linked Sales Order

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One PO load and line iteration per event.

**Data Sources:**
- Purchase Order `createdfrom` value.

**Data Retention:**
- Updates PO line fields and PO header.

### Technical Constraints
- Only runs for create/dropship/special order events.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** PO creation from Sales Orders

### Governance Considerations

- **Script governance:** One PO load/save per event.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- POs show linked Sales Orders and correct PO type values.

**How we'll measure:**
- Review created POs from Sales Orders.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_link_so.js | User Event | Link SO and set PO type | Implemented |

### Development Approach

**Phase 1:** PO type assignment
- [ ] Validate dropship/special order PO type values

**Phase 2:** Linked SO fields
- [ ] Validate line-level linked SO values

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create dropship PO from SO and verify PO type and linked SO.

**Edge Cases:**
1. PO without createdfrom does not update linked SO.

**Error Handling:**
1. Record save errors are logged.

### Test Data Requirements
- PO created from Sales Order

### Sandbox Setup
- Deploy User Event on Purchase Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing roles

**Permissions required:**
- Edit Purchase Orders

### Data Security
- Linked SO data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm PO type values for dropship/special order

### Deployment Steps

1. Deploy User Event on Purchase Order.
2. Validate linked SO values.

### Post-Deployment

- [ ] Monitor logs for save errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update linked SO fields manually if needed.

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

- [ ] Should PO type values be configuration-driven?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect PO type values | Low | Med | Validate internal IDs in environment |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
