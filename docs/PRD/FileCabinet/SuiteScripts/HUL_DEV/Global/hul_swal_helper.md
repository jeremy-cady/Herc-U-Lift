# PRD: SweetAlert2 Helper (Minimal Loader)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-HULSwalHelper
title: SweetAlert2 Helper (Minimal Loader)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal_helper.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - None

---

## 1. Overview
A lightweight helper module that ensures SweetAlert2 is loaded on the page and provides a basic show() API for modal dialogs.

---

## 2. Business Goal
Some client scripts need a minimal, dependable way to load SweetAlert2 without the full helper library.

---

## 3. User Story
- As a developer, I want to call a small SweetAlert2 loader so that I can use modals without extra wrapper logic.
- As a user, I want dialogs to appear reliably so that I can respond to prompts.
- As a developer, I want the loader to be idempotent so that multiple scripts don’t duplicate injections.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Client usage | ready, show | SweetAlert2 needed | Load SweetAlert2 and show modal |

---

## 5. Functional Requirements
- The system must expose ready() to load SweetAlert2 when window.Swal is missing.
- The system must inject the SweetAlert2 script only once.
- The system must wait up to 10 seconds for window.Swal to be available.
- The system must expose show(options) that calls window.Swal.fire(options) when ready.
- The system must set window.hulSwalLoading and window.hulSwalReady flags to prevent duplicate loads.
- Script load errors must resolve without throwing to avoid blocking callers.

---

## 6. Data Contract
### Record Types Involved
- None

### Fields Referenced
- ready
- show
- window.hulSwalLoading
- window.hulSwalReady

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SweetAlert2 fails to load: ready() resolves without throwing.
- Multiple scripts call ready(): no duplicate injection.

---

## 8. Implementation Notes (Optional)
- Wait loop up to 10 seconds for window.Swal.

---

## 9. Acceptance Criteria
- Given multiple callers, when ready() is called, then SweetAlert2 is injected only once.
- Given SweetAlert2 becomes available, when ready() resolves, then show() calls Swal.fire.
- Given load errors, when they occur, then ready() resolves without throwing.

---

## 10. Testing Notes
- Call ready() and verify SweetAlert2 loads and hulSwalReady is set.
- Call show() and verify modal appears.
- Simulate missing file and verify ready() resolves without throwing.

---

## 11. Deployment Notes
- Upload hul_swal_helper.js and sweetalert2.all.js.
- Validate the media URL in the helper module.
- Include the module in client scripts as needed.
- Rollback: remove references to hul_swal_helper.js.

---

## 12. Open Questions / TBDs
- Should this module be deprecated in favor of hul_swal.js?
- Should the media URL be environment-specific?
- Media URL changes.
- Multiple loaders used.

---
