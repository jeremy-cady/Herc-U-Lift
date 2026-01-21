# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoRental
title: Sales Order Rental Processing
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_so_rental.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - estimate
  - supportcase
  - customer
  - employee
  - timebill
  - customrecord_sna_hul_rate_card_sublist
  - customrecord_sna_hul_rental_best_price
  - customrecord_nx_asset
  - customrecord_sna_objects
  - customrecord_sna_sales_zone

---

## 1. Overview
Manages rental-specific behavior on Sales Orders and Estimates, including buttons, rental pricing, billing schedule generation, and time entry creation.

---

## 2. Business Goal
Automate rental contract calculations, billing dates, and related operational records when rental orders are created or updated.

---

## 3. User Story
As a rental coordinator or dispatcher, when rental orders are created, I want pricing, schedules, and related records handled automatically, so that rental operations are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | UI actions | non-view UI | Add Add Object, Add Temporary Item, and Calculate Rental buttons |
| beforeSubmit | rental fields | create/copy | Initialize dates, calculate rental days, set quantities and rates |
| afterSubmit | contract/schedule fields | create/edit | Set contract ids, generate billing schedules, update time entries and object status |
| beforeLoad | view restrictions | view | Block conversion or hide buttons based on credit/COI and config |

---

## 5. Functional Requirements
- On CREATE/COPY, initialize startdate and `custbody_sn_rental_est_enddate` when missing.
- On non-VIEW UI loads, add Add Object, Add Temporary Item, and Calculate Rental buttons from the client script.
- On VIEW of rental estimates, block conversion buttons when credit limit or COI requirements are not met.
- On VIEW of Sales Orders, hide fulfillment and billing buttons when configuration is incomplete or billing status is not ready.
- On beforeSubmit, calculate rental days, update rental item quantity/rate, and update charge line amounts based on rate cards.
- On beforeSubmit, set rental start/end dates on charge lines and set pickup date to enddate + 1.
- On afterSubmit, assign rental contract ids, generate billing schedules, and set bill dates based on terms and rental days.
- On afterSubmit, create or update time entries for resource items linked to NXC tasks unless excluded.
- On afterSubmit, update object status for used equipment and rental objects.
- When address changes are flagged, create a Site Asset if one does not exist for the ship-to address.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- estimate
- supportcase
- customer
- employee
- timebill
- customrecord_sna_hul_rate_card_sublist
- customrecord_sna_hul_rental_best_price
- customrecord_nx_asset
- customrecord_sna_objects
- customrecord_sna_sales_zone

### Fields Referenced
- Transaction header | startdate | Rental start date
- Transaction header | enddate | Rental end date
- Transaction header | custbody_sn_rental_est_enddate | Initial end date copy
- Transaction header | custbody_sn_rental_pickup_date | Pickup date
- Transaction header | custbody_sna_hul_conversionerror | Conversion error message
- Transaction header | custbody_sna_hul_billing_status | Billing status
- Transaction header | custbody_nx_case | NXC case
- Transaction header | custbody_sna_hul_nxc_eq_asset | NXC equipment asset
- Transaction header | custbody_sna_hul_address_changed | Address changed flag
- Transaction header | custbody_sn_rental_billing_cycle | Billing cycle count
- Transaction header | cseg_sna_revenue_st | Header revenue stream
- Item line | custcol_sna_rental_rate_card | Rate card
- Item line | custcol_sna_hul_time_unit | Time unit
- Item line | custcol_sna_hul_rent_start_date | Line rental start
- Item line | custcol_sna_hul_rent_end_date | Line rental end
- Item line | custcol_sna_hul_rental_hrs | Rental hours
- Item line | custcol_sna_day_rate | Day rate
- Item line | custcol_sna_weekly_rate | Weekly rate
- Item line | custcol_sna_4week_rate | 4-week rate
- Item line | custcol_sna_day_bestprice | Best day price
- Item line | custcol_sna_week_bestprice | Best week price
- Item line | custcol_sna_extra_days | Extra days
- Item line | custcol_sn_hul_billingsched | Billing schedule JSON
- Item line | custcol_sn_hul_billingschedlink | Billing schedule link
- Item line | custcol_sna_hul_bill_date | Bill date
- Item line | custcol_sna_hul_overridebilldate | Override bill date
- Item line | custcol_sna_hul_object_configurator | Configurator JSON
- Item line | custcol_sna_hul_object_configurator_2 | Configurator JSON v2
- Item line | custcol_sna_hul_rent_contractidd | Rental contract id
- Item line | custcol_sna_hul_fleet_no | Fleet object
- Item line | custcol_nx_task | NXC task
- Item line | custcol_sna_task_assigned_to | Assigned to
- Item line | custcol_sna_linked_time | Linked time entry
- Item line | custcol_sna_hul_act_service_hours | Actual service hours
- Item line | custcol_sna_repair_code | Repair code
- Item line | custcol_sna_work_code | Work code
- Item line | custcol_sna_group_code | Group code
- Item line | cseg_sna_revenue_st | Line revenue stream

Schemas (if known):
- Suitelet: customscript_sna_hul_sl_rentalconfigurat
- Suitelet: customscript_sna_hul_sl_billscheddets
- External API: http://api.mathjs.org/v4/

---

## 7. Validation & Edge Cases
- Rental days greater than 20 generate multi-period billing schedule.
- Linked time entry is posted; hours are not changed.
- Terms are COD or Credit Card; bill date rules apply.
- MathJS API unavailable logs error and continues.

---

## 8. Implementation Notes (Optional)
- Client script: sna_hul_cs_ad_combinedcs.js.
- External HTTP: http://api.mathjs.org/v4/ for formula evaluation.
- Libraries: FileCabinet/SuiteScripts/moment.js; FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_rental_orders.

---

## 9. Acceptance Criteria
- Given rental lines, when saving, then quantity, rate, and amounts reflect rate cards.
- Given charge lines, when saving, then bill dates and schedules are set based on terms and duration.
- Given resource lines, when saving, then time entries are created or updated when allowed.
- Given configured lines, when saving, then rental contract ids are set.

---

## 10. Testing Notes
- Create rental Sales Order, verify rental line quantity/rate and bill dates.
- Configure rental line, save, and confirm rental contract id is set.
- Rental days > 20 generate multi-period billing schedule.
- Deploy client script and suitelets referenced in UI.

---

## 11. Deployment Notes
- Verify rate card and best price custom records.
- Deploy client script and suitelets.
- Deploy User Event to Sales Order and Estimate as required.
- Set script parameters for item groups, terms, and units.

---

## 12. Open Questions / TBDs
- What is the expected behavior when MathJS API is unavailable in production?

---
