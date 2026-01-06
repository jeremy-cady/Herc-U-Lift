/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 08/22/2024
* Revision Date: 08/22/2024
* Version: 1.0
*/
define(["require", "exports", "N/query", "SuiteScripts/HUL_DEV/Global/hul_swal"], function (require, exports, query, sweetAlert) {
    "use strict";
    ;
    /**
    * Defines the function that is executed when a field is changed by a user or client side call.
    * This event may also execute directly through beforeLoad user event scripts.
    * The following sample tasks can be performed:
    *  - Provide the user with additional information based on user input.
    *  - Disable or enable fields based on user input.
    * @param {Object} ctx
    * @param {Record} ctx.currentRecord - Current form record
    * @param {string} ctx.sublistId - The sublist ID name.
    * @param {string} ctx.fieldId - The field ID name.
    * @param {number} ctx.lineNum - Line number. Will be undefined if not a sublist or matrix field
    * @param {number} ctx.columnNum - Line number. Will be undefined if not a matrix field
    * @returns {void}
    * @Since 2015.2
    */
    var pageInit = function (_ctx) {
        sweetAlert.preload();
    };
    var validateLine = function (ctx) {
        var _a, _b;
        try {
            var thisRecord = ctx.currentRecord;
            if (ctx.sublistId === 'item') {
                // get item ID
                var itemID = thisRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                });
                console.log('itemID', itemID);
                // get item type
                var itemType = getItemType(itemID);
                console.log('itemType', itemType);
                // if item type is inventoryitem then continue
                if (itemType === 'InvtPart') {
                    console.log('inventory part');
                    var itemInfo = getItemRecordValue(itemID);
                    console.log('itemInfo', itemInfo);
                    var isEligibleResult = (_a = itemInfo.itemInfoObj) === null || _a === void 0 ? void 0 : _a.isEligible;
                    var altPartName = (_b = itemInfo.itemInfoObj) === null || _b === void 0 ? void 0 : _b.alternatePart;
                    console.log('altPartName', altPartName);
                    if (!isEligibleResult) {
                        console.log('value is false', isEligibleResult);
                        sweetAlert.partsIsEligibleSwalMessage(altPartName);
                        return false;
                    }
                    return true;
                }
            }
            ;
        }
        catch (error) {
            console.log('ERROR in fieldChanged', error);
        }
        return true;
    };
    var getItemRecordValue = function (itemID) {
        var _a, _b, _c, _d;
        try {
            var itemQuery = "\n            SELECT item.custitem_hul_eligible_for_sale, item.custitem_hul_alt_part\n            FROM item\n            WHERE item.id = ".concat(itemID, "\n        ");
            var itemResult = query.runSuiteQL({
                query: itemQuery
            });
            console.log('itemResults', itemResult);
            var isEligibleResult = (_a = itemResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0];
            if (isEligibleResult === 'F') {
                isEligibleResult = false;
            }
            else if (isEligibleResult === 'T') {
                isEligibleResult = true;
            }
            console.log('isEligibleResult', isEligibleResult);
            var altPartID = Number((_b = itemResult.results[0]) === null || _b === void 0 ? void 0 : _b.values[1]);
            console.log('altPartID', altPartID);
            if (!isEligibleResult) {
                var altPartID_1 = (_c = itemResult.results[0]) === null || _c === void 0 ? void 0 : _c.values[1];
                var altPartNameQuery = "\n                SELECT item.itemid\n                FROM item\n                WHERE item.id = ".concat(altPartID_1);
                var altPartQueryResult = query.runSuiteQL({
                    query: altPartNameQuery
                });
                console.log('altPartName result', altPartQueryResult);
                var altPartNameResult = String((_d = altPartQueryResult.results[0]) === null || _d === void 0 ? void 0 : _d.values[0]);
                console.log('altPartName', altPartNameResult);
                var itemInfoObj = {
                    isEligible: isEligibleResult,
                    alternatePart: altPartNameResult
                };
                return {
                    itemInfoObj: itemInfoObj,
                };
            }
            else if (isEligibleResult) {
                var itemInfoObj = {
                    isEligible: isEligibleResult,
                    alternatePart: 'there is no alternate part'
                };
                return {
                    itemInfoObj: itemInfoObj,
                };
            }
        }
        catch (error) {
            console.log('ERROR in getItemRecordValue', error);
        }
    };
    var getItemType = function (itemID) {
        var _a;
        var itemTypeQuery = "\n        SELECT item.itemtype\n        FROM item\n        WHERE item.id = ".concat(itemID, "\n    ");
        var itemTypeQueryResult = query.runSuiteQL({
            query: itemTypeQuery
        });
        console.log('itemTypeQueryResults', itemTypeQueryResult);
        var itemType = String((_a = itemTypeQueryResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
        console.log('itemType', itemType);
        return itemType;
    };
    return {
        pageInit: pageInit,
        validateLine: validateLine,
    };
});
