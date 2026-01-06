/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/12/2024
* Version: 1.0
*/
define(["require", "exports", "N/ui/serverWidget", "N/runtime", "N/log", "N/query"], function (require, exports, serverWidget, runtime, log, query) {
    "use strict";
    // import * as record from 'N/record';
    /**
    * Function definition to be triggered before record is loaded.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {string} ctx.type - Trigger type
    * @param {Form} ctx.form - Form
    * @Since 2015.2
    */
    function beforeLoad(ctx) {
        var _a;
        try {
            if (ctx.type === ctx.UserEventType.VIEW ||
                ctx.type === ctx.UserEventType.EDIT) {
                var thisRecord = ctx.newRecord;
                var form_1 = ctx.form;
                var recID = thisRecord.getValue({
                    fieldId: 'id'
                });
                var currentUser = runtime.getCurrentUser();
                var userRole_1 = currentUser.role;
                var roleIDArray = [1495, 1175, 1174, 1185, 1163, 1168, 1152];
                // Hide columns based on user role
                var formQuery = "\n                SELECT customform \n                FROM transaction\n                WHERE transaction.id = '".concat(recID, "'\n                ");
                var formResult = query.runSuiteQL({
                    query: formQuery
                });
                var formID = Number((_a = formResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
                if (formID === 106) {
                    roleIDArray.forEach(function (role) {
                        if (userRole_1 === role) {
                            hideColumn(form_1);
                        }
                    });
                }
            }
        }
        catch (error) {
            log.debug('ERROR in beforeLoad: ', error);
        }
    }
    var hideColumn = function (form) {
        try {
            var sublist_1 = form.getSublist({
                id: 'item'
            });
            var columnsToHideForSpecificRole = [
                'custcol_sna_hul_act_service_hours',
                'custcol_ava_multitaxtypes',
                'custcol_sn_hul_billingsched',
                'custcol_sna_sales_rep',
                'custcol_sna_hul_comm_rate',
                'custcol_sna_hul_sales_rep_comm_type',
                'custcol_sna_hul_eligible_for_comm',
                'custcol_sna_commission_amount',
                'custcol_sna_override_commission',
                'custcol_sna_commission_plan',
                'custcol_sna_sales_rep_matrix',
                'custcol_sna_hul_sales_rep_csm',
                'custcol_sna_cpg_resource',
                'custcol_sna_hul_returns_handling',
                'custcol_sna_hul_temp_item_uom',
                'custcol_sna_linked_transaction',
                'custcol_sna_hul_gen_prodpost_grp',
                'custcol_sna_so_service_code_type',
                'custcol_sna_po_fleet_code',
                'custcol_sna_source_transaction',
                'custcol_sna_service_itemcode',
                'custcol_sna_default_rev_stream',
                'custcol_sn_for_warranty_claim',
                'custcol_sna_exc_notes',
                'custcol_sna_used_qty_exc',
                'custcol_nx_asset',
                'custcol_nx_consumable',
                'custcol_nx_task',
                'custcol_nxc_case',
                'custcol_nxc_equip_asset',
                'commitmentfirm',
                'custcol_ava_shiptousecode',
                'cseg_sna_hul_eq_seg',
                'cseg_hul_mfg',
                'custcol_sna_hul_fleet_no',
                'custcol_sna_hul_obj_model',
                'custcol_sna_obj_serialno',
                'custcol_sna_obj_fleetcode',
                'custcol_sna_week_bestprice',
                'custcol_sna_day_bestprice',
                'orderpriority',
                'expectedshipdate',
                'excludefromraterequest',
                'custcol_sna_extra_days',
                'itemfulfillmentchoice',
                'custcol_sna_group_code',
                'custcol_sna_hul_item_category',
                'custcol_sn_internal_billing_processed',
                'custcol_sna_hul_newunitcost',
                'custcolsna_hul_newunitcost_wodisc',
                'custcol_sna_task_assigned_to',
                'custcol_sna_taskcase',
                'custcol_sna_task_company',
                'custcol_sna_taskdate',
                'custcol_sna_time_posted',
                'custcol_sna_work_code',
                'custcol_sna_repair_code'
            ];
            columnsToHideForSpecificRole.forEach(function (column) {
                var hiddenColumn = sublist_1.getField({ id: column });
                if (hiddenColumn) {
                    hiddenColumn.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN,
                    });
                }
                else {
                    log.debug('Column not found:', hiddenColumn);
                }
            });
        }
        catch (error) {
            log.debug('ERROR in hideColumns', error);
        }
    };
    return { beforeLoad: beforeLoad };
});
