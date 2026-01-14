# PRD: Invoice Dispatcher Client Script

**PRD ID:** PRD-UNKNOWN-InvoiceDispatcherCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_invoice_dispatcher.js (Client Script)
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_dummy_item_warning_cs.js (Client Script dependency)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script dispatcher on Invoice forms that delegates save validation to the dummy item warning module.

**What problem does it solve?**
Ensures invoices with dummy items trigger the existing warning/validation logic while keeping the dispatcher lightweight.

**Primary Goal:**
Hook invoice save to the dummy item warning validation.

---

## 2. Goals

1. Initialize client script on page load.
2. Delegate saveRecord validation to `hul_dummy_item_warning_cs`.
3. Avoid blocking on non‑critical errors.

---

## 3. User Stories

1. **As an** AP user, **I want to** be warned about dummy items **so that** invoices are accurate.
2. **As an** admin, **I want to** reuse the existing dummy-item module **so that** behavior is consistent.
3. **As a** developer, **I want to** keep the dispatcher minimal **so that** it is easy to maintain.

---

## 4. Functional Requirements

### Core Functionality

1. The system must call `dummyItemWarning.saveRecord` on save.
2. If the dummy item module returns `false`, the save must be blocked.
3. The system must return `true` if no blocking condition is met.

### Acceptance Criteria

- [ ] Invoices with dummy items are blocked according to the dummy item module.
- [ ] Normal invoices save without interruption.
- [ ] Errors in dispatcher do not block the save (fail‑open).

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Implement dummy item detection itself.
- Add additional invoice validation rules.
- Modify invoice fields.

---

## 6. Design Considerations

### User Interface
- Console logging only; no UI elements.

### User Experience
- Users see the dummy item warning behavior from the dependent module.

### Design References
- `hul_dummy_item_warning_cs.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice (client context)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Dispatcher

**Custom Fields:**
- None in this dispatcher.

**Saved Searches:**
- None.

### Integration Points
- Depends on `SuiteScripts/HUL_DEV/Parts/hul_dummy_item_warning_cs.js`.

### Data Requirements

**Data Volume:**
- Per invoice save.

**Data Sources:**
- Current record state; dummy item module.

**Data Retention:**
- N/A.

### Technical Constraints
- Relies on the dummy item module being deployed and available.

### Dependencies
- **Libraries needed:** None beyond the dependency script.
- **External dependencies:** None.
- **Other features:** Dummy item warning module.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Dummy item warnings trigger consistently on invoice save.

**How we'll measure:**
- User feedback and saved invoice audit checks.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_invoice_dispatcher.js | Client Script | Delegate invoice save validation | Implemented |

### Development Approach

**Phase 1:** Dispatcher wiring
- [x] Page init logging
- [x] Save record delegation

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice with no dummy items → save succeeds.
2. Invoice with dummy items → save blocked per module.

**Edge Cases:**
1. Dependency module missing → dispatcher fails open.

**Error Handling:**
1. Exceptions are caught and logged to console.

### Test Data Requirements
- Invoice records with dummy items.

### Sandbox Setup
- Deploy dispatcher on Invoice form with dependency module.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users editing invoices.

**Permissions required:**
- Standard invoice permissions.

### Data Security
- No data stored; logging is client‑side only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy dispatcher client script on Invoice forms.
2. Ensure dependency module is available.

### Post-Deployment

- [ ] Monitor for console errors.

### Rollback Plan

**If deployment fails:**
1. Remove dispatcher from the form.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should we add more invoice validations here?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Dependency script missing or renamed | Medium | Medium | Add deployment checks |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
