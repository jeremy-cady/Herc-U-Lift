# hul_dupe_ea_to_static_create_ue

User Event that duplicates a Project equipment asset field into a static field on create/edit.

## Script Info
- Type: User Event Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_dupe_ea_to_static_create_ue.ts`

## Trigger
- `afterSubmit` on CREATE and EDIT.

## Key Fields
- Source: `custentity_nxc_project_assets` (equipment asset).
- Target: `custentity_hul_nxc_eqiup_asset` (static copy).

## Behavior
- On create/edit, reads the equipment asset field from the Project (Job).
- If present, writes the value to the static field via `record.submitFields`.
- Logs debug information and errors.
