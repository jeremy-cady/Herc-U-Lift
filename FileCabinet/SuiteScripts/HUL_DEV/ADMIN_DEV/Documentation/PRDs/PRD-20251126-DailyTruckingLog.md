# PRD: Daily Trucking Log Report

**PRD ID:** PRD-20251126-DailyTruckingLog
**Created:** November 26, 2025
**Author:** Claude Code
**Status:** User Acceptance Testing (Sandbox)
**Related Scripts:**
- `Suitelets/hul_sl_daily_trucking_log.js`

**Script Deployment:**
- Script ID: `customscript_hul_sl_daily_trucking_log`
- Deployment ID: `customdeploy_hul_sl_daily_trucking_log`

---

## 1. Introduction / Overview

**What is this feature?**
A dual-mode Suitelet that generates Daily Trucking Log reports matching the format of the manual PDF logs created by the trucking department. The report shows equipment deliveries and pickups grouped by location, with a JSON API endpoint for n8n integration.

**What problem does it solve?**
- The trucking department manually creates daily logs tracking equipment moves
- Management needs to compare manual logs against NetSuite data to verify data entry compliance
- Users may complete the manual PDF but forget to update NetSuite, causing inventory tracking errors
- This automated report enables AI-powered comparison between manual and system records

**Primary Goal:**
Enable management to audit equipment move data entry by providing a NetSuite-generated report that mirrors the manual trucking log format, with API access for automated comparison via n8n.

---

## 2. User Stories

1. **As a** Trucking Manager, **I want to** view a daily trucking log report in NetSuite **so that** I can verify moves are being entered correctly.

2. **As an** Operations Manager, **I want to** compare manual logs to NetSuite data **so that** I can identify data entry gaps.

3. **As an** n8n Integration, **I want to** fetch trucking log data via JSON API **so that** an AI agent can compare it against manual PDF logs.

4. **As a** Dispatcher, **I want to** see deliveries and pickups grouped by location **so that** I can quickly review activity at each warehouse.

---

## 3. Functional Requirements

### Report Sections

**Header (per location):**
- Location code (HERC X format)
- Location name
- Report date

**DELIVERED TO Section:**
- All equipment deliveries (Case Type = 6) for the location
- Sorted by customer name

**IN FROM Section:**
- All equipment pickups (Case Type = 103) for the location
- Sorted by customer name

### Report Columns (Implemented)

| Column | Description | Source |
|--------|-------------|--------|
| Case# | Case number with link | Case `casenumber` |
| Task | Link to view task | Task `id` |
| Code | Move type (R=Rental, S=Sale, WO=Work Order, etc.) | Transaction `tranid` prefix |
| Cust# | Customer number | Customer `entityid` via `custevent_nx_customer` |
| Customer Name | Customer name | Customer `companyname` via `custevent_nx_customer` |
| Site | Job site address | Case `custevent_nx_case_asset` |
| Driver | Employee initials who made the move | Task `assigned` employee |
| File No. | Fleet code | Asset `custrecord_sna_hul_fleetcode` |
| Model | Equipment model | Asset `custrecord_sna_hul_nxc_object_model` |
| Transaction | Transaction number with link | Transaction `tranid` via `custevent_nx_case_transaction` |
| Revenue Stream | Revenue classification | Case `cseg_sna_revenue_st` |
| Case Details | Case details/notes | Case `custevent_nx_case_details` |

### Code Types

| Code | Meaning |
|------|---------|
| R | Rental |
| S | Sale |
| D | Demo |
| L | Loaner |
| C | Customer Repairs |
| WO | Work Order / Customer Repairs |
| T | Trucking/Transfer |
| P | Parts |
| E | Equipment / New/Used Trucks |
| A | Allied/Rack |

---

## 4. Technical Considerations

### Data Model (Verified Field IDs)

