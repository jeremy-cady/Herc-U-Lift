# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RATemporaryItem
title: Return Authorization Temporary Item Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_ra_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Return Authorization

---

## 1. Overview
A client script that validates temporary item handling and inventory detail on Return Authorizations.

---

## 2. Business Goal
Prevent unauthorized convert-to-item handling and enforce temporary item code matching on inventory details.

---

## 3. User Story
As a returns user, when I process temp item returns, I want temp item validation enforced, so that returns are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | script parameters | form loads | Load temp item category and role parameters |
| validateField | custcol_sna_hul_returns_handling | temp category and role not allowed | Block Convert to Item |
| validateLine | custcol_sna_hul_returns_handling | temp category | Require returns handling value |
| saveRecord | receiptinventorynumber, custcol_sna_hul_temp_item_code | temp item lines | Verify inventory number matches temp item code |

---

## 5. Functional Requirements
- On page init, load temp item category and role parameters.
- On field validation of `custcol_sna_hul_returns_handling`, block Convert to Item for unauthorized roles.
- On line validation, require a temp returns handling value for temp item categories.
- On save, verify each temp item line has handling and matching inventory detail `receiptinventorynumber` to `custcol_sna_hul_temp_item_code`.

---

## 6. Data Contract
### Record Types Involved
- Return Authorization

### Fields Referenced
- Line | custcol_sna_hul_returns_handling
- Line | custcol_sna_hul_itemcategory
- Line | custcol_sna_hul_temp_item_code
- Inventory Detail | receiptinventorynumber

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Handling missing for temp item line; save blocked.
- Inventory number mismatch; save blocked.
- Missing script parameters should not crash the form.

---

## 8. Implementation Notes (Optional)
- Relies on script parameters for category and role IDs.

---

## 9. Acceptance Criteria
- Given an unauthorized role, when Convert to Item is selected for temp categories, then it is blocked.
- Given temp items with mismatched inventory numbers, when saving, then save is blocked.

---

## 10. Testing Notes
- Temp item line with handling and matching inventory number; save succeeds.
- Handling missing; save blocked.
- Inventory number mismatch; save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_ra_temporaryitem.js`.
- Deploy to Return Authorization forms.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should convert-to-item handling be blocked for additional roles?
- Risk: Incorrect temp category IDs in parameters.

---
