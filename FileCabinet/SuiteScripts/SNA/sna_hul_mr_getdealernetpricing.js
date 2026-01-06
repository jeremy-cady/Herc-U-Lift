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
* 2022/09/13						            natoretiro      	Initial version
* 2023/05/18                                    nretiro             Added line to set For Approval checkbox to true if needed
* 
*/

/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 *@NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/format', 'N/error', 'N/cache', 'N/email', 'N/url', 'N/https', 'N/file', 'N/encode'],

    function (runtime, record, search, format, error,  cache, email, url,https, file, encode) {


        function getInputData(context) {
            var stLoggerTitle = 'execute';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                var objVPSearch = searchVendorPrice(false);
                log.debug(stLoggerTitle, 'objVPSearch = ' + JSON.stringify(objVPSearch));



            } catch (err) {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
            return objVPSearch;
        }

        function map(context) {
            var stLoggerTitle = 'map';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                log.debug(stLoggerTitle, 'context = ' + JSON.stringify(context));

                var obj = context.value;


                context.write({key: context.key, value: obj});

            } catch (err) {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function reduce(context) {
            var stLoggerTitle = 'reduce';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var DEALERNET_DOMAIN = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetdomain' });
            var DEALERNET_KEY = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealerkey' });
            var DEALERNET_REQUESTACCESSKEYURL = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetaccesstokenurl' });
            var DEALERNET_PRICETHRESHOLD = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetpricethreshold' });
            var DEALERNET_CODE = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetcode' });

            var ARR_REMARKS = [];
            var stItem_txt = '';
            try {
                log.debug(stLoggerTitle, 'context.value = ' + JSON.stringify(context.values));

                var objVPRec = record.load({ type: 'customrecord_sna_hul_vendorprice', id: context.key });

                log.debug(stLoggerTitle, 'objVPRec = ' + JSON.stringify(objVPRec));

                var flPurchPriceC = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_itempurchaseprice' }) || 0;
                var flListPriceC = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_listprice' }) || 0;
                var flContractPriceC = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_contractprice' }) || 0;

                flPurchPriceC = isNaN(flPurchPriceC) ? 0 : parseFloat(flPurchPriceC);
                flListPriceC = isNaN(flListPriceC) ? 0 : parseFloat(flListPriceC);
                flContractPriceC = isNaN(flContractPriceC) ? 0 : parseFloat(flContractPriceC);
                log.debug(stLoggerTitle, 'flPurchPriceC = ' + flPurchPriceC +  ' | flListPriceC = ' + flListPriceC + ' | flContractPriceC = ' + flContractPriceC);

                var flPurchPriceD = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_t_itempurchaseprice' }) || 0;
                var flListPriceD = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_t_listprice' }) || 0;
                var flContractPriceD = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_t_contractprice' }) || 0;

                flPurchPriceD = isNaN(flPurchPriceD) == true ? 0 : parseFloat(flPurchPriceD);
                flListPriceD = isNaN(flListPriceD) == true ? 0 : parseFloat(flListPriceD);
                flContractPriceD = isNaN(flContractPriceD) == true ? 0 : parseFloat(flContractPriceD);
                log.debug(stLoggerTitle, 'flPurchPriceD = ' + flPurchPriceD +  ' | flListPriceD = ' + flListPriceD + ' | flContractPriceD = ' + flContractPriceD);

                var flPurchPriceDD = flPurchPriceC + (flPurchPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                var flListPriceDD = flListPriceC + (flListPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                var flContractPriceDD = flContractPriceC + (flContractPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                log.debug(stLoggerTitle, 'flPurchPriceDD = ' + flPurchPriceDD +  ' | flListPriceDD = ' + flListPriceDD + ' | flContractPriceDD = ' + flContractPriceDD);



                var flPurchPriceDDN = flPurchPriceC - (flPurchPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                var flListPriceDDN = flListPriceC - (flListPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                var flContractPriceDDN = flContractPriceC - (flContractPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                log.debug(stLoggerTitle, 'flPurchPriceDDN = ' + flPurchPriceDDN +  ' | flListPriceDDN = ' + flListPriceDDN + ' | flContractPriceDDN = ' + flContractPriceDDN);


                // get Item, Vendor, Vendor Item Number
                var stItem_id = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_item' });
                stItem_txt = objVPRec.getText({ fieldId: 'custrecord_sna_hul_item' });
                log.debug(stLoggerTitle, 'stItem_id = ' + stItem_id + ' | stItem_txt = ' + stItem_txt);

                var stVendor_id = objVPRec.getValue({ fieldId: 'custrecord_sna_hul_vendor' });
                var stVendor_txt = objVPRec.getText({ fieldId: 'custrecord_sna_hul_vendor' });
                log.debug(stLoggerTitle, 'stVendor_id = ' + stVendor_id + ' | stVendor_txt = ' + stVendor_txt);

                var stVendorItemNumber_id = objVPRec.getValue({ fieldId: 'custrecordsna_hul_vendoritemnumber' });
                var stVendorItemNumber_txt = objVPRec.getText({ fieldId: 'custrecordsna_hul_vendoritemnumber' });
                log.debug(stLoggerTitle, 'stVendorItemNumber_id = ' + stVendorItemNumber_id + ' | stVendorItemNumber_txt = ' + stVendorItemNumber_txt);


                //request access token
                log.debug(stLoggerTitle,
                    'DEALERNET_DOMAIN = ' + DEALERNET_DOMAIN +
                    ' | DEALERNET_KEY = ' + DEALERNET_KEY +
                    ' | DEALERNET_REQUESTACCESSKEYURL = ' +DEALERNET_REQUESTACCESSKEYURL +
                    ' | DEALERNET_CODE = ' +DEALERNET_CODE);

                var headers = {
                    'Authorization': "Basic " + DEALERNET_KEY,
                    'Content-Type': 'application/json'

                };

                var objResponse = https.get({
                    url: DEALERNET_REQUESTACCESSKEYURL,
                    headers: headers
                });
                log.debug(stLoggerTitle, 'objResponse 1 = ' + JSON.stringify(objResponse));

                var RESPONSE_CODE = objResponse.code;
                var RESPONSE_BODY = JSON.parse(objResponse.body);
                var stToken = RESPONSE_BODY.Token;

                if(RESPONSE_CODE == 200) {
                    log.debug(stLoggerTitle, 'stToken = ' + stToken);

                    // call dealernet part details
                    headers = {
                        'Authorization': "Bearer " + stToken,
                        'Content-Type': 'application/json'

                    };

                    var stAPI_URL = DEALERNET_DOMAIN + '/V1/Parts/GetPartDetailsByOemPartCode';
                    stAPI_URL += '?oemPartCode=' + stVendorItemNumber_id;
                    stAPI_URL += '&dealerCode=' + DEALERNET_CODE;
                    stAPI_URL += '&externalStockSourceType=Dealer';
                    log.debug(stLoggerTitle, 'stAPI_URL = ' + stAPI_URL);

                    var objResponse = https.get({
                        url: stAPI_URL,
                        headers: headers
                    });
                    log.debug(stLoggerTitle, 'objResponse 2 = ' + JSON.stringify(objResponse));

                    var RESPONSE_CODE = objResponse.code;
                    var RESPONSE_BODY = JSON.parse(objResponse.body);
                    // var stToken = RESPONSE_BODY.Token;



                    if(RESPONSE_CODE == 200)
                    {

                        RESPONSE_BODY = JSON.parse(objResponse.body);
                        log.debug(stLoggerTitle, 'objResponse.body = ' + JSON.stringify(objResponse.body));

                        if (!isEmpty(RESPONSE_BODY))
                        {
                            var bIsSuperseded = RESPONSE_BODY.IsSuperseded;

                            if(bIsSuperseded == false)
                            {
                                log.debug(stLoggerTitle, 'Populating Vendor Price fields from DealerNet...');
                                objVPRec.setValue({fieldId: 'custrecord_sna_hul_issynced', value: true});

                                objVPRec.setValue({
                                    fieldId: 'custrecord_sna_hul_t_itempurchaseprice',
                                    value: parseFloat(RESPONSE_BODY.DealerNetPrice)
                                });
                                objVPRec.setValue({
                                    fieldId: 'custrecord_sna_hul_t_listprice',
                                    value: parseFloat(RESPONSE_BODY.FleetListPrice)
                                });
                                objVPRec.setValue({
                                    fieldId: 'custrecord_sna_hul_t_contractprice',
                                    value: parseFloat(RESPONSE_BODY.ContractPrice)
                                });
                                objVPRec.setValue({
                                    fieldId: 'custrecord_sna_hul_t_qtybreakprices',
                                    value: JSON.stringify(RESPONSE_BODY.QuantityBreakPrices)
                                });

                                // objVPRec.setValue({
                                //     fieldId: 'custrecord_sna_hul_remarks',
                                //     value: ''
                                // });

                                log.debug(stLoggerTitle, parseFloat(RESPONSE_BODY.DealerNetPrice) > parseFloat(flPurchPriceDDN) && parseFloat(RESPONSE_BODY.DealerNetPrice) < parseFloat(flPurchPriceDD));
                                if (parseFloat(RESPONSE_BODY.DealerNetPrice) > parseFloat(flPurchPriceDDN) && parseFloat(RESPONSE_BODY.DealerNetPrice) < parseFloat(flPurchPriceDD)) {
                                    objVPRec.setValue({
                                        fieldId: 'custrecord_sna_hul_itempurchaseprice',
                                        value: RESPONSE_BODY.DealerNetPrice
                                    });

                                    if(ARR_REMARKS[0] !== undefined)
                                    {
                                        ARR_REMARKS = ARR_REMARKS.splice(0,1);
                                        objVPRec.setValue({
                                            fieldId: 'custrecord_sna_hul_remarks',
                                            value: ARR_REMARKS.toString()
                                        });
                                    }

                                }
                                else
                                {
                                    log.debug(stLoggerTitle, 'DealerNetPrice | Vendor Price needs approval...');
                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: false });

                                    ARR_REMARKS[0] = 'Purchase Price found is over the defined threshold (' + DEALERNET_PRICETHRESHOLD + '%)';
                                    log.debug(stLoggerTitle, 'ARR_REMARKS = ' + ARR_REMARKS.toString());
                                    objVPRec.setValue({
                                        fieldId: 'custrecord_sna_hul_remarks',
                                        value: ARR_REMARKS.toString()
                                    });
                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: false });
                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: true });
                                }

                                log.debug(stLoggerTitle, parseFloat(RESPONSE_BODY.FleetListPrice) > parseFloat(flListPriceDDN) && parseFloat(RESPONSE_BODY.FleetListPrice) < parseFloat(flListPriceDD));
                                if (parseFloat(RESPONSE_BODY.FleetListPrice) > parseFloat(flListPriceDDN) && parseFloat(RESPONSE_BODY.FleetListPrice) < parseFloat(flListPriceDD)) {
                                    objVPRec.setValue({
                                        fieldId: 'custrecord_sna_hul_listprice',
                                        value: RESPONSE_BODY.FleetListPrice
                                    });

                                    if(ARR_REMARKS[1] !== undefined) {
                                        ARR_REMARKS = ARR_REMARKS.splice(1, 1);
                                        objVPRec.setValue({
                                            fieldId: 'custrecord_sna_hul_remarks',
                                            value: ARR_REMARKS.toString()
                                        });
                                    }
                                }
                                else
                                {
                                    log.debug(stLoggerTitle, 'FleetListPrice | Vendor Price needs approval...');

                                    ARR_REMARKS[1] = 'Fleet List Price found is over the defined threshold (' + DEALERNET_PRICETHRESHOLD + '%)';
                                    log.debug(stLoggerTitle, 'ARR_REMARKS = ' + ARR_REMARKS.toString());
                                    objVPRec.setValue({
                                        fieldId: 'custrecord_sna_hul_remarks',
                                        value: ARR_REMARKS.toString()
                                    });


                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: false });
                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: true });
                                }

                                log.debug(stLoggerTitle, parseFloat(RESPONSE_BODY.ContractPrice) > parseFloat(flContractPriceDDN) && parseFloat(RESPONSE_BODY.ContractPrice) < parseFloat(flContractPriceDD));
                                if (parseFloat(RESPONSE_BODY.ContractPrice) > parseFloat(flContractPriceDDN) && parseFloat(RESPONSE_BODY.ContractPrice) < parseFloat(flContractPriceDD)) {
                                    objVPRec.setValue({
                                        fieldId: 'custrecord_sna_hul_contractprice',
                                        value: RESPONSE_BODY.ContractPrice
                                    });

                                    if(ARR_REMARKS[2] !== undefined) {
                                        ARR_REMARKS = ARR_REMARKS.splice(2, 1);
                                        objVPRec.setValue({
                                            fieldId: 'custrecord_sna_hul_remarks',
                                            value: ARR_REMARKS.toString()
                                        });
                                    }
                                }
                                else
                                {

                                    log.debug(stLoggerTitle, 'ContractPrice | Vendor Price needs approval...');
                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: false });

                                    ARR_REMARKS[2] = 'Contract Price found is over the defined threshold (' + DEALERNET_PRICETHRESHOLD + '%)';
                                    log.debug(stLoggerTitle, 'ARR_REMARKS = ' + ARR_REMARKS.toString());
                                    objVPRec.setValue({
                                        fieldId: 'custrecord_sna_hul_remarks',
                                        value: ARR_REMARKS.toString()
                                    });hhmm
                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: false });
                                    objVPRec.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: true });
                                }

                                // objVPRec.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: true });
                                // objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_qtybreakprices', value: JSON.stringify(RESPONSE_BODY.QuantityBreakPrices) });


                                var stVendorPriceId = objVPRec.save();
                                log.debug(stLoggerTitle, 'MATCH | stVendorPriceId = ' + stVendorPriceId);
                            }
                            else
                            {
                                objVPRec.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: false });
                                objVPRec.setValue({fieldId: 'custrecord_sna_hul_issynced', value: false});
                                objVPRec.setValue({fieldId: 'custrecord_sna_hul_remarks', value: 'Item [' + stItem_txt + '] is Superseded.'});

                                var stVendorPriceId = objVPRec.save();
                                log.debug(stLoggerTitle, 'SUPERSEDED | stVendorPriceId = ' + stVendorPriceId);
                            }




                        } else {
                            objVPRec.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: false });
                            objVPRec.setValue({fieldId: 'custrecord_sna_hul_issynced', value: false});
                            objVPRec.setValue({fieldId: 'custrecord_sna_hul_remarks', value: 'Item [' + stItem_txt + '] has no match.'});

                            var stVendorPriceId = objVPRec.save();
                            log.debug(stLoggerTitle, 'NO MATCH | stVendorPriceId = ' + stVendorPriceId);
                        }

                    } else {
                        log.audit(stLoggerTitle, 'RESPONSE_CODE = ' + RESPONSE_CODE);

                        objVPRec.setValue({ fieldId: 'custrecord_sna_hul_forapproval', value: false });
                        objVPRec.setValue({fieldId: 'custrecord_sna_hul_issynced', value: false});
                        objVPRec.setValue({fieldId: 'custrecord_sna_hul_remarks', value: 'RESPONSE_CODE : ' + RESPONSE_CODE});

                        var stVendorPriceId = objVPRec.save();
                        log.debug(stLoggerTitle, 'NO MATCH | stVendorPriceId = ' + stVendorPriceId);
                    }





                }





            } catch (err) {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                objVPRec.setValue({fieldId: 'custrecord_sna_hul_issynced', value: false});
                objVPRec.setValue({fieldId: 'custrecord_sna_hul_remarks', value: 'Item [' + stItem_txt + '] has no match.' });

                var stVendorPriceId = objVPRec.save();
                log.debug(stLoggerTitle, 'NO MATCH | stVendorPriceId = ' + stVendorPriceId);

            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function summarize(summary) {
            var stLoggerTitle = 'summarize';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            var objScript = runtime.getCurrentScript();
            var stDefAuthor = objScript.getParameter('custscript_param_defaultemailauthor');
            var stDefRecipient = objScript.getParameter('custscript_param_defaultemailrecipient');
            var arrDefRecipient = stDefRecipient.split(',');

            try {
                log.debug(stLoggerTitle, 'summary = ' + JSON.stringify(summary));

                var objNotSynched = searchVendorPrice(true);
                var stContent = '';

                stContent = '<p>Please see attached excel file for the Vendor Price List with no matching data in DealerNet.</p>';


                // var objExport = exportXLSFile(objNotSynched, stDefAuthor, stDefRecipient);

                var objExport = exportCSVFile(objNotSynched, stDefAuthor, stDefRecipient);

                email.send({
                    author: stDefAuthor,
                    recipients: arrDefRecipient,
                    subject: 'List of Unmatched Vendor Prices in DealerNet',
                    body: stContent,
                    attachments: [objExport]

                });





            } catch (err) {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }


        function exportXLSFile(data, stDefAuthor, stDefRecipient )
        {

            var stLoggerTitle = 'exportXLSFile';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');


            var fileObj = {};
            var fileId = '';


            try
            {



                var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
                xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
                xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
                xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
                xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
                xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

                xmlStr += '<Styles>';
                xmlStr += '<Style ss:ID="font-align-center">'
                xmlStr += '<Alignment ss:Horizontal="Center" ss:Vertical="Center"/>';
                xmlStr += '<Borders>';
                xmlStr += '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
                xmlStr += '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>';
                xmlStr += '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>';
                xmlStr += '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>';
                xmlStr += '</Borders>';
                xmlStr += '</Style>';
                xmlStr += '<ss:Style ss:ID="font-weight-bold">';
                xmlStr += '<ss:Font ss:Bold="1"/>';
                xmlStr += '</ss:Style>';
                xmlStr += '</Styles>';

                xmlStr += '<Worksheet ss:Name="Sheet1">';
                xmlStr += '<Table>';
                xmlStr += '<ss:Column ss:Width="150" ss:AutoFitWidth="1"/>';
                xmlStr += '<ss:Column ss:Width="250" ss:AutoFitWidth="1"/>';
                xmlStr += '<ss:Column ss:Width="300" ss:AutoFitWidth="1"/>';


                // outputFile('data.txt', data);

                xmlStr += '<Row ss:StyleID="font-weight-bold">';
                xmlStr += '<Cell ss:StyleID="font-align-center"><Data ss:Type="String"><html:B>Vendor Price Id</html:B></Data></Cell>';
                xmlStr += '<Cell ss:StyleID="font-align-center"><Data ss:Type="String"><html:B>Item</html:B></Data></Cell>';
                xmlStr += '<Cell ss:StyleID="font-align-center"><Data ss:Type="String"><html:B>Reason</html:B></Data></Cell>';
                xmlStr += '</Row>';


                for(var i in data)
                {
                    xmlStr += '<Row ss:StyleID="font-weight-bold">';
                    xmlStr += '<Cell ss:StyleID="font-align-center"><Data ss:Type="String">' + i + '</Data></Cell>';
                    xmlStr += '<Cell ss:StyleID="font-align-center"><Data ss:Type="String">' + data[i].itemTxt + '</Data></Cell>';
                    xmlStr += '<Cell ss:StyleID="font-align-center"><Data ss:Type="String">' + data[i].remarks + '</Data></Cell>';
                    xmlStr += '</Row>';

                }

                xmlStr += '</Table></Worksheet></Workbook>';

                var strXmlEncoded = encode.convert({
                    string : xmlStr,
                    inputEncoding : encode.Encoding.UTF_8,
                    outputEncoding : encode.Encoding.BASE_64
                });



                var fileObj = file.create({
                    name : 'dataToExport_' +  Date.now() + '.xls',
                    fileType : file.Type.EXCEL,
                    contents : strXmlEncoded,
                    // folder	:	stTempFolder
                });

                // fileId = fileObj.save();

            }
            catch(e)
            {


                log.audit(stLoggerTitle, 'e = ' + JSON.stringify(e));

                email.send({
                    author: stDefAuthor,
                    recipients: stDefRecipient,
                    subject: 'XLS EXPORT ERROR',
                    body: 'Hi, Export to XLS encountered an issue. <br> ' + JSON.stringify(e),
                    attachments: [outputFile('data.txt', data)]
                });

            }





            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return fileObj;
        }


        function exportCSVFile(data, stDefAuthor, stDefRecipient )
        {

            var stLoggerTitle = 'exportCSVFile';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');


            var fileObj = {};
            var fileId = '';


            try
            {



                var strCSV = 'Vendor Price Id,Item,Reason\n';

                for(var i in data)
                {
                    strCSV += i +',' + data[i].itemTxt + ',' + data[i].remarks + '\n';


                }



                // var strXmlEncoded = encode.convert({
                //     string : strCSV,
                //     inputEncoding : encode.Encoding.UTF_8,
                //     outputEncoding : encode.Encoding.BASE_64
                // });



                var fileObj = file.create({
                    name : 'dataToExport_' +  Date.now() + '.csv',
                    fileType : file.Type.CSV,
                    contents : strCSV,
                    encoding: file.Encoding.UTF8,
                    // folder	:	stTempFolder
                });

                // fileId = fileObj.save();

            }
            catch(e)
            {


                log.audit(stLoggerTitle, 'e = ' + JSON.stringify(e));

                email.send({
                    author: stDefAuthor,
                    recipients: stDefRecipient,
                    subject: 'CSV EXPORT ERROR',
                    body: 'Hi, Export to CSV encountered an issue. <br> ' + JSON.stringify(e),
                    attachments: [outputFile('data.txt', data)]
                });

            }





            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return fileObj;
        }



        function outputFile(fileName, data)
        {
            var stLoggerTitle = 'outputFile';
            var fileObj = {};
            var fileId = null;

            //this is to hold data in text file. this is only to verify data integrity only. this can be removed anytime
            try
            {
                if (data instanceof Array) {
                    data = data.toString();
                }
                else if(data instanceof Object)
                {
                    data = JSON.stringify(data);
                }

                fileObj = file.load({
                    id: fileName
                });

                fileObj.contents = data;
                fileId = fileObj.save();
            }
            catch(e)
            {
                fileObj = file.create({
                    name: fileName,
                    fileType: file.Type.PLAINTEXT,
                    contents: data,
                    description: 'This is a plain text file of ' + fileName,
                    encoding: file.Encoding.UTF8,
                    // folder: stTempFolder	//set this as script parameter
                });
                fileId = fileObj.save();
            }

            log.audit(stLoggerTitle, 'fileId = ' + fileId);

            return fileObj;
        }

        function searchVendorPrice(bGetNotSynchedVP)
        {
            var stLoggerTitle = 'searchVendorPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');


            try
            {
                var stVendorPriceId = runtime.getCurrentScript().getParameter({ name: 'custscript_param_vendorpriceid' });
                var arrVendorPriceId = [];

                var objData = {};
                var arrFilters = [];

                if(!isEmpty(stVendorPriceId))
                {

                    arrVendorPriceId = stVendorPriceId.split(',');

                    arrFilters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: arrVendorPriceId
                    }));

                }




                arrFilters.push(search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: 'F'
                }));

                arrFilters.push(search.createFilter({
                    name: 'custrecordsna_hul_vendoritemnumber',
                    operator: search.Operator.ISNOTEMPTY,
                    values: ''
                }));

                arrFilters.push(search.createFilter({
                    name: 'islotitem',
                    join: 'custrecord_sna_hul_item',
                    operator: search.Operator.IS,
                    values: 'F'
                }));

                log.debug(stLoggerTitle, 'bGetNotSynchedVP = ' + bGetNotSynchedVP);
                if(bGetNotSynchedVP)
                {

                    arrFilters.push(search.createFilter({
                        name: 'custrecord_sna_hul_issynced',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));
                }

                var arrColumns = [
                    "custrecord_sna_hul_item",
                    "custrecord_sna_hul_vendor",
                    "custrecordsna_hul_vendoritemnumber",
                    "custrecord_sna_hul_primaryvendor",
                    "custrecord_sna_hul_itempurchaseprice",
                    "custrecord_sna_hul_listprice",
                    "custrecord_sna_hul_t_itempurchaseprice",
                    "custrecord_sna_hul_t_listprice",
                    "custrecord_sna_hul_t_contractprice",
                    "custrecord_sna_hul_remarks"

                ];

                var objParam = {};
                objParam.recordType = 'customrecord_sna_hul_vendorprice';
                objParam.searchId =  null;
                objParam.searchFilters = arrFilters;
                objParam.searchColumns = arrColumns;
                objParam.isPaged = false;
                objParam.linesToShow = 0;
                var arrVendorPriceSearch = searchVendorPriceMax(objParam);
                log.debug(stLoggerTitle, 'arrVendorPriceSearch = ' + JSON.stringify(arrVendorPriceSearch));
                log.audit(stLoggerTitle, 'arrVendorPriceSearch.length = ' + arrVendorPriceSearch.length);

                for(var i = 0; i < arrVendorPriceSearch.length; i++)
                {
                    objData[arrVendorPriceSearch[i].id] = {

                        item: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_item'}),
                        itemTxt: arrVendorPriceSearch[i].getText({ name: 'custrecord_sna_hul_item'}),
                        vendor: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_vendor'}),
                        vendorTxt: arrVendorPriceSearch[i].getText({ name: 'custrecord_sna_hul_vendor'}),
                        vendorItemNumber: arrVendorPriceSearch[i].getValue({ name: 'custrecordsna_hul_vendoritemnumber'}),
                        itemPurchasePrice: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_itempurchaseprice'}),
                        listPrice: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_listprice'}),
                        purchPriceD: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_t_itempurchaseprice'}),
                        listPriceD: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_t_listprice'}),
                        contractPriceD: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_t_contractprice'}),
                        remarks: arrVendorPriceSearch[i].getValue({ name: 'custrecord_sna_hul_remarks'})
                    };

                }




            }
            catch(err)
            {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;
            }



            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return objData;
        }


        // function searchVendorPriceMax(stRecordType, stSearchId, arrSearchFilter, arrSearchColumn, isPaged, intLinesToShow)

        /**
         * Get all of the results from the search even if the results are more than 1000.
         * @param {String} recordType - the record type where the search will be executed.
         * @param {String} searchId - the search id of the saved search that will be used.
         * @param {nlobjSearchFilter[]} arrSearchFilter - array of nlobjSearchFilter objects. The search filters to be used or will be added to the saved search if search id was passed.
         * @param {nlobjSearchColumn[]} arrSearchColumn - array of nlobjSearchColumn objects. The columns to be returned or will be added to the saved search if search id was passed.
         * @param {boolean} isPaged - determines if we are going to do a paged search
         * @param {boolean} linesToShow - determines how many lines are we going to show per page
         * @returns {nlobjSearchResult[]} - an array of nlobjSearchResult objects
         *
         */
        function searchVendorPriceMax(objParam)
        {
            var stLoggerTitle = 'searchVendorPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            log.debug(stLoggerTitle, 'objParam = ' + JSON.stringify(objParam));

            if (objParam.recordType == null && objParam.searchId == null)
            {
                error.create(
                    {
                        name : 'SSS_MISSING_REQD_ARGUMENT',
                        message : 'search: Missing a required argument. Either recordType or searchId should be provided.',
                        notifyOff : false
                    });
            }


            var arrReturnSearchResults = new Array();
            var objSavedSearch;

            var maxResults = 1000;

            if (objParam.searchId != null)
            {
                objSavedSearch = search.load(
                    {
                        id : objParam.searchId
                    });

                // add search filter if one is passed
                if (objParam.searchFilters != null)
                {
                    objSavedSearch.filters = objSavedSearch.filters.concat(objParam.searchFilters);
                }

                // add search column if one is passed
                if (objParam.searchColumns != null)
                {
                    objSavedSearch.columns = objSavedSearch.columns.concat(objParam.searchColumns);
                }
            }
            else
            {
                objSavedSearch = search.create(
                    {
                        type : objParam.recordType
                    });

                // add search filter if one is passed
                if (objParam.searchFilters != null)
                {

                    objSavedSearch.filters = objParam.searchFilters;
                }

                // add search column if one is passed
                if (objParam.searchColumns != null)
                {
                    objSavedSearch.columns = objParam.searchColumns;
                }
            }

            var objResultset = {};

            if(objParam.isPaged && objParam.linesToShow)
            {
                objResultset = objSavedSearch.runPaged({
                    pageSize: objParam.linesToShow
                });

                return objResultset;
            }


            objResultset = objSavedSearch.run();
            var intSearchIndex = 0;
            var arrResultSlice = null;
            do
            {
                arrResultSlice = objResultset.getRange(intSearchIndex, intSearchIndex + maxResults);
                // arrResultSlice = objResultset.getRange(intSearchIndex, 500);
                if (arrResultSlice == null)
                {
                    break;
                }

                arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
                intSearchIndex = arrReturnSearchResults.length;
            }
            while (arrResultSlice.length >= maxResults);

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return arrReturnSearchResults;
        };


        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });