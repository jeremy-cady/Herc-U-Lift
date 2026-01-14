# PRD: Address Form Pricing Group Client Script

**PRD ID:** PRD-UNKNOWN-AddressFormCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_address_form.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that sets customer pricing group fields on address records based on the address ZIP code and customer.

**What problem does it solve?**
Automates population of service and parts pricing group fields on customer address records.

**Primary Goal:**
Set pricing group fields when address ZIP or address record is loaded.

---

## 2. Goals

1. Populate `custrecord_sna_cpg_parts` on page init when missing.
2. Update `custrecord_sna_cpg_service` when ZIP code changes.

---

## 3. User Stories

1. **As an** admin, **I want** pricing groups set automatically **so that** address pricing stays consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On pageInit, if `custrecord_sna_cpg_parts` is empty, the system must look up the customer address entry and set it.
2. On ZIP change, the system must look up the Sales Zone and set `custrecord_sna_cpg_service`.

### Acceptance Criteria

- [ ] Parts pricing group is set on load when missing.
- [ ] Service pricing group updates when ZIP changes.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate ZIP formats.
- Update customer records beyond address fields.

---

## 6. Design Considerations

### User Interface
- Runs on address form fields without additional UI.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer (address subrecord)
- Sales Zone (`customrecord_sna_sales_zone`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Address pricing group updates

**Custom Fields:**
- Address | `custrecord_sna_cpg_parts`
- Address | `custrecord_sna_cpg_service`

**Saved Searches:**
- Searches created dynamically in script.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single address record per edit.

**Data Sources:**
- Customer address list and sales zone records.

**Data Retention:**
- Updates address fields only.

### Technical Constraints
- Address internal ID matching depends on customer address sublist search.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.

### Governance Considerations
- Client-side search on pageInit and ZIP change.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Pricing groups populate correctly on address forms.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_address_form.js | Client Script | Address pricing group updates | Implemented |

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open address without parts pricing group; value is populated.
2. Change ZIP; service pricing group updates.

**Edge Cases:**
1. ZIP not found in Sales Zone; service pricing group remains blank.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users editing customer addresses.

**Permissions required:**
- View sales zone records

---

## 12. Deployment Plan

### Deployment Steps

1. Upload `sna_hul_cs_address_form.js`.
2. Deploy on address form.

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

- [ ] Should ZIP lookup support extended ZIP formats?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Sales zone data missing | Low | Med | Add validation or fallback |

---

## 15. References & Resources

### NetSuite Documentation
- SuiteScript 2.x Client Script

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
