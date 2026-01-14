# hul_sync_invoices_daily_ss

Scheduled script that unchecks "Do Not Sync to Versapay" on invoices created today when the Revenue Stream is in an external allowlist, then emails a summary.

## Script Info
- Type: Scheduled Script
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Finance/hul_sync_invoices_daily_ss.ts`

## Trigger
- Scheduled execution (daily).

## Behavior
- Runs a SuiteQL query for invoices created today (UTC day window).
- For each invoice:
  - If Revenue Stream is blank/invalid, tracks as `noRevStream`.
  - If Revenue Stream is in `revStreamExternalValues`, sets `custbody_versapay_do_not_sync` to `false`.
  - Otherwise, tracks as `skipped`.
- Emails the executing user a summary of updates, skips, missing rev streams, and errors.

## Data Source
- `transaction` table (CustInvc)
- Filters: `createddate` within `TRUNC(CURRENT_DATE)` to `TRUNC(CURRENT_DATE)+1`

## Key Fields
- `custbody_versapay_do_not_sync` (updated)
- `cseg_sna_revenue_st` (Revenue Stream)

## Outputs
- Updates invoice body field `custbody_versapay_do_not_sync` (false).
- Sends a summary email to the current user.
- Logs audit details and errors.

## Error Handling
- Per-record submit errors are collected and logged.
- Fatal errors are logged and rethrown.

## Notes
- Date window is based on `createddate` in UTC; confirm this matches the desired business day.
- Revenue Stream allowlist is hardcoded in `revStreamExternalValues`.
