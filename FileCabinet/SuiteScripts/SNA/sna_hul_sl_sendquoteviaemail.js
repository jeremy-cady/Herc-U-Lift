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
* 2022/01/27						            natoretiro      	Initial version
* 
*/


/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */


define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/render', 'N/email'],
    /**
     * @param{file} file
     * @param{format} format
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, format, record, runtime, search, serverWidget, url, render, email) => {
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
            var objparams = objRequest.parameters;

            var bIsSent = false;
            try
            {
                var stTranId = objparams.tranId;
                var stUserId = objparams.userId;
                log.debug(stLoggerTitle, 'stTranId = ' + stTranId + ' | stUserId = ' + stUserId);

                bIsSent = emailQuote(stTranId, stUserId);
                log.debug(stLoggerTitle, 'bIsSent = ' + bIsSent);
                
                objResponse.writeLine(bIsSent);
            }
            catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }


        function emailQuote(stRecordId, stUserId)
        {
            var stLoggerTitle = 'emailQuote';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            try
            {


                //TODO: change this to customer after testing
                var entityRef = {};
                entityRef.id = Number(stUserId);
                entityRef.type = 'employee';

                var mergeResult = render.mergeEmail({
                    templateId: 6,  //TODO: set as script parameter
                    entity:entityRef,
                    recipient:entityRef,
                    customRecord:entityRef,
                    supportCaseId:0, // This is temporary value the actual value to be set
                    transactionId: Number(stRecordId)
                });
                log.debug(stLoggerTitle, 'mergeResult = ' + JSON.stringify(mergeResult));
                var recipients = stUserId;
                var mailSubject =  mergeResult.subject;
                var mailBody =  mergeResult.body;


                var stFileId = getLatestFileAttachment(stRecordId);
                log.debug(stLoggerTitle, 'stFileId = ' + stFileId);

                var fileObj = file.load({
                    id: stFileId
                });
                log.debug(stLoggerTitle, 'recipients = ' + recipients);

                email.send({
                    author: recipients,
                    recipients: recipients,
                    subject: mailSubject,
                    body: mailBody,
                    attachments: [fileObj],
                    isInternalOnly: false,

                });

                return true;

            }
            catch(err)
            {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                //throw err;

                return false;

            }
            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function getLatestFileAttachment(stId)
        {


            var stFileId = 0;

            if((!isEmpty(stId)))
            {
                var objSearch = search.create({
                    type: "transaction",
                    filters:
                        [
                            ["internalid","anyof",stId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                join: "file",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "internalid",
                                join: "file",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "created",
                                join: "file",
                                summary: "GROUP",
                                sort: search.Sort.DESC
                            })
                        ]
                });
                var searchResultCount = objSearch.runPaged().count;

                objSearch.run().each(function(result){
                    stFileId = result.getValue({ name: 'internalid', join: "file", summary: "GROUP"});
                    return false;
                });
            }



            return stFileId;
        }

        function isEmpty(stValue)
        {
            // alert(stValue)
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }


        return {onRequest}
    });