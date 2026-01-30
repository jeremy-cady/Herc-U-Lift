/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Date: 01/27/2026
 * Version: 1.0
 */

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as log from 'N/log';

const ROLLUP_REVENUE_STREAM_IDS: number[] = [
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
function map(ctx: EntryPoints.MapReduce.mapContext) {
    const revenueStreamId = Number(ctx.value);

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
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
    // intentionally empty
}

/**
 * Executes when the summarize entry point is triggered.
 */
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
    if (summary.inputSummary.error) {
        log.error('Input Error', summary.inputSummary.error);
    }
}

export = { getInputData, map, reduce, summarize };