/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/27/2024
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/query", "N/search", "N/record"], function (require, exports, log, query, search, record) {
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
            var eqipObjectIDArray_1 = [];
            var customrecordSnaObjectsSearchFilters = [
                ['custrecord_sna_equipment_model', 'noneof', '@NONE@'],
                'AND',
                ['internalidnumber', 'between', '1253220000', '10000000000'],
            ];
            var customrecordSnaObjectsSearchColInternalId_1 = search.createColumn({ name: 'internalid' });
            var customrecordSnaObjectsSearchColExternalId_1 = search.createColumn({ name: 'externalid' });
            var customrecordSnaObjectsSearchColMeterKeyOnM1 = search.createColumn({ name: 'custrecord_hul_meter_key_static' });
            var customrecordSnaObjectsSearch = search.create({
                type: 'customrecord_sna_objects',
                filters: customrecordSnaObjectsSearchFilters,
                columns: [
                    customrecordSnaObjectsSearchColInternalId_1,
                    customrecordSnaObjectsSearchColExternalId_1,
                    customrecordSnaObjectsSearchColMeterKeyOnM1,
                ],
            });
            // // NOTE: Search.run() is limited to 4,000 results
            // customrecordSnaObjectsSearch.run().each((result: search.Result): boolean => {
            //     // ...
            //
            //     return true;
            // });
            var customrecordSnaObjectsSearchPagedData = customrecordSnaObjectsSearch.runPaged({ pageSize: 1000 });
            for (var i = 0; i < customrecordSnaObjectsSearchPagedData.pageRanges.length; i++) {
                var customrecordSnaObjectsSearchPage = customrecordSnaObjectsSearchPagedData.fetch({ index: i });
                customrecordSnaObjectsSearchPage.data.forEach(function (result) {
                    var internalId = result.getValue(customrecordSnaObjectsSearchColInternalId_1);
                    var externalId = result.getValue(customrecordSnaObjectsSearchColExternalId_1);
                    var equipObj = {
                        name: externalId,
                        id: internalId
                    };
                    eqipObjectIDArray_1.push(equipObj);
                });
            }
            return eqipObjectIDArray_1;
        }
        catch (error) {
            log.debug('ERROR getting input data', error);
        }
        ;
    }
    ;
    /**
    * Executes when the map entry point is triggered and applies to each key/value pair.
    * @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
    * @Since 2015.2
    */
    function map(ctx) {
        // parse incoming JSON object
        var searchResult = JSON.parse(ctx.value);
        var equipObjInternalID = searchResult.id;
        var equipObjName = searchResult.name;
        // write values to context
        ctx.write({
            key: equipObjInternalID,
            value: equipObjName
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
                var _a;
                var equipmentObjID = Number(ctx.key);
                var recordType = 'customrecord_sna_objects';
                // declare the SQL query that will give us the maximum meter reading from a given object.
                var meterReadingQuery = "\n            SELECT MAX(customrecord_sna_hul_hour_meter.custrecord_sna_hul_hour_meter_reading)\n            FROM customrecord_sna_hul_hour_meter\n            WHERE custrecord_sna_hul_object_ref = '".concat(equipmentObjID, "'\n        ");
                var meterReadingResult = query.runSuiteQL({
                    query: meterReadingQuery
                });
                log.debug('meterReadingResult', meterReadingResult);
                var currentMeterReading = (_a = meterReadingResult.results[0]) === null || _a === void 0 ? void 0 : _a.values[0];
                log.debug('currentMeterReading', currentMeterReading);
                if (currentMeterReading === 0) {
                    currentMeterReading = null;
                }
                record.submitFields({
                    type: recordType,
                    id: equipmentObjID,
                    values: {
                        custrecord_hul_meter_key_static: currentMeterReading,
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
