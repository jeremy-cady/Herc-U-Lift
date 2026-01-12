# hul_customer_credit_card_check_cs

Client Script that warns and blocks Sales Orders when a customer with specific terms does not have a credit card on file.

## Script Info
- Type: Client Script
- API: NApiVersion 2.1
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Rental/hul_customer_credit_card_check_cs.ts`
- Dependency: `SuiteScripts/HUL_DEV/Global/hul_swal`

## Trigger
- `pageInit`
- `postSourcing` (for `entity` and `terms`)
- `saveRecord` (block on save)

## Behavior
- Applies only on form ID `121`.
- Checks whether terms require a credit card (`terms` in `['8']`).
  - If Sales Order terms don’t require it, uses the customer’s terms.
- If a card is required:
  - Validates that the customer has at least one payment instrument with type `1` or `3`.
  - Shows a warning message once when a missing card is detected.
  - Blocks save with a warning if missing at save time.

## Logging
- Logs all payment instrument `instrumenttype` values when a customer is known.
- Uses debounced logging to avoid UI storms.

## Notes
- Uses `hul_swal` to show the message, falling back to `alert`.
- Debounce interval is `250ms`.
