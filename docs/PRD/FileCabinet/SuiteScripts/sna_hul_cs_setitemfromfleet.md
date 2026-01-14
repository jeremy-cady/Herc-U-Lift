# PRD: Set Item From Fleet Client Script

**PRD ID:** PRD-UNKNOWN-SetItemFromFleet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_setitemfromfleet.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that defaults the rental item when a fleet number is selected and populates fixed asset NBV.

**What problem does it solve?**
It ensures item selection and fixed asset details are filled automatically on item lines.

**Primary Goal:**
Set the rental item based on fleet selection and populate asset book value.

---

## 2. Goals

1. Default the rental item when fleet number changes.
2. Populate fixed asset NBV when an asset is sourced.

---

## 3. User Stories

1. **As a** user, **I want** the rental item set automatically **so that** I do not select it manually.

---

## 4. Functional Requirements

### Core Functionality

1. When `custcol_sna_hul_fleet_no` changes, the script must set the line `item` to the rental equipment item from script parameters if empty.
2. On post sourcing, when `custcol_sna_fam_obj` is set, the script must load the fixed asset record and set `custcol_sna_hul_fa_nbv` to the asset book value.

### Acceptance Criteria

- [ ] Rental item is set when fleet number is selected and item is blank.
- [ ] Fixed asset NBV is populated from the asset record.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate fleet numbers.
- Update fixed asset records.

---

## 6. Design Considerations

### User Interface
- No UI changes; line values update automatically.

### User Experience
- Users see item and NBV values filled automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Fixed Asset | `customrecord_ncfar_asset`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Line defaults

**Custom Fields:**
- Line | `custcol_sna_hul_fleet_no`
- Line | `item`
- Line | `custcol_sna_fam_obj`
- Line | `custcol_sna_hul_fa_nbv`

**Saved Searches:**
- None.

### Integration Points
- Uses script parameter `custscript_sna_rental_equipment`.

### Data Requirements

**Data Volume:**
- Single asset load per sourced asset.

**Data Sources:**
- Fixed asset record values.

**Data Retention:**
- Updates line values only.

### Technical Constraints
- Requires fixed asset record access and script parameter configuration.

### Dependencies
- **Libraries needed:** N/runtime, N/search, N/record.
- **External dependencies:** None.
- **Other features:** Fixed asset records.

### Governance Considerations
- Client-side record load for asset.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Fleet number selection defaults the item and asset NBV values correctly.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_setitemfromfleet.js | Client Script | Default item and asset NBV from fleet | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Set item from fleet number.
- **Phase 2:** Populate asset NBV on sourcing.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Set fleet number on an empty item line; item defaults.
2. Set fixed asset on line; NBV populates.

**Edge Cases:**
1. Item already set; script does not override.
2. Asset record missing; NBV remains blank.

**Error Handling:**
1. Asset load fails; line should remain editable.

### Test Data Requirements
- Fixed asset records with book value.

### Sandbox Setup
- Deploy client script to transaction forms using fleet fields.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users entering fleet-related transactions.

**Permissions required:**
- View fixed asset records.

### Data Security
- Uses internal fixed asset data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm script parameter for rental equipment item.

### Deployment Steps
1. Upload `sna_hul_cs_setitemfromfleet.js`.
2. Deploy to relevant transaction forms.

### Post-Deployment
- Validate item defaulting and NBV population.

### Rollback Plan
- Remove client script deployment from forms.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Should asset load be skipped when `custcol_sna_fam_obj` is not an asset record?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Asset load slows line sourcing | Low | Med | Cache NBV on line if available |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
