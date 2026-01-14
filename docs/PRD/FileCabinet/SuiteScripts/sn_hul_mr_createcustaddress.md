# PRD: Create Customer Address from Site Asset (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-CreateCustAddress
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_mr_createcustaddress.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that creates customer address book entries from site asset records.

**What problem does it solve?**
Automates customer address creation based on site asset address text and links the address back to the asset.

**Primary Goal:**
Parse site asset address text and add a customer address linked to the asset.

---

## 2. Goals

1. Load site asset records missing customer addresses.
2. Parse address text into components.
3. Create customer address book entries and link back to the asset.

---

## 3. User Stories

1. **As an** admin, **I want** addresses created from site assets **so that** customer records stay in sync.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load assets from saved search `customsearch_sna_no_address_site_asset_u`.
2. The system must parse address text into address lines, city, state, zip, and country.
3. The system must add a customer address book entry and tag it with the asset.
4. The system must skip addresses that match excluded locations specified by `custscript_sn_locations_to_exclude`.
5. The system must update the site asset with the new address internal ID.

### Acceptance Criteria

- [ ] Customer address book entries are created for eligible assets.
- [ ] Site assets are updated with the new address ID.
- [ ] Excluded location addresses are not added.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update inactive locations.
- Validate addresses beyond basic parsing.
- Handle non-US address formats beyond current parsing logic.

---

## 6. Design Considerations

### User Interface
- No UI; background Map/Reduce.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer
- Site Asset (`customrecord_nx_asset`)
- Location

**Script Types:**
- [x] Map/Reduce - Address creation
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Site Asset | `custrecord_nx_asset_customer`
- Site Asset | `custrecord_nx_asset_address_text`
- Site Asset | `custrecord_nx_asset_address`
- Address | `custrecordsn_nxc_site_asset`
- Address | `custrecord_sn_autocreate_asset`

**Saved Searches:**
- `customsearch_sna_no_address_site_asset_u`

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Site asset records returned by the saved search.

**Data Sources:**
- Site asset address text and customer record.

**Data Retention:**
- Creates address entries and updates asset references.

### Technical Constraints
- Address parsing is heuristic and assumes US formatting.
- Excluded locations are derived from location records.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Saved search and script parameter for excluded locations.

### Governance Considerations
- Record load/save operations per asset.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Customers have address entries linked to site assets.

**How we'll measure:**
- Verify addressbook entries and asset `custrecord_nx_asset_address` values.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_mr_createcustaddress.js | Map/Reduce | Create customer addresses from assets | Implemented |

### Development Approach

**Phase 1:** Identify assets
- [x] Load assets without addresses.

**Phase 2:** Address creation
- [x] Parse address text and create addressbook entries.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Asset with valid address text creates a customer address.

**Edge Cases:**
1. Address matches excluded locations; no address created.
2. Address text missing or malformed; skip or incomplete results.

**Error Handling:**
1. Errors in reduce stage logged in summarize.

### Test Data Requirements
- Site assets with address text and linked customers.

### Sandbox Setup
- Configure `custscript_sn_locations_to_exclude` parameter.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admin or data maintenance roles.

**Permissions required:**
- Edit customers
- Edit site assets
- View locations

### Data Security
- No additional data exposure.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sn_hul_mr_createcustaddress.js`.
2. Ensure saved search and excluded location parameter exist.
3. Deploy and run the Map/Reduce script.

### Post-Deployment

- [ ] Verify addressbook entries and asset updates.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

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

- [ ] Should address parsing be moved to a shared utility?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Address parsing fails for non-standard formats | Med | Med | Add validation and fallback parsing |
| Exclusion list is missing or invalid | Low | Med | Validate parameter before use |

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
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
