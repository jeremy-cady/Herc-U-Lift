# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_swal
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: TBD
  file: TypeScript/HUL_DEV/Global/hul_swal.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
Public SweetAlert2 helper library for NetSuite Client Scripts, with lazy loading, generic alert/confirm/toast APIs, and common business-specific message wrappers.

---

## 2. Business Goal
Provide a reusable SweetAlert2 helper for consistent dialogs and toasts across scripts.

---

## 3. User Story
As a developer, when I need to show alerts or confirmations, I want a shared SweetAlert2 helper, so that dialogs are consistent and easy to use.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- Load SweetAlert2 from the NetSuite File Cabinet only once using a single script tag (hul-swal2-js) and data-hul-loaded marker.
- Support source URL override via setSrc(url).
- Provide loading helpers: ready()/ensureSwal(), preload(), and isReady().
- Provide dialog APIs: show(options), alert(input), confirm(options), toast(message, opts).
- Use SWAL_MEDIA_URL with fallback URLs including cache-busted and File Cabinet paths.
- If zIndex is provided, inject a CSS rule to set .swal2-container z-index.
- show() falls back to native alert() if SweetAlert2 fails to load.
- Provide business-specific wrappers:
  - doNotInvoiceDummyItemSwalMessage()
  - partsIsEligibleSwalMessage(altPartName?)
  - customerCreditCardRequiredMessage()

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
- SweetAlert2 v11 does not support zIndex directly; CSS injection is used.

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
