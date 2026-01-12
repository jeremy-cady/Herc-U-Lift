# hul_credit_memo_do_not_sync_ue

NetSuite User Event script that sets the "Do Not Sync" flag on Credit Memos when the Revenue Stream matches a predefined allowlist.

## Script Info
- Type: User Event (beforeSubmit)
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Finance/hul_credit_memo_do_not_sync_ue.ts`

## Trigger
- Runs on `CREATE` only.

## Behavior
- Reads:
  - `custbody_versapay_do_not_sync` (current value, logged)
  - `cseg_sna_revenue_st` (Revenue Stream, logged)
- Converts the Revenue Stream value to a number.
- If the Revenue Stream internal ID is in `revStreamInternalValues`, sets:
  - `custbody_versapay_do_not_sync` = `true`
- Otherwise leaves the flag unchanged.

## Revenue Stream Allowlist
The script uses a hardcoded list of internal IDs in `revStreamInternalValues`. Any Credit Memo created with a Revenue Stream in this list will be flagged as "Do Not Sync".

## Error Handling
- Wraps logic in a try/catch.
- Logs errors via `log.error` with the error message.

## Notes
- Only affects new Credit Memos. Edits and updates are not handled.
- If `cseg_sna_revenue_st` is empty or non-numeric, the flag is not changed.
