# hul_hide_po_fields_on_service_so

User Event script that hides PO-related columns on Service Sales Order forms for specific roles.

## Script Info
- Type: User Event (beforeLoad)
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_hide_po_fields_on_service_so.ts`

## Trigger
- Runs on `VIEW` and `EDIT`.

## Behavior
- Reads the transaction custom form ID via SuiteQL.
- If form ID is `106` (NXC) or `105` (Service Estimate), hides selected PO-related columns for allowed roles.

## Role Filters
- Role IDs: `3, 1150, 1154, 1149, 1148, 1147, 1172, 1173`

## Hidden Columns

**Form 106 (NXC):**
- `porate`
- `custcol_sna_linked_po`
- `createpo`
- `custcol_sna_hul_cust_createpo`
- `custcol_sna_hul_cumulative_markup`
- `estgrossprofitpercent`
- `estgrossprofit`

**Form 105 (Service Estimate):**
- `custcol_sna_hul_estimated_po_rate`
- `custcol_sna_hul_cust_createpo`
- `custcol_sna_linked_po`
- `estgrossprofit`
- `estgrossprofitpercent`
- `custcol_sna_hul_cumulative_markup`

## Notes
- Only applies to two specific forms (105 and 106).
