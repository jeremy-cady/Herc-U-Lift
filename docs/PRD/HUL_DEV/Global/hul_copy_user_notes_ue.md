# hul_copy_user_notes_ue

User Event script that copies user notes from the source Sales Order to a newly created Invoice, with de-duplication safeguards.

## Script Info
- Type: User Event (afterSubmit)
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Global/hul_copy_user_notes_ue.ts`

## Trigger
- Runs on `CREATE` of an Invoice only.

## Behavior
- On invoice creation:
  - Reads `createdfrom` to identify the source Sales Order.
  - Fetches notes from the Sales Order via a Note saved search.
  - Normalizes and hydrates `notetype` and `direction` when missing.
  - Deduplicates notes:
    - Collapses duplicate source notes by signature.
    - Skips notes that already exist on the Invoice.
  - Creates new Note records attached to the Invoice.

## Note Signature / De-duplication
Signature includes:
- Normalized title and memo (whitespace/zero-width cleanup).
- `notetype` and `direction` (coerced; missing values treated as `0`).

## Data Sources
- `note` search with filters on Sales Order `internalid`.
- `search.lookupFields` and `record.load` used to hydrate missing select values.

## Key Fields
- Source link: `createdfrom` on Invoice
- Note fields: `title`, `note`, `notetype`, `direction`, `company`, `transaction`

## Logging
- Uses `log.debug`, `log.audit`, and `log.error` wrappers with JSON-safe payloads.
- Logs hydration paths, de-duplication stats, and created notes.

## Error Handling
- Wrapped in try/catch at key stages:
  - afterSubmit handler
  - search/hydration paths
  - per-note creation
