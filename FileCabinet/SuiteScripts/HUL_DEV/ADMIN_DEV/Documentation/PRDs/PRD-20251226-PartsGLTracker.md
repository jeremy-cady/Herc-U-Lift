# PRD: Parts G/L Tracker

**PRD ID:** PRD-20251226-PartsGLTracker
**Created:** December 26, 2025
**Author:** Thomas Showalter / Claude Code
**Status:** In Development (Core Features Complete)
**Related Scripts:** hul_lib_parts_gl_tracker.js, hul_sl_parts_gl_tracker.js, hul_cs_parts_gl_tracker.js, hul_rl_serial_costs.js, hul_ue_so_gl_tracker_button.js

---

## 1. Introduction / Overview

**What is this feature?**
A comprehensive Parts G/L Tracker that provides 100% audit trail visibility for parts items as they move through the WIP (Work In Progress) accounting process in NetSuite.

**What problem does it solve?**
Currently, users cannot easily trace individual parts through the complex accounting lifecycle. When Return Authorizations occur before invoicing, the standard NetSuite GL behavior incorrectly credits COGS instead of Parts WIP, causing balance sheet/income statement discrepancies. Users have no visibility into which items are affected or how to identify irregularities.

**Data Model Limitation - Important:**
For **average cost items** purchased in bulk, once they enter inventory, they become fungible. There's no way to trace "this specific unit on SO-123 came from PO-456" because NetSuite averages the cost across all units. The MVP focuses on **forward tracking from Sales Order** - which is where the WIP/COGS matching problem occurs. Procurement source is only shown when:
- A PO was created specifically FOR the SO (special order/drop ship with `createdfrom` link)
- The item is **Lot or Serialized** (maintains identity through the system)
- Otherwise: displays "Procurement Unknown"

**Primary Goal:**
Provide users with a visual tool to track any part item **forward from the Sales Order** through every transaction and G/L account it touches, enabling quick identification of items that have deviated from the expected accounting path.

---

## 2. Goals

1. **100% Audit Trail Visibility** - Every part item can be traced from purchase to final COGS recognition with full G/L account movements
2. **Status-at-a-Glance** - Color-coded status badges instantly show which items are Complete, In WIP, or have Issues
3. **Reduce Investigation Time** - What currently takes hours of manual research should take seconds with drill-down capability
4. **Enable Proactive Monitoring** - (Future) Automatically detect irregularities before they cause financial statement issues

---

## 3. User Stories

1. **As a** Controller, **I want to** view a Sales Order and see the G/L status of every line item **so that** I can quickly identify which items haven't completed the full accounting cycle.

2. **As a** Parts Manager, **I want to** drill into a specific item and see its complete transaction history with amounts **so that** I can understand exactly where the cost sits in our G/L.

3. **As a** CFO, **I want to** verify that revenues and costs are properly matched in the same period **so that** our financial statements accurately reflect our business performance.

4. **As an** Accountant, **I want to** identify Return Authorization items that were returned before invoicing **so that** I can flag them for correcting journal entries.

5. **As a** Service Manager, **I want to** click a button on a Sales Order to see the parts tracking status **so that** I can quickly answer customer or accounting questions.

---

## 4. Functional Requirements

### Core Functionality (MVP)

1. The system must allow users to enter a Sales Order number and view all line items with their current G/L status
2. The system must display color-coded status badges for each line: Green (Complete), Yellow (In WIP), Red (Issue), Gray (Pending)
3. The system must provide drill-down capability from any line item to a detailed G/L activity view
4. The system must show the **forward transaction chain** from SO: Item Fulfillment → WIP JE → Invoice → COGS JE → (optional) RA/CM
5. The system must show **procurement source** (PO → IR) when:
   - PO was created FOR this SO (special order/drop ship)
   - Item is Lot/Serialized (traceable via inventory detail)
   - Otherwise: Display "N/A" - procurement cannot be determined for average cost bulk items
6. The system must display full G/L account activity with debit/credit amounts and running balances
7. The system must provide clickable links to all related NetSuite records
8. The system must add a "Track Parts G/L" button to Service Sales Order records (forms 112, 113, 106, 153)
9. The system must support filtering by date range (default 30 days), customer, subsidiary, and status

### Status Determination Logic

A line item status is determined as follows:
- **Complete (Green)**: Item is fulfilled, invoiced, and has both WIP JE and COGS JE
- **In WIP (Yellow)**: Item is fulfilled but not yet invoiced (amount sits in Parts WIP account)
- **Issue (Red)**: Any of the following:
  - Return Authorization exists before Invoice was created
  - Fulfillment exists but no WIP JE found
  - WIP/COGS amounts don't reconcile
- **Pending (Gray)**: Item has not been fulfilled yet

### Acceptance Criteria

- [ ] User can enter SO number and see all line items with status badges within 3 seconds
- [ ] User can drill into any item and see complete G/L trail
- [ ] All transaction links open correct records in new tabs
- [ ] Button appears on all valid Service SO forms in VIEW mode
- [ ] Filter panel correctly narrows results
- [ ] Tab navigation between Overview and Deep-Dive works correctly

---

## 5. Non-Goals (Out of Scope) - MVP

**This MVP will NOT:**

- Automatically create correcting Journal Entries (view-only)
- Send email alerts for detected irregularities (Future Phase)
- Store irregularity records in a custom record (Future Phase)
- Provide trend analysis or aging reports (Future Phase)
- Fix the underlying GL Plugin issue for Return Authorizations (separate development effort)
- Process historical data beyond current period (performance constraint)
- Track procurement source for average cost items purchased in bulk (data model limitation)
- Support entry points other than Sales Order (Future Phase A: Flexible Entry Points)
- Track bidirectionally (e.g., from RA back to SO) - MVP tracks forward from SO only

---

## 6. Design Considerations

### User Interface

**Tab 1: Sales Order Overview**
- Header with SO details (number, customer, date, status)
- Summary stats bar: Total Lines | In WIP | Complete | Issues
- Filter field group: SO Number, Customer, Date Range, Subsidiary, Status
- Sublist with columns: Line | Item | Qty | PO# | IR# | IF# | IF Date | Invoice# | Inv Date | WIP JE | COGS JE | RA# | Status | Drill-Down
- **Procurement column logic:**
  - If PO linked via `createdfrom` or special order → Show PO# and IR#
  - If Lot/Serial item → Query inventory detail to find source PO
  - Otherwise → Display "N/A" (average cost, no direct link)

**Tab 2: Item G/L Deep-Dive** (Redesigned v1.6 - With G/L Account Entries)
- **Single-column layout** - All sections stacked vertically for clear reading
- **Section 1: Item G/L Deep-Dive Header**
  - SO link, Line #, Item name, Serial/Lot (if applicable), Quantity
  - Status badge with issues displayed below if any
- **Section 2: Transaction Timeline** (numbered progression with G/L entries)
  - **Step 1: Sales Order** (purple) - "Non-posting transaction (no G/L impact)"
  - **Step 2: Item Fulfillment** (green) - G/L Impact:
    - Standard NS posting: 📗 Cr 13235 Inventory → 📕 Dr 54030 COGS
    - GL Plugin Reclass: 📗 Cr 54030 COGS → 📕 Dr 13840 Parts WIP
  - **Step 3: Invoice** (blue) - G/L Impact (Line Revenue):
    - 📗 Cr 44030 Parts Sales (line amount)
    - Note: A/R debit is aggregated across all invoice lines
  - **Step 4: COGS Journal Entry** (green/red) - G/L Impact:
    - 📗 Cr 13840 Parts WIP → 📕 Dr 54030 COGS
  - **Optional: Return Authorization** (red) - Shows all G/L posting lines
  - **Optional: Credit Memo** (red) - Shows all G/L posting lines
  - Pending steps shown in gray if workflow incomplete
  - **Verification badges**: ✓ Verified, ⚠ Mismatch, or "Pending verification"
- **Section 3: Related Records** - Grid of clickable record cards
- **Section 4: Financial Summary** - Table showing IF$, Invoice Revenue, COGS JE$, Margin
- **Procurement Note** - Warning box for average cost items
- **Data Accuracy**: Uses same `getSOTrackingData()` as summary page for consistent orderline matching

**G/L Entry Display Format:**
```
📗 Cr 13235 Inventory - Parts Inventory    $7.11
📕 Dr 54030 COGS - Parts                   $7.11
```

### User Experience

