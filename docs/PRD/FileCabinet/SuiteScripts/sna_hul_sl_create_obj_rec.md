# PRD: Create Object Record

**PRD ID:** PRD-UNKNOWN-CreateObjectRecord
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_create_obj_rec.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that creates custom object records and builds or updates a Purchase Order with object lines and charges.

**What problem does it solve?**
Automates object record creation and PO line population from a guided UI.

**Primary Goal:**
Create object records and update a PO with corresponding line items and metadata.

---

## 2. Goals

1. Provide a UI to input object and PO details.
2. Create one or more `customrecord_sna_objects` records based on quantity.
3. Create or update a Purchase Order with object line data.

---

## 3. User Stories

1. **As a** purchasing user, **I want to** create objects and a PO together **so that** setup is faster.
2. **As an** inventory user, **I want to** populate fleet code and serial data on PO lines **so that** tracking is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must render a form for object info, pricing info, and PO details.
2. On submit, the Suitelet must create object records based on quantity.
3. The Suitelet must create or load a Purchase Order using `po_id`.
4. The Suitelet must add one PO line per created object and populate object and segment fields.
5. The Suitelet must add optional other charge lines when provided.
6. For serialized items (IDs 101361, 101362), the Suitelet must set inventory detail with the object ID.
7. The Suitelet must save the PO and redirect to it.

### Acceptance Criteria

- [ ] Object records are created with fleet code, serial number, and segment fields.
- [ ] PO lines reflect object records and metadata.
- [ ] Other charge lines are added when provided.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate item eligibility beyond search filters.
- Calculate taxes or approvals for the PO.
- Update object records after creation.

---

## 6. Design Considerations

### User Interface
- Form titled "Create Object Record" with Object Information and Pricing Information groups.

### User Experience
- Submit creates objects and immediately opens the PO.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_objects
- purchaseorder
- item

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Create objects and PO lines
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_objects | custrecord_sna_fleet_code | Fleet code
- customrecord_sna_objects | custrecord_sna_serial_no | Serial number
- customrecord_sna_objects | cseg_sna_hul_eq_seg | Equipment segment
- customrecord_sna_objects | cseg_hul_mfg | Manufacturer segment
- customrecord_sna_objects | custrecord_sna_equipment_model | Equipment model
- customrecord_sna_objects | custrecord_sna_year | Year
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_status | Status
- customrecord_sna_objects | custrecord_hul_customerorder | Customer order flag
- customrecord_sna_objects | custrecord_sna_responsibility_center | Responsibility center
- customrecord_sna_objects | custrecord_sna_expected_receipt_date | Expected receipt date
- Purchase Order | custbody_po_type | PO type
- Purchase Order | custbody_sna_hul_object_subsidiary | Object subsidiary
- Purchase Order Line | custcol_sna_hul_fleet_no | Object reference
- Purchase Order Line | custcol_sna_po_fleet_code | Fleet code
- Purchase Order Line | custcol_sna_hul_eq_serial | Serial number
- Purchase Order Line | cseg_sna_hul_eq_seg | Equipment segment
- Purchase Order Line | cseg_hul_mfg | Manufacturer segment

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Multiple object records per submission.

**Data Sources:**
- User input from Suitelet
- Item searches for selection lists

**Data Retention:**
- Creates custom objects and updates POs.

### Technical Constraints
- Item IDs for serialized items are hard-coded.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** PO form ID 130 and inventory detail

### Governance Considerations

- **Script governance:** Multiple record creates and PO save.
- **Search governance:** Item searches for selection lists.
- **API limits:** Consider large quantity submissions.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Objects are created and PO lines reflect correct data.
- Serialized items receive inventory assignments.

**How we'll measure:**
- Review created object records and PO line fields.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_create_obj_rec.js | Suitelet | Create objects and update PO | Implemented |

### Development Approach

**Phase 1:** UI validation
- [ ] Confirm item and charge option lists

**Phase 2:** Transaction validation
- [ ] Verify object creation and PO updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create multiple objects and a new PO.

**Edge Cases:**
1. Update an existing PO using `po_id`.
2. Serialized item triggers inventory assignment.

**Error Handling:**
1. Missing required fields prevents submit.

### Test Data Requirements
- Items marked as purchased equipment
- Other charge items by cost category

### Sandbox Setup
- Deploy Suitelet and confirm PO form 130 exists

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing and inventory roles

**Permissions required:**
- Create custom object records
- Create or edit Purchase Orders

### Data Security
- Access restricted to procurement roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm item filters and PO form ID

### Deployment Steps

1. Deploy Suitelet.
2. Provide link/button from PO workflow.

### Post-Deployment

- [ ] Validate object creation and PO output

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Remove workflow entry point.

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

- [ ] Should object creation validate unique fleet codes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hard-coded item IDs for serialization become outdated | Low | Med | Replace with item property check |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- Purchase Order inventory detail

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
