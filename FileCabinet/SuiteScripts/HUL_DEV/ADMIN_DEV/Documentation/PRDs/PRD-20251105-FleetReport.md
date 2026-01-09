# Fleet Report Equipment Cost Analysis - Project Documentation

## 📋 Project Overview

**Purpose:** Provide real-time cost-per-hour analysis for equipment by combining repair history, hour meter readings, and maintenance data to support customer communication and fleet management decisions.

**Business Problem:** Sales and service managers need accurate equipment operational cost data during customer meetings to justify maintenance expenses, evaluate rental fleet profitability, and make informed decisions about equipment lifecycle management.

**Solution:** Interactive web-based report that calculates cost per operating hour by analyzing repair invoices against hour meter readings, with visual indicators for data quality and detailed repair history.

---

## 🎯 Current Features (v2.3)

### Core Functionality
1. **Equipment Cost Analysis**
   - Cost per operating hour calculation
   - Total repair cost tracking
   - Labor vs. parts cost breakdown
   - Average repair cost metrics
   - Revenue stream filtering (warranty/internal exclusion)

2. **Hour Meter Integration**
   - Searches through Object record hierarchy (Asset → Object → Hour Meter)
   - Fallback to direct Asset search
   - Data quality indicators (HIGH/MEDIUM/LOW/NO_DATA)
   - Validation for meter decreases or resets
   - Period-based hour calculations

3. **Invoice Processing**
   - Direct case details retrieval via search joins
   - Labor hours and cost aggregation
   - Parts cost tracking
   - Service code type categorization
   - Chronological invoice history (newest first)

4. **Search-Only Equipment Selection**
   - Fleet code or serial number search
   - No dropdown (avoids 4000 record limit)
   - Customer filtering (optional)
   - Case-insensitive search with fallback to contains

5. **Data Quality Management**
   - Hour meter validation with visual badges
   - Missing data handling with graceful degradation
   - Diagnostic mode for troubleshooting
   - Detailed execution logging

---

## 🔧 File Information

### Current Production Files
**Main Suitelet:** `hul_sl_fleet_report.js`
**Client Script:** `fleet_report_client.js`
**Type:** NetSuite Suitelet with Client Script validation
**Size:** ~45KB (main), ~3KB (client)
**Last Updated:** October 2025

### Key Script Parameters
- **Script ID:** customscript_hul_sl_fleet_report
- **Deployment ID:** customdeploy_hul_sl_fleet_report
- **Execution Context:** User Interface
- **Governance:** ~50-100 units per execution

---

## 🗄️ NetSuite Data Model

### Custom Fields Configuration
```javascript
// Asset Record Fields
custrecord_sna_hul_fleetcode       // Fleet code identifier
custrecord_nx_asset_serial         // Serial number
custrecord_sna_hul_nxcassetobject  // Links to Object record (CRITICAL)
cseg_hul_mfg                       // Manufacturer segment
custrecord_nx_asset_customer       // Customer reference

// Hour Meter Fields
custrecord_sna_hul_object_ref      // Links to Object (not Asset!)
custrecord_sna_hul_date            // Reading date
custrecord_sna_hul_hour_meter_reading // Meter value
custrecord_sna_hul_actual_reading  // Actual vs. calculated flag

// Invoice Fields
custbody_sna_hul_nxc_eq_asset     // Equipment on invoice body
custbody_nx_case                   // Links to Support Case (v2.3 fix)
cseg_sna_revenue_st                // Revenue stream segment

// Support Case Fields
custevent_nx_case_details          // Case description/details
```

### Record Type Hierarchy
```
Field Service Asset (customrecord_nx_asset)
├── Object ID (custrecord_sna_hul_nxcassetobject)
│   └── Object (customrecord_sna_objects)
│       └── Hour Meters (customrecord_sna_hul_hour_meter)
│           └── via custrecord_sna_hul_object_ref
└── Customer (custrecord_nx_asset_customer)
    └── Customer Record

Invoice (transaction)
├── Equipment (custbody_sna_hul_nxc_eq_asset)
├── Support Case (custbody_nx_case)
│   └── Case Details (custevent_nx_case_details)
└── Revenue Stream (cseg_sna_revenue_st)
```

