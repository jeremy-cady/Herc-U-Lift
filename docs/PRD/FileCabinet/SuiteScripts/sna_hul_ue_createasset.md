# PRD: Create FAM Asset from Disposal Process

**PRD ID:** PRD-UNKNOWN-CreateAssetFromFAMProcess
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_createasset.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that creates customer-owned FAM assets after a disposal process completes and updates related object records.

**What problem does it solve?**
Ensures fixed asset records are created and linked when disposal processes complete for customer-owned assets.

**Primary Goal:**
Create new FAM assets and update object records when disposal processes complete successfully.

---

## 2. Goals

1. Detect completed FAM disposal processes.
2. Create new FAM assets based on sales order line and disposal details.
3. Update related object records with asset ownership and status.

---

## 3. User Stories

1. **As a** finance user, **I want to** create customer-owned fixed assets automatically **so that** asset tracking stays accurate after disposal.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on FAM Process records (excluding delete).
2. The script must confirm process completion and that process ID is "disposal".
3. The script must load the related Item Fulfillment and Sales Order to retrieve line details.
4. The script must create a new `customrecord_ncfar_asset` when the original asset status is disposed.
5. The script must update related object records with fixed asset references and ownership/status fields.

### Acceptance Criteria

- [ ] Completed disposal processes create customer-owned fixed asset records.
- [ ] Related object records are updated with new fixed asset references.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Dispose assets directly.
- Update assets when the disposal process is incomplete.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Asset creation occurs automatically after disposal completion.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_fam_process
- itemfulfillment
- salesorder
- customrecord_ncfar_asset
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Create assets and update objects
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_fam_process | custrecord_fam_procstatus | Process status
- customrecord_fam_process | custrecord_fam_procid | Process ID
- customrecord_fam_process | custrecord_fam_procstateval | Process state values
- customrecord_fam_process | custrecord_fam_proctotstages | Total stages
- customrecord_fam_process | custrecord_sna_fa_snaparams | SNA params
- customrecord_fam_process | custrecord_sna_fam_if | Item fulfillment reference
- itemfulfillment | createdfrom | Source Sales Order
- itemfulfillment | trandate | Fulfillment date
- itemfulfillment | shipaddress | Shipping address
- itemfulfillment | department | Department
- itemfulfillment | class | Class
- itemfulfillment | location | Location
- salesorder | custbody_sna_hul_object_subsidiary | Object subsidiary
- salesorder line | custcol_sna_hul_fleet_no | Fleet object
- salesorder line | custcol_sna_asset_status | Asset status
- salesorder line | custcol_sna_fam_obj | FAM object
- customrecord_ncfar_asset | altname | Asset name
- customrecord_ncfar_asset | custrecord_assettype | Asset type
- customrecord_ncfar_asset | custrecord_assetaccmethod | Depreciation method
- customrecord_ncfar_asset | custrecord_assetlifetime | Lifetime
- customrecord_ncfar_asset | custrecord_assetlifeunits | Lifetime units
- customrecord_ncfar_asset | custrecord_assetcost | Asset cost
- customrecord_ncfar_asset | custrecord_assetstatus | Asset status
- customrecord_ncfar_asset | custrecord_assetsubsidiary | Subsidiary
- customrecord_ncfar_asset | custrecord_sna_customer_owned | Customer-owned flag
- customrecord_ncfar_asset | custrecord_sna_object | Object reference
- customrecord_sna_objects | custrecord_sna_fixed_asset | Fixed asset reference
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_customer_name | Customer
- customrecord_sna_objects | custrecord_sna_current_address | Current address
- customrecord_sna_objects | custrecord_sna_owning_loc_code | Owning location

**Saved Searches:**
- Search on customrecord_ncfar_asset to pull asset info for depreciation data.

### Integration Points
- Uses script parameters for posting status and depreciation method IDs.

### Data Requirements

**Data Volume:**
- One asset creation per disposed asset line.

**Data Sources:**
- FAM Process, Item Fulfillment, Sales Order, asset records

**Data Retention:**
- Creates new FAM asset records and updates object records.

### Technical Constraints
- Only creates assets when original asset status is disposed and process is completed.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** FAM process workflow
- **Other features:** Object records and fixed asset data

### Governance Considerations

- **Script governance:** Multiple record loads and saves.
- **Search governance:** Asset info searches for referenced assets.
- **API limits:** Moderate on large disposal batches.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Disposal processes create customer-owned assets and update object records correctly.

**How we'll measure:**
- Verify new fixed assets and object record updates after disposal processing.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_createasset.js | User Event | Create fixed assets from disposal process | Implemented |

### Development Approach

**Phase 1:** Process detection
- [ ] Validate process completion checks

**Phase 2:** Asset creation
- [ ] Validate asset field mapping and object updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Completed disposal process creates customer-owned FAM asset.

**Edge Cases:**
1. Non-completed process does not create assets.
2. Missing snaparams skips asset creation.

**Error Handling:**
1. Record creation errors are logged.

### Test Data Requirements
- Completed FAM disposal process with associated Item Fulfillment and Sales Order

### Sandbox Setup
- Deploy User Event on customrecord_fam_process.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance roles

**Permissions required:**
- Create customrecord_ncfar_asset
- Edit customrecord_sna_objects

### Data Security
- Asset records should be restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm script parameters for posting status and depreciation method

### Deployment Steps

1. Deploy User Event on FAM Process records.
2. Validate asset creation on completed disposal processes.

### Post-Deployment

- [ ] Monitor logs for asset creation errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Create assets manually if needed.

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

- [ ] Should asset creation occur for non-disposed asset statuses?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Asset data missing in snaparams | Med | Med | Validate disposal process payloads |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- Fixed Asset Management (FAM)

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
