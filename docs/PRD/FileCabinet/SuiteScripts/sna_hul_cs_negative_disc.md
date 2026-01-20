# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-NegativeDiscount
title: Negative Discount Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_negative_disc.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction record with item sublist (exact type not specified)

---

## 1. Overview
A client script that prevents negative discount values on item lines for a specific record.

---

## 2. Business Goal
Protect against negative discount entry for a targeted transaction record.

---

## 3. User Story
As a user, when I enter discounts, I want negative discounts blocked, so that pricing stays valid.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| validateLine | custcol_sna_hul_perc_disc, custcol_sna_hul_dollar_disc | record ID = 2841204 and negative value | Clear fields and alert user |

---

## 5. Functional Requirements
- On line validation, if the current record ID equals 2841204, check `custcol_sna_hul_perc_disc` and `custcol_sna_hul_dollar_disc`.
- If either value is negative, clear both fields and alert the user.
- Allow the line to commit after clearing values.

---

## 6. Data Contract
### Record Types Involved
- Transaction record with item sublist (exact type not specified)

### Fields Referenced
- Line | custcol_sna_hul_perc_disc
- Line | custcol_sna_hul_dollar_disc

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Positive discounts; no changes.
- Different record ID; no validation executed.

---

## 8. Implementation Notes (Optional)
- Record ID is hard-coded to 2841204.

---

## 9. Acceptance Criteria
- Given record ID 2841204 and negative discount values, when validating the line, then values are cleared and an alert is shown.

---

## 10. Testing Notes
- Enter negative discount on record 2841204; verify fields cleared and alert shown.
- Enter positive discounts; no changes.
- Open different record ID; no validation executed.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_negative_disc.js`.
- Deploy to the relevant transaction form.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the record ID be parameterized instead of hard-coded?
- Risk: Record ID changes or differs in other environments.

---