### Critical Relationships
- **Hour Meters link to Objects, NOT Assets directly**
- **Invoice → Support Case is DIRECT via custbody_nx_case (no sales order needed)**
- **Asset → Object relationship is ONE-TO-ONE**

---

## 🔧 Technical Architecture

### Main Functions

#### `onRequest(context)`
- Entry point for GET/POST requests
- Routes to setup diagnostics or main handler
- Error handling wrapper

#### `handleRequest(context)`
- Creates form and processes parameters
- Orchestrates equipment search
- Calls report generation
- Handles response rendering

#### `findEquipmentBySearch(searchText)`
- Searches by fleet code or serial
- Case-insensitive with exact then contains fallback
- Returns first matching equipment ID

#### `generateReport(equipmentId, startDate, endDate, excludeInternal)`
- **Coordinates all data retrieval:**
  - Equipment details loading
  - Hour meter data aggregation
  - Invoice search and processing
  - Summary calculations
- Returns structured report object

#### `getHourMeterData(equipmentId, startDate, endDate)`
- **Three-tier search strategy:**
  1. Load Asset → Get Object ID → Search Hour Meters
  2. Fallback: Direct Asset ID search
  3. Debug: Check for any hour meters (no date filter)
- **Data quality assessment:**
  - HIGH: >10 readings, <5% validation issues
  - MEDIUM: 5-10 readings
  - LOW: <5 readings
  - NO_DATA: No readings found

#### `getInvoiceData(equipmentId, startDate, endDate, excludeInternal)`
- **Optimized with search joins (v2.3):**
  - Single query retrieves invoice + case details
  - No separate record loads
  - Filters by revenue stream if excluding internal
- **Aggregates by service type:**
  - Labor (LAB)
  - Parts (PRT)
  - Other
- Returns sorted newest first

#### `calculateSummary(reportData)`
- Computes all derived metrics
- Handles division by zero
- Applies business rules for cost calculations

#### `displayResults(form, reportData)`
- **DO NOT MODIFY LAYOUT** - User requirement
- Generates purple gradient header
- 3-column primary metrics grid
- 5-column secondary metrics grid
- Collapsible invoice cards with case details

---

## 🎨 UI Components

### Form Layout (PRESERVE EXACTLY)
1. **Header Section** (Purple Gradient)
   - Large fleet code display (48px font)
   - Equipment details in flex layout
   - Hour meter validation warnings
   - Customer and site information

2. **Primary Metrics Grid** (3 columns)
   - Cost Per Hour (highlighted purple)
   - Total Repair Cost
   - Labor Cost with hours

3. **Secondary Metrics Grid** (5 columns)
   - Parts Cost
   - Hours Operated (with quality badge)
   - Repairs count
   - Total Labor Hours
   - Average Repair Cost

4. **Invoice History Cards**
   - Collapsible details sections
   - Most recent 3 highlighted
   - Case details in blue callout box
   - Line items table with hover effects

