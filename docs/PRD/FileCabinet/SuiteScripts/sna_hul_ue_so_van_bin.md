# PRD: Set Van Bin and Update Object on Item Receipt

**PRD ID:** PRD-UNKNOWN-SoVanBin
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_so_van_bin.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Populates van bin assignment on item lines and updates related Object records on item receipts.

**What problem does it solve?**
Ensures item lines reflect the correct van bin and keeps Object status, responsibility center, fleet code, and serial number in sync with item receipts.

**Primary Goal:**
Synchronize line-level van bin and Object record updates during item receipt processing.

---

## 2. Goals

1. Set custcol_sna_van_bin based on item and location assignments.
2. Update related Object status when item receipts reference fleet numbers.
3. Sync fleet code and serial number to the Object record.

---

## 3. User Stories

1. **As a** warehouse user, **I want to** see the correct van bin on each line **so that** picking is accurate.
2. **As an** inventory manager, **I want to** update object status on receipt **so that** fleet availability is current.
3. **As a** service admin, **I want to** carry serial and fleet code to the object record **so that** asset data is correct.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit, the system must set custcol_sna_van_bin per line using customrecord_sna_van_bin_assignment for the item and location.
2. For item receipts, the system must update the related Object record when custcol_sna_hul_fleet_no is present and itemreceive is true.
3. For item receipts, the system must set custrecord_sna_fleet_code and custrecord_sna_serial_no on the Object record when line values are present.
4. Object status must be set to 11 when the object is linked to a sales order and to 10 otherwise.
5. Object responsibility center must be set only when the item service code type equals 6 (Object).

### Acceptance Criteria

- [ ] custcol_sna_van_bin is set when a van bin assignment exists for item and location.
- [ ] Object status updates to 10 or 11 based on sales order linkage.
- [ ] Fleet code and serial number are pushed to the Object record on item receipt.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or manage van bin assignment records.
- Update object data on non-item receipt transactions.
- Enforce validation on missing fleet numbers.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Line fields are populated automatically on save.

### Design References
- Custom record: customrecord_sna_van_bin_assignment
- Object record: customrecord_sna_objects

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Receipt
- Custom record: customrecord_sna_van_bin_assignment
- Custom record: customrecord_sna_objects
- Item
- Sales Order

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Line and object updates
- [ ] Client Script - N/A

**Custom Fields:**
- Item line | custcol_sna_van_bin | Van bin
- Item line | custcol_sna_hul_fleet_no | Fleet number (Object id)
- Item line | custcol_sna_po_fleet_code | Fleet code
- Item line | custcol_sna_hul_eq_serial | Equipment serial number
- Item | custitem_sna_item_service_code_type | Service code type
- Object | custrecord_sna_status | Object status
- Object | custrecord_sna_responsibility_center | Responsibility center
- Object | custrecord_sna_fleet_code | Fleet code
- Object | custrecord_sna_serial_no | Serial number

**Saved Searches:**
- None

### Integration Points
- customrecord_sna_van_bin_assignment for bin mapping
- customrecord_sna_objects for object updates

### Data Requirements

**Data Volume:**
- Per item receipt, all item lines.

**Data Sources:**
- Van bin assignment records, item records, sales orders.

**Data Retention:**
- Updates persist on Object records and line fields.

### Technical Constraints
- Object updates only occur when line itemreceive is true.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Object and van bin custom records

### Governance Considerations

- **Script governance:** Per-line searches and submitFields.
- **Search governance:** One search per line for bin assignment and object linkage.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Van bin values are set correctly on item lines.
- Object status and identifiers are updated on item receipt.

**How we'll measure:**
- Verify line and object fields after receipt save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_so_van_bin.js | User Event | Set van bin and update object on item receipt | Implemented |

### Development Approach

**Phase 1:** Van bin assignment
- [x] Lookup and set custcol_sna_van_bin.

**Phase 2:** Object updates
- [x] Update status, fleet code, and serial number on receipt.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save an item receipt with a fleet number and van bin assignment, verify line and object updates.

**Edge Cases:**
1. Item receipt line has itemreceive false, verify no object update.
2. No van bin assignment exists, verify custcol_sna_van_bin is blank.

**Error Handling:**
1. Object record missing, verify script logs error and continues.

### Test Data Requirements
- Van bin assignment records for item and location.
- Object records referenced by custcol_sna_hul_fleet_no.

### Sandbox Setup
- Deploy User Event on item receipt.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to item receipts and custom object records.

### Data Security
- Updates limited to object and item receipt line fields.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Van bin assignment records populated.

### Deployment Steps
1. Deploy User Event to item receipt.

### Post-Deployment
- Validate a receipt with fleet number and bin assignments.

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
- Should responsibility center update apply only for service code type 6 (Object) or also other types?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing bin assignment | Van bin remains blank | Maintain assignments per item/location |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
