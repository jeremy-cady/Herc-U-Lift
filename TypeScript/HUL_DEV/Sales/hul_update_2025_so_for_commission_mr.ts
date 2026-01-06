/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * Title: HUL Commission Backfill MR
 * Description:
 *   Map/Reduce that iterates over a saved search of Sales Orders
 *   and, for each one, checks custbody_hul_processed_for_commission
 *   and saves the record. This fires the commission UE in EDIT context.
 */

import * as record from 'N/record';
import * as search from 'N/search';
import * as log from 'N/log';

const SAVED_SEARCH_ID = 'customsearch_hul_commission_backfill'; // TODO: replace with your saved search id
const COMM_PROCESSED_FIELD_ID = 'custbody_hul_processed_for_commission';

const getInputData = (): search.Search => {
    log.audit({
        title: 'getInputData',
        details: `Loading Sales Order search: ${SAVED_SEARCH_ID}`
    });

    return search.load({
        id: SAVED_SEARCH_ID
    });
};

const map = (context: any): void => {
    const result = JSON.parse(context.value) as { id: string };
    const soId = result.id;

    try {
        const so = record.load({
            type: record.Type.SALES_ORDER,
            id: soId,
            isDynamic: false
        });

        const alreadyProcessed = so.getValue({
            fieldId: COMM_PROCESSED_FIELD_ID
        });

        if (alreadyProcessed === true || alreadyProcessed === 'T') {
            log.debug({
                title: 'Skipping already processed SO',
                details: `Sales Order ID ${soId} already has ${COMM_PROCESSED_FIELD_ID} = true`
            });
            return;
        }

        so.setValue({
            fieldId: COMM_PROCESSED_FIELD_ID,
            value: true
        });

        const savedId = so.save({
            enableSourcing: false,
            ignoreMandatoryFields: true
        });

        log.audit({
            title: 'Processed Sales Order',
            details: `Sales Order ID ${savedId} marked as processed for commission.`
        });
    } catch (e: any) {
        log.error({
            title: `Error processing Sales Order ${soId}`,
            details: e
        });
    }
};

const summarize = (summary: any): void => {
    try {
        log.audit({
            title: 'Summary',
            details: `Usage: ${summary.usage}, Concurrency: ${summary.concurrency}, Yields: ${summary.yields}`
        });

        summary.mapSummary.errors.iterator().each((key: string, error: string) => {
            log.error({
                title: `Map Error for key ${key}`,
                details: error
            });
            return true;
        });
    } catch (e: any) {
        log.error({
            title: 'Error in summarize',
            details: e
        });
    }
};

export = {
    getInputData,
    map,
    summarize
};