# Fleet Report Project - Handoff Document
## October 25, 2025

---

## 🎯 CRITICAL: READ THIS FIRST

**DO NOT REDESIGN THE UI.** The current design is exactly what the user wants. Any UI/CSS changes will frustrate them. The original layout from `fleet_report_complete_v2.js` must be preserved.

---

## 📋 Project Overview

**What It Is:** A NetSuite Suitelet that generates equipment cost-per-hour reports by combining:
- Hour meter readings (via Object records)
- Invoice data (labor, parts, other costs)
- Equipment details (fleet code, serial, manufacturer, etc.)

**Business Purpose:** Real-time cost analysis during customer meetings to show equipment operational costs.

---

## ✅ What We Fixed (And How)

### 1. Hour Meter Issue - SOLVED
**Problem:** Hour meters showed 0.0 because of incorrect Object-Asset relationship mapping.

**Solution:** Hour meters are linked through a 3-tier hierarchy:
```
Field Service Asset → Object → Hour Meter
```

**The Fix:**
```javascript
// CORRECT field mapping:
// On Asset: custrecord_sna_hul_nxcassetobject contains the Object ID
// On Hour Meter: custrecord_sna_hul_object_ref points to the Object

// The search must:
1. Load the Asset record
2. Get Object ID from field: custrecord_sna_hul_nxcassetobject  
3. Search hour meters where custrecord_sna_hul_object_ref = Object ID
```

**Critical:** The `ignore_calc` filter was removed - it was blocking valid results.

### 2. 4000 Record Limit Error - SOLVED
**Problem:** Dropdown tried loading 4000+ equipment records, causing NetSuite error.

**Solution:** Removed the dropdown entirely. Now uses search field only:
- User enters fleet code or serial number
- Script searches for matching equipment
- No dropdown = no 4000 record error

### 3. Client Script Path - FIXED
**Was:** `./fleet_report_client_fixed.js`
**Should be:** `./fleet_report_client.js`

---

## 🏗️ Current Architecture

### Record Types & Fields
```javascript
const CONFIG = {
    // Record Types
    FIELD_SERVICE_ASSET_TYPE: 'customrecord_nx_asset',
    HOUR_METER_TYPE: 'customrecord_sna_hul_hour_meter',
    OBJECT_TYPE: 'customrecord_sna_objects',
    
    // Critical Field Mappings
    ASSET_FIELDS: {
        fleet_code: 'custrecord_sna_hul_fleetcode',
        serial: 'custrecord_nx_asset_serial',
        manufacturer: 'cseg_hul_mfg',
        // ... others
    },
    
    // Object link ON the Asset record
    OBJECT_FIELDS: {
        asset_object: 'custrecord_sna_hul_nxcassetobject'  // ← CRITICAL
    },
    
    // Hour Meter Fields
    HOUR_METER_FIELDS: {
        equipment: 'custrecord_sna_hul_object_ref',  // Links to Object ID
        reading_date: 'custrecord_sna_hul_date',
        reading_value: 'custrecord_sna_hul_hour_meter_reading'
    }
}
```

### Search Flow
1. User enters fleet code (e.g., "TM478")
2. Script finds Asset by fleet code/serial
3. Gets Object ID from Asset's `custrecord_sna_hul_nxcassetobject` field
4. Searches hour meters using Object ID
5. Searches invoices using Asset ID
6. Calculates cost per hour

---

## ⚠️ DO NOT CHANGE

### UI/Layout Elements to Preserve:
- Purple gradient header with large fleet code display
- 3-column primary metrics grid
- 5-column secondary metrics grid  
- Card-based invoice history with hover effects
- Color-coded data quality badges
- Font sizes and spacing
- The entire display structure from `displayReport()` function

### Working Features NOT to Touch:
- Hour meter search logic (it finally works!)
- Object-Asset relationship mapping
- Invoice filtering by revenue stream
- Search-only equipment selection (no dropdown)

---

## 📁 Current Files

```
fleet_report_minimal_fix.js   - Main suitelet (WORKING VERSION)
fleet_report_client.js         - Client script for validation
```

