# hul_populate_nxc_equipment_asset_on_object_mr

Map/Reduce that backfills equipment asset IDs onto equipment object records for a specific object ID range.

## Script Info
- Type: Map/Reduce Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_populate_nxc_equipment_asset_on_object_mr.ts`

## Input
- SuiteQL query joining equipment assets to objects where:
  - Asset type = 2
  - Object ID range: `1253190000 < id <= 1253192000`

## Behavior
- `getInputData`: returns `{ assetID, objectID }` pairs from SuiteQL.
- `map`: emits each asset/object pair keyed by asset ID.
- `reduce`: writes the asset ID to the object record (`customrecord_sna_objects`) field `custrecord_hul_nxcequipasset`.
- `summarize`: no custom logic.
