# hul_fs_case_subtabs_helper_sl

Suitelet that returns related open support cases for a customer and selected assets (used by the Field Service case UI).

## Script Info
- Type: Suitelet
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.ts`

## Request Parameters
- `customerId`: customer internal ID.
- `assetIds`: comma-delimited list of asset internal IDs.

## Filters
- Revenue stream segment IDs: `106, 107, 108, 263, 18, 19, 204, 205, 206`.
- Status IDs: `1, 2, 4`.

## Behavior
- GET only; returns `{ ok: false, error }` for non-GET requests.
- Validates params; returns `{ ok: true, rows: [] }` when inputs are missing/empty.
- Uses SuiteQL to fetch distinct support cases matching:
  - `custevent_nx_customer` = `customerId`
  - `cseg_sna_revenue_st` in revenue stream list
  - `status` in status list
  - Asset match via `MAP_supportcase_custevent_nxc_case_assets`
- Maps results to a JSON payload with:
  - `case_id`, `case_number`, `case_start_date`, `custevent_nx_customer`, `case_assigned_to`, `revenue_stream`, `subject`, `open_url`
