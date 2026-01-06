/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 11/08/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/record"], function (require, exports, log, query, record) {
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
            var equipmentAssetQuery = "\n            SELECT customrecord_nx_asset.id AS assetid, customrecord_sna_objects.id AS objectid\n            FROM customrecord_nx_asset\n            JOIN customrecord_sna_objects\n            ON customrecord_nx_asset.custrecord_sna_hul_nxcassetobject = customrecord_sna_objects.id\n            WHERE customrecord_nx_asset.custrecord_nxc_na_asset_type = '2'\n            AND customrecord_sna_objects.id > 1253190000\n            AND customrecord_sna_objects.id <= 1253192000\n            ORDER BY customrecord_sna_objects.id ASC\n        ";
            var equipmentAssetQueryResults_1 = query.runSuiteQLPaged({
                query: equipmentAssetQuery,
                pageSize: 1000
            });
            var pagedDataArray = equipmentAssetQueryResults_1.pageRanges;
            var resultsArray_1 = [];
            pagedDataArray.forEach(function (pageOfData) {
                var _a, _b;
                var page = equipmentAssetQueryResults_1.fetch({
                    index: pageOfData.index
                });
                (_b = (_a = page.data) === null || _a === void 0 ? void 0 : _a.results) === null || _b === void 0 ? void 0 : _b.forEach(function (row) {
                    var value = row.values;
                    var assetObject = {
                        assetID: Number(value[0]),
                        objectID: Number(value[1])
                    };
                    resultsArray_1.push(assetObject);
                });
            });
            // log.debug('resultsArray', resultsArray);
            return resultsArray_1;
        }
        catch (error) {
            log.error('ERROR in getInputData', error);
        }
    }
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        try {
            var searchResult = JSON.parse(ctx.value);
            // log.debug('searchResult', searchResult);
            var thisAssetID = searchResult.assetID;
            var thisObjectID = searchResult.objectID;
            ctx.write({
                key: thisAssetID,
                value: thisObjectID
            });
        }
        catch (error) {
            log.error('ERROR in map', error);
        }
    }
    /**
    * Executes when the reduce entry point is triggered and applies to each group.
    * @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
    * @Since 2015.2
    */
    function reduce(ctx) {
        try {
            ctx.values.forEach(function (value) {
                var assetID = ctx.key;
                var objectID = value;
                // log.debug({
                //     title: 'assetID',
                //     details: {
                //         assetID,
                //         objectID,
                //     }
                // });
                // log.debug('objectID', objectID);
                var customRecordType = 'customrecord_sna_objects';
                var submit = record.submitFields({
                    type: customRecordType,
                    id: objectID,
                    values: {
                        custrecord_hul_nxcequipasset: assetID
                    }
                });
                log.debug('submit', submit);
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
