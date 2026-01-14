# PRD: Vendor Price Validation Client Script

**PRD ID:** PRD-UNKNOWN-VendorPrice
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_vendorprice.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that validates Item-Vendor combinations on Vendor Price custom records.

**What problem does it solve?**
It prevents duplicate item-vendor entries and ensures only one primary vendor per item.

**Primary Goal:**
Enforce uniqueness and primary vendor constraints on vendor price records.

---

## 2. Goals

1. Block duplicate item-vendor combinations.
2. Allow only one primary vendor per item.

---

## 3. User Stories

1. **As an** admin, **I want** vendor price records validated **so that** pricing data is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On save, the script must search for existing vendor price records with the same item.
2. If a record with the same item and vendor exists, the script must alert and block save.
3. If a record with the same item already has primary vendor checked, the script must block another primary vendor.

### Acceptance Criteria

- [ ] Duplicate item-vendor combinations are blocked.
- [ ] Only one primary vendor is allowed per item.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Auto-merge vendor price records.
- Enforce pricing values or rate validations.

---

## 6. Design Considerations

### User Interface
- Uses alert messages for duplicate validation.

### User Experience
- Users are warned immediately when attempting duplicates.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_sna_hul_vendorprice`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Validation on save

**Custom Fields:**
- `custrecord_sna_hul_item`
- `custrecord_sna_hul_vendor`
- `custrecord_sna_hul_primaryvendor`

**Saved Searches:**
- None (scripted search only).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search per save.

**Data Sources:**
- Vendor price record fields.

**Data Retention:**
- No data persisted.

### Technical Constraints
- None.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Vendor price custom record.

### Governance Considerations
- Client-side search on save.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor price records remain unique per item and vendor.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_vendorprice.js | Client Script | Validate vendor price records | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Enforce uniqueness by item/vendor.
- **Phase 2:** Enforce single primary vendor per item.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a new vendor price record for a new item-vendor pair.

**Edge Cases:**
1. Attempt duplicate item-vendor pair; save blocked.
2. Attempt second primary vendor for the same item; save blocked.

**Error Handling:**
1. Search error should not allow duplicates.

### Test Data Requirements
- Vendor price records with known item/vendor values.

### Sandbox Setup
- Deploy client script to vendor price custom record.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admins managing vendor pricing.

**Permissions required:**
- Create and edit vendor price records.

### Data Security
- Uses internal pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm vendor price custom record fields.

### Deployment Steps
1. Upload `sna_hul_cs_vendorprice.js`.
2. Deploy to vendor price custom record.

### Post-Deployment
- Validate duplicate detection.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should inactive vendor price records be considered for duplicates?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Duplicate check ignores inactive records | Low | Med | Decide and document intended behavior |

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
