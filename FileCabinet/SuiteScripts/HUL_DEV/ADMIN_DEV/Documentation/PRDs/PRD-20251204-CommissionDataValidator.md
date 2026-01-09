# PRD: Commission Data Validation Suitelet

**PRD ID:** PRD-20251204-CommissionDataValidator
**Created:** December 4, 2025
**Last Updated:** December 10, 2025
**Author:** Thomas Showalter / Claude
**Status:** Ready for Production Deployment
**Related Scripts:**
- hul_sl_commission_validator.js (Suitelet)
- hul_mr_commission_export.js (Map/Reduce for Full Export)

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet-based data validation tool that displays transaction line items to verify commission-related fields are properly populated. Users can filter by date range and document prefix, visually compare assigned sales reps against the Sales Rep Matrix rules, identify mismatches, and export results for review.

**What problem does it solve?**
- Commission fields on transaction lines are sometimes missing or incorrect
- Incomplete data prevents accurate commission reporting
- No easy way to audit commission assignments across many transactions
- Manual verification against the Sales Rep Matrix is time-consuming
- Issues found after invoicing are harder to correct than catching them on Sales Orders

**Primary Goal:**
Ensure commission data integrity by providing a visual audit tool that validates transaction lines against the Sales Rep Matrix and highlights discrepancies before they impact reporting.

---

## 2. Current Status

### Implementation Progress

| Feature | Status | Notes |
|---------|--------|-------|
| Basic Suitelet UI | ✅ Complete | Form with filters and results display |
| Date Range Filter | ✅ Complete | From/To date pickers |
| Document Prefix Filter | ✅ Complete | S, PS, W, R, MC options |
| Transaction Type Filter | ✅ Complete | Sales Orders, Invoices, Credit Memos |
| Show Only Issues Filter | ✅ Complete | Checkbox filter |
| Exclude Internal Revenue Streams | ✅ Complete | Checkbox filter |
| Exclude Override Lines | ✅ Complete | Checkbox filter |
| Eligible for Commission Filter | ✅ Complete | Dropdown (All/Yes/No) |
| Equipment Category Filter | ✅ Complete | Individual categories + "All EXCEPT Rail Movers" |
| Transaction Line Query | ✅ Complete | SuiteQL with all joins, 5000 row limit |
| Matrix Loading - Customer | ✅ Complete | Batched queries with pagination |
| Matrix Loading - Zip | ✅ Complete | Batched queries with pagination |
| Matrix Matching Logic | ✅ Complete | Customer+Zip priority matching |
| Parts Default to FORKLIFT | ✅ Complete | For External:Parts without equip category |
| Trackmobile Default to RAIL MOVERS | ✅ Complete | Item category 4600 detection |
| Results Table Display | ✅ Complete | Color-coded rows with all columns |
| Summary Statistics | ✅ Complete | Match, Override, Mismatch, Missing Rep, Missing Plan, No Matrix |
| CSV Export (Displayed) | ✅ Complete | All columns including new fields |
| Full Export (Map/Reduce) | ✅ Complete | Unlimited rows via background processing |
| No Match Reason Display | ✅ Complete | Customer NA, Zip NA, Category/Stream NA |

### Script Deployment

#### Suitelet (Main UI)
**Script Record:**
- Name: HUL - Commission Data Validator
- Script ID: `customscript_hul_sl_commission_validator`
- Type: Suitelet

**Deployment:**
- Title: HUL Commission Validator
- Deployment ID: `customdeploy_hul_commission_validator`
- Status: Testing

#### Map/Reduce (Full Export)
**Script Record:**
- Name: HUL - Commission Export MR
- Script ID: `customscript_hul_mr_commission_export`
- Type: Map/Reduce
- File: `MapReduce/hul_mr_commission_export.js`

**Deployment:**
- Title: HUL Commission Export
- Deployment ID: `customdeploy_hul_mr_commission_export`
- Status: Not Scheduled (triggered on demand)
- Log Level: DEBUG

