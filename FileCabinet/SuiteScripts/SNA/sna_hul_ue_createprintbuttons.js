/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
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
 * 2022/03/11						           natoretiro      	Initial version
 * 2023/01/26								   mdesilva         Additional buttons for Quotetask and QuoteSummary					
 * 2023/01/30                                  mdesilva         Added validations for showing buttons depending on the custom form selcted
 *
 */


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/format'],
    (record, widget, search, runtime, url, file, format) => {

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (objContext) => {
            var stLoggerTitle = 'beforeLoad';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                var custom_form;
                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;
                var contextType = objContext.type;
                var rectype = objCurrentRecord.type;
                var record_id = objCurrentRecord.id;


                if (contextType == 'view') {
                    var est_rec = record.load({
                        type: rectype,
                        id: record_id,
                        isDynamic: true,
                    });
                    custom_form = est_rec.getValue({
                        fieldId: 'customform'
                    });
                } else if (contextType == 'edit' || contextType == 'create') {
                    custom_form = objCurrentRecord.getValue({
                        fieldId: 'customform'
                    });
                }
                log.debug('custom_form ', 'contextType: ' + contextType + ' | custom_form: ' + custom_form);


				//NXC Estimate || Service Estimate
                //if (!((custom_form == '108') || (custom_form == '109'))) {
					if (custom_form == '111') {
                    //log.debug('custom_form is not 108 or 109', 'custom_form is not 108 or 109');
					log.debug('custom_form is 111 Parts Quote');

                    // Getting the URL to open the suitelet.
                    var stQuoteSLURL = url.resolveScript({
                        scriptId: 'customscript_sna_hul_sl_generatequote',
                        deploymentId: 'customdeploy_sna_hul_sl_generatequote',
                        returnExternalUrl: false,
                        params: {
                            tranId: objCurrentRecord.id,
                            tranName: 'Parts Quote'
                        }
                    });

                    var stEstimateSLURL = url.resolveScript({
                        scriptId: 'customscript_sna_hul_sl_generateestimate',
                        deploymentId: 'customdeploysna_hul_sl_generateestimate',
                        returnExternalUrl: false,
                        params: {
                            tranId: objCurrentRecord.id,
                            tranName: 'Work Order Estimate'
                        }
                    });

                    stQuoteSLURL = "window.ischanged=false;window.open('" + stQuoteSLURL + "','_blank');";
                    stEstimateSLURL = "window.ischanged=false;window.open('" + stEstimateSLURL + "','_blank');";

                    var funcGenQuote = "require([],function(){ " + stQuoteSLURL + " });";
                    var funcGenEstimate = "require([],function(){ " + stEstimateSLURL + " });";

                    objForm.addButton({
                        id: 'custpage_btn_printquote',
                        label: 'Generate Quote',
                        functionName: funcGenQuote
                    });
                    objForm.addButton({
                        id: 'custpage_btn_printestimate',
                        label: 'Generate Estimate',
                        functionName: funcGenEstimate
                    });

                }

				//NXC Estimate || Service Estimate
                // additional buttons for Quotepertask and QuoteSummary
                //if (custom_form == '108' || custom_form == '109') {
				if (custom_form == '105') {
                    //log.debug('custom_form is  108 or 109', 'custom_form is 108 or 109');
					log.debug('custom_form is 105 Service Estimate');
                    var stQuotepertaskSLURL = url.resolveScript({
                        scriptId: 'customscript_sna_hul_sl_generatequotetas',
                        deploymentId: 'customdeploy_sna_hul_sl_generatequotetas',
                        returnExternalUrl: false,
                        params: {
                            tranId: objCurrentRecord.id,
                            tranName: 'Work Order Estimate'
                        }
                    });

                    var stQuotesummarySLURL = url.resolveScript({
                        scriptId: 'customscript_sna_hul_sl_serv_quote_summ',
                        deploymentId: 'customdeploy_sna_hul_sl_serv_quote_summa',
                        returnExternalUrl: false,
                        params: {
                            tranId: objCurrentRecord.id,
                            tranName: 'Work Order Estimate'
                        }
                    });

                    stQuotepertaskSLURL = "window.ischanged=false;window.open('" + stQuotepertaskSLURL + "','_blank');";
                    stQuotesummarySLURL = "window.ischanged=false;window.open('" + stQuotesummarySLURL + "','_blank');";

                    var funcGenQuotepertask = "require([],function(){ " + stQuotepertaskSLURL + " });";
                    var funcGenQuoteSummary = "require([],function(){ " + stQuotesummarySLURL + " });";

                    objForm.addButton({
                        id: 'custpage_btn_printquoteprtask',
                        label: 'Generate Service Quote per Task',
                        functionName: funcGenQuotepertask
                    });
                    objForm.addButton({
                        id: 'custpage_btn_printquotesummary',
                        label: 'Generate Service Quote Summary',
                        functionName: funcGenQuoteSummary
                    });

                }


            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        return {
            beforeLoad
        }

    });