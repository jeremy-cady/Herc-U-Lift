# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AddTempItem
title: Temporary Item Suitelet Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_addtempitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Estimate

---

## 1. Overview
A client script for the Temporary Item Suitelet that writes user-entered values back to the originating transaction line.

---

## 2. Business Goal
Allow users to add temporary items to Sales Orders or Estimates through a guided Suitelet form.

---

## 3. User Story
As a sales user, when I need to add a temporary item, I want to enter it in the Suitelet and have it added to the transaction, so that I can include nonstandard items.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet client submit | item, vendor, quantity, rate | required fields present | Set transaction line fields and commit line |

---

## 5. Functional Requirements
- Read Suitelet fields for item, vendor, quantity, rate, description, and ship method.
- Alert the user when required fields are missing.
- Set transaction line fields including item, vendor, vendor item code, quantity, and rate.
- Set `porate` for sales orders and `custcol_sna_hul_estimated_po_rate` for other records.
- Commit the line and reload the Suitelet with `addednew=true`.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Estimate

### Fields Referenced
- Line | custcol_sna_hul_item_vendor
- Line | custcol_sna_hul_vendor_item_code
- Line | custcol_sna_hul_estimated_po_rate
- Line | custcol_sna_hul_ship_meth_vendor

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing required fields; alert shown and no line added.
- Uses window.opener to access the parent record.

---

## 8. Implementation Notes (Optional)
- Uses Suitelet `customscript_sna_hul_sl_temporary_item`.

---

## 9. Acceptance Criteria
- Given required fields are provided, when the Suitelet submits, then a line is added to the parent transaction.
- Given required fields are missing, when the Suitelet submits, then an alert is shown and no line is added.

---

## 10. Testing Notes
- Submit Suitelet with valid fields; confirm line added.
- Submit Suitelet with missing fields; confirm alert and no line added.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_addtempitem.js`.
- Deploy on the temporary item Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the Suitelet validate vendor-item combinations server-side?
- Risk: Opener record not available.

---
