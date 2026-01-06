/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to check Item-Vendor combination
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

        var ret = true;
        var itm = currrec.getValue({fieldId: 'custrecord_sna_hul_item'});
        var vendor = currrec.getValue({fieldId: 'custrecord_sna_hul_vendor'});
        var primaryvendor = currrec.getValue({fieldId: 'custrecord_sna_hul_primaryvendor'});
        log.debug({title: 'saveRecord',  details: 'primaryvendor: ' + primaryvendor + ' | itm: ' + itm + ' | vendor: ' + vendor + ' | recid: ' + recid});

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
                alert('This is a duplicate record.');
                ret = false;
                return false;
            }

            // For every item, only one Vendor Price record can have Primary Vendor? checkbox marked
            if (currisprimary && primaryvendor) {
                alert('Only one Vendor Price record can have Primary Vendor? checkbox marked for this item.');
                ret = false;
                return false;
            }

            return true;
        });

        return ret;
    }

    return {
        saveRecord: saveRecord
    };
    
});
