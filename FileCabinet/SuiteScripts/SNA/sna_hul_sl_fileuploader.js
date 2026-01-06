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
* 2022/10/04						            natoretiro      	Initial version
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
        const onRequest = (objContext) => {
            var stLoggerTitle = 'onRequest';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var objRequest = objContext.request;
            var objResponse = objContext.response;



            try {
                var stReqMethod = objRequest.method;
                log.debug(stLoggerTitle, 'stReqMethod = ' + stReqMethod);

                if (stReqMethod == 'GET') {
                    var form = serverWidget.createForm({
                        title: 'File Uploader',
                        hideNavBar: true
                    });

                    var field = form.addField({
                        id: 'custpage_file',
                        type: 'file',
                        label: 'Document To Upload'
                    });

                    form.addSubmitButton({
                        label: 'Submit Button'
                    });

                    objResponse.writePage(form);
                }
                else
                {
                    var fileObj = objRequest.files.custpage_file;
                    fileObj.folder = 2436; //replace with own folder ID
                    var id = fileObj.save();
                }
            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }
        return {onRequest}
    });