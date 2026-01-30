/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 08/22/2024
* Revision Date: 01/29/2026
* Version: 2.0 - PRODUCTION
*/

import { EntryPoints } from 'N/types';
import * as query from 'N/query';
import * as sweetAlert from 'SuiteScripts/HUL_DEV/Global/hul_swal';

interface ItemInfo {
    isEligible: boolean;
    alternatePart: string;
}

const pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
    sweetAlert.preload();
};

const validateLine = (ctx: EntryPoints.Client.validateLineContext) => {
    try {
        const thisRecord = ctx.currentRecord;

        if (ctx.sublistId === 'item') {
            const itemID = thisRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
            });

            if (!itemID) {
                return true;
            }

            const itemType = getItemType(itemID);

            if (itemType === 'InvtPart') {
                const itemInfo = getItemRecordValue(itemID);
                const isEligibleResult = itemInfo.itemInfoObj?.isEligible;
                const altPartName = itemInfo.itemInfoObj?.alternatePart;

                if (!isEligibleResult) {
                    // Show Sweet Alert only - no native alert
                    sweetAlert.partsIsEligibleSwalMessage(altPartName);
                    return false;
                }

                return true;
            }
        }
    } catch (error) {
        console.error('[ITEM-ELIGIBLE] ERROR in validateLine', error);
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
        const itemResult = query.runSuiteQL({ query: itemQuery });

        let isEligibleResult: any = itemResult.results[0]?.values[0];
        if (isEligibleResult === 'F') isEligibleResult = false;
        if (isEligibleResult === 'T') isEligibleResult = true;

        if (!isEligibleResult) {
            const altPartID = itemResult.results[0]?.values[1];

            if (altPartID) {
                const altPartNameQuery = `
                    SELECT item.itemid
                    FROM item
                    WHERE item.id = ${altPartID}
                `;
                const altPartQueryResult = query.runSuiteQL({ query: altPartNameQuery });
                const altPartNameResult = String(
                    altPartQueryResult.results[0]?.values[0]
                );

                const itemInfoObj: ItemInfo = {
                    isEligible: isEligibleResult,
                    alternatePart: altPartNameResult
                };

                return { itemInfoObj };
            }
        }

        const itemInfoObj: ItemInfo = {
            isEligible: isEligibleResult,
            alternatePart: 'there is no alternate part'
        };

        return { itemInfoObj };

    } catch (error) {
        console.error('[ITEM-ELIGIBLE] ERROR in getItemRecordValue', error);
        return {
            itemInfoObj: {
                isEligible: true,
                alternatePart: ''
            }
        };
    }
};

const getItemType = (itemID) => {
    try {
        const itemTypeQuery = `
            SELECT item.itemtype
            FROM item
            WHERE item.id = ${itemID}
        `;
        const itemTypeQueryResult = query.runSuiteQL({ query: itemTypeQuery });
        return String(itemTypeQueryResult.results[0]?.values[0]);
    } catch (error) {
        console.error('[ITEM-ELIGIBLE] ERROR in getItemType', error);
        return '';
    }
};

export = {
    pageInit,
    validateLine,
};