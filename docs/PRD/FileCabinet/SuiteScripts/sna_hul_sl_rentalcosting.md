# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalCosting
title: Rental Costing
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_rentalcosting.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_rental_rate_card
  - customrecord_sna_hul_rate_card_sublist
  - customrecord_sna_objects

---

## 1. Overview
Suitelet that displays rental costing inputs and calculated defaults based on a rental rate card.

---

## 2. Business Goal
Provides a structured UI for rental pricing inputs and default charge calculations.

---

## 3. User Story
- As a rental user, when I see rate card defaults, I want pricing to be consistent, so that quotes are accurate.
- As a rental user, when I enter rental dates and time units, I want costs calculated correctly, so that pricing is reliable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | object, rate card, customer, dates, location | Parameters provided | Render rental costing defaults and input fields |

---

## 5. Functional Requirements
- Accept parameters such as object, rate card, customer, dates, and location.
- Load rate card values and rate card sublist pricing based on transaction date.
- Populate default charge fields and totals when available.
- Compute earliest available date from object expected return date.
- On submit, close the window without saving data.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_rental_rate_card
- customrecord_sna_hul_rate_card_sublist
- customrecord_sna_objects

### Fields Referenced
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_description | Rate card description
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_ldw_item | LDW item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_ldwpercent | LDW percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_cdw_item | CDW item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_cdwpercent | CDW percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_lis_item | LIS item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_lispercent | LIS percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_envi_item | Environment item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_envipercent | Environment percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_m1chargecode | M1 charge code
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_time_unit_price | Time unit price
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_start_date | Effective start
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_end_date | Effective end
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_m1_units_included | M1 units
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_m1_unit_price | M1 unit price
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_rent_time_unit | Time unit
- Object | custrecord_sna_exp_rental_return_date | Expected return date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No rate card selected disables default charge fields.
- Object without expected return date defaults to today.
- Invalid rate card ID results in empty defaults.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple searches per request.

---

## 9. Acceptance Criteria
- Given a selected rate card, when the Suitelet runs, then form fields populate based on that rate card.
- Given no rate card is selected, when the Suitelet runs, then default charge fields are disabled.
- Given an object expected return date, when the Suitelet runs, then earliest available date is derived.

---

## 10. Testing Notes
Manual tests:
- Selected rate card populates default charges and pricing.
- No rate card selected disables default charge fields.
- Object without expected return date defaults to today.
- Invalid rate card ID results in empty defaults.

---

## 11. Deployment Notes
- Confirm rate card records exist.
- Deploy Suitelet.
- Link from rental order entry flow.

---

## 12. Open Questions / TBDs
- Should calculated totals be written back automatically?

---
