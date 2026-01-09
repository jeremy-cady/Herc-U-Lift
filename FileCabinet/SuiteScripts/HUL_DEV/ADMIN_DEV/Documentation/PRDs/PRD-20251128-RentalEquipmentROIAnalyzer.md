# PRD: Rental Equipment ROI Analyzer

**PRD ID:** PRD-20251128-RentalEquipmentROIAnalyzer
**Created:** November 28, 2025
**Author:** Claude Code
**Status:** Phase 2 Complete
**Related Scripts:**
- `Suitelets/hul_sl_rental_roi_analyzer.js` (Phase 1 - Single Equipment)
- `MapReduce/hul_mr_rental_roi_report.js` (Phase 2 - Fleet-Wide Report)

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that calculates ROI (Return on Investment) for rental fleet equipment by comparing rental revenue against associated costs over a configurable time period.

**What problem does it solve?**
- Enables rental operations team to understand profitability of individual equipment
- Identifies high-performing vs underperforming rental assets
- Provides data-driven insights for fleet acquisition/disposition decisions
- Tracks revenue vs costs with proper Internal/External classification

**Primary Goal:**
Provide clear, actionable ROI metrics for rental equipment to optimize fleet profitability.

**Key Insight:**
- **Revenue** = ALL R-prefix invoices (rental revenue from any customer - internal or external)
- **Costs** = INTERNAL revenue streams only (W, PS, T invoices for internal service charges)

This captures all rental revenue vs what it costs internally to maintain the equipment.

---

## 2. Goals

1. **Accurate Revenue Tracking** - Calculate rental revenue from ALL R-prefix invoices
2. **Complete Cost Analysis** - Include ALL internal costs (service, parts, trucking, etc.)
3. **Clear ROI Calculation** - Present Net Profit and ROI percentage
4. **Equipment Context** - Show equipment age, manufacturer, model, location
5. **Transaction Visibility** - List all contributing transactions for audit/drill-down

---

## 3. User Stories

1. **As a** Rental Operations Manager, **I want to** see the ROI for a specific piece of equipment **so that** I can evaluate its profitability.

2. **As a** Fleet Manager, **I want to** know the equipment age along with ROI **so that** I can make informed replacement decisions.

3. **As a** Finance Analyst, **I want to** see the breakdown of revenue and costs **so that** I can understand what drives profitability.

4. **As a** Rental Operations Manager, **I want to** export the data to CSV **so that** I can perform further analysis.

---

## 4. Functional Requirements

### Phase 1: Single Equipment Analyzer

#### Input Filters
- **Equipment Search:** Text field for fleet code or serial number
- **From Date:** Required date field
- **To Date:** Required date field
- **Submit Button:** Runs the analysis

#### Output - Equipment Header
- Fleet code
- Serial number
- Manufacturer
- Model
- Equipment Category
- Location (Responsibility Center)
- Equipment Age (calculated from Year field on Object record)
- **First Rental Invoice** - Date and invoice number of the very first R-prefix invoice for this equipment (independent of date filters, helps users know full history range)

#### Output - ROI Summary Metrics
| Metric | Description | Display Color |
|--------|-------------|---------------|
| Rental Revenue | Sum of ALL R-prefix invoice lines | Green |
| Revenue Credits | CM-prefix credit memos linked to equipment | Red |
| Net Revenue | Revenue - Revenue Credits | Blue |
| Gross Costs | All internal-tagged costs (W, PS, T invoices, etc.) | Orange |
| Cost Credits | CM-prefix credit memos with Internal rev stream | Teal |
| Net Costs | Gross Costs - Cost Credits | Orange |
| Net Profit/Loss | Net Revenue - Net Costs | Green/Red |
| ROI Percentage | (Net Profit / Net Costs) × 100 | Bold |

#### Output - Transaction Breakdown
- **Revenue Transactions:** Table of ALL R-prefix invoices contributing to revenue
- **Revenue Credit Memos:** CM-prefix credit memos linked to equipment
- **Cost Transactions:** Table of internal cost transactions (W, PS, T prefix)
- **Cost Credit Memos:** CM-prefix credit memos with Internal rev stream
- Columns: Date, Transaction Number, Type, **Status**, **Applied To**, Amount, Customer, **Revenue Stream (full hierarchical path)**, Memo

