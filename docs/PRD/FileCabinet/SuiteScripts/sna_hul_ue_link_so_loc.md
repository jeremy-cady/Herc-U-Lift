# PRD: Link Sales Order and Location on Purchase Orders

**PRD ID:** PRD-UNKNOWN-LinkSOLoc
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_link_so_loc.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that links Purchase Order lines to the originating Sales Order and sets header/line locations based on Sales Order location hierarchy.

**What problem does it solve?**
Ensures Purchase Orders use consistent location values and maintain a link to the originating Sales Order.

**Primary Goal:**
Set linked SO references and align PO locations with SO parent locations.

---

## 2. Goals

1. Copy the Sales Order reference to PO lines.
2. Set PO header and line locations to the parent of the SO location.
3. Store the SO location reference on PO lines.

---

## 3. User Stories

1. **As a** buyer, **I want to** see the originating Sales Order and location on PO lines **so that** routing is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeSubmit on PO create and special order events.
2. If `createdfrom` exists, the script must load the Sales Order and determine its header location.
3. The script must set PO header `location` to the parent of the SO location.
4. The script must set PO line fields `custcol_sna_linked_so`, `location`, and `custcol_sna_hul_so_location`.

### Acceptance Criteria

- [ ] PO header location is set to the parent location of the SO location.
- [ ] PO line fields include linked SO and SO location values.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update POs not created from Sales Orders.
- Validate SO line-level locations.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Location values populate automatically on PO creation.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- purchaseorder
- salesorder
- location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Link SO and location
- [ ] Client Script - N/A

**Custom Fields:**
- purchaseorder line | custcol_sna_linked_so | Linked Sales Order
- purchaseorder line | custcol_sna_hul_so_location | SO location reference

**Saved Searches:**
- None.

### Integration Points
- Uses location parent hierarchy.

### Data Requirements

**Data Volume:**
- One SO load and one location load per PO.

**Data Sources:**
- Sales Order header location and location parent.

**Data Retention:**
- Updates PO header and line fields.

### Technical Constraints
- Only runs on PO create/special order events.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Location hierarchy

### Governance Considerations

- **Script governance:** One SO and location load per PO.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- POs created from SOs have correct linked SO and location values.

**How we'll measure:**
- Review PO header and line locations after creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_link_so_loc.js | User Event | Set linked SO and location fields | Implemented |

### Development Approach

**Phase 1:** SO location lookup
- [ ] Validate parent location lookup

**Phase 2:** Field updates
- [ ] Validate header and line field updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. PO created from SO inherits parent location and linked SO references.

**Edge Cases:**
1. SO without parent location leaves location blank.

**Error Handling:**
1. Load errors are logged.

### Test Data Requirements
- Sales Order with header location and parent location

### Sandbox Setup
- Deploy User Event on Purchase Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing roles

**Permissions required:**
- Edit Purchase Orders
- View Sales Orders and Locations

### Data Security
- Location data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm location hierarchy data exists

### Deployment Steps

1. Deploy User Event on Purchase Order.
2. Validate location updates.

### Post-Deployment

- [ ] Monitor logs for missing location data

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update PO locations manually if needed.

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

- [ ] Should line locations use SO line locations instead of header location?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing parent location leads to blank PO location | Low | Low | Validate location setup in master data |

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
