/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/01/2025
* Version: 1.0
*/
define(["require", "exports", "N/record", "N/log", "N/search", "N/query"], function (require, exports, record, log, search, query) {
    "use strict";
    /**
     * Defines the function definition that is executed at the beginning of the map/reduce process and generates input data.
     */
    function getInputData() {
        try {
            // Search for equipment assets for testing (limited range)
            var assetSearch = search.create({
                type: 'customrecord_nx_asset',
                filters: [
                    ['custrecord_nxc_na_asset_type', 'is', '2'],
                    'AND',
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['internalidnumber', 'between', '150000', '200000']
                ],
                columns: [
                    search.createColumn({
                        name: 'internalid',
                        label: 'Asset ID'
                    })
                ]
            });
            log.debug('getInputData', 'Created search for equipment assets (ID range: 53000-58000)');
            return assetSearch;
        }
        catch (error) {
            log.error('getInputData failed', error.message);
            throw error;
        }
    }
    /**
     * Defines the function definition that is executed when the map entry point is triggered.
     */
    function map(context) {
        try {
            var searchResult = JSON.parse(context.value);
            var thisAssetId = searchResult.id;
            log.debug('map', "Processing asset ".concat(thisAssetId));
            // Find cases for this specific asset - ordered by highest internal ID (most recent)
            var caseQuery = "\n            SELECT \n                sc.id as case_id\n            FROM \n                supportcase sc\n            WHERE \n                sc.custevent_nx_case_type = '104'\n                AND sc.status IN ('2', '3', '4', '6')\n                AND (\n                    sc.custevent_nxc_case_assets = '".concat(thisAssetId, "'\n                    OR sc.custevent_nxc_case_assets LIKE '%,").concat(thisAssetId, ",%'\n                    OR sc.custevent_nxc_case_assets LIKE '").concat(thisAssetId, ",%'\n                    OR sc.custevent_nxc_case_assets LIKE '%,").concat(thisAssetId, "'\n                )\n            ORDER BY sc.id DESC\n        ");
            var caseResults = query.runSuiteQL({
                query: caseQuery
            });
            if (caseResults.results && caseResults.results.length > 0) {
                // Get the first result (highest internal ID = most recent)
                var mostRecentCase = caseResults.results[0];
                var thisCaseId = mostRecentCase.values[0];
                log.debug('map', "\u203C\uFE0FFound most recent case ".concat(thisCaseId, " for asset ").concat(thisAssetId, "\u203C\uFE0F"));
                context.write({
                    key: thisAssetId,
                    value: {
                        caseId: thisCaseId,
                        assetId: thisAssetId
                    }
                });
            }
            else {
                log.debug('map', "No qualifying cases found for asset ".concat(thisAssetId));
            }
        }
        catch (error) {
            log.error('ERROR IN MAP', error);
        }
    }
    /**
     * Defines the function definition that is executed when the reduce entry point is triggered.
     */
    function reduce(context) {
        try {
            var assetId = context.key;
            var values = context.values;
            if (values.length === 0) {
                log.debug('reduce', "No case data for asset ".concat(assetId));
                return;
            }
            var value = JSON.parse(values[0]); // Should only be one value per asset
            var caseId = value.caseId;
            log.debug('reduce', "Updating asset ".concat(assetId, " with most recent case ").concat(caseId));
            // Update the equipment asset record
            record.submitFields({
                type: 'customrecord_nx_asset',
                id: assetId,
                values: {
                    custrecord_most_recent_checkin_case: caseId
                }
            });
            log.debug('reduce', "Successfully updated asset ".concat(assetId, " with case ").concat(caseId));
        }
        catch (error) {
            log.error('reduce failed', "Error updating asset ".concat(context.key, ": ").concat(error.message));
        }
    }
    /**
     * Defines the function definition that is executed when the summarize entry point is triggered.
     */
    function summarize(summary) {
    }
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
