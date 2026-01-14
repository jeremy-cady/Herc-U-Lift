# PRD: SweetAlert2 Helper Library (Client-Side)

**PRD ID:** PRD-UNKNOWN-HULSwal
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not applicable (library module)
- Deployment ID: Not applicable

---

## 1. Introduction / Overview

**What is this feature?**
A client-side helper module that lazily loads SweetAlert2 from NetSuite File Cabinet and exposes a small API for alerts, confirms, toasts, and business-specific warning dialogs.

**What problem does it solve?**
NetSuite client scripts need consistent, reusable modal dialogs without bundling SweetAlert2 in every script or fighting z-index conflicts.

**Primary Goal:**
Provide a single-file, reusable SweetAlert2 loader and wrapper for client scripts.

---

## 2. Goals

1. Load SweetAlert2 only once and reuse it across scripts.
2. Provide generic dialog APIs and convenience wrappers.
3. Handle z-index layering to ensure modals appear above NetSuite UI.

---

## 3. User Stories

1. **As a** developer, **I want to** call a shared modal helper **so that** scripts remain lightweight and consistent.
2. **As a** user, **I want** consistent dialog styling **so that** warnings and confirmations are clear.
3. **As an** integrator, **I want** a reliable loader **so that** SweetAlert2 is available before use.

---

## 4. Functional Requirements

### Core Functionality

1. The system must expose the following APIs:
   - `setSrc(url)`
   - `ready()` / `ensureSwal()`
   - `preload()`
   - `isReady()`
   - `show(options)`
   - `alert(input)`
   - `confirm(options)`
   - `toast(message, opts)`
2. The system must lazily load SweetAlert2 and only insert one script tag (`hul-swal2-js`).
3. The loader must attempt multiple candidate URLs (media URL, cache-busted URL, File Cabinet path, origin-prefixed path).
4. The system must inject a topmost z-index style (`hul-swal2-topmost`) and support a custom z-index.
5. `show()` must default to safe options (`heightAuto: false`, `allowOutsideClick: false`, `allowEscapeKey: true`).
6. If SweetAlert2 fails to load, `show()` must fallback to a native `alert()` when a title or text is present.
7. Business wrappers must display predefined warnings:
   - `doNotInvoiceDummyItemSwalMessage()`
   - `partsIsEligibleSwalMessage(altPartName?)`
   - `customerCreditCardRequiredMessage()`

### Acceptance Criteria

- [ ] SweetAlert2 loads once and is reused.
- [ ] `ready()` resolves when `window.Swal` is available.
- [ ] `show()` works with standard options and optional z-index.
- [ ] `alert()`, `confirm()`, and `toast()` wrap `show()` correctly.
- [ ] Business wrappers display the correct messages.
- [ ] Fallback native alert fires if the loader fails.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Bundle SweetAlert2 into the module itself.
- Replace all NetSuite native dialogs.
- Provide UI configuration beyond SweetAlert2 options.

---

## 6. Design Considerations

### User Interface
- SweetAlert2 modals with NetSuite-safe z-index enforcement.

### User Experience
- Consistent modal styling and clearer warnings.

### Design References
- SweetAlert2 v11 usage guidance.

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
- Used by client scripts that need modal dialogs.

### Data Requirements

**Data Volume:**
- N/A (client-side helper only).

**Data Sources:**
- SweetAlert2 JS served from File Cabinet media URL or path.

**Data Retention:**
- None.

### Technical Constraints
- Must run in browser context with `window` and `document`.
- SweetAlert2 must be reachable via NetSuite media URL or File Cabinet path.

### Dependencies
- **Libraries needed:** SweetAlert2 v11+ (external JS).
- **External dependencies:** NetSuite File Cabinet media URL.
- **Other features:** Client scripts that call the helper.

### Governance Considerations
- None (client-side).

---

## 8. Success Metrics

**We will consider this feature successful when:**

- SweetAlert2 dialogs render reliably in client scripts.
- Users see consistent warnings and confirmations.

**How we'll measure:**
- Client script logs and UI verification.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_swal.js | Library | SweetAlert2 loader and helpers | Implemented |

### Development Approach

**Phase 1:** Loader
- [x] Script injection with idempotence
- [x] Candidate URL fallback strategy

**Phase 2:** API wrappers
- [x] Generic `show`, `alert`, `confirm`, `toast`
- [x] Business-specific helper dialogs

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. `preload()` loads SweetAlert2 and allows `show()` to fire.
2. `confirm()` returns `true` on confirm and `false` otherwise.
3. `toast()` displays a non-blocking message.

**Edge Cases:**
1. Loader fails to fetch the script and falls back to native `alert()`.
2. `setSrc()` points to a new media URL and loads correctly.
3. `show()` called before `ready()` still works.

**Error Handling:**
1. Script load error logs a console message.
2. Failed `show()` still alerts when title/text exists.

### Test Data Requirements
- N/A (UI behavior only).

### Sandbox Setup
- Ensure SweetAlert2 file exists at the configured media URL or File Cabinet path.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users running client scripts that use the helper.

**Permissions required:**
- Access to the SweetAlert2 file in the File Cabinet.

### Data Security
- No sensitive data stored; dialogs show content from client scripts.

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

1. Upload `hul_swal.js` and `sweetalert2.all.js` to File Cabinet.
2. Update the media URL if needed for the target account.
3. Include the module in client scripts that need dialogs.

### Post-Deployment

- [ ] Validate dialogs in target client scripts.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove or revert the library reference from client scripts.
2. Restore prior dialog behavior.

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

- [ ] Should the media URL be environment-specific (SB vs PROD)?
- [ ] Should there be a versioned path for SweetAlert2?
- [ ] Are any other business wrappers needed?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Media URL changes | Med | Med | Use `setSrc()` or update constant |
| Script blocked by CSP or permissions | Low | High | Validate File Cabinet access |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- SweetAlert2 v11 documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
