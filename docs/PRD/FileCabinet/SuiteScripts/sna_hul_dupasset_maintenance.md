# PRD: Duplicate Asset Maintenance Map/Reduce

**PRD ID:** PRD-UNKNOWN-DupAssetMaintenance
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_dupasset_maintenance.js (Map/Reduce Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that merges duplicate assets referenced in maintenance records.

**What problem does it solve?**
It consolidates duplicate assets by updating maintenance records and inactivating the old asset.

**Primary Goal:**
Merge duplicate assets and update related maintenance and asset records.

---

## 2. Goals

1. Load maintenance records from a saved search.
2. Update maintenance to reference the duplicate asset.
3. Mark the original asset as inactive and link duplicate relationships.

---

## 3. User Stories

1. **As an** admin, **I want** duplicate assets merged **so that** maintenance records point to the correct asset.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read a saved search ID from `custscript_sna_dupe_maintenance` and use it as input.
2. For each record group in reduce, the script must:
   - Set `custrecord_sn_hul_mergequipassetmaint` on the maintenance record to the duplicate asset.
   - Set `custrecord_sna_duplicate_asset` on the duplicate asset to the original asset.
   - Inactivate the original asset.
3. The script must log errors in summarize when errors occur in any stage.

### Acceptance Criteria

- [ ] Maintenance records link to the duplicate asset.
- [ ] Original assets are inactivated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate whether assets are truly duplicates.
- Notify users when updates are applied.

---

## 6. Design Considerations

### User Interface
- None (server-side processing).

### User Experience
- Changes occur asynchronously via Map/Reduce.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_nxc_mr` (Maintenance)
- Custom Record | `customrecord_nx_asset` (Asset)

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Map/Reduce - Duplicate asset merge
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Maintenance | `custrecord_nxc_mr_asset`
- Asset | `custrecord_sna_dup_asset`
- Maintenance | `custrecord_sn_hul_mergequipassetmaint`
- Asset | `custrecord_sna_duplicate_asset`
- Asset | `isinactive`

**Saved Searches:**
- Script parameter `custscript_sna_dupe_maintenance`

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Based on saved search result set.

**Data Sources:**
- Maintenance and asset records.

**Data Retention:**
- Updates maintenance and asset records in place.

### Technical Constraints
- Assumes saved search returns maintenance records with duplicate asset info.

### Dependencies
- **Libraries needed:** N/error, N/record, N/runtime, N/search.
- **External dependencies:** None.
- **Other features:** Maintenance saved search configuration.

### Governance Considerations
- Map/Reduce processing for large result sets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate assets are merged and maintenance records updated.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_dupasset_maintenance.js | Map/Reduce | Merge duplicate assets in maintenance | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load and process maintenance records.
- **Phase 2:** Update asset and maintenance links.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run script with saved search containing duplicate assets; maintenance and assets update.

**Edge Cases:**
1. Missing duplicate asset field; script logs and skips.

**Error Handling:**
1. Submit fields errors should be captured in summarize.

### Test Data Requirements
- Maintenance records with `custrecord_sna_dup_asset` populated.

### Sandbox Setup
- Configure saved search and deploy Map/Reduce script.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admins running Map/Reduce.

**Permissions required:**
- Edit maintenance and asset records.

### Data Security
- Updates internal asset records only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm saved search parameter is set.

### Deployment Steps
1. Upload `sna_hul_dupasset_maintenance.js`.
2. Deploy Map/Reduce with saved search parameter.

### Post-Deployment
- Review updated maintenance records and asset status.

### Rollback Plan
- Re-activate assets manually if needed.

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
- [ ] Should the script skip already inactive assets?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect duplicate mapping in saved search | Med | High | Validate search criteria before running |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
