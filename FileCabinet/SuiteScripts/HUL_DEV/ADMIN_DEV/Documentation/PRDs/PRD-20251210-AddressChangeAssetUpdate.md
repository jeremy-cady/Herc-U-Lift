# PRD: Address Change Asset Update Suitelet

**PRD ID:** PRD-20251210-AddressChangeAssetUpdate
**Created:** December 10, 2025
**Last Updated:** December 12, 2025
**Author:** Thomas Showalter / Claude
**Status:** Development Complete - Ready for User Feedback
**Related Scripts:**
- Suitelets/hul_sl_address_change_update.js (Suitelet)
- MapReduce/hul_mr_address_change_update.js (Map/Reduce for large batches)

---

## 1. Introduction / Overview

**What is this feature?**
A multi-step wizard Suitelet that streamlines the process of updating Field Service Assets, Cases, Projects, and Tasks when a customer changes addresses. The tool handles the complex sequencing requirement where equipment parent fields must be updated before cases, projects, and tasks.

**What problem does it solve?**
- When a customer moves addresses, updating all related FSM records is time-consuming
- Equipment assets must have their parent field updated to the new site
- Open cases need their site asset field updated while preserving equipment references
- Open projects need their site asset field updated while preserving equipment references
- Open tasks need their site asset, address, and coordinate fields updated
- FSM requires equipment parent updates to occur BEFORE case/project/task updates
- Manual process is error-prone and tedious, especially for customers with many assets
- Project, case, and task names contain the site address and need to be updated

**Primary Goal:**
Provide a guided wizard interface to safely and efficiently update all FSM records when a customer changes addresses, ensuring proper sequencing and data integrity.

---

## 2. Current Status

### Implementation Progress

| Feature | Status | Notes |
|---------|--------|-------|
| Step 1: Customer Search | Complete | Search by name or ID, displays results table |
| Step 2: Site Selection | Complete | Old site and new site dropdowns, active sites only |
| Step 3: Record Selection | Complete | Equipment, Cases, Projects, Tasks sublists with Select All/Deselect All |
| Step 4: Preview & Confirmation | Complete | Detailed preview with current/new names and "Will Change?" indicator |
| Step 5: Results Display | Complete | Success/error counts with breakdown |
| Real-time Processing | Complete | For batches < 20 records |
| MapReduce Processing | Complete | For batches >= 20 records |
| Email Notification | Complete | Sent on MapReduce completion |
| Equipment-first Sequencing | Complete | Critical FSM constraint enforced |
| Name/Title Replacement | Complete | Projects: rebuilt from fields; Cases/Tasks: string replacement |
| Project Name Rebuild | Complete | Pattern: [TYPE] [NUMBER] [SITE] with 83-char limit |
| Task Address Fields | Complete | Updates custevent_nx_address, latitude, longitude from site asset |
| Equipment Asset Preservation | Complete | Multi-select fields preserved on cases and projects |

---

## 3. Script Deployment

### Suitelet (Main Wizard UI)

**Script Record:**
| Field | Value |
|-------|-------|
| Name | HUL - Address Change Asset Update |
| ID | `customscript_hul_sl_address_change_update` |
| Script File | `SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/hul_sl_address_change_update.js` |
| Script Type | Suitelet |

**Deployment Record:**
| Field | Value |
|-------|-------|
| Title | HUL - Address Change Asset Update |
| ID | `customdeploy_hul_sl_address_change_update` |
| Status | Released |
| Log Level | Debug |
| Execute As Role | Administrator (or role with FSA/Case/Project/Task edit access) |
| Available Without Login | No |

---

### Map/Reduce (Large Batch Processing)

**Script Record:**
| Field | Value |
|-------|-------|
| Name | HUL - Address Change Asset Update MR |
| ID | `customscript_hul_mr_address_change_update` |
| Script File | `SuiteScripts/HUL_DEV/ADMIN_DEV/MapReduce/hul_mr_address_change_update.js` |
| Script Type | Map/Reduce |