- Status colors match existing dashboard patterns (Green=#28a745, Yellow=#ffc107, Red=#dc3545, Gray=#6c757d)
- Drill-down maintains context (back button returns to previous view)
- All monetary values formatted as currency
- Dates formatted consistently (MM/DD/YY)

### Design References

- Follow patterns from: `hul_sl_customer_health_dashboard.js` (filters, INLINEHTML, stats)
- Use existing color scheme from: `hul_sl_rental_roi_analyzer.js`
- Timeline visualization inspired by: `hul_sl_technician_timeline.js`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (SalesOrd)
- Item Fulfillment (ItemShip)
- Invoice (CustInvc)
- Journal Entry (Journal)
- Purchase Order (PurchOrd)
- Item Receipt (ItemRcpt)
- Return Authorization (RtnAuth)

**Script Types:**
- [x] Suitelet - Main tracking UI with tabs
- [x] Client Script - Tab navigation, drill-down, filter interaction
- [x] User Event - Add button to Sales Order records
- [ ] Map/Reduce - Future: Irregularity detection
- [ ] Scheduled Script - Future: Email alerts

**Existing Custom Fields Used:**
| Field ID | Record | Purpose |
|----------|--------|---------|
| `custbody_sna_hul_je_wip` | Item Fulfillment | Links IF to WIP JE(s) |
| `custbody_sna_hul_inv_wip` | Journal Entry | Links JE to Invoice |
| `custbody_sna_hul_so_wip` | Journal Entry | Links JE to Sales Order |
| `custscript_sna_hul_gl_wip_account` | User Preference | WIP Account ID |

**Valid SO Forms:**
- 112: Full Maintenance Order
- 113: Parts and Objects
- 106: Parts and Objects - Tom
- 153: NXC Sales Order

### Integration Points

- Uses existing GL Plugin: `sn_hul_if_custom_gl_plugin.js` - detects entries via "Reclass COGS" memo
- Uses existing WIP Module: `sn_hul_mod_reclasswipaccount.js` - traces JE linkages
- References existing margin calculation: `hul_mr_daily_operating_report.js`

### Data Requirements

**Data Volume:**
- Estimated 200-500 Service SOs per month
- 5-15 lines per SO average
- Current period focus (last 30 days default)

**Data Sources:**
- Transaction records (SO, IF, INV, JE, PO, IR, RA)
- Transaction accounting lines (transactionaccountingline)
- Custom field linkages

### Technical Constraints

- Must work within NetSuite governance limits (1000 unit script limit)
- Search results capped at 4000 rows (use pagination)
- INLINEHTML for complex visuals (no external stylesheets)
- Client script path must be relative (`./hul_cs_parts_gl_tracker.js`)

### Dependencies

**Libraries needed:**
- `hul_lib_parts_gl_tracker.js` (new - to be created)

**Reference patterns from:**
- `hul_lib_customer_health.js` (CONFIG patterns)
- `sn_hul_mod_reclasswipaccount.js` (WIP field linkages)

### Governance Considerations

- Use SuiteQL for complex joins (more efficient than search API)
- Lazy-load Tab 2 data (only when user drills down)
- Default to current period to limit data volume
- Use `search.lookupFields()` for simple record data

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can trace any part item's G/L journey in under 10 seconds
- 100% of fulfilled items show accurate status (Complete, In WIP, or Issue)
- Zero false positives on "Issue" status
- Adopted by accounting team for monthly close reconciliation

**How we'll measure:**

- User feedback during testing
- Time-to-resolution for WIP reconciliation questions
- Reduction in manual spreadsheet tracking

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_lib_parts_gl_tracker.js | Library | Shared data access, JE line matching by IF#, RA Item Receipt tracking, bulk status summary | Complete |
| hul_sl_parts_gl_tracker.js | Suitelet | Main tracking UI, deep-dive timeline with RA Item Receipts, search results status column | Complete |
| hul_cs_parts_gl_tracker.js | Client Script | Async cost loading, margin recalc, COGS JE verification, async SO status loading | Complete |
| hul_rl_serial_costs.js | RESTlet | Async serial cost lookup from Item Receipts via SuiteQL | Complete |
| hul_rl_so_status_summary.js | RESTlet | Async SO line status summary for search results | Complete |
| hul_ue_so_gl_tracker_button.js | User Event | Add button to SO records | Complete |

### Development Approach - MVP

**Phase 1: Library Module**
- [ ] Create CONFIG object with field mappings
- [ ] Implement `getSalesOrderLineData(soId)` function
- [ ] Implement `getItemFulfillments(soId)` function
- [ ] Implement `getInvoices(soId)` function
- [ ] Implement `getWIPJournalEntries(ifIds)` function
- [ ] Implement `getReturnAuthorizations(soId)` function
- [ ] Implement `getCreditMemos(soId)` function
- [ ] Implement `getProcurementSource(soId, itemId)` function:
  - Check for linked PO via `createdfrom` or special order fields
  - If item is Lot/Serial: Query inventory detail for source PO
  - Return: { hasProcurement: bool, poId, poNum, irId, irNum, reason }
- [ ] Implement `isLotSerialItem(itemId)` function - check item record for lot/serial flags
- [ ] Implement `determineLineStatus(lineData)` function
- [ ] Implement `buildItemJourney(soId, lineNum, itemId)` function
- [ ] Implement `getGLImpactLines(transactionIds)` function
- [ ] Add utility functions (formatCurrency, formatDate, buildTransactionUrl)

**Phase 2: Suitelet Tab 1 (SO Overview)**
- [ ] Create form with tabs
- [ ] Add filter field group (SO Number, Customer, Date Range, Status)
- [ ] Build SO header section with summary stats
- [ ] Create line items sublist with all columns
- [ ] Implement status badge display logic
- [ ] Add drill-down URL column

**Phase 3: Client Script**
- [ ] Implement pageInit for filter initialization
- [ ] Implement fieldChanged for filter interactions
- [ ] Implement drillDownToItem navigation function

**Phase 4: Suitelet Tab 2 (Item Deep-Dive)**
- [ ] Build visual timeline HTML
- [ ] Build G/L activity table
- [ ] Build related records grid
- [ ] Handle URL parameters for item context

**Phase 5: User Event (SO Button)**
- [ ] Create beforeLoad handler
- [ ] Check for valid form (112, 113, 106, 153)
- [ ] Add button with Suitelet URL
- [ ] Deploy to Sales Order record

### Future Enhancements (Post-MVP)

**Phase A: Flexible Entry Points**
Add dropdown to select entry record type, enabling different tracking perspectives:

| Entry Point | Track Direction | Use Case |
|-------------|-----------------|----------|
| Sales Order | Forward | Current MVP - WIP/COGS tracking |
| Purchase Order | Forward | Track procurement → inventory → (if Lot/Serial) sales |
| Return Authorization | Bidirectional | Backward to SO/INV, forward to RMA IR → CM |
| Item Fulfillment | Bidirectional | Start from IF, see SO context and downstream |
| Invoice | Bidirectional | Start from invoice, see full chain |

**Phase B: Custom Records**
- Irregularity record for persistent tracking
- Configuration record for thresholds

**Phase C: Irregularity Detection (MapReduce)**
- WIP/COGS mismatch detection
- Orphaned WIP detection
- Return GL error detection

**Phase D: Irregularity Dashboard**
- Monitoring Suitelet with filters
- CSV export
- Self-healing JE suggestions

**Phase E: Alerting & Trends**
- Scheduled email alerts
- WIP aging distribution
- Top customers by irregularity count

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Enter valid SO number → All lines display with correct status
2. Click drill-down on Complete item → Shows full transaction chain with JEs
3. Click drill-down on In WIP item → Shows transaction chain stopping at fulfillment
4. Click "Track Parts G/L" button on SO → Opens Suitelet with SO pre-selected

**Edge Cases:**
1. SO with no fulfillments → All lines show "Pending" status
2. SO with partial fulfillment → Some lines Complete, some Pending
3. SO with Return Authorization before Invoice → Lines show "Issue" status
4. SO with multiple fulfillments for same line → Correctly aggregates
5. Line with multiple WIP JEs → Shows all linked JEs

**Error Handling:**
1. Invalid SO number entered → Display "Sales Order not found" message
2. SO has no line items → Display empty state message
3. User lacks permission to view SO → Graceful error message

### Test Data Requirements

- At least 3 SOs in each status: Complete, Partial, Open
- At least 1 SO with Return Authorization before Invoice
- SOs from different subsidiaries and customers
- SOs from each valid form type (112, 113, 106, 153)

### Sandbox Setup

1. Ensure WIP process is working (GL Plugin active)
2. Create test SOs with parts items
3. Fulfill some items, invoice some, return some before invoicing
4. Verify `custbody_sna_hul_je_wip` links are populated

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator
- Controller
- Accounting Manager
- CFO
- Parts Manager
- Service Manager

**Permissions required:**
- View Sales Orders
- View Item Fulfillments
- View Invoices
- View Journal Entries
- View Purchase Orders
- View Item Receipts
- View Return Authorizations

### Data Security

- Read-only access (no record modifications in MVP)
- No PII exposed beyond standard transaction data
- Suitelet requires login (not external)

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All test scenarios passing in sandbox
- [ ] Scripts commented with JSDoc
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder demo completed
- [ ] User training materials prepared

### Deployment Steps

1. Upload library file: `hul_lib_parts_gl_tracker.js`
2. Upload suitelet file: `hul_sl_parts_gl_tracker.js`
3. Upload client script file: `hul_cs_parts_gl_tracker.js`
4. Upload user event file: `hul_ue_so_gl_tracker_button.js`
5. Create Script Record for Suitelet (ID: customscript_hul_sl_parts_gl_tracker)
6. Create Script Deployment for Suitelet (ID: customdeploy_hul_sl_parts_gl_tracker)
7. Create Script Record for User Event (ID: customscript_hul_ue_so_gl_tracker_btn)
8. Create Script Deployment for User Event on Sales Order
9. Test in production with limited data set
10. Enable for all users

### Post-Deployment

- [ ] Verify Suitelet loads correctly
- [ ] Verify button appears on valid SO forms
- [ ] Test with real production SOs
- [ ] Monitor error logs for 48 hours
- [ ] Gather user feedback
- [ ] Update PRD status to "Implemented"

### Rollback Plan

**If deployment fails:**
1. Disable User Event script deployment
2. Disable Suitelet script deployment
3. Investigate error logs
4. Fix issues in sandbox
5. Re-deploy

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | Draft |
| Development Start | | | |
| Library Module Complete | | | |
| Tab 1 Complete | | | |
| Tab 2 Complete | | | |
| User Event Complete | | | |
| Testing Complete | | | |
| Stakeholder Review | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [x] Should the Suitelet be added to a custom menu/center? **No - access via SO button and direct URL**
- [x] What date range should be the default filter? **30 days**
- [x] Should users be able to bookmark specific item views? **Not yet - future enhancement**
- [x] Which WIP account ID should be used as default? **Use existing preference: `custscript_sna_hul_gl_wip_account` (Parts WIP)**
- [x] How to handle procurement tracking for average cost items? **Show "N/A" - cannot determine for bulk-purchased items**
- [x] Should MVP support multiple entry points (PO, RA, etc.)? **No - SO-only MVP first, flexible entry in Phase A**
- [x] Item types in use? **Mix of Average Cost and Lot/Serial - handle both appropriately**

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Performance issues with large SOs | Medium | Medium | Limit to current period, use pagination |
| WIP JE links missing on old data | High | Low | Show "No WIP JE" status, don't fail |
| GL Plugin memo format changes | Low | High | Make memo detection configurable in CONFIG |
| User Event conflicts on SO | Medium | Low | Minimal logic in UE, just adds button |
| Lot/Serial inventory detail query complexity | Medium | Medium | Cache item type lookups, optimize queries |
| User confusion about "N/A" procurement | Medium | Low | Clear tooltip/help text explaining why |

---

## 15. References & Resources

### Related PRDs
- None (new feature)

### Related Scripts (Existing)
- `sn_hul_if_custom_gl_plugin.js` - GL Plugin that creates WIP entries
- `sn_hul_mod_reclasswipaccount.js` - WIP module with JE linkages
- `sna_hul_ue_invoice.js` - Invoice UE that triggers WIP JE creation
- `hul_mr_daily_operating_report.js` - Margin calculation logic reference

### NetSuite Documentation
- [SuiteScript 2.1 API](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4387172221.html)
- [N/ui/serverWidget](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4497715498.html)
- [SuiteQL](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156257770049.html)

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-12-26 | Thomas Showalter / Claude Code | 1.0 | Initial draft |
| 2025-12-27 | Thomas Showalter / Claude Code | 1.1 | Added data model limitation documentation. Clarified MVP is SO-centric forward tracking. Added procurement source logic for Lot/Serial vs Average Cost items. Added Future Phase A: Flexible Entry Points. |
| 2025-12-27 | Thomas Showalter / Claude Code | 1.2 | Added Appendix C: Technical Learnings & Coding Patterns. Documented Search API vs SuiteQL field availability, orderline matching pattern (tl.id = orderline), inventory detail subrecord access for serial/lot numbers, and historical cost retrieval from GL posting lines. |
| 2025-12-27 | Thomas Showalter / Claude Code | 1.3 | Added Appendix D: Serial Cost Lookup & COGS JE Verification System. Comprehensive documentation of async cost loading via RESTlet, two-pass COGS JE verification algorithm, IF# matching from JE memo field, and detailed data flow diagrams. |
| 2025-12-27 | Thomas Showalter / Claude Code | 1.4 | Added server-side COGS JE verification for average cost items. Both serialized AND average cost items now get verification with same visual indicators. Updated "Verification by Item Type" section documenting dual verification approach. |
| 2025-12-27 | Thomas Showalter / Claude Code | 1.5 | Redesigned Item Deep-Dive page with single-column layout. Timeline now uses numbered icons (1-4), accurate flow descriptions, and shows amounts. Added Financial Summary section with margin calculation. Deep-dive now uses `getSOTrackingData()` for accurate orderline matching (same as summary page). Added verification badges to timeline. |
| 2025-12-27 | Thomas Showalter / Claude Code | 1.6 | Added G/L account entries to Item Deep-Dive timeline. Each transaction now shows actual account numbers and debit/credit amounts. Added library functions: getTransactionGLDetails(), getInvoiceRevenueGL(), getCOGSJournalEntryGL(). Item Fulfillment shows both standard posting AND GL Plugin reclass entries. Invoice shows line-specific revenue credit (notes A/R is aggregated). COGS JE shows Parts WIP → COGS movement. |
| 2025-12-27 | Thomas Showalter / Claude Code | 1.7 | Fixed deep-dive for serialized items with same item ID on multiple lines. Added getSerialCost() library function for server-side IR cost lookup. Fixed line_num URL parameter resolution. Added amount-based filtering for GL lines. Added Appendix E documenting serialized item deep-dive patterns. Added Future Phase F: RA Item Receipt tracking. |
| 2025-12-28 | Thomas Showalter / Claude Code | 1.8 | Implemented Phase F: RA Item Receipt tracking. Added getRAItemReceipts() function to library. RA Item Receipts now appear in deep-dive timeline (Step 5b) with GL impact details. Added RA IRs to Related Records grid. RA now shows non-posting note when no GL entries found. |
| 2025-12-28 | Thomas Showalter / Claude Code | 1.9 | Added Document Type filter (W, PS, R, S prefixes). Date range search now requires Date From + Date To + Document Type. SO Number search remains independent. Added docType filter to searchSalesOrders(). Added "Back to Search Results" navigation - filter params preserved in Track URL, back button appears on SO detail page when coming from search results. |
| 2025-12-28 | Thomas Showalter / Claude Code | 2.0 | Added SO Line Status Summary column to search results. New RESTlet `hul_rl_so_status_summary.js` provides async status loading. Added `getBulkSOStatusSummary()` to library. Client script loads status asynchronously after page renders - shows counts like "3/5 Complete, 1 Issue" with color coding. See Appendix G for details. |
| 2025-12-28 | Thomas Showalter / Claude Code | 2.1 | Fixed 4000 search result limit error. Added batching (50 SOs per batch) to `getBulkSOStatusSummary()` searches. Increased search limit from 500 to 1000 rows. Documented `orderline` column limitation and batching pattern in Appendix G. |
| 2025-12-28 | Thomas Showalter / Claude Code | 2.2 | Fixed GL Reclass column to accurately detect actual GL Plugin reclass entries. Previous approach used incorrect join (`tal.transactionline = tl.id`). New approach detects reclass by account pattern (WIP debit + COGS credit) since `memo` field is not available on `transactionaccountingline`. See Appendix H for details. |
| 2025-12-28 | Thomas Showalter / Claude Code | 2.3 | Added Line Type filter to expand tracking beyond inventory items. Now supports all SO line types: Item, Resource (Labor), Charge, Purchase, Object, Group, Rental, Transport, Sublet. Filter uses `custcol_sna_so_service_code_type`. Non-inventory items show N/A for IF/WIP columns and have simplified status (Pending → Complete when invoiced). Added "Type" column to line items display. See Appendix I for details. |
| 2025-12-28 | Thomas Showalter / Claude Code | 2.4 | Added Resource item (Service Labor) tracking via Time Entry → COGS JE flow. Resource items now show Time Entry data in IF columns and linked COGS JE data. Added verification: COGS JE $ vs calculated cost (hours × employee laborcost). Implemented Planned Maintenance margin aggregation: PM line margin = PM Revenue - Sum(Resource COGS). See Appendix J for details. |
| 2025-12-28 | Thomas Showalter / Claude Code | 2.5 | Added Expected Margin column for proactive margin monitoring BEFORE invoicing. Expected Margin = (SO Line $ - IF Cost) / SO Line $ × 100. PM Expected Margin aggregates resource line IF costs. Added Location and Revenue Stream to list view and SO header. Made SO number in header a clickable link to NetSuite record. Fixed PM item condition ordering (`isPMItem` must be checked before `isResourceItem && hasPMItem`). See Appendix K for details. |

---

## Search Filters

### Available Filters

| Filter | Type | Required | Description |
|--------|------|----------|-------------|
| **SO Number** | Text | For SO search | Partial match (LIKE %value%) - bypasses date requirements |
| **Customer** | Select | No | Optional filter by customer entity |
| **Date From** | Date | For date search | Start of date range |
| **Date To** | Date | For date search | End of date range |
| **Document Type** | Select | For date search | SO prefix filter (W, PS, R, S) |
| **Line Type** | Select | No | Filter by service code type (Item, Resource, Charge, etc.) - defaults to All |
| **Status** | Select | No | UI only - not implemented in search |

### Document Type Prefixes

| Prefix | Description |
|--------|-------------|
| W | Service |
| PS | Parts Sales |
| R | Rental |
| S | Equipment |

### Search Modes

**Mode 1: SO Number Search (Independent)**
- Enter SO Number → bypasses date/document type requirements
- Optional: Customer, Date From, Date To, Document Type can be added as additional filters
- Returns SOs matching the partial SO number

**Mode 2: Date Range Search (All Three Required)**
- Must provide: Date From + Date To + Document Type
- Optional: Customer as additional filter
- Validation error if any of the three are missing
- Returns SOs in date range with matching document type prefix

### Implementation Details

```javascript
// Library: searchSalesOrders() adds prefix filter
if (filters.docType) {
    conditions.push('t.tranid LIKE ?');
    params.push(filters.docType + '%');  // e.g., 'W%', 'PS%'
}

// Suitelet: Validation for date range search
if (hasDateFrom || hasDateTo || hasDocType) {
    if (!hasDateFrom || !hasDateTo || !hasDocType) {
        displayNoResults(form, 'Date range search requires Date From, Date To, AND Document Type.');
    }
}
```

---

## Appendix A: Key Data Queries

### Query 1: SO Line Items with Status
```sql
SELECT tl.line, tl.item, BUILTIN.DF(tl.item) AS item_name,
       tl.quantity, tl.amount, tl.location, tl.department
FROM transactionline tl
WHERE tl.transaction = :soId
  AND tl.mainline = 'F'
  AND tl.itemtype IN ('InvtPart', 'NonInvtPart', 'Kit', 'Assembly')
ORDER BY tl.line
```

### Query 2: Item Fulfillments for SO
```sql
SELECT ift.id, ift.tranid, ift.trandate, ift.custbody_sna_hul_je_wip,
       ifl.item, ifl.quantity, ifl.line AS so_line
FROM transaction ift
JOIN transactionline ifl ON ift.id = ifl.transaction
WHERE ift.createdfrom = :soId
  AND ift.type = 'ItemShip'
  AND ifl.mainline = 'F'
ORDER BY ift.trandate DESC
```

### Query 3: G/L Impact Lines
```sql
SELECT t.tranid, t.type, t.trandate,
       gli.account, BUILTIN.DF(gli.account) AS account_name,
       gli.debit, gli.credit, gli.memo
FROM transaction t
JOIN transactionaccountingline gli ON t.id = gli.transaction
WHERE t.id IN (:transactionIds)
  AND gli.posting = 'T'
ORDER BY t.trandate, gli.accountinglinetype
```

---

## Appendix B: File Structure

```
FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/
├── Documentation/PRDs/
│   └── PRD-20251226-PartsGLTracker.md     # This document
├── Libraries/
│   └── hul_lib_parts_gl_tracker.js         # Shared data access & utilities
├── Suitelets/
│   └── hul_sl_parts_gl_tracker.js          # Main tracking UI (Tab 1 & 2)
├── ClientScripts/
│   └── hul_cs_parts_gl_tracker.js          # Client-side interactivity
├── RESTlets/
│   ├── hul_rl_serial_costs.js              # Async serial cost lookup from Item Receipts
│   └── hul_rl_so_status_summary.js         # Async SO status summary for search results
└── UserEvents/
    └── hul_ue_so_gl_tracker_button.js      # SO record button
```

---

## Appendix C: Technical Learnings & Coding Patterns

### Critical: Search API vs SuiteQL Field Availability

NetSuite's Search API and SuiteQL have **different field exposure**. Some fields work in one but not the other:

| Field | Search API | SuiteQL | Notes |
|-------|------------|---------|-------|
| `createdfrom` | ✓ Available | ✗ NOT_EXPOSED | Use Search API for finding child transactions |
| `orderline` | ✗ Invalid column | ✗ NOT_EXPOSED | Must use `record.load()` to access |
| `serialnumbers` | ✓ Available | ✗ NOT_EXPOSED | Or use inventory detail subrecord |
| `tl.id` | N/A | ✓ Available | Internal line ID - matches `orderline` on child transactions |
| `tl.uniquekey` | N/A | ✓ Available | Different from `tl.id` - does NOT match `orderline` |
| `debit`/`credit` | ✗ on transactionline | ✓ on transactionaccountingline | Use `transactionaccountingline` for GL amounts |

### Matching SO Lines to Fulfillment/Invoice Lines

**The Problem:** When the same item appears on multiple SO lines (e.g., "Temporary Item - 9800" for one-time purchases), you cannot match by item ID alone. You need a direct line-to-line link.

**The Solution - Hybrid Approach:**

1. **Get SO lines via SuiteQL** - include `tl.id AS linekey`:
```sql
SELECT tl.linesequencenumber AS line, tl.id AS linekey, tl.item, ...
FROM transactionline tl
WHERE tl.transaction = :soId AND tl.mainline = 'F'
```

2. **Find child transactions via Search API** (has `createdfrom` filter):
```javascript
search.create({
    type: search.Type.ITEM_FULFILLMENT,
    filters: [['createdfrom', 'anyof', soId], ['mainline', 'is', 'T']]
});
```

3. **Load each record to get `orderline`**:
```javascript
const ifRecord = record.load({ type: record.Type.ITEM_FULFILLMENT, id: ifId });
const orderline = ifRecord.getSublistValue({
    sublistId: 'item',
    fieldId: 'orderline',
    line: i
});
```

4. **Match using `orderline == linekey`**:
```javascript
const lineFulfillments = fulfillments.filter(f => f.orderline == line.linekey);
```

**Key Insight:** The `orderline` field on child transaction lines (IF, Invoice, RA, CM) contains the `tl.id` value from the source SO line - NOT the `linesequencenumber` and NOT the `uniquekey`.

### Getting Serial/Lot Numbers from Inventory Detail

Serial/lot numbers are stored in a **subrecord** on the transaction line, not directly accessible via search columns.

**Correct Pattern:**
```javascript
try {
    const invDetail = ifRecord.getSublistSubrecord({
        sublistId: 'item',
        fieldId: 'inventorydetail',
        line: i
    });
    if (invDetail) {
        const detailLineCount = invDetail.getLineCount({ sublistId: 'inventoryassignment' });
        const serialNumbers = [];
        for (let j = 0; j < detailLineCount; j++) {
            const serial = invDetail.getSublistText({
                sublistId: 'inventoryassignment',
                fieldId: 'issueinventorynumber',  // For fulfillments (issuing inventory)
                line: j
            });
            if (serial) serialNumbers.push(serial);
        }
        serialLotNumber = serialNumbers.join(', ');
    }
} catch (invErr) {
    // No inventory detail for this line (non-serialized item)
}
```

**Notes:**
- Use `issueinventorynumber` for Item Fulfillments (issuing from inventory)
- Use `receiptinventorynumber` for Item Receipts (receiving into inventory)
- The try/catch handles non-serialized items gracefully

### Getting Historical Costs from Item Fulfillment GL Impact

To get the actual cost recorded at fulfillment time (not current average cost):

**Pattern from GL Plugin:**
```javascript
const costSearch = search.create({
    type: search.Type.ITEM_FULFILLMENT,
    filters: [
        ['internalid', 'anyof', ifIds],
        ['mainline', 'is', 'F'],
        ['posting', 'is', 'T'],           // Only posting lines
        ['accounttype', 'anyof', 'COGS']  // COGS account type
    ],
    columns: [
        search.createColumn({ name: 'internalid' }),
        search.createColumn({ name: 'item' }),
        search.createColumn({ name: 'amount' }),
        search.createColumn({ name: 'quantity' })
    ]
});
```

**Key:** Use `accounttype = 'COGS'` and `posting = 'T'` to get the historical cost from GL posting lines.

### Recommended Hybrid Data Retrieval Strategy

For complex line-level tracking across transactions:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SuiteQL for SO Lines                                         │
│    - Gets tl.id (linekey) for matching                          │
│    - Fast, single query                                         │
├─────────────────────────────────────────────────────────────────┤
│ 2. Search API for Finding Child Transactions                    │
│    - Uses createdfrom filter (not in SuiteQL)                   │
│    - Gets mainline=T for unique transaction list                │
├─────────────────────────────────────────────────────────────────┤
│ 3. record.load() for Line Details                               │
│    - Gets orderline field (not in Search API columns)           │
│    - Gets inventory detail subrecord for serial/lot numbers     │
│    - More API calls but accurate data                           │
├─────────────────────────────────────────────────────────────────┤
│ 4. Search API for GL Costs                                      │
│    - accounttype=COGS, posting=T                                │
│    - Historical cost at transaction time                        │
└─────────────────────────────────────────────────────────────────┘
```

### Common Pitfalls to Avoid

1. **Don't assume `linesequencenumber` matches `orderline`** - They are different fields with different values

2. **Don't use `uniquekey` to match `orderline`** - The `uniquekey` field is a different internal ID

3. **Don't try to get `orderline` via Search API columns** - It will throw "invalid column" error

4. **Don't try to get `createdfrom` via SuiteQL** - It's NOT_EXPOSED

5. **Don't use `costestimate` or `averagecost` for historical costs** - These show current values, not historical

6. **Don't assume all items have inventory detail** - Wrap subrecord access in try/catch

---

## Appendix D: Serial Cost Lookup & COGS JE Verification System

This appendix documents the complete system for retrieving accurate serial-level costs and verifying COGS Journal Entry amounts.

### The Problem

For serialized items like "Temporary Item - 9800" (used for one-time part purchases), each serial number has a unique cost from its Item Receipt. However:

1. **IF GL Impact aggregates costs** - When multiple serials of the same item are on one Item Fulfillment, the GL posting line shows the total, not individual costs
2. **COGS JE aggregates by IF** - The Journal Entry that reclassifies Parts WIP → COGS has one line per IF per item, not per serial
3. **Library can't get serial costs synchronously** - Querying Item Receipts for each serial would slow page load significantly

### Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PARTS G/L TRACKER FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. PAGE LOAD (Suitelet)                                                     │
│     ├── Library fetches SO lines, IFs, Invoices, JEs                        │
│     ├── COGS JE lines matched by IF# (from memo) + Item                     │
│     ├── Serial items marked with data attributes:                           │
│     │   • data-serial="PT-01712959"                                         │
│     │   • data-je-id="5703146"                                              │
│     │   • data-if-number="123741"                                           │
│     │   • data-item="98642"                                                 │
│     │   • data-je-item-total="48.03"                                        │
│     └── IF$ shows "Loading..." for serial items                             │
│                                                                              │
│  2. ASYNC COST LOOKUP (Client Script → RESTlet)                             │
│     ├── Client collects all serial numbers from data-serial attributes     │
│     ├── Calls RESTlet with comma-separated serial list                     │
│     ├── RESTlet queries Item Receipts via SuiteQL (fast, indexed)          │
│     └── Returns { serial: cost } map                                        │
│                                                                              │
│  3. COST CELL UPDATE (Client Script)                                        │
│     ├── Updates IF$ cells with actual costs from Item Receipts             │
│     ├── Recalculates margins based on new IF$ values                       │
│     └── Stores costs for COGS JE verification                              │
│                                                                              │
│  4. COGS JE VERIFICATION (Client Script - Two Pass)                         │
│     ├── PASS 1: Direct verification                                         │
│     │   └── If serial's IF$ matches its JE line amount → ✓ Verified        │
│     └── PASS 2: Group verification (for aggregated JE lines)               │
│         ├── Group by JE ID + IF# + Item                                    │
│         ├── Sum IF$ for all serials in group                               │
│         ├── Compare to JE item total                                       │
│         └── If sum matches → ✓ Verified, else → ⚠ Mismatch                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### RESTlet: Serial Cost Lookup (hul_rl_serial_costs.js)

**Purpose:** Look up Item Receipt costs for serial numbers without blocking page load.

**Why RESTlet instead of direct query?**
- Client scripts can't use N/query module
- Search API with `serialnumbers contains` filter is extremely slow (timeout)
- RESTlet allows server-side SuiteQL which is fast and indexed

**SuiteQL Query:**
```sql
SELECT
    invnum.inventorynumber AS serial,
    tl.rate,
    ABS(tl.netamount) AS amount,
    ABS(ia.quantity) AS qty
FROM inventorynumber invnum
INNER JOIN inventoryassignment ia
    ON ia.inventorynumber = invnum.id
INNER JOIN transactionline tl
    ON tl.transaction = ia.transaction
    AND tl.id = ia.transactionline
INNER JOIN transaction t
    ON t.id = tl.transaction
WHERE invnum.inventorynumber IN ('PT-01712959', 'PT-01712910', ...)
    AND t.type = 'ItemRcpt'
    AND ia.quantity > 0
```

**Key Join Logic:**
1. `inventorynumber` - The serial number record (has the serial string)
2. `inventoryassignment` - Links serial to transaction line (the IR line that received it)
3. `transactionline` - The IR line with cost information (rate, netamount)
4. `transaction` - Filter to Item Receipts only

**Response Format:**
```javascript
{
    success: true,
    costs: {
        "PT-01712959": 14.84,
        "PT-01712910": 14.84,
        "PT-01712911": 33.19
    }
}
```

### COGS JE Line Matching (Library)

**The Challenge:** Multiple serials on the same Item Fulfillment share one aggregated COGS JE line. How do we know which JE line belongs to which IF?

**The Solution: JE Memo Field**

When the COGS JE is created, each line's memo contains the IF tranid:
```
Memo: "ITEMSHIP123592"  →  This line is for IF# 123592
Memo: "ITEMSHIP123741"  →  This line is for IF# 123741
```

**Matching Algorithm (in hul_lib_parts_gl_tracker.js):**

```javascript
// Get the IF tranids for this SO line
const lineIfNumbers = lineData.fulfillments.map(f => f.if_number);

// Filter JE lines by IF# first (from memo)
let relevantJeLines = jeLines.filter(jeLine => {
    if (!jeLine.memo) return false;
    // Check if JE line memo contains any of this line's IF numbers
    return lineIfNumbers.some(ifNum => jeLine.memo.includes(ifNum));
});

// Then filter by item
const itemJeLines = relevantJeLines.filter(jeLine => jeLine.item == line.item);
```

**Why IF# Matching is Critical:**

Without IF# matching, the library would match JE lines by item only. When the same item (e.g., Temporary Item - 9800) appears on multiple IFs, the wrong JE line could be matched:

| Scenario | IF# | Serial | IR Cost | JE Line (by item only) | JE Line (by IF# + item) |
|----------|-----|--------|---------|------------------------|-------------------------|
| Line 8 | 123592 | PT-01712910 | $14.84 | $48.03 ❌ | $48.03 ✓ |
| Line 9 | 123592 | PT-01712911 | $33.19 | $14.84 ❌ (wrong IF!) | $48.03 ✓ |
| Line 10 | 123741 | PT-01712959 | $14.84 | None (used) ❌ | $14.84 ✓ |

### Two-Pass COGS JE Verification (Client Script)

**Pass 1: Direct Verification**

For each serialized item, check if its IF$ (from RESTlet) directly matches its `data-je-item-total`:

```javascript
if (Math.abs(ifCost - jeItemTotal) < 0.01) {
    // Direct match! This serial's IF$ equals the JE line amount
    // Common for: single serial on an IF
    cell.classList.add('cogs-verified');  // Shows green ✓
}
```

**Pass 2: Group Verification**

For cells that couldn't be directly verified (aggregated JE lines), group by JE ID + IF# + Item:

```javascript
// Group key: JE ID + IF# + Item ID
var key = jeId + '_' + ifNumber + '_' + itemId;

// Sum IF$ for all serials in the group
group.items.forEach(item => sumIFCosts += item.ifCost);

// Compare sum to JE item total
if (Math.abs(jeTotal - sumIFCosts) < 0.01) {
    // Group verified! Sum of individual IF$ equals aggregated JE line
    // Mark all items in group as verified
}
```

### Example Scenarios

**Scenario 1: Single Serial per IF (Direct Verification)**

```
Sales Order W693486
├── Line 10: Temporary Item - 9800, Serial PT-01713631
│   ├── IF# 126771 (single serial on this IF)
│   ├── IR Cost: $602.14
│   └── COGS JE Line: $602.14 (memo: "ITEMSHIP126771")
│
│   Verification:
│   └── Pass 1: IF$ $602.14 == JE$ $602.14 → ✓ Direct Verified
```

**Scenario 2: Multiple Serials per IF (Group Verification)**

```
Sales Order W689035
├── Line 8: Temporary Item - 9800, Serial PT-01712029
│   ├── IF# 125432 (shared with Line 9)
│   ├── IR Cost: $602.14
│   └── COGS JE Line: $631.87 (aggregated, memo: "ITEMSHIP125432")
│
├── Line 9: Temporary Item - 9800, Serial PT-01712030
│   ├── IF# 125432 (shared with Line 8)
│   ├── IR Cost: $29.73
│   └── COGS JE Line: $631.87 (same line as Line 8)
│
│   Verification:
│   ├── Pass 1: IF$ $602.14 != JE$ $631.87 → needs group verification
│   ├── Pass 1: IF$ $29.73 != JE$ $631.87 → needs group verification
│   └── Pass 2: Group JE_125432_98642
│       ├── Sum IF$: $602.14 + $29.73 = $631.87
│       ├── JE Total: $631.87
│       └── $631.87 == $631.87 → ✓ Group Verified (both lines)
```

**Scenario 3: Mixed IFs with Same Item (IF# Matching Critical)**

```
Sales Order W679044
├── Line 8: Temporary Item - 9800, Serial PT-01712910
│   ├── IF# 123592
│   ├── IR Cost: $14.84
│   └── JE Line: $48.03 (memo: "ITEMSHIP123592")
│
├── Line 9: Temporary Item - 9800, Serial PT-01712911
│   ├── IF# 123592 (same IF as Line 8)
│   ├── IR Cost: $33.19
│   └── JE Line: $48.03 (same as Line 8 - aggregated)
│
├── Line 10: Temporary Item - 9800, Serial PT-01712959
│   ├── IF# 123741 (DIFFERENT IF!)
│   ├── IR Cost: $14.84
│   └── JE Line: $14.84 (memo: "ITEMSHIP123741")
│
│   Verification:
│   ├── Pass 1: Line 10: IF$ $14.84 == JE$ $14.84 → ✓ Direct Verified
│   ├── Pass 2: Group JE_123592_98642 (Lines 8 & 9)
│   │   ├── Sum IF$: $14.84 + $33.19 = $48.03
│   │   ├── JE Total: $48.03
│   │   └── $48.03 == $48.03 → ✓ Group Verified
│
│   ⚠️ WITHOUT IF# matching, Line 9 would incorrectly match to the
│      $14.84 JE line (for IF 123741), causing verification failures!
```

### Data Attributes on COGS JE $ Cells

The Suitelet adds these data attributes to serialized items' COGS JE $ cells:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-serial` | Serial number for RESTlet lookup | "PT-01712959" |
| `data-je-id` | JE internal ID for grouping | "5703146" |
| `data-if-number` | IF tranid for grouping (critical!) | "123741" |
| `data-item` | Item internal ID for grouping | "98642" |
| `data-je-item-total` | Matched JE line amount | "48.03" |
| `data-line` | Row index for updates | "8" |

### Verification by Item Type

COGS JE verification applies to **all items**, not just serialized items. The verification approach differs based on item type:

| Item Type | Verification Location | When | How |
|-----------|----------------------|------|-----|
| **Serialized/Lot** | Client-side (async) | After RESTlet returns | Sum of IR costs vs JE total |
| **Average Cost** | Server-side (immediate) | At page load | IF$ from GL Impact vs COGS JE$ |

**Average Cost Item Verification (Server-Side):**

For average cost items, all data is available at page load:
1. **IF$** comes from Item Fulfillment GL Impact (COGS account posting lines)
2. **COGS JE$** comes from matched Journal Entry line
3. These should be equal (JE reclassifies the same cost from WIP to COGS)
4. Verification happens in the library's `getSOTrackingData()` function

```javascript
// Library verification for average cost items
if (matchedCogsJeAmount > 0 && lineData.ifCost > 0) {
    const diff = Math.abs(lineData.ifCost - matchedCogsJeAmount);
    if (diff < 0.01) {
        lineData.cogsJeVerified = true;   // ✓ Verified
    } else {
        lineData.cogsJeVerified = false;  // ⚠ Mismatch
        lineData.issues.push('COGS JE amount mismatch');
    }
}
```

**Verification States:**
- `cogsJeVerified = true` → IF$ matches COGS JE$ (within $0.01 tolerance)
- `cogsJeVerified = false` → Mismatch detected, status upgraded to "Issue"
- `cogsJeVerified = null` → Pending (serialized items awaiting client-side, or no JE yet)

### Verification Status Indicators

| Status | CSS Class | Visual | Meaning |
|--------|-----------|--------|---------|
| Verified | `.cogs-verified` | Green with ✓ | IF$ matches JE$ (direct or group) |
| Mismatch | `.cogs-mismatch` | Red with ⚠ | IF$ doesn't match JE$ (hover for details) |
| Loading | (initial) | "Verifying..." | Waiting for RESTlet response (serialized only) |
| No indicator | - | Plain amount | No JE yet or not applicable |

### Mismatch Handling

When a COGS JE mismatch is detected:

1. **COGS JE $ cell** - Shows red color with ⚠ icon
2. **Status column** - Badge changes to red "! Issue"
3. **Issue text** - "COGS JE amount mismatch" appended
4. **Console warning** - Detailed log with expected vs actual amounts

### Performance Considerations

1. **RESTlet is lazy-loaded** - Page renders immediately, costs load async
2. **SuiteQL is indexed** - `inventorynumber` table query is fast
3. **Batch lookup** - All serials fetched in one RESTlet call
4. **Client-side verification** - No additional server round-trips for verification

### Script File Summary

| File | Purpose |
|------|---------|
| `hul_lib_parts_gl_tracker.js` | Library - JE line matching by IF#, server-side verification for avg cost items |
| `hul_sl_parts_gl_tracker.js` | Suitelet - Displays verification status for all items (✓ or ⚠) |
| `hul_cs_parts_gl_tracker.js` | Client - Async serial cost loading, margin recalc, two-pass verification |
| `hul_rl_serial_costs.js` | RESTlet - SuiteQL lookup of serial costs from Item Receipts |

### Deployment Requirements

**RESTlet Setup:**
- Script ID: `customscript_hul_rl_serial_costs`
- Deployment ID: `customdeploy_hul_rl_serial_costs`
- Status: Released
- Execute As Role: Administrator (or role with Item Receipt access)
- Audience: All roles that access Parts G/L Tracker

---

## Appendix E: Serialized Item Deep-Dive Patterns

This appendix documents the specific challenges and solutions for displaying accurate G/L information on the Item Deep-Dive page for serialized items.

### The Challenge: Same Item ID, Different Costs

For serialized items like "Temporary Item - 9800" (used for one-time part purchases), each serial number has a unique cost from its Item Receipt. When multiple serials of the same item appear on:
- The same Sales Order (different lines)
- The same Item Fulfillment (different inventory detail lines)

The standard GL query pattern (filter by item ID) returns ALL lines for that item, and `find()` picks the first match - which is wrong for subsequent serials.

**Example: SO W689035**
| Line | Item | Serial | IR Cost | IF# |
|------|------|--------|---------|-----|
| 4 | Temporary Item - 9800 | PT-01712029 | $602.14 | 122442 |
| 5 | Temporary Item - 9800 | PT-01712030 | $29.73 | 122442 |

Without special handling, Line 5's deep-dive would show $602.14 (Line 4's cost) because:
1. Both lines have the same `itemId`
2. GL query returns both lines' posting entries
3. `find()` returns the first COGS debit ($602.14)

