# PRD: Territory Sales Tracker

**PRD ID:** PRD-20250107-TerritorySalesTracker
**Created:** January 7, 2025
**Author:** Thomas Showalter / Claude Code
**Status:** Working (with workarounds)
**Related Scripts:** hul_sl_territory_sales_tracker.js, hul_lib_territory_sales_tracker.js, hul_cs_territory_sales_tracker.js

---

## 1. Introduction / Overview

**What is this feature?**
A Territory Sales Tracker Suitelet that enables sales managers to analyze customer revenue by territory with year-over-year comparison by department.

**What problem does it solve?**
- Sales managers lack visibility into customer revenue within their territories
- No easy way to compare year-over-year sales by department (Service, Parts, Rental, Sales)
- Difficult to identify which customers have Preventive Maintenance agreements
- Time-consuming to manually compile customer sales data from invoices

**Primary Goal:**
Provide a view-only tool that enables sales managers to quickly analyze customer revenue within their territories, identify top customers, and spot trends across departments.

---

## 2. Goals

1. **Territory Visibility** - See all customers assigned to a salesperson or within a geographic territory
2. **Revenue Analysis** - View revenue by department (W=Service, PS=Parts, R=Rental, S=Sales)
3. **Year-over-Year Comparison** - Compare last 3 years by department (e.g., 2024, 2025, 2026)
4. **PM Identification** - Easily identify customers with Preventive Maintenance agreements
5. **Export Capability** - Export data to CSV for further analysis

---

## 3. User Stories

1. **As a** Sales Manager, **I want to** select a salesperson and see all their customers with revenue totals **so that** I can evaluate territory performance.

2. **As a** Sales Manager, **I want to** compare 2024 vs 2025 vs 2026 revenue by department **so that** I can identify growth or decline trends.

3. **As a** Regional Director, **I want to** filter by state/county **so that** I can analyze revenue within specific geographic regions.

4. **As a** Service Manager, **I want to** see which customers have PM agreements **so that** I can target customers without agreements for sales outreach.

5. **As a** Sales Analyst, **I want to** export the data to CSV **so that** I can create custom reports and presentations.

---

## 4. Functional Requirements

### Filtering

1. The system must allow filtering by **Salesperson** to show all customers in their territory
2. The system must allow filtering by **Territory** (State, County, City, Zip) as an alternative to salesperson
3. **State AND County are REQUIRED** when filtering by salesperson (see Performance Limitation below)
4. County dropdown must cascade based on selected state

### Data Display

5. For each customer, the system must display:
   - Customer name (linked to NetSuite customer record)
   - Revenue by department for **last 3 years** (12 columns total):
     - Year-2 W $, Year-1 W $, Current Year W $ (Service)
     - Year-2 PS $, Year-1 PS $, Current Year PS $ (Parts)
     - Year-2 R $, Year-1 R $, Current Year R $ (Rental)
     - Year-2 S $, Year-1 S $, Current Year S $ (Sales/Equipment)
   - Total Revenue (all departments, all years)
   - FSA Count (Field Service Assets, linked to filtered list)
   - PM indicator (Yes/- if any PM/AN/CO project exists)

6. Revenue must be calculated as **Invoice amounts minus applied Credit Memo amounts**

7. Years must be **dynamic** (last 3 years calculated at runtime)

8. Default sort must be **Total Revenue descending** (most valuable customers first)

### Stats Summary

9. The system must display summary stats:
   - Total Customers
   - Total Revenue
   - Average Revenue per Customer
   - Percentage of customers with PM agreements

### Export

10. The system must allow exporting results to CSV file

---

## 5. Non-Goals (Out of Scope)

**This tool will NOT:**
- Modify any records (view-only)
- Create sales territories or assign salespeople
- Send notifications or alerts
- Display real-time data (uses search results at page load time)
- Handle commission calculations

---

## 6. Technical Design

### Document Type Prefixes

| Type | Prefix | Label |
|------|--------|-------|
| Service Invoice | W | Service |
| Parts Sales Invoice | PS | Parts |
| Rental Invoice | R | Rental |
| Equipment Invoice | S | Sales/Equipment |

### Data Sources

| Source | Record Type | Key Fields |
|--------|-------------|------------|
| Sales Rep Matrix | `customrecord_sna_salesrep_matrix_mapping` | customer, sales_reps, state, county, zipcode |
| Invoices | `CustInvc` | tranid (prefix), entity, amount, trandate |
| Credit Memos | `CustCred` | appliedtotransaction, amount |
| Field Service Assets | `customrecord_nx_asset` | customer, pm_project, an_project, co_project |

### API Constraints

| Field | SuiteQL | Search API | Solution |
|-------|---------|------------|----------|
| `amountremaining` | NOT_EXPOSED | Works | Use Search API |
| `appliedtotransaction` | NOT_EXPOSED | Works | Use Search API |
| Matrix `sales_reps` (multi-select) | LIKE patterns don't work | `anyof` operator works | Use Search API with `anyof` |

### Performance Strategy

- Batch customers in groups of 50 for invoice searches
- Limit to 500 customers maximum
- Use Search API `runPaged()` for all searches to handle >4000 results
- Require State + County filter to reduce matrix dataset

### Performance Limitation (CRITICAL)

**The Sales Rep Matrix has 770,000+ records.** This exceeds NetSuite's Suitelet governance limits for real-time queries without additional filtering.

**Current Workaround:**
- State AND County filters are **required** when filtering by salesperson
- This reduces the dataset enough to stay within governance limits
- Users must select State → County first, then optionally add Salesperson