**Script Parameters:**
| Parameter ID | Label | Type |
|-------------|-------|------|
| `custscript_acu_customer_id` | Customer ID | Free-Form Text |
| `custscript_acu_old_site_id` | Old Site ID | Free-Form Text |
| `custscript_acu_new_site_id` | New Site ID | Free-Form Text |
| `custscript_acu_equipment_ids` | Equipment IDs | Free-Form Text |
| `custscript_acu_case_ids` | Case IDs | Free-Form Text |
| `custscript_acu_project_ids` | Project IDs | Free-Form Text |
| `custscript_acu_task_ids` | Task IDs | Free-Form Text |
| `custscript_acu_user_email` | User Email | Free-Form Text |

**Deployment Record:**
| Field | Value |
|-------|-------|
| Title | HUL - Address Change Asset Update MR |
| ID | `customdeploy_hul_mr_address_change_update` |
| Status | Released |
| Log Level | Debug |
| Execute As Role | Administrator (or role with FSA/Case/Project/Task edit access) |
| Queue | Standard |

---

## 4. Technical Implementation Details

### Record & Field References

| Record | Type ID | Purpose |
|--------|---------|---------|
| Field Service Asset | `customrecord_nx_asset` | Sites (type=1) and Equipment (type=2) |
| Case | `supportcase` | Service cases linked to sites/equipment |
| Project | `job` | Projects linked to sites/equipment |
| Task | `task` | Tasks linked to cases with site/address info |
| Customer Addressbook | `customerAddressbook` | Address records with site linkage |

| Field ID | Record | Purpose |
|----------|--------|---------|
| `custrecord_nxc_na_asset_type` | FSA | 1 = Site, 2 = Equipment |
| `parent` | FSA (Equipment) | Links equipment to parent site |
| `custrecord_nx_asset_address_text` | FSA (Site) | Full address text |
| `custrecord_nx_asset_latitude` | FSA (Site) | GPS latitude |
| `custrecord_nx_asset_longitude` | FSA (Site) | GPS longitude |
| `custevent_nx_case_asset` | Case | Site asset reference |
| `custevent_nxc_case_assets` | Case | Equipment multi-select (preserved) |
| `title` | Case | Case subject (updated with new site) |
| `custentity_nx_asset` | Project | Site asset reference |
| `custentity_nxc_project_assets` | Project | Equipment multi-select (preserved) |
| `companyname` | Project | Project name (updated with new site) |
| `custevent_nx_task_asset` | Task | Site asset reference |
| `custevent_nx_address` | Task | Address text (updated from site) |
| `custevent_nx_latitude` | Task | GPS latitude (updated from site) |
| `custevent_nx_longitude` | Task | GPS longitude (updated from site) |
| `title` | Task | Task title (updated with new site) |
| `custrecord_sn_inactive_address` | Addressbook | Inactive address flag |
| `custrecordsn_nxc_site_asset` | Addressbook | Links address to site asset |

### Processing Sequence (Critical)

The FSM module requires this exact order:
```
Phase 1: Equipment parent field → new site ID
Phase 2: Projects site field (custentity_nx_asset) → new site ID
         Project name (companyname) → replace old site with new site
         Equipment assets (custentity_nxc_project_assets) → preserved
Phase 3: Cases site field (custevent_nx_case_asset) → new site ID
         Case subject (title) → replace old site with new site
         Equipment assets (custevent_nxc_case_assets) → preserved
Phase 4: Tasks site field (custevent_nx_task_asset) → new site ID
         Task title → replace old site with new site
         Task address (custevent_nx_address) → from site asset
         Task latitude (custevent_nx_latitude) → from site asset
         Task longitude (custevent_nx_longitude) → from site asset
```

**Important:** Projects must update BEFORE Cases (discovered during testing). Equipment multi-select fields on cases and projects are explicitly preserved during save.

### Name/Title Replacement Logic

