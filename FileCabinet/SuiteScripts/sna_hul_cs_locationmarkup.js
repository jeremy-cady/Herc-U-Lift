/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to check if Item Category-Location combination is unique
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/24       		                 aduldulao       Initial version.
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
        var recid = currrec.id;

        var itmcat = currrec.getValue({fieldId: 'custrecord_sna_hul_itemcat'});
        var loca =  currrec.getValue({fieldId: 'custrecord_sna_hul_loc'});
        log.debug({title: 'saveRecord', details: itmcat + ' | ' + loca + ' | ' + recid});

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
            alert('This is a duplicate record.');
            return false;
        }

        return true;
    }

    return {
        saveRecord: saveRecord
    };
    
});
