/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 10/10/2024
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as query from 'N/query';
import * as record from 'N/record';

interface URLObject {
    id: number;
    url: string;
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
        const urlObjectArray: URLObject [] = [];
        const vendorBillQuery = `
            SELECT transaction.id, transaction.custbody_sna_hul_trindocs_url
            FROM transaction
            WHERE transaction.recordType = 'vendorbill'
            AND transaction.custbody_sna_hul_trindocs_url != 'null'   
        `;
        const pagedData = query.runSuiteQLPaged({
            query: vendorBillQuery,
            pageSize: 1000
        });
        const pagedDataArray = pagedData.pageRanges;

        pagedDataArray.forEach((pageOfData) => {
            const page: any = pagedData.fetch({
                index: pageOfData.index
            });
            page.data?.results?.forEach((result: any) => {
                const vendBillID = result?.values[0];
                const trinDocsURL = result?.values[1];
                const urlObj: URLObject = {
                    id: vendBillID,
                    url: trinDocsURL,
                };
                urlObjectArray.push(urlObj);
            });
        });
        return urlObjectArray;
    } catch (error) {
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
        const searchResult = JSON.parse(ctx.value);
        const vendorBillID = searchResult.id;
        const vendorTrinDocsURL = searchResult.url;

        ctx.write({
            key: vendorBillID,
            value: vendorTrinDocsURL
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
    try {
        ctx.values.forEach((value) => {
            const vendorBillID = ctx.key;
            const vendorTrinDocsURL = value;
            log.debug('vendorBillID in reduce', vendorBillID);
            log.debug('vendorTrinDocsURL in reduce', vendorTrinDocsURL);

            const newURL = vendorTrinDocsURL.replace(/http(?=:)/, 'https');
            log.debug('newURL', newURL);

            const submit = record.submitFields({
                type: record.Type.VENDOR_BILL,
                id: vendorBillID,
                values: {
                    custbody_sna_hul_trindocs_url: `${newURL}`
                }
            });
            log.debug('submit', submit);
        });
    } catch (error) {
        log.debug('ERROR in reduce', error);
    }
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @Since 2015.2
*/
function summarize(summary: EntryPoints.MapReduce.summarizeContext) {
    // const values: any [] = [];
    // summary.output.iterator().each((key, value) => {
    //     log.debug({
    //         title: `Output for key${  key }`,
    //         details: value
    //     });
    // });
}

export = { getInputData, map, reduce, summarize };