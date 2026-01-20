# PRD: Dispatcher Client Script (Sales Order Helpers)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DispatcherCS
title: Dispatcher Client Script (Sales Order Helpers)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dispatcher_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A client script dispatcher that wires together several Sales Order client behaviors (line validation, column hiding, negative discount checks) and logs form snapshots.

---

## 2. Business Goal
Consolidate multiple client-side behaviors into one script for a specific Sales Order form, while avoiding AMD/SweetAlert timeouts.

---

## 3. User Story
- As a dispatcher, I want to have line validations run automatically so that invalid items are blocked.
- As an admin, I want to hide certain line columns so that the UI is cleaner.
- As a developer, I want to avoid AMD timeouts so that the client script loads reliably.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custpage_results | Sales Order form 121 | Call hideLineColumns.pageInit and log form snapshot |
| validateLine | item sublist | Line validation | Call snaNegativeDiscount.validateLine and isItemEligible.validateLine |
| postSourcing | entity, terms | entity or terms change | Log form snapshot |

---

## 5. Functional Requirements
- The system must call hideLineColumns.pageInit on page init when available.
- The system must call snaNegativeDiscount.validateLine during line validation.
- The system must call isItemEligible.validateLine during line validation.
- The system must log form snapshots on pageInit and postSourcing (entity/terms).
- The system must avoid SweetAlert preload to prevent AMD timeouts.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- entity
- terms
- custcol_sna_linked_po

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing helper module: script fails open and continues.
- Exceptions are swallowed to avoid blocking the form.

---

## 8. Implementation Notes (Optional)
- Sales Order form customform = 121.
- Uses console logging to window.HUL_CC_LOGS.
- Some credit-card gating logic is commented out.

---

## 9. Acceptance Criteria
- Given line validation, when a line is added, then helper module validations run.
- Given page init, when the form loads, then line column hiding runs.
- Given SweetAlert dependency, when the script loads, then no AMD timeout errors occur.
- Given entity or terms changes, when postSourcing runs, then form snapshot logs fire.

---

## 10. Testing Notes
- Add line item and confirm eligibility and negative discount validations run.
- Verify column hiding runs on page init.
- Verify missing helper module fails open.
- Verify postSourcing logs for entity/terms changes.

---

## 11. Deployment Notes
- Deploy client script to Sales Order form 121.
- Validate helper modules are available.
- Rollback: remove the client script from the form.

---

## 12. Open Questions / TBDs
- Should credit-card gating be re-enabled?
- Missing helper module breaks validation.

---
