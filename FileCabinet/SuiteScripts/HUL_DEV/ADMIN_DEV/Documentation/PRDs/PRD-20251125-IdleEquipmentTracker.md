# PRD: Rental Fleet Idle Equipment Tracker

**PRD ID:** PRD-20251125-IdleEquipmentTracker
**Created:** November 25, 2025
**Author:** Claude Code
**Status:** Deployed
**Related Scripts:**
- `Suitelets/hul_sl_idle_equipment_tracker.js` (Suitelet)
- `Scheduled/hul_ss_idle_equipment_alert.js` (Scheduled Script)

---

## 1. Introduction / Overview

**What is this feature?**
An interactive Suitelet and automated email alert system to track rental fleet equipment that has never been rented or hasn't been rented in a long time.

**What problem does it solve?**
The current n8n workflow incorrectly identifies equipment rental history. It only checks the most recent "R" Sales Order for a linked invoice, which means equipment with extensive rental history (e.g., 10 previous "R" invoices) but a new open Sales Order without an invoice is incorrectly marked as "never rented." Additionally, the rental team has no proactive way to identify idle equipment that may require action (price reduction, relocation, disposition).

**Primary Goal:**
Enable the Rental Coordinator to accurately identify equipment that has never been rented or hasn't rented in configurable time periods, with automated weekly email alerts to drive action.

---

## 2. Goals

1. **Accurate Rental History** - Correctly identify equipment rental status by checking ALL "R" invoices ever created, not just those linked to the most recent Sales Order
2. **Proactive Alerts** - Reduce idle equipment by sending weekly email alerts highlighting equipment that needs attention
3. **Actionable Dashboard** - Provide filters and visual indicators so Rental Coordinator can quickly identify and act on idle equipment
4. **Time Bucket Analysis** - Categorize equipment by time since last rental: Never, 1 month, 3 months, 6 months, 12 months, 12+ months

---

## 3. User Stories

1. **As a** Rental Coordinator, **I want to** see a list of equipment that has never been rented **so that** I can prioritize marketing or disposition efforts.

2. **As a** Rental Coordinator, **I want to** filter equipment by time since last rental (3 months, 6 months, etc.) **so that** I can focus on the most concerning items first.

3. **As a** Rental Coordinator, **I want to** receive weekly email alerts about idle equipment **so that** I don't have to check a report manually every day.

4. **As a** Rental Manager, **I want to** export idle equipment data to CSV **so that** I can share reports with leadership and perform further analysis.

5. **As an** Administrator, **I want to** configure alert recipients and thresholds **so that** the system can be adjusted without code changes.

---

## 4. Functional Requirements

### Core Functionality

1. The system must identify rental fleet equipment using these criteria:
   - `custrecord_sna_owner_status = 3` (rental ownership)
   - Equipment segment parent hierarchy IN (1, 5, 6, 9)
   - `custrecord_sna_posting_status = 2` (active posting)
   - Asset `isinactive = 'F'`
   - `custrecord_sna_hul_rent_dummy = 'F'`

2. The system must check ALL "R" invoices for each equipment via `custcol_sna_object` on transaction lines, not just invoices linked to the most recent Sales Order

3. The system must categorize equipment into these statuses:
   - **Never Rented**: No "R" invoices AND no "R" Sales Orders ever
   - **On Rent**: Has an open "R" Sales Order AND no invoices yet (new rental, not yet invoiced)
   - **Available**: Has "R" invoice history (categorized by time since last invoice, regardless of open SO)
   - Equipment with an open SO but existing invoice history shows time bucket with "(On SO)" indicator

4. The system must calculate time buckets for Available equipment:
   - 1 Month: ≤30 days since last "R" invoice
   - 3 Months: 31-90 days
   - 6 Months: 91-180 days
   - 12 Months: 181-365 days
   - 12+ Months: >365 days

5. The system must provide filters for:
   - Time bucket (dropdown)
   - Location (dropdown sourced from location record)
   - Equipment Category (multi-select dropdown sourced from `customrecord_cseg_sna_hul_eq_seg`)
   - Manufacturer (dropdown sourced from `customrecord_cseg_hul_mfg`)
   - Fleet code / serial number (text search)

6. The system must display color-coded status indicators (red for Never Rented, orange for 12+ months, etc.)

7. The system must provide CSV export functionality

8. The system must send weekly email alerts with equipment summary grouped by severity

### Acceptance Criteria

