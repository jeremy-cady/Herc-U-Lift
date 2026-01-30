/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 08/22/2024
* Revision Date: 01/29/2026
* Version: 2.0 - PRODUCTION
*/
define(["require", "exports", "N/query", "SuiteScripts/HUL_DEV/Global/hul_swal"], function (require, exports, query, sweetAlert) {
    "use strict";
    var pageInit = function (ctx) {
        sweetAlert.preload();
    };
    var validateLine = function (ctx) {
        var _a, _b;
        try {
            var thisRecord = ctx.currentRecord;
            if (ctx.sublistId === 'item') {
                var itemID = thisRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                });
                if (!itemID) {
                    return true;
                }
                var itemType = getItemType(itemID);
                if (itemType === 'InvtPart') {
                    var itemInfo = getItemRecordValue(itemID);
                    var isEligibleResult = (_a = itemInfo.itemInfoObj) === null || _a === void 0 ? void 0 : _a.isEligible;
                    var altPartName = (_b = itemInfo.itemInfoObj) === null || _b === void 0 ? void 0 : _b.alternatePart;
                    if (!isEligibleResult) {
                        // Show Sweet Alert only - no native alert
                        sweetAlert.partsIsEligibleSwalMessage(altPartName);
                        return false;
                    }
                    return true;
                }
            }
        }
        catch (error) {
            console.error('[ITEM-ELIGIBLE] ERROR in validateLine', error);
        }
        return true;
    };
    var getItemRecordValue = function (itemID) {
        var _a, _b, _c;
        try {
            var itemQuery = "\n            SELECT item.custitem_hul_eligible_for_sale, item.custitem_hul_alt_part\n            FROM item\n            WHERE item.id = ".concat(itemID, "\n        ");
            var itemResult = query.runSuiteQL({ query: itemQuery });
            var isEligibleResult = (_a = itemResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0];
            if (isEligibleResult === 'F')
                isEligibleResult = false;
            if (isEligibleResult === 'T')
                isEligibleResult = true;
            if (!isEligibleResult) {
                var altPartID = (_b = itemResult.results[0]) === null || _b === void 0 ? void 0 : _b.values[1];
                if (altPartID) {
                    var altPartNameQuery = "\n                    SELECT item.itemid\n                    FROM item\n                    WHERE item.id = ".concat(altPartID, "\n                ");
                    var altPartQueryResult = query.runSuiteQL({ query: altPartNameQuery });
                    var altPartNameResult = String((_c = altPartQueryResult.results[0]) === null || _c === void 0 ? void 0 : _c.values[0]);
                    var itemInfoObj_1 = {
                        isEligible: isEligibleResult,
                        alternatePart: altPartNameResult
                    };
                    return { itemInfoObj: itemInfoObj_1 };
                }
            }
            var itemInfoObj = {
                isEligible: isEligibleResult,
                alternatePart: 'there is no alternate part'
            };
            return { itemInfoObj: itemInfoObj };
        }
        catch (error) {
            console.error('[ITEM-ELIGIBLE] ERROR in getItemRecordValue', error);
            return {
                itemInfoObj: {
                    isEligible: true,
                    alternatePart: ''
                }
            };
        }
    };
    var getItemType = function (itemID) {
        var _a;
        try {
            var itemTypeQuery = "\n            SELECT item.itemtype\n            FROM item\n            WHERE item.id = ".concat(itemID, "\n        ");
            var itemTypeQueryResult = query.runSuiteQL({ query: itemTypeQuery });
            return String((_a = itemTypeQueryResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0]);
        }
        catch (error) {
            console.error('[ITEM-ELIGIBLE] ERROR in getItemType', error);
            return '';
        }
    };
    return {
        pageInit: pageInit,
        validateLine: validateLine,
    };
});
