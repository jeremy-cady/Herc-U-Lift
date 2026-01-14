# PRD: Dispatcher Client Script (Sales Order Helpers)

**PRD ID:** PRD-UNKNOWN-DispatcherCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dispatcher_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script dispatcher that wires together several Sales Order client behaviors (line validation, column hiding, negative discount checks) and logs form snapshots.

**What problem does it solve?**
Consolidates multiple client‑side behaviors into one script for a specific Sales Order form, while avoiding AMD/SweetAlert timeouts.

**Primary Goal:**
Coordinate client‑side validation and UI helpers for Sales Order entry.

---

## 2. Goals

1. Initialize dependent client modules on page load.
2. Validate line items using existing helpers.
3. Log form snapshot changes without blocking edits.

---

## 3. User Stories

1. **As a** dispatcher, **I want to** have line validations run automatically **so that** invalid items are blocked.
2. **As an** admin, **I want to** hide certain line columns **so that** the UI is cleaner.
3. **As a** developer, **I want to** avoid AMD timeouts **so that** the client script loads reliably.

---

## 4. Functional Requirements

### Core Functionality

1. The system must call `hideLineColumns.pageInit` on page init when available.
2. The system must call `snaNegativeDiscount.validateLine` during line validation.
3. The system must call `isItemEligible.validateLine` during line validation.
4. The system must log form snapshots on pageInit and postSourcing (entity/terms).
5. The system must avoid SweetAlert preload to prevent AMD timeouts.

### Acceptance Criteria

- [ ] Line validation runs via the helper modules.
- [ ] Line column hiding runs on page init.
- [ ] No AMD timeout errors caused by SweetAlert dependency.
- [ ] postSourcing logs fire when entity or terms change.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Enforce credit card gating (logic is commented out).
- Load customer records on edit.
- Provide UI alerts beyond existing modules.

---

## 6. Design Considerations

### User Interface
- No new UI elements; relies on existing helper scripts.

### User Experience
- Quiet validations and log-only snapshots.

### Design References
- Sales Order form `customform = 121`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (client context)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Dispatcher/aggregator

**Custom Fields:**
- Sales Order Line | `custcol_sna_linked_po` (referenced by other modules)

**Saved Searches:**
- None.

### Integration Points
- Helper client scripts:
  - `SuiteScripts/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.js`
  - `SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_cols_on_create_cs.js`
  - `SuiteScripts/sna_hul_cs_negative_disc.js`
  - `SuiteScripts/HUL_DEV/Parts/CS_HandleClick.js`

### Data Requirements

**Data Volume:**
- Per line validation only.

**Data Sources:**
- Current record values in the client.

**Data Retention:**
- N/A.

### Technical Constraints
- Some credit-card gating logic is commented out.
- Uses console logging to `window.HUL_CC_LOGS`.

### Dependencies
- **Libraries needed:** None beyond referenced client modules.
- **External dependencies:** None.
- **Other features:** Sales Order form 121.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales Order entry retains required validations and UI helpers.
- No AMD timeout errors occur from client dependencies.

**How we'll measure:**
- User feedback and browser console logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_dispatcher_cs.js | Client Script | Dispatch client helpers on SO | Implemented |

### Development Approach

**Phase 1:** Wiring
- [x] Page init hook for column hiding
- [x] Line validation hooks
- [x] postSourcing logging

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add line item → eligibility and negative discount validation run.

**Edge Cases:**
1. Missing helper module → script fails open and continues.

**Error Handling:**
1. Exceptions are swallowed to avoid blocking the form.

### Test Data Requirements
- Sales Order with line items and discount cases.

### Sandbox Setup
- Deploy client script on form 121.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users editing Sales Orders.

**Permissions required:**
- Standard Sales Order edit permissions.

### Data Security
- Logs only; no sensitive data persisted.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy client script to Sales Order form 121.
2. Validate helper modules are available.

### Post-Deployment

- [ ] Monitor for console errors.

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the form.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should credit-card gating be re-enabled?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing helper module breaks validation | Low | Medium | Add defensive checks |

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
