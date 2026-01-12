# hul_populate_task_data_on_case

Map/Reduce that backfills current and previous task details onto support cases.

## Script Info
- Type: Map/Reduce Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_populate_task_data_on_case.ts`

## Input
- SuiteQL query that returns the most recent task per support case and the previous task when available (case category `4` and `sc.id > 1000000`).

## Behavior
- `getInputData`: builds `TaskDataObject` rows from the query results.
- `map`: emits each row keyed by case ID.
- `reduce`: writes current and previous task fields to the support case.
- `summarize`: no custom logic.

## Output / Updates
- Updates support case fields:
  - Current task: `custevent_hul_current_task_number`, `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_status`, `custevent_hul_current_task_result`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_internal_notes`, `custevent_hul_curr_task_tech_assigned`
  - Previous task: `custevent_hul_previous_task_number`, `custevent_hul_prev_task_start_date`, `custevent_hul_prev_task_date_completed`, `custevent_hul_prev_task_status`, `custevent_hul_prev_task_result`, `custevent_hul_prev_task_action_taken`, `custevent_hul_prev_task_internal_notes`, `custevent_hul_prev_task_tech_assigned`