**Script Parameters:**
| Parameter ID | Type | Label | Values |
|-------------|------|-------|--------|
| custscript_comm_export_from_date | DATE | From Date | Date picker (e.g., 09/01/2025) |
| custscript_comm_export_to_date | DATE | To Date | Date picker (e.g., 09/30/2025) |
| custscript_comm_export_prefix | TEXT | Document Prefix | W, R, S, PS, MC (just the letter, not "W%") |
| custscript_comm_export_tran_type | TEXT | Transaction Type | Invoice, Sales Order, Credit Memo |
| custscript_comm_export_exclude_internal | TEXT | Exclude Internal | "T" to exclude, leave BLANK to include |
| custscript_comm_export_exclude_override | TEXT | Exclude Override | "T" to exclude, leave BLANK to include |
| custscript_comm_export_eligible_comm | TEXT | Eligible for Commission | T=only eligible, F=only non-eligible, BLANK=all |
| custscript_comm_export_equip_category | TEXT | Equipment Category | Text name: FORKLIFT, RAIL MOVERS, etc. |
| custscript_comm_export_user_email | EMAIL | User Email for Notification | Email address for completion notification |

**Output Location:**
- Production Folder ID: `6043632` (Inventory Reports)
- Sandbox Folder ID: `5746560` (Inventory Reports)

---

## 3. Technical Implementation Details

### Database Schema Discoveries

#### Shipping Address Access
- **NOT** available via `t.shipzip` directly
- **Solution:** Join `transactionShippingAddress` table via `t.shippingaddress = tsa.nkey`
- Field: `tsa.zip AS shipzip`

#### Revenue Stream Hierarchy
- Can be up to 5 levels deep: Great-Great-Grandparent > Great-Grandparent > Grandparent > Parent > Child
- Example: External(1) > Service(5) > Planned Maintenance(108) > Flat Rate CPM(203) > (PM)(263)
- Display format: "TopLevel : SecondLevel" (e.g., "External : Service", "External : Parts")
- **Matrix stores Level 2 IDs** (direct children of External/Internal): Service(5), Rental(6), Parts(7), New Equipment(8), Used Equipment(3), etc.
- Requires multiple self-joins on `customrecord_cseg_sna_revenue_st`
- `getMatrixRevenueStreamId()` function walks the hierarchy to find the Level 2 ID regardless of how deep the line's revenue stream is

#### Equipment Category Hierarchy
- Uses parent hierarchy similar to revenue stream
- Top-level categories: FORKLIFT, AERIAL, CONSTRUCTION, RAIL MOVERS, ALLIED, etc.
- Requires self-joins on `customrecord_cseg_sna_hul_eq_seg`

#### Item Category
- Field: `custitem_sna_hul_itemcategory` on item record
- Is a Custom List (not Custom Record) - use `BUILTIN.DF()` to get display value
- Example values: "4600 - Trackmobile", "5400 - NiftyLift", etc.

#### Internal Revenue Stream Flag
- Field: `custrecord_sna_hul_revstreaminternal` on revenue stream record
- Value 'T' indicates internal (should typically be excluded from commission)

### Matrix Matching Logic

#### Priority Order
1. **Customer-specific match** (highest priority)
   - Must match: Customer ID + Zip Code + Equipment Category + Revenue Stream
   - Manufacturer used as tiebreaker only
2. **Geographic (Zip-based) match**
   - Only loads records where `custrecord_salesrep_mapping_customer IS NULL`
   - Must match: Zip Code + Equipment Category + Revenue Stream

#### Special Handling for Parts Lines
When line has "External : Parts" revenue stream but NO equipment category:
- If Item Category contains "4600" or "Trackmobile" → Default to **RAIL MOVERS**
- Otherwise → Default to **FORKLIFT**

#### No Match Reasons
| Reason | Meaning |
|--------|---------|
| Customer NA, Zip NA | No customer-specific matrix AND no generic zip matrix |
| Customer zip NA, Zip NA | Customer has matrix records but not for this zip, AND no generic zip records |
| Customer zip NA | Customer has matrix records but none for this specific zip |
| Category/Stream NA | Matrix records exist for this zip but no match on equipment category or revenue stream |
| No criteria match | Had matrix data but nothing matched all criteria |

