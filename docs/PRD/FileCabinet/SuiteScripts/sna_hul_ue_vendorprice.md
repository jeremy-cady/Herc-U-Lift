# PRD: Validate Vendor Price Uniqueness

**PRD ID:** PRD-UNKNOWN-VendorPrice
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_vendorprice.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Validates vendor price records to prevent duplicate item-vendor combinations and multiple primary vendors per item.

**What problem does it solve?**
Ensures vendor pricing data stays consistent and unambiguous for each item.

**Primary Goal:**
Enforce uniqueness and primary vendor rules on customrecord_sna_hul_vendorprice.

---

## 2. Goals

1. Prevent duplicate item-vendor combinations.
2. Allow only one primary vendor per item.
3. Block save when rules are violated.

---

## 3. User Stories

1. **As a** procurement admin, **I want to** avoid duplicate vendor pricing records **so that** pricing is clear.
2. **As a** buyer, **I want to** allow only one primary vendor **so that** sourcing is consistent.
3. **As an** admin, **I want to** enforce rules at save time **so that** data integrity is maintained.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit, the system must read custrecord_sna_hul_item, custrecord_sna_hul_vendor, and custrecord_sna_hul_primaryvendor.
2. The system must search for other vendor price records with the same item, excluding the current record.
3. If a record with the same item and vendor exists, the system must throw an error.
4. If another record for the item has primary vendor true and the current record is also primary, the system must throw an error.

### Acceptance Criteria

- [ ] Duplicate item-vendor records are blocked.
- [ ] Multiple primary vendors for the same item are blocked.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Auto-resolve duplicates.
- Validate vendor price values.
- Run on delete.

---

## 6. Design Considerations

### User Interface
- Error messages are thrown on save.

### User Experience
- Save is blocked when rule violations occur.

### Design References
- Custom record: customrecord_sna_hul_vendorprice

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom record: customrecord_sna_hul_vendorprice

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Validation
- [ ] Client Script - N/A

**Custom Fields:**
- Vendor Price | custrecord_sna_hul_item | Item
- Vendor Price | custrecord_sna_hul_vendor | Vendor
- Vendor Price | custrecord_sna_hul_primaryvendor | Primary vendor

**Saved Searches:**
- None (ad hoc search)

### Integration Points
- None

### Data Requirements

**Data Volume:**
- Per vendor price record save.

**Data Sources:**
- Existing vendor price records.

**Data Retention:**
- No data stored by this script.

### Technical Constraints
- Uses search to evaluate duplicates and primary vendor rules.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Vendor price custom record

### Governance Considerations

- **Script governance:** One search per save.
- **Search governance:** Item-based search.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate vendor price records are prevented.
- Primary vendor uniqueness is maintained.

**How we'll measure:**
- Attempt to create duplicates and confirm errors.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_vendorprice.js | User Event | Enforce vendor price uniqueness | Implemented |

### Development Approach

**Phase 1:** Duplicate detection
- [x] Check for item-vendor duplicates.

**Phase 2:** Primary vendor enforcement
- [x] Enforce single primary vendor per item.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a vendor price record with unique item-vendor, verify save.

**Edge Cases:**
1. Create duplicate item-vendor record, verify error.
2. Create second primary vendor record for same item, verify error.

**Error Handling:**
1. Search failure, verify error logged.

### Test Data Requirements
- Existing vendor price records for an item.

### Sandbox Setup
- Deploy User Event to customrecord_sna_hul_vendorprice.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to vendor price records.

### Data Security
- No data changes; validation only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Custom record customrecord_sna_hul_vendorprice is active.

### Deployment Steps
1. Deploy User Event to vendor price record.

### Post-Deployment
- Validate with duplicate attempts.

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
- Should duplicates be checked for inactive vendor price records?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing duplicates | New saves blocked | Clean up existing data |

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
