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
* 2023/03/24						            natoretiro      	Initial version
* 2023/05/18                                    nretiro             Added line to set For Approval checkbox to false
* 
*/

/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 *@NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/format', 'N/error', 'N/cache', 'N/email'],

    function (runtime, record, search, format, error, cache, email) {

        function getInputData() {
            var stLoggerTitle = 'execute';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            var obj= {};
            try
            {
                var stParamVPsToApprove = runtime.getCurrentScript().getParameter({name: 'custscript_param_vpstoapprove'});
                log.debug(stLoggerTitle, 'stParamVPsToApprove = ' + stParamVPsToApprove);

                var arrParamVPsToApprove = stParamVPsToApprove.split(',');

                for(var i=0; i < arrParamVPsToApprove.length; i++)
                {
                    obj[i] = { vpId : arrParamVPsToApprove[i] };
                }

                // obj[0] = { vpId : arrParamVPsToApprove[0] }; // used for testing. will get first index


            }
            catch (err)
            {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
            return obj;
        }

        function map(context) {
            var stLoggerTitle = 'map';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                log.debug(stLoggerTitle, 'context = ' + JSON.stringify(context));

                log.debug(stLoggerTitle, 'context.value = ' + context.value);
                var obj = context.value;


                context.write({key: context.key, value: JSON.parse(context.value)});

            } catch (err) {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function reduce(context) {
            var stLoggerTitle = 'reduce';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                log.debug(stLoggerTitle, 'context = ' + JSON.stringify(context));

                var obj =  JSON.parse(context.values[0]);
                log.debug(stLoggerTitle, 'obj = ' + JSON.stringify(obj));

                // update vendor price record
                var recVP = record.load({
                    type: 'customrecord_sna_hul_vendorprice',
                    id: obj.vpId
                });

                if(!isEmpty(recVP))
                {



                    var flPurchPriceD = recVP.getValue({ fieldId: 'custrecord_sna_hul_t_itempurchaseprice' }) || 0;
                    var flListPriceD = recVP.getValue({ fieldId: 'custrecord_sna_hul_t_listprice' }) || 0;
                    var flContPriceD = recVP.getValue({ fieldId: 'custrecord_sna_hul_t_contractprice' }) || 0;

                    var arrRemarks = recVP.getValue({ fieldId: 'custrecord_sna_hul_remarks'}).split(',');
                    arrRemarks[0] = '';
                    arrRemarks[2] = '';
                    arrRemarks[1] = '';

                    recVP.setValue({ fieldId: 'custrecord_sna_hul_itempurchaseprice', value: flPurchPriceD });
                    recVP.setValue({ fieldId: 'custrecord_sna_hul_listprice', value: flListPriceD });
                    recVP.setValue({ fieldId: 'custrecord_sna_hul_contractprice', value: flContPriceD });
                    recVP.setValue({ fieldId: 'custrecord_sna_hul_remarks', value: arrRemarks.toString() });

                    recVP.setValue({ fieldId: 'custrecord_sna_hul_lp_lastapprovaldate', value: new Date() });
                    recVP.setValue({ fieldId: 'custrecord_sna_hul_lp_lastapprovedby', value: runtime.getCurrentUser().id });
                    recVP.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: false });


                    var stVPId = recVP.save();
                    log.debug(stLoggerTitle, 'stVPId = ' + stVPId + ' was updated.');


                }
                else
                {
                    log.debug(stLoggerTitle, 'stVPId = ' + obj.vpId + ' was not found.');
                }


            } catch (err) {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function summarize(summary) {
            var stLoggerTitle = 'summarize';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                log.debug(stLoggerTitle, 'summary = ' + JSON.stringify(summary));

                var stContent = '';

                stContent = '<p>Vendor Price approval process is done.</p>';


                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: runtime.getCurrentUser().id,
                    subject: 'NOTIFICATION -- Vendor Price Approval',
                    body: stContent,
                    // attachments: [objExport]

                });


            } catch (err) {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }



        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }


        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });