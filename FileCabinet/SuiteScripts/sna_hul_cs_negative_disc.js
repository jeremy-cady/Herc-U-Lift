/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script to validate negative discount
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/6/3       		                 cparba       Initial version.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

function() {
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
        console.log('SNA Negative Discount Script Fired');
        var rec = scriptContext.currentRecord;
        var recId = Number(scriptContext.currentRecord.id);
        console.log(recId);

        if(recId === 2841204){
            var percentDiscount = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_perc_disc'});
            var dollarDiscount = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dollar_disc'});

            if(Number(percentDiscount) < 0 || Number(dollarDiscount) < 0) {
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_perc_disc', value: ''});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dollar_disc', value: ''});
                alert('#SNA % DISCOUNT or #SNA $ DISCOUNT should not be a negative value');
            }
        }

        return true;
    }


    return {
        validateLine: validateLine
    };
    
});
