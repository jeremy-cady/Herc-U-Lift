# hul_invoice_warning_batch_proc_ue

User Event script that blocks invoice creation when the source Sales Order contains restricted items.

## Script Info
- Type: User Event (beforeSubmit)
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_invoice_warning_batch_proc_ue.ts`

## Trigger
- Runs on Invoice `CREATE` only.

## Behavior
- If the invoice is created from a Sales Order:
  - Loads the Sales Order.
  - Scans the `item` sublist for restricted item IDs:
    - `88727`, `86344`, `94479`
  - If found, throws an error to block invoice creation with a detailed message.

## Notes
- The error message is formatted for readability in the NetSuite UI.
- Unexpected errors are logged and do not block creation.

## Error Handling
- Only blocks when restricted items are detected.
- Logs unexpected errors and allows the invoice to proceed.
