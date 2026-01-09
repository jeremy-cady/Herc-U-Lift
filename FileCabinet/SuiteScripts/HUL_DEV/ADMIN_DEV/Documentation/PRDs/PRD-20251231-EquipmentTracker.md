# PRD: Equipment Inventory Tracker - Object Status & Transaction Monitoring

**PRD ID:** PRD-20251231-EquipmentTracker
**Created:** December 31, 2025
**Author:** Thomas Showalter / Claude Code
**Status:** Production - Active Enhancement
**Related Scripts:** hul_sl_equipment_tracker.js, hul_lib_equipment_tracker.js, hul_rl_equipment_status.js, hul_cs_equipment_tracker.js

---

## Implementation Status

### Phase 1 MVP - COMPLETE (Dec 31, 2025)
- [x] Library with CONFIG and Object search
- [x] Suitelet with filter form and list view
- [x] Issue detection logic
- [x] Summary stats display
- [x] Deep-dive view with field changes and transactions

**Scripts Ready for Deployment:**
| Script | Script ID | Deployment ID |
|--------|-----------|---------------|
| Suitelet | `customscript_hul_sl_equipment_tracker` | `customdeploy_hul_sl_equipment_tracker` |
| RESTlet | `customscript_hul_rl_equipment_status` | `customdeploy_hul_rl_equipment_status` |
| Client Script | `customscript_hul_cs_equipment_tracker` | *(attached to Suitelet)* |

### Phase 2 & 3 - INCLUDED IN MVP
All Phase 2 and 3 features were built into the Phase 1 MVP:
- [x] RESTlet for async loading (hul_rl_equipment_status.js)
- [x] Client script for transaction counts (hul_cs_equipment_tracker.js)
- [x] Field change history from System Notes
- [x] Deep-dive view with transaction timeline
- [x] Field change timeline
- [x] Related records grid

### Post-MVP Enhancements (Jan 2026)
- [x] Add 6 new columns with horizontal scrolling
- [x] Reorder columns, fix customer name display, add segment multi-select filters
- [x] Add "Exclude Dummy" filter checkbox (default checked)
- [x] Replace Open Trans column with 5 case columns (async loaded via RESTlet)
- [x] Add expandable rows with FSA maintenance data (projects/tasks)
- [x] Show project/task names instead of IDs in maintenance expansion
- [x] User notes display via userNotes join on custom records
- [x] Note creation feature in expandable rows
- [x] FSA parent column with proper URL generation

---

## 1. Introduction / Overview

**What is this feature?**
An Equipment Inventory Tracker Suitelet that provides visibility and status validation for ~1500-2000 Object records (customrecord_sna_objects). Built following the Parts G/L Tracker and AR Manager architecture patterns.

**What problem does it solve?**
- No centralized view of all equipment (Objects) with their current status
- Difficult to identify Objects with invalid status combinations (e.g., Own + SOLD)
- No visibility into field change history without opening each record
- Hard to see which Objects have open transactions linked
- No way to trace transaction flow (PO→IR or trade-in, then SO→Invoice history)

**Primary Goal:**
Provide a monitoring tool that enables staff to identify Objects with issues, view field change history, and trace transaction flows for individual equipment items.

---

## 2. Goals

1. **Status Visibility** - See all Objects with owner_status, posting_status, status, rental_status, location, lease_co
2. **Issue Detection** - Automatically flag Objects with invalid status combinations
3. **Field Change Tracking** - Show when each tracked field was last changed (via System Notes)
4. **Transaction Counts** - See count of open transactions linked to each Object
5. **Deep-Dive View** - View transaction timeline and field change history for single Object

---

## 3. User Stories

1. **As a** Controller, **I want to** see all Objects flagged as "Own" but with posting status "SOLD" **so that** I can investigate and correct the data.

2. **As a** Rental Manager, **I want to** see which Objects have open transactions **so that** I can understand equipment utilization.

3. **As a** Finance User, **I want to** see when an Object's owner_status was last changed **so that** I can trace ownership transfers.

4. **As an** Admin, **I want to** see the complete transaction flow for an Object **so that** I can audit equipment history.