**Status Column:**
- Shows transaction payment status (e.g., "Paid In Full", "Open")
- Retrieved via JOIN to `transactionstatus` table

**Applied To Column:**
- For invoices: Shows payment(s) and/or credit memo(s) applied to the invoice
- For credit memos: Shows invoice(s) the credit was applied to
- Each transaction number is a clickable hyperlink to the NetSuite record
- Uses N/search module with `appliedtotransaction` filter (SuiteQL doesn't support this)

#### Export
- CSV export button for all transaction data

### Phase 2: Fleet-Wide Comparison (Future)
- Dashboard showing all rental equipment ranked by ROI
- Filters by category, location, age range
- Identify top performers and underperformers

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**
- Calculate depreciation or book value
- Factor in acquisition cost (just operating revenue/costs)
- Show utilization metrics (days rented vs available) - keep it simple
- Automatically suggest pricing changes
- Compare against industry benchmarks

---

## 6. Design Considerations

### Revenue Stream Classification

**Internal vs External:**
```
Field: cseg_sna_revenue_st (on transaction lines)
Checkbox: custrecord_sna_hul_revstreaminternal (on customrecord_cseg_sna_revenue_st)
  - T = Internal (used for COSTS - internal service charges)
  - F = External (used for REVENUE - paying customers)
```

**ROI Analyzer Logic:**
- **Revenue:** ALL R-prefix invoices (no revenue stream filter - captures all rental revenue)
- **Revenue Credits:** ALL CM-prefix credit memos linked to equipment via `custcol_sna_object`
- **Costs:** Non-R invoices where `custrecord_sna_hul_revstreaminternal = 'T'` (Internal) AND `custrecord_sn_for_warranty = 'F'` (NOT warranty)
- **Cost Credits:** CM-prefix credit memos where `custrecord_sna_hul_revstreaminternal = 'T'` (Internal) AND `custrecord_sn_for_warranty = 'F'` (NOT warranty)

**Warranty Exclusion Rationale:**
Warranty repairs should not count as costs against equipment ROI because they are covered by manufacturer/vendor warranty. These costs are invoiced internally for tracking but don't represent actual out-of-pocket maintenance expense for the rental fleet.

### Equipment Identification

Rental equipment criteria (from Idle Equipment Tracker):
```sql
WHERE o.custrecord_sna_owner_status = 3        -- Rental ownership
  AND o.custrecord_sna_posting_status = 2      -- Active posting
  AND NVL(o.custrecord_sna_hul_rent_dummy, 'F') = 'F'
  AND a.isinactive = 'F'
```

### Equipment Age Calculation

- **Source:** `custrecord_sna_year` field on Object record
- **Calculation:** Current Year - Year field value = Equipment Age in years
- **Example:** If Year = 2020, and current year = 2025, age = 5 years

### Transaction Links

```
Transaction Line → custcol_sna_object → Object Record
Object Record ← custrecord_sna_hul_nxcassetobject ← Field Service Asset
```

---

## 7. Technical Considerations

### NetSuite Components

**Record Types:**
- `customrecord_nx_asset` - Field Service Asset (equipment master)
- `customrecord_sna_objects` - Object (for age, location)
- `transaction` - Invoices, Credit Memos
- `transactionline` - Line item details
- `customrecord_cseg_sna_revenue_st` - Revenue stream with Internal flag

**Script Type:** Suitelet

### SuiteQL Queries

#### Equipment Details Query
```sql
SELECT
    a.id AS asset_id,
    a.custrecord_sna_hul_fleetcode AS fleet_code,
    a.custrecord_nx_asset_serial AS serial,
    o.id AS object_id,
    o.name AS object_name,
    o.custrecord_sna_year AS year,
    BUILTIN.DF(a.cseg_hul_mfg) AS manufacturer,
    BUILTIN.DF(a.custrecord_sna_hul_nxc_object_model) AS model,
    BUILTIN.DF(a.cseg_sna_hul_eq_seg) AS category,
    BUILTIN.DF(o.custrecord_sna_responsibility_center) AS location
FROM customrecord_nx_asset a
INNER JOIN customrecord_sna_objects o ON a.custrecord_sna_hul_nxcassetobject = o.id
WHERE (UPPER(a.custrecord_sna_hul_fleetcode) = ? OR UPPER(a.custrecord_nx_asset_serial) = ?)
  AND a.isinactive = 'F'
```

#### Revenue Query (R-prefix Invoices - Internal Only)
```sql
SELECT t.id, t.tranid, t.trandate, tl.netamount, BUILTIN.DF(t.entity), t.memo
FROM transaction t
INNER JOIN transactionline tl ON t.id = tl.transaction
INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
WHERE t.type = 'CustInvc'
  AND t.tranid LIKE 'R%'
  AND tl.custcol_sna_object = ?
  AND tl.mainline = 'F'
  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
  AND t.trandate BETWEEN ? AND ?
```

#### Revenue Credit Query (CM-prefix with NON-internal rev stream)
```sql
SELECT t.id, t.tranid, t.trandate, tl.netamount, BUILTIN.DF(t.entity), t.memo,
       t.createdfrom, BUILTIN.DF(t.createdfrom)
FROM transaction t
INNER JOIN transactionline tl ON t.id = tl.transaction
INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
WHERE t.type = 'CustCred'
  AND t.tranid LIKE 'CM%'
  AND tl.custcol_sna_object = ?
  AND tl.mainline = 'F'
  AND NVL(rs.custrecord_sna_hul_revstreaminternal, 'F') = 'F'
  AND t.trandate BETWEEN ? AND ?
```

#### Cost Query (Non-R-prefix Invoices - Internal Only, NOT Warranty)
```sql
SELECT t.id, t.tranid, t.trandate, tl.netamount, BUILTIN.DF(rs.id), t.memo,
       CASE WHEN t.tranid LIKE 'W%' THEN 'Service'
            WHEN t.tranid LIKE 'PS%' THEN 'Parts'
            WHEN t.tranid LIKE 'T%' THEN 'Trucking'
            ELSE 'Other' END AS cost_type
FROM transaction t
INNER JOIN transactionline tl ON t.id = tl.transaction
INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
WHERE t.type IN ('CustInvc', 'CashSale')
  AND tl.custcol_sna_object = ?
  AND tl.mainline = 'F'
  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
  AND NVL(rs.custrecord_sn_for_warranty, 'F') = 'F'
  AND t.tranid NOT LIKE 'R%'
  AND t.trandate BETWEEN ? AND ?
```

#### Cost Credit Query (CM-prefix with Internal rev stream, NOT Warranty)
```sql
SELECT t.id, t.tranid, t.trandate, tl.netamount, BUILTIN.DF(rs.id), t.memo,
       t.createdfrom, BUILTIN.DF(t.createdfrom)
FROM transaction t
INNER JOIN transactionline tl ON t.id = tl.transaction
INNER JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
WHERE t.type = 'CustCred'
  AND t.tranid LIKE 'CM%'
  AND tl.custcol_sna_object = ?
  AND tl.mainline = 'F'
  AND rs.custrecord_sna_hul_revstreaminternal = 'T'
  AND NVL(rs.custrecord_sn_for_warranty, 'F') = 'F'
  AND t.trandate BETWEEN ? AND ?
```

### Script Parameters

None required for Phase 1 - all inputs via form fields.

---

## 8. Success Criteria

1. User can enter fleet code/serial and date range
2. System displays accurate rental revenue (Internal only, R-prefix)
3. System displays accurate costs (all Internal costs, non-R-prefix)
4. ROI calculation is mathematically correct
5. Transaction breakdown shows individual invoices
6. CSV export works correctly
7. Equipment age displays correctly from Year field

---

## 9. Implementation Plan

### Phase 1: Single Equipment ROI Analyzer

| Task | Description | Status |
|------|-------------|--------|
| 1. Create PRD | This document | Complete |
| 2. Create Suitelet | `hul_sl_rental_roi_analyzer.js` | Complete |
| 3. Equipment Lookup | Find equipment by fleet code/serial | Complete |
| 4. Revenue Query | ALL R-prefix invoices (no filter) | Complete |
| 5. Cost Query | All internal costs excluding rental | Complete |
| 6. ROI Calculation | Net Profit / Costs × 100 | Complete |
| 7. UI Display | Metrics grid, transaction tables | Complete |
| 8. CSV Export | Export transaction data | Complete |
| 9. First Rental Invoice | Show earliest rental date in header | Complete |
| 10. Hierarchical Revenue Stream | Full path display (e.g., "Internal : Service : Rental") | Complete |
| 11. Status Column | Transaction payment status via transactionstatus table join | Complete |
| 12. Applied To Column | Payment/credit memo links using N/search module | Complete |
| 13. Fixed Column Widths | Table columns use fixed pixel widths with horizontal scroll | Complete |
| 14. Testing | Test with CB0296, AL4413, R10064-8 | Complete |

### Phase 2: Fleet-Wide ROI Report (MapReduce)

| Task | Description | Status |
|------|-------------|--------|
| 1. Create MapReduce Script | `hul_mr_rental_roi_report.js` | Complete |
| 2. Equipment Query | All Objects with owner_status = 3 | Complete |
| 3. Aggregate ROI Queries | 4 aggregate queries per equipment | Complete |
| 4. CSV Generation | Object ID, Object Name, Fleet Code, Serial, Manufacturer, Model, Category, Location, Age, Fixed Asset, Lease Co Code, Dummy, ROI Metrics | Complete |
| 5. Email Notification | Summary stats with file link | Complete |
| 6. Deduplication Fix | ROW_NUMBER to prevent duplicate Objects | Complete |
| 7. Testing | Deploy and test with date range | Complete |

#### Phase 2 Script Parameters

| Parameter ID | Type | Required | Description |
|--------------|------|----------|-------------|
| `custscript_roi_from_date` | Date | Yes | Start date for analysis |
| `custscript_roi_to_date` | Date | Yes | End date for analysis |
| `custscript_roi_user_email` | Email | No | Recipient for completion notification |

#### Phase 2 CSV Output Columns

| Column | Description |
|--------|-------------|
| Object ID | Object internal ID |
| Object Name | Object name/identifier |
| Fleet Code | Equipment fleet code identifier |
| Serial | Serial number |
| Manufacturer | Equipment manufacturer |
| Model | Equipment model |
| Category | Equipment category (FORKLIFT, etc.) |
| Location | Responsibility center |
| Age (Years) | Current year - equipment year |
| Fixed Asset | Fixed Asset field (`custrecord_sna_fixed_asset`) |
| Lease Co Code | Lease Company Code (`custrecord_sna_hul_lease_co_code`) |
| Dummy | Rental dummy flag (`custrecord_sna_hul_rent_dummy`) |
| Rental Revenue | Sum of R-prefix invoices |
| Revenue Credits | Sum of CM credit memos |
| Net Revenue | Rental Revenue - Revenue Credits |
| Gross Costs | Sum of internal cost invoices |
| Cost Credits | Sum of internal CM credits |
| Net Costs | Gross Costs - Cost Credits |
| Net Profit/Loss | Net Revenue - Net Costs |
| ROI % | (Net Profit / Net Costs) * 100 |

#### Phase 2 Deployment

- **Script ID:** `customscript_hul_mr_rental_roi_report`
- **Deployment ID:** `customdeploy_hul_mr_rental_roi_report`
- **Status:** Not Scheduled (run on-demand)
- **Output Folder:** Sandbox: 5746560, Production: 6043632 (Inventory Reports)

#### Phase 2 Known Issues Resolved

| Issue | Resolution |
|-------|------------|
| Invalid folder reference key | Sandbox uses folder ID 5746560, Production uses 6043632 |
| Duplicate equipment rows in CSV | Multiple Assets can link to same Object; added `ROW_NUMBER() OVER (PARTITION BY o.id)` to select only one Asset per Object |

### Phase 3: Fleet Dashboard (Future)

| Task | Description | Status |
|------|-------------|--------|
| 1. Dashboard Suitelet | Visual dashboard with charts | Not Started |
| 2. Ranking/Sorting | Rank by ROI, revenue, profit | Not Started |
| 3. Category Analysis | Compare ROI by category | Not Started |
| 4. Filters | Filter by category, location, age range | Not Started |

---

## 10. Testing Requirements

### Test Scenarios

1. **Equipment with revenue and costs** - Verify ROI calculation
2. **Equipment with only revenue** - Costs = 0, ROI = undefined/infinite
3. **Equipment with only costs** - Revenue = 0, ROI = -100%
4. **Equipment with credits** - Verify credits subtract from revenue
5. **Date range filtering** - Only transactions in range included
6. **Invalid equipment search** - Graceful error message

### Test Data

- Use known rental equipment (e.g., AL2525 or similar)
- Verify amounts against NetSuite reports/searches

---

## 11. Files

### Files to Create

| File | Type | Purpose |
|------|------|---------|
| `Suitelets/hul_sl_rental_roi_analyzer.js` | Suitelet | Interactive ROI analysis (Phase 1) |
| `MapReduce/hul_mr_rental_roi_report.js` | MapReduce | Fleet-wide ROI CSV report (Phase 2) |
| `Documentation/PRDs/PRD-20251128-RentalEquipmentROIAnalyzer.md` | PRD | This document |

### Files Referenced

| File | Pattern Used |
|------|--------------|
| `hul_sl_fleet_report.js` | UI structure, metrics display |
| `hul_sl_idle_equipment_tracker.js` | Equipment identification, SuiteQL CTEs |

---

## 12. Key Design Decisions

1. **ALL R-prefix Invoices for Revenue:** Capture ALL rental invoices regardless of revenue stream - equipment may be rented to internal (United Rentals) or external customers
2. **ALL CM Credit Memos for Revenue Credits:** Any CM credit memo linked to equipment via `custcol_sna_object`
3. **INTERNAL Revenue Streams for Costs:** Non-R-prefix invoices with Internal revenue stream = Internal service/parts/trucking charges
4. **INTERNAL Revenue Streams for Cost Credits:** CM-prefix credit memos with Internal rev stream = Billing error corrections
5. **Equipment Age from Year Field:** Use `custrecord_sna_year` on Object record (not acquisition date)
6. **All Internal Costs:** Include all internal-tagged costs (W, PS, T prefixes, etc.)
7. **Simple Metrics First:** Focus on Revenue, Costs, ROI % - add utilization later if needed
8. **Phased Approach:** Single equipment first, fleet comparison in Phase 2
9. **First Rental Invoice:** Show earliest rental invoice date (independent of filters) to help users know full equipment history range
10. **Full Hierarchical Revenue Stream Path:** Display full path (e.g., "Internal : Service : Rental : Repair") using self-joins, NOT `SYS_CONNECT_BY_PATH` (not supported in SuiteQL)

---

## 13. Known Data Quality Issues

### custcol_sna_hul_fleet_no Field Mismatch

**Issue:** The transaction line field `custcol_sna_hul_fleet_no` (labeled "Fleet No." in UI) does NOT contain the Fleet Code. Instead, it contains the **Object Internal ID** (e.g., "2000066271").

**Impact:**
- Users search by Fleet Code (e.g., "CB0296")
- W invoices link via Object Internal ID in the "Fleet No." field
- This creates confusion due to field naming

**Workaround:** The ROI Analyzer uses the Object Internal ID for matching on both `custcol_sna_object` and `custcol_sna_hul_fleet_no` fields.

**Transaction Linking Summary:**
| Transaction Type | Link Field | Contains |
|-----------------|------------|----------|
| R invoices (rental) | `custcol_sna_object` | Object Internal ID |
| W invoices (service) | `custcol_sna_hul_fleet_no` | Object Internal ID |
| CM credit memos | Both fields possible | Object Internal ID |

### Transaction Status via transactionstatus Table

**Issue:** SuiteQL does not support direct access to `t.status` or `t.statusref` fields on transactions.

**Solution:** Join to the `transactionstatus` table:

```sql
SELECT t.id, t.tranid, ts.name AS status_display
FROM transaction t
LEFT JOIN transactionstatus ts ON t.status = ts.id AND ts.trantype = 'CustInvc'
WHERE t.type = 'CustInvc'
```

**Notes:**
- The `trantype` filter on the join ensures correct status mapping per transaction type
- Use 'CustInvc' for invoices, 'CustCred' for credit memos
- Status values include: "Open", "Paid In Full", "Partially Paid", etc.

### Applied Transactions via N/search Module

**Issue:** SuiteQL does not support the `appliedtotransaction` filter needed to find payments/credits applied to invoices.

**Solution:** Use N/search module instead of SuiteQL:

```javascript
var pymtSearch = search.create({
    type: search.Type.CUSTOMER_PAYMENT,
    filters: [['appliedtotransaction', 'anyof', transactionId]],
    columns: [
        search.createColumn({ name: 'tranid' }),
        search.createColumn({ name: 'internalid' })
    ]
});
```

**Notes:**
- Search CUSTOMER_PAYMENT type to find payments applied to an invoice
- Search CREDIT_MEMO type to find credit memos applied to an invoice
- For credit memos, search INVOICE type with `appliedtotransaction` to find invoices the credit was applied to
- Results include transaction ID for building hyperlinks

### SuiteQL Hierarchical Query Limitations

**Issue:** SuiteQL does NOT support Oracle's `SYS_CONNECT_BY_PATH` for building hierarchical paths.

**Solution:** Use multiple self-joins to parent records (up to 5 levels):

```sql
LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs2 ON rs.parent = rs2.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs3 ON rs2.parent = rs3.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs4 ON rs3.parent = rs4.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs5 ON rs4.parent = rs5.id

-- Build path from root to leaf using CASE:
CASE
    WHEN rs5.name IS NOT NULL THEN rs5.name || ' : ' || rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
    WHEN rs4.name IS NOT NULL THEN rs4.name || ' : ' || rs3.name || ' : ' || rs2.name || ' : ' || rs.name
    WHEN rs3.name IS NOT NULL THEN rs3.name || ' : ' || rs2.name || ' : ' || rs.name
    WHEN rs2.name IS NOT NULL THEN rs2.name || ' : ' || rs.name
    ELSE rs.name
END AS full_path
```

This pattern works for any hierarchical custom record with a `parent` field.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Nov 28, 2025 | Claude Code | 1.0 | Initial PRD |
| Nov 28, 2025 | Claude Code | 1.1 | Updated credit memo handling: CM prefix, revenue credits (non-internal), cost credits (internal) |
| Nov 28, 2025 | Claude Code | 1.2 | Fixed W invoice linking: custcol_sna_hul_fleet_no stores Object Internal ID |
| Nov 28, 2025 | Claude Code | 1.3 | Changed revenue logic to capture ALL R-prefix invoices (not just external) - equipment rented to both internal and external customers |
| Nov 28, 2025 | Claude Code | 1.4 | Added Revenue Stream column to transaction tables with full hierarchical path display using self-joins |
| Nov 28, 2025 | Claude Code | 1.5 | Added First Rental Invoice field to equipment header (independent of date filters); Documented SuiteQL hierarchical query pattern; Phase 1 complete |
| Dec 8, 2025 | Claude Code | 2.0 | Phase 2: Created MapReduce script (hul_mr_rental_roi_report.js) for fleet-wide ROI CSV report; Added parameters for date range and email notification; Outputs to Inventory Reports folder |
| Dec 8, 2025 | Claude Code | 2.1 | Fixed folder ID for sandbox (5746560) vs production (6043632); Fixed duplicate rows issue using ROW_NUMBER() to ensure one row per Object ID; Phase 2 complete and tested |
| Dec 9, 2025 | Claude Code | 2.2 | Phase 1 Suitelet: Added Status column (transaction payment status via transactionstatus table join); Added Applied To column showing payments/credit memos applied to each transaction with clickable hyperlinks (uses N/search module); Fixed table column widths using fixed pixel widths with horizontal scroll |
| Dec 9, 2025 | Claude Code | 2.3 | Phase 2 MapReduce: Added Object ID, Object Name, Fixed Asset, Lease Co Code, and Dummy columns to CSV output; Updated SQL query and column mappings |
| Dec 16, 2025 | Claude Code | 2.4 | Exclude warranty revenue streams from cost calculations; Added `NVL(rs.custrecord_sn_for_warranty, 'F') = 'F'` filter to cost queries in both Suitelet and MapReduce; Warranty repairs covered by manufacturer should not count against equipment ROI; Tested and deployed to Production |
