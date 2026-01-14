# testing_library

Minimal test library that shows a NetSuite dialog alert.

## Script Info
- Type: Library module
- API: NApiVersion 2.x
- Source: `TypeScript/HUL_DEV/Libraries/testing_library.ts`

## Behavior
- Calls `dialog.alert` with a hardcoded title and message.
- Returns `sayTheThing` from within itself (recursive return).

## Notes
- The function returns itself rather than a value; likely intended for testing only.
