/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to check if Item Category-Location combination is unique
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/24       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search'],
    /**
 * @param{search} search
 */
    (search) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            var currrec = scriptContext.newRecord;
            var recid = currrec.id;

            var itmcat = currrec.getValue({fieldId: 'custrecord_sna_hul_itemcat'});
            var loca =  currrec.getValue({fieldId: 'custrecord_sna_hul_loc'});
            log.debug({title: 'beforeSubmit', details: itmcat + ' | ' + loca + ' | ' + recid});

            // Item Category-Location combination must be unique
            var filters_ = [];
            if (!isEmpty(itmcat)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcat', operator: search.Operator.IS, values: itmcat}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcat', operator: search.Operator.IS, values: '@NONE@'}));
            }
            if (!isEmpty(loca)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.IS, values: loca}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_loc', operator: search.Operator.IS, values: '@NONE@'}));
            }
            if (!isEmpty(recid)) {
                filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.NONEOF, values: recid}));
            }
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Location combination

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_locationmarkup', filters: filters_, columns: columns_});
            var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});
            if (!isEmpty(cusrecser)) {
                throw 'This is a duplicate record.';
            }
        }

        return {beforeSubmit}

    });
