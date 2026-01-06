/* eslint-disable max-len */
/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/04/2025
* Version: 1.0
*/
define(["require", "exports", "N/record", "N/log", "N/search"], function (require, exports, record, log, search) {
    "use strict";
    /**
     * Defines the function definition that is executed at the beginning of the map/reduce process and generates input data.
     */
    function getInputData() {
        try {
            // Search for cases where custevent_hul_custom_form_id is empty within ID range
            var caseSearch = search.create({
                type: search.Type.SUPPORT_CASE,
                filters: [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['custevent_hul_custom_form_id', 'isempty', ''],
                    'AND',
                    ['type', 'anyof', '7', '4', '6', '3', '12', '9', '8', '5', '1', '11', '10', '2', '13', '15', '14'],
                    'AND',
                    ['custevent_sna_hul_casedept', 'anyof', '34', '28', '18', '23', '4', '37', '36', '35', '3']
                ],
                columns: [
                    search.createColumn({
                        name: 'internalid',
                        label: 'Internal ID'
                    })
                ]
            });
            log.debug('getInputData', 'Created search for cases with empty custevent_hul_custom_form_id (ID range: 800000-1200000)');
            return caseSearch;
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
            var caseId = searchResult.id;
            log.debug('Processing Case', "Case ID: ".concat(caseId));
            // Simply pass the case ID to reduce for processing
            context.write({
                key: caseId,
                value: caseId
            });
        }
        catch (error) {
            log.error('Error in map', "Case processing failed: ".concat(error.message));
        }
    }
    /**
     * Defines the function definition that is executed when the reduce entry point is triggered.
     */
    function reduce(context) {
        try {
            var caseId = context.key;
            log.debug('Loading and Saving Case', "Case ID: ".concat(caseId));
            // Load the case record
            var caseRecord = record.load({
                type: record.Type.SUPPORT_CASE,
                id: caseId
            });
            // Save the record (this will trigger the User Event Script)
            caseRecord.save();
            log.debug('Case Saved', "Successfully triggered User Event for case ".concat(caseId));
        }
        catch (error) {
            log.error('Error in reduce', "Failed to process case ".concat(context.key, ": ").concat(error.message));
        }
    }
    /**
     * Defines the function definition that is executed when the summarize entry point is triggered.
     */
    function summarize(summary) {
        try {
            log.debug('Summary', 'Script completed processing');
            // Log any errors
            summary.mapSummary.errors.iterator().each(function (key, error) {
                log.error('Map Error', "Key: ".concat(key, ", Error: ").concat(error));
                return true;
            });
            summary.reduceSummary.errors.iterator().each(function (key, error) {
                log.error('Reduce Error', "Key: ".concat(key, ", Error: ").concat(error));
                return true;
            });
            var processedCount_1 = 0;
            summary.reduceSummary.keys.iterator().each(function () {
                processedCount_1++;
                return true;
            });
            log.debug('Processing Complete', "Processed ".concat(processedCount_1, " case records"));
        }
        catch (error) {
            log.error('Error in summarize', error.message);
        }
    }
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
