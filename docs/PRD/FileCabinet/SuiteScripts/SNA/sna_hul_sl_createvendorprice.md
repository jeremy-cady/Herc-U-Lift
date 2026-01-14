# PRD: Create Vendor Price Suitelet

**PRD ID:** PRD-UNKNOWN-CreateVendorPriceSL
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_createvendorprice.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that creates vendor price custom records based on parameters passed in the request.

**What problem does it solve?**
Allows client or server processes to create vendor pricing records on demand for items and vendors.

**Primary Goal:**
Create a `customrecord_sna_hul_vendorprice` record with item, vendor, and purchase price.

---

## 2. Goals

1. Accept item, vendor, and rate parameters.
2. Create a vendor price record with those values.
3. Return the new record ID to the caller.

---

## 3. User Stories

1. **As a** buyer, **I want** vendor price records created automatically **so that** pricing stays current.
2. **As an** admin, **I want** a Suitelet endpoint **so that** external scripts can create vendor pricing.
3. **As a** developer, **I want** a simple API **so that** I can automate vendor price creation.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read request parameters `itm`, `itm_txt`, `buyFromVendor`, and `rate`.
2. The system must create a `customrecord_sna_hul_vendorprice` record.
3. The system must set:
   - `custrecord_sna_hul_item` to `itm`
   - `custrecord_sna_hul_vendor` to `buyFromVendor`
   - `custrecord_sna_hul_itempurchaseprice` to `rate` (or 0)
4. If `rate` is empty, the system must set `custrecord_sna_hul_primaryvendor` to true.
5. The system must return the new vendor price record ID in the response.

### Acceptance Criteria

- [ ] Vendor price record is created with item and vendor values.
- [ ] Rate is set to the provided value or 0.
- [ ] Response contains the new record ID.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate item or vendor IDs.
- Populate vendor item number fields.
- Prevent duplicate vendor price records.

---

## 6. Design Considerations

### User Interface
- None (Suitelet endpoint only).

### User Experience
- Caller receives a record ID or error message.

### Design References
- Vendor price custom record fields.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Vendor Price (`customrecord_sna_hul_vendorprice`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Vendor price creation
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- `custrecord_sna_hul_item`
- `custrecord_sna_hul_vendor`
- `custrecord_sna_hul_itempurchaseprice`
- `custrecord_sna_hul_primaryvendor`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One record per request.

**Data Sources:**
- Request parameters.

**Data Retention:**
- Vendor price record stored in NetSuite.

### Technical Constraints
- Uses SuiteScript 2.1 and record.create/save.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Caller must pass valid parameters.

### Governance Considerations
- One record create per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor price records are created as expected by calling scripts.

**How we'll measure:**
- Verify new vendor price records and returned IDs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_createvendorprice.js | Suitelet | Create vendor price records | Implemented |

### Development Approach

**Phase 1:** Record creation
- [x] Create and set vendor price fields.

**Phase 2:** Response handling
- [x] Return record ID or error.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Call Suitelet with valid parameters; record ID returned.

**Edge Cases:**
1. Missing rate; primary vendor flag set.
2. Missing item or vendor; error returned.

**Error Handling:**
1. Record save fails; error returned in response.

### Test Data Requirements
- Valid item and vendor IDs.

### Sandbox Setup
- Suitelet deployment accessible to calling scripts.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Scripts or users invoking the Suitelet.

**Permissions required:**
- Create vendor price custom records.

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_sl_createvendorprice.js`.
2. Deploy the Suitelet with appropriate permissions.
3. Validate record creation via test calls.

### Post-Deployment

- [ ] Verify vendor price record creation.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

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

- [ ] Should this Suitelet validate vendor/item existence before creation?
- [ ] Should duplicates be prevented by checking for existing records?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Duplicate vendor price records | Med | Med | Add pre-checks or unique constraints |
| Missing parameters create invalid records | Med | Low | Validate request parameters |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- record.create and record.save

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
