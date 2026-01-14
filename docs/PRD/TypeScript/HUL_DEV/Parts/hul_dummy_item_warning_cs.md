# hul_dummy_item_warning_cs

Client Script that blocks saving a transaction if a dummy item appears on the item sublist, showing a SweetAlert warning.

## Script Info
- Type: Client Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_dummy_item_warning_cs.ts`
- Dependency: `SuiteScripts/HUL_DEV/Global/hul_swal`

## Trigger
- `pageInit` (preloads SweetAlert).
- `saveRecord` (enforces the block).

## Behavior
- On save, scans the `item` sublist for any target item IDs:
  - `88727`, `86344`, `94479`
- If found:
  - Displays `doNotInvoiceDummyItemSwalMessage()`.
  - Returns `false` to block the save/bill action.
- If not found, returns `true`.

## Notes
- Other client entry points are present but empty.
- Errors in `saveRecord` fall back to allowing the save to proceed.
