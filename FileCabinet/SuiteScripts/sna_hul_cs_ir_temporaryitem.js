/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to validate the inventory details of temporary items on the Item Receipt
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/6/27       		                 aduldulao       Initial version.
 * 2022/8/11                             aduldulao       Item Category checking as temp item
 * 2022/2/26                             aduldulao       Do not allow users to select Converted Item as Temp Returns Handling if Role is not Admin or HUL - Parts Manager
 * 2023/5/4                              aduldulao       New item categories
 * 2023/6/9                              caranda         Added itemreceive checkbox validation
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/runtime', 'N/search'],
/**
 * @param{currentRecord} currentRecord
 * @param{runtime} runtime
 */
function(currentRecord, runtime, search) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for ( var k in v)
                return false;
            return true;
        })(stValue)));
    }

    function inArray(stValue, arrValue) {
        for (var i = arrValue.length-1; i >= 0; i--) {
            if (stValue == arrValue[i]) {
                break;
            }
        }
        return (i > -1);
    }

    var CONVERTTOITEM = '';
    var CONVERTEDROLES = '';
    var CURRENTROLE = '';

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
        var currentScript = runtime.getCurrentScript();
        var userObj = runtime.getCurrentUser();
        if (!isEmpty(userObj)) {
            CURRENTROLE = userObj.role;
        }

        CONVERTEDROLES = currentScript.getParameter({name: 'custscript_sna_hul_converted_roles'}).split(',');
        CONVERTTOITEM = currentScript.getParameter({name: 'custscript_sna_hul_convert_to_item'});
    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {
        var currentScript = runtime.getCurrentScript();
        var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
        var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
        var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
        var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});

        var field = scriptContext.fieldId;
        var rec = scriptContext.currentRecord;

        if (field == 'custcol_sna_hul_returns_handling') {
            var itemhandling = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_returns_handling'});
            var itmcatcust = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory'});

            if ((tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat) && itemhandling == CONVERTTOITEM && !isEmpty(CURRENTROLE) && !inArray(CURRENTROLE, CONVERTEDROLES)) {
                alert('You cannot change the Temp Returns Handling to Convert to Item');
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
        var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
        var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
        var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});

        var rec = currentRecord.get();

        var createdfromtype = '';
        var createdfrom = rec.getValue({fieldId: 'createdfrom'});
        if (!isEmpty(createdfrom)) {
            var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
            createdfromtype = fldcreatefrom.recordtype;
        }
        log.debug({title: 'saveRecord', details: 'createdfrom: ' + createdfrom + ' | createdfromtype: ' + createdfromtype});

        if (createdfromtype == 'purchaseorder') {
            var itemcount = rec.getLineCount({sublistId: 'item'});

            for (var i = 0; i < itemcount; i++) {

                var itmreceive = rec.getSublistValue({sublistId: 'item', fieldId: 'itemreceive', line: i});

                //for testing
                log.audit({title: 'saveRecord test', details: 'line: ' + i + ' | itmreceive: ' + itmreceive});

                if(itmreceive){
                    var tempcode = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_temp_item_code', line: i});
                    var lineqty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                    var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                    var itmcatcust = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_itemcategory', line: i});

                    log.debug({title: 'saveRecord', details: 'line: ' + i + ' | tempcode: ' + tempcode + ' | lineqty: ' + lineqty + ' | itm: ' + itm + ' | itmcatcust: ' + itmcatcust});

                    if (!isEmpty(tempcode) && (tempitemcat == itmcatcust || itmcatcust == allieditemcat || itmcatcust == rackingitemcat || itmcatcust == storageitemcat)) {
                        rec.selectLine({sublistId: 'item', line: i});
                        var subrecord = rec.getCurrentSublistSubrecord({sublistId: 'item', fieldId: 'inventorydetail'});
                        var sublen = subrecord.getLineCount({sublistId: 'inventoryassignment'});
                        log.debug({title: 'saveRecord', details: 'sublen: ' + sublen});

                        for (var m = 0; m < sublen; m++) {
                            var subnum = subrecord.getSublistValue({sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', line: m});
                            log.debug({title: 'saveRecord', details: 'subnum: ' + subnum});

                            if (tempcode != subnum) {
                                alert('Set inventory number is different from the Temporary Item Code');
                                return false;
                            }
                        }
                    }
                }


            }//end for line
        }

        return true;
    }

    return {
        pageInit: pageInit,
        validateField: validateField,
        saveRecord: saveRecord
    };
    
});
