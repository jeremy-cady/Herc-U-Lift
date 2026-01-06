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
* 2022/03/11						            natoretiro      	Initial version
*
*/


/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */


define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/render'],
    /**
     * @param{file} file
     * @param{format} format
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, format, record, runtime, search, serverWidget, url, render) => {
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


            try {
                var objRequest = scriptContext.request;
                var objResponse = scriptContext.response;

                var stEstimateId = objRequest.parameters.tranId;
                var stTranName = objRequest.parameters.tranName;
                var objPrintData = {};

                var arrPrintData = [];

                var objRecord = record.load({ type: 'estimate', id: stEstimateId }); // change this to actual estimate id
                var arrEstimate = searchEstimate(stEstimateId);
                log.debug(stLoggerTitle, 'arrEstimate = ' + JSON.stringify(arrEstimate));
                var objTaskCode = searchTaskCode(stEstimateId)
                log.debug(stLoggerTitle, 'objTaskCode = ' + JSON.stringify(objTaskCode));

                for(var i in objTaskCode)
                {
                    var arrFilteredEstimate = arrEstimate.filter(x => x.taskCode == objTaskCode[i].taskCode);
                    log.debug(stLoggerTitle, 'arrFilteredEstimate = ' + JSON.stringify(arrFilteredEstimate));

                    if(arrFilteredEstimate.length > 0)
                    {
                        arrPrintData.push({
                            taskCodeId : objTaskCode[i].taskCodeId,
                            taskCode : objTaskCode[i].taskCode,
                            taskCodeDesc: objTaskCode[i].description,
                            transactions: arrFilteredEstimate
                        });
                    }


                }
                log.debug(stLoggerTitle, 'arrPrintData = ' + JSON.stringify(arrPrintData));

                var objPrint = { data: [] };
                objPrint.data = arrPrintData;

                log.debug(stLoggerTitle, 'objPrint = ' + JSON.stringify(objPrint));

                var objFile = createReport(runtime, objRecord, objPrint, stTranName);

                // var objFile = file.load({ id: stFileId });

                objResponse.writeFile({    file: objFile,    isInline: true });

            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }


        function searchEstimate(stEstimateId) {
            var stLoggerTitle = 'searchEstimate';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');
            var arrFilters = [];
            var objData = {};
            var arrData = [];
            try
            {

                arrFilters.push(["internalid","anyof",stEstimateId]);
                arrFilters.push("AND");
                arrFilters.push(["custcol_sna_hul_taskcode","isnotempty",""]);

                var objEstimateSearch = search.create({
                    type: "transaction",
                    filters: arrFilters,
                    columns:
                        [
                            search.createColumn({
                                name: "custcol_sna_hul_taskcode",
                                sort: search.Sort.ASC
                            }),
                            "item",
                            "memo",
                            "quantity",
                            "rate",
                            "custbody_fam_specdeprjrn_rate",
                            "amount"
                        ]
                });

                var searchResultCount = objEstimateSearch.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                objEstimateSearch.run().each(function(result) {
                    // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));



                    objData = {

                        taskCode: result.getValue({ name: 'custcol_sna_hul_taskcode'}),
                        item: result.getValue({ name: 'item'}),
                        itemText: result.getText({ name: 'item'}),
                        description: result.getValue({ name: 'memo'}),
                        quantity: result.getValue({ name: 'quantity'}),
                        rate: result.getValue({ name: 'rate'}),
                        amount: result.getValue({ name: 'amount'}),
                    };


                    arrData.push(objData);

                    return true;

                });

            }
            catch(e)
            {
                log.audit({
                    title: e.name,
                    details: e.message
                });


            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return arrData;

        }

        function searchTaskCode(stEstimateId)
        {
            var stLoggerTitle = 'searchTaskCode';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            log.debug(stLoggerTitle, 'stEstimateId = ' + stEstimateId);

            var objData = {};
            var arrFilters = [];


            if(!isEmpty(stEstimateId))
            {
                arrFilters.push(["custrecord_tc_quoteestimateid","anyof",stEstimateId]);

                try
                {
                    var objTaskCodeSearch = search.create({
                        type: "customrecord_quotetaskcodes",
                        filters: arrFilters,
                        columns:
                            [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC
                                }),
                                "custrecord_tc_quoteestimateid",
                                "custrecord_tc_taskcode",
                                "custrecord_tc_description"
                            ]
                    });

                    var searchResultCount = objTaskCodeSearch.runPaged().count;
                    log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                    objTaskCodeSearch.run().each(function(result) {
                        // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));



                        objData[result.id] = {

                            taskCodeId: result.getValue({ name: 'id'}),
                            quoteId: result.getValue({ name: 'custrecord_tc_quoteestimateid'}),
                            taskCode: result.getValue({ name: 'custrecord_tc_taskcode'}),
                            description: result.getValue({ name: 'custrecord_tc_description'})

                        };



                        return true;

                    });


                }
                catch(err)
                {
                    log.audit({
                        title: err.name,
                        details: err.message
                    });

                    throw err;
                }
            }


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return objData;
        }


        function createReport(runtime, objRecord, objPrintData, stTranName) {
            var stLoggerTitle = 'createReport';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');

            var stEstimatePDFTemplate = runtime.getCurrentScript().getParameter('custscript_param_estimatepdftemplate');
            // file internal ID = 2090
            log.debug(stLoggerTitle, 'stEstimatePDFTemplate = ' + stEstimatePDFTemplate);
            var stRightLogoURL = runtime.getCurrentScript().getParameter('custscript_param_rightlogourl');
            var objFile = null;
            try
            {

                var stDomainName = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });
                log.debug(stLoggerTitle, 'stDomainName = ' + stDomainName);


                var stSubsidiary = objRecord.getValue({ fieldId: 'subsidiary' });
                if(!isEmpty(stSubsidiary))
                {

                    var recSubsidiary = record.load({ type: 'subsidiary', id: stSubsidiary });
                    var stSubsidiaryLogoForms = recSubsidiary.getValue({ fieldId: 'logo' });

                    if(!isEmpty(stSubsidiaryLogoForms))
                    {
                        var objLeftLogo = file.load({ id: stSubsidiaryLogoForms });
                        log.debug(stLoggerTitle, 'objLeftLogo = ' + JSON.stringify(objLeftLogo));
                        var stLeftLogoURL = objLeftLogo.url;
                        stLeftLogoURL = stLeftLogoURL.replace(/&/g, '&amp;');
                        log.debug(stLoggerTitle, 'stLeftLogoURL = ' + stLeftLogoURL);
                    }

                    if(!isEmpty(stRightLogoURL))
                    {
                        stRightLogoURL = stRightLogoURL.replace(/&/g, '&amp;');
                        log.debug(stLoggerTitle, 'stRightLogoURL = ' + stRightLogoURL);
                    }


                }


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



                objPDFRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'lineData',
                    data: objPrintData
                });

                log.debug(stLoggerTitle, 'stLeftLogoURL = ' + stLeftLogoURL);
                objPDFRenderer.templateContent = objPDFRenderer.templateContent.replace("{leftlogo}",
                    isEmpty(stLeftLogoURL) ? '' : 'https://' + stDomainName + stLeftLogoURL );

                objPDFRenderer.templateContent = objPDFRenderer.templateContent.replace("{rightlogo}",
                    isEmpty(stRightLogoURL) ? '' : stRightLogoURL );

                objPDFRenderer.templateContent = objPDFRenderer.templateContent.replace("{transactionname}",
                    stTranName);


                var stXMLContent = objPDFRenderer.renderAsString();

                objFile = render.xmlToPdf({
                    xmlString : stXMLContent
                });
                log.debug(stLoggerTitle, 'objFile = ' + JSON.stringify(objFile));

                // var objXMLPDF = objPDFRenderer.renderAsPdf();
                //
                // objXMLPDF.isOnline = true; //Available without login = true
                // var fileId = objXMLPDF.save();

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