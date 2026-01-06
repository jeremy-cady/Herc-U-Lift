/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script that checks if the name is unique for the Item Category,
 * Customer Pricing Group and Item Discount Group custom records upon creation.
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/5       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param{search} search
 */
function(search) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for ( var k in v)
                return false;
            return true;
        })(stValue)));
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var currrec = scriptContext.currentRecord;
        var rectype = currrec.type;
        var recid = currrec.id;

        var name_ = currrec.getValue({fieldId: 'name'});
        name_ = name_.toLowerCase().replace(/\s+/g, '').replace(/[^a-z\d\s]+/gi, '');
        log.debug({title: 'saveRecord', details: recid + ' | ' + rectype + ' | ' + name_});

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
                alert('This is a duplicate record.');
                return false;
            }
        }

        return true;
    }

    return {
        saveRecord: saveRecord
    };
    
});