5. **As a** Branch Manager, **I want to** filter Objects by location **so that** I can focus on my branch's equipment.

---

## 4. Functional Requirements

### Phase 1: MVP - Search & List View

1. The system must allow filtering by:
   - Owner Status (Customer, On Order, Own)
   - Posting Status (SOLD, Stock, Used)
   - Status (ATR, NATR, On Rent, etc.)
   - Rental Status (In Status, Out Assigned, etc.)
   - Location/Responsibility Center
   - Lease Company
   - Fleet Number (text search)
   - Show Issues Only (checkbox)

2. The system must display a list view showing:
   - Fleet # (Object name - clickable to deep-dive)
   - Serial #
   - Owner Status (color-coded badge)
   - Posting Status (badge)
   - Status
   - Rental Status
   - Location
   - Lease Co
   - Issues (if any - error/warning badges)

3. The system must detect and flag these issues:
   | Rule | Condition | Severity |
   |------|-----------|----------|
   | Owned but SOLD | owner_status=3 (Own) + posting_status=SOLD | Error |
   | Customer with active rental | owner_status=1 (Customer) + rental_status active | Error |
   | Stock without inventory | posting_status=Stock + no serialized item | Warning |
   | Missing FSA link | No field_service_asset | Warning |

4. The system must display summary statistics:
   - Total Objects in results
   - Count by Owner Status (Own, Customer, On Order)
   - Issue Count

### Phase 2: Async Loading & Field Changes

5. Via RESTlet, load for each Object:
   - Count of open transactions (W, R, S, PS prefixed)
   - Last field change date (from System Notes)

6. System Notes query for field change dates:
   - Track: owner_status, posting_status, status, rental_status
   - Show most recent change date per field

### Phase 3: Deep-Dive View

7. Clicking an Object shows detail view with:
   - Header: All status fields with badges
   - Issues Panel: All detected issues with descriptions
   - Field Change Timeline: Chronological list of field changes from System Notes
   - Transaction Flow: PO→IR (acquisition) and SO→INV chain (sales/rentals)
   - Related Records: Clickable links to linked transactions

---

## 5. Non-Goals (Out of Scope) - MVP

**This MVP will NOT:**
- Modify Object records (view-only)
- Create journal entries
- Send alerts or notifications
- Integrate with rental booking system
- Track meter readings (separate tool exists)

---

## 6. Technical Design

### Object Record Reference

**Record:** `customrecord_sna_objects`

| Field ID | Purpose | Values |
|----------|---------|--------|
| `custrecord_sna_owner_status` | Ownership | 1=Customer, 2=On Order, 3=Own |
| `custrecord_sna_posting_status` | Lifecycle | SOLD, Stock, Used |
| `custrecord_sna_status` | Equipment state | ATR, NATR, On Rent, etc. |
| `custrecord_sna_rental_status` | Rental workflow | In Status, Out Assigned |
| `custrecord_sna_responsibility_center` | Location | Location record ID |
| `custrecord_sna_hul_lease_co_code` | Lease company | Lease Co record ID |
| `custrecord_sna_fixed_asset` | FAM Asset link | Fixed Asset ID |
| `custrecord_sna_hul_field_service_asset` | FSA link | NXC Asset ID |

### Transaction Linking

| Field | Location | Purpose |
|-------|----------|---------|
| `custcol_sna_hul_fleet_no` | Transaction lines | Object ID on transaction lines |
| `custcol_sna_object` | Transaction lines | Alternative Object link field |

### Status Definitions

