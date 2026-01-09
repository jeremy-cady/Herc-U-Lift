# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Development Workflow for New Features

**IMPORTANT:** Follow this workflow for all new features to ensure consistency and avoid conflicts with existing scripts.

### Phase 1: Understand the Request
- Identify target records (SO, Case, Project, Task, Asset, etc.)
- Identify fields to read/write
- Identify business logic requirements

### Phase 2: Check CLAUDE.md
- Look up relevant record types and field IDs in [Critical Custom Fields](#critical-custom-fields)
- Check [Scripts by Record Deployment](#scripts-by-record-deployment) for UE conflicts
- Review [Key Business Logic Patterns](#key-business-logic-patterns) for established flows
- Check [Known Gotchas](#known-gotchas--discoveries) for field quirks

### Phase 3: Search Production Scripts
Before writing any code, search for related patterns:
```bash
# Find all scripts that use the target record
grep -r "customrecord_nx_asset" /SuiteScripts/

# Find UE scripts that might fire during updates
grep -r "record.Type.SUPPORT_CASE" /SuiteScripts/*ue*.js

# Find existing similar features
grep -r "MapReduceScript" /SuiteScripts/ -l

# Find shared module usage
grep -r "sna_hul_mod_" /SuiteScripts/
```

### Phase 4: Read Relevant Scripts
Read 2-3 most relevant production scripts to understand:
- Actual field usage in context
- Error handling patterns
- Business rules enforced
- Shared modules already in use

### Phase 5: Check for Existing Solutions
With 300+ scripts, something similar may already exist:
- Is there a MapReduce for bulk updates on this record?
- Is there a Suitelet with similar UI?
- Is there a shared module to reuse?

### Phase 6: Plan & Build
Present a plan that:
- References patterns from existing scripts
- Uses correct field IDs from the start
- Avoids conflicts with existing UE scripts
- Reuses shared modules when appropriate

### Phase 7: Document Discoveries
After building, update CLAUDE.md with:
- New field quirks discovered
- New patterns established
- New gotchas to avoid

---

## Project Overview

This is a **NetSuite SuiteScript 2.1** application for fleet equipment cost analysis. The system calculates cost-per-hour for equipment by analyzing repair invoices against hour meter readings, providing detailed reporting on maintenance expenses.

**Platform:** Oracle NetSuite ERP
**Version:** 2.3 (October 2025)
**Primary Script:** `fleet_report_suitelet.js` (Suitelet)
**Client Script:** `fleet_report_client.js` (ClientScript)

## Architecture

### SuiteScript Module Pattern

All scripts use AMD (Asynchronous Module Definition) pattern:

```javascript
define(['N/search', 'N/ui/serverWidget', 'N/format', ...],
    function(search, serverWidget, format, ...) {
        return {
            onRequest: onRequest  // Entry point for Suitelet
        };
    });
```

### Configuration-Driven Design

The `CONFIG` object in `fleet_report_suitelet.js` (lines 39-90) maps all NetSuite custom fields and record types. **Always update CONFIG when field IDs change** - this is the single source of truth for all field mappings.

### Data Model Relationships

```
Field Service Asset (customrecord_nx_asset)
    └─> has Object ID (custrecord_sna_hul_nxcassetobject)
            └─> Object (customrecord_sna_objects)
                    └─> Hour Meters (customrecord_sna_hul_hour_meter)
                            └─> via custrecord_sna_hul_object_ref

Invoice (CustInvc)
    └─> links to Equipment via custbody_sna_hul_nxc_eq_asset
    └─> links to Support Case via custbody_nx_case
            └─> Support Case (supportcase)
                    └─> has case details in custevent_nx_case_details
```

**Critical**: Hour meters link to Objects, not directly to Assets. The code handles this with a two-step lookup (Asset → Object ID → Hour Meters) with fallback to direct Asset search.

### Key Functions Flow

**Report Generation** (`generateReport` at line 449):
1. `getEquipmentDetails()` - Loads asset record and related data
2. `getHourMeterData()` - Retrieves readings via Object ID lookup
3. `getInvoiceData()` - Searches invoices with case details join
4. `calculateSummary()` - Computes metrics
5. `displayResults()` - Generates HTML UI

**Hour Meter Strategy** (lines 551-748):
- Primary: Search via Object ID from Asset
- Fallback: Direct search with Asset ID
- Debug: Check for any hour meters without date filter
- Returns data quality indicators: HIGH/MEDIUM/LOW/NO_DATA

**Invoice Retrieval** (lines 754-966):
- Uses search joins to get case details in single query (v2.3 optimization)
- Filters by revenue stream for warranty/internal exclusion
- Sorts newest first for UI display

## Development Workflow

### No Build Process

This project has no build tools, npm, or transpilation. Files are deployed directly to NetSuite.

### Deployment

**NetSuite Deployment Options:**
1. **File Cabinet Upload**: Upload via NetSuite UI (Setup > Documents > Files)
2. **SuiteCloud Development Framework (SDF)**: Use `suitecloud` CLI for version control deployment
3. **VSCode Extension**: NetSuite extension for direct file sync

**Script Deployment Requirements:**
- Create Script Record in NetSuite (Customization > Scripting > Scripts > New)
- Set Script Type: Suitelet (for suitelet) or Client Script (for client)
- Link the deployed script file from File Cabinet
- Create Script Deployment record with audience and parameters
- Link client script to suitelet via `form.clientScriptModulePath`

### Testing

**No automated tests exist.** Testing is done in NetSuite environment:

1. Access Suitelet URL from NetSuite (Customization > Scripting > Scripts)
2. Test with real equipment data
3. Use `?setup=true` parameter for diagnostics page
4. Monitor Execution Log (System > Logs > Execution Log)

**Debugging:**
- `log.audit()` - Success/info messages
- `log.debug()` - Debug output
- `log.error()` - Errors with stack traces
- All logs viewable in NetSuite Execution Log

## Code Patterns

### Search Performance Best Practices

**DO**: Use search joins for related data (single query)
```javascript
search.createColumn({
    name: CONFIG.CASE_FIELDS.case_details,
    join: CONFIG.INVOICE_FIELDS.case_link
})
```

**DON'T**: Load records in loops
```javascript
// Avoid this pattern:
results.forEach(function(r) {
    var rec = record.load({type: 'supportcase', id: r.id});  // Slow!
});
```

### HTML Generation

Server-side HTML is built using string concatenation. Key patterns:

- Inline CSS with style attributes (no external stylesheets)
- Use `<details>` elements for collapsible content
- Grid layouts: `display: grid; grid-template-columns: repeat(3, 1fr)`
- Color scheme: Primary purple (#667eea, #764ba2)

### Field Naming Conventions

- `custpage_*` - Suitelet form fields (transient)
- `custbody_*` - Transaction body fields
- `custcol_*` - Transaction line fields
- `custrecord_*` - Custom record fields
- `custevent_*` - Event/case fields
- `cseg_*` - Custom segment fields

### Error Handling

Always use try-catch with graceful degradation:

```javascript
try {
    // Attempt operation
} catch (e) {
    log.error('Context description', e);
    // Return safe default or partial data
}
```

## Common Modifications

### Adding New Metrics

1. Add calculation to `calculateSummary()` (line 971)
2. Add display HTML in `displayResults()` metrics section (line 1038+)
3. Update data retrieval functions if new fields needed

### Adding Custom Fields

1. Update `CONFIG` object with new field IDs
2. Add to search columns in relevant function
3. Update display logic in `displayResults()`

### Filtering Data

Current filters:
- Customer (optional dropdown)
- Date range (required)
- Exclude warranty/internal checkbox (filters revenue stream)

To add filters:
1. Add form field in `addFormFields()` (line 270)
2. Add filter to search in `getInvoiceData()` or `getHourMeterData()`
3. Add client validation if needed in `fleet_report_client.js`

### Changing UI Layout

Metric grids use CSS Grid:
- Primary metrics: 3-column grid (line 1039)
- Secondary metrics: 5-column grid (line 1068)
- Adjust `grid-template-columns` to change layout
- Breakpoints handled by `repeat(auto-fit, minmax(200px, 1fr))`

## Version History Context

**v2.3 (Current)**: Fixed case details via direct join on `custbody_nx_case` field - eliminated separate lookups for massive performance improvement

**v2.1**: Fixed hour meter search through Object records, improved layout, added revenue stream text display

**Future considerations**: The system assumes hour meters increment forward. If equipment has meter resets or decreasing values, validation issues appear but are logged (not blocking).

## NetSuite API Limitations

- Search results limited to 4,000 rows (use pagination with `getRange()`)
- Record.load() is expensive (governance units) - minimize usage
- Client scripts have different available modules than server scripts
- Form field IDs must start with `custpage_` for Suitelets
- Client script path must be relative (`./filename.js`) when in same folder

---

## Production Scripts Reference

The `/Herc-U-Lift/FileCabinet/SuiteScripts/` directory contains production SuiteScripts. Use these as reference for field IDs, patterns, and existing business logic.

### Directory Structure

```
/SuiteScripts/
  ├── sna_hul_*.js          # Base folder - core transaction scripts (SO, Invoice, Case, etc.)
  ├── sn_hul_*.js            # Optimized/legacy scripts
  ├── HUL_DEV/
  │     ├── ADMIN_DEV/       # AI-coded admin tools (this project)
  │     ├── Service/         # Field Service Module (cases, tasks, assets)
  │     ├── Parts/           # Equipment meters, inventory
  │     ├── Global/          # Cross-functional utilities (SweetAlert, etc.)
  │     ├── Finance/         # Invoicing, payments, Versapay
  │     ├── Rental/          # Rental orders, insurance
  │     └── Sales/           # Sales orders
  └── SNA/
        ├── shared/          # Reusable modules (utils, versapay, rental orders)
        ├── PandaDocs/       # E-signature integration
        └── *.js             # Commission, pricing, vendor, fulfillment scripts
```

### Key Scripts by Record Type

#### Sales Orders
| Script | Type | Purpose |
|--------|------|---------|
| `sna_hul_ue_salesorder.js` | UE | Document numbering, Transfer button, Versapay sync |
| `sna_hul_ue_so_rental.js` | UE | Rental billing, object config, time entries |
| `sn_hul_ue_so_opt.js` | UE | Sets work/repair/group codes from revenue stream |
| `sna_hul_ue_so_itempricing.js` | UE | Pricing matrix, markups, discounts |
| `sna_hul_cs_salesorder.js` | CS | Client-side SO validation |

#### Invoices
| Script | Type | Purpose |
|--------|------|---------|
| `sna_hul_ue_invoice.js` | UE | Document numbering, WIP→COGS reclassification, warranty JE |
| `SNA/sna_hul_mod_invoiceWarrantyJe.js` | MOD | Creates warranty journal entries |

#### Cases & Tasks
| Script | Type | Purpose |
|--------|------|---------|
| `sna_hul_ue_case.js` | UE | Creates NXC Site Asset, updates location |
| `sna_hul_ue_rentaltask.js` | UE | Updates object rental status from task results |
| `SNA/sna_hul_ue_task.js` | UE | Task field updates |
| `HUL_DEV/Service/hul_fs_case_subtabs_ue.js` | UE | Case subtabs with modal notifications |

#### Assets & Equipment
| Script | Type | Purpose |
|--------|------|---------|
| `sna_hul_ue_asset_auto_creation.js` | UE | Auto-creates NXC Equipment Assets from SO |
| `sna_hul_ue_customersiteasset.js` | UE | Customer site asset management |
| `HUL_DEV/Parts/hul_set_current_meter_reading_on_equip_obj_mr.js` | MR | Equipment meter updates |

### SNA Shared Modules

Import path: `SuiteScripts/SNA/shared/sna_hul_mod_*.js`

| Module | Exports | Usage |
|--------|---------|-------|
| `sna_hul_mod_utils.js` | `isEmpty(value)` | Check empty values/arrays/objects |
| `sna_hul_mod_versapay_sync.js` | `preventSyncForInternalRevenueStream(context)` | Block Versapay sync for internal streams |
| `sna_hul_mod_rental_orders.js` | `updateCopiedTimeEntry(salesOrder)` | Update time entry refs on SO copy |
| `sna_hul_update_child_transactions.js` | Various | Update related POs, time entries, transactions |

**Example Import:**
```javascript
define([
  'SuiteScripts/SNA/shared/sna_hul_mod_utils',
  'SuiteScripts/SNA/shared/sna_hul_mod_versapay_sync'
], (SNA_UTILS, VERSAPAY_UTIL) => {
  const { isEmpty } = SNA_UTILS;
  // Use VERSAPAY_UTIL.preventSyncForInternalRevenueStream(context);
});
```

### PandaDocs Integration

Location: `/SuiteScripts/SNA/PandaDocs/`

| Script | Purpose |
|--------|---------|
| `sna_hul_mod_pd.js` | Core module - API calls, PDF generation, status updates |
| `sna_hul_cs_pd_esign_button.js` | Adds "Request eSignature" button |
| `sna_hul_mr_pd_esign_status.js` | MapReduce to monitor/update doc status |
| `sna_hul_sl_pd_esign.js` | Suitelet handler for e-sign requests |

**PandaDocs Fields:**
- `custbody_sna_pd_doc_id` - Document ID
- `custbody_sna_pd_doc_status` - Status (Draft, Sent, Viewed, Completed)
- `custbody_sna_pd_document` - Signed PDF file reference

### Critical Custom Fields

#### Entity Fields (custentity_) - Customer/Project Level
```
custentity_nx_project_type          - Project type (Billable, PM 180D, PM 360D, etc.)
custentity_nx_asset                 - Site asset reference on projects
custentity_nxc_project_assets       - Equipment multi-select on projects
custentity_sna_hul_location         - Primary location
custentity_sna_hul_po_required      - PO requirement flag
custentity_sna_blanket_po           - Blanket PO reference
custentity_sna_cert_of_insurance    - Certificate of Insurance
custentity_sna_hul_date_of_exp_coi  - COI expiration date
custentity_sna_hul_customerpricinggroup - Pricing group lookup
```

#### Event Fields (custevent_) - Case/Task Level
```
custevent_nx_case_asset             - Site asset on cases
custevent_nxc_case_assets           - Equipment multi-select on cases
custevent_nx_task_asset             - Site asset on tasks
custevent_nx_task_type              - Task type (Pickup, Delivery, Check-in, etc.)
custevent_nxc_task_result           - Task result/outcome
custevent_nx_address                - Task address text
custevent_nx_latitude               - Task GPS latitude
custevent_nx_longitude              - Task GPS longitude
custevent_nx_start_date             - Task start date
custevent_nx_end_date               - Task end date
custevent_nx_case_purchaseorder     - PO number on case
custevent_sna_hul_caselocation      - Case location
```

#### Body Fields (custbody_) - Transaction Level
```
CASE/EQUIPMENT LINKS:
custbody_nx_case                    - Case reference on SO/Invoice
custbody_sna_hul_nxc_eq_asset       - NXC Equipment Asset link
custbody_sna_equipment_object       - Equipment object link

BILLING/WIP:
custbody_sna_hul_location           - Rental location
custbody_sna_hul_billing_status     - Current billing status
custbody_sna_hul_so_wip             - SO WIP account
custbody_sna_hul_je_wip             - JE WIP tracking

INTEGRATION:
custbody_versapay_do_not_sync       - Prevent VersaPay sync
custbody_sna_pd_doc_id              - PandaDocs document ID
custbody_sna_pd_doc_status          - PandaDocs status

WARRANTY:
custbody_sna_invforwarranty         - Invoice warranty flag
custbody_sna_jeforwarranty          - Warranty JE link

OTHER:
custbody_sna_hul_waive_insurance    - Insurance waiver flag
custbody_sna_hul_case_closed        - Case closure status
```

#### Column Fields (custcol_) - Line Item Level
```
PRICING:
custcol_sna_hul_markup              - Markup percentage
custcol_sna_hul_perc_disc           - Percent discount
custcol_sna_hul_dollar_disc         - Dollar discount
custcol_sna_hul_list_price          - List price reference

LINKING:
custcol_sna_linked_so               - Linked Sales Order (Time Entries)
custcol_sna_linked_time             - Linked Time Entry
custcol_sna_linked_transaction      - Linked transaction

CODES:
custcol_sna_repair_code             - Repair code
custcol_sna_work_code               - Work code
custcol_sna_group_code              - Group code

EQUIPMENT:
custcol_sna_hul_eq_serial           - Equipment serial number
custcol_sna_hul_fleet_no            - Fleet number
custcol_nxc_equip_asset             - Equipment asset on line
custcol_sna_hul_ship_meth_vendor    - Shipping method/vendor
```

#### Record Fields (custrecord_) - Custom Records
```
ASSETS:
custrecord_nxc_na_asset_type        - Asset type (1=Site, 2=Equipment)
custrecord_nx_asset_address_text    - Site address text
custrecord_nx_asset_latitude        - Site GPS latitude
custrecord_nx_asset_longitude       - Site GPS longitude
custrecord_nx_asset_customer        - Customer link

EQUIPMENT/METERS:
custrecord_sna_hul_hour_meter_reading - Meter value
custrecord_sna_hul_object_ref       - Equipment object reference
custrecord_hul_meter_key_static     - Equipment object meter reading
custrecord_sna_rental_status        - Object rental status

REVENUE STREAM:
custrecord_sna_hul_revstreaminternal     - Internal stream flag
custrecord_sna_hul_revstream_repair_code - Default repair code
custrecord_sna_hul_revstream_work_code   - Default work code
custrecord_sna_hul_revstream_group_code  - Default group code
```

### Key Record Types & Custom Records

| Record | Type ID | Purpose |
|--------|---------|---------|
| Field Service Asset | `customrecord_nx_asset` | Sites (type=1) and Equipment (type=2) |
| Equipment Object | `customrecord_sna_objects` | Rental objects, status tracking |
| Hour Meter | `customrecord_sna_hul_hour_meter` | Meter readings |
| Revenue Stream | `customrecord_cseg_sna_revenue_st` | Business segmentation |
| Document Numbering | `customrecord_sna_hul_document_numbering` | SO/Invoice number sequences |
| Vendor Price | `customrecord_sna_hul_vendorprice` | Vendor pricing matrix |
| Sales Rep Matrix | `customrecord_sna_sales_rep_matrix` | Commission calculations |

### Custom Segments (cseg_)

| Segment | Purpose | Notes |
|---------|---------|-------|
| `cseg_sna_revenue_st` | Revenue Stream | Critical for routing, pricing, sync |
| `cseg_hul_mfg` | Manufacturer | Equipment manufacturer |
| `cseg_sna_hul_eq_seg` | Equipment Category | Equipment classification |

### Revenue Stream Mapping (cseg_sna_revenue_st)

**Internal (Do Not Sync to Versapay):** 2, 9-45, 131-147, 210-262, 303-308, 405-406, 426-430, 436-439, 442-447
**External (Sync to Versapay):** 1, 3-8, 18-19, 103-130, 203-209, 263, 407-425, 441
**Special:** Stream 416 = Rental transactions

Revenue stream drives:
- GL account routing for warranty
- Service/repair/work codes
- VersaPay sync eligibility
- Pricing matrix selection

### Key Business Logic Patterns

#### Sales Order Workflow
```
SO Created → sna_hul_ue_so_rental triggers:
  1. Creates/links NXC Equipment Assets
  2. Sets revenue stream codes on lines
  3. Configures rental objects
  4. Creates time entries for labor
  5. Calculates item pricing with markups/discounts

SO → Invoice → sna_hul_ue_invoice triggers:
  1. Document numbering with sequence
  2. WIP→COGS reclassification JE
  3. Warranty JE creation (if applicable)
```

#### Task Status → Object Update
```
Task completed → sna_hul_ue_rentaltask:
  - Pickup task → Object status = "Out Assigned"
  - Delivery task → Object status = "On Rent"
  - Check-in task → Object status = "Check-in Required"
  Updates custrecord_sna_rental_status on customrecord_sna_objects
```

#### VersaPay Sync Control
```javascript
// In beforeSubmit:
VERSAPAY_UTIL.preventSyncForInternalRevenueStream(scriptContext);
// Sets custbody_versapay_do_not_sync = true for internal revenue streams
```

### Exploring Production Scripts

When starting new features:
```bash
# Find field usage
grep -r "custentity_nx_project_type" /SuiteScripts/

# Find record handling
grep -r "record.Type.JOB" /SuiteScripts/

# Find shared module usage
grep -r "sna_hul_mod_utils" /SuiteScripts/

# Find revenue stream logic
grep -r "cseg_sna_revenue_st" /SuiteScripts/
```

---

## Scripts by Record Deployment

**IMPORTANT:** Before programmatically updating any record, check this list for UE scripts that may fire and cause unexpected behavior.

### Sales Order (record.Type.SALES_ORDER)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_salesorder.js` | UE | Document numbering | Sets tranid, adds Transfer button |
| `sna_hul_ue_so_rental.js` | UE | Rental workflow | Creates time entries, configures objects, billing dates |
| `sn_hul_ue_so_opt.js` | UE | Code population | Sets work/repair/group codes from revenue stream |
| `sna_hul_ue_so_itempricing.js` | UE | Pricing | Applies pricing matrix, markups, discounts |
| `sna_hul_ue_so_temporaryitem.js` | UE | Temp items | Handles temporary item creation, vendor creation |
| `sna_hul_ue_asset_auto_creation.js` | UE | Asset creation | Creates NXC Equipment Assets from SO |
| `sna_hul_ue_so_update_lines.js` | UE | Line updates | Updates SO line-level fields |
| `sna_hul_ue_so_set_codes_item_lines.js` | UE | Code setting | Sets codes on item lines |
| `sna_hul_ue_so_van_bin.js` | UE | Van/bin tracking | Van bin assignment |
| `sna_hul_ue_sales_rep_matrix_on_so.js` | UE | Commission | Sales rep matrix application |
| `sna_hul_ue_trigger_so_workflow.js` | UE | Workflow | Triggers SO approval workflow |
| `SNA/sna_hul_ue_createpoonsoapproval.js` | UE | PO creation | Creates PO on SO approval |
| `SNA/sna_hul_ue_so_hide_button.js` | UE | UI | Hides buttons based on conditions |
| `HUL_DEV/Rental/hul_pop_rental_form_ue.js` | UE | Rental form | Populates insurance data |

### Invoice (record.Type.INVOICE)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_invoice.js` | UE | Doc numbering, WIP | Document sequence, WIP→COGS JE, warranty JE |
| `sna_hul_ue_invoicepdf.js` | UE | PDF | PDF generation and tracking |
| `sna_hul_ue_itemfulfillment.js` | UE | Fulfillment link | Also deploys on Invoice for fulfillment sync |
| `sna_hul_ue_jeforwarranty.js` | UE | Warranty | Creates warranty journal entries |
| `sna_hul_ue_inv_other_charges.js` | UE | Other charges | Handles additional invoice charges |

### Support Case (record.Type.SUPPORT_CASE / supportcase)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_case.js` | UE | Case setup | Creates NXC Site Asset, sets location |
| `sna_hul_ue_nx_update_case_fields.js` | UE | Field sync | Updates case fields from related records |
| `sna_hul_ue_nxasset.js` | UE | Asset link | Links NXC assets to cases |
| `HUL_DEV/Service/hul_fs_case_subtabs_ue.js` | UE | UI | Adds subtabs, modal notifications |
| `HUL_DEV/Service/hul_populate_task_on_case_when_created_ue.js` | UE | Task sync | Populates task data when task created |
| `HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.js` | UE | Task sync | Updates case with new task data |
| `HUL_DEV/Service/hul_tech_assigned_on_task_ue.js` | UE | Tech assignment | Updates case when tech assigned |
| `HUL_DEV/Global/hul_dupe_custom_form_id_on_case_ue.js` | UE | Form ID | Duplicates form ID |

### Task (record.Type.TASK)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_rentaltask.js` | UE | Rental status | Updates object status based on task result |
| `SNA/sna_hul_ue_task.js` | UE | Task fields | Task field updates |
| `sna_hul_ue_taskl_preferred_route_code.js` | UE | Route code | Sets preferred route code |
| `HUL_DEV/Service/hul_clone_project_userNotes_to_task_ue.js` | UE | Notes | Clones project notes to task |

### Project (record.Type.JOB)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `SNA/sna_hul_ue_project.js` | UE | Project setup | Project field management |
| `HUL_DEV/Service/hul_dupe_ea_to_static_create_ue.js` | UE | Equipment asset | Duplicates EA to static field |

### Purchase Order (record.Type.PURCHASE_ORDER)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_purchaseorder.js` | UE | PO setup | PO field management |
| `sna_hul_ue_po_temporaryitem.js` | UE | Temp items | Handles temporary items on PO |
| `sna_hul_ue_po_set_line_item_po.js` | UE | Line PO | Sets line-level PO references |
| `sna_hul_ue_link_po.js` | UE | SO link | Links PO to SO |
| `sna_hul_ue_link_so_loc.js` | UE | Location link | Links SO location |

### Item Fulfillment (record.Type.ITEM_FULFILLMENT)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_itemfulfillment.js` | UE | Fulfillment | Handles fulfillment processing, segment copying |

### Item Receipt (record.Type.ITEM_RECEIPT)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_ir_temporaryitem.js` | UE | Temp items | Handles temporary items on receipt |
| `sna_hul_ue_create_inv_transfer_on_receipt.js` | UE | Transfer | Creates inventory transfer on receipt |

### Credit Memo (record.Type.CREDIT_MEMO)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_creditmemo.js` | UE | CM processing | Credit memo field updates |
| `HUL_DEV/Finance/hul_credit_memo_do_not_sync_ue.js` | UE | Versapay | Sets do not sync for internal streams |

### Vendor Bill (record.Type.VENDOR_BILL)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_vb_update_ir_rate.js` | UE | Rate update | Updates item receipt rate from VB |
| `SNA/sn_hul_ue_link_vb_to_je.js` | UE | JE link | Links vendor bill to journal entry |

### Customer (record.Type.CUSTOMER)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_update_sales_matrix_on_customer.js` | UE | Sales matrix | Updates sales rep matrix |
| `sna_hul_ue_customersiteasset.js` | UE | Site asset | Manages customer site assets |

### Time Bill (record.Type.TIME_BILL)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_timebill.js` | UE | SO link | Links time entries to sales orders |

### Estimate (record.Type.ESTIMATE)
| Script | Type | Purpose | Key Actions |
|--------|------|---------|-------------|
| `sna_hul_ue_quote.js` | UE | Quote | Quote/estimate processing |
| `sna_hul_ue_lock_quote_convresion.js` | UE | Conversion lock | Locks quote conversion |

### Custom Records

#### Field Service Asset (customrecord_nx_asset)
| Script | Type | Purpose |
|--------|------|---------|
| `sna_hul_ue_nxasset.js` | UE | Asset field management |
| `HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_ue.js` | UE | Check-in case link |

#### Equipment Object (customrecord_sna_objects)
| Script | Type | Purpose |
|--------|------|---------|
| `sna_hul_ue_object.js` | UE | Object field management |

#### Vendor Price (customrecord_sna_hul_vendorprice)
| Script | Type | Purpose |
|--------|------|---------|
| `sna_hul_ue_vendorprice.js` | UE | Vendor pricing updates |

---

## Known Gotchas & Discoveries

**IMPORTANT:** Update this section when you discover field quirks, unexpected behaviors, or important patterns.

### Field Quirks

| Field | Record | Gotcha |
|-------|--------|--------|
| `entityid` | Project (job) | Contains formatted string like "95902 Billable 95902 1776 Bromley Dr...". Extract number with `entityid.split(' ')[0]` |
| `companyname` | Project (job) | **83 character limit**. Truncate names that exceed this. |
| `custentity_nx_project_type` | Project (job) | Use `.getText()` not `.getValue()` to get display value like "PM 360D" |
| `status` | Task | Static list - `BUILTIN.DF()` not supported in SuiteQL. Use raw value. |
| `custpage_*` fields | Suitelet | TEXT type has 300 char limit. Use LONGTEXT for storing comma-separated IDs. |

### Processing Order Requirements

| Scenario | Required Order | Reason |
|----------|---------------|--------|
| Address change updates | Equipment → Projects → Cases → Tasks | FSM module requires equipment parent updated first |
| SO to Invoice | Complete fulfillment first | Billing depends on fulfillment status |

### Script ID Limits

NetSuite truncates script/deployment IDs. The max length appears to be ~38 characters for script IDs and deployment IDs:
- `customscript_hul_mr_address_change_update` → truncated to `customscript_hul_mr_address_change_updat`
- Always verify the actual ID in NetSuite after creation

### UE Script Conflicts

When programmatically updating records, be aware:
- **Sales Orders** have 14+ UE scripts - bulk updates can be slow
- **Cases** have 8+ UE scripts - task updates cascade to case updates
- Use `record.submitFields()` instead of `record.load()/save()` when possible to minimize triggers

### Multi-Select Field Preservation

When updating records with multi-select fields (like `custentity_nxc_project_assets`), the field may be cleared on save. Always:
1. Read the current value before making changes
2. Explicitly re-set the value before saving

```javascript
var equipmentAssets = rec.getValue({ fieldId: 'custentity_nxc_project_assets' });
// ... make other changes ...
if (equipmentAssets) {
    rec.setValue({ fieldId: 'custentity_nxc_project_assets', value: equipmentAssets });
}
rec.save();
```

### SuiteQL vs Search API

| Use Case | Recommended | Reason |
|----------|-------------|--------|
| Simple lookups | `search.lookupFields()` | Fastest, lowest governance |
| Complex joins | SuiteQL | More flexible, SQL-like |
| Large datasets | `query.runSuiteQLPaged()` | Handles 500k+ records |
| Real-time UI | Search API | Better for dynamic filters |

### SuiteQL NOT_EXPOSED Fields (CRITICAL)

**IMPORTANT:** These fields cause `NOT_EXPOSED - Field is marked as internal for channel SEARCH` errors. Always use the workarounds.

| Field | Table | Status | Workaround |
|-------|-------|--------|------------|
| `tl.amount` | transactionline | **NOT_EXPOSED** | Use `tl.netamount` |
| `tl.line` | transactionline | **NOT_EXPOSED** | Use `tl.linesequencenumber` |
| `tl.debit` | transactionline | **NOT_EXPOSED** | Use `transactionaccountingline.debit` |
| `tl.credit` | transactionline | **NOT_EXPOSED** | Use `transactionaccountingline.credit` |
| `tal.memo` | transactionaccountingline | **NOT_FOUND** | No workaround - field doesn't exist |
| `t.createdfrom` | transaction | **NOT_EXPOSED** | Use Search API instead (see below) |
| `t.subsidiary` | transaction | **NOT_EXPOSED** | No workaround - remove from queries |
| `t.shipzip` | transaction | **NOT_EXPOSED** | JOIN `transactionShippingAddress` table |
| `t.location` | transaction | **REMOVED** | Use `tl.location` from transactionline (see below) |

**Transaction Linking with createdfrom:**
```javascript
// WRONG - createdfrom is NOT_EXPOSED in SuiteQL
const sql = `SELECT * FROM transaction WHERE createdfrom = ${soId}`;

// CORRECT - Use Search API for createdfrom filtering
const ifSearch = search.create({
    type: search.Type.ITEM_FULFILLMENT,
    filters: [
        ['createdfrom', 'anyof', soId],  // Works in Search API!
        ['mainline', 'is', 'F']
    ],
    columns: ['internalid', 'tranid', 'trandate']
});
```

**Correct transactionline Query Pattern:**
```javascript
// WRONG - will fail with NOT_EXPOSED error
SELECT tl.line, tl.amount FROM transactionline tl

// CORRECT - use exposed alternatives
SELECT
    tl.linesequencenumber AS line,
    tl.netamount AS amount
FROM transactionline tl
WHERE tl.mainline = 'F'
  AND tl.taxline = 'F'
```

**Getting Debit/Credit Amounts (use transactionaccountingline):**
```javascript
// WRONG - debit/credit NOT_EXPOSED on transactionline
SELECT SUM(tl.debit) FROM transactionline tl WHERE tl.transaction = ?

// CORRECT - use transactionaccountingline for GL amounts
SELECT
    SUM(tal.debit) AS total_debit,
    SUM(tal.credit) AS total_credit
FROM transactionaccountingline tal
WHERE tal.transaction = ?
  AND tal.posting = 'T'
```

**Joining transactionaccountingline to transactionline (CRITICAL):**
```javascript
// WRONG - tal.transactionline is a line NUMBER, not an internal ID
JOIN transactionline tl ON tal.transaction = tl.transaction AND tal.transactionline = tl.id

// CORRECT - match using linesequencenumber
JOIN transactionline tl ON tal.transaction = tl.transaction
  AND tal.transactionline = tl.linesequencenumber
```

**GL Plugin Custom Lines:**
Custom GL Plugin entries may have transactionline values that don't correspond to actual item lines.
For GL Plugin reclass detection (COGS-to-WIP), look for the unique pattern:
- Standard IF posting creates: COGS **Debit** + Inventory Credit
- GL Plugin reclass adds: COGS **Credit** + WIP Debit
```javascript
// Detect GL Plugin reclass entries by account pattern
// COGS credit or WIP debit on IF = reclass occurred
SELECT tal.transaction, tal.debit, tal.credit, a.acctnumber
FROM transactionaccountingline tal
JOIN account a ON tal.account = a.id
WHERE tal.transaction IN (?)
  AND tal.posting = 'T'
  AND (
      (a.acctnumber LIKE '138%' AND tal.debit > 0)   -- WIP debit
      OR
      (a.acctnumber LIKE '540%' AND tal.credit > 0)  -- COGS credit (reversal)
  )
```
Note: `memo` field is NOT available on transactionaccountingline in SuiteQL.

**Required Filters for transactionline:**
```javascript
AND tl.mainline = 'F'     // REQUIRED: Exclude main/summary lines
AND tl.taxline = 'F'      // RECOMMENDED: Exclude tax lines
AND tl.item IS NOT NULL   // RECOMMENDED: Exclude lines without items
```

**Sign Handling (amounts can be negative for credits/returns):**
```javascript
ABS(tl.netamount) AS amount   // Use ABS() if you need positive values
ABS(tl.quantity) AS quantity
```

**Transaction Location (t.location is REMOVED):**
```javascript
// WRONG - t.location is REMOVED in SuiteQL
SELECT t.id, t.tranid, t.location FROM transaction t
// Error: Field 'location' for record 'transaction' was not found. Reason: REMOVED

// CORRECT - Use line-level location from transactionline
SELECT t.id, t.tranid, tl.location
FROM transaction t
JOIN transactionline tl ON t.id = tl.transaction
WHERE tl.mainline = 'F'
  AND tl.linesequencenumber = 1  -- Get first line's location (or use specific line)

// For SO header display, get location from any item line
SELECT DISTINCT tl.location, loc.name AS location_name
FROM transactionline tl
LEFT JOIN location loc ON tl.location = loc.id
WHERE tl.transaction = ?
  AND tl.mainline = 'F'
  AND tl.location IS NOT NULL
FETCH FIRST 1 ROW ONLY
```

### Search API Column Limitations (CRITICAL)

Some fields that work in `record.load()` are NOT available as Search API columns:

| Field | Search API | record.load() | Workaround |
|-------|------------|---------------|------------|
| `orderline` | **INVALID** | ✓ Available | Use `item` for bulk matching, or load records |

**orderline Column Error:**
```javascript
// WRONG - throws "invalid column" error
search.create({
    type: search.Type.ITEM_FULFILLMENT,
    columns: [
        search.createColumn({ name: 'orderline' })  // FAILS!
    ]
});

// WORKAROUND 1 - Use item-based matching (less precise, good for bulk)
columns: [
    search.createColumn({ name: 'item' })  // Works, match by item instead
]

// WORKAROUND 2 - Load record to get orderline (accurate, slower)
const rec = record.load({ type: record.Type.ITEM_FULFILLMENT, id: ifId });
const orderline = rec.getSublistValue({ sublistId: 'item', fieldId: 'orderline', line: i });
```

### Search API 4000 Result Limit (CRITICAL)

`search.run().each()` throws an error if results exceed 4000:
```
Error: No more than 4000 search results may be returned at one time from nlobjSearchResultSet.forEachResult(callback)
```

**Solution: Batch the input IDs**
```javascript
// Problem: 400 SOs × 10 lines = 4000 results → FAILS
const ifSearch = search.create({
    filters: [['createdfrom', 'anyof', allSoIds], ...]  // Too many results!
});

// Solution: Process in batches of 50
const BATCH_SIZE = 50;  // 50 × 10 lines = 500 results per batch (safe)
const batches = [];
for (let i = 0; i < soIds.length; i += BATCH_SIZE) {
    batches.push(soIds.slice(i, i + BATCH_SIZE));
}

const resultMap = {};
batches.forEach(batch => {
    const search = search.create({
        filters: [['createdfrom', 'anyof', batch], ...]  // Only this batch
    });
    search.run().each(function(result) {
        // Merge results into shared map
        return true;
    });
});
```

**Batch Size Guidelines:**
- Use 50 for transactions with ~10 lines each (500 results/batch)
- Use 100 for simple records with 1-2 lines (200 results/batch)
- Always leave headroom under 4000

### Revenue Stream Logic

Revenue stream (`cseg_sna_revenue_st`) is critical:
- Stream 416 = Rental
- Internal streams (don't sync to Versapay): 2, 9-45, 131-147, etc.
- Always check `custrecord_sna_hul_revstreaminternal` on the segment record

---

<!--
## NetSuite Table Styling Guide

**NOTE:** This section is commented out for now. Will revisit later as a UI/UX requirement for creating NetSuite tables.

When creating custom HTML tables in Suitelets that should match NetSuite's native look, use these exact CSS values extracted from NetSuite's production CSS files.

### Complete Table CSS Template

```css
/* Full-width wrapper - breaks out of NetSuite form constraints */
.ar-full-width-wrapper {
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    width: 100vw;
    padding: 0 20px;
    box-sizing: border-box;
}

/* Table Section Container - border on left, right, bottom only */
.ar-table-section {
    margin-top: 15px;
    border: 1px solid #B4B4B4;
    border-top: none;
}

/* Title Bar - light blue background, dark blue text */
.ar-table-header {
    font-size: 14px;
    font-weight: bold;
    color: #243857;
    background: #E0E6EF;
    padding: 6px 10px;
    margin: 0 0 1px 0;  /* 1px gap between title and table */
}

/* Table Base */
.ar-sortable-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, Helvetica, sans-serif;
    border: none;
    background: white;
}

/* Column Headers - small, gray, uppercase, NO borders */
.ar-sortable-table thead th {
    background: #E5E5E5;
    padding: 8px 10px;
    text-align: left;
    font-weight: normal;
    color: #666666;
    border: none;
    font-size: 11px;
    text-transform: uppercase;
}

/* Sortable Header Hover */
.ar-sortable-table thead th.sortable { cursor: pointer; }
.ar-sortable-table thead th.sortable:hover { background: #D8D8D8; }
.ar-sortable-table thead th.sort-asc::after { content: ' ▲'; font-size: 8px; }
.ar-sortable-table thead th.sort-desc::after { content: ' ▼'; font-size: 8px; }

/* Data Rows - alternating colors */
.ar-sortable-table tbody tr { background: #FFFFFF; }
.ar-sortable-table tbody tr:nth-child(even) { background: #FAFAFA; }
.ar-sortable-table tbody tr:hover { background: #FFFFE5; }

/* Data Cells - larger text than headers, left-aligned */
.ar-sortable-table tbody td {
    padding: 8px 10px;
    color: #333333;
    font-size: 13px;
    border-bottom: 1px solid #EBEBEB;
    text-align: left;
}

/* Links */
.ar-sortable-table tbody td a { color: #316DA1; text-decoration: none; }
.ar-sortable-table tbody td a:hover { text-decoration: underline; }
```

### Key NetSuite Color Values

| Element | Color | Hex Code |
|---------|-------|----------|
| Title bar background | Light blue | `#E0E6EF` |
| Title bar text | Dark navy | `#243857` |
| Header row background | Light gray | `#E5E5E5` |
| Header text | Gray | `#666666` |
| Table border | Gray | `#B4B4B4` |
| Row border | Light gray | `#EBEBEB` |
| Cell text | Dark gray | `#333333` |
| Link color | Blue | `#316DA1` |
| Even row background | Off-white | `#FAFAFA` |
| Hover row background | Yellow | `#FFFFE5` |

### Key Sizing Values

| Element | Property | Value |
|---------|----------|-------|
| Title bar | font-size | `14px` |
| Title bar | padding | `6px 10px` |
| Column headers | font-size | `11px` |
| Column headers | padding | `8px 10px` |
| Data cells | font-size | `13px` |
| Data cells | padding | `8px 10px` |

### Important Rules

1. **Title bar has NO border** - only the table section container has borders (left, right, bottom)
2. **Column headers have NO borders** - not top, not bottom
3. **Headers are NOT bold** - use `font-weight: normal`
4. **Headers are uppercase** - use `text-transform: uppercase`
5. **Data text is larger than headers** - 13px vs 11px
6. **Padding must match** between headers and cells for alignment (both `8px 10px`)
7. **1px margin-bottom on title** - creates subtle separation from header row
8. **Data cells left-aligned** - use `text-align: left` explicitly

### HTML Structure

```html
<div class="ar-full-width-wrapper">
    <div class="ar-table-section">
        <div class="ar-table-header">Title (X items)</div>
        <table class="ar-sortable-table">
            <thead>
                <tr>
                    <th>COLUMN 1</th>
                    <th>COLUMN 2</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Data 1</td>
                    <td>Data 2</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

### INLINEHTML Layout Gotcha

**CRITICAL:** Multiple INLINEHTML fields in a NetSuite form will render **side-by-side**, not vertically stacked. To fix:
- Combine all related content (stats boxes + table) into a **single INLINEHTML field**
- Use the `.ar-full-width-wrapper` CSS to break out of form container constraints
- Remove any separate info header fields that could cause side-by-side rendering
-->
