# PRD: Dummy Item Warning on Save (Client Script)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DummyItemWarningCS
title: Dummy Item Warning on Save (Client Script)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_dummy_item_warning_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transactions with item sublist

---

## 1. Overview
A client script that blocks record save/bill actions when specific dummy item IDs are present on the item sublist, displaying a SweetAlert warning.

---

## 2. Business Goal
Prevent invoicing of bogus items by warning users and stopping the transaction before it is saved.

---

## 3. User Story
- As a billing user, I want a warning when dummy items exist so that I can remove them before invoicing.
- As an admin, I want to block invoicing of bogus items so that data quality is preserved.
- As a support user, I want a clear modal warning so that I know why save was blocked.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | sweetAlert.preload | Page load | Preload SweetAlert2 |
| saveRecord | item sublist | Item ID in 88727, 86344, 94479 | Show warning and block save |

---

## 5. Functional Requirements
- The system must preload SweetAlert using sweetAlert.preload() on pageInit.
- On saveRecord, the system must inspect the item sublist for item IDs 88727, 86344, 94479.
- When a target item is found, the system must call sweetAlert.doNotInvoiceDummyItemSwalMessage().
- When a target item is found, the system must return false to block save.
- If an error occurs in saveRecord, the system must allow save to proceed.

---

## 6. Data Contract
### Record Types Involved
- Transactions with item sublist

### Fields Referenced
- item

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Item sublist empty: save succeeds.
- Exceptions in saveRecord: return true to avoid blocking valid saves.

---

## 8. Implementation Notes (Optional)
- Item IDs are hard-coded and must be updated if dummy items change.

---

## 9. Acceptance Criteria
- Given a save with dummy items, when saveRecord runs, then the warning modal is shown and save is blocked.
- Given a save without dummy items, when saveRecord runs, then save succeeds.
- Given an error in saveRecord, when it occurs, then the save is allowed.

---

## 10. Testing Notes
- Save a transaction with item 88727 and confirm warning + blocked save.
- Save a transaction without dummy items and confirm save succeeds.
- Verify errors in saveRecord allow save.

---

## 11. Deployment Notes
- Upload hul_dummy_item_warning_cs.js.
- Deploy as client script on relevant transaction forms.
- Confirm hul_swal library is accessible.
- Rollback: remove/disable the client script deployment.

---

## 12. Open Questions / TBDs
- Should dummy item IDs be stored in a custom record or script parameter?
- Should the warning text be customizable by role?
- Dummy item IDs change.
- Users bypass by role permissions.

---
