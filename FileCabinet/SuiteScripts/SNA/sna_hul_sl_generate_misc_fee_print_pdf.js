/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Suitelet generates a PDF from the Invoice upon clicking of the Generate PDF button
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2023/07/14                        Care Parba          Initial version
 *
 */
define(['N/file', 'N/record', 'N/redirect', 'N/render', 'N/runtime', 'N/search', 'N/url', 'N/xml', 'N/ui/serverWidget'],
    /**
 * @param{file} file
 * @param{record} record
 * @param{redirect} redirect
 * @param{render} render
 * @param{runtime} runtime
 * @param{search} search
 * @param{url} url
 * @param{xml} xml
 * @param{serverWidget } serverWidget
     */
    (file, record, redirect, render, runtime, search, url, xml, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const LOG_TITLE = "onRequest";

            log.debug({title: LOG_TITLE, details: "===========START==========="});

            let objParams = scriptContext.request.parameters;
            log.debug({title: LOG_TITLE, details: `objParams: ${JSON.stringify(objParams)}`});

            if (scriptContext.request.method === 'GET') {
                const METHOD = "GET";

                log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `scriptContext: ${JSON.stringify(scriptContext)}`
                });
                log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `request parameters: ${JSON.stringify(scriptContext.request.parameters)}`
                });

                let objForm = serverWidget.createForm({
                    title: 'Generate PDF'
                });

                objForm.clientScriptModulePath = './sna_hul_cs_generate_misc_fee_print_pdf.js';

                let objJSONField = objForm.addField({
                    id: 'custpage_inv_json_format',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Invoice JSON'
                });
                objJSONField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                let objTemplateId = objForm.addField({
                    id: 'custpage_template_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Template ID'
                });
                objTemplateId.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                objForm.addSubmitButton({
                    label: 'Submit'
                });

                scriptContext.response.writePage(objForm);
            } else {
                const METHOD = "POST";

                let objInvoiceRec = scriptContext.request.parameters.custpage_inv_json_format;

                if(!objInvoiceRec)
                    return;

                objInvoiceRec = JSON.parse(objInvoiceRec);
                log.debug('objInvoiceRec', objInvoiceRec);
                // stringify JSON object so it can b
                objInvoiceRec = JSON.stringify(objInvoiceRec);
                let cleanedString = objInvoiceRec.replace(/\u0005/g, '\n');
                log.debug('cleanedString', cleanedString);
                // objInvoiceRec?.lines?.forEach((line) => {
                //     let description = line?.description;
                //     log.debug(description);
                // });
                // log.debug('objInvoiceRec after descritpion change: ', objInvoiceRec);
                // objInvoiceRec?.lines?.description.replace(/\n/g, " ** ");
                // log.debug('objInvoiceRec after regex', objInvoiceRec);
                // let itemArray = objInvoiceRec?.lines;
                // log.debug('itemArray', itemArray);
                // itemArray.forEach(item => {
                //     let description = item.description;
                //     log.debug('description', description);
                // });
                // objInvoiceRec = objInvoiceRec.replace(/\n/g, ' * ');
                let stTemplateId = scriptContext.request.parameters.custpage_template_id;

                if(!stTemplateId)
                    stTemplateId = "sna_hul_service_invoice_template.xml";

                log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `objInvoiceRec: ${JSON.stringify(objInvoiceRec)}`
                });

                log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `stTemplateId: ${stTemplateId}`
                });

                /*Template Creation - Add Invoices*/
                let templateFile = file.load({id: `./TEMPLATES/${stTemplateId}`});
                let renderer = render.create();
                renderer.templateContent = templateFile.getContents();

                renderer.addCustomDataSource({format: 'OBJECT', alias: 'invoiceDetails', data: objInvoiceRec});

                let statementPDF = renderer.renderAsPdf();

                let transactionFile = statementPDF;
                transactionFile.name = 'Invoice - ' + transactionFile.name + '_' + new Date().getTime() + '.pdf';
                transactionFile.folder = runtime.getCurrentScript().getParameter("custscript_invoice_folder");
                let id = transactionFile.save();
                log.debug({title: 'File Saved - transactionFile Id', details: id});

                transactionFile = file.load({id});

                redirect.redirect({url: transactionFile.url});
            }

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        return {onRequest}

    });