### Query Optimizations

#### Governance Management
- Customer query: Batch size 25, pagination 5000 rows, safety limit 50,000
- Zip query: Batch size 25, pagination 5000 rows, safety limit 25,000
- Transaction query: Currently limited to 2000 rows (needs removal for full month testing)

#### SuiteQL Pagination Syntax
```sql
ORDER BY m.id OFFSET {offset} ROWS FETCH NEXT {page_size} ROWS ONLY
```

### Display Columns

| Column | Source | Notes |
|--------|--------|-------|
| Doc # | t.tranid | Link to transaction |
| Date | t.trandate | Formatted MM/DD/YYYY |
| Type | t.type | SO, INV, CM |
| Ln | tl.linesequencenumber | Line number |
| Customer ID | t.entity | Internal ID |
| Customer # | c.entityid | External customer number |
| Customer Name | c.companyname | Company name |
| Item | i.itemid | Item name/number |
| Item Category | BUILTIN.DF(i.custitem_sna_hul_itemcategory) | Custom list display value |
| Zip | tsa.zip | Shipping address zip |
| Equip Category | Top-level parent name | Formatted from hierarchy |
| Revenue Stream | "TopLevel : SecondLevel" | Formatted from hierarchy |
| Manufacturer | mfg.name | Manufacturer name |
| Status | Validation result | Color-coded badge |
| Override | tl.custcol_sna_override_commission | Yes/No |
| Eligible | tl.custcol_sna_hul_eligible_for_comm | Yes/No |
| Sales Rep | e.entityid | Assigned rep name |
| Expected Rep | Matrix lookup | Expected rep(s) from matrix |
| Expected Matrix | Matrix record | Link or reason for no match |
| Amount | tl.netamount | Line amount |

### Status Color Coding

| Status | Color | Hex | Meaning |
|--------|-------|-----|---------|
| Match | Green | #d4edda | Rep matches matrix expectation |
| Override | Yellow | #fff3cd | Override flag set |
| Mismatch | Orange | #ffe5d0 | Assigned rep differs from matrix |
| Missing Rep | Red | #f8d7da | Sales rep field is empty |
| Missing Plan | Pink | #f5c6cb | Commission plan missing (eligible line) |
| No Matrix | Gray | #e9ecef | No matrix record found |

---

## 4. Known Issues & Resolutions

### Resolved Issues

| Issue | Resolution |
|-------|------------|
| `SSS_MISSING_REQD_ARGUMENT` sendRedirect | Changed to `redirect.redirect({ url: redirectUrl })` |
| `INVALID_SEARCH_TYPE` customrecord_sna_commission_plan | Changed to `customrecord_sna_hul_csm_comm_plan` |
| shipzip NOT_EXPOSED | Use `transactionShippingAddress` join with `tsa.nkey` |
| Revenue stream showing child instead of parent | Added great-great-grandparent joins, updated formatting function |
| Matrix not finding records (5000 limit) | Added pagination within batched queries |
| Wrong zip match for customer matrix | Added zip code filtering to customer match logic |
| "Zip NA" when Category/Stream doesn't match | Updated no-match reason logic to show "Category/Stream NA" |
| Item category join error (custom list) | Use `BUILTIN.DF()` instead of table join |
| Revenue stream matching at wrong hierarchy level | Transaction lines with deep revenue streams (e.g., "Flat Rate CPM" at level 4) weren't matching matrix records storing Level 2 (e.g., "Service"). Fixed `getMatrixRevenueStreamId()` to walk hierarchy and find Level 2 ID (child of External/Internal) regardless of depth |
| CSV Export missing filter parameters | Export CSV URL only passed 4 parameters (dates, prefix, tran type), missing exclude internal, exclude override, eligible for commission, equipment category, and issues only filters. Fixed `buildStatsHtml()` to include all filter parameters in export URL |
| CSV Export not applying "Show Only Issues" filter | Export was returning all rows even when "Show Only Issues" was checked. Fixed `exportToCSV()` to filter out MATCH and OVERRIDE status lines when checkbox is set |
| M/R: 0 lines processed | Date format mismatch - dates passed as Date objects but query expected 'MM/DD/YYYY'. Added `formatDateForQuery()` function |
| M/R: Transaction type not matching | 'Invoice' needed to be converted to 'CustInvc'. Added `tranTypeMap` for display name conversion |
| M/R: Data columns empty | SuiteQL returns `{types: [], values: []}` format in M/R, not mapped objects. Added `COLUMN_NAMES` array and manual mapping |
| M/R: Governance timeout in reduce | Processing all lines in single reduce exceeded limits. Restructured to process validation in map phase |
| M/R: 30 minute runtime | Per-line matrix queries too slow (~60K queries). Implemented lazy-loading cache strategy |
| M/R: SSS_USAGE_LIMIT_EXCEEDED in getInputData | Loading ALL matrix data at once exceeded governance. Moved to on-demand per-customer/zip loading with caching in map phase |
| M/R: Zip codes with hyphens not matching | "55117-4619" wasn't matching "55117". Fixed by using `split('-')[0].substring(0, 5)` |