### Visual Indicators
- **Data Quality Badges:**
  - 🟢 HIGH (green #28a745)
  - 🟡 MEDIUM (yellow #ffc107)
  - 🔴 LOW/NO_DATA (red #dc3545)
- **Revenue Stream Tags:** Light blue background (#e3f2fd)
- **Most Recent Badge:** Purple background (#667eea)

---

## 📊 Performance Metrics

### Governance Usage
- **Equipment search:** ~5 units
- **Hour meter aggregation:** ~20-30 units
- **Invoice search:** ~30-50 units
- **Total per execution:** ~50-100 units

### Response Times
- **Target:** <5 seconds for customer meetings
- **Typical equipment:** 2-3 seconds
- **Heavy history (100+ invoices):** 4-5 seconds
- **No data found:** <1 second

### Data Volumes
- **Hour Meters:** Daily readings (365+/year per equipment)
- **Invoices:** 10-50 per equipment per year typical
- **Line Items:** 5-20 per invoice average

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No Dropdown Selection**
   - Removed due to 4000 record limit
   - Search-only interface by design
   - Cannot browse available equipment

2. **Hour Meter Quality**
   - Depends on Object relationship existing
   - Cannot handle meter replacements
   - Assumes forward-only progression

3. **Invoice Scope**
   - Only shows direct equipment matches
   - No parent/child equipment rollup
   - No multi-equipment invoice splitting

4. **Date Range Processing**
   - Single continuous range only
   - No period comparison
   - No seasonality adjustments

### NetSuite-Specific Constraints
1. **Search Result Limits**
   - 4000 rows maximum without pagination
   - Avoided by removing dropdown

2. **Custom Segment Access**
   - Revenue stream requires proper permissions
   - Manufacturer segment may not populate

3. **Object Relationship**
   - Not all assets have Object IDs
   - Legacy data may use different structure

---

## 🚀 Future Enhancements

### High Priority (Planned)
1. **Enhanced Case Details Integration**
   - Display maintenance checklists from cases
   - Show technician photos/attachments
   - Include individual task actions/notes
   - Link to related work orders

2. **Expanded Invoice Information**
   - Technician who performed work
   - Specific repair codes and descriptions
   - Warranty claim status
   - Follow-up recommendations

3. **Task-Level Detail View**
   - Individual technician actions
   - Time spent per task
   - Materials used per task
   - Task completion validation

4. **Export Functionality**
   - Excel export with full details
   - PDF report generation
   - Email scheduled reports
   - API endpoint for integration

### Medium Priority
5. **Multi-Equipment Comparison**
   - Side-by-side cost analysis
   - Fleet-wide benchmarking
   - Equipment class averages
   - Manufacturer comparisons

6. **Predictive Analytics**
   - Maintenance interval optimization
   - Failure prediction modeling
   - Cost trend forecasting
   - Lifecycle recommendations

7. **Mobile Optimization**
   - Responsive design for tablets
   - Touch-friendly interface
   - Offline data caching
   - Native app integration

### Low Priority
8. **Advanced Filtering**
   - Multiple equipment selection
   - Custom date ranges
   - Service type filtering
   - Technician filtering

9. **Historical Trending**
   - Year-over-year comparisons
   - Seasonal adjustments
   - Moving averages
   - Regression analysis

10. **Integration Features**
    - Telematics data import
    - Third-party maintenance systems
    - Accounting system sync
    - Customer portal access

---

## 💡 Implementation Ideas

### Enhanced Case Details Example
```javascript
// In getInvoiceData() - Add case attachment search
if (caseId) {
    var attachmentSearch = search.create({
        type: 'file',
        filters: [
            ['internalid', 'anyof', caseAttachments]
        ],
        columns: ['name', 'url', 'filetype']
    });

    invoice.attachments = [];
    attachmentSearch.run().each(function(result) {
        invoice.attachments.push({
            name: result.getValue('name'),
            url: result.getValue('url'),
            type: result.getValue('filetype')
        });
        return true;
    });
}

// In displayResults() - Show attachments
if (invoice.attachments && invoice.attachments.length > 0) {
    detailsHtml += '<div class="attachments-section">';
    detailsHtml += '<h4>📎 Attachments</h4>';
    invoice.attachments.forEach(function(file) {
        if (file.type.indexOf('image') >= 0) {
            detailsHtml += '<a href="' + file.url + '" target="_blank">';
            detailsHtml += '<img src="' + file.url + '" style="max-width: 200px; margin: 5px;">';
            detailsHtml += '</a>';
        } else {
            detailsHtml += '<a href="' + file.url + '" target="_blank">📄 ' + file.name + '</a><br/>';
        }
    });
    detailsHtml += '</div>';
}
```

### Task Details Integration Example
```javascript
// Search for tasks related to the case
var taskSearch = search.create({
    type: 'task',
    filters: [
        ['custevent_linked_case', 'anyof', caseId]
    ],
    columns: [
        'title',
        'assigned',
        'custevent_task_notes',
        'custevent_time_spent',
        'status'
    ]
});

var tasks = [];
taskSearch.run().each(function(result) {
    tasks.push({
        title: result.getValue('title'),
        technician: result.getText('assigned'),
        notes: result.getValue('custevent_task_notes'),
        timeSpent: result.getValue('custevent_time_spent'),
        status: result.getText('status')
    });
    return true;
});
```

### Export to Excel Example
```javascript
// Add export button
form.addButton({
    id: 'custpage_export',
    label: 'Export to Excel',
    functionName: 'exportToExcel'
});

// Client script function
function exportToExcel() {
    var csvContent = 'Date,Invoice,Customer,Labor,Parts,Other,Total,Case Details\n';

    // Build CSV from page data
    reportData.invoices.forEach(function(inv) {
        csvContent += inv.date + ',' +
                     inv.number + ',' +
                     '"' + inv.customer + '",' +
                     inv.laborTotal + ',' +
                     inv.partsTotal + ',' +
                     inv.otherTotal + ',' +
                     inv.total + ',' +
                     '"' + (inv.caseDetails || '').replace(/"/g, '""') + '"\n';
    });

    // Trigger download
    var blob = new Blob([csvContent], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'fleet_report_' + equipmentId + '.csv';
    a.click();
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Valid Equipment with Full Data
- **Equipment:** TM478
- **Date Range:** Current month
- **Expected:** Cost per hour calculated, invoices displayed
- **Result:** ✅ Working

### Test Case 2: Equipment without Object ID
- **Equipment:** Legacy asset without Object link
- **Expected:** Fallback to direct Asset search
- **Result:** ✅ Working with fallback

### Test Case 3: No Hour Meter Data
- **Equipment:** New equipment
- **Expected:** "NO_DATA" quality indicator, $0.00 cost per hour
- **Result:** ✅ Handles gracefully

### Test Case 4: Warranty/Internal Exclusion
- **Equipment:** Any
- **Filter:** Exclude internal checked
- **Expected:** Warranty/internal invoices filtered out
- **Result:** ✅ Working

### Test Case 5: Case Details Display
- **Equipment:** Any with support cases
- **Expected:** Case details shown in blue callout
- **Result:** ✅ Working (v2.3 fix)

---

## 📝 Code Maintenance Notes

### Key Configuration Variables
```javascript
// Line ~39-90: CONFIG object with all field mappings
const CONFIG = {
    FIELD_SERVICE_ASSET_TYPE: 'customrecord_nx_asset',
    HOUR_METER_TYPE: 'customrecord_sna_hul_hour_meter',
    // ... CRITICAL: Update here when field IDs change
};

// Line ~1037: Grid layouts - DO NOT CHANGE
grid-template-columns: repeat(3, 1fr);  // Primary metrics
grid-template-columns: repeat(5, 1fr);  // Secondary metrics
```

### Common Customizations

**Adding New Equipment Fields:**
```javascript
// In CONFIG.ASSET_FIELDS, add:
new_field: 'custrecord_new_field_id'

// In getEquipmentDetails(), add:
details.newField = equipmentRec.getValue(CONFIG.ASSET_FIELDS.new_field);

// In displayResults() header, add:
if (reportData.equipment.newField) {
    headerHtml += '<div><strong>New Field:</strong> ' + reportData.equipment.newField + '</div>';
}
```

**Modifying Date Defaults:**
```javascript
// In addFormFields() ~line 320
// Current: First day of current month
var today = new Date();
var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
// Change to: Last 30 days
var firstDay = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
```

**DO NOT MODIFY:**
- UI layout structure in displayResults()
- Grid column counts
- Color scheme (purple #667eea, #764ba2)
- Equipment dropdown (keep removed)
- Object→Hour Meter relationship logic

---

## 🚨 Deployment & Version Control

### SDF Deployment Process
```bash
# 1. Setup SDF in sandbox
suitecloud account:setup

# 2. Import existing script
suitecloud file:import --paths "SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/hul_sl_fleet_report.js"

# 3. Create deploy.xml
<deploy>
    <configuration>
        <path>SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/hul_sl_fleet_report.js</path>
    </configuration>
</deploy>

# 4. Validate
suitecloud project:validate

# 5. Deploy to sandbox
suitecloud project:deploy

# 6. Test in sandbox
# 7. Deploy to production after testing
```

### Git Version Control
```bash
# Initial setup
git init
git add FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/hul_sl_fleet_report.js
git add FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/fleet_report_client.js
git commit -m "Initial commit: Fleet Report v2.3"

# Feature branch workflow
git checkout -b feature/add-task-details
# Make changes
git add -A
git commit -m "Add task details to invoice display"
git push origin feature/add-task-details

# After testing in sandbox
git checkout main
git merge feature/add-task-details
git tag -a v2.4 -m "Added task details"
git push origin main --tags
```

### Sandbox Testing Checklist
- [ ] Script deploys without errors
- [ ] Equipment search works (TM478)
- [ ] Hour meter data loads correctly
- [ ] Invoice aggregation accurate
- [ ] Case details display properly
- [ ] Data quality indicators show
- [ ] Performance <5 seconds
- [ ] No governance limit errors

---

## 🔍 Troubleshooting Guide

### Issue: "Equipment not found"
**Causes:**
- Fleet code case sensitivity
- Leading/trailing spaces
- Equipment inactive

**Solutions:**
1. Try serial number instead
2. Check exact fleet code in NetSuite
3. Verify equipment is active
4. Check execution log for search details

### Issue: Hour meters showing 0.0
**Causes:**
- Missing Object ID link
- No readings in date range
- Incorrect field mapping

**Solutions:**
1. Check `custrecord_sna_hul_nxcassetobject` on Asset
2. Verify Object ID has hour meter records
3. Expand date range
4. Check execution log for "Object ID Found" message

### Issue: Missing case details
**Causes:**
- Invoice not linked to case
- Case details field empty
- Permission issues

**Solutions:**
1. Verify `custbody_nx_case` populated on invoice
2. Check support case has details
3. Verify user has case record access

### Issue: Script timeout
**Causes:**
- Too many invoices
- Complex calculations
- Network latency

**Solutions:**
1. Reduce date range
2. Check for infinite loops in customizations
3. Review execution log for bottlenecks
4. Consider implementing pagination

---

## 📊 Success Metrics

The report is functioning correctly when:
- ✅ Hour meters show actual values (not 0.0) with quality indicators
- ✅ Cost per hour calculates accurately
- ✅ No 4000 record limit errors
- ✅ UI matches the original design exactly
- ✅ Report loads in under 5 seconds
- ✅ Case details display inline with invoices
- ✅ Revenue stream filtering works correctly
- ✅ Search finds equipment by fleet code or serial

---

## 🎓 Key Implementation Learnings

1. **Object Hierarchy Critical** - The Asset→Object→Hour Meter relationship must be traversed correctly
2. **Search Joins Save Governance** - Single query with joins beats multiple record loads
3. **UI Stability Over Features** - Preserve working UI exactly; users value consistency
4. **Fallback Strategies Required** - Always have backup search methods for data variations
5. **Data Quality Transparency** - Show confidence levels so users can trust calculations
6. **Performance First** - 5-second target for live customer meetings is non-negotiable

---

## ✅ Implementation Checklist

Current feature status:
- [x] Equipment search by fleet code/serial
- [x] Hour meter via Object lookup
- [x] Invoice aggregation with case details
- [x] Cost per hour calculation
- [x] Data quality indicators
- [x] Revenue stream filtering
- [x] Responsive grid layout
- [x] Performance optimization
- [x] Diagnostic mode
- [ ] Maintenance checklist display
- [ ] Technician photo attachments
- [ ] Task-level action details
- [ ] Excel/PDF export
- [ ] Mobile optimization
- [ ] Multi-equipment comparison

---

## 📅 Version History

### v2.3 (October 2025)
- Fixed case details retrieval via custbody_nx_case
- Massive performance improvement with search joins
- Eliminated separate record loads

### v2.1 (October 2025)
- Fixed hour meter search through Object records
- Improved compact layout with better spacing
- Enhanced debugging and logging
- Revenue stream text display

### v1.0 (September 2025)
- Initial release
- Basic cost per hour calculation
- Equipment dropdown (later removed)

---

**Document Created:** November 5, 2025
**Current Version:** v2.3
**Status:** Production Ready ✅
**Next Priority:** Add maintenance checklists and task details from support cases