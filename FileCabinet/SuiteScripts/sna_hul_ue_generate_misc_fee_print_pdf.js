/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This User Event script shows a button that generates a PDF from the Invoice before saving it
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2023/07/14                        Care Parba          Initial version
 *
 */
define(['N/record', 'N/search', 'N/url', 'N/render', 'N/redirect', 'N/runtime', 'N/file', 'N/xml'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{url} url
     * @param{render} render
     * @param{redirect} redirect
     * @param{runtime} runtime
     * @param{file} file
     * @param{xml} xml     */
    (record, search, url, render, redirect, runtime, file, xml) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            const LOG_TITLE = "beforeLoad";

            log.debug({title: LOG_TITLE, details: "===========START==========="});

            let objInvoiceRec = scriptContext.newRecord;
            log.debug({title: LOG_TITLE, details: `objInvoiceRec: ${JSON.stringify(objInvoiceRec)}`});

            if(scriptContext.type === scriptContext.UserEventType.VIEW || scriptContext.type === scriptContext.UserEventType.DELETE)
                return;

            try {
                scriptContext.form.clientScriptModulePath = './sna_hul_cs_generate_misc_fee_print_pdf.js';
                scriptContext.form.addButton({
                    id: "custpage_sna_generate_pdf",
                    label: "Generate PDF",
                    functionName: 'generatePDF'
                });
            } catch (error) {
                log.error({title: LOG_TITLE, details: `Error while showing generate PDF button: ${error}`});
            }

            try {
                scriptContext.form.clientScriptModulePath = './sna_hul_cs_generate_misc_fee_print_pdf.js';
                scriptContext.form.addButton({
                    id: "custpage_sna_generate_misc_fee",
                    label: "Generate MISC Fee",
                    functionName: 'generateMiscFee'
                });
            } catch (error) {
                log.error({title: LOG_TITLE, details: `Error while showing generate MISC Fee button: ${error}`});
            }

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        return {beforeLoad}

    });
