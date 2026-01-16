# PRD: Bill Payment Commission Payable Update

**PRD ID:** PRD-UNKNOWN-BPUpdateRelatedCommPayable
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_bp_update_related_comm_payable.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event script on Bill Payment that marks related Commission Payable transactions as paid.

**What problem does it solve?**
Keeps commission payable status aligned with bill payment processing.

**Primary Goal:**
Update commission payable transactions to paid when a bill payment is created or paybills event occurs.

---

## 2. Goals

1. Detect Commission Payable lines on Bill Payment apply sublist.
2. Update related Commission Payable transactions to paid status.

---

## 3. User Stories

1. **As an** accounting user, **I want to** mark commission payables as paid automatically **so that** I do not have to update them manually.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Bill Payment create or paybills.
2. The script must scan the apply sublist for lines of type "Commission Payable".
3. The script must update `customtransaction_sna_commission_payable` records to status Paid.

### Acceptance Criteria

- [ ] Commission Payable lines are detected in Bill Payment apply sublist.
- [ ] Related Commission Payable transactions are updated to status B (Paid).

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate commission amounts.
- Create or modify bill payment lines.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Commission Payable status updates automatically on payment.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- billpayment
- customtransaction_sna_commission_payable

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Update related commission payables
- [ ] Client Script - N/A

**Custom Fields:**
- customtransaction_sna_commission_payable | transtatus | Commission payable status

**Saved Searches:**
- None.

### Integration Points
- Bill Payment apply sublist.

### Data Requirements

**Data Volume:**
- One update per commission payable line.

**Data Sources:**
- Bill Payment apply sublist

**Data Retention:**
- Updates existing commission payable transactions.

### Technical Constraints
- Commission Payable lines are detected by the apply sublist line type text.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Commission Payable custom transaction

### Governance Considerations

- **Script governance:** Minimal; uses submitFields per matching line.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Commission payable transactions show Paid status after bill payment.

**How we'll measure:**
- Spot-check commission payable transactions linked to paid bills.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_bp_update_related_comm_payable.js | User Event | Mark commission payables as paid | Implemented |

### Development Approach

**Phase 1:** Detection
- [ ] Validate apply sublist scanning

**Phase 2:** Update
- [ ] Confirm status updates to Paid

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Bill Payment applied to Commission Payable updates status to Paid.

**Edge Cases:**
1. Bill Payment with no Commission Payable lines does nothing.

**Error Handling:**
1. submitFields errors are logged and do not block payment save.

### Test Data Requirements
- Bill Payment with Commission Payable apply lines

### Sandbox Setup
- Deploy User Event on Bill Payment

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Accounting roles

**Permissions required:**
- Edit permission on Commission Payable transactions

### Data Security
- Commission data restricted to accounting roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm Commission Payable transaction type exists

### Deployment Steps

1. Deploy User Event on Bill Payment.
2. Validate updates on a test payment.

### Post-Deployment

- [ ] Monitor for failed updates in logs

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update Commission Payable status manually if needed.

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

- [ ] Should additional statuses besides Paid be mapped in the future?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Apply line type text changes | Low | Med | Confirm type values in deployment environment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
