# PRD: SweetAlert2 Helper (Minimal Loader)

**PRD ID:** PRD-UNKNOWN-HULSwalHelper
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal_helper.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not applicable (library module)
- Deployment ID: Not applicable

---

## 1. Introduction / Overview

**What is this feature?**
A lightweight helper module that ensures SweetAlert2 is loaded on the page and provides a basic `show()` API for modal dialogs.

**What problem does it solve?**
Some client scripts need a minimal, dependable way to load SweetAlert2 without the full helper library.

**Primary Goal:**
Expose a simple `ready()` and `show()` API for SweetAlert2 in NetSuite client scripts.

---

## 2. Goals

1. Load SweetAlert2 from a single media URL when needed.
2. Avoid duplicate script injection.
3. Provide a minimal `show()` wrapper.

---

## 3. User Stories

1. **As a** developer, **I want to** call a small SweetAlert2 loader **so that** I can use modals without extra wrapper logic.
2. **As a** user, **I want** dialogs to appear reliably **so that** I can respond to prompts.
3. **As a** developer, **I want** the loader to be idempotent **so that** multiple scripts don’t duplicate injections.

---

## 4. Functional Requirements

### Core Functionality

1. The system must expose `ready()` to load SweetAlert2 when `window.Swal` is missing.
2. The system must inject the SweetAlert2 script only once.
3. The system must wait up to 10 seconds for `window.Swal` to be available.
4. The system must expose `show(options)` that calls `window.Swal.fire(options)` when ready.
5. The system must set `window.hulSwalLoading` and `window.hulSwalReady` flags to prevent duplicate loads.
6. Script load errors must resolve without throwing to avoid blocking callers.

### Acceptance Criteria

- [ ] SweetAlert2 is injected only once.
- [ ] `ready()` resolves after SweetAlert2 becomes available.
- [ ] `show()` calls `Swal.fire` when available.
- [ ] Multiple callers do not trigger duplicate loads.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Provide confirm/alert/toast helpers.
- Manage z-index styling.
- Offer fallback native alerts.

---

## 6. Design Considerations

### User Interface
- SweetAlert2 modals rendered by the library.

### User Experience
- Minimal overhead; dialogs appear once the library loads.

### Design References
- SweetAlert2 v11 usage.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- None.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Consumes this library

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- Client scripts that need modal dialogs.

### Data Requirements

**Data Volume:**
- N/A (client-side helper only).

**Data Sources:**
- SweetAlert2 JS served from NetSuite media URL.

**Data Retention:**
- None.

### Technical Constraints
- Requires browser DOM and `window` context.
- Depends on SweetAlert2 being reachable at the configured URL.

### Dependencies
- **Libraries needed:** SweetAlert2 v11+ (external JS).
- **External dependencies:** NetSuite media URL for SweetAlert2.
- **Other features:** Client scripts calling `ready()` or `show()`.

### Governance Considerations
- None (client-side).

---

## 8. Success Metrics

**We will consider this feature successful when:**

- SweetAlert2 is loaded and available for modal usage.

**How we'll measure:**
- UI verification in client scripts.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_swal_helper.js | Library | Minimal SweetAlert2 loader and `show()` | Implemented |

### Development Approach

**Phase 1:** Loader
- [x] Script injection and wait loop
- [x] Global flags to avoid duplicate loads

**Phase 2:** Modal wrapper
- [x] `show()` calls `Swal.fire` after load

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. `ready()` loads SweetAlert2 and sets `hulSwalReady`.
2. `show()` displays a modal.

**Edge Cases:**
1. SweetAlert2 fails to load; `ready()` resolves without throwing.
2. Multiple scripts call `ready()` concurrently.

**Error Handling:**
1. Script load error resolves and does not block callers.

### Test Data Requirements
- N/A.

### Sandbox Setup
- Ensure the SweetAlert2 media URL is valid.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users running client scripts that use the helper.

**Permissions required:**
- Access to the SweetAlert2 file in the File Cabinet.

### Data Security
- No sensitive data stored.

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

1. Upload `hul_swal_helper.js` and `sweetalert2.all.js`.
2. Validate the media URL in the helper module.
3. Include the module in client scripts as needed.

### Post-Deployment

- [ ] Validate dialogs in client scripts.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove or revert references to `hul_swal_helper.js` in client scripts.

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

- [ ] Should this module be deprecated in favor of `hul_swal.js`?
- [ ] Should the media URL be environment-specific?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Media URL changes | Med | Med | Update constant before deploy |
| Multiple loaders used | Low | Low | Standardize on one helper |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.md

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- SweetAlert2 v11 documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
