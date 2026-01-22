# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_swal_helper
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: TBD
  file: TypeScript/HUL_DEV/Global/hul_swal_helper.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
Lightweight SweetAlert2 loader/helper that injects the library if needed and provides a show() wrapper.

---

## 2. Business Goal
Provide a minimal SweetAlert2 loader/helper for NetSuite pages.

---

## 3. User Story
As a developer, when I need a simple SweetAlert2 loader, I want a helper that ensures the library is available, so that I can show alerts reliably.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- Ensure SweetAlert2 (window.Swal) is available on NetSuite pages.
- Inject the SweetAlert2 script once using SWAL_MEDIA_URL.
- Prevent duplicate injections using window.hulSwalLoading.
- ready() loads SweetAlert2 and sets window.hulSwalReady.
- show(options) ensures library is loaded then calls window.Swal.fire.
- Wait up to 10 seconds for window.Swal to appear.
- Swallow errors to avoid blocking UI flows.
- show() is fire-and-forget and does not return the SweetAlert2 result.

---

## 6. Data Contract
### Record Types Involved
- TBD

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Errors are swallowed to avoid blocking UI flows.
- Waits up to 10 seconds for SweetAlert2 to load.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Script type
- Record types involved
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
