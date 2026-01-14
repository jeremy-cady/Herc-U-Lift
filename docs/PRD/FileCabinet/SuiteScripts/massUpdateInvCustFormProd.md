# PRD: Invoice Custom Form Mass Update (Production)

**PRD ID:** PRD-UNKNOWN-MassUpdateInvCustFormProd
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/massUpdateInvCustFormProd.js (Mass Update)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Mass Update script that assigns invoice custom forms based on invoice transaction number prefixes.

**What problem does it solve?**
Ensures invoices use the correct custom form for rental, equipment, or lease invoices in production.

**Primary Goal:**
Set the invoice `customform` field based on the invoice document number prefix.

---

## 2. Goals

1. Read each invoice transaction number.
2. Determine invoice type by prefix (R, S, FIN).
3. Update the invoice custom form accordingly.

---

## 3. User Stories

1. **As an** admin, **I want** invoice custom forms set by prefix **so that** formatting matches invoice type.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run as a Mass Update on invoice records.
2. The system must read `tranid` for each invoice.
3. If `tranid` starts with `R`, the system must set `customform` to `138`.
4. If `tranid` starts with `S`, the system must set `customform` to `144`.
5. If `tranid` starts with `FIN`, the system must set `customform` to `139`.

### Acceptance Criteria

- [ ] Rental invoices use form `138`.
- [ ] Equipment invoices use form `144`.
- [ ] Lease invoices use form `139`.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update invoices without a `tranid`.
- Handle other prefixes not specified.
- Update invoices outside the Mass Update run.

---

## 6. Design Considerations

### User Interface
- No UI changes; Mass Update only.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used
- [x] Mass Update - Invoice custom form updates

**Custom Fields:**
- Invoice | `customform`

**Saved Searches:**
- Mass update is driven by a saved search or selection.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- All invoices in the mass update selection.

**Data Sources:**
- Invoice `tranid`.

**Data Retention:**
- Updates `customform` field only.

### Technical Constraints
- Uses hardcoded form IDs for production.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Mass update saved search for invoices.

### Governance Considerations
- One lookup and submitFields per invoice.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoices are assigned the correct form based on prefix.

**How we'll measure:**
- Spot check invoices after the mass update run.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| massUpdateInvCustFormProd.js | Mass Update | Set invoice custom form by prefix | Implemented |

### Development Approach

**Phase 1:** Determine prefix
- [x] Read `tranid` and check prefixes.

**Phase 2:** Update form
- [x] Submit `customform` updates.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run mass update with invoices starting with R, S, and FIN; forms updated.

**Edge Cases:**
1. Invoice without `tranid`; no update.
2. Unrecognized prefix; no update.

**Error Handling:**
1. SubmitFields errors logged.

### Test Data Requirements
- Invoices with R, S, and FIN prefixes.

### Sandbox Setup
- Confirm form IDs match environment.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running mass updates.

**Permissions required:**
- Edit invoices

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

1. Upload `massUpdateInvCustFormProd.js`.
2. Create or select saved search for target invoices.
3. Run Mass Update and confirm results.

### Post-Deployment

- [ ] Verify updated invoice forms.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Re-run mass update with previous form values if needed.

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

- [ ] Should prefix mapping be configurable via script parameters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded form IDs differ by environment | Med | Med | Move IDs to parameters per environment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Mass Update

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
