# hul_update_2025_so_for_commission_mr

Map/Reduce backfill that marks Sales Orders as processed for commission to trigger the commission UE in EDIT context.

## Script Info
- Type: Map/Reduce Script
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Sales/hul_update_2025_so_for_commission_mr.ts`

## Inputs
- Saved search `customsearch_hul_commission_backfill` (Sales Orders).

## Key Fields
- `custbody_hul_processed_for_commission`: boolean used to gate processing.

## Behavior
- `getInputData`: loads the saved search defined by `SAVED_SEARCH_ID`.
- `map`:
  - Loads each Sales Order from the search.
  - Skips if `custbody_hul_processed_for_commission` is already true.
  - Sets `custbody_hul_processed_for_commission` to true and saves the record, firing the commission UE.
- `summarize`: logs usage, concurrency, yields, and any map errors.
