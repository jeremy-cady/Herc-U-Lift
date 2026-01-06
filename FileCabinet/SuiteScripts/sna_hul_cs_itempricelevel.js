/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script for Item Price Level validations
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/20       		                 aduldulao       Initial version.
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

    var CURR_PRICINNGGRP = '';
    var CURR_ITEMCAT = '';
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var rec = scriptContext.currentRecord;
        CURR_PRICINNGGRP = rec.getValue({fieldId: 'custrecord_sna_hul_customerpricinggroup'});
        CURR_ITEMCAT = rec.getValue({fieldId: 'custrecord_sna_hul_itemcategory'});
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var field = scriptContext.fieldId;
        var rec = scriptContext.currentRecord;
        var recid = rec.id;
        var rectype = rec.type;

        if (field == 'custrecord_sna_hul_itemcategory' || field == 'custrecord_sna_hul_customerpricinggroup') {
            var itmcat = rec.getValue({fieldId: 'custrecord_sna_hul_itemcategory'});
            var prcinggrpid = rec.getValue({fieldId: 'custrecord_sna_hul_customerpricinggroup'});

            var hasmin = false;
            var mincostfld = rec.getField({fieldId: 'custrecord_sna_hul_mincost'});
            !isEmpty(mincostfld) ? hasmin = true : hasmin = false;
            hasmin ? mincostfld.isDisabled = false : '';

            var hasmax = false;
            var maxcostfld = rec.getField({fieldId: 'custrecord_sna_hul_maxcost'});
            !isEmpty(maxcostfld) ? hasmax = true : hasmax = false;
            hasmax ? maxcostfld.isDisabled = false : '';

            // Customer Pricing Group = List
            if (prcinggrpid == 155) {
                var filters_ = [];
                if (!isEmpty(itmcat)) {
                    filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: itmcat}));
                } else {
                    filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: '@NONE@'}));
                }
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: prcinggrpid}));
                var columns_ = [];
                columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Customer Pricing combination

                var cusrecsearch = search.create({type: rectype, filters: filters_, columns: columns_});
                var cusrecser = cusrecsearch.run().getRange({start: 0, end: 2});

                if (isEmpty(cusrecser) || cusrecser[0].id == recid) {
                    // Min Unit Cost is defaulted to 0 and cannot be changed for first Item Category-Customer Pricing Group combination where Customer Pricing Group = List.
                    rec.setValue({fieldId: 'custrecord_sna_hul_mincost', value: 0});
                    rec.setValue({fieldId: 'custrecord_sna_hul_maxcost', value: ''});
                    hasmin ? mincostfld.isDisabled = true : '';
                }
                if (isEmpty(cusrecser) || cusrecser.length == 1) {
                    // Max Unit Cost is grayed out if only one Item Category-Customer Pricing Group combination is available where Customer Pricing Group = List.
                    hasmax ? maxcostfld.isDisabled = true : '';
                }
                if (!isEmpty(cusrecser) && cusrecser[0].id != recid) {
                    // If there is a new Item Category-Customer Pricing Group combination where Customer Pricing Group = List, Min Unit Cost is Mandatory and can be set to any value. Max Unit Cost is grayed out
                    hasmin ? mincostfld.isMandatory = true : '';
                    hasmax ? maxcostfld.isDisabled = true : '';
                }
            }
            if (prcinggrpid != 155) {
                // If Customer Pricing Group is not List, Min Unit Cost and Max Unit Cost is grayed out.
                hasmin ? mincostfld.isDisabled = true : '';
                hasmax ? maxcostfld.isDisabled = true : '';

                hasmin ? mincostfld.isMandatory = false : '';
                rec.setValue({fieldId: 'custrecord_sna_hul_mincost', value: ''});
                rec.setValue({fieldId: 'custrecord_sna_hul_maxcost', value: ''});
            }
        }
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
        var rectype = currrec.type;

        var itmcat = currrec.getValue({fieldId: 'custrecord_sna_hul_itemcategory'});
        var prcinggrpid =  currrec.getValue({fieldId: 'custrecord_sna_hul_customerpricinggroup'});
        log.debug({title: 'saveRecord', details: recid + ' | itmcat: ' + itmcat + + ' | prcinggrpid: ' + prcinggrpid});

        // Item Category-Customer Pricing Group combination must be unique, unless Customer Pricing Group = List
        if (prcinggrpid != 155) {
            var filters_ = [];
            if (!isEmpty(itmcat)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: itmcat}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_itemcategory', operator: search.Operator.IS, values: '@NONE@'}));
            }
            if (!isEmpty(prcinggrpid)) {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: prcinggrpid}));
            } else {
                filters_.push(search.createFilter({name: 'custrecord_sna_hul_customerpricinggroup', operator: search.Operator.IS, values: '@NONE@'}));
            }
            if (!isEmpty(recid)) {
                filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.NONEOF, values: recid}));
            }
            var columns_ = [];
            columns_.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC})); // to get first Item Category-Customer Pricing combination

            var cusrecsearch = search.create({type: rectype, filters: filters_, columns: columns_});
            var cusrecser = cusrecsearch.run().getRange({start: 0, end: 1});
            if (!isEmpty(cusrecser)) {
                alert('This is a duplicate record.');
                return false;
            }
        }

        if ((CURR_PRICINNGGRP == 155 && prcinggrpid != 155) || (!isEmpty(CURR_PRICINNGGRP) && CURR_PRICINNGGRP != 155 && prcinggrpid == 155)) {
            alert('Changing the Customer Pricing Group will affect the Max Unit Cost sequence of the Item Category-Customer Pricing Group combination. Please create a new record.');
            return false;
        }

        if (!isEmpty(CURR_ITEMCAT) && CURR_ITEMCAT != itmcat && prcinggrpid == 155) {
            alert('Changing the Item Category will affect the Max Unit Cost sequence of the Item Category-Customer Pricing Group combination. Please create a new record.');
            return false;
        }

        return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
