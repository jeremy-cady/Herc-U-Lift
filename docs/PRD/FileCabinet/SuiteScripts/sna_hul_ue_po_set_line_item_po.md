# PRD: PO Line Internal ID Stamp

**PRD ID:** PRD-UNKNOWN-POSetLineItemPO
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_po_set_line_item_po.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that stamps the Purchase Order internal ID onto each PO line item.

**What problem does it solve?**
Provides a line-level reference to the PO ID for reporting or downstream processes.

**Primary Goal:**
Populate `custcol_sna_item_po_number` with the PO internal ID on all lines.

---

## 2. Goals

1. Write the PO internal ID to each line item after save.

---

## 3. User Stories

1. **As a** reporting user, **I want to** see the PO ID on each line **so that** I can export line data with its header reference.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on PO create/edit (non-delete).
2. The script must load the PO and set `custcol_sna_item_po_number` on each line.
3. The script must save the PO with updated line values.

### Acceptance Criteria

- [ ] All PO lines contain the PO internal ID in `custcol_sna_item_po_number`.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate other line fields.
- Update non-PO transactions.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- PO line field populates automatically after save.

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
- [x] User Event - PO line update
- [ ] Client Script - N/A

**Custom Fields:**
- purchaseorder line | custcol_sna_item_po_number | PO internal ID

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One PO load and save per event.

**Data Sources:**
- PO line items.

**Data Retention:**
- Updates line-level custom field.

### Technical Constraints
- None.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** None

### Governance Considerations

- **Script governance:** PO load/save per event.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PO line items include the PO internal ID after save.

**How we'll measure:**
- Review PO line field values on saved records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_po_set_line_item_po.js | User Event | Set PO ID on lines | Implemented |

### Development Approach

**Phase 1:** Line updates
- [ ] Validate line field population

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save PO and verify line field values.

**Edge Cases:**
1. Delete event does not update lines.

**Error Handling:**
1. Save errors are logged.

### Test Data Requirements
- Purchase Order with multiple lines

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
- PO data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm line custom field exists on PO

### Deployment Steps

1. Deploy User Event on Purchase Order.
2. Validate line field updates.

### Post-Deployment

- [ ] Monitor logs for save errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update line fields manually if needed.

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

- [ ] Should line field update be skipped for large POs to reduce load?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Save loop if other scripts trigger on PO save | Low | Med | Monitor script interactions |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
