# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RATemporaryItem
title: RA Temporary Item Handling
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_ra_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - returnauthorization
  - salesorder

---

## 1. Overview
User Event that validates temporary item return authorizations, enforces return handling, and updates Sales Order returned quantities.

---

## 2. Business Goal
Ensure temporary item returns include required handling and update related Sales Orders with returned quantities.

---

## 3. User Story
As a returns user, when creating temp item RAs, I want handling enforced and SO quantities updated, so that returns are processed correctly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | return item flags | RA create | Remove non-return lines without temp codes |
| beforeSubmit | custcol_sna_hul_returns_handling | temp item category | Require returns handling and validate inventory detail |
| afterSubmit | status | status changes to H | Update SO `custcol_sna_qty_returned` by line |

---

## 5. Functional Requirements
- On beforeLoad create, remove non-return lines without temp codes.
- On beforeSubmit, require `custcol_sna_hul_returns_handling` for temp item categories.
- Validate inventory detail numbers match temp item codes.
- On afterSubmit when RA status changes to H, update Sales Order `custcol_sna_qty_returned` by line.

---

## 6. Data Contract
### Record Types Involved
- returnauthorization
- salesorder

### Fields Referenced
- returnauthorization line | custcol_sna_hul_temp_item_code | Temp item code
- returnauthorization line | custcol_sna_hul_itemcategory | Item category
- returnauthorization line | custcol_sna_hul_returns_handling | Returns handling
- returnauthorization line | custcol_sna_return_item | Return item flag
- salesorder line | custcol_sna_qty_returned | Returned quantity

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing handling blocks save for temp items.
- RA close flow bypasses validation if suitelet is not used.
- Search errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses close button suitelet: `customscript_sna_hul_sl_closebutton`.
- Handling required only for temp item categories.

---

## 9. Acceptance Criteria
- Given RA create, when beforeLoad runs, then non-return temp lines are removed.
- Given temp item lines without handling, when beforeSubmit runs, then save is blocked.
- Given RA status H, when afterSubmit runs, then SO returned quantities update.

---

## 10. Testing Notes
- Create RA with temp item and handling, then close and update SO returned qty.
- Missing handling blocks save for temp items.
- Deploy User Event on Return Authorization.

---

## 11. Deployment Notes
- Confirm temp item category parameters.
- Deploy User Event on Return Authorization and validate return handling and SO updates.
- Monitor logs for validation errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should handling be required for non-temp categories?

---
