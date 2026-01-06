/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to check Item-Vendor combination
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

            var itm = currrec.getValue({fieldId: 'custrecord_sna_hul_item'});
            var vendor = currrec.getValue({fieldId: 'custrecord_sna_hul_vendor'});
            var primaryvendor = currrec.getValue({fieldId: 'custrecord_sna_hul_primaryvendor'});
            log.debug({title: 'beforeSubmit', details: 'primaryvendor: ' + primaryvendor + ' | itm: ' + itm + ' | vendor: ' + vendor + ' | recid: ' + recid});

            var filters_ = [];
            if (!isEmpty(itm)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: '@NONE@'}));
            }
            if (!isEmpty(recid)) {
                filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.NONEOF, values: recid}));
            }
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first combination
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_primaryvendor'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_vendor'}));

            var cusrecsearch = search.create({type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_});
            cusrecsearch.run().each(function(result) {
                var currvendor = result.getValue({name: 'custrecord_sna_hul_vendor'});
                var currisprimary = result.getValue({name: 'custrecord_sna_hul_primaryvendor'});
                var currid = result.getValue({name: 'internalid'});

                // Item-Vendor combination must be unique
                if (currvendor == vendor) {
                    throw 'This is a duplicate record.';
                    return false;
                }

                // For every item, only one Vendor Price record can have Primary Vendor? checkbox marked
                if (currisprimary && primaryvendor) {
                    throw 'Only one Vendor Price record can have Primary Vendor? checkbox marked for this item.'
                    return false;
                }

                return true;
            });
        }

        return {beforeSubmit}

    });
