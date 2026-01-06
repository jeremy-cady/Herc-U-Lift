/* eslint-disable quotes */
/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/22/2025
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/record"], function (require, exports, log, record) {
    "use strict";
    /**
    * Function definition to be triggered before record is submitted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {Record} ctx.oldRecord - Old record
    * @param {string} ctx.type - Trigger type
    * @Since 2015.2
    */
    function beforeSubmit(ctx) {
        if (ctx.type === ctx.UserEventType.CREATE) {
            try {
                var invoiceRecord = ctx.newRecord;
                var createdFrom = invoiceRecord.getValue('createdfrom'); // Sales Order ID
                if (createdFrom) {
                    log.debug('Checking Sales Order for problematic items', createdFrom);
                    // Load the Sales Order to check its items
                    var salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: createdFrom
                    });
                    var targetItemIDs = ['88727', '86344', '94479'];
                    var foundLine = findItemInSublist(salesOrder, targetItemIDs);
                    if (foundLine !== null) {
                        var itemId = salesOrder.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: foundLine
                        });
                        log.error('Blocking invoice creation', "Sales Order contains item ".concat(itemId, " at line ").concat(foundLine));
                        // eslint-disable-next-line max-len
                        throw new Error("=====================================\n" +
                            // eslint-disable-next-line no-trailing-spaces
                            "\uD83D\uDEAB INVOICE CREATION BLOCKED \uD83D\uDEAB\n" +
                            "=====================================\n\n" +
                            "Reason: Contains restricted item ".concat(itemId, "\n") +
                            "=====================================\n\n" +
                            "Sales Order ID: ".concat(createdFrom, "\n") +
                            "=====================================\n\n" +
                            "Action: Contact Parts for removal\n" +
                            "=====================================\n\n" +
                            "Line: ".concat(foundLine + 1, "\n\n") +
                            "=====================================");
                    }
                }
            }
            catch (error) {
                if (error.message && error.message.includes('Cannot invoice Sales Order')) {
                    throw error; // Re-throw our custom error
                }
                log.error('Unexpected error in beforeSubmit', error);
                // Don't block for unexpected errors
            }
        }
    }
    var findItemInSublist = function (salesOrder, targetItemIDs) {
        try {
            var lineCount = salesOrder.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < lineCount; i++) {
                var itemID = String(salesOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                }));
                if (targetItemIDs.indexOf(itemID) !== -1) {
                    return i;
                }
            }
            return null;
        }
        catch (error) {
            log.error('Error in findItemInSublist', error);
            return null;
        }
    };
    function beforeLoad(ctx) {
    }
    function afterSubmit(ctx) {
    }
    return { beforeLoad: beforeLoad, beforeSubmit: beforeSubmit, afterSubmit: afterSubmit };
});
