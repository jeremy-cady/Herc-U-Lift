/* eslint-disable quotes */
/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/22/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as record from 'N/record';

/**
* Function definition to be triggered before record is submitted.
*
* @param {Object} ctx
* @param {Record} ctx.newRecord - New record
* @param {Record} ctx.oldRecord - Old record
* @param {string} ctx.type - Trigger type
* @Since 2015.2
*/
function beforeSubmit(ctx: EntryPoints.UserEvent.beforeSubmitContext) {
    if (ctx.type === ctx.UserEventType.CREATE) {
        try {
            const invoiceRecord = ctx.newRecord;
            const createdFrom = invoiceRecord.getValue('createdfrom'); // Sales Order ID

            if (createdFrom) {
                log.debug('Checking Sales Order for problematic items', createdFrom);

                // Load the Sales Order to check its items
                const salesOrder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: createdFrom
                });

                const targetItemIDs: string[] = ['88727','86344','94479'];
                const foundLine = findItemInSublist(salesOrder, targetItemIDs);

                if (foundLine !== null) {
                    const itemId = salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: foundLine
                    });

                    log.error('Blocking invoice creation', `Sales Order contains item ${itemId} at line ${foundLine}`);
                    // eslint-disable-next-line max-len
                    throw new Error(
                        `=====================================\n` +
                        // eslint-disable-next-line no-trailing-spaces
                        `🚫 INVOICE CREATION BLOCKED 🚫\n` +
                        `=====================================\n\n` +
                        `Reason: Contains restricted item ${  itemId  }\n` +
                        `=====================================\n\n` +
                        `Sales Order ID: ${  createdFrom  }\n` +
                        `=====================================\n\n` +
                        `Action: Contact Parts for removal\n` +
                        `=====================================\n\n` +
                        `Line: ${  foundLine + 1  }\n\n` +
                        `=====================================`
                    );
                }
            }
        } catch (error) {
            if (error.message && error.message.includes('Cannot invoice Sales Order')) {
                throw error; // Re-throw our custom error
            }
            log.error('Unexpected error in beforeSubmit', error);
            // Don't block for unexpected errors
        }
    }
}

const findItemInSublist = (salesOrder: any, targetItemIDs: string[]): number | null => {
    try {
        const lineCount = salesOrder.getLineCount({ sublistId: 'item' });
        for (let i = 0; i < lineCount; i++) {
            const itemID = String(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            }));

            if (targetItemIDs.indexOf(itemID) !== -1) {
                return i;
            }
        }
        return null;
    } catch (error) {
        log.error('Error in findItemInSublist', error);
        return null;
    }
};

function beforeLoad(ctx: EntryPoints.UserEvent.beforeLoadContext) {
}

function afterSubmit(ctx: EntryPoints.UserEvent.afterSubmitContext) {
}

export = { beforeLoad, beforeSubmit, afterSubmit };