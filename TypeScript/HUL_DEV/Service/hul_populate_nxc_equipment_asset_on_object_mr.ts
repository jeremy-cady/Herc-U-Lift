/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 11/08/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';

interface AssetObject {
    assetID: number;
    objectID: number;
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
        const equipmentAssetQuery = `
            SELECT customrecord_nx_asset.id AS assetid, customrecord_sna_objects.id AS objectid
            FROM customrecord_nx_asset
            JOIN customrecord_sna_objects
            ON customrecord_nx_asset.custrecord_sna_hul_nxcassetobject = customrecord_sna_objects.id
            WHERE customrecord_nx_asset.custrecord_nxc_na_asset_type = '2'
            AND customrecord_sna_objects.id > 1253190000
            AND customrecord_sna_objects.id <= 1253192000
            ORDER BY customrecord_sna_objects.id ASC
        `;
        const equipmentAssetQueryResults = query.runSuiteQLPaged({
            query: equipmentAssetQuery,
            pageSize: 1000
        });
        const pagedDataArray = equipmentAssetQueryResults.pageRanges;
        const resultsArray: AssetObject [] = [];

        pagedDataArray.forEach((pageOfData) => {
            const page: any = equipmentAssetQueryResults.fetch({
                index: pageOfData.index
            });
            page.data?.results?.forEach((row: any) => {
                const value = row.values;
                const assetObject: AssetObject = {
                    assetID: Number(value[0]),
                    objectID: Number(value[1])
                };
                resultsArray.push(assetObject);
            });
        });
        // log.debug('resultsArray', resultsArray);
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
        const searchResult = JSON.parse(ctx.value);
        // log.debug('searchResult', searchResult);
        const thisAssetID = searchResult.assetID;
        const thisObjectID = searchResult.objectID;

        ctx.write({
            key: thisAssetID,
            value: thisObjectID
        });
    } catch (error) {
        log.error('ERROR in map', error);
    }
}

/**
* Executes when the reduce entry point is triggered and applies to each group.
* @param {ReduceContext} context - Data collection containing the groups to process through the reduce stage
* @Since 2015.2
*/
function reduce(ctx: EntryPoints.MapReduce.reduceContext) {
    try {
        ctx.values.forEach((value) => {
            const assetID = ctx.key;
            const objectID = value;
            // log.debug({
            //     title: 'assetID',
            //     details: {
            //         assetID,
            //         objectID,
            //     }
            // });
            // log.debug('objectID', objectID);
            const customRecordType = 'customrecord_sna_objects';
            const submit = record.submitFields({
                type: customRecordType,
                id: objectID,
                values: {
                    custrecord_hul_nxcequipasset: assetID
                }
            });
            log.debug('submit', submit);
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