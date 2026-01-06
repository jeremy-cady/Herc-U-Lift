/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author mdesilva
 *
 * Script brief description:
 * User Event script deployed on SO to Hide Bill button when order’s Billing Status is not Approved for Billing.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2023/03/24                         mdesilva         Initial version
 * 2024/11/25  						  SNAImran 		   Added custom button logic for PandaDoc Integration eSignature.
 *
 *
 */
define(['N/ui/serverWidget', 'N/runtime'], function(serverWidget, runtime) {


	/**
	 * @function isARentalTransaction
	 * @param newRecord
	 */
	function isARentalTransaction (newRecord) {
		var isARentalTrans = false;
		var lineCount = newRecord.getLineCount({ sublistId: 'item' });
		for (var lineIndex = 0; lineIndex < lineCount; lineIndex++) {
			var itemName = newRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: lineIndex });
			if(itemName.indexOf('Rental') > -1) {
				isARentalTrans = true;
				break;
			}
		};
		return isARentalTrans;
	};

	/**
	 * @function beforeLoad
	 * @param context
	 * @returns {boolean}
	 */
	function beforeLoad(context){
		var LOG_TITLE = 'beforeLoad';
		var so_rec = context.newRecord;  
		var so_rec_form = context.form;		
		var billing_status = so_rec.getValue('custbody_sna_hul_billing_status');
		log.debug(LOG_TITLE, 'SO ID: ' + so_rec +' | Billing Status: ' +billing_status)
		
		if (billing_status != 2) {
			so_rec_form.removeButton('nextbill');
			so_rec_form.removeButton('billremaining');
			so_rec_form.removeButton('bill');
			log.debug(LOG_TITLE, '-- Hide Bill Buttons --')
		}

		if(context.type !== context.UserEventType.VIEW) return true;
		var pdfDocId = so_rec.getValue({ fieldId: 'custbody_sna_pd_doc_id' });
		var isRentalTransaction = isARentalTransaction(so_rec);
		if(!pdfDocId && isRentalTransaction) {
			var scriptObj = runtime.getCurrentScript();
			var templateId = scriptObj.getParameter({name: 'custscript_sna_pd_adv_pdf_temp'});
			so_rec_form.clientScriptModulePath = './PandaDocs/sna_hul_cs_pd_esign_button';
			so_rec_form.addButton({
				label: 'Request eSignature',
				id: 'custpage_req_esign',
				functionName: 'requestESignature("' + templateId + '")'
			});
		}
	};

	function isEmpty(stValue) {
        return ((stValue == 0 || stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    return {
        beforeLoad: beforeLoad
    };
});