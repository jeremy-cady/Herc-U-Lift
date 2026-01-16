# PRD: Create Asset on Item Receipt

**PRD ID:** PRD-UNKNOWN-CreateAssetReturn
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_createassetreturn.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that creates a new fixed asset when an Item Receipt is created from a PO or Return Authorization and links it to the fleet object.

**What problem does it solve?**
Automates creation of HUL-owned fixed assets for received items and updates related fleet/object records.

**Primary Goal:**
Create a new FAM asset and update the object/fleet record on Item Receipt creation.

---

## 2. Goals

1. Identify received lines that reference fleet objects and fixed assets.
2. Create a new fixed asset based on the received cost and asset metadata.
3. Update the fleet object with the new fixed asset and status.

---

## 3. User Stories

1. **As a** finance user, **I want to** create fixed assets automatically on receipt **so that** asset records remain accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Item Receipt create only.
2. The script must process lines with `itemreceive` and `custcol_sna_hul_is_fa_form` and a fleet number.
3. The script must load the created-from transaction (PO/RA) to determine line costs.
4. The script must create a `customrecord_ncfar_asset` with derived values and set ownership to HUL.
5. The script must update the fleet object record with the new fixed asset and status.
6. The script must inactivate the prior customer-owned fixed asset linked to the fleet.

### Acceptance Criteria

- [ ] Item Receipt creation generates a new fixed asset for qualifying lines.
- [ ] Fleet object records link to the new fixed asset and update status fields.
- [ ] Prior customer-owned fixed asset is inactivated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create assets for non-FA or non-received lines.
- Process Item Receipt edits.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Asset creation occurs automatically after receipt creation.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- itemreceipt
- purchaseorder
- returnauthorization
- customrecord_ncfar_asset
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Asset creation on receipt
- [ ] Client Script - N/A

**Custom Fields:**
- itemreceipt | createdfrom | Source transaction
- itemreceipt | custbody_sna_hul_object_subsidiary | Object subsidiary
- itemreceipt line | custcol_sna_hul_fleet_no | Fleet object
- itemreceipt line | custcol_sna_fam_obj | Fixed asset reference
- itemreceipt line | custcol_sna_hul_is_fa_form | Fixed asset flag
- purchaseorder line | custcol_sna_po_fleet_code | Fleet code
- customrecord_ncfar_asset | custrecord_assettype | Asset type
- customrecord_ncfar_asset | custrecord_assetcost | Asset cost
- customrecord_ncfar_asset | custrecord_assetsubsidiary | Subsidiary
- customrecord_ncfar_asset | custrecord_sna_customer_owned | Customer-owned flag
- customrecord_ncfar_asset | custrecord_sna_object | Fleet object
- customrecord_ncfar_asset | custrecord_sna_hul_fleet_code | Fleet code
- customrecord_sna_objects | custrecord_sna_fixed_asset | Fixed asset reference
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_owning_loc_code | Owning location

**Saved Searches:**
- Search to fetch customer-owned fixed assets for fleets.
- Asset usage lookup for depreciation calculation.

### Integration Points
- Script parameters for posting status and depreciation method IDs.

### Data Requirements

**Data Volume:**
- One new asset per qualifying receipt line.

**Data Sources:**
- Item Receipt lines and source PO/RA lines.

**Data Retention:**
- Creates fixed asset records; updates fleet/object records.

### Technical Constraints
- Only runs on create and only for PO/RA created receipts.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Fixed Asset Management

### Governance Considerations

- **Script governance:** Multiple record loads and saves.
- **Search governance:** Fleet asset search per receipt.
- **API limits:** Moderate for receipts with many lines.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- New fixed assets are created and fleet objects updated on receipt creation.

**How we'll measure:**
- Review Item Receipt-linked fixed assets and fleet object updates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_createassetreturn.js | User Event | Create fixed assets on receipt | Implemented |

### Development Approach

**Phase 1:** Eligibility and cost mapping
- [ ] Validate receipt line selection and cost calculation

**Phase 2:** Asset creation and updates
- [ ] Validate asset creation and fleet updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Item Receipt from PO with fleet line creates new fixed asset and updates object.

**Edge Cases:**
1. Lines without fleet or FA flag are ignored.

**Error Handling:**
1. Asset creation failures are logged.

### Test Data Requirements
- Item Receipt from PO/RA with fleet and FA flags

### Sandbox Setup
- Deploy User Event on Item Receipt.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance and inventory roles

**Permissions required:**
- Create customrecord_ncfar_asset
- Edit customrecord_sna_objects

### Data Security
- Fixed asset data restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure script parameters for posting status and depreciation method

### Deployment Steps

1. Deploy User Event on Item Receipt.
2. Validate asset creation and fleet updates.

### Post-Deployment

- [ ] Monitor logs for asset creation errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Create assets manually if required.

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

- [ ] Should receipt edits trigger recalculation or updates?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect asset costs from source lines | Low | Med | Validate PO/RA line pricing logic |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- Fixed Asset Management

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
