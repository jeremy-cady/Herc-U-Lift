/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 01/27/2026
 * Version: 1.0
 */
define(["require", "exports", "N/record", "N/log"], function (require, exports, record, log) {
    "use strict";
    var ROLLUP_REVENUE_STREAM_IDS = [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        21,
        33,
        108,
        117,
        120,
        137,
        138,
        139,
        140,
        141,
        143,
        203,
        210,
        211,
        230,
        231,
        235,
        236,
        420,
        443
    ];
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     */
    function getInputData() {
        return ROLLUP_REVENUE_STREAM_IDS;
    }
    /**
     * Executes when the map entry point is triggered.
     */
    function map(ctx) {
        var revenueStreamId = Number(ctx.value);
        record.submitFields({
            type: 'customrecord_cseg_sna_revenue_st',
            id: revenueStreamId,
            values: {
                custrecord_hul_rollup_rev_stream: true
            },
            options: {
                enableSourcing: false,
                ignoreMandatoryFields: true
            }
        });
    }
    /**
     * Executes when the reduce entry point is triggered.
     * Not used.
     */
    function reduce(ctx) {
        // intentionally empty
    }
    /**
     * Executes when the summarize entry point is triggered.
     */
    function summarize(summary) {
        if (summary.inputSummary.error) {
            log.error('Input Error', summary.inputSummary.error);
        }
    }
    return { getInputData: getInputData, map: map, reduce: reduce, summarize: summarize };
});
