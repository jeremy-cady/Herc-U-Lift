# hul_populate_new_task_data_on_case_ue

User Event that captures task edits and pushes current task data to the related support case when fields change.

## Script Info
- Type: User Event Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.ts`

## Trigger
- `beforeLoad`, `beforeSubmit`, `afterSubmit` on EDIT only.

## Behavior
- `beforeLoad`:
  - Reads current task fields and case category.
  - Stores a JSON snapshot in `custevent_hul_task_data_json` for later comparison.
- `beforeSubmit`:
  - Ensures `custevent_hul_task_data_json` is populated, rebuilding it if missing.
- `afterSubmit`:
  - Parses the stored JSON snapshot and builds a new snapshot from the edited task.
  - If the snapshots differ and the case type is `4`, updates the case fields.
  - If current and previous task numbers match, writes the new data to both current and previous fields; otherwise updates current fields only.

## Output / Updates
- Updates support case fields (current, and sometimes previous):
  - `custevent_hul_current_task_number`, `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_status`, `custevent_hul_current_task_result`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_internal_notes`, `custevent_hul_curr_task_tech_assigned`
  - `custevent_hul_previous_task_number`, `custevent_hul_prev_task_start_date`, `custevent_hul_prev_task_date_completed`, `custevent_hul_prev_task_status`, `custevent_hul_prev_task_result`, `custevent_hul_prev_task_action_taken`, `custevent_hul_prev_task_internal_notes`, `custevent_hul_prev_task_tech_assigned`
