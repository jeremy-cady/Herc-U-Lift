# PRD: Sales Order Rental Processing

**PRD ID:** PRD-UNKNOWN-SoRental
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_so_rental.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Manages rental-specific behavior on Sales Orders and Estimates, including buttons, rental pricing, billing schedule generation, and time entry creation.

**What problem does it solve?**
Automates rental contract calculations, billing dates, and related operational records when rental orders are created or updated.

**Primary Goal:**
Ensure rental Sales Orders are priced, scheduled, and operationally linked to assets and time entries consistently.

---

## 2. Goals

1. Add rental UI actions for configuration and temporary items.
2. Calculate rental line quantities, rates, and billing schedules.
3. Create or update time entries for resource items tied to NXC tasks.

---

## 3. User Stories

1. **As a** rental coordinator, **I want to** calculate rental charges automatically **so that** pricing is accurate.
2. **As a** dispatcher, **I want to** open configuration and temporary item tools **so that** I can complete the order.
3. **As a** service manager, **I want to** have time entries created from resource lines **so that** labor tracking is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On CREATE/COPY, the system must initialize startdate and custbody_sn_rental_est_enddate when missing.
2. On non-VIEW UI loads, the system must add Add Object, Add Temporary Item, and Calculate Rental buttons from the client script.
3. On VIEW of rental estimates, the system must block conversion buttons when credit limit or COI requirements are not met.
4. On VIEW of Sales Orders, the system must hide fulfillment and billing buttons when configuration is incomplete or billing status is not ready.
5. On beforeSubmit, the system must calculate rental days, update rental item quantity/rate, and update charge line amounts based on rate cards.
6. On beforeSubmit, the system must set rental start/end dates on charge lines and set pickup date to enddate + 1.
7. On afterSubmit, the system must assign rental contract ids, generate billing schedules, and set bill dates based on terms and rental days.
8. On afterSubmit, the system must create or update time entries for resource items linked to NXC tasks unless excluded.
9. On afterSubmit, the system must update object status for used equipment and rental objects.
10. When address changes are flagged, the system must create a Site Asset if one does not exist for the ship-to address.

### Acceptance Criteria

- [ ] Rental item lines reflect calculated quantity, rate, and amount based on rate cards.
- [ ] Charge lines have correct bill dates and billing schedules for terms and duration.
- [ ] Resource lines create or update time entries when allowed.
- [ ] Rental contract ids are set on configured lines.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace the rental configurator Suitelet.
- Perform billing transactions or fulfillments.
- Override posted time entry values.

---

## 6. Design Considerations

### User Interface
- Buttons: Add Object, Add Temporary Item, Calculate Rental.
- View-only links for billing schedule and Configure Object.

### User Experience
- Prevents conversion actions when credit or COI conditions fail.
- Auto-calculates rental pricing and schedules without manual edits.

### Design References
- Client script: sna_hul_cs_ad_combinedcs.js
- Suitelet: customscript_sna_hul_sl_rentalconfigurat

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Estimate
- Support Case
- Customer
- Employee
- Time Bill
- Custom records: customrecord_sna_hul_rate_card_sublist, customrecord_sna_hul_rental_best_price, customrecord_nx_asset, customrecord_sna_objects, customrecord_sna_sales_zone

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - Rental configurator and billing schedule viewer
- [ ] RESTlet - N/A
- [x] User Event - Rental processing
- [x] Client Script - UI actions

**Custom Fields:**
- Transaction header | startdate, enddate | Rental dates
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

**Saved Searches:**
- None (script uses ad hoc searches)

### Integration Points
- Suitelet: customscript_sna_hul_sl_rentalconfigurat
- Suitelet: customscript_sna_hul_sl_billscheddets
- Client script: sna_hul_cs_ad_combinedcs.js
- External HTTP: http://api.mathjs.org/v4/ for formula evaluation

### Data Requirements

**Data Volume:**
- Per Sales Order, all item lines.

**Data Sources:**
- Rate card sublists, rental best price formulas, NXC case assets, employee records.

**Data Retention:**
- Billing schedules stored as JSON in custcol_sn_hul_billingsched.

### Technical Constraints
- Best price calculation depends on external HTTP request for formula evaluation.
- Rental days are calculated as workdays between start and end dates.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/moment.js; FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_rental_orders
- **External dependencies:** MathJS API (http://api.mathjs.org/v4/)
- **Other features:** Rental configurator suitelet and client script actions

### Governance Considerations

- **Script governance:** Heavy record load/save and multiple searches on afterSubmit.
- **Search governance:** Uses multiple searches for billing, time entry props, and object status.
- **API limits:** External HTTP call per pricing calculation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental rates and billing schedules are correctly populated on save.
- Time entries are created or updated for resource lines.
- Configured rental objects update status as expected.

**How we'll measure:**
- Validate line fields and billing schedules on sample orders.
- Confirm time entries and object statuses in records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_so_rental.js | User Event | Rental pricing, billing, and time entry logic | Implemented |

### Development Approach

**Phase 1:** UI and pricing
- [x] Add buttons and view restrictions.
- [x] Calculate rental rates and line amounts.

**Phase 2:** Billing and operational links
- [x] Generate billing schedules and bill dates.
- [x] Create time entries and update object status.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a rental Sales Order, verify rental line quantity/rate and bill dates.
2. Configure a rental line, save, and confirm rental contract id is set.

**Edge Cases:**
1. Rental days greater than 20 generate multi-period billing schedule.
2. Linked time entry is posted, verify hours are not changed.
3. Terms are COD or Credit Card, verify bill date rules apply.

**Error Handling:**
1. MathJS API is unavailable, verify script logs error and continues.

### Test Data Requirements
- Rate cards, rental best price formulas, and rental items.
- Customers with COI and credit limit data.

### Sandbox Setup
- Deploy client script and suitelets referenced in UI.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to Sales Orders, custom records, and time entries.

### Data Security
- Time entry creation uses line-level data from the Sales Order only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Verify rate card and best price custom records.
- [ ] Deploy client script and suitelets.

### Deployment Steps
1. Deploy User Event to Sales Order and Estimate as required.
2. Set script parameters for item groups, terms, and units.

### Post-Deployment
- Validate rental calculations and billing schedules on a test order.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- What is the expected behavior when MathJS API is unavailable in production?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| External API outage | Pricing calc fails | Cache or fallback formulas in NetSuite |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script
- Time Bill record

### External Resources
- http://api.mathjs.org/v4/

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