### Solution 1: Server-Side Serial Cost Lookup

The library now includes `getSerialCost(serialNumber)` which queries the Item Receipt directly:

```javascript
function getSerialCost(serialNumber) {
    const sql = `
        SELECT
            tl.rate,
            ABS(tl.netamount) AS amount,
            ABS(ia.quantity) AS qty
        FROM inventorynumber invnum
        INNER JOIN inventoryassignment ia
            ON ia.inventorynumber = invnum.id
        INNER JOIN transactionline tl
            ON tl.transaction = ia.transaction
            AND tl.id = ia.transactionline
        INNER JOIN transaction t
            ON t.id = tl.transaction
        WHERE invnum.inventorynumber = '${serialNumber}'
            AND t.type = 'ItemRcpt'
            AND ia.quantity > 0
    `;
    // Returns the cost from Item Receipt
}
```

**Called at the start of `buildTimelineHTML()`:**
```javascript
let perSerialIfCost = lineData.ifCost;
if (lineData.serialLotNumber) {
    const serialCost = trackerLib.getSerialCost(lineData.serialLotNumber);
    if (serialCost > 0) {
        perSerialIfCost = serialCost;
    }
}
```

### Solution 2: Amount-Based GL Line Filtering

When multiple GL lines exist for the same item, filter by the expected amount:

