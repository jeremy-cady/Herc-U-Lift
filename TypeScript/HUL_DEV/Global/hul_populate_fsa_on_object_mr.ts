/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/26/2024
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
    try {
        const fsaQuery = `
        SELECT customrecord_nx_asset.id
        FROM customrecord_nx_asset
        WHERE customrecord_nx_asset.custrecord_nxc_na_asset_type = '2'
        ORDER BY customrecord_nx_asset.id ASC     
        `;
        const pagedData = query.runSuiteQLPaged({
            query: fsaQuery,
            pageSize: 1000
        });
        const pagedDataArray = pagedData.pageRanges;
        const resultsArray: { fsaID: number } [] = [];

        pagedDataArray.forEach((pageOfData) => {
            const page: any = pagedData.fetch({
                index: pageOfData.index
            });
            page.data?.results?.forEach((row: any) => {
                const value = row.values[0];
                resultsArray.push({ fsaID: value as number });
            });
        });
        return resultsArray;
    } catch(error){
        log.debug('ERROR in getInputData', error);
    }
}

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
* @param {MapContext} context - Data collection containing the key/value pairs to process through the map stage
* @Since 2015.2
*/
function map(ctx: EntryPoints.MapReduce.mapContext) {
    try {
        const searchResult = JSON.parse(ctx.value) as { fsaID: string };
        const fsaID: string = searchResult.fsaID;
        const objectID: string = getObjectID(fsaID);
        ctx.write(fsaID, objectID);
    } catch(error) {
        log.debug('ERROR in map', error);
    }
}

/**
* Executes when the reduce entry point is triggered and applies to each group.
* @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
* @Since 2015.2
*/
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
    try {
        const fsaID = ctx.key;
        ctx.values.forEach((value) => {
            try{
                const objectID = JSON.parse(value);
                setFSAOnObjectRecord(fsaID, objectID);
            } catch(error) {
                log.debug('ERROR', error);
            }

        });
    } catch(error) {
        log.debug('ERROR in reduce', error);
    }
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
}

const getObjectID = (fsaID) => {
    try {
        const objectQuery = `
        SELECT customrecord_sna_objects.id
        FROM customrecord_sna_objects
        JOIN customrecord_nx_asset
        ON customrecord_sna_objects.id = customrecord_nx_asset. custrecord_sna_hul_nxcassetobject
        WHERE customrecord_nx_asset.id = '${fsaID}'
        ORDER BY customrecord_nx_asset.id ASC
    `;
        const objectQueryResult = query.runSuiteQL({ query: objectQuery });
        const objectID: any = objectQueryResult?.results[0]?.values[0];

        return objectID;
    } catch(error) {
        log.debug('ERROR in getObjectID', error);
    }

};

const setFSAOnObjectRecord = (fsaID, objectID) => {
    try {
        record.submitFields({
            type: 'customrecord_sna_objects',
            id: objectID,
            values: {
                custrecord_hul_field_service_asset: fsaID
            },
            options: {
                enableSourcing: false,
                ignoreMandatoryFields: true
            }
        });
        return true;
    } catch(error) {
        log.error('ERROR in setFSAOnObjectRecord', error);
    }
};

export = { getInputData, map, reduce, summarize };