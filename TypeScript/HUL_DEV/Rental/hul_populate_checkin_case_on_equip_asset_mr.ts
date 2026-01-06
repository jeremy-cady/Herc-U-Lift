/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/01/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as log from 'N/log';
import * as search from 'N/search';
import * as query from 'N/query';

/**
 * Defines the function definition that is executed at the beginning of the map/reduce process and generates input data.
 */
function getInputData(): search.Search {
    try {
        // Search for equipment assets for testing (limited range)
        const assetSearch = search.create({
            type: 'customrecord_nx_asset',
            filters: [
                ['custrecord_nxc_na_asset_type', 'is', '2'], // Equipment
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

    } catch (error) {
        log.error('getInputData failed', error.message);
        throw error;
    }
}

/**
 * Defines the function definition that is executed when the map entry point is triggered.
 */
function map(context: EntryPoints.MapReduce.mapContext): void {
    try {
        const searchResult = JSON.parse(context.value);
        const thisAssetId = searchResult.id;

        log.debug('map', `Processing asset ${thisAssetId}`);

        // Find cases for this specific asset - ordered by highest internal ID (most recent)
        const caseQuery = `
            SELECT 
                sc.id as case_id
            FROM 
                supportcase sc
            WHERE 
                sc.custevent_nx_case_type = '104'
                AND sc.status IN ('2', '3', '4', '6')
                AND (
                    sc.custevent_nxc_case_assets = '${thisAssetId}'
                    OR sc.custevent_nxc_case_assets LIKE '%,${thisAssetId},%'
                    OR sc.custevent_nxc_case_assets LIKE '${thisAssetId},%'
                    OR sc.custevent_nxc_case_assets LIKE '%,${thisAssetId}'
                )
            ORDER BY sc.id DESC
        `;

        const caseResults = query.runSuiteQL({
            query: caseQuery
        });

        if (caseResults.results && caseResults.results.length > 0) {
            // Get the first result (highest internal ID = most recent)
            const mostRecentCase = caseResults.results[0];
            const thisCaseId = mostRecentCase.values[0];

            log.debug('map', `‼️Found most recent case ${thisCaseId} for asset ${thisAssetId}‼️`);

            context.write({
                key: thisAssetId,
                value: {
                    caseId: thisCaseId,
                    assetId: thisAssetId
                }
            });
        } else {
            log.debug('map', `No qualifying cases found for asset ${thisAssetId}`);
        }

    } catch (error) {
        log.error('ERROR IN MAP', error);
    }
}

/**
 * Defines the function definition that is executed when the reduce entry point is triggered.
 */
function reduce(context: EntryPoints.MapReduce.reduceContext): void {
    try {
        const assetId = context.key;
        const values = context.values;

        if (values.length === 0) {
            log.debug('reduce', `No case data for asset ${assetId}`);
            return;
        }

        const value = JSON.parse(values[0]); // Should only be one value per asset
        const caseId = value.caseId;

        log.debug('reduce', `Updating asset ${assetId} with most recent case ${caseId}`);

        // Update the equipment asset record
        record.submitFields({
            type: 'customrecord_nx_asset',
            id: assetId,
            values: {
                custrecord_most_recent_checkin_case: caseId
            }
        });

        log.debug('reduce', `Successfully updated asset ${assetId} with case ${caseId}`);

    } catch (error) {
        log.error('reduce failed', `Error updating asset ${context.key}: ${error.message}`);
    }
}

/**
 * Defines the function definition that is executed when the summarize entry point is triggered.
 */
function summarize(summary: EntryPoints.MapReduce.summarizeContext): void {
}

export = {
    getInputData,
    map,
    reduce,
    summarize
};