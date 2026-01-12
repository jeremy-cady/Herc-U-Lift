# sweetalertModule

Public SweetAlert2 wrapper that exposes business-specific message helpers (legacy version).

## Script Info
- Type: Library module
- API: NApiVersion 2.x
- Module scope: Public
- Source: `TypeScript/HUL_DEV/Rental/sweetalertModule.ts`

## Purpose
- Provide SweetAlert2 wrappers for common warnings.
- Uses a globally available `Swal` instance (assumed already loaded).

## Exposed Functions
- `partsIsEligibleSwalMessage(altPartName?)`
- `doNotInvoiceDummyItemSwalMessage()`
- `customerCreditCardRequiredMessage()`

## Behavior
- Uses `setTimeout` before calling `Swal.fire` (1s or 500ms).
- Displays warnings with a fixed `zIndex`.

## Notes
- Assumes `Swal` is already loaded globally; no loader logic.
- Overlaps with `SuiteScripts/HUL_DEV/Global/hul_swal` helpers.
