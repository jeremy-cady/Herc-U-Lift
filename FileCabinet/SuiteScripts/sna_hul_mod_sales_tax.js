/*
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * When revenue stream is any of Internal, set Tax Code to -Not Taxable- on all line items, then mark the Disable Avalara Tax Calculation checkbox
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/8/20       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
 * @param{record} record
 * @param{search} search
 */
    function (record, search, runtime) {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function updateLines(rec, returnInternal) {
            var stLoggerTitle = 'updateLines';

            log.debug({title: stLoggerTitle, details: 'returnInternal: ' + returnInternal});

            var currentScript = runtime.getCurrentScript();
            var NONTAXABLE = currentScript.getParameter({name: 'custscript_sna_tax_nontaxable'});

            var revstream = rec.getValue({fieldId: 'cseg_sna_revenue_st'});

            var internal = false;
            if (!isEmpty(revstream)) {
                var revstreamrec = search.lookupFields({type: 'customrecord_cseg_sna_revenue_st', id: revstream, columns: ['custrecord_sna_hul_revstreaminternal']});
                if (!isEmpty(revstreamrec.custrecord_sna_hul_revstreaminternal)) {
                    internal = revstreamrec.custrecord_sna_hul_revstreaminternal;
                }
            }

            log.debug({title: stLoggerTitle, details: 'internal: ' + internal});

            if (!returnInternal) {
                log.debug({title: stLoggerTitle, details: 'setting lines'});
            }

            return internal;
        }

        return {updateLines: updateLines}

    });
