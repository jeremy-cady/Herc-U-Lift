# hul_je_bad_debt_sl

Suitelet that generates an HTML report of Journal Entries for a fixed account, date range, and subsidiary, intended for audit review.

## Script Info
- Type: Suitelet
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Finance/hul_je_bad_debt_sl.ts`

## Trigger
- Runs on `GET` only.

## Behavior
- Executes a saved search for Journal Entries with filters:
  - Type: Journal
  - Account: internal ID `774`
  - Date range: `10/01/2024` to `10/31/2024`
  - Subsidiary: internal ID `2`
- Loads each Journal Entry record and collects line details:
  - Account display
  - Cleared flag
  - Debit/Credit amounts
  - Entity display
  - Location display
- Writes a full HTML page to the response with a table per entry.

## Output
- HTML report titled "Journal Entry Report".
- One section per Journal Entry with line-level rows.
- Includes inline CSS for layout and page breaks.

## Notes
- Filters are hardcoded; no parameters or UI inputs.
- Uses `record.load` for each entry, which may be slow at high volumes.
- Intended for a specific audit month (October 2024) and account.

## Error Handling
- Wraps execution in try/catch.
- Logs error and writes a simple HTML error message if generation fails.