### Current Limitations

1. **Suitelet Display Limit:** 5000 rows for quick preview (use Full Export for more)
2. **Full Export required for large datasets:** Use "Full Export (All Results)" button to trigger Map/Reduce for unlimited rows
3. **Matrix data volume:** 136,742+ matrix records require careful batching

---

## 5. Filter Reference

| Filter | Field ID | Type | Options |
|--------|----------|------|---------|
| From Date | custpage_from_date | DATE | Default: First of current month |
| To Date | custpage_to_date | DATE | Default: Today |
| Document Prefix | custpage_prefix | SELECT | All, S, PS, W, R, MC |
| Transaction Type | custpage_tran_type | SELECT | All, SalesOrd, CustInvc, CustCred |
| Show Only Issues | custpage_issues_only | CHECKBOX | Filters to non-Match status |
| Exclude Internal | custpage_exclude_internal | CHECKBOX | Excludes internal revenue streams |
| Exclude Override | custpage_exclude_override | CHECKBOX | Excludes override lines |
| Eligible for Commission | custpage_eligible_comm | SELECT | All, T (Yes), F (No) |
| Equipment Category | custpage_equip_category | SELECT | All, FORKLIFT, AERIAL, CONSTRUCTION, RAIL MOVERS, ALLIED, EXCLUDE_RAIL |

**Equipment Category Options:**
- `-- All --`: No filter applied
- `FORKLIFT`, `AERIAL`, `CONSTRUCTION`, `RAIL MOVERS`, `ALLIED`: Filter to specific top-level category
- `All EXCEPT Rail Movers`: Excludes RAIL MOVERS from results (commonly used for standard commission processing)

---

## 6. File Reference

### Main Script
**Path:** `/SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/hul_sl_commission_validator.js`

### Key Functions

| Function | Line | Purpose |
|----------|------|---------|
| `onRequest` | ~70 | Entry point - routes GET/POST |
| `handleGet` | ~80 | Displays form and results |
| `handlePost` | ~150 | Handles form submission, redirects |
| `addFormFields` | ~220 | Creates filter form fields |
| `loadMatrixDataForZips` | ~325 | Loads matrix data for customers and zips |
| `queryMatrixByCustomers` | ~390 | Queries customer-specific matrix records |
| `queryMatrixByZips` | ~450 | Queries zip-based (non-customer) matrix records |
| `queryTransactionLines` | ~590 | Main transaction line query |
| `validateLines` | ~710 | Applies matrix matching to all lines |
| `validateLine` | ~720 | Validates single line against matrix |
| `findMatrixMatch` | ~780 | Finds best matrix match for a line |
| `findBestMatchWithPartsDefault` | ~850 | Matching with FORKLIFT/RAIL MOVERS defaults |
| `findBestMatch` | ~900 | Standard equip/revenue stream matching |
| `formatRevenueStream` | ~960 | Formats "TopLevel : SecondLevel" display |
| `formatEquipCategory` | ~1000 | Gets top-level equipment category name |
| `buildResultsHtml` | ~1130 | Builds HTML results table |

