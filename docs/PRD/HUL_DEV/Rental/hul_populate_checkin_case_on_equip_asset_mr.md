# hul_populate_checkin_case_on_equip_asset_mr

Map/Reduce script that updates equipment assets with their most recent qualifying check-in case.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Rental/hul_populate_checkin_case_on_equip_asset_mr.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** Searches equipment assets (`customrecord_nx_asset`) in a limited ID range.
- **map:** For each asset, SuiteQL query finds the most recent check-in case (highest internal ID) where:
  - `custevent_nx_case_type = 104`
  - `status` in `2, 3, 4, 6`
  - Asset ID is present in `custevent_nxc_case_assets`
- **reduce:** Writes `custrecord_most_recent_checkin_case` on the asset.
- **summarize:** no active logic (placeholder).

## Notes
- Asset search is limited to `internalidnumber` between `150000` and `200000` (test range).
- Case search handles multi-select asset IDs with `LIKE` patterns.
