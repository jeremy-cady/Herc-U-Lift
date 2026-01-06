/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author sjprat
*
* Script brief description:
* CS script deployed on Sales Order and Invoice Record used for:
* - Show PO is required banner if Customer is PO Required.
* - Set Blanket PO for SO
*
*
* Revision History:
*
* Date              Issue/Case          Author          Issue Fix Summary
* =============================================================================================
* 2023/08/01           98786            sjprat         Initial Version -
* 2023/11/21                            fang           Add printWarrantyFxn
*/


/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message', 'N/search', 'N/url'],
/**
 * @param{currentRecord} currentRecord
 * @param{message} message
 */
function(currentRecord, message, search, url) {
var po_required_message = message.create({
        title: "PO is Required for this Customer",
        message: "Please Enter Purchase Order Number on PO# field",
        type: message.Type.ERROR
    });

    function pageInit(scriptContext){
        console.log('pageInit: ' + JSON.stringify(scriptContext));
        var current_record = scriptContext.currentRecord;
        var customer = current_record.getValue({fieldId : 'entity'});
        if(!isEmpty(customer)){
            var po_fields = search.lookupFields({type: 'customer', id: customer, columns: ['custentity_sna_hul_po_required', 'custentity_sna_blanket_po']});
            console.log('po_fields: ' + JSON.stringify(po_fields))
            var po_num = current_record.getValue({fieldId : 'otherrefnum'});
            if(!isEmpty(po_fields['custentity_sna_blanket_po']) && isEmpty(po_num)){
                console.log('Setting Blanket PO');
                current_record.setValue({fieldId: 'otherrefnum', value: po_fields['custentity_sna_blanket_po']});
                po_num = po_fields['custentity_sna_blanket_po'];
            }
            var revenueStream = current_record.getText({ fieldId: 'cseg_sna_revenue_st' });
            var isRevenueStreamExternal = revenueStream.includes("External");

            if(po_fields['custentity_sna_hul_po_required'] && isEmpty(po_num) && isRevenueStreamExternal){
                console.log('Showing Message');
                po_required_message.show();
            }
        }
    }
    function fieldChanged(scriptContext) {
        console.log('fieldChanged: ' + JSON.stringify(scriptContext));
        var current_record = scriptContext.currentRecord;
        var field = scriptContext.fieldId;

        if(field == 'entity' || field == 'otherrefnum' || field == 'cseg_sna_revenue_st'){
            var customer = current_record.getValue({fieldId : 'entity'});
            var po_num = current_record.getValue({fieldId : 'otherrefnum'});

            var revenueStream = current_record.getText({ fieldId: 'cseg_sna_revenue_st' });
            log.debug("revenueStream",revenueStream);
            
            var isRevenueStreamExternal = revenueStream.includes("External");
            log.debug("isRevenueStreamExternal",isRevenueStreamExternal);

            if(!isEmpty(customer)){
                var po_fields = search.lookupFields({type: 'customer', id: customer, columns: ['custentity_sna_hul_po_required', 'custentity_sna_blanket_po']});
                if(field== 'entity' && !isEmpty(po_fields['custentity_sna_blanket_po']) && isEmpty(po_num)){
                    console.log('Setting Blanket PO');
                    current_record.setValue({fieldId: 'otherrefnum', value: po_fields['custentity_sna_blanket_po']});
                    po_required_message.hide();
                }
                po_num = current_record.getValue({fieldId : 'otherrefnum'});
                if(po_fields['custentity_sna_hul_po_required'] && isEmpty(po_num) && isRevenueStreamExternal){
                    console.log('Showing Message');
                    po_required_message.show();
                }
                else{
                    console.log('Hiding Message');
                    po_required_message.hide();
                }
            }
        }
    }

    function saveRecord(scriptContext) {
        console.log('saveRecord: ' + JSON.stringify(scriptContext));
        var current_record = scriptContext.currentRecord;
        var customer = current_record.getValue({fieldId : 'entity'});
        var po_required = search.lookupFields({type: 'customer', id: customer, columns: ['custentity_sna_hul_po_required']})['custentity_sna_hul_po_required'];
        var po_num = current_record.getValue({fieldId: 'otherrefnum'});
        console.log('po_required: ' + po_required + ', po_num: '+ po_num);

        var revenueStream = current_record.getText({ fieldId: 'cseg_sna_revenue_st' });
        log.debug("revenueStream",revenueStream);
        
        var isRevenueStreamExternal = revenueStream.includes("External");
        log.debug("isRevenueStreamExternal",isRevenueStreamExternal);

        if(po_required && isEmpty(po_num) && isRevenueStreamExternal){
            po_required_message.hide();
            if(current_record.type == 'invoice'){
                // alert('Unable to Save Record:\n PO# required for this customer');
                po_required_message.show();
                return false;
            }
            else if(current_record.type=='salesorder'){
                // alert('PO# required for this customer');
                po_required_message.show();
            }
        }
        else{
            po_required_message.hide();
        }
        return true;
    }

    function printWarrantyFxn(){
        var currRec = currentRecord.get();
        var currRecId = currRec.id;

        console.log('currRecId', currRecId);

        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_sna_hul_sl_print_wty_pdf',
            deploymentId: 'customdeploy_sna_hul_print_wty_pdf',
            params: {
                'inv_rec_id': currRecId
            }
            // returnExternalUrl: true
        });


        window.open(suiteletUrl);

        console.log({title: 'printWarrantyFxn', details: "suiteletUrl: " + JSON.stringify(suiteletUrl)});
    }


    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        printWarrantyFxn: printWarrantyFxn
    };

});
