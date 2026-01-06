/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/22/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';

interface ItemObject {
    name: string;
    id: number;
}

/**
* Marks the beginning of the Map/Reduce process and generates input data.
* @typedef {Object} ObjectRef
* @property {number} id - Internal ID of the record instance
* @property {string} type - Record type id
* @return {Array|Object|Search|RecordRef} inputSummary
* @Since 2015.2
*/
function getInputData() {
    try {
        const itemArray: any[] = [];
        const inventoryItemSearchFilters: SavedSearchFilters = [
            ['type', 'anyof', 'InvtPart'],
            'AND',
            ['custitem_hul_eligible_for_sale', 'is', 'F'],
        ];
        const inventoryItemSearchColInternalId = search.createColumn({ name: 'internalid' });
        const inventoryItemSearchColItemId = search.createColumn({ name: 'itemid', sort: search.Sort.ASC });
        const inventoryItemSearch = search.create({
            type: 'inventoryitem',
            filters: inventoryItemSearchFilters,
            columns: [
                inventoryItemSearchColInternalId,
                inventoryItemSearchColItemId,
            ],
        });
        // // NOTE: Search.run() is limited to 4,000 results
        // itemSearch.run().each((result: search.Result): boolean => {
        //     // ...
        //
        //     return true;
        // });
        const itemSearchPagedData = inventoryItemSearch.runPaged({ pageSize: 1000 });
        for (let i = 0; i < itemSearchPagedData.pageRanges.length; i++) {
            const itemSearchPage = itemSearchPagedData.fetch({ index: i });
            itemSearchPage.data.forEach((result: search.Result): void => {
                const itemId = <string>result.getValue(inventoryItemSearchColItemId);
                const internalId = Number(<string>result.getValue(inventoryItemSearchColInternalId));
                // ...
                const item: ItemObject = {
                    name: itemId,
                    id: internalId
                };
                itemArray.push(item);
            });
        }
        interface NestedArray<T> extends Array<T | NestedArray<T>> { }
        type SavedSearchFilters = string | NestedArray<string | search.Operator>;
        return itemArray;
    } catch (error) {
        log.debug('ERROR in getData', error);
    }
}

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    // parse incoming JSON object
    const searchResult = JSON.parse(ctx.value) as { name: string; id: string };
    const itemName = searchResult.name;
    const itemInternalID = searchResult.id;

    ctx.write({
        key: itemInternalID,
        value: JSON.stringify(itemName)
    });
}

/**
* Executes when the reduce entry point is triggered and applies to each group.
* @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
* @Since 2015.2
*/
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
    try {
        ctx.values.forEach((value) => {
            const itemID = Number(ctx.key);
            const recordType = 'inventoryitem';
            record.submitFields({
                type: recordType,
                id: itemID,
                values: {
                    // eslint-disable-next-line quote-props
                    'custitem_hul_eligible_for_sale': 'T',
                }
            });
        });
    } catch (error) {
        log.debug('ERROR in reduce', error);
    };
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
}

export = { getInputData, map, reduce, summarize };