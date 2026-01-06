/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author natoretiro
 *
 * Script brief description:
 * Create Print Button for Vendor Return Authorization
 *
 * Revision History:
 *
 * Date			            Issue/Case		    Author			    Issue Fix Summary
 * =======================================================================================================
 * 2023/07/11						           mdesilva      	Initial version
 *
 */


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/url'],
    (record, url) => {

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

                // Getting the URL to open the suitelet.
                var url_vra = url.resolveScript({
                    scriptId: 'customscript_sna_hul_sl_printvra',
                    deploymentId: 'customdeploy_sna_hul_sl_printvra',
                    returnExternalUrl: false,
                    params: {
                        tranId: objCurrentRecord.id
                    }
                });
                url_vra = "window.ischanged=false;window.open('" + url_vra + "','_blank');";
                var funcPrintVRA = "require([],function(){ " + url_vra + " });";

                objForm.addButton({
                    id: 'custpage_btn_print_vra',
                    label: 'Print Vendor Return Authorization',
                    functionName: funcPrintVRA
                });


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