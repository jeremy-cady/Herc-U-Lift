# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PMPricingMatrix
title: PM Pricing Matrix Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_pm_pricing_matrix.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction with item sublist
  - Suitelet for PM pricing matrix

---

## 1. Overview
A client script that integrates the PM Pricing Matrix Suitelet with transaction item lines and handles Suitelet field changes.

---

## 2. Business Goal
Allow users to select items and rates from the PM pricing matrix and apply them back to the originating transaction line.

---

## 3. User Story
As a sales user, when I select PM pricing, I want to pick a price from a matrix, so that line pricing is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custcol_sna_select_item | checked on item sublist | Open PM Pricing Matrix Suitelet |
| fieldChanged | custcol_sna_pm_price_matrix_data | JSON present | Set item, price level, quantity, and rate |
| Suitelet pageInit | custpage_sna_* | required fields populated | Call submitLine to return data |
| fieldChanged (Suitelet) | custpage_sna_item, custpage_sna_geography, custpage_sna_equipment_type, custpage_sna_service_action, custpage_sna_object, custpage_sna_frequency, custpage_sna_quantity | value changed | Reload Suitelet with parameters |

---

## 5. Functional Requirements
- When `custcol_sna_select_item` is checked on the item sublist, open the PM Pricing Matrix Suitelet with customer, transaction date, and line parameters.
- When `custcol_sna_pm_price_matrix_data` is set on a line, parse JSON and set item, price level, quantity, and rate for that line.
- On Suitelet page init, if required fields are populated, call `submitLine` to return data to the opener.
- When Suitelet filter fields change (`custpage_sna_item`, `custpage_sna_geography`, `custpage_sna_equipment_type`, `custpage_sna_service_action`, `custpage_sna_object`, `custpage_sna_frequency`, `custpage_sna_quantity`), reload the Suitelet with updated parameters.
- `submitLine` must write JSON data to the opener line field `custcol_sna_pm_price_matrix_data` and close the window.

---

## 6. Data Contract
### Record Types Involved
- Transaction with item sublist
- Suitelet for PM pricing matrix

### Fields Referenced
- Line | custcol_sna_select_item
- Line | custcol_sna_pm_price_matrix_data
- Suitelet | custpage_sna_customer
- Suitelet | custpage_sna_trandate
- Suitelet | custpage_sna_geography
- Suitelet | custpage_sna_equipment_type
- Suitelet | custpage_sna_service_action
- Suitelet | custpage_sna_object
- Suitelet | custpage_sna_frequency
- Suitelet | custpage_sna_item
- Suitelet | custpage_sna_quantity
- Suitelet | custpage_sna_pm_rate
- Suitelet | custpage_sna_line

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Required Suitelet fields missing; alert shown.
- JSON payload missing or invalid.
- Missing opener window should not crash the Suitelet.

---

## 8. Implementation Notes (Optional)
- Suitelet `customscript_sna_hul_sl_pm_pricing_mtrix` with deployment `customdeploy_sna_hul_sl_pm_pricing_mtrix`.
- Uses `window.opener` to communicate with the parent transaction.

---

## 9. Acceptance Criteria
- Given a matrix selection, when submitted, then the transaction line item, quantity, and rate are updated.
- Given Suitelet filter changes, when updated, then the Suitelet reloads.

---

## 10. Testing Notes
- Select line item pricing from Suitelet; verify line item and rate updated.
- Required Suitelet fields missing; verify alert shown.
- JSON payload invalid; verify no crash.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_pm_pricing_matrix.js`.
- Deploy to the PM Pricing Matrix Suitelet and transaction form.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the tax code be set when applying matrix rates?
- Risk: Popup blocked by browser.

---
