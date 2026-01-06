/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to validate temporary item fields
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/6/30       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Remove Temporary UOM, Item Category checking as temp item
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime'],
/**
 * @param{runtime} runtime
 */
function(runtime) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for ( var k in v)
                return false;
            return true;
        })(stValue)));
    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {
        var currentScript = runtime.getCurrentScript();
        var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});

        var fields = '';

        var rec = scriptContext.currentRecord;
        var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
        var itmcatcust = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory'});
        var tempvendor = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor'});
        var vendoritmcode = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code'});
        var desc = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'description'});
        var qty = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'quantity'});
        var porate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'porate'});
        var rate = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'rate'});
        var vendorname = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name'});

        if (tempitemcat == itmcatcust) {
            log.debug({title: 'validateLine', details: 'tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname});

            if (isEmpty(itmcatcust)) {
                fields += 'Item Category, ';
            }
            if (isEmpty(tempvendor) && isEmpty(vendorname)) {
                alert('Temporary Item Vendor is missing. Enter Vendor Name to create vendor record');
                return false;
            }
            if (isEmpty(vendoritmcode)) {
                fields += 'Vendor Item Code, ';
            }
            if (isEmpty(desc)) {
                fields += 'Description, ';
            }
            if (isEmpty(qty)) {
                fields += 'Quantity, ';
            }
            if (isEmpty(porate)) {
                fields += 'PO Rate, ';
            }
            if (isEmpty(rate)) {
                fields += 'Rate';
            }

            if (!isEmpty(fields)) {
                alert('Enter missing sublist fields: ' + fields)
                return false;
            }
        }

        return true;
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
        var currentScript = runtime.getCurrentScript();
        var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});

        var fields = '';

        var rec = scriptContext.currentRecord;
        var itemcount = rec.getLineCount({sublistId: 'item'});

        for (var i = 0; i < itemcount; i++) {
            var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
            var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});
            var tempvendor = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_item_vendor', line: i});
            var vendoritmcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_item_code', line: i});
            var desc = rec.getSublistValue({sublistId: 'item', fieldId: 'description', line: i});
            var qty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
            var porate = rec.getSublistValue({sublistId: 'item', fieldId: 'porate', line: i});
            var rate = rec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
            var vendorname = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_vendor_name', line: i});

            if (tempitemcat == itmcatcust) {
                log.debug({title: 'saveRecord', details: 'tempvendor: ' + tempvendor + ' | vendorname: ' + vendorname});

                if (isEmpty(itmcatcust)) {
                    fields += 'Item Category, ';
                }
                if (isEmpty(tempvendor) && isEmpty(vendorname)) {
                    alert('Temporary Item Vendor is missing. Enter Vendor Name to create vendor record');
                    return false;
                }
                if (isEmpty(vendoritmcode)) {
                    fields += 'Vendor Item Code, ';
                }
                if (isEmpty(desc)) {
                    fields += 'Description, ';
                }
                if (isEmpty(qty)) {
                    fields += 'Quantity, ';
                }
                if (isEmpty(porate)) {
                    fields += 'PO Rate, ';
                }
                if (isEmpty(rate)) {
                    fields += 'Rate';
                }

                if (!isEmpty(fields)) {
                    alert('Enter missing sublist fields: ' + fields)
                    return false;
                }
            }
        }

        return true;
    }

    return {
        saveRecord: saveRecord,
        validateLine: validateLine
    };
    
});