**Projects:** Names are rebuilt from field values using the pattern:
```
[TYPE] [PROJECT_NUMBER] [NEW_SITE_NAME]
```
Example: `Billable 95902 1776 Bromley Dr Woodbury MN 55125-8803 United States`

Implementation:
```javascript
var projectType = projectRecord.getText({ fieldId: 'custentity_nx_project_type' });
var entityId = projectRecord.getValue({ fieldId: 'entityid' });
var projectNumber = entityId.split(' ')[0]; // Extract leading number from formatted entityid
var newName = projectType + ' ' + projectNumber + ' ' + newSiteName;
// Truncate to 83 chars (NetSuite companyname field limit)
if (newName.length > 83) {
    newName = newName.substring(0, 83);
}
```

**Cases and Tasks:** Use simple string replacement:
```javascript
newName = currentName.replace(oldSiteName, newSiteName);
```

**Known Limitation (Cases/Tasks only):** If the current name doesn't contain the exact old site name string, no replacement occurs. The preview screen shows "No Match" for these records. This can happen when:
- A record was previously updated to a different site
- The site name was changed after the record was created
- There are minor variations in address formatting

### Hybrid Processing

| Total Records | Processing Mode | Behavior |
|---------------|-----------------|----------|
| < 20 | Real-time | Updates executed immediately in Suitelet |
| >= 20 | MapReduce | Background processing with email notification |

### Error Handling

- **Equipment failure:** Processing STOPS to preserve data integrity
- **Project/Case/Task failure:** Error logged, continues with remaining records
- Results page shows success/failure for each record type

---

## 5. SuiteQL Queries

### Customer Search
```sql
SELECT c.id AS customer_id, c.entityid AS customer_number, c.companyname AS customer_name
FROM customer c
WHERE c.isinactive = 'F'
  AND (UPPER(c.companyname) LIKE '%{search}%' OR UPPER(c.entityid) LIKE '%{search}%')
ORDER BY c.companyname
FETCH FIRST 50 ROWS ONLY
```

### Active Site Assets
```sql
SELECT DISTINCT a.id AS site_id, a.name AS site_name
FROM customrecord_nx_asset a
WHERE a.custrecord_nxc_na_asset_type = '1'
  AND a.isinactive = 'F'
  AND a.custrecord_nx_asset_customer = {customerId}
ORDER BY a.name
```

### Equipment by Site
```sql
SELECT a.id, a.name, a.custrecord_sna_hul_fleetcode AS fleet_code,
       a.custrecord_nx_asset_serial AS serial_number,
       BUILTIN.DF(a.parent) AS current_site_name
FROM customrecord_nx_asset a
WHERE a.custrecord_nxc_na_asset_type = '2'
  AND a.isinactive = 'F'
  AND a.parent = {oldSiteId}
ORDER BY a.name
```

### Open Cases by Site
```sql
SELECT sc.id AS case_id, sc.casenumber AS case_number, sc.title AS case_title,
       BUILTIN.DF(sc.status) AS status_name,
       BUILTIN.DF(sc.custevent_nx_case_asset) AS current_site_name,
       BUILTIN.DF(sc.custevent_nxc_case_assets) AS equipment_assets
FROM supportcase sc
WHERE sc.custevent_nx_customer = {customerId}
  AND sc.custevent_nx_case_asset = {oldSiteId}
  AND sc.status NOT IN ('5')
ORDER BY sc.casenumber DESC
```

### Open Projects by Site
```sql
SELECT j.id AS project_id, j.entityid AS project_number, j.companyname AS project_name,
       BUILTIN.DF(j.entitystatus) AS status_name,
       BUILTIN.DF(j.custentity_nx_asset) AS current_site_name,
       BUILTIN.DF(j.custentity_nxc_project_assets) AS equipment_assets
FROM job j
WHERE j.parent = {customerId}
  AND j.custentity_nx_asset = {oldSiteId}
  AND j.isinactive = 'F'
  AND UPPER(BUILTIN.DF(j.entitystatus)) NOT LIKE '%CLOSED%'
ORDER BY j.entityid DESC
```

### Open Tasks by Site
```sql
SELECT t.id AS task_id, t.title AS task_title,
       t.status AS status_name,
       BUILTIN.DF(t.custevent_nx_task_asset) AS current_site_name,
       t.supportcase AS case_id,
       BUILTIN.DF(t.supportcase) AS case_name
FROM task t
WHERE t.custevent_nx_task_asset = {siteId}
  AND t.status != 'COMPLETE'
ORDER BY t.title
```

### Site Address Details (for Task Updates)
```sql
SELECT custrecord_nx_asset_address_text AS address_text,
       custrecord_nx_asset_latitude AS latitude,
       custrecord_nx_asset_longitude AS longitude
FROM customrecord_nx_asset
WHERE id = {siteId}
```

---

## 6. User Interface

### Wizard Steps

| Step | Name | Purpose |
|------|------|---------|
| 1 | Customer Selection | Search and select the customer |
| 2 | Site Selection | Choose old site (source) and new site (destination) |
| 3 | Record Selection | Select equipment, cases, projects, and tasks to update |
| 4 | Preview | Review changes with current/new names before execution |
| 5 | Results | View success/error summary |

### Step 3: Selection Features
- **Equipment Sublist:** Checkbox, Name, Fleet Code, Serial #, Current Site
- **Cases Sublist:** Checkbox, Case #, Subject, Status, Current Site, Equipment Asset
- **Projects Sublist:** Checkbox, Project #, Name, Status, Current Site, Equipment Asset
- **Tasks Sublist:** Checkbox, Title, Status, Related Case, Current Site
- **Bulk Actions:** Select All / Deselect All buttons for each sublist
- **Default:** All items pre-selected

### Step 4: Preview Display
- Customer name
- Old site name and new site name
- Count statistics for equipment, cases, projects, tasks
- Warning about FSM sequencing requirement
- **Detailed tables for Projects, Cases, and Tasks showing:**
  - Record ID
  - Current Name/Subject/Title
  - New Name/Subject/Title (after replacement)
  - "Will Change?" indicator (Yes or "No Match" highlighted in yellow)
- Processing mode selector (if > 20 records)

---

## 7. Required Permissions

The executing role needs:
- **Custom Records:** Edit access to `customrecord_nx_asset` (Field Service Asset)
- **Cases:** Edit access to Support Case records
- **Projects:** Edit access to Job records
- **Tasks:** Edit access to Task records
- **Customers:** View access for customer search
- **SuiteScript:** Permission to run Suitelets and Map/Reduce scripts

---

## 8. Testing Checklist

### Functional Tests
- [x] Customer search returns correct results
- [x] Active sites filter works (excludes inactive addresses)
- [x] Equipment list shows only equipment at selected old site
- [x] Cases list shows only open cases at selected site
- [x] Projects list shows only non-closed projects at selected site
- [x] Tasks list shows only non-complete tasks at selected site
- [x] Select All / Deselect All buttons work for each sublist
- [x] Preview shows correct counts and site names
- [x] Preview shows current/new names with "Will Change?" indicator
- [x] Real-time processing updates all selected records
- [x] MapReduce triggers for batches >= 20 records
- [x] Email notification sent after MapReduce completion
- [x] Equipment parent field updates correctly
- [x] Case site field updates, equipment multi-select preserved
- [x] Case subject updated with new site name
- [x] Project site field updates, equipment multi-select preserved
- [x] Project name updated with new site name
- [x] Task site field updates correctly
- [x] Task title updated with new site name
- [x] Task address/latitude/longitude fields updated from site asset

### Edge Cases
- [x] Customer with no active sites
- [x] Old site with no equipment
- [x] Old site with no open cases
- [x] Old site with no open projects
- [x] Old site with no open tasks
- [x] Equipment update failure stops processing
- [x] Case/Project/Task update failure logs error but continues
- [x] Name doesn't contain old site (no replacement, shown in preview)

---

## 9. File Reference

### Suitelet
**Path:** `/SuiteScripts/HUL_DEV/ADMIN_DEV/Suitelets/hul_sl_address_change_update.js`

### MapReduce
**Path:** `/SuiteScripts/HUL_DEV/ADMIN_DEV/MapReduce/hul_mr_address_change_update.js`

---

## 10. Future Enhancements

### High Priority - Improved Case/Task Name Replacement Logic

**Problem:** Cases and tasks still use simple string replacement (`oldSiteName` → `newSiteName`). If the record's current name doesn't contain the exact old site name, no replacement occurs.

**Note:** Project names have already been updated to use field-based rebuild logic (see Name/Title Replacement Logic section).

**Proposed Solution:** Rebuild case and task names using field values instead of string replacement.

**Case Subject Pattern:**
```
{case_type} {case_number} {new_site_address}
```
Example: `Breakfix/Repair 187306 815 Pineview Lane North Plymouth MN 55441 United States`

**Task Title Pattern:**
```
Site Visit {task_number} {new_site_address}
```
Example: `Site Visit 6596309 815 Pineview Lane North Plymouth MN 55441 United States`

**Implementation Notes:**
- Query the case/task type field
- Extract case/task number from entityid or casenumber field
- Build new name programmatically instead of string replacement
- This ensures name always matches new site regardless of current name content

### Other Future Enhancements
- Add ability to create new site asset if it doesn't exist
- Add audit log custom record for tracking changes
- Add option to update closed cases/projects
- Add batch selection by equipment type or category
- Add option to update related work orders
- Add dry-run mode that shows what would change without executing

---

## 11. Known Issues

### Name Mismatch Warning
When the preview shows "No Match" for a record, the site asset field will still be updated, but the name/subject/title will NOT change. Users should be aware that:
1. The site reference will be correct
2. The name may still contain the old site address
3. This is a cosmetic issue - the record is functionally correct

### Project Name Field Character Limit
The project `companyname` field has an 83-character limit in NetSuite. Names that exceed this limit are automatically truncated. This may result in incomplete addresses for sites with long names.

### Case/Task Name Mismatch
Cases and tasks still use string replacement logic. If the current subject/title doesn't contain the exact old site name, the name will not be updated (though the site asset field will be). See Future Enhancements for planned improvements.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-12-10 | Thomas Showalter / Claude | 1.0 | Initial implementation - complete wizard with real-time and MapReduce processing |
| 2025-12-10 | Thomas Showalter / Claude | 1.1 | Added Tasks support (Phase 4) with address/coordinate field updates |
| 2025-12-10 | Thomas Showalter / Claude | 1.2 | Fixed equipment asset preservation on projects and cases |
| 2025-12-10 | Thomas Showalter / Claude | 1.3 | Fixed processing order: Equipment → Projects → Cases → Tasks |
| 2025-12-10 | Thomas Showalter / Claude | 1.4 | Added name/title replacement for projects, cases, and tasks |
| 2025-12-10 | Thomas Showalter / Claude | 1.5 | Added detailed preview showing current/new names with "Will Change?" indicator |
| 2025-12-10 | Thomas Showalter / Claude | 1.6 | Added equipment asset column to cases and projects sublists |
| 2025-12-10 | Thomas Showalter / Claude | 1.7 | Documented future enhancement for improved name replacement logic |
| 2025-12-12 | Thomas Showalter / Claude | 1.8 | Implemented project name rebuild from fields: [TYPE] [NUMBER] [SITE] |
| 2025-12-12 | Thomas Showalter / Claude | 1.9 | Added 83-char truncation for project companyname field limit |
| 2025-12-12 | Thomas Showalter / Claude | 2.0 | Fixed entityid parsing - extract leading number only |
| 2025-12-12 | Thomas Showalter / Claude | 2.1 | UI improvements: removed field groups, side-by-side site dropdowns |
