# hul_pop_rental_form_ue

User Event script that sets default revenue stream values for rental roles and auto-waives insurance when a valid COI exists.

## Script Info
- Type: User Event (beforeLoad)
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Rental/hul_pop_rental_form_ue.ts`

## Trigger
- Runs on `CREATE` only.

## Behavior
- On create:
  - Sets `cseg_sna_revenue_st` to `416` for specific rental roles.
  - Checks the customer's certificate of insurance and expiration date.
  - If valid and not expired, sets `custbody_sna_hul_waive_insurance` to `true`.

## Role Filters
- `1162` Rental Assistant Manager
- `1151` Rental Billing Coordinator
- `1184` Rental Coordinator
- `1167` Rental Manager

## Data Sources
- Customer fields:
  - `custentity_sna_cert_of_insurance`
  - `custentity_sna_hul_date_of_exp_coi`

## Notes
- `beforeSubmit` and `afterSubmit` are defined but empty.
- Insurance waiver is only set when both COI exists and expiration date is future-dated.
