/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/03/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/runtime", "N/ui/serverWidget", "N/query"], function (require, exports, log, runtime, serverWidget, query) {
    "use strict";
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
                var formQuery = "\n            SELECT customform \n            FROM transaction\n            WHERE transaction.id = '".concat(recID, "'\n            ");
                var formResult = query.runSuiteQL({
                    query: formQuery
                });
                var formID_1 = Number((_a = formResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
                log.debug('form ID', formID_1);
                var currentUser = runtime.getCurrentUser();
                log.debug('currentUser', currentUser);
                var userRole_1 = currentUser.role;
                log.debug('userRole', userRole_1);
                var roleIDArray = [1150, 1154, 1149, 1148, 1147, 1172, 1173];
                // Hide columns based on user role
                if (formID_1 === 106) {
                    log.debug('found NXC Form', formID_1);
                    roleIDArray.forEach(function (role) {
                        if (userRole_1 === role) {
                            log.debug('YAHTZEE!!', userRole_1);
                            hidePOColumnOnSO(form_1, formID_1);
                        }
                    });
                }
                else if (formID_1 === 105) {
                    log.debug('found Service Estimate Form', formID_1);
                    roleIDArray.forEach(function (role) {
                        if (userRole_1 === role) {
                            log.debug('DOUBLE YAHTZEE!!', userRole_1);
                            hidePOColumnOnSO(form_1, formID_1);
                        }
                    });
                }
            }
        }
        catch (error) {
            log.debug('ERROR in beforeLoad hiding PO Columns', error);
        }
    }
    var hidePOColumnOnSO = function (form, formID) {
        try {
            var sublist_1 = form.getSublist({
                id: 'item'
            });
            var columnsToHideForSpecificRole = [];
            if (formID === 106) {
                columnsToHideForSpecificRole = [
                    // PO RATE
                    'porate',
                    // Linked PO Number
                    'custcol_sna_linked_po',
                    // Create PO
                    'createpo',
                    // Custom Create PO
                    'custcol_sna_hul_cust_createpo',
                    // Cumulative % Mark Up
                    'custcol_sna_hul_cumulative_markup',
                    // Estimated Gross Profit Percent
                    'estgrossprofitpercent',
                    // Est. Gross Profit
                    'estgrossprofit'
                ];
            }
            else if (formID === 105) {
                columnsToHideForSpecificRole = [
                    // Estimated PO Rate
                    'custcol_sna_hul_estimated_po_rate',
                    // Custom Create PO
                    'custcol_sna_hul_cust_createpo',
                    // Linked Purchase Order
                    'custcol_sna_linked_po',
                    // Est. Gross Profit
                    'estgrossprofit',
                    // Est. Gross Profit Percent
                    'estgrossprofitpercent',
                    // Cumulative % Mark Up
                    'custcol_sna_hul_cumulative_markup',
                ];
            }
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
