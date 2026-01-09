# PRD to Script Mapping Index

This document tracks the relationship between PRD documents and their corresponding script implementations.

**Last Updated:** December 10, 2025

## Active Projects

| PRD ID | PRD Name | Script(s) | Type | Status | Last Updated |
|--------|----------|-----------|------|--------|--------------|
| PRD-20251210-AddressChangeAssetUpdate | Address Change Asset Update | hul_sl_address_change_update.js, hul_mr_address_change_update.js | Suitelet + Map/Reduce | Ready for Sandbox Testing | 2025-12-10 |
| PRD-20251204-CommissionDataValidator | Commission Data Validator | hul_sl_commission_validator.js, hul_mr_commission_export.js | Suitelet + Map/Reduce | Ready for Production | 2025-12-08 |
| PRD-20251128-RentalEquipmentROIAnalyzer | Rental Equipment ROI Analyzer | hul_sl_rental_roi_analyzer.js, hul_mr_rental_roi_report.js | Suitelet + Map/Reduce | Phase 2 Complete | 2025-12-09 |
| PRD-20251126-CustomerLifecycleAnalysis | Customer Lifecycle Analysis | hul_mr_customer_health_calc.js, hul_ss_customer_health_alert.js, hul_sl_customer_health_dashboard.js, hul_lib_customer_health.js | Map/Reduce + Scheduled + Suitelet + Library | In Testing | 2025-11-26 |
| PRD-20251128-CustomerActivityMatrix | Customer Activity Matrix | hul_mr_customer_activity.js, hul_sl_customer_health_dashboard.js | Map/Reduce + Suitelet | Draft | 2025-11-28 |
| PRD-20251126-DailyTruckingLog | Daily Trucking Log | hul_sl_daily_trucking_log.js | Suitelet | UAT (Sandbox) | 2025-11-26 |
| PRD-20251125-InventoryReorderAnalysis | Inventory Reorder Analysis | hul_mr_inventory_reorder_analysis.js | Map/Reduce | UAT - Mitsubishi Category | 2025-11-25 |

## Naming Convention

### PRDs
- Format: `PRD-[YYYYMMDD]-[FeatureName].md`
- Example: `PRD-20251031-UserRoleSync.md`

### Scripts
Follow the standard naming from main README:
- Map/Reduce: `hul_mr_[description].js`
- Scheduled: `hul_ss_[description].js`
- Suitelet: `hul_sl_[description].js`
- RESTlet: `hul_rl_[description].js`

### Linking PRDs to Scripts
In your PRD, always include the **Related Scripts** field with the exact script filenames:
```markdown
**Related Scripts:**
- MapReduce/hul_mr_user_role_sync.js
- Suitelets/hul_sl_user_admin_dashboard.js
```

In your script comments, reference the PRD:
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @description User role synchronization process
 * @see Documentation/PRDs/PRD-20251031-UserRoleSync.md
 */
```

## How to Use This Index

1. When creating a new PRD, add an entry to the table above
2. Update the status as development progresses
3. When a feature is complete, move it to the "Completed Projects" section below

## Completed Projects

| PRD ID | PRD Name | Script(s) | Type | Completion Date |
|--------|----------|-----------|------|-----------------|
| PRD-20251126-ScriptDashboard | Script Dashboard | hul_sl_script_dashboard.js | Suitelet | 2025-11-26 |
| PRD-20251125-IdleEquipmentTracker | Rental Fleet Idle Equipment Tracker | hul_sl_idle_equipment_tracker.js, hul_ss_idle_equipment_alert.js | Suitelet + Scheduled | 2025-11-25 |
| PRD-20251105-FleetReport | Fleet Report - Equipment Cost Analysis | hul_sl_fleet_report.js, hul_cs_fleet_report.js | Suitelet + Client | 2025-11-05 |
| PRD-20251031-TechnicianTimeline | Technician Task Timeline Viewer | hul_sl_technician_timeline.js | Suitelet | 2025-10-31 |

## Migrated Scripts (PRDs Needed)

These scripts were migrated from legacy codebase and need PRDs created:

| Script Name | Type | Purpose/Description | PRD Status |
|-------------|------|---------------------|------------|
| hul_rl_file_cabinet_api.js | RESTlet | File cabinet API operations | Need PRD |
| hul_rl_file_attach.js | RESTlet | File attachment handling | Need PRD |
| hul_rl_daily_operating_report.js | RESTlet | Daily operating report API | Need PRD |
| hul_mr_daily_operating_report.js | Map/Reduce | Daily operating report batch processing | Need PRD |
| hul_sl_backdated_time_report.js | Suitelet | Backdated time report UI | Need PRD |
| hul_ss_backdated_time_report.js | Scheduled | Backdated time report scheduler | Need PRD |
| hul_rl_employee_drivers_training.js | RESTlet | Employee drivers training API | Need PRD |
| hul_rl_add_so_line_item.js | RESTlet | Add sales order line items API | Need PRD |
| hul_ss_drivers_inspection_update.js | Scheduled | Drivers inspection update scheduler | Need PRD |

## Quick Links

### By Feature Status
- **Planning/Draft:** PRD-20251128-CustomerActivityMatrix
- **In Development/UAT:** PRD-20251210-AddressChangeAssetUpdate, PRD-20251125-InventoryReorderAnalysis, PRD-20251126-DailyTruckingLog, PRD-20251126-CustomerLifecycleAnalysis
- **Ready for Production:** PRD-20251204-CommissionDataValidator, PRD-20251128-RentalEquipmentROIAnalyzer
- **Deployed:** PRD-20251126-ScriptDashboard, PRD-20251125-IdleEquipmentTracker, PRD-20251105-FleetReport, PRD-20251031-TechnicianTimeline

### By Script Type
- **Map/Reduce:** PRD-20251210-AddressChangeAssetUpdate, PRD-20251204-CommissionDataValidator, PRD-20251128-RentalEquipmentROIAnalyzer, PRD-20251125-InventoryReorderAnalysis, PRD-20251126-CustomerLifecycleAnalysis, PRD-20251128-CustomerActivityMatrix
- **Scheduled:** PRD-20251126-CustomerLifecycleAnalysis, PRD-20251125-IdleEquipmentTracker
- **Suitelets:** PRD-20251210-AddressChangeAssetUpdate, PRD-20251204-CommissionDataValidator, PRD-20251128-RentalEquipmentROIAnalyzer, PRD-20251126-DailyTruckingLog, PRD-20251126-ScriptDashboard, PRD-20251125-IdleEquipmentTracker, PRD-20251105-FleetReport, PRD-20251031-TechnicianTimeline
- **Client Scripts:** PRD-20251105-FleetReport
- **RESTlets:** (Legacy scripts - see Migrated Scripts section)