---

## 7. Testing Checklist

### Functional Tests
- [x] Date range filter works
- [x] Document prefix filter works
- [x] Transaction type filter works
- [x] Show only issues filter works
- [x] Exclude internal revenue streams filter works
- [x] Exclude override lines filter works
- [x] Eligible for commission filter works
- [x] Customer-specific matrix matching works
- [x] Zip-based matrix matching works
- [x] Parts default to FORKLIFT works
- [x] Trackmobile default to RAIL MOVERS works
- [x] CSV export includes all columns
- [x] Links to transactions work
- [x] Links to matrix records work

### Performance Tests
- [x] Full month date range (~22,000 lines processed in ~6 minutes via Map/Reduce)
- [x] Large customer with many matrix records
- [x] High volume of unique zip codes

### Edge Cases
- [x] Line with no equipment category (Parts default)
- [x] Line with Trackmobile item category (RAIL MOVERS default)
- [x] Customer with matrix records but not for line's zip
- [x] Zip exists in matrix but category/stream doesn't match
- [x] No customer matrix and no zip matrix

---

## 8. Architecture: Hybrid Suitelet + Map/Reduce

### Why Two Scripts?

The Commission Data Validator uses a hybrid approach to balance user experience with technical limitations:

| Approach | Governance Limit | Use Case |
|----------|-----------------|----------|
| Suitelet | 1,000 units | Quick preview, interactive filtering, up to 5,000 lines |
| Map/Reduce | 10,000 units | Full export, unlimited lines, background processing |

### User Workflow

1. **Quick Preview (Suitelet):**
   - User sets filters and clicks "Run Report"
   - Displays up to 5,000 lines immediately
   - Can use "Export CSV" for these displayed results
   - Fast feedback loop for refining filters

2. **Full Export (Map/Reduce):**
   - User sets filters and clicks "Full Export (All Results)"
   - Background task processes ALL matching lines (no limit)
   - CSV saved to File Cabinet: `/SuiteScripts/Commission_Exports/`
   - Email notification with download link sent to user

### Map/Reduce Processing Flow

```
getInputData() → Returns SuiteQL query with filters
     ↓
   map()       → Passes each line through (key = transaction_id)
     ↓
  reduce()     → Loads matrix data, validates line, emits CSV row
     ↓
 summarize()   → Concatenates all rows, saves file, sends email
```

### File Cabinet Location
- **Production:** Folder ID `6043632` (Inventory Reports)
- **Sandbox:** Folder ID `5746560` (Inventory Reports)
- Filename format: `commission_export_YYYYMMDD_HHMMSS.csv`

## 9. Production Deployment Checklist

### Step 1: Upload Script Files
1. Go to **Documents > Files > File Cabinet**
2. Navigate to scripts folder
3. Upload both files:
   - `Suitelets/hul_sl_commission_validator.js`
   - `MapReduce/hul_mr_commission_export.js`

### Step 2: Create Script Records

**Suitelet:**
1. **Customization > Scripting > Scripts > New**
2. Select `hul_sl_commission_validator.js`
3. Name: `HUL - Commission Data Validator`
4. ID: `customscript_hul_commission_validator`

**MapReduce:**
1. **Customization > Scripting > Scripts > New**
2. Select `hul_mr_commission_export.js`
3. Name: `HUL - Commission Export MR`
4. ID: `customscript_hul_mr_commission_export`
5. Create all parameters listed in Section 2 (Script Parameters table)

### Step 3: Create Deployments