- [x] Equipment with historical "R" invoices and an open SO shows in time bucket with "(On SO)" indicator
- [x] Equipment with open SO but NO invoices shows as "On Rent" (truly new rental)
- [x] Equipment with no "R" transactions ever shows as "Never Rented"
- [x] Suitelet loads within 5 seconds for typical fleet size
- [x] CSV export includes all visible columns
- [x] Weekly email includes counts by time bucket and lists critical equipment
- [x] Alert recipients are configurable via script parameters

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace or modify the existing Fleet Report Suitelet (cost-per-hour analysis)
- Integrate with external systems (telematics, third-party rentals)
- Provide predictive analytics on future rental demand
- Auto-update the `custrecord_sna_rental_status` field on Object records
- Send real-time alerts (only scheduled weekly emails)
- Track rental contracts on equipment sold to customers (only rental fleet)

---

## 6. Design Considerations

### User Interface

**Suitelet Layout:**
1. **Filter Group** - Time bucket, location, category, manufacturer, search field
2. **Statistics Banner** - Color-coded counts by bucket (INLINEHTML)
3. **Results Sublist** - Status icon, fleet code, days idle, last rental, location, serial, manufacturer, model, category, customer, view link

### User Experience

- Report should load in under 5 seconds
- Color-coded urgency indicators visible without scrolling
- Click-through to equipment records from results
- Export button prominent for management reporting

### Color Scheme

| Status | Color | Hex |
|--------|-------|-----|
| Never Rented | Red | #dc3545 |
| 12+ Months | Orange | #fd7e14 |
| 6-12 Months | Yellow | #ffc107 |
| 3-6 Months | Light Yellow | #fff3cd |
| 1-3 Months | Light Green | #d4edda |
| Under 1 Month | Green | #28a745 |
| On Rent | Blue | #17a2b8 |

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- `customrecord_nx_asset` (Field Service Asset) - Equipment master
- `customrecord_sna_objects` (Object) - Equipment Object linked from Asset
- `customrecord_cseg_sna_hul_eq_seg` (Equipment Segment) - Category hierarchy
- `transaction` (Sales Order, Invoice) - Rental transactions

**Script Types:**
- [x] Suitelet - Interactive report for Rental Coordinator
- [x] Scheduled Script - Weekly email alerts

**Custom Fields Used:**
- `custrecord_sna_hul_fleetcode` - Fleet code identifier
- `custrecord_nx_asset_serial` - Serial number
- `custrecord_sna_hul_nxcassetobject` - Links Asset to Object
- `custrecord_sna_owner_status` - Owner status (3 = rental)
- `custrecord_sna_posting_status` - Posting status (2 = active)
- `custrecord_sna_hul_rent_dummy` - Rent dummy flag
- `custrecord_sna_responsibility_center` - Location
- `cseg_hul_mfg` - Manufacturer segment
- `cseg_sna_hul_eq_seg` - Equipment segment
- `custcol_sna_object` - Object on transaction line (equipment link)

**Saved Searches:**
- None required - uses SuiteQL with CTEs

### Data Requirements

**Data Volume:**
- Rental fleet: ~200-500 equipment
- Transaction history: Variable (months to years of "R" invoices/SOs)

**Data Sources:**
- `customrecord_nx_asset` via `customrecord_sna_objects`
- `transaction` + `transactionline` for rental activity

### Technical Constraints

- Must work within NetSuite governance limits (10,000 units for Suitelet)
- SuiteQL CTE support required (available in NetSuite 2021.1+)
- No dependency on `custrecord_sna_rental_status` (unreliable, manually maintained)

### Governance Considerations

- **Query Strategy:** Single master query with CTEs to minimize governance usage
- **Expected Usage:** ~50-100 units per Suitelet execution
- **Scheduled Script:** ~100-200 units for weekly alert generation

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Equipment with historical rental activity is NOT incorrectly marked as "Never Rented"
- Rental Coordinator receives weekly email alerts without manual report running
- Idle equipment count decreases over time as team takes action
- No complaints about report accuracy from Rental Coordinator

**How we'll measure:**
- Spot-check 10 equipment records for correct rental status
- Confirm email delivery to configured recipients
- User feedback on usability

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_sl_idle_equipment_tracker.js | Suitelet | Interactive idle equipment report | Deployed |
| hul_ss_idle_equipment_alert.js | Scheduled | Weekly email alerts | Deployed |

### Development Approach

**Phase 1:** PRD and Suitelet MVP
- [x] Create PRD document
- [x] Build Suitelet with master SuiteQL query
- [x] Add filter field group and statistics banner
- [x] Create results sublist with color-coded status
- [x] Add click-through links to equipment records

**Phase 2:** Export and Polish
- [x] Add CSV export functionality
- [x] Test with production data

**Phase 3:** Email Alerts
- [x] Build scheduled script with HTML email
- [x] Add configurable script parameters
- [x] Create deployment with weekly schedule

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Equipment with multiple "R" invoices and no open SO shows as "Available" with correct days count
2. Equipment with open "R" SO shows as "On Rent" regardless of invoice history
3. Equipment with no rental transactions shows as "Never Rented"

