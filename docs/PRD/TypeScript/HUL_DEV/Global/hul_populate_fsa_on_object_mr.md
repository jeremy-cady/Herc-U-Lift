# hul_populate_fsa_on_object_mr

Map/Reduce script that populates a Field Service Asset reference on Object records based on existing FSA → Object relationships.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Global/hul_populate_fsa_on_object_mr.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** SuiteQL query for all FSA records where `custrecord_nxc_na_asset_type = '2'`.
- **map:** For each FSA ID, queries its linked Object ID and writes FSA → Object.
- **reduce:** Writes the FSA ID into the Object record field `custrecord_hul_field_service_asset`.
- **summarize:** no active logic (placeholder).

## Data Sources
- `customrecord_nx_asset` (Field Service Asset)
- `customrecord_sna_objects` (Object)

## Key Fields
- Link field used in query: `customrecord_nx_asset.custrecord_sna_hul_nxcassetobject`
- Updated field on Object: `custrecord_hul_field_service_asset`

## Notes
- The SuiteQL join has a space before `custrecord_sna_hul_nxcassetobject` in the SQL string; confirm it resolves correctly.
- `map` writes `ctx.write(fsaID, objectID)` but `reduce` parses values as JSON; values may already be strings.
- Error handling logs but does not rethrow.
