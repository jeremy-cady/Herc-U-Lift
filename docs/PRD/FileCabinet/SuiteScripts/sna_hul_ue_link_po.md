# PRD: Link Purchase Orders on Sales Orders

**PRD ID:** PRD-UNKNOWN-LinkPO
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_link_po.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that populates Sales Order line field `custcol_sna_linked_po` with the created Purchase Order ID.

**What problem does it solve?**
Ensures Sales Order lines track the PO created from them.

**Primary Goal:**
Populate linked PO references on Sales Order lines when POs are created.

---

## 2. Goals

1. Detect created POs on Sales Order lines.
2. Write the linked PO reference to a custom column.

---

## 3. User Stories

1. **As a** buyer, **I want to** see the linked PO on SO lines **so that** I can track purchasing progress.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Sales Order create/edit/dropship/special order/approve.
2. The script must load the Sales Order and iterate lines.
3. If `createdpo` exists on a line, the script must set `custcol_sna_linked_po` to that value.

### Acceptance Criteria

- [ ] SO lines with a created PO have `custcol_sna_linked_po` populated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create POs.
- Validate PO status.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Linked PO appears automatically on SO lines.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Link PO references
- [ ] Client Script - N/A

**Custom Fields:**
- salesorder line | createdpo | Created PO
- salesorder line | custcol_sna_linked_po | Linked PO

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One SO load and line iteration per trigger.

**Data Sources:**
- Sales Order line `createdpo` values.

**Data Retention:**
- Updates SO line fields.

### Technical Constraints
- Runs on multiple event types including dropship/special order.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** PO creation from SO lines

### Governance Considerations

- **Script governance:** One SO load/save per event.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Linked PO field is populated for SO lines with created POs.

**How we'll measure:**
- Spot-check SO lines with created POs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_link_po.js | User Event | Populate linked PO fields | Implemented |

### Development Approach

**Phase 1:** Line detection
- [ ] Validate createdpo detection

**Phase 2:** Field updates
- [ ] Validate linked PO field updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create PO from SO line and verify linked PO is populated.

**Edge Cases:**
1. Lines without created POs remain blank.

**Error Handling:**
1. Record save errors are logged.

### Test Data Requirements
- Sales Order with lines that create POs

### Sandbox Setup
- Deploy User Event on Sales Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and purchasing roles

**Permissions required:**
- Edit Sales Orders

### Data Security
- PO references visible only to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm linked PO custom field exists on SO lines

### Deployment Steps

1. Deploy User Event on Sales Order.
2. Validate linked PO updates.

### Post-Deployment

- [ ] Monitor logs for save errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update linked PO fields manually if needed.

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

- [ ] Should linked PO update run on delete events?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Line createdpo values change after updates | Low | Low | Re-run on edit events |

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
