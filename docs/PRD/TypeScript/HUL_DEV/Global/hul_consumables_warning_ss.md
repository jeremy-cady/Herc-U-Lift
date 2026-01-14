# hul_consumables_warning_ss

Scheduled script that monitors two saved searches for consumables tasks without sales orders and emails an alert when counts hit a threshold.

## Script Info
- Type: Scheduled Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Global/hul_consumables_warning_ss.ts`

## Trigger
- Scheduled execution.

## Behavior
- Loads two saved searches:
  - `customsearch1833` (Closed Tasks without SO - Upload)
  - `customsearch1865` (Closed Tasks without SO - Today)
- Checks each result count against a target threshold of `20`.
- If count is >= 20, sends an email alert to the configured recipients.

## Recipients / Sender
- Recipients: Megan, Tom, Jeremy, Beth (hardcoded email addresses).
- Sender: Employee ID `2363377`.

## Notes
- Subject/body text includes the current count and search name.
- Threshold comparison is `>= TARGET_COUNT`.

## Error Handling
- Wraps execution in try/catch and logs errors with `log.error`.
