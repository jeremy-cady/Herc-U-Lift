/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author fang
*
* Script brief description:
* Suitelet to show Authorize Employee Commissions Page (both Employee Commissions and Employee Spiff) and process Commission Payable record based on Suitelet parameters
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/04/13                                    fang              Initial version
*
*
*/

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/task', 'N/redirect', 'N/render'],
    /**
     * @param{file} file
     * @param{format} format
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, format, record, runtime, search, serverWidget, url, task, redirect, render) => {
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

            //CURRENT_USER = runtime.getCurrentUser();
            //CURRENT_USER_ID = CURRENT_USER.id;

            var objRequest = scriptContext.request;
            var objResponse = scriptContext.response;

            try {
                var stReqMethod = objRequest.method;
                log.debug(stLoggerTitle, 'stReqMethod = ' + stReqMethod);

                log.debug(stLoggerTitle, 'objRequest.parameters = ' + JSON.stringify(objRequest.parameters));

                if (stReqMethod == 'GET') {
                    // Get the invoice ID from the request parameters
                    var invRecId = objRequest.parameters.inv_rec_id;

                    // Load the invoice record
                    var invoiceRec = record.load({
                        type: record.Type.INVOICE,
                        id: invRecId,
                        isDynamic: true,
                    });

                    // Create a renderer
                    var renderer = render.create();

                    // Set the template to 'INVOICE'
                    renderer.templateContent = file.load({ id: 'SuiteScripts/TEMPLATES/custtmpl_sna_warranty_invoice_template.xml' }).getContents();

                    // Add the record to the renderer
                    renderer.addRecord({ templateName: 'record', record: invoiceRec });

                    // Render the content as a PDF
                    var pdfFile = renderer.renderAsPdf();

                    // Send the PDF back in the response
                    objResponse.writeFile({
                        file: pdfFile,
                        isInline: true,
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



        //Utility Functions
        function formatDate(date) {
            var dt = new Date(date);
            var dtMonth = dt.getMonth();
            var dtDay = dt.getDate();
            var dtYear = dt.getFullYear();

            date = new Date(dtMonth + 1 + '/' + dtDay + '/' + dtYear);
            return format.format({ value: format.parse({ value: date, type: format.Type.DATE }), type: format.Type.DATE });
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        function runPagedSearch(objOptions) {
            var LOG_TITLE = 'runPagedSearch';

            // log.debug({title: LOG_TITLE, details: JSON.stringify(objOptions)});

            var objSearch = search.load({ id: objOptions.searchId });

            if (objOptions.filters) {
                objSearch.filters = objSearch.filters.concat(objOptions.filters);
            }
            return objSearch.runPaged({
                pageSize: objOptions.pageSize
            });
        };

        function getUrl(recordType, recordId) {
            return url.resolveRecord({
                recordType: recordType,
                recordId: recordId,
            });
        }

        return { onRequest }
    });