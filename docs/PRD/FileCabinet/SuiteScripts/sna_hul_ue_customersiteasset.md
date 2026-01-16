# PRD: Customer Site Asset Auto-Creation

**PRD ID:** PRD-UNKNOWN-CustomerSiteAsset
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_customersiteasset.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that creates or links NXC Site Asset records for customer addresses and writes the asset link back to the addressbook.

**What problem does it solve?**
Keeps customer addresses synced to site asset records without manual creation.

**Primary Goal:**
Ensure each eligible customer address has an associated NXC Site Asset record.

---

## 2. Goals

1. Identify customer addresses that should auto-create site assets.
2. Create or update site asset records based on customer addresses.
3. Link site assets back to the customer addressbook records.

---

## 3. User Stories

1. **As a** customer admin, **I want to** auto-create site assets for addresses **so that** site assets are always available.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Customer create/edit (non-delete).
2. The script must collect customer addressbook entries and normalize addresses.
3. The script must create NXC Site Assets for addresses flagged for auto-create and not excluded.
4. The script must update existing site assets with address ID and address text.
5. The script must write the site asset ID back to the customer addressbook subrecord.

### Acceptance Criteria

- [ ] Eligible customer addresses create site assets.
- [ ] Addressbook entries link to the created/updated site assets.
- [ ] Excluded locations are skipped.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create equipment assets.
- Update addresses that are explicitly excluded.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Site assets appear automatically after customer save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customer
- customrecord_nx_asset
- customrecord_sna_sales_zone
- location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Create/link site assets
- [ ] Client Script - N/A

**Custom Fields:**
- addressbookaddress | custrecordsn_nxc_site_asset | Site asset reference
- addressbookaddress | custrecord_sn_autocreate_asset | Auto-create flag
- customrecord_nx_asset | custrecord_nxc_na_asset_type | Asset type
- customrecord_nx_asset | custrecord_nx_asset_customer | Customer
- customrecord_nx_asset | custrecord_nx_asset_address | Address reference
- customrecord_nx_asset | custrecord_nx_asset_address_text | Address text
- customrecord_nx_asset | custrecord_nx_asset_region | Region

**Saved Searches:**
- Searches on customer addresses and site assets.

### Integration Points
- Zip-to-region lookup via `customrecord_sna_sales_zone`.

### Data Requirements

**Data Volume:**
- One site asset per eligible address.

**Data Sources:**
- Customer addressbook records.

**Data Retention:**
- Creates/updates site assets and updates addressbook.

### Technical Constraints
- Excluded location IDs provided via script parameter `custscript_sn_locations_to_exclude`.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Addressbook custom fields

### Governance Considerations

- **Script governance:** Multiple searches and record saves per customer.
- **Search governance:** Address and asset searches can scale with address count.
- **API limits:** Moderate on customers with many addresses.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Customer addresses are linked to correct site asset records.

**How we'll measure:**
- Review customer addressbook entries and linked site assets.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_customersiteasset.js | User Event | Create/link site assets | Implemented |

### Development Approach

**Phase 1:** Address discovery
- [ ] Validate address normalization and matching

**Phase 2:** Asset creation/linking
- [ ] Validate site asset creation and address linking

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Customer address with auto-create flag generates site asset and links address.

**Edge Cases:**
1. Excluded location addresses are skipped.
2. Duplicate addresses do not create duplicate site assets.

**Error Handling:**
1. Asset creation errors are logged.

### Test Data Requirements
- Customer with multiple addresses and auto-create flags

### Sandbox Setup
- Deploy User Event on Customer.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Customer admin roles

**Permissions required:**
- Create and edit customrecord_nx_asset
- Edit customer addressbook

### Data Security
- Site asset records restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure script parameters for site form/type and excluded locations

### Deployment Steps

1. Deploy User Event on Customer.
2. Validate addressbook updates and site asset creation.

### Post-Deployment

- [ ] Monitor logs for address matching errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Manually create site assets if needed.

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

- [ ] Should site assets be deleted if addresses are removed?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Address normalization mismatches | Med | Med | Normalize address formatting consistently |

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
