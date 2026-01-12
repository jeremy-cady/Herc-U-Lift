# hul_tech_assigned_on_task_ue

User Event that backfills current task details on the related support case when a technician is assigned.

## Script Info
- Type: User Event Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_tech_assigned_on_task_ue.ts`

## Trigger
- `beforeSubmit` on EDIT/XEDIT (assignment changes).
- `afterSubmit` on CREATE and EDIT/XEDIT (backfill if case is missing current tech).

## Behavior
- Normalizes assigned tech values from record fields or via lookup (for XEDIT).
- `beforeSubmit`:
  - Detects assignment changes and/or empty case tech assignment.
  - Writes current task data to the case and shifts existing current values to previous fields.
- `afterSubmit`:
  - On CREATE: writes current task data to the case.
  - On EDIT/XEDIT: writes only if the case is missing current tech assignment.

## Output / Updates
- Updates support case fields:
  - Current task: `custevent_hul_curr_task_tech_assigned`, `custevent_hul_current_task_number`, `custevent_hul_current_start_date`, `custevent_current_task_date_completed`, `custevent_hul_current_task_status`, `custevent_hul_current_task_result`, `custevent_hul_curr_task_action_taken`, `custevent_hul_curr_task_internal_notes`
  - Previous task: `custevent_hul_previous_task_number`, `custevent_hul_prev_task_tech_assigned`, `custevent_hul_previous_start_date`, `custevent_hul_prev_task_date_completed`, `custevent_hul_prev_task_status`, `custevent_hul_prev_task_result`, `custevent_hul_prev_task_action_taken`, `custevent_hul_prev_task_internal_notes`
