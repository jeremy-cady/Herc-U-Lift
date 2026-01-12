# hul_copy_hour_meter_reading_mr

Map/Reduce script stub intended to copy hour meter readings from object records, currently scoped to a single object ID.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Global/hul_copy_hour_meter_reading_mr.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** Queries all `customrecord_sna_objects` IDs via SuiteQL.
- **map:** Parses each object ID and **only processes ID `3274`**.
  - Calls `getMeterHours` and writes `id → hours` to context.
- **reduce/summarize:** Currently empty.

## Data Source
- `customrecord_sna_objects` (Object records)
- Field accessed in `getMeterHours`: `custrecord_sna_meter_key_on_m1`

## Notes
- `getMeterHours` references `ctx.currentRecord`, but Map/Reduce context does not provide `currentRecord`.
- `reduce` and `summarize` are placeholders with no logic.
- The script likely needs completion or refactoring before production use.
