# hul_populate_new_task_data_on_case_daily_ss

Scheduled script that backfills current and previous task details onto support cases that are missing current task data.

## Script Info
- Type: Scheduled Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_populate_new_task_data_on_case_daily_ss.ts`

## Input
- SuiteQL query that finds support cases where `custevent_hul_current_task_number` is null and returns the two most recent tasks per case.

## Behavior
- `execute`:
  - Builds a `TaskDataObject` for each case with current + previous task details.
  - Validates assigned techs by checking `employee.isinactive`; clears inactive techs.
  - Writes current/previous task fields back to the support case via `record.submitFields`.

## Output / Updates
- Updates support case fields:
  - Current task: `custevent_hul_current_task_number`, `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_status`, `custevent_hul_current_task_result`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_internal_notes`, `custevent_hul_curr_task_tech_assigned`
  - Previous task: `custevent_hul_previous_task_number`, `custevent_hul_prev_task_start_date`, `custevent_hul_prev_task_date_completed`, `custevent_hul_prev_task_status`, `custevent_hul_prev_task_result`, `custevent_hul_prev_task_action_taken`, `custevent_hul_prev_task_internal_notes`, `custevent_hul_prev_task_tech_assigned`
