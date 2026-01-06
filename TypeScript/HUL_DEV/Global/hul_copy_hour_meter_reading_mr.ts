/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/06/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';

interface EquipmentObject {
    id: string;
    hours: string;
};

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
        const objectQuery = `
        SELECT customrecord_sna_objects.id
        FROM customrecord_sna_objects
        `;
        const pagedData = query.runSuiteQLPaged({
            query: objectQuery,
            pageSize: 1000
        });
        const pagedDataArray = pagedData.pageRanges;
        const resultsArray: { objectID: number } [] = [];

        pagedDataArray.forEach((pageOfData) => {
            const page: any = pagedData.fetch({
                index: pageOfData.index
            });
            page.data?.results?.forEach((row: any) => {
                const value = row.values[0];
                resultsArray.push({ objectID: value as number });
            });
        });

        return resultsArray;
    } catch (error) {
        log.error('ERROR in getInputData', error);
    }

}

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    try {
        // parse incoming JSON object
        const searchResult = JSON.parse(ctx.value) as { objectID: string };
        // declare variable to hold each object ID
        const equipmentObjID = String(searchResult.objectID);
        if (equipmentObjID === '3274') {
            const meterHours = String(getMeterHours(ctx, equipmentObjID));
            const returnObj: EquipmentObject = {
                id: equipmentObjID,
                hours: meterHours
            };
            ctx.write({
                key: returnObj.id,
                value: returnObj.hours
            });
        }
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

const getMeterHours = (ctx, equipmentObjID) => {
    const thisRecord = ctx.currentRecord;
    const hourReading = thisRecord.getValue({
        fieldId: 'custrecord_sna_meter_key_on_m1'
    });
    log.debug('hourReading', hourReading);
};

export = { getInputData, map, reduce, summarize };