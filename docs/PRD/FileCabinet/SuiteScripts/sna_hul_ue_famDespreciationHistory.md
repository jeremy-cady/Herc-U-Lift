# PRD: FAM Depreciation History Inventory Adjustment

**PRD ID:** PRD-UNKNOWN-FAMDepreciationHistory
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_famDespreciationHistory.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that creates an inventory adjustment for a Used Equipment item when an asset disposal depreciation history record is created.

**What problem does it solve?**
Ensures disposed assets create corresponding used equipment inventory adjustments.

**Primary Goal:**
Create inventory adjustments tied to asset disposal events.

---

## 2. Goals

1. Detect disposal depreciation history entries.
2. Create inventory adjustment with used equipment item and asset details.

---

## 3. User Stories

1. **As a** finance user, **I want to** create inventory adjustments for disposed assets **so that** used equipment inventory is updated.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on depreciation history records.
2. When `custrecord_deprhisttype` matches the disposal type and asset/JE are present, create an inventory adjustment.
3. The inventory adjustment must use the asset disposal account, location, and book value.
4. The adjustment must create an inventory assignment using the asset object as the receipt inventory number.

### Acceptance Criteria

- [ ] Disposal depreciation history creates an inventory adjustment.
- [ ] Adjustment uses the used equipment item and asset book value.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create adjustments for non-disposal entries.
- Update asset records directly.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Inventory adjustments are created automatically on disposal history updates.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_ncfar_deprhistory
- customrecord_ncfar_asset
- journalentry
- inventoryadjustment

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Create inventory adjustment
- [ ] Client Script - N/A

**Custom Fields:**
- depreciation history | custrecord_deprhisttype | History type
- depreciation history | custrecord_deprhistasset | Asset
- depreciation history | custrecord_deprhistjournal | Journal entry
- depreciation history | custrecord_deprhistdate | History date
- asset | custrecord_assetsubsidiary | Subsidiary
- asset | custrecord_assetdisposalacc | Disposal account
- asset | custrecord_sna_object | Asset object
- asset | custrecord_assetbookvalue | Book value
- asset | custrecord_assetlocation | Location

**Saved Searches:**
- None (uses lookupFields).

### Integration Points
- Script parameters for disposal type and used equipment item.

### Data Requirements

**Data Volume:**
- One inventory adjustment per disposal entry.

**Data Sources:**
- Depreciation history, asset, and journal entry data

**Data Retention:**
- Creates inventory adjustment records.

### Technical Constraints
- Uses journal entry date for adjustment transaction date.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Used equipment item

### Governance Considerations

- **Script governance:** One adjustment creation per record.
- **Search governance:** LookupFields for JE and asset.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Disposal history entries produce inventory adjustments for used equipment.

**How we'll measure:**
- Review inventory adjustments created from disposal events.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_famDespreciationHistory.js | User Event | Create inventory adjustments for disposal | Implemented |

### Development Approach

**Phase 1:** Disposal detection
- [ ] Validate disposal type checks

**Phase 2:** Adjustment creation
- [ ] Validate item, location, and cost values

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Disposal depreciation history entry creates inventory adjustment.

**Edge Cases:**
1. Missing asset or JE skips adjustment.

**Error Handling:**
1. Inventory adjustment creation errors are logged.

### Test Data Requirements
- Depreciation history record with disposal type and asset

### Sandbox Setup
- Deploy User Event on depreciation history record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance roles

**Permissions required:**
- Create inventory adjustments
- View assets and journal entries

### Data Security
- Financial data restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure disposal type and used equipment item parameters

### Deployment Steps

1. Deploy User Event on depreciation history record.
2. Validate inventory adjustment creation.

### Post-Deployment

- [ ] Monitor logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Create inventory adjustments manually if needed.

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

- [ ] Should adjustment use disposal history date instead of JE date?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing disposal account on asset | Low | Med | Validate asset setup for disposal account |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- Inventory Adjustment

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
