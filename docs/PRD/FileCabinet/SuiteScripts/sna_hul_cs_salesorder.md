# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SalesOrderCommissionOverride
title: Sales Order Commission Override Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_salesorder.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A client script that enables manual commission amount entry on Sales Order lines when override is selected.

---

## 2. Business Goal
Ensure commission amount edits are controlled and required when overrides are used.

---

## 3. User Story
As a sales user, when I override commission amounts, I want the commission field enabled and required, so that special cases are supported.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custcol_sna_override_commission | override toggled | Enable/disable commission amount field |
| validateLine | custcol_sna_sales_rep, custcol_sna_commission_amount | override true | Require sales rep and commission amount |

---

## 5. Functional Requirements
- When `custcol_sna_override_commission` changes on an item line, enable or disable `custcol_sna_commission_amount`.
- On line validation, if override is true and sales rep or commission amount is empty, alert and block line commit.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- Line | custcol_sna_override_commission
- Line | custcol_sna_commission_amount
- Line | custcol_sna_sales_rep

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Override enabled without sales rep or commission amount; line blocked.

---

## 8. Implementation Notes (Optional)
- Client-side line validation.

---

## 9. Acceptance Criteria
- Given override enabled, when commission amount is edited, then the field is editable.
- Given override enabled without required fields, when committing the line, then line commit is blocked with an alert.

---

## 10. Testing Notes
- Enable override and enter sales rep and commission amount; line commits.
- Override enabled without sales rep or commission amount; line blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_salesorder.js`.
- Deploy to Sales Order form.
- Rollback: remove client script deployment from Sales Order form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should commission amount be cleared when override is unchecked?
- Risk: Users bypass override by leaving fields blank.

---
