# hul_populate_task_data_on_case_when_task_is_assigned_ss

Scheduled script that monitors recent task assignment changes and pushes current task data to the related support case.

## Script Info
- Type: Scheduled Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_populate_task_data_on_case_when_task_is_assigned_ss.ts`

## Input
- SuiteQL query over `task`, `systemnote`, and `supportcase`:
  - Tracks recent changes to `EVENT.KASSIGNED` within the last 4 minutes.
  - Pulls task and case fields needed to populate the case.

## Behavior
- `execute`:
  - Maps SuiteQL rows into `TaskDataObject`.
  - If the case is not already assigned, updates current task fields on the case and sets `custevent_hul_is_assigned` to true.
  - Calls `scriptScheduler` to pause and reschedule itself.
- `scriptScheduler`:
  - Busy-waits for 4 minutes and then resubmits the scheduled script (`customscript_hul_pop_task_on_case_assign` / `customdeploy_hul_pop_task_on_case_assign`).

## Output / Updates
- Updates support case fields:
  - `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_status`, `custevent_hul_current_task_result`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_internal_notes`, `custevent_hul_curr_task_tech_assigned`, `custevent_hul_is_assigned`
