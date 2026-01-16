# PRD: Lock Quote Conversion

**PRD ID:** PRD-UNKNOWN-LockQuoteConversion
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_lock_quote_convresion.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that blocks conversion of rental estimates to Sales Orders when credit and insurance requirements are not met.

**What problem does it solve?**
Prevents order conversion when customer credit limit or certificate of insurance conditions are not satisfied.

**Primary Goal:**
Enforce credit limit and certificate of insurance checks during rental estimate conversion.

---

## 2. Goals

1. Validate customer certificate of insurance or waiver.
2. Enforce credit limit checks unless override is enabled.

---

## 3. User Stories

1. **As a** sales user, **I want to** prevent conversions that violate credit or insurance rules **so that** compliance is enforced.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeSubmit on Sales Order create.
2. If created from a rental estimate form, the script must check customer COI and credit limit.
3. The script must throw errors when COI is missing/expired and waiver is not set.
4. The script must throw errors when order exceeds credit limit and do-not-enforce is not set.

### Acceptance Criteria

- [ ] Rental estimate conversions are blocked when COI is missing/expired without waiver.
- [ ] Rental estimate conversions are blocked when credit limit is exceeded without override.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Apply to non-rental estimate conversions.
- Update customer credit or insurance data.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Users receive error messages preventing conversion.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- estimate
- customer

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Conversion validation
- [ ] Client Script - N/A

**Custom Fields:**
- estimate | custbody_sna_hul_custcredit_limit | Credit limit
- estimate | custbody_sna_hul_waive_insurance | Waive insurance flag
- estimate | custbody_sna_hul_donotenforce | Do not enforce credit
- customer | custentity_sna_cert_of_insurance | COI file
- customer | custentity_sna_hul_date_of_exp_coi | COI expiry

**Saved Searches:**
- None (uses lookupFields).

### Integration Points
- Uses script parameter `custscript_sna_rentalestform` for rental estimate form ID.

### Data Requirements

**Data Volume:**
- One customer lookup per conversion.

**Data Sources:**
- Estimate and customer fields.

**Data Retention:**
- No record updates.

### Technical Constraints
- Only applies to Sales Order create from rental estimate form.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Credit limit and COI configuration

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** LookupFields for estimate and customer.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental estimate conversions are blocked unless requirements are met.

**How we'll measure:**
- Test conversions with valid/invalid COI and credit conditions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_lock_quote_convresion.js | User Event | Validate conversion requirements | Implemented |

### Development Approach

**Phase 1:** COI validation
- [ ] Validate COI and waiver logic

**Phase 2:** Credit validation
- [ ] Validate credit limit checks

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Rental estimate with valid COI and credit limit converts successfully.

**Edge Cases:**
1. Missing COI without waiver blocks conversion.
2. Credit limit exceeded without override blocks conversion.

**Error Handling:**
1. Lookup errors are logged.

### Test Data Requirements
- Rental estimate with customer COI and credit limit values

### Sandbox Setup
- Deploy User Event on Sales Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales roles

**Permissions required:**
- Create Sales Orders
- View customer credit and COI fields

### Data Security
- Credit and insurance data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm rental estimate form ID parameter

### Deployment Steps

1. Deploy User Event on Sales Order.
2. Validate conversion error messages.

### Post-Deployment

- [ ] Monitor logs for conversion errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Manually validate conversions.

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

- [ ] Should credit limit checks apply to non-rental estimates?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| COI expiry dates missing lead to false blocks | Low | Med | Validate customer COI setup |

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
