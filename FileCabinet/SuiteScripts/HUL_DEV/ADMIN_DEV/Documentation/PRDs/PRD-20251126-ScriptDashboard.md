# PRD: HUL Script Dashboard

**PRD ID:** PRD-20251126-ScriptDashboard
**Created:** November 26, 2025
**Author:** Claude Code
**Status:** Deployed to Sandbox
**Related Scripts:**
- `Suitelets/hul_sl_script_dashboard.js`

**Script Deployment:**
- Script ID: `customscript_hul_sl_script_dashboard`
- Deployment ID: `customdeploy_hul_sl_script_dashboard`

---

## 1. Introduction / Overview

**What is this feature?**
A centralized dashboard Suitelet that serves as a hub for all custom HUL NetSuite scripts, organized by department with search and filtering capabilities.

**What problem does it solve?**
- Multiple custom Suitelets, MapReduce scripts, and scheduled scripts are being developed
- Difficult to keep track of what scripts exist, where to find them, and who should use them
- No single location to discover available tools
- New users don't know what scripts are available

**Primary Goal:**
Provide a single access point for all custom scripts, organized by department, with easy search/filter functionality and direct links to open each tool.

---

## 2. User Stories

1. **As a** NetSuite User, **I want to** see all available custom scripts in one place **so that** I can find the tools I need.

2. **As an** Administrator, **I want to** organize scripts by department **so that** users can quickly find relevant tools.

3. **As a** New Employee, **I want to** discover available scripts **so that** I can learn what tools are available.

4. **As a** Manager, **I want to** see which scripts are in development vs active **so that** I know what's coming.

---

## 3. Architecture

### Two-Part System

**Part 1: Script Registry Custom Record**
- Custom record `customrecord_hul_script_registry`
- Stores metadata about each script (name, URL, department, description, status)
- Administrators populate this manually when new scripts are created

**Part 2: Dashboard Suitelet**
- Reads the Script Registry and displays scripts in a card-based UI
- Groups scripts by department
- Provides search and status filtering
- Links directly to Suitelets or script records

---

## 4. Custom Record Specifications

### Custom Lists (Create First)

#### customlist_hul_sr_script_types
| ID | Label |
|----|-------|
| 1 | Suitelet |
| 2 | MapReduce |
| 3 | Scheduled Script |
| 4 | Client Script |
| 5 | User Event |
| 6 | Restlet |

#### customlist_hul_sr_status
| ID | Label | Description |
|----|-------|-------------|
| 1 | Active | Production-ready, available to users |
| 2 | In Development | Being developed, sandbox only |
| 3 | UAT | User acceptance testing |
| 4 | Deprecated | No longer recommended |

### Custom Record: customrecord_hul_script_registry

| Field ID | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| name | Name | Text | Yes | Display name for the script |
| custrecord_hul_sr_description | Description | Text Area | No | Brief description of functionality |
| custrecord_hul_sr_department | Department | List/Record | Yes | Source: Department (existing NetSuite record) |
| custrecord_hul_sr_script_type | Script Type | List | Yes | Source: customlist_hul_sr_script_types |
| custrecord_hul_sr_url | URL | URL | No | Direct link to script. For Suitelets: deployment URL. For MapReduce/Scheduled: script record URL (scriptrecord.nl?id=XXXXX) |
| custrecord_hul_sr_script_id | Script ID | Text | No | NetSuite script ID (e.g., customscript_xxx) |
| custrecord_hul_sr_deployment_id | Deployment ID | Text | No | NetSuite deployment ID |
| custrecord_hul_sr_status | Status | List | Yes | Source: customlist_hul_sr_status |
| custrecord_hul_sr_icon | Icon | Text | No | Emoji or icon identifier |
| custrecord_hul_sr_sort_order | Sort Order | Integer | No | Display order within department |
| custrecord_hul_sr_prd_link | PRD Link | URL | No | Link to PRD documentation |

---

## 5. Dashboard Features

### Header Section
- Title: "HUL Script Dashboard"
- Subtitle: "Central access point for all custom NetSuite scripts and tools"
- Search box for filtering by name/description
- Status filter dropdown (All, Active, UAT, In Development)

