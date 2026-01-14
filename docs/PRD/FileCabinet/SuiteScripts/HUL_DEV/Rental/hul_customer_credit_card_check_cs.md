# PRD: Rental Credit Card Required Check (Client Script)

**PRD ID:** PRD-UNKNOWN-RentalCreditCardCheckCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_customer_credit_card_check_cs.js (Client Script)
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that enforces credit card-on-file requirements for rental sales orders based on terms, with warnings and save blocking.

**What problem does it solve?**
Prevents rental transactions from proceeding when customer or sales order terms require a credit card but none is on file.

**Primary Goal:**
Warn users and block save when credit card-required terms are in effect and no credit card exists.

---

## 2. Goals

1. Check credit card requirements based on terms.
2. Warn users when credit card is missing.
3. Block save when required and missing.

---

## 3. User Stories

1. **As a** rental user, **I want** a warning when a card is required **so that** I can add one before saving.
2. **As an** admin, **I want** saves blocked without a card **so that** policy is enforced.
3. **As a** support user, **I want** clear prompts **so that** I know why save failed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must only run on form ID `121`.
2. The system must treat terms ID `8` as requiring a credit card.
3. The system must evaluate requirements based on:
   - Sales order terms (`terms`)
   - Customer terms (if SO terms not required)
4. The system must load the customer record and inspect the `paymentinstruments` sublist.
5. A credit card is considered present if `instrumenttype` is `1` or `3`.
6. On `pageInit`, the system must:
   - Log payment instrument types when a customer is known
   - Schedule a warning check
7. On `postSourcing`, the system must:
   - Re-evaluate on `entity` or `terms` changes
   - Log payment instruments when `entity` changes
8. On `saveRecord`, the system must block save if a card is required and missing.
9. Warnings must be displayed using `hul_swal` with a fallback `alert`.

### Acceptance Criteria

- [ ] On form 121, customers with required terms and no card receive a warning.
- [ ] Save is blocked when required and missing.
- [ ] Customers with valid cards can save.
- [ ] Logging occurs for payment instruments when customer is known.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate card expiration or card type beyond instrumenttype IDs.
- Enforce requirements on other forms.
- Provide server-side enforcement.

---

## 6. Design Considerations

### User Interface
- SweetAlert warning modal or native alert fallback.

### User Experience
- Debounced checks to avoid UI spam.

### Design References
- hul_swal credit card required message.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer
- Sales Order (rental form 121)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Credit card check

**Custom Fields:**
- None (uses standard `terms` and payment instruments).

**Saved Searches:**
- None.

### Integration Points
- Uses `hul_swal` for warnings.

### Data Requirements

**Data Volume:**
- Per transaction.

**Data Sources:**
- Sales order fields and customer payment instruments.

**Data Retention:**
- None.

### Technical Constraints
- Requires client access to load customer record.
- Terms requiring credit card are hard-coded.

### Dependencies
- **Libraries needed:** `SuiteScripts/HUL_DEV/Global/hul_swal`.
- **External dependencies:** None.
- **Other features:** Customer payment instruments configured.

### Governance Considerations
- Customer record load on evaluation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental orders are not saved without required credit cards.

**How we'll measure:**
- User reports and reduced policy violations.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_customer_credit_card_check_cs.js | Client Script | Enforce card required by terms | Implemented |

### Development Approach

**Phase 1:** Evaluation
- [x] Form/terms gate and customer load
- [x] Payment instrument scan

**Phase 2:** UX handling
- [x] Debounced warnings
- [x] Save blocking on missing card

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Form 121 with terms requiring card and a card on file saves successfully.
2. Form 121 with required terms and no card blocks save with warning.

**Edge Cases:**
1. Form not 121; no checks run.
2. Customer has no payment instruments; warning and block on save.

**Error Handling:**
1. Load errors fail open and do not block save.

### Test Data Requirements
- Customer with payment instruments (instrumenttype 1 or 3).
- Customer without payment instruments and terms requiring CC.

### Sandbox Setup
- Ensure terms ID 8 exists and is set on the customer or SO.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users creating rental sales orders.

**Permissions required:**
- Read access to customer records and payment instruments.

### Data Security
- Client-side only; not a security control.

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

1. Upload `hul_customer_credit_card_check_cs.js`.
2. Deploy as a client script on the rental sales order form (ID 121).
3. Verify SweetAlert library access.

### Post-Deployment

- [ ] Confirm save blocking when card missing.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the client script deployment.

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

- [ ] Should `TERMS_REQUIRE_CC` be configurable?
- [ ] Should there be server-side enforcement as well?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Terms ID changes | Med | Med | Move to configuration |
| Client-side bypass | Low | High | Add server-side check |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.md

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
