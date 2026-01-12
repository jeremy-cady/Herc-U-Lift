# hul_payment_memo_cs

Client script that auto-populates a payment memo field based on the selected payment option.

## Script Info
- Type: Client Script
- API: NApiVersion 2.0
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Finance/hul_payment_memo_cs.ts`

## Trigger
- `fieldChanged` on `paymentoption`.

## Behavior
- When `paymentoption` changes:
  - Reads the selected payment instrument ID.
  - Queries for its `paymentmethod` via SuiteQL.
  - Builds a memo based on payment method:
    - Static memo values for certain methods (cash/check/terminals/etc.).
    - Looks up `memo` on related records for card/token/ACH methods.
  - Sets `custbody_hul_payment_memo` to the derived memo text.

## Payment Method Handling

**Static memo values:**
- `1`: Cash Payment
- `2`: Check Payment
- `107`: EFT Payment
- `110`: Terminal Payment at Des Moines
- `111`: Terminal Payment at Grand Rapids
- `112`: Terminal Payment at Sioux Falls
- `113`: Versapay Refund
- `115`: Terminal Payment at Maple Plain
- `116`: Internal Billing Payment
- `117`: Versapay Manual Entry Payment

**Memo lookups via SuiteQL:**
- `3,4,5,6,7`: `paymentCard.memo`
- `108`: `paymentCardToken.memo`
- `109`: `generalToken.memo`
- `114`: `AutomatedClearingHouse.memo`

## Data Sources
- `paymentInstrument` (to map instrument → payment method)
- `paymentCard`, `paymentCardToken`, `generalToken`, `AutomatedClearingHouse` (memo text)

## Error Handling
- Wraps `fieldChanged` logic in try/catch and logs errors.

## Notes
- Other Client Script entry points are defined but empty.
- No validation if SuiteQL returns no rows; memo may be undefined.
