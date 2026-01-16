# PRD: Set Tax Not Taxable

**PRD ID:** PRD-UNKNOWN-SetTaxNontaxable
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_set_tax_nontaxable.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that redirects to a suitelet to set line tax codes to Not Taxable for internal revenue streams.

**What problem does it solve?**
Ensures tax codes are correctly set after transaction changes without blocking the save.

**Primary Goal:**
Kick off the tax update suitelet after record submit.

---

## 2. Goals

1. Trigger the tax update suitelet after save.
2. Avoid running on delete events.

---

## 3. User Stories

1. **As a** finance user, **I want to** enforce non-taxable lines for internal revenue **so that** taxes are correct.

---

## 4. Functional Requirements

### Core Functionality

1. On afterSubmit (excluding delete), the script must redirect to the Set NonTaxable suitelet.
2. The script must pass the record id and type to the suitelet.

### Acceptance Criteria

- [ ] Suitelet is invoked after save with the correct parameters.
- [ ] Delete events do not trigger the suitelet.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Compute tax directly in the User Event.

---

## 6. Design Considerations

### User Interface
- No UI changes beyond suitelet redirect.

### User Experience
- Tax updates occur after save without manual intervention.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- transaction (varies by deployment)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Set non-taxable lines
- [ ] RESTlet - N/A
- [x] User Event - Redirect to suitelet
- [ ] Client Script - N/A

**Custom Fields:**
- None referenced directly by the User Event.

**Saved Searches:**
- None.

### Integration Points
- Suitelet: customscript_sna_hul_sl_set_nontaxable

### Data Requirements

**Data Volume:**
- One suitelet call per submit.

**Data Sources:**
- Record id and type from the User Event context.

**Data Retention:**
- Tax code updates occur in the suitelet.

### Technical Constraints
- Requires suitelet deployment to be active.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Set NonTaxable suitelet

### Governance Considerations

- **Script governance:** Minimal, just redirect.
- **Search governance:** None in UE.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Non-taxable tax codes are applied after saves where required.

**How we'll measure:**
- Validate tax codes on internal revenue stream transactions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_set_tax_nontaxable.js | User Event | Redirect to tax update suitelet | Implemented |

### Development Approach

**Phase 1:** Redirect behavior
- [ ] Validate suitelet invocation

**Phase 2:** Tax updates
- [ ] Validate suitelet updates tax codes

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save a transaction and verify suitelet runs.

**Edge Cases:**
1. Delete a transaction and verify no redirect occurs.

**Error Handling:**
1. Suitelet deployment missing should log an error.

### Test Data Requirements
- Transaction with internal revenue stream.

### Sandbox Setup
- Deploy User Event on target transaction types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance users

**Permissions required:**
- Edit transactions

### Data Security
- Tax changes limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm suitelet deployment is active

### Deployment Steps

1. Deploy User Event on target transactions.
2. Verify suitelet execution.

### Post-Deployment

- [ ] Monitor suitelet errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Run suitelet manually as needed.

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

- [ ] Should this redirect be conditional on transaction type?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Suitelet unavailable at runtime | Low | Med | Monitor deployments and alert on errors |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.