**Planned Solution (MapReduce Pre-computation):**
A nightly MapReduce script will pre-compute the sales rep → customer mapping into a cache table:

```
customrecord_hul_territory_cache
├── custrecord_tc_salesrep (Employee)
├── custrecord_tc_customer_ids (Long Text - JSON array)
└── custrecord_tc_last_updated (Date/Time)
```

This will enable instant lookups without state/county filtering.

---

## 7. Technical Learnings & Gotchas

### Multi-Select Field Filtering (Sales Rep Matrix)

The `custrecord_salesrep_mapping_sales_reps` field is a multi-select that stores comma-separated IDs internally.

**What DOESN'T work:**
- SuiteQL `LIKE '%,123,%'` patterns - field format doesn't match
- SuiteQL `INSTR()` - works but hits governance limits on 770K rows
- Search API `contains` operator - throws `SSS_INVALID_SRCH_OPERATOR`

**What WORKS:**
- Search API `anyof` operator - designed for multi-select fields
```javascript
[CONFIG.MATRIX.FIELDS.salesReps, 'anyof', salesRepId]
```

### Paged Searches (>4000 Results)

`search.run().each()` throws `SSS_SEARCH_FOR_EACH_LIMIT_EXCEEDED` if results exceed 4000.

**Solution:** Use `runPaged()` for all searches:
```javascript
const pagedResults = search.runPaged({ pageSize: 1000 });
pagedResults.pageRanges.forEach(function(pageRange) {
    pagedResults.fetch({ index: pageRange.index }).data.forEach(function(result) {
        // process result
    });
});
```

### INLINEHTML Field Layout

NetSuite forms use a two-column table layout. INLINEHTML fields placed after form fields will appear in the right column only.

**Solution:** Use `OUTSIDEBELOW` layout type to span full width below form:
```javascript
resultsField.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW });
```

**DO NOT use viewport CSS tricks** like `left: 50%; margin-left: -50vw;` - they don't work reliably with NetSuite's form positioning.

### Client Script Export Functions

Button functions must be exported from the module, not attached to `window`.

**Wrong:**
```javascript
window.exportToCSV = function() { ... };
```

**Correct:**
```javascript
function exportToCSV() { ... }

return {
    pageInit: pageInit,
    exportToCSV: exportToCSV  // Must be in return object
};
```

---

## 8. File Structure

```
FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/
├── Suitelets/hul_sl_territory_sales_tracker.js       # Main Suitelet
├── Libraries/hul_lib_territory_sales_tracker.js      # Shared library
├── ClientScripts/hul_cs_territory_sales_tracker.js   # Client interactivity
└── Documentation/PRDs/PRD-20250107-TerritorySalesTracker.md
```

---

## 9. Deployment

### Script Record

| Property | Value |
|----------|-------|
| Name | HUL - Territory Sales Tracker |
| ID | `customscript_hul_sl_territory_sales_trac` |
| Script Type | Suitelet |
| Script File | hul_sl_territory_sales_tracker.js |

### Deployment Record

| Property | Value |
|----------|-------|
| ID | `customdeploy_hul_sl_territory_sales_trac` |
| Status | Released |
| Log Level | Debug |
| Audience | All Employees (or specific roles) |

---

## 10. User Interface

### Filter Section

```
Filter by Salesperson
[Salesperson: ▼ Select Employee...]

Territory Filter (State & County Required)
[State: ▼]  [County: ▼]  [City: ____]  [Zip: ____]

[Search]  [Export to CSV]
```

### Stats Section

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Total Customers │ │ Total Revenue   │ │ Avg Rev/Cust    │ │ Customers w/PM  │
│      145        │ │    $11.7M       │ │    $80.6K       │ │      22%        │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Results Table (3 Years x 4 Doc Types = 12 Revenue Columns)

| Customer | 2024 W | 2025 W | 2026 W | 2024 PS | 2025 PS | 2026 PS | 2024 R | 2025 R | 2026 R | 2024 S | 2025 S | 2026 S | Total | FSA | PM |
|----------|--------|--------|--------|---------|---------|---------|--------|--------|--------|--------|--------|--------|-------|-----|-----|
| BPB Inc | - | - | - | $716 | $3.4K | - | - | - | - | $3.6M | $1.7M | - | $5.3M | 57 | Yes |

---

## 11. Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-01-07 | Thomas Showalter / Claude Code | 1.0 | Initial version |
| 2025-01-07 | Thomas Showalter / Claude Code | 1.1 | Added State requirement workaround (770K+ matrix records); documented MapReduce plan |
| 2025-01-07 | Thomas Showalter / Claude Code | 1.2 | Added County requirement; expanded to 3 years; fixed layout (OUTSIDEBELOW); fixed paged searches; fixed CSV export; added Technical Learnings section |

---

## 12. Future Enhancements

### Priority: MapReduce Pre-computation (removes State/County requirement)
- Create `customrecord_hul_territory_cache` custom record
- Create `hul_mr_territory_cache_builder.js` MapReduce script
- Run nightly to iterate 770K+ matrix records and build cache
- Update Suitelet to query cache instead of matrix
- **Files to create:**
  - `MapReduce/hul_mr_territory_cache_builder.js`

### Other Enhancements
- Add date range filter for invoice period
- Add drill-down to see individual invoices per customer/department
- Add trending indicators (up/down arrows for YoY change)
- Add email report functionality
- Add dashboard widget for quick access
