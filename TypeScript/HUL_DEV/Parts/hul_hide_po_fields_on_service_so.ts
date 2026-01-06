/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/03/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as runtime from 'N/runtime';
import * as serverWidget from 'N/ui/serverWidget';
import * as query from 'N/query';

/**
* Function definition to be triggered before record is loaded.
*
* @param {Object} ctx
* @param {Record} ctx.newRecord - New record
* @param {string} ctx.type - Trigger type
* @param {Form} ctx.form - Form
* @Since 2015.2
*/
function beforeLoad(ctx: EntryPoints.UserEvent.beforeLoadContext) {
    try {
        if (ctx.type === ctx.UserEventType.VIEW ||
            ctx.type === ctx.UserEventType.EDIT) {
            const thisRecord = ctx.newRecord;
            const form = ctx.form;
            const recID = thisRecord.getValue({
                fieldId: 'id'
            });
            const formQuery = `
            SELECT customform 
            FROM transaction
            WHERE transaction.id = '${recID}'
            `;
            const formResult = query.runSuiteQL({
                query: formQuery
            });
            const formID = Number(formResult.results[0]?.values[0]);
            log.debug('form ID', formID);
            const currentUser = runtime.getCurrentUser();
            log.debug('currentUser', currentUser);
            const userRole = currentUser.role;
            log.debug('userRole', userRole);
            const roleIDArray: number [] = [3, 1150, 1154, 1149, 1148, 1147, 1172, 1173];
            // Hide columns based on user role
            if (formID === 106) {
                log.debug('found NXC Form', formID);
                roleIDArray.forEach((role) => {
                    if (userRole === role) {
                        log.debug('YAHTZEE!!', userRole);
                        hidePOColumnOnSO(form, formID);
                    }
                });
            } else if (formID === 105) {
                log.debug('found Service Estimate Form', formID);
                roleIDArray.forEach((role) => {
                    if (userRole === role) {
                        log.debug('DOUBLE YAHTZEE!!', userRole);
                        hidePOColumnOnSO(form, formID);
                    }
                });
            }
        }
    } catch (error) {
        log.debug('ERROR in beforeLoad hiding PO Columns', error);
    }
}

const hidePOColumnOnSO = (form, formID) => {
    try {
        const sublist: serverWidget.Sublist = form.getSublist({
            id: 'item'
        });
        let columnsToHideForSpecificRole: any[] = [];
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
        } else if (formID === 105) {
            columnsToHideForSpecificRole =[
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
        columnsToHideForSpecificRole.forEach((column) => {
            const hiddenColumn = sublist.getField({ id: column });
            if (hiddenColumn) {
                hiddenColumn.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN,
                });
            } else {
                log.debug('Column not found:', hiddenColumn);
            }
        });
    } catch (error) {
        log.debug('ERROR in hideColumns', error);
    }
};

export = { beforeLoad };