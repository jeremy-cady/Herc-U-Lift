/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/02/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';

/**
* Marks the beginning of the Map/Reduce process and generates input data.
* @typedef {Object} ObjectRef
* @property {number} id - Internal ID of the record instance
* @property {string} type - Record type id
* @return {Array|Object|Search|RecordRef} inputSummary
* @Since 2015.2
*/
function getInputData() {
    const objIDArray: any[] = [];
    const objectZeroMeterQuery = `
        SELECT customrecord_sna_objects.id
        FROM customrecord_sna_objects
        WHERE customrecord_sna_objects.custrecord_hul_meter_key_static = '0'
    `;
    const objectZeroMeterQueryResults = query.runSuiteQL({
        query: objectZeroMeterQuery
    });
    log.debug('objectZeroMeterQueryResults', objectZeroMeterQueryResults);
    objectZeroMeterQueryResults.results?.forEach((result) => {
        const objID = result.values[0];
        objIDArray.push(objID);
    });
    return objIDArray;
}

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    try {
        const searchResult = JSON.parse(ctx.value) as { id: string };
        const objID = Number(searchResult);
        log.debug('objID in MAP', objID);
        const recordType = 'customrecord_sna_objects';
        record.submitFields({
            type: recordType,
            id: objID,
            values: {
                custrecord_hul_meter_key_static: null
            }
        });
    } catch (error) {
        log.debug('ERROR in map', error);
    }
}

/**
* Executes when the reduce entry point is triggered and applies to each group.
* @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
* @Since 2015.2
*/
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
}

export = { getInputData, map, reduce, summarize };