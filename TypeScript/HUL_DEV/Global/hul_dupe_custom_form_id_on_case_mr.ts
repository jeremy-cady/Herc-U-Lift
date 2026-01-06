/* eslint-disable max-len */
/**
* @NApiVersion 2.x
* @NScriptType MapReduceScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/04/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as log from 'N/log';
import * as search from 'N/search';

/**
 * Defines the function definition that is executed at the beginning of the map/reduce process and generates input data.
 */
function getInputData(): search.Search {
    try {
        // Search for cases where custevent_hul_custom_form_id is empty within ID range
        const caseSearch = search.create({
            type: search.Type.SUPPORT_CASE,
            filters: [
                ['isinactive', 'is', 'F'], // Only active cases
                'AND',
                ['custevent_hul_custom_form_id', 'isempty', ''], // Field is empty
                'AND',
                ['type','anyof','7','4','6','3','12','9','8','5','1','11','10','2','13','15','14'],
                'AND',
                ['custevent_sna_hul_casedept','anyof','34','28','18','23','4','37','36','35','3']
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
        const caseId = searchResult.id;

        log.debug('Processing Case', `Case ID: ${caseId}`);

        // Simply pass the case ID to reduce for processing
        context.write({
            key: caseId,
            value: caseId
        });

    } catch (error) {
        log.error('Error in map', `Case processing failed: ${error.message}`);
    }
}

/**
 * Defines the function definition that is executed when the reduce entry point is triggered.
 */
function reduce(context: EntryPoints.MapReduce.reduceContext): void {
    try {
        const caseId = context.key;

        log.debug('Loading and Saving Case', `Case ID: ${caseId}`);

        // Load the case record
        const caseRecord = record.load({
            type: record.Type.SUPPORT_CASE,
            id: caseId
        });

        // Save the record (this will trigger the User Event Script)
        caseRecord.save();

        log.debug('Case Saved', `Successfully triggered User Event for case ${caseId}`);

    } catch (error) {
        log.error('Error in reduce', `Failed to process case ${context.key}: ${error.message}`);
    }
}

/**
 * Defines the function definition that is executed when the summarize entry point is triggered.
 */
function summarize(summary: EntryPoints.MapReduce.summarizeContext): void {
    try {
        log.debug('Summary', 'Script completed processing');

        // Log any errors
        summary.mapSummary.errors.iterator().each((key, error) => {
            log.error('Map Error', `Key: ${key}, Error: ${error}`);
            return true;
        });

        summary.reduceSummary.errors.iterator().each((key, error) => {
            log.error('Reduce Error', `Key: ${key}, Error: ${error}`);
            return true;
        });

        let processedCount = 0;
        summary.reduceSummary.keys.iterator().each(() => {
            processedCount++;
            return true;
        });

        log.debug('Processing Complete', `Processed ${processedCount} case records`);

    } catch (error) {
        log.error('Error in summarize', error.message);
    }
}

export = {
    getInputData,
    map,
    reduce,
    summarize
};