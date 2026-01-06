/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 08/22/2024
* Revision Date: 08/22/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as query from 'N/query';
import * as sweetAlert from 'SuiteScripts/HUL_DEV/Global/hul_swal';

interface ItemInfo {
    isEligible: boolean;
    alternatePart: string;
};

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
const pageInit = (_ctx: EntryPoints.Client.pageInitContext): void => {
    sweetAlert.preload();
};

const validateLine = (ctx: EntryPoints.Client.validateLineContext) => {
    try {
        const thisRecord = ctx.currentRecord;
        if (ctx.sublistId === 'item') {
            // get item ID
            const itemID = thisRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
            });
            console.log('itemID', itemID);
            // get item type
            const itemType = getItemType(itemID);
            console.log('itemType', itemType);
            // if item type is inventoryitem then continue
            if (itemType === 'InvtPart'){
                console.log('inventory part');
                const itemInfo = getItemRecordValue(itemID);
                console.log('itemInfo',itemInfo);
                const isEligibleResult = itemInfo.itemInfoObj?.isEligible;
                const altPartName = itemInfo.itemInfoObj?.alternatePart;
                console.log('altPartName', altPartName);
                if (!isEligibleResult) {
                    console.log('value is false', isEligibleResult);
                    sweetAlert.partsIsEligibleSwalMessage(altPartName);
                    return false;
                }
                return true;
            }
        };
    } catch (error) {
        console.log('ERROR in fieldChanged', error);
    }
    return true;
};

const getItemRecordValue = (itemID) => {
    try {
        const itemQuery = `
            SELECT item.custitem_hul_eligible_for_sale, item.custitem_hul_alt_part
            FROM item
            WHERE item.id = ${itemID}
        `;
        const itemResult = query.runSuiteQL({
            query: itemQuery
        });
        console.log('itemResults', itemResult);
        let isEligibleResult: any = itemResult.results[0]?.values[0];
        if (isEligibleResult === 'F') {
            isEligibleResult = false;
        } else if (isEligibleResult === 'T') {
            isEligibleResult = true;
        }
        console.log('isEligibleResult', isEligibleResult);
        const altPartID = Number(itemResult.results[0]?.values[1]);
        console.log('altPartID', altPartID);
        if (!isEligibleResult) {
            const altPartID = itemResult.results[0]?.values[1];
            const altPartNameQuery = `
                SELECT item.itemid
                FROM item
                WHERE item.id = ${altPartID}`;
            const altPartQueryResult = query.runSuiteQL({
                query: altPartNameQuery
            });
            console.log('altPartName result', altPartQueryResult);
            const altPartNameResult = String(altPartQueryResult.results[0]?.values[0]);
            console.log('altPartName', altPartNameResult);
            const itemInfoObj: ItemInfo = {
                isEligible: isEligibleResult,
                alternatePart: altPartNameResult
            };
            return {
                itemInfoObj,
            };
        } else if (isEligibleResult) {
            const itemInfoObj: ItemInfo = {
                isEligible: isEligibleResult,
                alternatePart: 'there is no alternate part'
            };
            return {
                itemInfoObj,
            };
        }
    } catch (error) {
        console.log('ERROR in getItemRecordValue', error);
    }
};

const getItemType = (itemID) => {
    const itemTypeQuery = `
        SELECT item.itemtype
        FROM item
        WHERE item.id = ${itemID}
    `;
    const itemTypeQueryResult = query.runSuiteQL({
        query: itemTypeQuery
    });
    console.log('itemTypeQueryResults', itemTypeQueryResult);
    const itemType = String(itemTypeQueryResult.results[0]?.values[0]);
    console.log('itemType', itemType);
    return itemType;
};

export = {
    pageInit,
    validateLine,
};