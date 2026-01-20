# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SORental
title: Sales Order Rental Line Configurator Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_so_rental.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Custom Record (customrecord_sna_hul_rate_card_sublist)

---

## 1. Overview
A client script that supports rental line configuration on Sales Orders by opening configurator Suitelets and applying rate card pricing.

---

## 2. Business Goal
Streamline rental object configuration and ensure rental rate card pricing is applied to line fields.

---

## 3. User Story
As a sales user, when I configure rental lines, I want to open configurators and apply rate card pricing, so that rental pricing is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custcol_sna_configure_object | checked | Open configurator Suitelet |
| fieldChanged | custcol_sna_rental_rate_card | rate card selected | Populate day/week/four-week rates |
| client action | showPrompt | user invokes | Open Select Objects Suitelet |

---

## 5. Functional Requirements
- When `custcol_sna_configure_object` is checked, open the configurator Suitelet with customer, pricing group, date, and location parameters.
- Reset `custcol_sna_configure_object` to false after opening the Suitelet.
- When `custcol_sna_rental_rate_card` changes, search rate card sublist records and populate:
  - `custcol_sna_day_rate`
  - `custcol_sna_weekly_rate`
  - `custcol_sna_4week_rate`
- Rate card selection must respect effective start and end dates and fall back to the most recent record when dates are missing.
- `showPrompt` must open the Select Objects Suitelet and require customer and location values.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Custom Record (customrecord_sna_hul_rate_card_sublist)

### Fields Referenced
- Header | custbody_sna_hul_cus_pricing_grp
- Header | trandate
- Header | location
- Line | custcol_sna_configure_object
- Line | custcol_sna_hul_fleet_no
- Line | custcol_sna_rental_rate_card
- Line | custcol_sna_day_rate
- Line | custcol_sna_weekly_rate
- Line | custcol_sna_4week_rate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Rate card has no effective dates; fallback record used.
- Customer or location missing; show prompt alerts.
- Missing rate card records; rate fields remain blank.

---

## 8. Implementation Notes (Optional)
- Uses script parameters for time unit IDs.
- Suitelets `customscript_sna_hul_sl_configureobject` and `customscript_sna_hul_sl_selectobject`.

---

## 9. Acceptance Criteria
- Given a rate card selection, when changed, then day/week/four-week rates populate.
- Given configure object checked, when invoked, then configurator Suitelet opens.

---

## 10. Testing Notes
- Select a rate card; verify rates populate.
- Click configure object; verify Suitelet opens.
- Missing customer or location; verify alert.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_so_rental.js`.
- Deploy to Sales Order form.
- Rollback: remove client script deployment from Sales Order form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should rate card selection validate against rental object eligibility?
- Risk: Rate card search returns multiple overlapping records.

---