**Primary Record:** Support Case (supportcase)
- `custevent_nx_case_type` = 6 (Delivery) or 103 (Pick-up)
- `custevent_nx_customer` = Link to Customer record (entityid + companyname)
- `custevent_nx_case_transaction` = Linked Sales Order/Invoice
- `custevent_sna_hul_case_object` = Linked Object record (note underscore between case_object)
- `custevent_nx_case_asset` = Site/Job Site address
- `custevent_nx_case_details` = Case details text
- `cseg_sna_revenue_st` = Revenue Stream segment

**Related Records:**
- **Task** - `supportcase` field links to case, `assigned` = driver employee
- **Customer** - Joined via `custevent_nx_customer`, provides `entityid` (number) and `companyname`
- **Object** - `custrecord_sna_responsibility_center` = location ID
- **Asset** - `custrecord_sna_hul_nxcassetobject` links to Object, `custrecord_sna_hul_fleetcode` = fleet code, `custrecord_sna_hul_nxc_object_model` = model
- **Location** - `custrecord_sna_hul_res_cntr_code` = HERC code number (the "X" in "HERC X")
- **Transaction** - `tranid` prefix determines move code (R, S, WO, etc.)

### Suitelet Architecture

**Dual-Mode Operation:**
- `?format=ui` (default) - Returns HTML form with filters and results
- `?format=json` - Returns JSON data for API consumption

**URL Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `format` | string | Output format (ui/json) | ui |
| `date` | date | Report date | Today |
| `location` | integer | Filter by HERC code | All |

### SuiteQL Query (Implemented)

```sql
SELECT
    sc.id AS case_id,
    sc.casenumber,
    sc.custevent_nx_case_type AS case_type,
    sc.custevent_nx_case_details AS case_details,
    BUILTIN.DF(sc.custevent_nx_case_asset) AS site_name,
    BUILTIN.DF(sc.cseg_sna_revenue_st) AS revenue_stream,
    cust.entityid AS customer_number,
    cust.companyname AS customer_name,
    t.id AS task_id,
    t.title AS task_title,
    t.startdate AS task_date,
    BUILTIN.DF(t.assigned) AS driver_name,
    o.id AS object_id,
    o.name AS object_name,
    a.custrecord_sna_hul_fleetcode AS fleet_code,
    BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
    o.custrecord_sna_responsibility_center AS location_id,
    loc.name AS location_name,
    loc.custrecord_sna_hul_res_cntr_code AS herc_code,
    trans.id AS transaction_id,
    trans.tranid AS transaction_number,
    CASE
        WHEN trans.tranid LIKE 'WO%' THEN 'WO'
        ELSE SUBSTR(trans.tranid, 1, 1)
    END AS move_code
FROM supportcase sc
INNER JOIN task t ON t.supportcase = sc.id
LEFT JOIN customer cust ON sc.custevent_nx_customer = cust.id
LEFT JOIN customrecord_sna_objects o ON sc.custevent_sna_hul_case_object = o.id
LEFT JOIN customrecord_nx_asset a ON a.custrecord_sna_hul_nxcassetobject = o.id
LEFT JOIN location loc ON o.custrecord_sna_responsibility_center = loc.id
LEFT JOIN transaction trans ON sc.custevent_nx_case_transaction = trans.id
WHERE sc.custevent_nx_case_type IN (6, 103)
  AND TRUNC(t.startdate) = TO_DATE('MM/DD/YYYY', 'MM/DD/YYYY')
ORDER BY loc.custrecord_sna_hul_res_cntr_code, sc.custevent_nx_case_type, cust.companyname
```

---

## 5. JSON API Response Format