```javascript
// In getTransactionGLDetails():
let filteredStandardPosting = standardPosting;
if (knownAmount > 0 && standardPosting.length > 2) {
    const matchingLines = standardPosting.filter(l => {
        const amount = l.debit > 0 ? l.debit : l.credit;
        return Math.abs(amount - knownAmount) < tolerance;
    });
    if (matchingLines.length > 0) {
        filteredStandardPosting = matchingLines;
    }
}
```

### Solution 3: Proper Deep-Dive URL Resolution

The deep-dive link includes both `item_id` and `line_num`. The resolution must prioritize `line_num`:

```javascript
// WRONG - falls back to item_id which matches first line
const lineData = trackingData.lines.find(l => l.line == lineNum || l.item == itemId);

// CORRECT - prioritize line_num with explicit string comparison
let lineData = null;
if (lineNum) {
    lineData = trackingData.lines.find(l => String(l.line) === String(lineNum));
}
if (!lineData && itemId) {
    lineData = trackingData.lines.find(l => String(l.item) === String(itemId));
}
```

### Data Flow for Serialized Item Deep-Dive

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERIALIZED ITEM DEEP-DIVE FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. URL PARSING                                                              │
│     └── Extract line_num from URL parameters                                │
│                                                                              │
│  2. LINE RESOLUTION (Priority: line_num > item_id)                          │
│     └── Find exact line by line_num using String() comparison              │
│                                                                              │
│  3. SERIAL COST LOOKUP                                                       │
│     ├── Check if lineData.serialLotNumber exists                           │
│     ├── Call getSerialCost(serialNumber) → queries Item Receipt            │
│     └── Store in perSerialIfCost variable                                  │
│                                                                              │
│  4. GL DETAILS WITH AMOUNT FILTERING                                        │
│     ├── Call getTransactionGLDetails(ifId, 'ItemShip', itemId, perSerialIfCost)  │
│     ├── Function filters GL lines by amount when multiple exist            │
│     └── Returns only lines matching perSerialIfCost (±$0.01)               │
│                                                                              │
│  5. TIMELINE DISPLAY                                                         │
│     ├── Item Fulfillment: Shows correct per-serial amounts                 │
│     ├── GL Plugin Reclass: Inferred from standard posting amount           │
│     └── COGS JE: Uses perSerialIfCost for display                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Functions Updated

