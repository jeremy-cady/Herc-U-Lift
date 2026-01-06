/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/22/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/search", "N/record"], function (require, exports, log, search, record) {
    "use strict";
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
            var itemArray_1 = [];
            var inventoryItemSearchFilters = [
                ['type', 'anyof', 'InvtPart'],
                'AND',
                ['custitem_hul_eligible_for_sale', 'is', 'F'],
            ];
            var inventoryItemSearchColInternalId_1 = search.createColumn({ name: 'internalid' });
            var inventoryItemSearchColItemId_1 = search.createColumn({ name: 'itemid', sort: search.Sort.ASC });
            var inventoryItemSearch = search.create({
                type: 'inventoryitem',
                filters: inventoryItemSearchFilters,
                columns: [
                    inventoryItemSearchColInternalId_1,
                    inventoryItemSearchColItemId_1,
                ],
            });
            // // NOTE: Search.run() is limited to 4,000 results
            // itemSearch.run().each((result: search.Result): boolean => {
            //     // ...
            //
            //     return true;
            // });
            var itemSearchPagedData = inventoryItemSearch.runPaged({ pageSize: 1000 });
            for (var i = 0; i < itemSearchPagedData.pageRanges.length; i++) {
                var itemSearchPage = itemSearchPagedData.fetch({ index: i });
                itemSearchPage.data.forEach(function (result) {
                    var itemId = result.getValue(inventoryItemSearchColItemId_1);
                    var internalId = Number(result.getValue(inventoryItemSearchColInternalId_1));
                    // ...
                    var item = {
                        name: itemId,
                        id: internalId
                    };
                    itemArray_1.push(item);
                });
            }
            return itemArray_1;
        }
        catch (error) {
            log.debug('ERROR in getData', error);
        }
    }
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        // parse incoming JSON object
        var searchResult = JSON.parse(ctx.value);
        var itemName = searchResult.name;
        var itemInternalID = searchResult.id;
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
    function reduce(ctx) {
        try {
            ctx.values.forEach(function (value) {
                var itemID = Number(ctx.key);
                var recordType = 'inventoryitem';
                record.submitFields({
                    type: recordType,
                    id: itemID,
                    values: {
                        // eslint-disable-next-line quote-props
                        'custitem_hul_eligible_for_sale': 'T',
                    }
                });
            });
        }
        catch (error) {
            log.debug('ERROR in reduce', error);
        }
        ;
    }
    /**
    * Executes when the summarize entry point is triggered and applies to the result set.
    * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
    * @Since 2015.2
    */
    function summarize(summary) {
    }
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});
