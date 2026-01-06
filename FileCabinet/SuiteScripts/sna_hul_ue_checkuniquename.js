/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script that checks if the name is unique for the Item Category,
 * Customer Pricing Group and Item Discount Group custom records upon creation.
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/20       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/search'],
    /**
 * @param{runtime} runtime
 * @param{search} search
 */
    (runtime, search) => {

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
            var rectype = currrec.type;
            var recid = currrec.id;

            var name_ = currrec.getValue({fieldId: 'name'});
            name_ = name_.toLowerCase().replace(/\s+/g, '').replace(/[^a-z\d\s]+/gi, '');
            log.debug({title: 'beforeSubmit', details: rectype + ' | ' + name_});

            if (!isEmpty(name_)) {
                var filters_ = [];
                //filters_.push(search.createFilter({name: 'name', operator: search.Operator.IS, values: name_}));
                filters_.push(search.createFilter({ name: 'formulatext', formula: 'LOWER(REPLACE(REGEXP_REPLACE({name}, \'[^0-9A-Za-z]\', \'\'), \'ltgt\', \'\'))',  operator: search.Operator.IS, values: name_}));
                if (!isEmpty(recid)) {
                    filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.NONEOF, values: recid}));
                }

                var cusrecsearch = search.create({type: rectype, filters: filters_});
                var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});
                if (!isEmpty(cusrecser)) {
                    throw 'This is a duplicate record.';
                }
            }
        }

        return {beforeSubmit}

    });
