# PRD: Dummy Item Warning on Save (Client Script)

**PRD ID:** PRD-UNKNOWN-DummyItemWarningCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_dummy_item_warning_cs.js (Client Script)
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that blocks record save/bill actions when specific “dummy” item IDs are present on the item sublist, displaying a SweetAlert warning.

**What problem does it solve?**
Prevents invoicing of bogus items by warning users and stopping the transaction before it is saved.

**Primary Goal:**
Detect dummy items on the item sublist and prevent save with a warning dialog.

---

## 2. Goals

1. Preload SweetAlert2 for consistent warnings.
2. Detect target item IDs on save.
3. Block save when dummy items are present.

---

## 3. User Stories

1. **As a** billing user, **I want** a warning when dummy items exist **so that** I can remove them before invoicing.
2. **As an** admin, **I want** to block invoicing of bogus items **so that** data quality is preserved.
3. **As a** support user, **I want** a clear modal warning **so that** I know why save was blocked.

---

## 4. Functional Requirements

### Core Functionality

1. The system must preload SweetAlert using `sweetAlert.preload()` on `pageInit`.
2. On `saveRecord`, the system must inspect the `item` sublist for item IDs:
   - `88727`
   - `86344`
   - `94479`
3. When a target item is found, the system must call `sweetAlert.doNotInvoiceDummyItemSwalMessage()`.
4. When a target item is found, the system must return `false` to block save.
5. If an error occurs in `saveRecord`, the system must allow save to proceed.

### Acceptance Criteria

- [ ] SweetAlert is preloaded on page init.
- [ ] Saving a record with dummy items is blocked.
- [ ] The warning modal is shown when blocked.
- [ ] Errors do not block saves.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate item quantities or pricing.
- Remove dummy items automatically.
- Block other record actions beyond save/bill.

---

## 6. Design Considerations

### User Interface
- SweetAlert warning modal on save.

### User Experience
- Clear warning without crashing the save process.

### Design References
- SweetAlert2 warning modal.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transactions with item sublist (billing/sales transactions).

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Save validation

**Custom Fields:**
- None (item sublist uses standard `item` field).

**Saved Searches:**
- None.

### Integration Points
- Uses `hul_swal` library for modal display.

### Data Requirements

**Data Volume:**
- Single record at a time.

**Data Sources:**
- Current record item sublist.

**Data Retention:**
- None.

### Technical Constraints
- Item IDs are hard-coded; must be updated if dummy item IDs change.

### Dependencies
- **Libraries needed:** `SuiteScripts/HUL_DEV/Global/hul_swal`.
- **External dependencies:** None.
- **Other features:** SweetAlert media resources loaded by `hul_swal`.

### Governance Considerations
- Client-side only; minimal governance impact.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users cannot save transactions containing dummy items.

**How we'll measure:**
- User reports and reduced invoice errors.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_dummy_item_warning_cs.js | Client Script | Block save for dummy items | Implemented |

### Development Approach

**Phase 1:** Initialization
- [x] Preload SweetAlert on page init

**Phase 2:** Save validation
- [x] Scan item sublist for target IDs
- [x] Show warning and block save

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Attempt to save a transaction with dummy item `88727` and verify warning + blocked save.
2. Attempt to save a transaction without dummy items and verify save succeeds.

**Edge Cases:**
1. Item sublist is empty (save succeeds).
2. Unexpected error in sublist scan allows save.

**Error Handling:**
1. Exceptions in `saveRecord` return true to avoid blocking valid saves.

### Test Data Requirements
- Transaction with item sublist and dummy item IDs.

### Sandbox Setup
- Ensure dummy item IDs exist in sandbox.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users who create or edit transactions with item sublist.

**Permissions required:**
- Standard transaction edit permissions.

### Data Security
- UI control only; not a security control.

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

1. Upload `hul_dummy_item_warning_cs.js`.
2. Deploy as client script on relevant transaction forms.
3. Confirm `hul_swal` library is accessible.

### Post-Deployment

- [ ] Validate blocking behavior in production.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove/disable the client script deployment.

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

- [ ] Should dummy item IDs be stored in a custom record or script parameter?
- [ ] Should the warning text be customizable by role?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Dummy item IDs change | Med | Med | Move IDs to configuration |
| Users bypass by role permissions | Low | Med | Combine with server-side validation |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.md

### NetSuite Documentation
- SuiteScript 2.x Client Script
- currentRecord API

### External Resources
- SweetAlert2 documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