**Edge Cases:**
1. Equipment with ONLY cancelled "R" Sales Orders (no completed rentals)
2. Equipment added recently with no transactions
3. Very old equipment with rental history >5 years ago
4. Equipment with thousands of "R" invoices (performance test)

**Error Handling:**
1. Invalid filter combination returns empty results gracefully
2. Missing data (e.g., no location) displays "N/A" instead of error

### Test Data Requirements

- At least 10 equipment records across all status types
- Mix of locations, categories, and manufacturers
- Historical rental transactions spanning multiple time buckets

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need Suitelet access:**
- Rental Coordinator (Role ID: TBD)
- Rental Manager
- Administrator

**Permissions required:**
- View Field Service Assets
- View Sales Orders
- View Invoices
- Execute Suitelet

### Data Security

- No PII exposed in reports
- Equipment data is internal only (no customer financial data)

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [x] Code review completed
- [x] All tests passing in sandbox
- [x] Documentation updated
- [x] PRD_SCRIPT_INDEX.md updated
- [x] Stakeholder approval obtained

### Deployment Steps

1. Upload `hul_sl_idle_equipment_tracker.js` to File Cabinet
2. Create Suitelet script record and deployment
3. Test Suitelet in production with limited data
4. Upload `hul_ss_idle_equipment_alert.js` to File Cabinet
5. Create Scheduled Script record with parameters:
   - `custscript_idle_eq_sender` (List/Record - Employee)
   - `custscript_idle_eq_recipients` (Free-Form Text)
   - `custscript_idle_eq_cc` (Free-Form Text)
   - `custscript_idle_eq_send_empty` (Checkbox)
   - `custscript_idle_eq_threshold_attention` (Integer, default: 90)
   - `custscript_idle_eq_threshold_critical` (Integer, default: 180)
6. Create deployment with weekly schedule (Monday 7:00 AM)
7. Configure sender employee and alert recipients via deployment parameters

### Rollback Plan

**If deployment fails:**
1. Disable script deployments
2. Previous functionality unaffected (new feature only)
3. Investigate logs and fix issues in sandbox

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | Nov 25, 2025 | Nov 25, 2025 | Complete |
| Suitelet Development | Nov 25, 2025 | Nov 25, 2025 | Complete |
| Suitelet Testing | Nov 25, 2025 | Nov 25, 2025 | Complete |
| Alert Script Development | Nov 25, 2025 | Nov 25, 2025 | Complete |
| Production Deploy | Nov 25, 2025 | Nov 25, 2025 | Complete |

---

## 14. Open Questions & Risks

### Open Questions

- [x] Which field links equipment to transactions? Answer: `custcol_sna_object` on transaction lines
- [x] Should we use `custrecord_sna_rental_status`? Answer: No, it's manually maintained and unreliable
- [x] Who should receive email alerts? Answer: Configurable via script parameters
- [x] What Sales Order statuses indicate "open" (On Rent)? Answer: Not Cancelled (`SalesOrd:C`) or Closed (`SalesOrd:H`)

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Query performance with large transaction history | Low | Medium | Use CTEs and indexes; limit date range if needed |
| Incorrect status for edge cases | Medium | High | Thorough testing with real data |
| Email delivery failures | Low | Low | Log email attempts; manual fallback to Suitelet |

---

## 15. References & Resources

### Related PRDs
- PRD-20251105-FleetReport.md (Equipment cost analysis - similar patterns)
- PRD-20251031-TechnicianTimeline.md (Suitelet UI patterns)

### NetSuite Documentation
- [SuiteQL Reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156257770590.html)
- [N/query Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4345764122.html)
- [Scheduled Script](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4387799161.html)

---

## SuiteQL Master Query

