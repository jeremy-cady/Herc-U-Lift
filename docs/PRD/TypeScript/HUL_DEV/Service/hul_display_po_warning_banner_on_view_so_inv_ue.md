# hul_display_po_warning_banner_on_view_so_inv_ue

User Event that shows a warning banner on view when a customer requires a PO and the transaction has no PO number.

## Script Info
- Type: User Event Script
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Service/hul_display_po_warning_banner_on_view_so_inv_ue.ts`

## Trigger
- `beforeLoad` on VIEW only.

## Key Fields
- Customer field: `custentity_sna_hul_po_required` (PO required flag).
- Transaction field: `otherrefnum` (PO #).

## Behavior
- On VIEW, reads the transaction customer (`entity`).
- Uses `search.lookupFields` to fetch the customer PO-required flag.
- If PO is required and the transaction PO # is blank, shows a page-init error message banner.