```json
{
  "reportDate": "2025-11-24",
  "generatedAt": "2025-11-24T08:00:00Z",
  "locations": [
    {
      "locationId": 7,
      "hercCode": 1,
      "locationName": "Maple Plain",
      "deliveredTo": [
        {
          "code": "R",
          "subCode": null,
          "customerId": "C032855",
          "customerName": "AMPLIFIED ELECTRIC",
          "driver": "CR",
          "fleetCode": "AL4326",
          "model": "SJ45T",
          "caseId": 12345,
          "transactionNumber": "R-10001"
        }
      ],
      "inFrom": [
        {
          "code": "R",
          "subCode": null,
          "customerId": "3114",
          "customerName": "ALLSTAR CONST",
          "driver": "DH",
          "fleetCode": "IT2007",
          "model": "SJ843TH",
          "caseId": 12346,
          "transactionNumber": "R-10002"
        }
      ]
    }
  ],
  "summary": {
    "totalDeliveries": 45,
    "totalPickups": 32,
    "locationsWithActivity": 10
  }
}
```

---

## 6. UI Design

### Filter Section
- **Date Picker** - Single date selection, defaults to today
- **Location Dropdown** - Optional filter by HERC location
- **Run Report Button** - Submit to generate report

### Results Display
- Grouped by location (HERC 1, HERC 2, etc.)
- Each location has two sections:
  - "DELIVERED TO" header with table
  - "IN FROM" header with table
- Color scheme matching existing Suitelets (purple gradient)

### Statistics Banner
- Total deliveries count
- Total pickups count
- Locations with activity count

---

## 7. Implementation Plan

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create PRD document | ✅ Complete |
| 2 | Build Suitelet with dual-mode routing | ✅ Complete |
| 3 | Implement SuiteQL query | ✅ Complete |
| 4 | Build UI mode with filters and results | ✅ Complete |
| 5 | Build JSON API mode | ✅ Complete |
| 6 | User Acceptance Testing (Sandbox) | 🔄 In Progress |
| 7 | Deploy to production | ⏳ Pending |

### Development Notes

**Field ID Issues Resolved:**
- Case to Object link: `custevent_sna_hul_case_object` (note underscore)
- Asset to Object link: `custrecord_sna_hul_nxcassetobject`
- Model field is on Asset record, not Object
- Customer data joined via `custevent_nx_customer` to Customer table

**UI Enhancements:**
- Fixed column alignment using `table-layout: fixed` with CSS column width classes
- Added horizontal scroll wrapper for wide tables
- Stats and results positioned below filters using `OUTSIDEBELOW` layout
- Hover tooltips on truncated cells

---

## 8. Testing Requirements

### Test Scenarios

1. **Date Filtering** - Run report for specific date, verify results match manual log
2. **Location Filtering** - Filter by single HERC location
3. **All Locations** - Run without location filter, verify grouping
4. **JSON Mode** - Test API endpoint returns valid JSON
5. **Empty Results** - Test date with no deliveries/pickups
6. **Field Mapping** - Verify each column matches manual PDF format

### Test Data

Use manual PDF from 11/24/2025 as reference:
- HERC 1 (Maple Plain): Multiple R, WO, S, T, P codes
- HERC 2: Various deliveries and pickups
- Compare customer numbers, fleet codes, models

---

## 9. Open Questions

1. **Sub Code Source** - Where does N/U/M/T sub code come from?
2. **REP Column** - Skip for MVP, add later if needed
3. **Task Status** - Verify correct status filter for completed tasks

---

## 10. Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Nov 26, 2025 | Claude Code | 1.0 | Initial PRD |
| Nov 26, 2025 | Claude Code | 1.1 | Implemented Suitelet with dual-mode (UI + JSON API) |
| Nov 26, 2025 | Claude Code | 1.2 | Fixed field IDs (case_object, asset joins), added Customer join |
| Nov 26, 2025 | Claude Code | 1.3 | Added columns: Site, Transaction, Revenue Stream, Case Details, Task link |
| Nov 26, 2025 | Claude Code | 1.4 | Fixed UI layout (full-width results), fixed column alignment across sections |
| Nov 26, 2025 | Claude Code | 1.5 | Deployed to sandbox, sent to users for UAT |
