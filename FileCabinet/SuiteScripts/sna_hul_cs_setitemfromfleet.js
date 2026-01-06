/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to set item on field change of Fleet
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/6       		                 aduldulao       Initial version.
 * 2022/9/8       		                 aduldulao       Default if empty
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
/**
 * @param{runtime} runtime
 */
function(runtime, search, record) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for ( var k in v)
                return false;
            return true;
        })(stValue)));
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
        var recCurrent = scriptContext.currentRecord;

        if (scriptContext.fieldId == 'custcol_sna_hul_fleet_no'){
            var rentalitm = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_rental_equipment'});

            var itm = recCurrent.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
            if (!isEmpty(rentalitm) && isEmpty(itm)) {
                recCurrent.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: rentalitm});
            }
        }
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {
        var recCurrent = scriptContext.currentRecord;

        var fa = recCurrent.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_fam_obj'});
        if (!isEmpty(fa)) {
            var farec = record.load({type: 'customrecord_ncfar_asset', id: fa, isDynamic: true});
            var nbv = farec.getValue({fieldId: 'custrecord_assetbookvalue'});
            recCurrent.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fa_nbv', value: nbv});
        }
    }

    return {
        fieldChanged: fieldChanged,
        postSourcing: postSourcing
    };
    
});
