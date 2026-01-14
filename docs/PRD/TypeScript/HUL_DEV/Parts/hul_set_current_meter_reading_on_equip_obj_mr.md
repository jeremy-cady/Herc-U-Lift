# hul_set_current_meter_reading_on_equip_obj_mr

Map/Reduce script that sets each equipment object's current meter reading to the latest hour meter value.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_set_current_meter_reading_on_equip_obj_mr.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** Searches `customrecord_sna_objects` with a non-empty equipment model and internal ID range.
- **map:** Writes each object internal ID to reduce.
- **reduce:**
  - Queries the maximum hour meter reading for the object.
  - Sets `custrecord_hul_meter_key_static` to that value (or `null` if 0).
- **summarize:** no active logic (placeholder).

## Data Sources
- `customrecord_sna_objects` (equipment objects)
- `customrecord_sna_hul_hour_meter` (hour meter readings)

## Notes
- Uses SuiteQL `MAX()` to compute the latest reading.
- The internal ID range filter is hardcoded (`1253220000` to `10000000000`).
