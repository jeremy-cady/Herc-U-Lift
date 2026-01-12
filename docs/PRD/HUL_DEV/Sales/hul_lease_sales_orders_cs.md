# hul_lease_sales_orders_cs

Client Script that provides button handlers for a Lease Dataset Viewer Suitelet.

## Script Info
- Type: Client Script
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Sales/hul_lease_sales_orders_cs.ts`

## Trigger
- `pageInit` (no-op).
- Button handlers called from the Suitelet UI.

## Behavior
- `onDownloadCsv`: reads hidden field `custpage_csv_url` and navigates to it.
- `onRebuildClick`: reads hidden field `custpage_rebuild_url` and navigates to it.
- Alerts the user if either URL is missing.
