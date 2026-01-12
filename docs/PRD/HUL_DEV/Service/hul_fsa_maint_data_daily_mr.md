# hul_fsa_maint_data_daily_mr

Map/Reduce that refreshes maintenance data on equipment asset records using recent completed tasks and newly created future tasks.

## Script Info
- Type: Map/Reduce Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_fsa_maint_data_daily_mr.ts`

## Input
- Combines two SuiteQL result sets:
  - Recent completed PM/AN/CO tasks (completed within the last day) with current hour meter readings.
  - Newly created future PM/AN/CO tasks (created within the last day) with current hour meter readings.

## Output / Updates
- Updates `customrecord_nx_asset` based on revenue stream and task category:
  - PM fields: `custrecord_hul_pm_project`, `custrecord_hul_last_pm_task`, `custrecord_hul_next_pm_task`, `custrecord_hul_last_pm_date`, `custrecord_hul_next_pm_date`, `custrecord_hul_last_pm_hours`
  - AN fields: `custrecord_hul_an_project`, `custrecord_hul_last_an_task`, `custrecord_hul_next_an_task`, `custrecord_hul_last_an_date`, `custrecord_hul_next_an_date`, `custrecord_hul_last_an_hours`
  - CO fields: `custrecord_hul_co_project`, `custrecord_hul_last_co_task`, `custrecord_hul_next_co_task`, `custrecord_hul_last_co_date`, `custrecord_hul_next_co_date`, `custrecord_hul_last_co_hours`
  - Shared fields: `custrecord_hul_current_hours`, `custrecord_hul_current_hours_date`

## Behavior
- `getInputData`:
  - Fetches recent completed tasks and their next upcoming task per project.
  - Fetches future tasks and the most recent completed task per project.
  - Concatenates both datasets for processing.
- `map`: emits each row keyed by `equipment_asset`.
- `reduce`:
  - Iterates each maintenance data object for the equipment ID.
  - Calls `populateFields` to update the equipment asset record.
- `summarize`: no custom logic.

## SuiteQL Notes
- Revenue stream filter: `cseg_sna_revenue_st IN (263, 18, 19)` mapped to `PM`, `AN`, `CO`.
- Project type filter: `custentity_nx_project_type IN (4,5,6,7,8,10,12,13,14,15)`.
- Asset linking uses:
  - `job.custentity_hul_nxc_eqiup_asset` (equipment asset)
  - `job.custentity_hul_nxc_equip_object` (object)
  - `MAP_supportcase_custevent_nxc_case_assets` for case-asset joins in task context.
