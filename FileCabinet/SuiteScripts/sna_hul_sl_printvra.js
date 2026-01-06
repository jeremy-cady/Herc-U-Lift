/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author mdesilva
*
* Script brief description:
* Print Vendor Return Authorization Template
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/07/11							       mdesilva      	Initial version
*
*/


/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */


define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/render'],
    (file, format, record, runtime, search, serverWidget, url, render) => {

        const onRequest = (scriptContext) => {
            var stLoggerTitle = 'onRequest';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');


            try {
                var objRequest = scriptContext.request;
                var objResponse = scriptContext.response;
                var stEstimateId = objRequest.parameters.tranId;
                var objRecord = record.load({ type: 'vendorreturnauthorization', id: stEstimateId }); 
                var objFile = createReport(runtime, objRecord);
                objResponse.writeFile({file: objFile,isInline: true });

            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }



        function createReport(runtime, objRecord) {
            var stLoggerTitle = 'createReport';	
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');

            var stEstimatePDFTemplate = runtime.getCurrentScript().getParameter('custscript_vrapdftemplate');
			log.debug('stEstimatePDFTemplate', 'stEstimatePDFTemplate = ' + stEstimatePDFTemplate);
            var objFile = null;
            try
            {

                var stDomainName = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });
                log.debug(stLoggerTitle, 'stDomainName = ' + stDomainName);

                var stXML = file.load({
                    id : stEstimatePDFTemplate
                }).getContents();

                log.debug(stLoggerTitle, 'stXML = ' + stXML);

                var objPDFRenderer = render.create();
                objPDFRenderer.templateContent = stXML;

                objPDFRenderer.addRecord({
                    templateName : 'record',
                    record : objRecord
                });


                var stXMLContent = objPDFRenderer.renderAsString();

                objFile = render.xmlToPdf({
                    xmlString : stXMLContent
                });
                log.debug(stLoggerTitle, 'objFile = ' + JSON.stringify(objFile));

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });


            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return objFile;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        return {onRequest}
    });