# PRD: FAM Asset Fleet Code Sync

**PRD ID:** PRD-UNKNOWN-FAMAssetFleetCode
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_famasset.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that copies the Fleet Code from a vendor bill line to the fixed asset record.

**What problem does it solve?**
Ensures fixed assets carry the fleet code from the originating purchase line.

**Primary Goal:**
Update fixed assets with the fleet code from the vendor bill line.

---

## 2. Goals

1. Locate the vendor bill line linked to the fixed asset.
2. Copy `custcol_sna_po_fleet_code` to `custrecord_sna_hul_fleet_code`.

---

## 3. User Stories

1. **As a** finance user, **I want to** sync fleet codes to fixed assets **so that** asset records align with PO data.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on fixed asset record changes (non-delete).
2. The script must load the vendor bill and line referenced by the asset fields.
3. The script must write the fleet code to the fixed asset record.

### Acceptance Criteria

- [ ] Fixed assets receive fleet code from the vendor bill line.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update fleet codes without linked bill data.
- Validate fleet code formats.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Fleet codes appear automatically on fixed assets.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_ncfar_asset
- vendorbill

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Sync fleet code
- [ ] Client Script - N/A

**Custom Fields:**
- fixed asset | custrecord_assetpurchaseorder | Purchase order
- fixed asset | custrecord_assetsourcetrn | Source vendor bill
- fixed asset | custrecord_assetsourcetrnline | Source bill line
- vendor bill line | custcol_sna_po_fleet_code | Fleet code
- fixed asset | custrecord_sna_hul_fleet_code | Fleet code

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One vendor bill load per asset update.

**Data Sources:**
- Vendor bill line data.

**Data Retention:**
- Updates fixed asset field only.

### Technical Constraints
- Bill line is calculated as `billline - 1` for sublist index.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Fixed Asset Management

### Governance Considerations

- **Script governance:** One record load and submitFields per asset.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Fixed assets contain fleet codes from their source vendor bill lines.

**How we'll measure:**
- Review fixed assets created from vendor bills for correct fleet codes.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_famasset.js | User Event | Sync fleet code to fixed asset | Implemented |

### Development Approach

**Phase 1:** Source line lookup
- [ ] Validate bill line index logic

**Phase 2:** Field update
- [ ] Validate fleet code field update

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Fixed asset created from vendor bill line updates fleet code.

**Edge Cases:**
1. Missing billline or bill skips update.

**Error Handling:**
1. Vendor bill load errors are logged.

### Test Data Requirements
- Fixed asset linked to vendor bill and line

### Sandbox Setup
- Deploy User Event on fixed asset records.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance roles

**Permissions required:**
- Edit fixed assets
- View vendor bills

### Data Security
- Vendor bill data restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm source bill line field mapping

### Deployment Steps

1. Deploy User Event on fixed asset records.
2. Validate fleet code sync.

### Post-Deployment

- [ ] Monitor logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update fleet codes manually.

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

- [ ] Should the bill line index logic handle missing line numbers?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Bill line mismatch causes wrong fleet code | Low | Med | Validate bill line mapping in test data |

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
