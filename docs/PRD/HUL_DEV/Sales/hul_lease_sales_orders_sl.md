# hul_lease_sales_orders_sl

Suitelet that renders the Lease Sales Orders Summary UI, handles dataset rebuilds, and exports filtered CSV.

## Script Info
- Type: Suitelet
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Sales/hul_lease_sales_orders_sl.ts`

## Constants / Script IDs
- Map/Reduce: `customscript_hul_lease_so_mr` / `customdeploy_hul_lease_so_mr`
- Output folder: `5940799`
- Client script file ID: `8441113`
- File prefix: `hul_lease_so_dataset_`
- Deployment params:
  - `custscript_hul_dataset_fileid`
  - `custscript_hul_last_rebuild_iso`

## Request Parameters
- `action`:
  - `csv`: download CSV for filtered dataset
  - `rebuild`: submit Map/Reduce and redirect to polling view
  - `poll`: show progress and finish rebuild handling
- `fileid`: dataset file ID (overrides deployment param)
- `oldfileid`: dataset file ID to delete after rebuild
- `runtoken`: token used to identify the rebuild run
- Filter fields:
  - `custpage_f_tranid`
  - `custpage_f_trandate_from`
  - `custpage_f_trandate_to`
  - `custpage_f_customer`
  - `custpage_f_location`

## Behavior
- `onRequest`:
  - Resolves dataset file ID from URL or deployment param.
  - Dispatches to `csv`, `rebuild`, `poll`, or renders the main page.
- `handleRebuildRequest`:
  - Submits the MR task with `custscript_hul_run_token`.
  - Redirects to the polling view after a short delay.
- `handlePoll`:
  - Shows a progress card with status and derived percentage.
  - When complete:
    - Deletes the previous dataset file (best-effort).
    - Finds the newest dataset file in the output folder by internal ID.
    - Updates deployment params with new file ID and last rebuild ISO timestamp.
    - Redirects back to the main view with the new `fileid`.
- `renderMainPage`:
  - Renders a themed UI with a dataset status banner, toolbar, filters, and results table.
  - Loads the dataset JSON file, applies filters, and renders the table.
  - Injects hidden URLs for toolbar actions (rebuild, CSV, clear filters).
- `writeCsv`:
  - Loads the dataset JSON, applies filters, and returns a CSV download.

## Filtering
- Filters are applied on the client-specified fields using case-insensitive substring matching.
- Date range filtering is applied to `trandate` when either bound is provided.

## UI / Theme
- Inline CSS/JS injects a custom card-based layout, sticky table headers, toolbar buttons, and progress bar.
- Toolbar buttons call client-side handlers to rebuild, download CSV, apply filters, and clear filters.
