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
* 2022/07/20						            natoretiro      	Initial version
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

                log.debug(stLoggerTitle, 'objRequest = ' + JSON.stringify(objRequest));

                // var stTransactionId = objRequest.parameters.param_id;
                // var stTransactionType = objRequest.parameters.param_type;
                //
                // log.debug(stLoggerTitle, 'stTransactionId = ' + stTransactionId + ' | stTransactionType = ' + stTransactionType);

                var stLiftNetURL = runtime.getCurrentScript().getParameter({name: 'custscript_param_liftneturl' } );
                var form = serverWidget.createForm({
                    title: 'Send To LiftNet',
                    hideNavbar: false
                });

                form = createForm(form, objRequest, stLiftNetURL);


                form.clientScriptModulePath = './sna_hul_cs_sendtoliftnet.js';


                // var objOpportunity = searchOpportunity(stTransactionId);
                // log.debug(stLoggerTitle, 'objOpportunity = ' + JSON.stringify(objOpportunity));
                //
                // var stXML = generateXML(objOpportunity);
                // log.debug(stLoggerTitle, 'stXML = ' + stXML);
                //
                // // create update portal quote here

                objResponse.writePage(form);


            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        function createForm(form, objRequest, stLiftNetURL) {
            var stLoggerTitle = 'createForm';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');

            var stQuoteId = objRequest.parameters.quote_id;
            var stTransactionId = objRequest.parameters.param_id;
            var stEstimateId = objRequest.parameters.estimate_id;

            var objOpportunity = searchOpportunity(stTransactionId);
            log.debug(stLoggerTitle, 'objOpportunity = ' + JSON.stringify(objOpportunity));

            var stXML = generateXML(objOpportunity);
            log.debug(stLoggerTitle, 'stXML = ' + stXML);

            var flSalesPersonCode = form.addField({
                id: 'custpage_salespersoncode',
                type: serverWidget.FieldType.TEXT,
                label: 'Salesperson Code'
            });
            flSalesPersonCode.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            });

            var flMCFAUserName = form.addField({
                id: 'custpage_mcfausername',
                type: serverWidget.FieldType.TEXT,
                label: 'MCFA Username'
            });

            var flMCFAPassword = form.addField({
                id: 'custpage_mcfapassword',
                type: serverWidget.FieldType.PASSWORD,
                label: 'MCFA Password'
            });
            var flQuoteId = form.addField({
                id: 'custpage_quoteid',
                type: serverWidget.FieldType.TEXT,
                label: 'Quote Id'
            });
            flQuoteId.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
            flQuoteId.defaultValue = stQuoteId == 'undefined' ? '' : stQuoteId;


            var flCustomerAPIInformation = form.addField({
                id: 'custpage_customerapiinformation',
                type: serverWidget.FieldType.LONGTEXT,
                label: 'Customer API Information'
            }).updateDisplaySize({ width: 120, height: 20 });
            flCustomerAPIInformation.updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            });

            flCustomerAPIInformation.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
            flCustomerAPIInformation.defaultValue = stXML;




            form.addButton({
                id: 'custpage_btn_sendtoliftnet',
                label: 'Open Configurator',
                functionName: 'sendToLiftNet("' + stLiftNetURL + '", true)'
            });

            form.addButton({
                id: 'custpage_btn_processliftnet',
                label: 'Process Lift Configuration',
                functionName: 'sendToLiftNet("' + stLiftNetURL + '", false)'
            });

            if(!isEmpty(stQuoteId))
            {




                form.addButton({
                    id: 'custpage_btn_printquote',
                    label: 'Print Quote',
                    functionName: 'printQuote("' + stQuoteId + '", "' + stLiftNetURL + '")'
                });

                form.addButton({
                    id: 'custpage_btn_downloadws',
                    label: 'Download Worksheet',
                    functionName: 'printQuoteWorksheet("' + stQuoteId + '", "' + stLiftNetURL + '")'
                });
            }




            // form.addButton({
            //     id: 'custpage_btn_launchconfig',
            //     label: 'Launch Config',
            //     // functionName: 'launchConfig("' + username + '", "' + password + '","' + id + '", "' + type + '", "' + callback + '","' + stLiftNetURL + '")'
            //     functionName: 'launchConfig("tshowalterjr", "Maple1968!","f7faf90c-4b0c-ed11-a326-005056bbde98", "quote", "' + stLiftNetURL + '")'
            //
            // });


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
            return form;

        }

        function searchOpportunity(stTransactionId) {
            var stLoggerTitle = 'searchOpportunity';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');
            var arrFilters = [];
            var objData = {};
            var arrData = [];
            try
            {

                arrFilters.push(["internalid","anyof",stTransactionId]);
                arrFilters.push("AND");
                arrFilters.push(["type","anyof","Opprtnty"]);
                // arrFilters.push("AND");
                // arrFilters.push(["mainline","is","F"]);

                var objTranSearch = search.create({
                    type: "transaction",
                    filters: arrFilters,
                    columns:
                        [
                            "type",
                            "tranid",
                            "entity",
                            search.createColumn({
                                name: "altname",
                                join: "customerMain"
                            }),
                            search.createColumn({
                                name: "internalid",
                                join: "customerMain"
                            }),
                            search.createColumn({
                                name: "entityid",
                                join: "contactPrimary"
                            }),
                            search.createColumn({
                                name: "companyname",
                                join: "customerMain"
                            }),
                            search.createColumn({
                                name: "addresslabel",
                                join: "customerMain"
                            }),
                            "billaddress",
                            "billaddressee",
                            "billattention",
                            "billaddress1",
                            "billaddress2",
                            "billaddress3",
                            "billcity",
                            "billcountry",
                            "billcountrycode",
                            "billphone",
                            "billstate",
                            "billzip",
                            search.createColumn({
                                name: "entitystatus",
                                join: "customerMain"
                            }),
                            "custbody_sna_mfr",
                            "expectedclosedate",
                            "probability",
                            "memomain",
                            search.createColumn({
                                name: "salesdescription",
                                join: "item"
                            }),
                            search.createColumn({
                                name: "itemid",
                                join: "item"
                            }),
                            "quantity",
                            "amount"
                        ]
                });

                var searchResultCount = objTranSearch.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                objTranSearch.run().each(function(result) {
                    // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));



                    objData = {

                        type: result.getValue({ name: 'type'}),
                        quoteNumber: result.getValue({ name: 'tranid'}),
                        customerName: result.getText({ name: 'entity'}),
                        customerNameAlt: result.getValue({ name: 'altname', join: 'customerMain'}),
                        customerNumber: result.getValue({ name: 'internalid', join: 'customerMain'}),
                        customerContact: result.getValue({ name: 'entityid', join: 'contactPrimary'}),
                        customerCompanyName: result.getValue({ name: 'companyname', join: 'customerMain'}),
                        customerAddressLabel: '',
                        customerAddressee: result.getValue({ name: 'billaddressee' }),
                        customerAddress: result.getValue({ name: 'billaddress' }),
                        customerAddress1: result.getValue({ name: 'billaddress1' }),
                        customerAddress2: result.getValue({ name: 'billaddress2' }),
                        customerAddress3: result.getValue({ name: 'billaddress3' }),
                        customerPhone: result.getValue({ name: 'billphone' }),
                        customerCity: result.getValue({ name: 'billcity' }),
                        customerCountry: result.getValue({ name: 'billcountry' }),
                        customerCountryCode: result.getValue({ name: 'billcountrycode' }),
                        customerState: result.getValue({ name: 'billstate' }),
                        customerStateText: result.getValue({ name: 'billstate' }),
                        customerZip: result.getValue({ name: 'billzip' }),
                        customerEmail: '',
                        customerFax: '',
                        customerStatus: result.getValue({ name: 'entitystatus', join: 'customerMain'}),
                        customerStatusText: result.getText({ name: 'entitystatus', join: 'customerMain'}),
                        manufacturer: result.getValue({ name: 'custbody_sna_mfr'}),
                        estSaleDate: result.getValue({ name: 'expectedclosedate'}),
                        sellProbability: result.getValue({ name: 'probability'}),
                        itemDescription: result.getValue({ name: 'salesdescription', join:'item' }),
                        modelName: result.getValue({ name: 'itemid', join: 'item'}),
                        modelQuantity: result.getValue({ name: 'quantity'}),
                        ModelListPriceEach: result.getValue({ name: 'amount'}),
                    };


                    arrData.push(objData);

                    return false;

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

        function createUpdatePortalQuote(objParam) {
            var stLoggerTitle = 'createUpdatePortalQuote';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return stLoggerTitle;

        }

        function generateXML(objOpportunity) {
            var stLoggerTitle = 'generateXML';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');

            var stXML = '';

            for(var i in objOpportunity)
            {

                var stAddress = objOpportunity[i].customerAddress;
                stAddress = stAddress.replace(/\\n/g, ' ');
                stAddress = stAddress.substring(1, stAddress.length-1);
                log.debug(stLoggerTitle, 'stAddress = ' + stAddress);

                stXML += '<Quote>';
                stXML += '  <CustomerInformation>'
                stXML += '      <CustomerName account="name">' + objOpportunity[i].customerName + '</CustomerName>';
                stXML += '      <CustomerNumber account="easi_externalrecordid">' + objOpportunity[i].customerNumber + '</CustomerNumber>';
                stXML += '      <CustomerContact qoute="billto_contactname" account="address1_primarycontactname">' + objOpportunity[i].customerContact + '</CustomerContact>';
                stXML += '      <CustomerAddress quote="billto_line1" account="address1_line1">' + objOpportunity[i].customerAddress + '</CustomerAddress>';
                stXML += '      <CustomerCity quote="billto_city" account="address1_city">' + objOpportunity[i].customerCity + '</CustomerCity>';
                stXML += '      <CustomerState quote="billto_stateorprovince" account="address1_stateorprovince">' + objOpportunity[i].customerCountryCode + '</CustomerState>';
                stXML += '      <CustomerZip quote="billto_postalcode" account="address1_postalcode">' + objOpportunity[i].customerZip + '</CustomerZip>';
                stXML += '      <CustomerSICCode account="sic">1115</CustomerSICCode>';     //N/A
                stXML += '      <CustomerPhone account="telephone1">' + objOpportunity[i].customerPhone + '</CustomerPhone>';
                stXML += '      <CustomerFax account="fax"></CustomerFax>'; //N/A
                stXML += '      <CustomerEmail account="emailaddress1">' + objOpportunity[i].customerEmail + '</CustomerEmail>';
                stXML += '      <QuoteNumber quote="name">' + objOpportunity[i].quoteNumber + '</QuoteNumber>';
                stXML += '      <QuoteStatus quote="statuscode">' + objOpportunity[i].customerStatusText + '</QuoteStatus>';    //objOpportunity[i].customerStatusText
                stXML += '      <SellProbability quote="easi_probability">' + objOpportunity[i].sellProbability + '</SellProbability>';
                stXML += '      <SICCode account="easi_siccode"></SICCode>';        //N/A
                stXML += '      <ITACode account="easi_itacode"></ITACode>';  //N/A
                stXML += '      <EstimatedDOD quote="effectiveto"></EstimatedDOD>';   //N/A
                stXML += '      <FOB></FOB>';  //N/A
                stXML += '      <RequestedShipDate quote="requestdeliveryby"></RequestedShipDate>';   // N/A
                stXML += '      <IsPrimary quote="easi_quotedriver" devnotes="indicates whether this quote should be included in the forecast"> true </IsPrimary>'; //N/A
                stXML += '      <QuoteType quote="easi_quotetype" devnotes="indicates the type of quote, dealer inventory quotes don\'t create orders when they\'re Won"> 745640001 </QuoteType>';  //N/A
                stXML += '  </CustomerInformation>';
                stXML += '  <ShipToInformation>';
                stXML += '      <ShipToCompanyName quote="shipto_name"></ShipToCompanyName>';   //N/A
                stXML += '      <ShipToContact quote="shipto_contactname"></ShipToContact>';    //N/A
                stXML += '      <ShipToAddress1 quote="shipto_line1" account="mcfa_machineshipaddress_line1"></ShipToAddress1>';    //N/A
                stXML += '      <ShipToAddress2 quote="shipto_line2" account="mcfa_machineshipaddress_line2"/> ';   //N/A
                stXML += '      <ShipToCity quote="shipto_city" account="mcfa_machineshipaddress_city"></ShipToCity>';  //N/A
                stXML += '      <ShipToState quote="shipto_stateorprovince" account="mcfa_machineshipaddress_stateorprovince"></ShipToState>';  //N/A
                stXML += '      <ShipToZip quote="shipto_postalcode" account="mcfa_machineshipaddress_postalcode">90011</ShipToZip>';   //N/A
                stXML += '      <ShipToCounty/>';   //N/A
                stXML += '      <ShipToSICCode/>';  //N/A
                stXML += '      <ShipToPhone quote="shipto_telephone"></ShipToPhone>';  //N/A
                stXML += '      <ShipToFax quote="shipto_fax"></ShipToFax>';    //N/A
                stXML += '      <ShipToEmail></ShipToEmail>';   //N/A
                stXML += '      <EstSaleDate quote="easi_expectedclosedate"></EstSaleDate>';    //N/A
                stXML += '  </ShipToInformation>';
                stXML += '  <Configuration>';
                stXML += '      <Manufacturer quote="easi_brand">' + objOpportunity[i].itemDescription + '</Manufacturer>';
                stXML += '      <ModelName>' + objOpportunity[i].modelName + '</ModelName>';
                stXML += '      <TruckClass>' + objOpportunity[i].itemDescription + '</TruckClass>';
                stXML += '      <ModelOrderCode>' + objOpportunity[i].itemDescription + '</ModelOrderCode>';
                stXML += '      <ModelQuantity>' + objOpportunity[i].modelQuantity + '</ModelQuantity>';
                stXML += '      <ModelListPriceEach>' + objOpportunity[i].ModelListPriceEach + '</ModelListPriceEach>';
                stXML += '  </Configuration>';
                stXML += '</Quote>';
            }


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            stXML = formatXml(stXML);
            return stXML;

        }

        function formatXml(xml, tab) { // tab = optional indent value, default is tab (\t)
            var formatted = '', indent= '';
            tab = tab || '\t';
            xml.split(/>\s*</).forEach(function(node) {
                if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
                formatted += indent + '<' + node + '>\r\n';
                if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
            });
            return formatted.substring(1, formatted.length-3);
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