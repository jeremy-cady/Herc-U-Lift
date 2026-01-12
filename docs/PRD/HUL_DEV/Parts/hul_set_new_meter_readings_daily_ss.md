# hul_set_new_meter_readings_daily_ss

Scheduled script that updates object records with the latest meter reading and reading date from the last 24 hours.

## Script Info
- Type: Scheduled Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_set_new_meter_readings_daily_ss.ts`

## Trigger
- Scheduled execution (daily).

## Behavior
- Queries for objects that have hour meter readings created within the last day.
- For each object:
  - Sets `custrecord_hul_meter_key_static` to the latest reading.
  - Sets `custrecord_sna_last_meter_reading_m1` to the reading date.

## Data Sources
- `customrecord_sna_objects`
- `customrecord_sna_hul_hour_meter`

## Key Fields Updated
- `custrecord_hul_meter_key_static`
- `custrecord_sna_last_meter_reading_m1`

## Notes
- Uses a SuiteQL query with a subquery on readings from `CURRENT_DATE - 1`.
- `convertToDate` parses an `MM/DD/YYYY` string to a `Date` object.
