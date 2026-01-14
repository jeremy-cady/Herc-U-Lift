# PRD: Link Transaction to Support Case (User Event)

**PRD ID:** PRD-UNKNOWN-NXCUETransaction
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/NXC UE Transaction.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event script that links a newly created Sales Order or Estimate to a Support Case.

**What problem does it solve?**
Ensures transactions created from a case are linked back to the case for traceability.

**Primary Goal:**
Update the support case with the newly created transaction ID.

---

## 2. Goals

1. Detect new transaction creation.
2. Read the case ID from `custbody_nx_case` on the transaction.
3. Update the support case with the transaction ID.

---

## 3. User Stories

1. **As a** support user, **I want** related transactions linked to the case **so that** I can see activity from the case.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `create` afterSubmit events.
2. The system must read `custbody_nx_case` from the transaction.
3. If a case ID exists, the system must set `custevent_nx_case_transaction` on the support case to the transaction ID.

### Acceptance Criteria

- [ ] Support case is updated with the transaction ID on create.
- [ ] No update occurs if `custbody_nx_case` is empty.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate the transaction type beyond the workflow that invokes it.
- Update transactions on edit or delete.

---

## 6. Design Considerations

### User Interface
- No UI changes; runs after submit.

### User Experience
- Case records show the linked transaction automatically.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Estimate/Quote
- Support Case

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Transaction to case link
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_nx_case`
- Support Case | `custevent_nx_case_transaction`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One support case update per transaction create.

**Data Sources:**
- Transaction fields.

**Data Retention:**
- Updates support case field only.

### Technical Constraints
- SuiteScript 1.0 style afterSubmit.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Workflow that creates the transaction.

### Governance Considerations
- Single submitFields call per create.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Support cases show linked transaction IDs after create.

**How we'll measure:**
- Verify `custevent_nx_case_transaction` on test cases.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| NXC UE Transaction.js | User Event | Link transaction to case | Implemented |

### Development Approach

**Phase 1:** Case link update
- [x] Update support case with transaction ID.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create transaction with `custbody_nx_case` set; case is updated.

**Edge Cases:**
1. `custbody_nx_case` empty; no update occurs.

**Error Handling:**
1. SubmitFields failure is logged by NetSuite.

### Test Data Requirements
- Support case and transaction created via workflow.

### Sandbox Setup
- Ensure workflow sets `custbody_nx_case` on transaction.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users creating transactions from cases.

**Permissions required:**
- Edit support cases

### Data Security
- No additional data exposure.

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

1. Upload `NXC UE Transaction.js`.
2. Deploy User Event on transactions created from cases.

### Post-Deployment

- [ ] Verify case link updates.
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

- [ ] Should the script validate transaction type explicitly?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Workflow does not set `custbody_nx_case` | Med | Med | Ensure workflow passes case ID |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