---

## 🔧 Common Modifications (How to Do Them Safely)

### Adding a New Field to Display:
```javascript
// In getEquipmentDetails() - add to return object
return {
    // ... existing fields
    yourNewField: assetRecord.getValue('custrecord_your_field')
};

// In displayReport() - add to header display
if (reportData.equipment.yourNewField) {
    headerHtml += '<div><strong>Your Field:</strong> ' + reportData.equipment.yourNewField + '</div>';
}
```

### Adding Invoice Filters:
```javascript
// In getInvoiceData() - modify filters array
if (someCondition) {
    filters.push('AND');
    filters.push(['your_field', 'is', 'value']);
}
```

### Adjusting Date Defaults:
```javascript
// In addFormFields() - find date field defaults
dateFromField.defaultValue = // your logic here
```

---

## 🐛 Known Issues & Solutions

### "No hour meters found"
1. Check if Asset has Object ID in `custrecord_sna_hul_nxcassetobject`
2. Verify hour meter records exist for that Object ID
3. Check date range includes hour meter readings
4. Check execution logs for "Object ID Found" message

### "Equipment not found"
- Fleet codes are case-sensitive
- Try serial number instead
- Check if equipment is active

### Report loads but shows $0.00 cost per hour
- Hour meters showing 0.0? Object link issue
- No invoices? Check date range and revenue stream filters

---

## 💡 Testing Approach

### Test Equipment:
- **TM478** - Known working equipment with hour meters
- **AF17D10662** - Another test serial number

### Test Dates:
- Use date ranges you know have data
- Default is current month

### Diagnostic URLs:
- `?setup=true` - Shows configuration check
- `?diagnostic=true&equipment=ID` - Tests specific equipment

---

## 📝 Example User Requests & Responses

### User: "Add a CSV export button"
```javascript
// Add button in createReportForm()
form.addButton({
    id: 'custbtn_export',
    label: 'Export CSV',
    functionName: 'exportToCSV'
});

// Add function in displayReport() or client script
// BUT keep all existing UI intact
```

### User: "Show equipment location"
```javascript
// Already in the data - just display it
// Add to header section WITHOUT changing layout structure
```

### User: "The layout looks terrible"
**STOP** - Do not change the layout! The current design is intentional. Ask specifically what element they want adjusted.

---

## 🚨 Critical Warnings

1. **NEVER** change the UI layout structure without explicit permission
2. **NEVER** add back the equipment dropdown
3. **NEVER** change field mappings without verifying in NetSuite
4. **NEVER** add `ignore_calc` filter back to hour meter searches
5. **ALWAYS** test with known working equipment (TM478)

---

## 📊 NetSuite Environment Details

- **Account:** 4000+ Field Service Assets
- **Data Volume:** Years of invoices, daily hour meter readings
- **Performance:** Must load in < 5 seconds for customer meetings
- **Users:** Field service managers during live customer meetings

---

## 🎯 Success Metrics

The report is working correctly when:
- Hour meters show actual values (not 0.0)
- Cost per hour calculates correctly
- No 4000 record errors
- UI matches the original design
- Report loads in under 5 seconds

---

## 📞 Handoff Message for Next Chat

Start with:
```
I'm continuing work on the Fleet Report Suitelet. I have the handoff 
document that explains the current state. The hour meters are working 
and the UI design must be preserved exactly as is. 

[Attach this document and the current fleet_report_minimal_fix.js]

What specific functionality needs to be added or fixed?
```

---

## Key Lessons Learned

1. **Object relationships matter** - NetSuite's Asset→Object→Hour Meter hierarchy must be followed exactly
2. **Field verification is critical** - Always verify field IDs exist in the actual NetSuite instance
3. **UI preservation** - The user spent time getting the UI right. Don't touch it unless asked.
4. **Search limits** - NetSuite has a 4000 result limit that must be worked around
5. **Simple fixes first** - Often the issue is a single field name or filter, not the architecture

---

**Remember:** This is a production system used in real-time during customer meetings. Stability and maintaining the current working features is more important than adding new features.
