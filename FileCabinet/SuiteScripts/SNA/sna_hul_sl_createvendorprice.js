/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
* (BRIEF DESCRIPTION)
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/02/25						            natoretiro      	Initial version
* 
*/


/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */


define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
     * @param{file} file
     * @param{format} format
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, format, record, runtime, search, serverWidget, url) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var stLoggerTitle = 'onRequest';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var objRequest = scriptContext.request;
            var objResponse = scriptContext.response;

            var itm = objRequest.parameters.itm;
            var itm_txt = objRequest.parameters.itm_txt;
            var buyFromVendor = objRequest.parameters.buyFromVendor;
            var rate = objRequest.parameters.rate;

            log.debug({ title: stLoggerTitle, details: 'itm = ' + itm + ' | itm_txt = ' + itm_txt + ' | buyFromVendor = ' +
                    buyFromVendor + ' | rate = ' + rate  });

            try {
                log.debug({ title: stLoggerTitle, details: 'CREATE VENDOR PRICING' });

                // CREATE VENDOR PRICING
                var recVP = record.create({
                    type: 'customrecord_sna_hul_vendorprice'
                });

                recVP.setValue({ fieldId: 'custrecord_sna_hul_item', value: itm });
                // recVP.setValue({ fieldId: 'custrecordsna_hul_vendoritemnumber', value: itm_txt });
                recVP.setValue({ fieldId: 'custrecord_sna_hul_vendor', value:  buyFromVendor });

                // rate = null means it came from special order or dropship
                if(isEmpty(rate))
                {
                    recVP.setValue({ fieldId: 'custrecord_sna_hul_primaryvendor', value:  true });
                }

                recVP.setValue({ fieldId: 'custrecord_sna_hul_itempurchaseprice', value:  rate || 0 });


                var stVPId = recVP.save();

                log.debug({ title: stLoggerTitle, details: 'stVPId = ' + stVPId });

                if(!isEmpty(stVPId))
                {
                    objResponse.write(stVPId);
                }

            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });

                objResponse.write(e.name + ' : ' + e.message);
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) { for (var k in v) return false; return true; })(stValue)));
        }


        return {onRequest}
    });