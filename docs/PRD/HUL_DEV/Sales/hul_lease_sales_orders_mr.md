# hul_lease_sales_orders_mr

Map/Reduce script that builds a Lease Sales Orders dataset JSON file for the Suitelet to consume.

## Script Info
- Type: Map/Reduce Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Sales/hul_lease_sales_orders_mr.ts`

## Parameters
- `custscript_hul_output_folder`: File Cabinet folder internal ID where the dataset JSON is saved.
- `custscript_hul_run_token`: Optional token used in the output filename and cache key (falls back to a timestamp).

## Input
- Transaction search for Sales Orders:
  - `type` = SalesOrd
  - `mainline` = T
  - `cseg_sna_revenue_st` = 441
  - `status` != SalesOrd:C (exclude closed)

## Output
- JSON file named `hul_lease_so_dataset_<token>.json` containing an array of rows with:
  - `id`, `tranid`, `trandate`, `customer`, `memo`, `custbody1`, `total`, `location`, `firstBillDate`, `lastBillDate`
- Cache entry with key `run_<token>` and value `<fileId>` in cache `hul_dataset_runs` (TTL 1 hour).

## Behavior
- `getInputData`: builds the search and logs an estimated count.
- `map`:
  - Loads each Sales Order to read `total`, `location`, and billing schedule dates.
  - Attempts billing schedule dates from `billingschedule` field; falls back to the billing schedule sublist.
  - Normalizes dates to `YYYY-MM-DD`.
- `reduce`: passes through the JSON row emitted by `map`.
- `summarize`:
  - Collects all rows into an array and writes them to the JSON file in the target folder.
  - Writes the saved file ID to cache so the Suitelet can fetch it without a search delay.
  - Logs usage stats and errors from each stage.
