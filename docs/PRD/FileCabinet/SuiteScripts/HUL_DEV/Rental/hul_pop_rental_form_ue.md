# PRD: Populate Rental Form Defaults (User Event)

**PRD ID:** PRD-UNKNOWN-PopRentalFormUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_pop_rental_form_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that sets default rental form values by role and auto‑waives insurance when the customer has a valid certificate of insurance.

**What problem does it solve?**
Ensures consistent default revenue segment values for rental roles and reduces manual insurance waiver checks.

**Primary Goal:**
Set `cseg_sna_revenue_st` on create for rental roles and set `custbody_sna_hul_waive_insurance` when certificate conditions are met.

---

## 2. Goals

1. Apply default revenue segment values by role on create.
2. Check customer insurance certificate and expiration.
3. Set the insurance waiver flag when appropriate.

---

## 3. User Stories

1. **As a** rental coordinator, **I want** revenue segment auto‑set **so that** I don’t enter it manually.
2. **As an** admin, **I want** insurance waiver logic automated **so that** compliance checks are consistent.
3. **As a** user, **I want** defaults set only on create **so that** edits aren’t overwritten.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeLoad` for `CREATE`.
2. The system must set `cseg_sna_revenue_st` to `416` for the following roles:
   - 1162 (Rental Assistant Manager)
   - 1151 (Rental Billing Coordinator)
   - 1184 (Rental Coordinator)
   - 1167 (Rental Manager)
3. The system must check the customer for:
   - `custentity_sna_cert_of_insurance`
   - `custentity_sna_hul_date_of_exp_coi`
4. If a certificate exists and the expiration date is in the future, the system must set:
   - `custbody_sna_hul_waive_insurance` = true
5. Errors in the insurance check must be logged and not block the transaction.

### Acceptance Criteria

- [ ] On create, rental roles set revenue segment to 416.
- [ ] Insurance waiver is set when certificate is valid and unexpired.
- [ ] Errors do not block record creation.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Override values on edit.
- Validate insurance policy details beyond the two fields.
- Apply to non-rental roles.

---

## 6. Design Considerations

### User Interface
- No UI changes; defaulting fields behind the scenes.

### User Experience
- Faster creation with fewer manual steps.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (rental form)
- Customer

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Defaults on create
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `cseg_sna_revenue_st`
- Sales Order | `custbody_sna_hul_waive_insurance`
- Customer | `custentity_sna_cert_of_insurance`
- Customer | `custentity_sna_hul_date_of_exp_coi`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per create transaction.

**Data Sources:**
- Customer fields via SuiteQL.

**Data Retention:**
- Updates to the sales order being created.

### Technical Constraints
- SuiteQL query uses customer ID; must exist on create.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Customer insurance fields must be populated.

### Governance Considerations
- SuiteQL per create.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental orders have consistent revenue segment defaults.
- Insurance waiver is correctly set for qualified customers.

**How we'll measure:**
- Spot checks on new rental sales orders.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_pop_rental_form_ue.js | User Event | Set rental defaults and insurance waiver | Implemented |

### Development Approach

**Phase 1:** Role defaults
- [x] Set revenue segment for rental roles

**Phase 2:** Insurance waiver
- [x] Query customer insurance data
- [x] Set waiver flag if valid

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a rental sales order as role 1162 and confirm revenue segment set to 416.
2. Customer with valid COI and future expiration sets waiver flag.

**Edge Cases:**
1. Customer missing COI data; waiver not set.
2. Customer expiration date in the past; waiver not set.

**Error Handling:**
1. SuiteQL query fails; log error and continue.

### Test Data Requirements
- Customers with COI fields populated and unpopulated.

### Sandbox Setup
- Ensure rental roles and fields exist in sandbox.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Rental roles listed in the script.

**Permissions required:**
- Create sales orders
- View customer record fields

### Data Security
- No sensitive data stored; read-only COI fields.

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

1. Upload `hul_pop_rental_form_ue.js`.
2. Deploy as a User Event on the rental sales order form.
3. Verify defaulting and insurance waiver behavior.

### Post-Deployment

- [ ] Confirm defaults and waiver flags on new rentals.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should revenue segment 416 be configurable?
- [ ] Should the insurance waiver logic run on edit as well?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Role IDs change | Med | Med | Maintain role list |
| COI expiration format issues | Med | Low | Validate date handling |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.x User Event
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
