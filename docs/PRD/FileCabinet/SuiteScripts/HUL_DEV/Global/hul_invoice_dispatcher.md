# PRD: Invoice Dispatcher Client Script
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InvoiceDispatcherCS
title: Invoice Dispatcher Client Script
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_invoice_dispatcher.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice

---

## 1. Overview
A client script dispatcher on Invoice forms that delegates save validation to the dummy item warning module.

---

## 2. Business Goal
Ensure invoices with dummy items trigger the existing warning/validation logic while keeping the dispatcher lightweight.

---

## 3. User Story
- As an AP user, I want to be warned about dummy items so that invoices are accurate.
- As an admin, I want to reuse the existing dummy-item module so that behavior is consistent.
- As a developer, I want to keep the dispatcher minimal so that it is easy to maintain.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| saveRecord | item sublist | Invoice save | Call dummyItemWarning.saveRecord and block save if false |

---

## 5. Functional Requirements
- The system must call dummyItemWarning.saveRecord on save.
- If the dummy item module returns false, the save must be blocked.
- The system must return true if no blocking condition is met.
- Errors in dispatcher do not block the save (fail-open).

---

## 6. Data Contract
### Record Types Involved
- Invoice

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Dependency module missing: dispatcher fails open.
- Exceptions are caught and logged to console.

---

## 8. Implementation Notes (Optional)
- Depends on SuiteScripts/HUL_DEV/Parts/hul_dummy_item_warning_cs.js.

---

## 9. Acceptance Criteria
- Given an invoice with dummy items, when saveRecord runs, then save is blocked according to the dummy item module.
- Given a normal invoice, when saveRecord runs, then save succeeds.
- Given dispatcher errors, when they occur, then the save is not blocked.

---

## 10. Testing Notes
- Save an invoice with no dummy items and confirm save succeeds.
- Save an invoice with dummy items and confirm save is blocked.
- Verify missing dependency module fails open.

---

## 11. Deployment Notes
- Deploy dispatcher client script on Invoice forms.
- Ensure dependency module is available.
- Rollback: remove dispatcher from the form.

---

## 12. Open Questions / TBDs
- Should we add more invoice validations here?
- Dependency script missing or renamed.

---
