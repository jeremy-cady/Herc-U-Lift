/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Initial Date: 01/28/2026
* Version: 1.2
*/
define(["require", "exports", "N/query", "SuiteScripts/HUL_DEV/Global/hul_swal"], function (require, exports, query, sweetAlert) {
    "use strict";
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
    var validateField = function (ctx) {
        var _a;
        try {
            if (ctx.fieldId !== 'cseg_sna_revenue_st') {
                return true;
            }
            var currentRecord = ctx.currentRecord;
            var revenueStreamId = currentRecord.getValue({
                fieldId: 'cseg_sna_revenue_st'
            });
            if (!revenueStreamId) {
                return true;
            }
            var rollupQuery = "\n            SELECT rs.custrecord_hul_rollup_rev_stream\n            FROM customrecord_cseg_sna_revenue_st rs\n            WHERE rs.id = ".concat(revenueStreamId, "\n        ");
            var result = query.runSuiteQL({
                query: rollupQuery
            });
            var rawValue = (_a = result.results[0]) === null || _a === void 0 ? void 0 : _a.values[0];
            if (rawValue === 'T') {
                sweetAlert.rollupRevenueStreamSelectedMessage();
            }
        }
        catch (error) {
            console.log('ERROR in validateField (Revenue Stream Rollup)', error);
        }
        return true;
    };
    return {
        validateField: validateField,
    };
});