### Statistics Row
- Total Scripts count
- Active count
- In UAT count
- In Development count
- Departments count

### Script Cards
Each script is displayed as a card showing:
- Icon (based on script type)
- Script name
- Script type badge
- Description
- Status badge (color-coded)
- PRD link (if available)
- "Open Script" button

### Department Sections
- Scripts grouped by department
- Collapsible sections
- Count badge showing scripts per department

---

## 6. Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Purple | #667eea |
| Primary Dark | Dark Purple | #764ba2 |
| Active Status | Green | #28a745 |
| UAT Status | Yellow | #ffc107 |
| In Dev Status | Blue | #17a2b8 |
| Deprecated | Gray | #6c757d |

---

## 7. Implementation Plan

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create PRD document | ✅ Complete |
| 2 | Create Dashboard Suitelet | ✅ Complete |
| 3 | Create custom lists in NetSuite | ✅ Complete |
| 4 | Create custom record in NetSuite | ✅ Complete |
| 5 | Deploy Suitelet to sandbox | ✅ Complete |
| 6 | Populate registry with existing scripts | ✅ Complete |
| 7 | User acceptance testing | 🔄 In Progress |
| 8 | Deploy to production | ⏳ Pending |

---

## 8. Scripts to Register (Initial Batch)

| Script Name | Department | Type | Status | Registered |
|-------------|------------|------|--------|------------|
| Fleet Cost Per Hour Report | Rental | Suitelet | Active | ✅ |
| Idle Equipment Tracker | Rental | Suitelet | Active | ✅ |
| Inventory Reorder Analysis | Rental | Suitelet | In Development | ✅ |
| Daily Trucking Log | Service | Suitelet | UAT | ✅ |
| Backdated Time Report | Administration | Suitelet | Active | ✅ |
| Script Dashboard | Administration | Suitelet | Active | ✅ |

**Note:** Department values updated to match existing NetSuite Department segment (Rental, Service, Administration, etc.)

---

## 9. Deployment Information

**Script Record:**
- Name: HUL - Script Dashboard
- Script ID: `customscript_hul_sl_script_dashboard`
- Script Type: Suitelet

**Deployment:**
- Deployment ID: `customdeploy_hul_sl_script_dashboard`
- Status: Released
- Execute As Role: Administrator
- Audience: All Roles (filtering handled in code)

---

## 10. Future Enhancements

1. **Favorites** - Let users star frequently-used scripts
2. **Usage Analytics** - Track which scripts are used most
3. **Role-Based Filtering** - Hide scripts user doesn't have access to
4. **Notifications** - Alert users when scripts are updated
5. **API Endpoint** - JSON mode for programmatic access
6. **Custom Menu Integration** - Add dashboard to NetSuite main menu

---

## 11. Setup Instructions (For Reference)

### Custom Lists Created
1. **customlist_hul_sr_script_types** - Suitelet, MapReduce, Scheduled Script, Client Script, User Event, Restlet
2. **customlist_hul_sr_status** - Active, In Development, UAT, Deprecated

### Custom Record Created
- **customrecord_hul_script_registry** - Script Registry with all fields as specified in Section 4

### Department Field
Uses existing NetSuite Department segment instead of custom list. Available departments include:
- Service (ID: 3)
- Sales (ID: 4)
- Parts (ID: 18)
- Rental (ID: 23)
- Administration (ID: 28)
- Accounting (ID: 34)

---

## 12. Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Nov 26, 2025 | Claude Code | 1.0 | Initial PRD and Suitelet creation |
| Nov 26, 2025 | Claude Code | 1.1 | Updated to use existing Department record instead of custom list |
| Nov 26, 2025 | Claude Code | 1.2 | Deployed to sandbox, custom lists and record created, registry populated |
| Dec 9, 2025 | Claude Code | 1.3 | Fixed URL handling for non-Suitelet scripts. Now uses URL field directly for all script types instead of trying to build URL from script ID. For MapReduce/Scheduled scripts, use the script record URL (scriptrecord.nl?id=XXXXX) |
