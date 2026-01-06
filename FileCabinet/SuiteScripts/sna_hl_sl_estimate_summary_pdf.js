/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Latika Khatri
 *
 * Script brief description:
 *
 * Revision History:
 *
 * Date			Issue/Case		Author			Issue Fix Summary
 * =============================================================================================
 * 2022/01/27					Latika Khatri         Initial version
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

            try {
                var objRequest = scriptContext.request;
                log.debug("objRequest", objRequest);

                var objResponse = scriptContext.response;
                log.debug("objResponse", objResponse);

                var stEstimateId = objRequest.parameters.tranId;
                log.debug("stEstimateId", stEstimateId);

                // var stTranName = objRequest.parameters.tranName;
                // log.debug("stTranName",stTranName);

                var stTranName = 'Service Quote Summary';

                var objPrintData = {};

                var arrPrintData = [];

                var objRecord = record.load({ type: 'estimate', id: stEstimateId });
                var arrEstimate = searchEstimate(stEstimateId);
                log.debug("arrEstimate", arrEstimate);

                var objTaskCode = searchTaskCode(stEstimateId);
                log.debug("objTaskCode", objTaskCode);

                for (var i in objTaskCode) {
                    var arrFilteredEstimate = arrEstimate.filter(x => x.taskCode == objTaskCode[i].taskCode);
                    log.debug("arrFilteredEstimate ", arrFilteredEstimate);

                    if (arrFilteredEstimate.length > 0) {
                        arrPrintData.push({
                            taskCodeId: objTaskCode[i].taskCodeId,
                            taskCode: objTaskCode[i].taskCode,
                            taskCodeDesc: objTaskCode[i].description,
                            transactions: arrFilteredEstimate
                        });
                        log.debug("arrPrintData ", arrPrintData);

                    }

                }
                var objPrint = { data: [] };
                log.debug("objPrint", objPrint);

                objPrint.data = arrPrintData;
                log.debug("arrPrintData", arrPrintData);


                var objFile = createReport(runtime, objRecord, objPrint, stTranName);
                log.debug("objFile", objFile);

                objResponse.writeFile({ file: objFile, isInline: true });

            } catch (e) {
                log.debug("e", e);
            }
        }

        function searchEstimate(stEstimateId) {
            var arrFilters = [];
            var objData = {};
            var arrData = [];
            try {

                arrFilters.push(["internalid", "anyof", stEstimateId]);
                arrFilters.push("AND");
                arrFilters.push(["custcol_sna_hul_taskcode", "isnotempty", ""]);

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

                objEstimateSearch.run().each(function (result) {
                    objData = {

                        taskCode: result.getValue({ name: 'custcol_sna_hul_taskcode' }),
                        item: result.getValue({ name: 'item' }),
                        itemText: result.getText({ name: 'item' }),
                        description: result.getValue({ name: 'memo' }),
                        quantity: result.getValue({ name: 'quantity' }),
                        rate: result.getValue({ name: 'rate' }),
                        amount: result.getValue({ name: 'amount' }),
                    };


                    arrData.push(objData);

                    return true;

                });

            }
            catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });


            }

            return arrData;

        }

        function searchTaskCode(stEstimateId) {


            var objData = {};
            var arrFilters = [];


            if (!isEmpty(stEstimateId)) {
                arrFilters.push(["custrecord_tc_quoteestimateid", "anyof", stEstimateId]);

                try {
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

                    objTaskCodeSearch.run().each(function (result) {
                        // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));



                        objData[result.id] = {

                            taskCodeId: result.getValue({ name: 'id' }),
                            quoteId: result.getValue({ name: 'custrecord_tc_quoteestimateid' }),
                            taskCode: result.getValue({ name: 'custrecord_tc_taskcode' }),
                            description: result.getValue({ name: 'custrecord_tc_description' })

                        };
                        return true;

                    });


                }
                catch (err) {
                    log.audit({
                        title: err.name,
                        details: err.message
                    });

                    throw err;
                }
            }

            return objData;
        }
        function createReport(runtime, objRecord, objPrintData, stTranName) {

            // var stEstimatePDFTemplate = runtime.getCurrentScript().getParameter('custscript_param_estimatepdftemplate');
            // var stRightLogoURL = runtime.getCurrentScript().getParameter('custscript_param_rightlogourl');

            var objFile = null;
            try {

                var stDomainName = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });


                var stSubsidiary = objRecord.getValue({ fieldId: 'subsidiary' });
                if (!isEmpty(stSubsidiary)) {

                    var recSubsidiary = record.load({ type: 'subsidiary', id: stSubsidiary });
                    var stSubsidiaryLogoForms = recSubsidiary.getValue({ fieldId: 'logo' });

                    // if (!isEmpty(stSubsidiaryLogoForms)) {
                    //     var objLeftLogo = file.load({ id: stSubsidiaryLogoForms });
                    //     var stLeftLogoURL = objLeftLogo.url;
                    //     stLeftLogoURL = stLeftLogoURL.replace(/&/g, '&amp;');
                    // }

                    // if (!isEmpty(stRightLogoURL)) {
                    //     stRightLogoURL = stRightLogoURL.replace(/&/g, '&amp;');
                    // }


                }


                var stXML = file.load({
                    id: 2069
                }).getContents();

                var objPDFRenderer = render.create();
                objPDFRenderer.templateContent = stXML;

                objPDFRenderer.addRecord({
                    templateName: 'record',
                    record: objRecord
                });

                objPDFRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'lineData',
                    data: objPrintData
                });
                log.debug("objPDFRenderer", objPDFRenderer);

                // objPDFRenderer.templateContent = objPDFRenderer.templateContent.replace("{leftlogo}",
                //     isEmpty(stLeftLogoURL) ? '' : 'https://' + stDomainName + stLeftLogoURL);

                // objPDFRenderer.templateContent = objPDFRenderer.templateContent.replace("{rightlogo}",
                //     isEmpty(stRightLogoURL) ? '' : stRightLogoURL);

                // objPDFRenderer.templateContent = objPDFRenderer.templateContent.replace("{transactionname}",
                //     stTranName);


                var stXMLContent = objPDFRenderer.renderAsString();

                objFile = render.xmlToPdf({
                    xmlString: stXMLContent
                });

                // var objXMLPDF = objPDFRenderer.renderAsPdf();
                //
                // objXMLPDF.isOnline = true; //Available without login = true
                // var fileId = objXMLPDF.save();

            }
            catch (e) {
                log.debug("e", e);

            }

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

        return { onRequest }
    });