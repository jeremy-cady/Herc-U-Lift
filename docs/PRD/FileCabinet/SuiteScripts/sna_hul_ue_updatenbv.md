# PRD: Update NBV on Asset Values

**PRD ID:** PRD-UNKNOWN-UpdateNBV
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_updatenbv.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Updates the Net Book Value (NBV) on FAM Asset Values records after creation via Map/Reduce.

**What problem does it solve?**
Ensures the asset values record reflects the current asset cost from the linked fixed asset record.

**Primary Goal:**
Set custrecord_slavebookvalue on newly created FAM Asset Values records based on the parent asset cost.

---

## 2. Goals

1. Run only for Map/Reduce-created asset values.
2. Pull asset cost from the linked fixed asset.
3. Update the asset values record with NBV.

---

## 3. User Stories

1. **As an** accounting user, **I want to** see NBV populated **so that** asset reports are accurate.
2. **As a** system admin, **I want to** only update MR-created records **so that** manual edits are not impacted.
3. **As an** auditor, **I want to** trace NBV to asset cost **so that** values are explainable.

---

## 4. Functional Requirements

### Core Functionality

1. On afterSubmit, the system must run only when execution context is Map/Reduce and the record is created.
2. The system must load the new customrecord_fam_assetvalues record and get custrecord_slaveparentasset.
3. The system must lookup custrecord_assetcost from the linked customrecord_ncfar_asset record.
4. The system must update custrecord_slavebookvalue on the asset values record to the asset cost.

### Acceptance Criteria

- [ ] NBV is set on newly created asset values when created by Map/Reduce.
- [ ] Records created in other contexts are not updated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update NBV on edits.
- Recalculate depreciation or other asset fields.
- Handle records without linked assets.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- NBV is set automatically after MR-created record save.

### Design References
- Custom records: customrecord_fam_assetvalues, customrecord_ncfar_asset

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom record: customrecord_fam_assetvalues
- Custom record: customrecord_ncfar_asset

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - NBV update
- [ ] Client Script - N/A

**Custom Fields:**
- Asset Values | custrecord_slaveparentasset | Linked asset
- Asset Values | custrecord_slavebookvalue | Net book value
- Fixed Asset | custrecord_assetcost | Asset cost

**Saved Searches:**
- None

### Integration Points
- Fixed asset record lookup

### Data Requirements

**Data Volume:**
- Per MR-created asset values record.

**Data Sources:**
- customrecord_ncfar_asset

**Data Retention:**
- NBV stored on asset values record.

### Technical Constraints
- Runs only when executionContext is Map/Reduce and type is CREATE.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Map/Reduce process creating asset values

### Governance Considerations

- **Script governance:** One load and submitFields per MR-created record.
- **Search governance:** One lookupFields on fixed asset record.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- NBV matches asset cost for MR-created records.

**How we'll measure:**
- Compare custrecord_slavebookvalue to custrecord_assetcost after MR run.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_updatenbv.js | User Event | Update NBV on asset values create | Implemented |

### Development Approach

**Phase 1:** Record load and lookup
- [x] Load asset values and read parent asset.

**Phase 2:** NBV update
- [x] Update custrecord_slavebookvalue from asset cost.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run MR that creates asset values, verify NBV is set to asset cost.

**Edge Cases:**
1. No linked asset, verify no update.

**Error Handling:**
1. Asset lookup fails, verify error logged.

### Test Data Requirements
- Fixed asset with custrecord_assetcost populated.

### Sandbox Setup
- Run MR that creates customrecord_fam_assetvalues records.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to asset records and asset values.

### Data Security
- Updates only custrecord_slavebookvalue.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Confirm MR process uses Map/Reduce context.

### Deployment Steps
1. Deploy User Event to customrecord_fam_assetvalues.

### Post-Deployment
- Validate NBV after MR run.

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
- Should NBV update also run on edit when asset cost changes?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Asset cost missing | NBV not set | Validate asset setup |

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
