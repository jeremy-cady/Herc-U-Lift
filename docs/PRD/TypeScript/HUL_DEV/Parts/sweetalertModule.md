# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: sweetalertModule
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: TBD
  file: TypeScript/HUL_DEV/Parts/sweetalertModule.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
Public SweetAlert2 wrapper that exposes business-specific message helpers (legacy version).

---

## 2. Business Goal
Provide SweetAlert2 wrappers for common Parts warnings.

---

## 3. User Story
As a developer, when I need common Parts warnings, I want shared SweetAlert2 helper functions, so that messaging is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- Provide SweetAlert2 wrappers for common Parts warnings.
- Expose functions:
  - partsIsEligibleSwalMessage(altPartName?)
  - doNotInvoiceDummyItemSwalMessage()
  - customerCreditCardRequiredMessage()
- Use setTimeout before calling Swal.fire (1s or 500ms).
- Display warnings with a fixed zIndex.
- Assume Swal is already loaded globally; no loader logic.
- Overlaps with SuiteScripts/HUL_DEV/Global/hul_swal helpers.

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
- Assumes Swal is globally available; no fallback if missing.

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
