# hul_doc_distribution_cs

NetSuite Client Script that adds shift-click range selection for checkbox columns on a results sublist.

## Script Info
- Type: Client Script
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Finance/hul_doc_distribution_cs.ts`

## Trigger
- `pageInit`: registers global Shift key listeners.
- `fieldChanged`: runs when a sublist checkbox changes.

## Sublist + Fields
- Sublist: `custpage_results`
- Checkbox fields:
  - `hide_line`
  - `dismiss`
  - `apply_email`

## Behavior
- Tracks whether the Shift key is held using `keydown`/`keyup` listeners.
- When a checkbox changes:
  - If Shift is held and a prior line is remembered for that column, toggles the entire range between the two lines to match the current checkbox state.
  - Updates the "last line" anchor for that column.
- Operates only on the visible page (no cross-page selection).

## Implementation Notes
- Reads checkbox values with `getSublistValue` and normalizes to boolean.
- Attempts `setSublistValue` when available; otherwise uses `selectLine` → `setCurrentSublistValue` → `commitLine`.
- Uses a `batching` guard to avoid re-entrant `fieldChanged` calls while toggling ranges.

## Error Handling
- No explicit try/catch in the main event handlers; relies on NetSuite to surface errors.