| Owner Status | ID | Color |
|--------------|-----|-------|
| Customer | 1 | Green (#28a745) |
| On Order | 2 | Yellow (#ffc107) |
| Own | 3 | Blue (#17a2b8) |

| Posting Status | Color |
|----------------|-------|
| SOLD | Red (#dc3545) |
| Stock | Green (#28a745) |
| Used | Yellow (#ffc107) |

### Issue Detection Rules

| Rule ID | Name | Condition | Severity | Description |
|---------|------|-----------|----------|-------------|
| OWN_SOLD | Owned but SOLD | owner=3 AND posting=SOLD | Error | Object shows as Owned but posting shows SOLD |
| CUST_ACTIVE_RENTAL | Customer with active rental | owner=1 AND rental_status active | Error | Customer-owned object has active rental status |
| STOCK_NO_INV | Stock without inventory | posting=Stock AND no item | Warning | Stock status but no serialized item linked |
| NO_FSA | Missing FSA link | field_service_asset IS NULL | Warning | No Field Service Asset record linked |

### Scripts That Update Object Status

| Script | Trigger | Fields Updated |
|--------|---------|----------------|
| `sna_hul_ue_itemfulfillment.js` | Invoice created | owner→Customer, posting→SOLD |
| `sna_hul_ue_rentaltask.js` | Task completion | rental_status, status |
| `sna_hul_ue_createasset.js` | FAM Disposal | owner→Customer, posting→SOLD |
| `sna_hul_ue_createassetreturn.js` | Item Receipt | owner→Own, posting→Used |
| `sna_hul_ue_so_van_bin.js` | Item Receipt | status, responsibility_center |

---

## 7. File Structure

```
FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/
├── Suitelets/hul_sl_equipment_tracker.js           # Main Suitelet
├── Libraries/hul_lib_equipment_tracker.js          # Shared library
├── RESTlets/hul_rl_equipment_status.js             # Async status loader
├── ClientScripts/hul_cs_equipment_tracker.js       # Client interactivity
└── Documentation/PRDs/PRD-20251231-EquipmentTracker.md
```

---

## 8. User Interface

### List View Columns
| Column | Width | Source | Notes |
|--------|-------|--------|-------|
| Fleet # | 100px | name | Object name, clickable to deep-dive |
| Serial # | 120px | FSA join | From linked Field Service Asset |
| Owner | 100px | custrecord_sna_owner_status | Color-coded badge |
| Posting | 100px | custrecord_sna_posting_status | Color-coded badge |
| Status | 100px | custrecord_sna_status | Equipment state |
| Rental | 100px | custrecord_sna_rental_status | Rental workflow status |
| Location | 120px | custrecord_sna_responsibility_center | Branch |
| Lease Co | 100px | custrecord_sna_hul_lease_co_code | Lease company |
| Issues | 120px | Calculated | Error/Warning badges |
| Open Trans | 80px | Async | Transaction counts |

### Filter Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Fleet # | Text | No | Partial match search |
| Owner Status | Select | No | Customer, On Order, Own |
| Posting Status | Select | No | SOLD, Stock, Used |
| Status | Select | No | ATR, NATR, On Rent, etc. |
| Rental Status | Select | No | In Status, Out Assigned, etc. |
| Location | Select | No | Location dropdown |
| Lease Company | Select | No | Lease Co dropdown |
| Show Issues Only | Checkbox | No | Filter to only show Objects with issues |

---

## 9. System Notes Query Pattern

```sql
SELECT
    sn.date AS change_date,
    sn.name AS field_name,
    sn.oldvalue,
    sn.newvalue,
    BUILTIN.DF(sn.author) AS changed_by
FROM systemnote sn
WHERE sn.recordid = ?
  AND sn.recordtypeid = (
      SELECT id FROM customrecordtype
      WHERE scriptid = 'customrecord_sna_objects'
  )
ORDER BY sn.date DESC
```

---

## 10. Deployment

| Script | Script ID | Deployment ID |
|--------|-----------|---------------|
| Suitelet | customscript_hul_sl_equipment_tracker | customdeploy_hul_sl_equipment_tracker |
| RESTlet | customscript_hul_rl_equipment_status | customdeploy_hul_rl_equipment_status |
| Client Script | customscript_hul_cs_equipment_tracker | *(attached to Suitelet)* |

---

## 11. Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-12-31 | Thomas Showalter / Claude Code | 1.0 | Initial draft |
| 2026-01-03 | Thomas Showalter / Claude Code | 1.1 | Post-MVP enhancements: expandable rows, user notes, FSA parent column, case columns, segment filters |

---

## 12. Future Roadmap

### Future Enhancements (Not Started)
- Add ability to batch-update Object statuses
- Export to CSV functionality
- Email alerts for new issues detected
- Integration with rental booking for status sync
- Dashboard widgets for Object health summary
- Add more issue detection rules as discovered
