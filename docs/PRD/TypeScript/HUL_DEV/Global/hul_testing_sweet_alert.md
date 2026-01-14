# hul_testing_sweet_alert

Client Script used to test SweetAlert2 loading from File Cabinet URLs with verbose logging and toast feedback.

## Script Info
- Type: Client Script
- API: NApiVersion 2.0
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Global/hul_testing_sweet_alert.ts`

## Trigger
- `pageInit`
- Also attaches a `window.load` listener to run the same test.

## Behavior
- Attempts to load SweetAlert2 from:
  - A hardcoded media URL (with cache-busting fallback).
  - File Cabinet path `/SuiteScripts/HUL_DEV/Third_Party_Applications/sweetalert2.all.js`.
  - Origin-prefixed and cache-busted variants.
- Logs each attempt to the console.
- On success, shows a SweetAlert2 toast confirming load.

## Notes
- Uses `zIndex` in the SweetAlert2 options (may be ignored by SA2 v11).
- Intended for diagnostics; not production logic.
