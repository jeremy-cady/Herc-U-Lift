# hul_hide_line_item_cols_on_create_cs

Client Script that hides a line-level column on create for specific roles.

## Script Info
- Type: Client Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_hide_line_item_cols_on_create_cs.ts`

## Trigger
- `pageInit` only.

## Behavior
- Runs only in `create` mode.
- If the current user’s role is in the allowed list, hides the item sublist field:
  - `custcol_sna_hul_act_service_hours`

## Role Filters
- Role IDs: `3, 1175, 1174, 1185, 1163, 1168, 1152`

## Notes
- Uses `getSublistField` on line `0` and sets `isVisible = false`.
- Commented code suggests a prior attempt to loop lines, but only line 0 is used.