**Suitelet Deployment:**
- Title: `HUL Commission Validator`
- ID: `customdeploy_hul_commission_validator`
- Status: `Released`
- Execute As Role: `Administrator`
- Log Level: `Debug`

**MapReduce Deployment:**
- Title: `HUL Commission Export`
- ID: `customdeploy_hul_mr_commission_export`
- Status: `Not Scheduled`
- Execute As Role: `Administrator`
- Concurrency Limit: `1`
- Submit All Stages At Once: ✓
- Yield After Minutes: `60`
- Buffer Size: `1`

### Step 4: Verify Output Folder
Confirm Inventory Reports folder exists with ID `6043632`

## 10. Future Enhancements (Phase 2)
- Inline editing of sales rep field
- Bulk "Apply Matrix Suggestion" action
- Audit logging for changes
- Remember last-used filter settings

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-12-04 | Thomas Showalter / Claude | 1.0 | Initial draft |
| 2025-12-05 | Thomas Showalter / Claude | 2.0 | Complete implementation details, resolved issues, current status |
| 2025-12-05 | Thomas Showalter / Claude | 3.0 | Added Map/Reduce for Full Export, Equipment Category filter, hybrid architecture |
| 2025-12-08 | Thomas Showalter / Claude | 4.0 | Production-ready: Fixed M/R date format, transaction type mapping, SuiteQL data format handling, governance optimizations with lazy-loading cache, zip code normalization for hyphenated formats, added R (Rental) prefix option, comprehensive parameter documentation, production folder ID (6043632), deployment checklist |
| 2025-12-10 | Thomas Showalter / Claude | 4.1 | Fixed revenue stream hierarchy matching: Matrix stores Level 2 IDs (Service, Parts, Rental, etc.) but transaction lines can be 4-5 levels deep. Updated `getMatrixRevenueStreamId()` to walk the hierarchy and find the Level 2 ID (direct child of External/Internal) regardless of depth. This fixes "Category/Stream NA" errors for deep revenue streams like "External : Service : Planned Maintenance : Flat Rate (CPM)". Applied same fix to MapReduce script. |
| 2025-12-10 | Thomas Showalter / Claude | 4.2 | Fixed CSV Export: (1) Export URL was missing 5 filter parameters (exclude internal, exclude override, eligible for commission, equipment category, issues only) causing export to return more rows than displayed. (2) Export now applies "Show Only Issues" filter when checkbox is set. Export row count now matches display row count. |

---

## Appendix A: SuiteQL Transaction Query

