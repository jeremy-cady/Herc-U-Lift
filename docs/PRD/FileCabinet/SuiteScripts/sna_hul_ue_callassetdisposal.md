# PRD: Call Asset Disposal

**PRD ID:** PRD-UNKNOWN-CallAssetDisposal
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_callassetdisposal.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that triggers FAM disposal processing when an Item Fulfillment reaches shipped status.

**What problem does it solve?**
Automates asset disposal for fulfilled assets and their components without manual processing.

**Primary Goal:**
Create FAM process records to dispose assets tied to fulfilled lines.

---

## 2. Goals

1. Detect eligible asset lines on Item Fulfillment.
2. Build disposal parameters for assets and their components.
3. Trigger the FAM disposal process suitelet.

---

## 3. User Stories

1. **As a** finance user, **I want to** dispose assets automatically on fulfillment **so that** asset records stay accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Item Fulfillment create/edit (excluding delete).
2. The script must identify lines that are received, fixed-asset eligible, not disposed, and not customer-owned.
3. The script must include component assets when parent assets have components.
4. The script must create a FAM Process record with disposal parameters and SNA parameters.
5. The script must invoke the FAM trigger process suitelet to start disposal.

### Acceptance Criteria

- [ ] Eligible asset lines create disposal parameters.
- [ ] Component assets are included when applicable.
- [ ] A FAM Process record is created and the trigger suitelet is called.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Dispose customer-owned assets.
- Dispose assets already marked as disposed.
- Validate FAM process execution results.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Disposal begins automatically once fulfillment is complete.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- itemfulfillment
- customrecord_ncfar_asset
- customrecord_fam_process

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - FAM trigger process
- [ ] RESTlet - N/A
- [x] User Event - Build disposal payload and trigger process
- [ ] Client Script - N/A

**Custom Fields:**
- itemfulfillment line | custcol_sna_hul_is_fa_form | Fixed asset flag
- itemfulfillment line | custcol_sna_asset_status | Asset status
- itemfulfillment line | custcol_sna_cust_owned | Customer-owned flag
- itemfulfillment line | custcol_sna_fam_obj | FAM asset reference
- itemfulfillment line | custcol_sna_loc_asset | Asset location
- itemfulfillment line | custcol_sna_hul_fleet_no | Fleet number
- customrecord_ncfar_asset | custrecord_componentof | Component parent
- customrecord_ncfar_asset | custrecord_assetstatus | Asset status
- customrecord_ncfar_asset | custrecord_sna_customer_owned | Customer-owned flag
- customrecord_fam_process | custrecord_fam_procid | Process ID
- customrecord_fam_process | custrecord_fam_procparams | Process params
- customrecord_fam_process | custrecord_fam_procstateval | State values
- customrecord_fam_process | custrecord_sna_fa_snaparams | SNA params
- customrecord_fam_process | custrecord_sna_fam_if | Item fulfillment reference

**Saved Searches:**
- Searches on customrecord_ncfar_asset for component relationships.

### Integration Points
- FAM Trigger Process Suitelet (`customscript_fam_triggerprocess_su`).

### Data Requirements

**Data Volume:**
- One FAM Process per fulfillment with eligible assets.

**Data Sources:**
- Item Fulfillment lines and asset records

**Data Retention:**
- Creates FAM Process records; no direct asset updates here.

### Technical Constraints
- Relies on shipstatus transition to "C" (shipped).

### Dependencies
- **Libraries needed:** None
- **External dependencies:** FAM bundle process suitelet
- **Other features:** Asset component structure in FAM

### Governance Considerations

- **Script governance:** Multiple searches for asset components.
- **Search governance:** Component searches can expand with asset count.
- **API limits:** Moderate on large fulfillments.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Eligible asset fulfillments create disposal process records and trigger FAM disposal.

**How we'll measure:**
- Verify FAM Process records and disposal results for fulfilled assets.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_callassetdisposal.js | User Event | Trigger FAM disposal process | Implemented |

### Development Approach

**Phase 1:** Identify assets
- [ ] Validate line eligibility checks

**Phase 2:** Trigger process
- [ ] Validate FAM process record creation and trigger call

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Item Fulfillment with eligible asset line triggers disposal process.

**Edge Cases:**
1. Customer-owned or disposed assets are ignored.
2. Assets with components create disposal for all components.

**Error Handling:**
1. FAM process creation failures are logged.

### Test Data Requirements
- Item Fulfillment with asset lines and component assets

### Sandbox Setup
- Ensure FAM bundle is installed and trigger suitelet is available.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Fulfillment and finance roles

**Permissions required:**
- Create customrecord_fam_process
- View item fulfillment and asset records

### Data Security
- Asset disposal data restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm FAM trigger suitelet deployment IDs

### Deployment Steps

1. Deploy User Event on Item Fulfillment.
2. Validate disposal process creation.

### Post-Deployment

- [ ] Monitor FAM process queue

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Dispose assets manually via FAM.

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

- [ ] Should disposal trigger on partial fulfillments?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Component lookup misses assets | Low | Med | Validate component relationships in FAM records |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- FAM Process records

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
