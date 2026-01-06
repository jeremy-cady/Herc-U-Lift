/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/06/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query"], function (require, exports, log, query) {
    "use strict";
    ;
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
            var objectQuery = "\n        SELECT customrecord_sna_objects.id\n        FROM customrecord_sna_objects\n        ";
            var pagedData_1 = query.runSuiteQLPaged({
                query: objectQuery,
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
                    resultsArray_1.push({ objectID: value });
                });
            });
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
            // parse incoming JSON object
            var searchResult = JSON.parse(ctx.value);
            // declare variable to hold each object ID
            var equipmentObjID = String(searchResult.objectID);
            if (equipmentObjID === '3274') {
                var meterHours = String(getMeterHours(ctx, equipmentObjID));
                var returnObj = {
                    id: equipmentObjID,
                    hours: meterHours
                };
                ctx.write({
                    key: returnObj.id,
                    value: returnObj.hours
                });
            }
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
    }
    /**
    * Executes when the summarize entry point is triggered and applies to the result set.
    * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
    * @Since 2015.2
    */
    function summarize(summary) {
    }
    var getMeterHours = function (ctx, equipmentObjID) {
        var thisRecord = ctx.currentRecord;
        var hourReading = thisRecord.getValue({
            fieldId: 'custrecord_sna_meter_key_on_m1'
        });
        log.debug('hourReading', hourReading);
    };
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});