| Function | File | Change |
|----------|------|--------|
| `handleItemDeepDive()` | Suitelet | Prioritize line_num resolution |
| `buildTimelineHTML()` | Suitelet | Call getSerialCost() at start |
| `getTransactionGLDetails()` | Library | Filter standard posting by amount |
| `getSerialCost()` | Library | NEW - Query IR cost by serial number |

### Testing Serialized Item Deep-Dive

To verify the fix works:
1. Find an SO with multiple serials of the same item (e.g., Temporary Item - 9800)
2. Note the different costs from the summary page
3. Click deep-dive on the SECOND serial
4. Verify:
   - Header shows correct serial number
   - Item Fulfillment shows correct per-serial cost
   - GL Plugin Reclass shows same per-serial cost
   - COGS JE shows same per-serial cost

---

## Future Enhancements

### Phase F: Return Authorization Item Receipt Tracking - COMPLETE

**Feature:** Item Receipts linked to Return Authorizations are now displayed in the Item Deep-Dive view.

**Context:**
- Return Authorizations (RAs) are **non-posting** transactions
- Item Receipts from RAs are **posting** transactions that affect GL (reverse the original fulfillment)
- The deep-dive now shows both RAs AND their associated Item Receipts with full GL details

**Implementation (v1.8):**
- Added `getRAItemReceipts(raIds)` function to library - queries IRs where `createdfrom` = RA ID using Search API
- Updated `getSOTrackingData()` to include RA Item Receipts in lineData for each line
- RA Item Receipts appear in timeline after their parent RA (Step 5b)
- Timeline icon: "IR" with orange color (#fd7e14) to distinguish from RA (red) and regular transactions
- GL Impact displayed: Typically Inventory (Dr) / COGS (Cr) - reverses the original fulfillment posting
- RA Item Receipts added to Related Records grid with orange accent
- RA now shows "Non-posting transaction (no G/L impact until Item Receipt)" when no GL entries found

**Scope:**
- Item Deep-Dive: YES - RA Item Receipts with GL details ✓
- Summary View: NO - column layout unchanged (as planned)

---

## Appendix F: RA Item Receipt Tracking Pattern

This appendix documents the implementation of Phase F - tracking Item Receipts created from Return Authorizations.

### Return Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RETURN AUTHORIZATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Return Authorization (RA) Created                                        │
│     └── NON-POSTING: No GL impact                                           │
│         └── Just an authorization to return goods                           │
│                                                                              │
│  2. RA Item Receipt Created (from RA)                                        │
│     └── POSTING: GL impact reverses original fulfillment                    │
│         ├── Dr Inventory (receiving returned item)                          │
│         └── Cr COGS (reversing the cost recognized at sale)                 │
│                                                                              │
│  3. Credit Memo Created (from RA or Invoice)                                 │
│     └── POSTING: GL impact reverses customer charge                         │
│         ├── Dr Revenue (reversing the sale)                                 │
│         └── Cr A/R (reducing what customer owes)                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Library Function: getRAItemReceipts()

```javascript
/**
 * Get Item Receipts created from Return Authorizations
 * @param {Array} raIds - Array of RA internal IDs
 * @returns {Array} Array of RA Item Receipt objects
 */
function getRAItemReceipts(raIds) {
    // Uses Search API because createdfrom is NOT_EXPOSED in SuiteQL
    // 1. Search for IRs where createdfrom IN raIds
    // 2. Load each IR to get line details
    // 3. Extract serial/lot numbers from inventory detail
    // 4. Return line-level data for matching
}
```

### Data Flow in getSOTrackingData()

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA RETRIEVAL ORDER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Get SO lines                                                             │
│  2. Get fulfillments                                                         │
│  3. Get invoices                                                             │
│  4. Get RAs                                                                  │
│  5. Get CMs                                                                  │
│  6. Get RA Item Receipts (NEW - uses RA IDs from step 4)                    │
│  7. Get WIP JEs                                                              │
│  8. Process each line:                                                       │
│     ├── Match fulfillments by orderline                                     │
│     ├── Match invoices by orderline                                         │
│     ├── Match RAs by item (first unused)                                    │
│     ├── Match CMs by item (first unused)                                    │
│     ├── Match RA IRs by item AND ra_id (first unused)                       │
│     └── Store in lineData.raItemReceipts                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Timeline Display (Deep-Dive)

RA Item Receipts appear as Step 5b in the timeline:

| Step | Icon | Color | Transaction Type |
|------|------|-------|------------------|
| 1 | 1 | Purple (#667eea) | Sales Order |
| 2 | 2 | Green (#28a745) | Item Fulfillment |
| 3 | 3 | Blue (#17a2b8) | Invoice |
| 4 | 4 | Green (#28a745) | COGS Journal Entry |
| 5 | ! | Red (#dc3545) | Return Authorization |
| 5b | IR | Orange (#fd7e14) | RA Item Receipt (NEW) |
| 6 | CM | Red (#dc3545) | Credit Memo |

### GL Impact Display

For RA Item Receipts, the GL entries typically show:

```
📕 Dr 13235 Inventory - Parts Inventory    $XX.XX
📗 Cr 54030 COGS - Parts                   $XX.XX
```

This reverses the original Item Fulfillment's standard posting:
```
📗 Cr 13235 Inventory - Parts Inventory    $XX.XX
📕 Dr 54030 COGS - Parts                   $XX.XX
```

### Matching Logic

RA Item Receipts are matched to SO lines using:
1. **Item ID match**: IR line item must match SO line item
2. **RA ID match**: IR must be created from an RA that matches this SO line
3. **First unused**: Prevents double-matching when same item appears multiple times

---

## Appendix G: SO Line Status Summary Column

This appendix documents the async status summary column added to search results in v2.0.

### Overview

When users search for Sales Orders using date range + document type filters, the search results now include a "Line Status" column showing a summary of each SO's line statuses (e.g., "3/5 Complete, 1 Issue").

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SO STATUS SUMMARY FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. PAGE LOAD (Suitelet)                                                     │
│     ├── Search results returned with SO list                                │
│     ├── "Line Status" column added with "Loading..." placeholder            │
│     ├── Hidden field contains RESTlet URL                                   │
│     └── Each cell has data-so-id attribute for matching                     │
│                                                                              │
│  2. ASYNC STATUS LOAD (Client Script → RESTlet)                             │
│     ├── Client finds all .so-status-cell elements                          │
│     ├── Collects SO IDs from data attributes                               │
│     ├── Calls RESTlet with comma-separated SO IDs                          │
│     └── RESTlet returns status counts per SO                                │
│                                                                              │
│  3. CELL UPDATE (Client Script)                                             │
│     └── Updates each cell with formatted status:                            │
│         ├── "✓ 5/5 Complete" (all green)                                    │
│         ├── "3/5 Complete, 2 Issues" (mixed colors)                         │
│         ├── "5 In WIP" (orange)                                             │
│         └── "5 Pending" (gray)                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### RESTlet: hul_rl_so_status_summary.js

**Purpose:** Calculate line status counts for multiple SOs in a single request.

**Location:** `FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/RESTlets/`

**Script/Deployment IDs:**
- Script ID: `customscript_hul_rl_so_status_summary`
- Deployment ID: `customdeploy_hul_rl_so_status_summary`

**Input:**
```javascript
GET /app/site/hosting/restlet.nl?script=...&soIds=123,456,789
// or
POST with body: { soIds: [123, 456, 789] }
```

**Output:**
```javascript
{
    success: true,
    statuses: {
        "123": { total: 5, complete: 3, inWip: 1, issues: 0, pending: 1 },
        "456": { total: 3, complete: 3, inWip: 0, issues: 0, pending: 0 },
        "789": { total: 8, complete: 0, inWip: 0, issues: 2, pending: 6 }
    }
}
```

### Library Function: getBulkSOStatusSummary()

**Purpose:** Optimized bulk status calculation for multiple SOs without loading full tracking data.

**Location:** `hul_lib_parts_gl_tracker.js`

**Signature:**
```javascript
function getBulkSOStatusSummary(soIds)
// Returns: { soId: { total, complete, inWip, issues, pending }, ... }
```

**Optimization Strategy:**

Unlike `getSOTrackingData()` which requires ~11 database operations per SO, `getBulkSOStatusSummary()` uses:

1. **Single SuiteQL query** for all SO lines:
```sql
SELECT tl.transaction AS so_id, tl.id AS linekey, tl.item, ...
FROM transactionline tl
WHERE tl.transaction IN (123, 456, 789)
  AND tl.mainline = 'F'
  AND tl.itemtype IN ('InvtPart', 'NonInvtPart', 'Kit', 'Assembly')
```

2. **Three Search API calls** for related transactions:
   - Item Fulfillments (createdfrom IN soIds)
   - Invoices (createdfrom IN soIds)
   - Return Authorizations (createdfrom IN soIds)

3. **In-memory status calculation** based on existence flags.

**Status Logic (same as full tracking):**
- **Complete**: Has IF + Invoice + COGS JE
- **In WIP**: Has IF but no Invoice
- **Issue**: Has RA before Invoice, or other GL problems
- **Pending**: No IF yet

**Important Limitation - Item-Based Matching:**
The `orderline` field is not available as a Search API column (NetSuite throws "invalid column" error). Therefore, `getBulkSOStatusSummary()` uses **item-based matching** instead:
- If the same item appears on multiple SO lines, all lines with that item share the same status
- This is approximate but good enough for a summary column
- For precise per-line status, click into the SO to see full `getSOTrackingData()` results

### Suitelet Changes

**displaySOSearchResults() modifications:**

1. **Hidden RESTlet URL field:**
```javascript
const restletUrlField = form.addField({
    id: 'custpage_status_restlet_url',
    type: serverWidget.FieldType.TEXT,
    label: 'RESTlet URL'
});
restletUrlField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
restletUrlField.defaultValue = url.resolveScript({
    scriptId: 'customscript_hul_rl_so_status_summary',
    deploymentId: 'customdeploy_hul_rl_so_status_summary'
});
```

2. **Status column with data attribute:**
```javascript
sublist.addField({
    id: 'custpage_so_line_status',
    type: serverWidget.FieldType.TEXT,
    label: 'Line Status'
});

// Per row:
sublist.setSublistValue({
    id: 'custpage_so_line_status',
    line: idx,
    value: `<span class="so-status-cell" data-so-id="${so.id}">Loading...</span>`
});
```

### Client Script Changes

**New functions in hul_cs_parts_gl_tracker.js:**

1. **loadSOStatusSummaries()** - Called from pageInit after 200ms delay
   - Finds all `.so-status-cell` elements
   - Gets RESTlet URL from hidden field
   - Collects SO IDs from data attributes
   - Calls RESTlet with batch of IDs
   - Updates cells on response

2. **updateStatusCells(soIdToCells, statuses)** - Updates DOM
   - Maps status data to cells by SO ID
   - Handles missing SOs with "No lines" message

3. **formatStatusSummary(status)** - Formats HTML display
   - All complete: `✓ 5/5 Complete` (green, bold)
   - Mixed: `3/5 Complete, 2 Issues` (colors match status)
   - Colors: complete=#28a745, issues=#dc3545, inWip=#fd7e14, pending=#6c757d

### Status Display Examples

| Line Counts | Display |
|-------------|---------|
| 5 complete, 0 others | `✓ 5/5 Complete` (green bold) |
| 3 complete, 2 issues | `3/5 Complete, 2 Issues` (green + red) |
| 0 complete, 3 in WIP, 2 pending | `3 In WIP, 2 Pending` (orange + gray) |
| 0 lines | `No lines` (gray) |

### Performance Considerations

1. **Page loads immediately** - Status column shows "Loading..." while data fetches
2. **Single RESTlet call** - All SO IDs sent in one request (up to 1000 SOs supported)
3. **Batched searches** - SO IDs processed in batches of 50 to avoid 4000 result limit
4. **RESTlet timeout** - 5-minute limit sufficient for 1000 SOs (20 batches × 3 searches)
5. **Governance** - SuiteQL (10 units) + batched searches (~20 units × batches)

### 4000 Search Result Limit - Critical Pattern

NetSuite's Search API `forEachResult()` throws an error if results exceed 4000:
```
Error: No more than 4000 search results may be returned at one time
```

**Solution: Batch the input IDs**
```javascript
const BATCH_SIZE = 50;  // 50 SOs × ~10 lines = ~500 results (safe margin)
const soBatches = [];
for (let i = 0; i < soIds.length; i += BATCH_SIZE) {
    soBatches.push(soIds.slice(i, i + BATCH_SIZE));
}

// Process each batch separately
soBatches.forEach(batch => {
    const search = search.create({
        filters: [['createdfrom', 'anyof', batch], ...]  // Only this batch
    });
    search.run().each(function(result) {
        // Merge into shared map
        return true;
    });
});
```

**Why 50?**
- 1000 SOs ÷ 50 = 20 batches
- Each batch: ~500 results (well under 4000 limit)
- 20 batches × 3 search types = 60 search calls (still fast)

### Error Handling

| Error | Client Display |
|-------|----------------|
| RESTlet call fails | `Error` (red) |
| RESTlet returns no data | `--` (gray) |
| SO not in response | `No lines` (gray) |

### Deployment Requirements

**New RESTlet Setup:**
- Script ID: `customscript_hul_rl_so_status_summary`
- Deployment ID: `customdeploy_hul_rl_so_status_summary`
- Status: Released
- Execute As Role: Administrator (or role with transaction access)
- Audience: All roles that access Parts G/L Tracker

---

## Appendix H: GL Reclass Detection Pattern

This appendix documents the correct method for detecting GL Plugin reclass entries on Item Fulfillments.

### The Problem

The GL Reclass column was showing incorrect values:
1. "Yes" for items with fulfillments but NO actual reclass GL entries
2. "No" for items that DID have actual reclass GL entries visible in NetSuite GL Impact tab

### Root Cause Analysis

**Initial Approach (Incorrect):**
```sql
SELECT tal.transaction, tl.item, tal.debit, tal.credit
FROM transactionaccountingline tal
JOIN transactionline tl
  ON tal.transaction = tl.transaction
  AND tal.transactionline = tl.id  -- WRONG: transactionline is a NUMBER, not an ID
JOIN account a ON tal.account = a.id
WHERE tal.transaction IN (?)
  AND LOWER(tal.memo) LIKE '%reclass%'  -- WRONG: memo field doesn't exist on TAL
```

**Issues Found:**
1. `tal.transactionline` is a line NUMBER (1, 2, 3...), not an internal ID
2. `tl.id` is an internal ID (large integer)
3. The join condition `tal.transactionline = tl.id` never matches
4. `memo` field does NOT exist on `transactionaccountingline` in SuiteQL

### Solution: Account Pattern Detection

The GL Plugin reclass creates a unique pattern that standard IF posting does NOT create:

**Standard IF Posting:**
```
📗 Cr 13235 Inventory - Parts Inventory    $XX.XX
📕 Dr 54030 COGS - Parts                   $XX.XX
```

**GL Plugin Reclass Adds:**
```
📗 Cr 54030 COGS - Parts                   $XX.XX  ← COGS CREDIT (reversal)
📕 Dr 13840 Parts WIP                      $XX.XX  ← WIP DEBIT
```

**Key Insight:** A **COGS credit** on an Item Fulfillment is proof of reclass, since standard posting only creates COGS debits.

### Correct Query Pattern

```sql
-- Find reclass indicators: WIP debit OR COGS credit on IFs
SELECT
    tal.transaction AS if_id,
    tal.transactionline AS line_num,
    a.acctnumber,
    tal.debit,
    tal.credit
FROM transactionaccountingline tal
JOIN account a ON tal.account = a.id
WHERE tal.transaction IN (?)
  AND tal.posting = 'T'
  AND (
      (a.acctnumber LIKE '138%' AND tal.debit > 0)   -- WIP debit (13840)
      OR
      (a.acctnumber LIKE '540%' AND tal.credit > 0)  -- COGS credit (reversal)
  )
```

### Item-Level Matching with Fallback

To match reclass entries to specific items:

```sql
-- Separate query for line → item mapping
SELECT
    tl.transaction AS if_id,
    tl.linesequencenumber AS line_num,  -- Matches tal.transactionline
    tl.item
FROM transactionline tl
WHERE tl.transaction IN (?)
  AND tl.mainline = 'F'
  AND tl.item IS NOT NULL
```

**Matching Logic:**
1. Build lookup: `ifId_lineNum` → `itemId`
2. For each reclass accounting line, find corresponding item
3. If item found: mark `ifId_itemId` as having reclass
4. **Fallback:** Track IF-level reclass for cases where line matching fails

### Implementation in Library

**Function:** `getGLPluginReclassEntries(ifIds)`

**Returns:**
```javascript
{
    "ifId_itemId": { hasReclass: true, wipDebit: 45.85, cogsCredit: 45.85 },
    "_ifHasReclass": { "ifId1": true, "ifId2": true }  // Fallback for any reclass on IF
}
```

**Usage in getSOTrackingData():**
```javascript
// Check each fulfillment for reclass entries
lineFulfillments.forEach(f => {
    const reclassKey = `${f.if_id}_${line.item}`;
    // First try exact item match
    if (reclassData[reclassKey] && reclassData[reclassKey].hasReclass) {
        hasGLReclass = true;
    }
    // Fallback: check if IF has ANY reclass entries
    else if (reclassData._ifHasReclass && reclassData._ifHasReclass[f.if_id]) {
        hasGLReclass = true;
    }
});
```

### SuiteQL Limitations Documented

| Field | Table | Status | Notes |
|-------|-------|--------|-------|
| `tal.memo` | transactionaccountingline | **NOT FOUND** | Field doesn't exist in SuiteQL |
| `tal.transactionline` | transactionaccountingline | Line NUMBER | Use with `tl.linesequencenumber`, NOT `tl.id` |

### Testing the Fix

1. Find an IF with GL Plugin reclass entries (visible in NetSuite GL Impact tab)
2. Look for entries with Custom Script "SN | HUL | IF Custom GL Plugin"
3. These show COGS credit + WIP debit with memo "Reclass COGS"
4. Verify GL Reclass column now shows "Yes" for these items
5. Find an IF WITHOUT reclass entries (no WIP account in GL Impact)
6. Verify GL Reclass column shows "No" for these items

---

## Appendix I: Line Type Filter and Non-Inventory Item Support

This appendix documents the Line Type filter feature added in v2.3, which expands tracking beyond inventory items to all SO line types.

### Overview

Previously, the Parts G/L Tracker only displayed inventory items (`InvtPart`, `NonInvtPart`, `Kit`, `Assembly`). With v2.3, ALL line types can be viewed:

| Service Code Type | Value | Description | Has IF/WIP? |
|-------------------|-------|-------------|-------------|
| Item | 1 | Parts/inventory items | Yes |
| Resource | 2 | Service labor (time entries) | No (uses Time Entry → COGS JE) |
| Charge | 3 | Miscellaneous charges | No |
| Job Code | 4 | Job code items | No |
| Purchase | 5 | Purchase items | No |
| Object | 6 | Object items | No |
| Model | 7 | Model items | No |
| Group (Resource) | 8 | Resource groups | No |
| Rental | 9 | Rental items | No |
| Transport | 10 | Transport charges | No |
| Sublet | 11 | Sublet services | No |

### Service Code Type Field

**Location:** `custcol_sna_so_service_code_type` on SO line

**Source:** Values inherited from item record field `custitem_sna_item_service_code_type`

### Filter Implementation

The Line Type filter appears after Document Type in the filter row:

```javascript
const serviceCodeField = form.addField({
    id: 'custpage_service_code_type',
    type: serverWidget.FieldType.SELECT,
    label: 'Line Type'
});
serviceCodeField.addSelectOption({ value: '', text: '-- All --' });
serviceCodeField.addSelectOption({ value: '1', text: 'Item (Parts)' });
serviceCodeField.addSelectOption({ value: '2', text: 'Resource (Labor)' });
// ... etc
```

**Filter Behavior:**
- Default: "-- All --" shows all line types
- Selecting a specific type filters to only those lines
- Filter applies to both SO detail view AND summary calculations

### Item Type Classification

The library classifies items as inventory or non-inventory:

```javascript
const inventoryItemTypes = ['InvtPart', 'NonInvtPart', 'Kit', 'Assembly'];
const isInventoryItem = inventoryItemTypes.includes(line.itemtype);
```

This flag drives:
1. **Status determination** - simplified or full tracking
2. **Column display** - values or N/A
3. **Summary calculations** - appropriate status logic

### Status Logic by Item Type

**Inventory Items (Full Tracking):**
```
Pending → In WIP → Complete
         ↘ Issue ↗
```
- Requires Item Fulfillment + Invoice + COGS JE for Complete
- Issue if RA before Invoice or GL mismatch

**Non-Inventory Items (Simplified):**
```
Pending → Complete
```
- Pending until invoiced
- Complete when Invoice exists
- No IF/WIP/JE requirements

### Display Columns

Non-inventory items show N/A for columns that don't apply:

| Column | Inventory Items | Non-Inventory Items |
|--------|-----------------|---------------------|
| Type | Service code type name | Service code type name |
| IF# | Fulfillment link | N/A (gray) |
| IF Date | Fulfillment date | N/A (gray) |
| IF $ | Fulfillment cost | N/A (gray) |
| GL Reclass | Yes/No | N/A (gray) |
| COGS JE | JE link | N/A (gray) |
| COGS JE $ | JE amount | N/A (gray) |
| Margin | Calculated margin | N/A (gray) |

### Library Changes

**getSalesOrderLineData() Updates:**
```sql
SELECT
    tl.linesequencenumber AS line,
    tl.id AS linekey,
    tl.item,
    tl.itemtype,                                    -- NEW: Include item type
    tl.custcol_sna_so_service_code_type AS service_code_type,  -- NEW
    BUILTIN.DF(tl.custcol_sna_so_service_code_type) AS service_code_type_name,
    ...
FROM transactionline tl
WHERE tl.transaction = ?
  AND tl.mainline = 'F'
  AND tl.taxline = 'F'
  AND tl.item IS NOT NULL
  -- REMOVED: AND tl.itemtype IN ('InvtPart', 'NonInvtPart', 'Kit', 'Assembly')
```

**getSOTrackingData() Updates:**
- Added `options` parameter with `serviceCodeType`
- Added `isInventoryItem` field to lineData
- Pass options to `getSalesOrderLineData()`

**determineLineStatus() Updates:**
```javascript
if (isInventoryItem === false) {
    // Non-inventory: simplified status
    if (hasInvoice) {
        result.status = CONFIG.STATUS.COMPLETE;
    } else {
        result.status = CONFIG.STATUS.PENDING;
    }
    return result;
}
// Inventory items continue with full tracking...
```

**getBulkSOStatusSummary() Updates:**
- Removed item type filter from SuiteQL
- Added `isInventoryItem` check to status calculation
- Non-inventory items use simplified Pending/Complete logic

### Future: Resource Item Time Entry Tracking

Resource items (Service Code Type = 2) will have enhanced tracking in a future update:

1. **Sales Order Line** with `custcol_sna_linked_time` linking to Time Entry
2. **Time Entry** acts like WIP (cost sits in WIP account)
3. **Invoice** creation triggers Time Entry posting
4. **COGS JE** created to move cost to COGS

The existing IF and COGS JE columns will be reused:
- IF column → Time Entry link
- IF Date → Time Entry date
- IF $ → Time Entry cost
- COGS JE → COGS Journal Entry link
- COGS JE $ → COGS JE amount

This allows tracking Resource items through their complete lifecycle while maintaining UI consistency.

### Testing Line Type Filter

1. Search for a W (Service) order with mixed line types
2. Verify "Type" column shows correct service code type names
3. Verify non-inventory items show N/A in IF/WIP/COGS columns
4. Verify non-inventory items show Pending or Complete status only
5. Use Line Type filter to show only "Resource (Labor)" items
6. Verify only Resource lines appear in results

---

## Appendix J: Resource Item Time Entry Tracking

This appendix documents the Resource item (Service Code Type = 2) tracking feature added in v2.4, which tracks labor costs through the Time Entry → COGS JE flow.

### Overview

Resource items (service labor like Travel Time, Service Labor) follow a different accounting flow than inventory items:

| Flow | Inventory Items | Resource Items |
|------|-----------------|----------------|
| **Cost Entry** | Item Fulfillment | Time Entry |
| **WIP Account** | 13840 Parts WIP | 13830 Labor WIP |
| **Cost Trigger** | IF posting | Time Entry posting |
| **COGS JE** | JE from `custbody_sna_hul_je_wip` | JE from `custcol_sna_hul_linked_je` |
| **COGS Account** | 54030 COGS - Parts | 53012 COGS - Service Labor |

### Data Flow

```
SO Line (Resource)
    └─> custcol_sna_linked_time = Time Entry ID
            └─> Time Entry (timebill)
                    └─> custcol_sna_hul_linked_je = COGS JE ID
                            └─> Journal Entry
                                    └─> Line memo = Time Entry ID (for matching)
```

### Key Field IDs

| Field | Location | Purpose |
|-------|----------|---------|
| `custcol_sna_linked_time` | SO line | Links to Time Entry record |
| `custcol_sna_hul_linked_je` | Time Entry | Links to COGS Journal Entry |
| `laborcost` | Employee record | Hourly labor cost rate |
| `hours` | Time Entry | Duration in hours |

### Column Display Mapping

Resource items reuse IF and COGS columns with Time Entry data:

| Column | Inventory Items | Resource Items |
|--------|-----------------|----------------|
| IF# | Item Fulfillment link | Time Entry link |
| IF Date | Fulfillment date | Time Entry date |
| IF $ | IF COGS posting amount | Calculated: hours × laborcost |
| GL Reclass | Yes/No | N/A |
| COGS JE | JE from custbody_sna_hul_je_wip | JE from custcol_sna_hul_linked_je |
| COGS JE Date | JE date | JE date |
| COGS JE $ | JE line amount (matched by IF# memo) | JE line amount (matched by TE ID memo) |

### COGS JE Line Matching

For Resource items, COGS JE lines are matched by memo field containing the Time Entry internal ID:

```
JE Line:
  - Account: 53012 COGS - Service Labor
  - Debit: $136.62
  - Memo: "4075550"  ← Time Entry internal ID

Time Entry:
  - ID: 4075550
  - Hours: 3.0
  - Employee laborcost: $45.54/hr
  - Calculated cost: 3.0 × $45.54 = $136.62
```

### Cost Verification

Resource items verify COGS JE amounts against calculated time entry cost:

```
Calculated Cost = Time Entry hours × Employee laborcost
Expected COGS JE $ = Calculated Cost ± $0.01 tolerance

Verification States:
- ✓ Verified (green): COGS JE $ matches calculated cost
- ✗ Mismatch (red): COGS JE $ differs from calculated cost
- ? Pending: No COGS JE linked yet
```

### Status Logic for Resource Items

Resource items use a simplified status flow:

```
Pending → In WIP → Complete
```

| Status | Condition |
|--------|-----------|
| **Pending** | No Time Entry linked |
| **In WIP** | Time Entry exists, no COGS JE yet |
| **Complete** | Time Entry exists AND COGS JE has been created |

### Planned Maintenance (PM) Margin Aggregation

When a Sales Order contains Planned Maintenance item (ID: 99164), Resource items have their costs aggregated to the PM line:

**Without PM Item:**
```
Resource Line 1: Revenue $100, COGS $60, Margin 40%
Resource Line 2: Revenue $150, COGS $90, Margin 40%
```

**With PM Item:**
```
Resource Line 1: Time Entry $60 cost → Margin: "→ PM"
Resource Line 2: Time Entry $90 cost → Margin: "→ PM"
PM Line: Revenue $500, Aggregated COGS $150 → Margin 70%
```

The PM line margin is calculated as:
```
PM Margin = PM Invoice Revenue - Sum(all Resource COGS JE amounts on SO)
PM Margin % = PM Margin / PM Invoice Revenue × 100
```

### Library Functions Added

**getTimeEntriesForSOLines(timeEntryIds)**
- Queries `timebill` records by ID
- Returns time entry data including linked COGS JE ID
- Includes hours, employee ID, service item

**getEmployeeLaborCosts(employeeIds)**
- Looks up `laborcost` field on Employee records
- Returns map of employee ID to labor cost rate
- Used for cost verification calculation

**getTimeEntryCOGSJournalEntries(jeIds)**
- Loads JE records to get line-level details
- Matches lines by memo = Time Entry ID
- Returns COGS amount and WIP amount per time entry

### CONFIG Updates

```javascript
CONFIG.RESOURCE_TRACKING = {
    linked_time_field: 'custcol_sna_linked_time',      // SO line → TE
    linked_je_field: 'custcol_sna_hul_linked_je',      // TE → COGS JE
    planned_maintenance_item: 99164                     // PM item ID
};
```

### lineData Fields Added

```javascript
lineData = {
    // ... existing fields ...
    isResourceItem: true,           // Service Code Type = 2
    isPMItem: false,                // Item ID = 99164
    hasPMItem: true,                // SO has PM item (affects margin)
    timeEntry: {
        te_id: 4075550,
        te_date: '2025-08-05',
        te_hours: 3.0,
        employee_id: 1234,
        labor_cost: 45.54,
        calculated_cost: 136.62,
        linked_je_id: 5678
    },
    timeEntryCogsJe: {
        je_id: 5678,
        je_number: 'JE161814',
        je_date: '2025-08-05',
        linesByTimeEntry: { ... }
    }
};
```

### Testing Resource Item Tracking

1. Find a W (Service) order with Resource lines (Travel Time, Service Labor)
2. Verify Resource lines show Time Entry link in IF# column
3. Verify IF$ shows calculated cost with hover tooltip (hours × rate)
4. Verify COGS JE column shows linked JE from time entry
5. Verify COGS JE$ shows matched amount with verification status
6. Verify status is Complete when Time Entry + COGS JE exist

### Testing PM Margin Aggregation

1. Find a W (Service) order with Planned Maintenance item (99164)
2. Verify Resource lines show "→ PM" in Margin column
3. Verify PM line shows aggregated margin calculation
4. Hover over PM margin to see tooltip with resource cost breakdown
5. Verify PM margin = PM Revenue - Sum(Resource COGS)

### Known Limitations

- Only Resource items (Service Code Type = 2) use Time Entry flow
- Other non-inventory items (Charge, etc.) still show N/A
- Time Entry must have `custcol_sna_hul_linked_je` populated to track COGS JE
- PM margin aggregation only includes Resource items on the same SO

---

## Appendix K: Expected Margin Column

**Added in v2.5** - December 28, 2025

### Purpose

The Expected Margin column allows users to catch margin issues **BEFORE** the invoice is created. Previously, margin was only visible after invoicing. Expected Margin uses SO line amounts and fulfillment costs to calculate what the margin WILL be.

### Formula

```
Expected Margin = (SO Line Amount - IF Cost) / SO Line Amount × 100
```

Where:
- **SO Line Amount**: The amount on the Sales Order line (expected revenue)
- **IF Cost**: Cost from Item Fulfillment GL posting (inventory items) or Time Entry calculated cost (resource items)

### Color Coding

| Margin % | Color | Meaning |
|----------|-------|---------|
| ≥ 30% | Green (#28a745) | Healthy margin |
| 15-29% | Yellow (#ffc107) | Moderate margin |
| < 15% | Red (#dc3545) | Low margin - review |

### Item Type Handling

| Item Type | Expected Margin Calculation |
|-----------|----------------------------|
| **Inventory (InvtPart)** | SO Line $ - IF Cost (COGS debit from fulfillment) |
| **Resource (Labor)** | SO Line $ - Time Entry Cost (hours × labor rate) |
| **PM Item** | SO Line $ - Aggregated Resource Costs (sum of resource line IF costs) |
| **Resource with PM** | Shows "→ PM" (cost included in PM line) |
| **Charge/Service** | N/A (no cost tracking) |

### PM Expected Margin

Planned Maintenance items aggregate costs from their associated Resource lines:

```javascript
// Library calculates pmExpectedCost
const totalExpectedCost = resourceLines.reduce((sum, line) => {
    return sum + (line.ifCost || 0);  // Sum Time Entry costs
}, 0);
pmLine.pmExpectedCost = totalExpectedCost;

// Suitelet displays PM expected margin
const pmExpCost = line.pmExpectedCost || 0;
const expMarginPct = ((soLineAmount - pmExpCost) / soLineAmount) * 100;
```

**Important**: PM items have BOTH `isResourceItem=true` AND `hasPMItem=true`. The condition order MUST check `isPMItem` FIRST:

```javascript
// CORRECT order - check isPMItem FIRST
if (line.isPMItem) {
    // PM item - calculate with aggregated resource costs
} else if (isResourceItem && line.hasPMItem) {
    // Resource line with PM - show "→ PM"
}
```

### UI Updates

1. **New "Exp Margin" Column** - Added before the existing "Margin" column
2. **Column Header Shortened** - "Line" → "Ln" to make space
3. **Tooltip** - Hover shows calculation breakdown (e.g., "SO $169.00 - Cost $136.62")
4. **Bold PM Margin** - PM expected margin is bold for visibility

### Additional v2.5 Changes

#### Location and Revenue Stream

Added to both list view and SO detail header:
- **Location**: Line-level location (`tl.location`) - transaction-level `t.location` is REMOVED in SuiteQL
- **Revenue Stream**: Custom segment `cseg_sna_revenue_st`

#### SO Number Link

The SO number in the detail header is now a clickable link that opens the NetSuite Sales Order record in a new tab.

### SuiteQL Gotcha: t.location REMOVED

**CRITICAL**: The `location` field on the `transaction` table is marked as REMOVED in SuiteQL:
```
Error: Field 'location' for record 'transaction' was not found. Reason: REMOVED
```

**Workaround**: Use line-level location from `transactionline`:
```sql
-- WRONG: t.location is REMOVED
SELECT t.location FROM transaction t

-- CORRECT: Use line-level location
SELECT tl.location FROM transactionline tl
WHERE tl.transaction = ? AND tl.mainline = 'F' LIMIT 1
```

### Testing Expected Margin

1. Find a Service order (W prefix) with inventory items
2. Verify Exp Margin shows calculated percentage before invoicing
3. Hover over percentage to see tooltip with breakdown
4. For PM orders, verify PM line shows aggregated expected margin
5. Verify Resource lines show "→ PM" when PM item exists on order
