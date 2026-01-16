# PRD: Update SO Line Level Fields

**PRD ID:** PRD-UNKNOWN-UpdateSoLineLevelFields
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_update_so_line_level_fields.js (Map/Reduce)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Updates Sales Order or Invoice item sublist fields from header values in bulk.

**What problem does it solve?**
Ensures line-level fields match header fields for reporting and downstream processing.

**Primary Goal:**
Propagate header values to item lines based on configured parameters.

---

## 2. Goals

1. Copy selected header fields to all item lines.
2. Optionally fill only empty line fields.
3. Support both Sales Orders and Invoices returned by a saved search.

---

## 3. User Stories

1. **As an** administrator, **I want to** update line fields in bulk **so that** reporting is consistent.
2. **As a** finance user, **I want to** ensure invoice line fields match header data **so that** posting is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load a saved search from script parameter `custscript_sna_saved_search`.
2. The system must determine record type (Sales Order or Invoice) from search results.
3. The system must copy configured header fields to item sublist fields on each line.
4. When `custscript_sna_empty_columns` is true, only empty line fields are populated.

### Acceptance Criteria

- [ ] Line fields are updated for each record in the saved search.
- [ ] Only fields enabled by script parameters are copied.
- [ ] Empty-only mode does not overwrite populated line values.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update header fields from line data.
- Create new transactions.
- Modify records outside the saved search.

---

## 6. Design Considerations

### User Interface
- No UI; Map/Reduce runs via deployment.

### User Experience
- Parameter-driven control over which fields are updated.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- invoice

**Script Types:**
- [x] Map/Reduce - Update item sublist fields
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Transaction | cseg_sna_revenue_st | Revenue stream header
- Transaction | custbody_nx_asset | NXC site asset header
- Transaction | custbody_sna_hul_nxc_eq_asset | NXC equipment asset header
- Transaction | custbody_nx_task | NXC service task header
- Transaction | custbody_nx_case | NXC service case header
- Transaction | custbody_sna_equipment_object | Equipment object header
- Transaction Line | custcol_nx_asset | NXC site asset line
- Transaction Line | custcol_nxc_equip_asset | NXC equipment asset line
- Transaction Line | custcol_nx_task | NXC service task line
- Transaction Line | custcol_nxc_case | NXC service case line
- Transaction Line | custcol_sna_hul_fleet_no | Equipment object line

**Saved Searches:**
- Script parameter `custscript_sna_saved_search` supplies the search ID.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Depends on saved search results.

**Data Sources:**
- Transaction header fields
- Item sublist fields

**Data Retention:**
- Updates existing transaction lines.

### Technical Constraints
- Map/Reduce governance limits for large record sets.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** None

### Governance Considerations

- **Script governance:** Record load/save per transaction.
- **Search governance:** Saved search input and item line updates.
- **API limits:** Consider smaller batches for large updates.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Line fields align with header values for targeted records.
- Empty-only mode preserves existing line values.

**How we'll measure:**
- Spot checks on updated transactions and line fields.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_update_so_line_level_fields.js | Map/Reduce | Copy header fields to line fields | Implemented |

### Development Approach

**Phase 1:** Configure parameters
- [ ] Set saved search and field flags

**Phase 2:** Execute and validate
- [ ] Run Map/Reduce
- [ ] Verify line updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales Order lines updated with header values for selected fields.

**Edge Cases:**
1. Invoice records are included and updated correctly.
2. Empty-only mode skips populated line fields.

**Error Handling:**
1. Missing saved search ID results in no processing.

### Test Data Requirements
- Sales Orders and Invoices with header fields populated
- Lines with empty and populated values

### Sandbox Setup
- Deploy Map/Reduce with parameters

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator or scripting role

**Permissions required:**
- Edit access to Sales Orders and Invoices

### Data Security
- Uses transaction data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Saved search configured
- [ ] Field flags reviewed

### Deployment Steps

1. Deploy Map/Reduce with parameters.
2. Execute against target records.

### Post-Deployment

- [ ] Verify line field updates
- [ ] Review logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable deployment.
2. Re-run after correcting parameters.

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

- [ ] Should the script support additional line fields?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Overwriting unintended line fields | Low | Med | Use field flags and empty-only mode |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce
- Transaction record fields

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
