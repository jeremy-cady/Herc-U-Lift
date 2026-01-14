# hul_populate_task_on_case_when_created_ue

User Event that updates support case task fields when a new task is created.

## Script Info
- Type: User Event Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_populate_task_on_case_when_created_ue.ts`

## Trigger
- `afterSubmit` on CREATE only.

## Behavior
- Builds `newTaskData` from the created task record.
- Looks up the case’s current and previous task fields.
- Writes task data to the case based on whether current/previous slots are empty:
  - If both are empty: populate current fields with the new task.
  - If current exists but previous is empty: move current → previous and write new task to current.
  - If both exist: move current → previous and write new task to current.

## Output / Updates
- Updates support case fields:
  - Current task: `custevent_hul_current_task_number`, `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_result`, `custevent_hul_current_task_status`, `custevent_hul_curr_task_internal_notes`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_tech_assigned`
  - Previous task: `custevent_hul_previous_task_number`, `custevent_hul_prev_task_date_completed`, `custevent_hul_prev_task_result`, `custevent_hul_prev_task_status`, `custevent_hul_prev_task_internal_notes`, `custevent_hul_prev_task_action_taken`, `custevent_hul_prev_task_tech_assigned`
