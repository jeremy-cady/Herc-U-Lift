/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 09/27/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as search from 'N/search';
import * as record from 'N/record';

interface EquipmentObject {
    name: string;
    id: string;
}

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
        const eqipObjectIDArray: any[] = [];
        const customrecordSnaObjectsSearchFilters: SavedSearchFilters = [
            ['custrecord_sna_equipment_model', 'noneof', '@NONE@'],
            'AND',
            ['internalidnumber', 'between', '1253220000', '10000000000'],
        ];
        const customrecordSnaObjectsSearchColInternalId = search.createColumn({ name: 'internalid' });
        const customrecordSnaObjectsSearchColExternalId = search.createColumn({ name: 'externalid' });
        const customrecordSnaObjectsSearchColMeterKeyOnM1 =
            search.createColumn({ name: 'custrecord_hul_meter_key_static' });
        const customrecordSnaObjectsSearch = search.create({
            type: 'customrecord_sna_objects',
            filters: customrecordSnaObjectsSearchFilters,
            columns: [
                customrecordSnaObjectsSearchColInternalId,
                customrecordSnaObjectsSearchColExternalId,
                customrecordSnaObjectsSearchColMeterKeyOnM1,
            ],
        });
        // // NOTE: Search.run() is limited to 4,000 results
        // customrecordSnaObjectsSearch.run().each((result: search.Result): boolean => {
        //     // ...
        //
        //     return true;
        // });
        const customrecordSnaObjectsSearchPagedData = customrecordSnaObjectsSearch.runPaged({ pageSize: 1000 });
        for (let i = 0; i < customrecordSnaObjectsSearchPagedData.pageRanges.length; i++) {
            const customrecordSnaObjectsSearchPage = customrecordSnaObjectsSearchPagedData.fetch({ index: i });
            customrecordSnaObjectsSearchPage.data.forEach((result: search.Result): void => {
                const internalId = <string>result.getValue(customrecordSnaObjectsSearchColInternalId);
                const externalId = <string>result.getValue(customrecordSnaObjectsSearchColExternalId);
                const equipObj: EquipmentObject = {
                    name: externalId,
                    id: internalId
                };

                eqipObjectIDArray.push(equipObj);
            });
        }
        interface NestedArray<T> extends Array<T | NestedArray<T>> { }
        type SavedSearchFilters = string | NestedArray<string | search.Operator>;
        return eqipObjectIDArray;
    } catch (error) {
        log.debug('ERROR getting input data', error);
    };
};

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    // parse incoming JSON object
    const searchResult = JSON.parse(ctx.value) as { id: string; name: string };
    const equipObjInternalID = searchResult.id;
    const equipObjName = searchResult.name;

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
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
    try {
        ctx.values.forEach((value) => {
            const equipmentObjID = Number(ctx.key);
            const recordType = 'customrecord_sna_objects';
            // declare the SQL query that will give us the maximum meter reading from a given object.
            const meterReadingQuery = `
            SELECT MAX(customrecord_sna_hul_hour_meter.custrecord_sna_hul_hour_meter_reading)
            FROM customrecord_sna_hul_hour_meter
            WHERE custrecord_sna_hul_object_ref = '${equipmentObjID}'
        `;
            const meterReadingResult = query.runSuiteQL({
                query: meterReadingQuery
            });
            log.debug('meterReadingResult', meterReadingResult);
            let currentMeterReading = meterReadingResult.results[0]?.values[0];
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
    } catch (error) {
        log.debug('ERROR in reduce', error);
    };
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
}

export = { getInputData, map, reduce, summarize };