# hul_objects_with_zero_meter_mr

Map/Reduce script that clears the static meter key field on Object records when it is set to `0`.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_objects_with_zero_meter_mr.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** SuiteQL query for Objects with `custrecord_hul_meter_key_static = '0'`.
- **map:** Sets `custrecord_hul_meter_key_static` to `null` for each record.
- **reduce/summarize:** no active logic (placeholders).

## Notes
- `map` parses `ctx.value` as JSON, but the input is a raw ID array; this may not be valid JSON.
- There is no paging; SuiteQL uses a single result set.
