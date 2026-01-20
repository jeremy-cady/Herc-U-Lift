# PRD: SweetAlert2 Helper Library (Client-Side)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-HULSwal
title: SweetAlert2 Helper Library (Client-Side)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - None

---

## 1. Overview
A client-side helper module that lazily loads SweetAlert2 from NetSuite File Cabinet and exposes a small API for alerts, confirms, toasts, and business-specific warning dialogs.

---

## 2. Business Goal
NetSuite client scripts need consistent, reusable modal dialogs without bundling SweetAlert2 in every script or fighting z-index conflicts.

---

## 3. User Story
- As a developer, I want to call a shared modal helper so that scripts remain lightweight and consistent.
- As a user, I want consistent dialog styling so that warnings and confirmations are clear.
- As an integrator, I want a reliable loader so that SweetAlert2 is available before use.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Client usage | setSrc, ready, ensureSwal, preload, show, alert, confirm, toast | SweetAlert2 needed | Load SweetAlert2 and show dialogs |

---

## 5. Functional Requirements
- The system must expose setSrc(url), ready()/ensureSwal(), preload(), isReady(), show(options), alert(input), confirm(options), toast(message, opts).
- The system must lazily load SweetAlert2 and only insert one script tag (hul-swal2-js).
- The loader must attempt multiple candidate URLs (media URL, cache-busted URL, File Cabinet path, origin-prefixed path).
- The system must inject a topmost z-index style (hul-swal2-topmost) and support a custom z-index.
- show() must default to safe options (heightAuto: false, allowOutsideClick: false, allowEscapeKey: true).
- If SweetAlert2 fails to load, show() must fallback to a native alert() when a title or text is present.
- Business wrappers must display predefined warnings: doNotInvoiceDummyItemSwalMessage(), partsIsEligibleSwalMessage(altPartName?), customerCreditCardRequiredMessage().

---

## 6. Data Contract
### Record Types Involved
- None

### Fields Referenced
- setSrc
- ready
- ensureSwal
- preload
- isReady
- show
- alert
- confirm
- toast
- doNotInvoiceDummyItemSwalMessage
- partsIsEligibleSwalMessage
- customerCreditCardRequiredMessage

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Loader fails: show() falls back to native alert when title/text exists.
- Script loads once and reuses window.Swal.

---

## 8. Implementation Notes (Optional)
- Injects hul-swal2-topmost style to enforce z-index.

---

## 9. Acceptance Criteria
- Given multiple client scripts, when SweetAlert2 loads, then it loads once and is reused.
- Given ready(), when window.Swal is available, then the promise resolves.
- Given show(), when called, then it uses default safe options and supports custom z-index.
- Given alert/confirm/toast, when called, then they wrap show() correctly.
- Given business wrappers, when called, then they display the correct messages.
- Given loader failure, when title/text exists, then a native alert is shown.

---

## 10. Testing Notes
- Call preload() and confirm SweetAlert2 loads and show() works.
- Call confirm() and verify true/false results.
- Call toast() and verify display.
- Simulate loader failure and confirm fallback alert.

---

## 11. Deployment Notes
- Upload hul_swal.js and sweetalert2.all.js to File Cabinet.
- Update media URL if needed for target account.
- Include the module in client scripts that need dialogs.
- Rollback: remove or revert library references.

---

## 12. Open Questions / TBDs
- Should the media URL be environment-specific (SB vs PROD)?
- Should there be a versioned path for SweetAlert2?
- Are any other business wrappers needed?
- Media URL changes.
- Script blocked by CSP or permissions.

---
