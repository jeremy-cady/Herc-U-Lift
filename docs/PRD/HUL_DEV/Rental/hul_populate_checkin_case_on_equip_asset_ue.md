# hul_populate_checkin_case_on_equip_asset_ue

User Event script that updates related equipment assets with the current check-in case when qualifying cases are created or edited.

## Script Info
- Type: User Event (afterSubmit)
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_ue.ts`

## Trigger
- Runs on `CREATE` and `EDIT`.

## Behavior
- Only proceeds when:
  - `custevent_nx_case_type` is `104`
  - `status` is one of `2, 3, 4, 6`
- Reads `custevent_nxc_case_assets` and updates each asset:
  - Sets `custrecord_most_recent_checkin_case` to the current case ID.

## Notes
- Handles both single and multi-select asset values.
- Logs and skips if no equipment assets are present.
