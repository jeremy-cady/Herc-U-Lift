/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/10/2024
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
            var urlObjectArray_1 = [];
            var vendorBillQuery = "\n            SELECT transaction.id, transaction.custbody_sna_hul_trindocs_url\n            FROM transaction\n            WHERE transaction.recordType = 'vendorbill'\n            AND transaction.custbody_sna_hul_trindocs_url != 'null'   \n        ";
            var pagedData_1 = query.runSuiteQLPaged({
                query: vendorBillQuery,
                pageSize: 1000
            });
            var pagedDataArray = pagedData_1.pageRanges;
            pagedDataArray.forEach(function (pageOfData) {
                var _a, _b;
                var page = pagedData_1.fetch({
                    index: pageOfData.index
                });
                (_b = (_a = page.data) === null || _a === void 0 ? void 0 : _a.results) === null || _b === void 0 ? void 0 : _b.forEach(function (result) {
                    var vendBillID = result === null || result === void 0 ? void 0 : result.values[0];
                    var trinDocsURL = result === null || result === void 0 ? void 0 : result.values[1];
                    var urlObj = {
                        id: vendBillID,
                        url: trinDocsURL,
                    };
                    urlObjectArray_1.push(urlObj);
                });
            });
            return urlObjectArray_1;
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
            var vendorBillID = searchResult.id;
            var vendorTrinDocsURL = searchResult.url;
            ctx.write({
                key: vendorBillID,
                value: vendorTrinDocsURL
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
        try {
            ctx.values.forEach(function (value) {
                var vendorBillID = ctx.key;
                var vendorTrinDocsURL = value;
                log.debug('vendorBillID in reduce', vendorBillID);
                log.debug('vendorTrinDocsURL in reduce', vendorTrinDocsURL);
                var newURL = vendorTrinDocsURL.replace(/http(?=:)/, 'https');
                log.debug('newURL', newURL);
                var submit = record.submitFields({
                    type: record.Type.VENDOR_BILL,
                    id: vendorBillID,
                    values: {
                        custbody_sna_hul_trindocs_url: "".concat(newURL)
                    }
                });
                log.debug('submit', submit);
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
        // const values: any [] = [];
        // summary.output.iterator().each((key, value) => {
        //     log.debug({
        //         title: `Output for key${  key }`,
        //         details: value
        //     });
        // });
    }
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});
