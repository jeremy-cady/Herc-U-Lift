/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/02/2024
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
        var _a;
        var objIDArray = [];
        var objectZeroMeterQuery = "\n        SELECT customrecord_sna_objects.id\n        FROM customrecord_sna_objects\n        WHERE customrecord_sna_objects.custrecord_hul_meter_key_static = '0'\n    ";
        var objectZeroMeterQueryResults = query.runSuiteQL({
            query: objectZeroMeterQuery
        });
        log.debug('objectZeroMeterQueryResults', objectZeroMeterQueryResults);
        (_a = objectZeroMeterQueryResults.results) === null || _a === void 0 ? void 0 : _a.forEach(function (result) {
            var objID = result.values[0];
            objIDArray.push(objID);
        });
        return objIDArray;
    }
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        try {
            var searchResult = JSON.parse(ctx.value);
            var objID = Number(searchResult);
            log.debug('objID in MAP', objID);
            var recordType = 'customrecord_sna_objects';
            record.submitFields({
                type: recordType,
                id: objID,
                values: {
                    custrecord_hul_meter_key_static: null
                }
            });
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
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});