```sql
WITH RentalFleet AS (
    SELECT
        a.id AS asset_id,
        a.custrecord_sna_hul_fleetcode AS fleet_code,
        a.custrecord_nx_asset_serial AS serial,
        o.id AS object_id,
        o.name AS object_name,
        BUILTIN.DF(a.cseg_hul_mfg) AS manufacturer,
        BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
        BUILTIN.DF(a.cseg_sna_hul_eq_seg) AS category,
        BUILTIN.DF(o.custrecord_sna_responsibility_center) AS location
    FROM customrecord_nx_asset a
    INNER JOIN customrecord_sna_objects o
        ON a.custrecord_sna_hul_nxcassetobject = o.id
    LEFT JOIN customrecord_cseg_sna_hul_eq_seg seg ON a.cseg_sna_hul_eq_seg = seg.id
    LEFT JOIN customrecord_cseg_sna_hul_eq_seg p1 ON seg.parent = p1.id
    LEFT JOIN customrecord_cseg_sna_hul_eq_seg p2 ON p1.parent = p2.id
    LEFT JOIN customrecord_cseg_sna_hul_eq_seg p3 ON p2.parent = p3.id
    WHERE o.custrecord_sna_owner_status = 3
      AND o.custrecord_sna_posting_status = 2
      AND NVL(o.custrecord_sna_hul_rent_dummy, 'F') = 'F'
      AND a.isinactive = 'F'
      AND (
          seg.parent IN (1, 5, 6, 9)
          OR p1.parent IN (1, 5, 6, 9)
          OR p2.parent IN (1, 5, 6, 9)
          OR p3.parent IN (1, 5, 6, 9)
      )
),
InvoiceHistory AS (
    SELECT
        tl.custcol_sna_object AS object_id,
        COUNT(DISTINCT t.id) AS invoice_count,
        MAX(t.trandate) AS last_invoice_date,
        MIN(t.trandate) AS first_invoice_date
    FROM transaction t
    INNER JOIN transactionline tl ON t.id = tl.transaction
    WHERE t.type = 'CustInvc'
      AND t.tranid LIKE 'R%'
      AND tl.custcol_sna_object IS NOT NULL
      AND tl.mainline = 'F'
    GROUP BY tl.custcol_sna_object
),
OpenRentals AS (
    SELECT
        tl.custcol_sna_object AS object_id,
        t.id AS open_so_id,
        t.tranid AS open_so_number,
        BUILTIN.DF(t.entity) AS current_customer,
        ROW_NUMBER() OVER (PARTITION BY tl.custcol_sna_object ORDER BY t.trandate DESC) AS rn
    FROM transaction t
    INNER JOIN transactionline tl ON t.id = tl.transaction
    WHERE t.type = 'SalesOrd'
      AND t.tranid LIKE 'R%'
      AND t.status NOT IN ('SalesOrd:C', 'SalesOrd:H')
      AND tl.custcol_sna_object IS NOT NULL
      AND tl.mainline = 'F'
),
AllSOs AS (
    SELECT
        tl.custcol_sna_object AS object_id,
        COUNT(DISTINCT t.id) AS total_so_count
    FROM transaction t
    INNER JOIN transactionline tl ON t.id = tl.transaction
    WHERE t.type = 'SalesOrd'
      AND t.tranid LIKE 'R%'
      AND tl.custcol_sna_object IS NOT NULL
      AND tl.mainline = 'F'
    GROUP BY tl.custcol_sna_object
)
SELECT
    rf.*,
    NVL(ih.invoice_count, 0) AS invoice_count,
    ih.last_invoice_date,
    TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) AS days_since_invoice,
    CASE WHEN orr.rn = 1 THEN orr.open_so_number END AS current_so,
    CASE WHEN orr.rn = 1 THEN orr.current_customer END AS current_customer,
    NVL(aso.total_so_count, 0) AS total_so_count,
    CASE
        WHEN orr.rn = 1 AND NVL(ih.invoice_count, 0) = 0 THEN 'On Rent'
        WHEN NVL(ih.invoice_count, 0) = 0 AND NVL(aso.total_so_count, 0) = 0 THEN 'Never Rented'
        ELSE 'Available'
    END AS rental_status,
    CASE WHEN orr.rn = 1 THEN 'Y' ELSE 'N' END AS has_open_so,
    CASE
        WHEN ih.last_invoice_date IS NULL THEN 'Never'
        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 30 THEN '1 Month'
        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 90 THEN '3 Months'
        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 180 THEN '6 Months'
        WHEN TRUNC(SYSDATE) - TRUNC(ih.last_invoice_date) <= 365 THEN '12 Months'
        ELSE '12+ Months'
    END AS time_bucket
FROM RentalFleet rf
LEFT JOIN InvoiceHistory ih ON rf.object_id = ih.object_id
LEFT JOIN OpenRentals orr ON rf.object_id = orr.object_id AND orr.rn = 1
LEFT JOIN AllSOs aso ON rf.object_id = aso.object_id
ORDER BY
    CASE WHEN orr.rn = 1 THEN 1 WHEN ih.invoice_count > 0 THEN 2 ELSE 3 END,
    rf.fleet_code
```

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Nov 25, 2025 | Claude Code | 1.0 | Initial draft |
| Nov 25, 2025 | Claude Code | 1.1 | Implemented Suitelet with filters, statistics, CSV export |
| Nov 25, 2025 | Claude Code | 1.2 | Implemented Scheduled Script with email alerts |
| Nov 25, 2025 | Claude Code | 1.3 | Fixed "On Rent" logic - only new rentals (open SO + no invoices) show as On Rent |
| Nov 25, 2025 | Claude Code | 1.4 | Added Equipment Category filter, added sender parameter for email |
| Nov 25, 2025 | Claude Code | 2.0 | Deployed to production |
| Nov 28, 2025 | Claude Code | 2.1 | Changed Equipment Category filter from single-select to multi-select per user request |
