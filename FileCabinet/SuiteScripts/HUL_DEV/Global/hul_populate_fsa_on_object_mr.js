/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/26/2024
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
            var fsaQuery = "\n        SELECT customrecord_nx_asset.id\n        FROM customrecord_nx_asset\n        WHERE customrecord_nx_asset.custrecord_nxc_na_asset_type = '2'\n        ORDER BY customrecord_nx_asset.id ASC     \n        ";
            var pagedData_1 = query.runSuiteQLPaged({
                query: fsaQuery,
                pageSize: 1000
            });
            var pagedDataArray = pagedData_1.pageRanges;
            var resultsArray_1 = [];
            pagedDataArray.forEach(function (pageOfData) {
                var _a, _b;
                var page = pagedData_1.fetch({
                    index: pageOfData.index
                });
                (_b = (_a = page.data) === null || _a === void 0 ? void 0 : _a.results) === null || _b === void 0 ? void 0 : _b.forEach(function (row) {
                    var value = row.values[0];
                    resultsArray_1.push({ fsaID: value });
                });
            });
            return resultsArray_1;
        }
        catch (error) {
            log.debug('ERROR in getInputData', error);
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
            var fsaID = searchResult.fsaID;
            var objectID = getObjectID(fsaID);
            ctx.write(fsaID, objectID);
        }
        catch (error) {
            log.debug('ERROR in map', error);
        }
    }
    /**
    * Executes when the reduce entry point is triggered and applies to each group.
    * @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
    * @Since 2015.2
    */
    function reduce(ctx) {
        try {
            var fsaID_1 = ctx.key;
            ctx.values.forEach(function (value) {
                try {
                    var objectID = JSON.parse(value);
                    setFSAOnObjectRecord(fsaID_1, objectID);
                }
                catch (error) {
                    log.debug('ERROR', error);
                }
            });
        }
        catch (error) {
            log.debug('ERROR in reduce', error);
        }
    }
    /**
    * Executes when the summarize entry point is triggered and applies to the result set.
    * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
    * @Since 2015.2
    */
    function summarize(summary) {
    }
    var getObjectID = function (fsaID) {
        var _a;
        try {
            var objectQuery = "\n        SELECT customrecord_sna_objects.id\n        FROM customrecord_sna_objects\n        JOIN customrecord_nx_asset\n        ON customrecord_sna_objects.id = customrecord_nx_asset. custrecord_sna_hul_nxcassetobject\n        WHERE customrecord_nx_asset.id = '".concat(fsaID, "'\n        ORDER BY customrecord_nx_asset.id ASC\n    ");
            var objectQueryResult = query.runSuiteQL({ query: objectQuery });
            var objectID = (_a = objectQueryResult === null || objectQueryResult === void 0 ? void 0 : objectQueryResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0];
            return objectID;
        }
        catch (error) {
            log.debug('ERROR in getObjectID', error);
        }
    };
    var setFSAOnObjectRecord = function (fsaID, objectID) {
        try {
            record.submitFields({
                type: 'customrecord_sna_objects',
                id: objectID,
                values: {
                    custrecord_hul_field_service_asset: fsaID
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });
            return true;
        }
        catch (error) {
            log.error('ERROR in setFSAOnObjectRecord', error);
        }
    };
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});
