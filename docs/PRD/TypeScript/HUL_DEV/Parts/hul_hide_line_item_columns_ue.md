# hul_hide_line_item_columns_ue

User Event script that hides many item sublist columns on specific Sales Order forms for certain roles.

## Script Info
- Type: User Event (beforeLoad)
- API: NApiVersion 2.x
- Module scope: SameAccount
- Source: `TypeScript/HUL_DEV/Parts/hul_hide_line_item_columns_ue.ts`

## Trigger
- Runs on `VIEW` and `EDIT`.

## Behavior
- Reads the transaction’s custom form ID via SuiteQL.
- If form ID is `106`, and the user’s role matches the allowed list, hides a long list of item sublist columns.

## Role Filters
- Role IDs: `1495, 1175, 1174, 1185, 1163, 1168, 1152`

## Fields Hidden
- Hides numerous item sublist fields including:
  - `custcol_sna_hul_act_service_hours`
  - `custcol_ava_multitaxtypes`
  - `custcol_sn_hul_billingsched`
  - `custcol_sna_sales_rep`
  - `custcol_sna_hul_comm_rate`
  - `custcol_sna_hul_sales_rep_comm_type`
  - `custcol_sna_hul_eligible_for_comm`
  - `custcol_sna_commission_amount`
  - `custcol_sna_override_commission`
  - `custcol_sna_commission_plan`
  - `custcol_sna_sales_rep_matrix`
  - `custcol_sna_hul_sales_rep_csm`
  - `custcol_sna_cpg_resource`
  - `custcol_sna_hul_returns_handling`
  - `custcol_sna_hul_temp_item_uom`
  - `custcol_sna_linked_transaction`
  - `custcol_sna_hul_gen_prodpost_grp`
  - `custcol_sna_so_service_code_type`
  - `custcol_sna_po_fleet_code`
  - `custcol_sna_source_transaction`
  - `custcol_sna_service_itemcode`
  - `custcol_sna_default_rev_stream`
  - `custcol_sn_for_warranty_claim`
  - `custcol_sna_exc_notes`
  - `custcol_sna_used_qty_exc`
  - `custcol_nx_asset`
  - `custcol_nx_consumable`
  - `custcol_nx_task`
  - `custcol_nxc_case`
  - `custcol_nxc_equip_asset`
  - `commitmentfirm`
  - `custcol_ava_shiptousecode`
  - `cseg_sna_hul_eq_seg`
  - `cseg_hul_mfg`
  - `custcol_sna_hul_fleet_no`
  - `custcol_sna_hul_obj_model`
  - `custcol_sna_obj_serialno`
  - `custcol_sna_obj_fleetcode`
  - `custcol_sna_week_bestprice`
  - `custcol_sna_day_bestprice`
  - `orderpriority`
  - `expectedshipdate`
  - `excludefromraterequest`
  - `custcol_sna_extra_days`
  - `itemfulfillmentchoice`
  - `custcol_sna_group_code`
  - `custcol_sna_hul_item_category`
  - `custcol_sn_internal_billing_processed`
  - `custcol_sna_hul_newunitcost`
  - `custcolsna_hul_newunitcost_wodisc`
  - `custcol_sna_task_assigned_to`
  - `custcol_sna_taskcase`
  - `custcol_sna_task_company`
  - `custcol_sna_taskdate`
  - `custcol_sna_time_posted`
  - `custcol_sna_work_code`
  - `custcol_sna_repair_code`

## Notes
- Form check is done via SuiteQL on the `transaction` table.
- Only applies when the custom form is `106`.
