# PRD: Duplicate Asset Cleanup for Transactions

**PRD ID:** PRD-UNKNOWN-DupeAssetTransaction
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_dupeasset_tran.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that updates transaction body and line asset references to merged assets and inactivates duplicates.

**What problem does it solve?**
It standardizes transaction asset references by replacing duplicates with active assets.

**Primary Goal:**
Update transaction and line asset fields to merged assets and inactivate duplicates.

---

## 2. Goals

1. Load a saved search of transactions with duplicate asset references.
2. Update transaction-level and line-level merge asset fields.
3. Mark duplicate assets as inactive and link active assets to duplicates.

---

## 3. User Stories

1. **As a** finance user, **I want** transactions to use active assets **so that** reporting is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from parameter `custscript_sna_dupe_tran`.
2. The script must set transaction merge asset field `custbody_sna_mergedequipasset` when duplicates exist.
3. The script must set line merge asset field `custcol_sn_hul_mergequipassettime` for duplicate line assets.
4. The script must flag `custbody_sn_asset_dup_checking` during processing and reset it after save.
5. The script must set `custrecord_sna_duplicate_asset` on the active asset and inactivate old assets.

### Acceptance Criteria

- [ ] Transaction and line merged asset fields are populated.
- [ ] Old assets are inactivated and linked to active assets.
- [ ] Asset duplication checking flag resets to false after processing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify transaction history or approvals.

---

## 6. Design Considerations

### User Interface
- None; backend cleanup.

### User Experience
- Users see merged asset references on transactions and lines.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction records from saved search (record type varies)
- Custom Record | `customrecord_nx_asset`

**Script Types:**
- [x] Map/Reduce - Duplicate asset normalization
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_sna_hul_nxc_eq_asset`
- Transaction | `custbody_sna_mergedequipasset`
- Transaction | `custbody_sn_asset_dup_checking`
- Line | `custcol_nxc_equip_asset`
- Line | `custcol_sn_hul_mergequipassettime`
- Asset | `custrecord_sna_dup_asset`
- Asset | `custrecord_sna_duplicate_asset`

**Saved Searches:**
- Search from parameter `custscript_sna_dupe_tran`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Results from saved search; grouped by transaction ID.

**Data Sources:**
- Transaction records and asset records.

**Data Retention:**
- Updates transaction and asset records.

### Technical Constraints
- Relies on search results containing record type, body asset, and line asset fields.

### Dependencies
- **Libraries needed:** N/record, N/search, N/runtime, N/error.
- **External dependencies:** None.

### Governance Considerations
- Loads transactions and updates multiple lines per transaction.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Transactions reference active assets and duplicate assets are inactivated.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_dupeasset_tran.js | Map/Reduce | Normalize transaction asset references | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Group search results by transaction.
- **Phase 2:** Update transaction and asset records.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Transaction with duplicate body and line assets updates merge fields and inactivates old assets.

**Edge Cases:**
1. Transaction lines without duplicate assets remain unchanged.

**Error Handling:**
1. Invalid search parameter should log errors.

### Test Data Requirements
- Saved search returning transaction rows with asset fields and record type.

### Sandbox Setup
- Ensure assets have `custrecord_sna_dup_asset` populated.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or data cleanup role.

**Permissions required:**
- Edit transactions and asset records.

### Data Security
- Internal asset data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure `custscript_sna_dupe_tran` search parameter.

### Deployment Steps
1. Upload `sna_hul_mr_dupeasset_tran.js`.
2. Deploy Map/Reduce with saved search.

### Post-Deployment
- Validate transaction merge fields and asset inactivation.

### Rollback Plan
- Disable script deployment.

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
- [ ] Should line-level original assets be stored for audit?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Inactivating assets still referenced elsewhere | Med | High | Validate usage before cleanup |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
