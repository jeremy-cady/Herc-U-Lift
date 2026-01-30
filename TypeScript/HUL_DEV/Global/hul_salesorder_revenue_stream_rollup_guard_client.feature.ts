/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 01/28/2026
* Version: 1.2
*/

import { EntryPoints } from 'N/types';
import * as query from 'N/query';
import * as sweetAlert from 'SuiteScripts/HUL_DEV/Global/hul_swal';

/**
* Validation function executed when a body field is changed.
*
* @param {Object} ctx
* @param {Record} ctx.currentRecord - Current form record
* @param {string} ctx.fieldId - Field name
*
* @returns {boolean} Return true to allow change
*
* @since 2015.2
*/
const validateField = (ctx: EntryPoints.Client.validateFieldContext): boolean => {
    try {
        if (ctx.fieldId !== 'cseg_sna_revenue_st') {
            return true;
        }

        const currentRecord = ctx.currentRecord;

        const revenueStreamId = currentRecord.getValue({
            fieldId: 'cseg_sna_revenue_st'
        });

        if (!revenueStreamId) {
            return true;
        }

        const rollupQuery = `
            SELECT rs.custrecord_hul_rollup_rev_stream
            FROM customrecord_cseg_sna_revenue_st rs
            WHERE rs.id = ${revenueStreamId}
        `;

        const result = query.runSuiteQL({
            query: rollupQuery
        });

        const rawValue = result.results[0]?.values[0];

        if (rawValue === 'T') {
            sweetAlert.rollupRevenueStreamSelectedMessage();
        }

    } catch (error) {
        console.log('ERROR in validateField (Revenue Stream Rollup)', error);
    }

    return true;
};

export = {
    validateField,
};