```sql
SELECT
    t.id AS transaction_id,
    t.tranid AS doc_number,
    t.trandate,
    t.type AS tran_type,
    t.entity AS customer_id,
    c.entityid AS customer_number,
    c.companyname AS customer_name,
    tsa.zip AS shipzip,
    tl.linesequencenumber AS line_num,
    tl.item AS item_id,
    i.itemid AS item_name,
    BUILTIN.DF(i.custitem_sna_hul_itemcategory) AS item_category_name,
    tl.netamount,
    tl.cseg_sna_hul_eq_seg AS equip_category_id,
    eq.name AS equip_category_name,
    eq.parent AS equip_category_parent_id,
    eq_parent.name AS equip_category_parent_name,
    eq_parent.parent AS equip_category_grandparent_id,
    eq_grandparent.name AS equip_category_grandparent_name,
    tl.cseg_sna_revenue_st AS revenue_stream_id,
    rs.name AS revenue_stream_name,
    rs.parent AS revenue_stream_parent_id,
    rs_parent.name AS revenue_stream_parent_name,
    rs_parent.parent AS revenue_stream_grandparent_id,
    rs_grandparent.name AS revenue_stream_grandparent_name,
    rs_grandparent.parent AS revenue_stream_greatgrandparent_id,
    rs_greatgrandparent.name AS revenue_stream_greatgrandparent_name,
    rs_greatgrandparent.parent AS revenue_stream_greatgreatgrandparent_id,
    rs_greatgreatgrandparent.name AS revenue_stream_greatgreatgrandparent_name,
    rs.custrecord_sna_hul_revstreaminternal AS revenue_stream_internal,
    tl.cseg_hul_mfg AS manufacturer_id,
    mfg.name AS manufacturer_name,
    tl.custcol_sna_sales_rep AS sales_rep_id,
    e.entityid AS sales_rep_name,
    tl.custcol_sna_sales_rep_matrix AS matrix_id,
    tl.custcol_sna_commission_plan AS commission_plan_id,
    cp.name AS commission_plan_name,
    tl.custcol_sna_hul_eligible_for_comm AS eligible_for_comm,
    tl.custcol_sna_override_commission AS override_flag
FROM transaction t
INNER JOIN transactionline tl ON t.id = tl.transaction
LEFT JOIN customer c ON t.entity = c.id
LEFT JOIN item i ON tl.item = i.id
LEFT JOIN employee e ON tl.custcol_sna_sales_rep = e.id
LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON tl.cseg_sna_hul_eq_seg = eq.id
LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq_parent ON eq.parent = eq_parent.id
LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq_grandparent ON eq_parent.parent = eq_grandparent.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs_parent ON rs.parent = rs_parent.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs_grandparent ON rs_parent.parent = rs_grandparent.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs_greatgrandparent ON rs_grandparent.parent = rs_greatgrandparent.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs_greatgreatgrandparent ON rs_greatgrandparent.parent = rs_greatgreatgrandparent.id
LEFT JOIN customrecord_cseg_hul_mfg mfg ON tl.cseg_hul_mfg = mfg.id
LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON tl.custcol_sna_commission_plan = cp.id
LEFT JOIN transactionShippingAddress tsa ON t.shippingaddress = tsa.nkey
WHERE t.type IN ('SalesOrd', 'CustInvc', 'CustCred')
  AND tl.mainline = 'F'
  AND tl.taxline = 'F'
  AND t.trandate >= TO_DATE('MM/DD/YYYY', 'MM/DD/YYYY')
  AND t.trandate <= TO_DATE('MM/DD/YYYY', 'MM/DD/YYYY')
  AND tl.item IS NOT NULL
ORDER BY t.trandate DESC, t.tranid, tl.linesequencenumber
```

## Appendix B: Matrix Query

```sql
SELECT
    m.id,
    m.name,
    m.custrecord_salesrep_mapping_zipcode AS zip_code,
    m.custrecord_salesrep_mapping_equipment AS equip_category_id,
    eq.name AS equip_category_name,
    m.custrecord_salesrep_mapping_rev_stream AS revenue_stream_id,
    rs.name AS revenue_stream_name,
    m.custrecord_salesrep_mapping_manufacturer AS manufacturer_id,
    mfg.name AS manufacturer_name,
    m.custrecord_salesrep_mapping_sales_reps AS sales_rep_ids,
    m.custrecord_salesrep_mapping_customer AS customer_id,
    cust.companyname AS customer_name,
    m.custrecord_sna_hul_sales_rep_comm_plan_2 AS commission_plan_id,
    cp.name AS commission_plan_name
FROM customrecord_sna_salesrep_matrix_mapping m
LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON m.custrecord_salesrep_mapping_equipment = eq.id
LEFT JOIN customrecord_cseg_sna_revenue_st rs ON m.custrecord_salesrep_mapping_rev_stream = rs.id
LEFT JOIN customrecord_cseg_hul_mfg mfg ON m.custrecord_salesrep_mapping_manufacturer = mfg.id
LEFT JOIN customer cust ON m.custrecord_salesrep_mapping_customer = cust.id
LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON m.custrecord_sna_hul_sales_rep_comm_plan_2 = cp.id
WHERE m.isinactive = 'F'
  AND m.custrecord_salesrep_mapping_customer IN (customer_ids)  -- For customer query
  -- OR
  AND m.custrecord_salesrep_mapping_zipcode IN (zip_codes)      -- For zip query
  AND m.custrecord_salesrep_mapping_customer IS NULL            -- Only for zip query
ORDER BY m.id
```
