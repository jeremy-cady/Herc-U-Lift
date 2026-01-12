# hul_transform_vendor_bill_url

Map/Reduce script that updates Vendor Bill TrinDocs URLs from `http` to `https`.

## Script Info
- Type: Map/Reduce
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Finance/hul_transform_vendor_bill_url.ts`

## Trigger
- Map/Reduce execution (ad-hoc or scheduled deployment).

## Behavior
- **getInputData:** SuiteQL query for Vendor Bills where `custbody_sna_hul_trindocs_url` is not `'null'`.
- **map:** parses each row and writes vendor bill ID → URL.
- **reduce:** replaces `http` with `https` (only the protocol) and updates the Vendor Bill field.
- **summarize:** no active logic (placeholder).

## Data Source
- `transaction` table where `recordType = 'vendorbill'`
- Field: `custbody_sna_hul_trindocs_url`

## Key Fields
- Reads/writes: `custbody_sna_hul_trindocs_url` on Vendor Bills.

## Notes
- The query checks for the literal string `'null'`, not SQL `NULL`.
- URL replacement uses regex `/http(?=:)/` (only changes the protocol prefix).
- Errors are logged via `log.debug`; no retries or summary reporting.
