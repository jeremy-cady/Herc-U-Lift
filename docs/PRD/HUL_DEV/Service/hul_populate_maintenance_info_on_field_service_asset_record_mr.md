# hul_populate_maintenance_info_on_field_service_asset_record_mr

Map/Reduce that assembles maintenance details for Field Service Assets and writes current PM info and hour meter data to the asset record.

## Script Info
- Type: Map/Reduce Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_populate_maintenance_info_on_field_service_asset_record_mr.ts`

## Input
- SuiteQL query that returns all equipment object IDs tied to asset type 2.
- Subsequent lookups and searches per object to find:
  - Field Service Asset ID
  - PM projects, cases, and tasks
  - Most recent PM maintenance record hours/date
  - Most recent hour meter reading
  - Warranty expiration date
  - Site zip code

## Behavior
- `getInputData`: loads equipment object IDs for assets of type 2.
- `map`:
  - Filters to specific equipment object IDs (currently hardcoded to `1253185376` and `1253199340`).
  - Resolves the FSA, related project/case/task, and maintenance/hour meter data.
  - Emits a consolidated maintenance object keyed by FSA ID.
- `reduce`: writes the maintenance values to the Field Service Asset record.
- `summarize`: no custom logic.

## Output / Updates
- Updates `customrecord_nx_asset` fields:
  - `custrecord_hul_current_pm_project`
  - `custrecord_hul_current_pm_case`
  - `custrecord_hul_recent_pm_task`
  - `custrecord_hul_recent_pm_maint_rec`
  - `custrecord_hul_last_serviced_hours`
  - `custrecord_hul_last_pm_date`
  - `custrecord_hul_current_hours`
  - `custrecord_hul_current_hrs_read_date`
  - `custrecord_hul_current_hours_record`
  - `custrecord_hul_pm_zip`
  - `custrecord_hul_warranty_end_date`

## Notes
- Some queries are currently hardcoded to specific asset/object IDs:
  - Maintenance record query uses asset `80532`.
  - Hour meter query uses object `1253199340`.
