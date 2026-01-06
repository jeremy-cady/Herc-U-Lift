/**
 * Copyright (c) 2020, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Revision History:
 *
 * Date              Issue/Case         Author          Issue Fix Summary
 * =============================================================================================
 * 2023/11/16		 97569				afrancisco		Intial Version
 *
 */
define(['N/search', 'N/runtime'],
    function(search, runtime) {


        function saveRecord(scriptContext){
            try{
                var objRec = scriptContext.currentRecord;
                var strClaimId = objRec.getValue('custbody_sna_inv_claimid');
                var intJE = objRec.getValue('custbody_sna_jeforwarranty');
                var blnWarranty = false;
                var intLineCnt = objRec.getLineCount('item');
                var arrRevStream = new Array();
                for (var x = 0; x < intLineCnt; x++) {
                    var intRevStream = objRec.getSublistValue({sublistId:'item',fieldId:'cseg_sna_revenue_st',line:x});
                    log.audit('intRevStream',intRevStream);
                    if(!isEmpty(intRevStream)){
                       arrRevStream.push(intRevStream);
                    }
                }



                var objSearch = search.load({id:runtime.getCurrentScript().getParameter('custscript_sna_hul_revstr')});
                log.audit('arrRevStream',arrRevStream);
                if(arrRevStream.length > 0){
                    var objFilter = search.createFilter({name:'internalid',operator:'anyof',values:arrRevStream});
                    objSearch.filters.push(objFilter);
                }

                objSearch.run().each(function(result){

                    var warranty = result.getValue({name:"custrecord_sn_for_warranty"});
                    // log.debug('warranty:' + result.id,warranty);
                    if(warranty){
                        blnWarranty = true;
                        return false;
                    }
                    return true;
                });

                log.audit('!blnWarranty',!blnWarranty);
                if(isEmpty(strClaimId) && blnWarranty){
                    alert('Please fill up Claim ID for Warranty field.');
                    return false;
                }else{
                    return true;

                }

            }catch(ex){
                log.error('saveRecord Catch', ex);
            }


        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }




        return {
            saveRecord: saveRecord
        };


    });