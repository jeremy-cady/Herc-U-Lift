/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Vishal Pitale
 *
 * Script brief description:
 * This Client script is attached to the Sales Order.
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2024/02/20                         Vishal Pitale         Initial Version
 */

define(['N/search'], (search) => {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue === null || stValue === undefined) || (stValue.constructor === Array && stValue.length === 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    const fieldChanged = (scriptContext) => {
        try {
            let currentRecord = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            let fieldId = scriptContext.fieldId;
            let line = scriptContext.line;
console.log('sublistId', sublistId);
console.log('fieldId', fieldId);
console.log('line', line);

            if(sublistId == 'item' && fieldId == 'custcol_sna_override_commission') {
                let commOverride = currentRecord.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_override_commission' });
                let commAmtVal = currentRecord.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_commission_amount' });
                let commAmtField = currentRecord.getSublistField({ sublistId: 'item', fieldId: 'custcol_sna_commission_amount', line: line });
console.log('commOverride', commOverride);
console.log('commAmtVal', commAmtVal);

                if(commOverride == true || commOverride == 'true' || commOverride == 'T') {
                    commAmtField.isDisabled = false;
                    // currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_commission_amount', value: '', ignoreFieldChange: true });
                    // currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_sales_rep', value: '', ignoreFieldChange: true });
                } else {
                    commAmtField.isDisabled = true;
                }
            }
        } catch(e) { log.error('Error', e); }
    }

    const validateLine = (scriptContext) => {
        let currentRecord = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;

        if(sublistId == 'item') {
console.log('1');
            let salesRep = currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_sales_rep'});
            let commissionAmt = currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_commission_amount'});
            let commOverride = currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_override_commission'});

            if((commOverride == true || commOverride == 'true' || commOverride == 'T') && (isEmpty(commissionAmt) || isEmpty(salesRep))) {
                alert('Please enter the values for Sales Rep and/or Commission Amount.');
                return false;
            }
        }

        return true;
    }

    return { fieldChanged, validateLine };
});