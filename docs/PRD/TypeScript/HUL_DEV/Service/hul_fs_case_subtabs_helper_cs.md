# hul_fs_case_subtabs_helper_cs

Client Script that loads and displays related open cases for a Field Service case, and optionally prompts users to jump to the Open Cases tab.

## Script Info
- Type: Client Script
- API: NApiVersion 2.0
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.ts`

## Key Fields / IDs
- Case assets field: `custevent_nxc_case_assets`
- Customer field: `custevent_nx_customer` (fallback: `company`)
- Hidden Suitelet URL field: `custpage_oc_sl_url`
- Open Cases tab IDs: `custpage_open_cases_tab`, `custpage_open_cases_subtab`
- List container ID: `openCasesList`
- Debug toggle: `FORCE_NOTIFY` (true forces notification each time)

## Behavior
- Watches customer and asset field changes and reloads the list.
- Builds a Suitelet URL with `customerId` and `assetIds` query params, fetches JSON, and renders a table.
- If rows are found, shows a SweetAlert prompt to jump to the Open Cases tab (one-time per customer+asset selection unless `FORCE_NOTIFY` is true).
- Uses MutationObserver to wait for the list container to appear before initializing.

## Rendering
- Inserts a table with columns: Open (link), Case ID, Case #, Start Date, Customer (ID), Assigned To, Revenue Stream, Subject.
- Shows “Loading…” while fetching and “No related cases.” when empty.
