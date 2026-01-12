# hul_fsa_maint_data_mr

Map/Reduce that builds a full maintenance snapshot per equipment asset and writes PM/AN/CO fields to the asset record.

## Script Info
- Type: Map/Reduce Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_fsa_maint_data_mr.ts`

## Input
- SuiteQL query that joins:
  - Jobs (Projects) filtered to revenue streams 263/18/19 and PM project types.
  - Most recent completed task per project (past).
  - Next upcoming task per project (future).
  - Latest maintenance record hours per task.
  - Latest hour meter reading per equipment object.

## Output / Updates
- Updates `customrecord_nx_asset` based on revenue stream:
  - PM fields: `custrecord_hul_pm_project`, `custrecord_hul_last_pm_task`, `custrecord_hul_next_pm_task`, `custrecord_hul_last_pm_date`, `custrecord_hul_next_pm_date`, `custrecord_hul_last_pm_hours`
  - AN fields: `custrecord_hul_an_project`, `custrecord_hul_last_an_task`, `custrecord_hul_next_an_task`, `custrecord_hul_last_an_date`, `custrecord_hul_next_an_date`, `custrecord_hul_last_an_hours`
  - CO fields: `custrecord_hul_co_project`, `custrecord_hul_last_co_task`, `custrecord_hul_next_co_task`, `custrecord_hul_last_co_date`, `custrecord_hul_next_co_date`, `custrecord_hul_last_co_hours`
  - Shared fields: `custrecord_hul_current_hours`, `custrecord_hul_current_hours_date`

## Behavior
- `getInputData`: runs the SuiteQL query, maps rows into `MaintenanceDataObject`, and normalizes date fields to `MM/DD/YYYY`.
- `map`: emits each row keyed by `equipmentAsset`.
- `reduce`: writes the maintenance fields to the equipment asset record based on revenue stream.
- `summarize`: no custom logic.

## Notes
- Date normalization expects `MM/DD/YYYY` and nulls invalid or missing dates.
- Revenue streams map to labels:
  - `263` → `PM`, `18` → `AN`, `19` → `CO`.
