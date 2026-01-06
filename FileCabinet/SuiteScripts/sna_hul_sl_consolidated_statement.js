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
 * This Suitelet is used to print consolidated customer statement
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2024/02/19                           Care Parba          Initial version
 *
 */
define(['N/file', 'N/record', 'N/redirect', 'N/render', 'N/runtime', 'N/search', 'N/url', 'N/xml', 'N/ui/serverWidget' , 'N/config'],
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
 * @param{config } config
 */
    (file, record, redirect, render, runtime, search, url, xml, serverWidget, config) => {
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

            //let objParams = scriptContext.request.parameters;
            //log.debug({title: LOG_TITLE, details: `objParams: ${JSON.stringify(objParams)}`});

            if (scriptContext.request.method === 'GET') {
                const METHOD = "GET";

                log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `scriptContext: ${JSON.stringify(scriptContext)}`
                });
                /*log.debug({
                    title: `${LOG_TITLE} ${METHOD}`,
                    details: `request parameters: ${JSON.stringify(scriptContext.request.parameters)}`
                });*/

                let objForm = serverWidget.createForm({
                    title: 'Generate Consolidated Customer Statement'
                });

                //objForm.clientScriptModulePath = './sna_hul_cs_generate_misc_fee_print_pdf.js';

                /*let objJSONField = objForm.addField({
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
                objTemplateId.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });*/

                let objStatementField = objForm.addField({
                    id: 'custpage_statement_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Statement Date'
                });
                objStatementField.isMandatory = true;

                let objStartField = objForm.addField({
                    id: 'custpage_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Start Date'
                });

                let objCustomerField = objForm.addField({
                    id: 'custpage_customer',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Customer'
                });
                objCustomerField.addSelectOption({ value: "", text: "" });

                let objCustomerSearch = search.create({
                    type: "customer",
                    filters: [
                        ["parent","anyof","@NONE@"],
                        "AND",
                        ["status","anyof","13"],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["consolbalance","notequalto","0.00"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "altname",
                            sort: search.Sort.ASC
                        }),
                        search.createColumn({name: "internalid"})
                    ]
                });

                let objCustomerSearchResults = getFullResultSet(objCustomerSearch);

                objCustomerSearchResults.forEach(function (result) {
                    objCustomerField.addSelectOption({ value: result.id, text: result.getValue({name: 'altname'}) });
                });

                objForm.addSubmitButton({
                    label: 'Submit'
                });

                scriptContext.response.writePage(objForm);
            } else {
                const METHOD = "POST";

                try {
                    const customerId = scriptContext.request.parameters.custpage_customer;//9136
                    const strDate = scriptContext.request.parameters.custpage_start_date;
                    const statementDate = scriptContext.request.parameters.custpage_statement_date;
                    const stTemplateId = 'sna_hul_consolidated_customer_statement.xml'

                    log.debug({title: `${LOG_TITLE} ${METHOD}`, details: {customerId}});
                    log.debug({title: `${LOG_TITLE} ${METHOD}`, details: {strDate}});
                    log.debug({title: `${LOG_TITLE} ${METHOD}`, details: {statementDate}});

                    let objCustomerRec = record.load({
                        type: record.Type.CUSTOMER,
                        id: customerId
                    });

                    let entityId = objCustomerRec.getValue({fieldId: 'entityid'});
                    let billAddress, shipAddress;
                    let addressCount = objCustomerRec.getLineCount('addressbook');
                    for (let i = 0; i < addressCount; i++) {
                        let def_Bill = objCustomerRec.getSublistValue('addressbook', 'defaultbilling', i);
                        let def_Ship = objCustomerRec.getSublistValue('addressbook', 'defaultshipping', i);
                        let anAddress = objCustomerRec.getSublistSubrecord('addressbook', 'addressbookaddress', i);
                        if (def_Bill) {
                            let addressee = anAddress.getValue({fieldId: 'addressee'});
                            let addr1 = anAddress.getValue({fieldId: 'addr1'});
                            let addr2 = anAddress.getValue({fieldId: 'addr2'});
                            let addr3 = anAddress.getValue({fieldId: 'addr3'});
                            let city = anAddress.getValue({fieldId: 'city'});
                            let state = anAddress.getValue({fieldId: 'state'});
                            let zip = anAddress.getValue({fieldId: 'zip'});
                            let country = anAddress.getText({fieldId: 'country'});
                            billAddress = `${addressee} |
                                       ${addr1 ? `${addr1} |` : ''} 
                                       ${addr2 ? `${addr2} |` : ''} 
                                       ${addr3 ? `${addr3} |` : ''} 
                                       ${city} ${state} ${zip} |
                                       ${country}`;
                        } else if (def_Ship) {
                            let addressee = anAddress.getValue({fieldId: 'addressee'});
                            let addr1 = anAddress.getValue({fieldId: 'addr1'});
                            let addr2 = anAddress.getValue({fieldId: 'addr2'});
                            let addr3 = anAddress.getValue({fieldId: 'addr3'});
                            let city = anAddress.getValue({fieldId: 'city'});
                            let state = anAddress.getValue({fieldId: 'state'});
                            let zip = anAddress.getValue({fieldId: 'zip'});
                            let country = anAddress.getText({fieldId: 'country'});
                            shipAddress = `${addressee} |
                                       ${addr1 ? `${addr1} |` : ''} 
                                       ${addr2 ? `${addr2} |` : ''} 
                                       ${addr3 ? `${addr3} |` : ''} 
                                       ${city} ${state} ${zip} |
                                       ${country}`;
                        }
                    }
                    //let billAddress = objCustomerRec.getValue({ fieldId: 'billaddress' });

                    log.debug({title: LOG_TITLE, details: `billAddress: ${billAddress}`});

                    let objConfigRec = config.load({
                        type: config.Type.COMPANY_INFORMATION
                    });
                    let companyName = objConfigRec.getValue({fieldId: 'companyname'});
                    let companySubRec = objConfigRec.getSubrecord({fieldId: 'mainaddress'});
                    let addresseeCompany = companySubRec.getValue({fieldId: 'addressee'});
                    let addr1Company = companySubRec.getValue({fieldId: 'addr1'});
                    let addr2Company = companySubRec.getValue({fieldId: 'addr2'});
                    let addr3Company = companySubRec.getValue({fieldId: 'addr3'});
                    let cityCompany = companySubRec.getValue({fieldId: 'city'});
                    let stateCompany = companySubRec.getValue({fieldId: 'state'});
                    let zipCompany = companySubRec.getValue({fieldId: 'zip'});
                    let countryCompany = companySubRec.getText({fieldId: 'country'});
                    let companyAddress = `${addresseeCompany ? `${addresseeCompany} |` : ''}
                                       ${addr1Company ? `${addr1Company} |` : ''} 
                                       ${addr2Company ? `${addr2Company} |` : ''} 
                                       ${addr3Company ? `${addr3Company} |` : ''} 
                                       ${cityCompany} ${stateCompany} ${zipCompany} |
                                       ${countryCompany}`;

                    log.debug({title: LOG_TITLE, details: `companyName: ${companyName}`});
                    log.debug({title: LOG_TITLE, details: `companyAddress: ${companyAddress}`});

                    let objTableData = getTableData(customerId, strDate, statementDate);
                    log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: `objTableData: ${JSON.stringify(objTableData)}` });

                    log.debug({ title: `${LOG_TITLE} ${METHOD}`, details: `objTableData: ${objTableData[0].fltInvBalForward}` });

                    let objCustomer = {
                        trandate: xml.escape(scriptContext.request.parameters.custpage_statement_date),
                        startDate: xml.escape(scriptContext.request.parameters.custpage_start_date),
                        entityid: xml.escape(entityId),
                        billaddress: billAddress ? xml.escape(billAddress) : '',
                        companyName: companyName ? xml.escape(companyName) : '',
                        addressText: companyAddress ? xml.escape(companyAddress) : '',
                        amountDue: 1200,
                        fltInvBalForward : objTableData[0].fltInvBalForward,
                        fltPayBalForward : objTableData[0].fltInvBalForward,
                        fltPayAmountApplied : objTableData[0].fltPayAmountApplied,
                        fltPayAmountUnapplied : objTableData[0].fltPayAmountUnapplied,
                        arrPayments : objTableData[0].arrPayments,
                        arrInvoices : objTableData[0].arrInvoices,
                        fltCurrent : objTableData[0].fltCurrent,
                        fltAging1 : objTableData[0].fltAging1,
                        fltAging31 : objTableData[0].fltAging31,
                        fltAging61 : objTableData[0].fltAging61,
                        fltAging90 : objTableData[0].fltAging90,
                        fltAgingAmount : objTableData[0].fltAgingAmount
                    }

                    /*Template Creation - Add Invoices*/
                    let templateFile = file.load({id: `./TEMPLATES/${stTemplateId}`});
                    let renderer = render.create();
                    renderer.templateContent = templateFile.getContents();

                    renderer.addCustomDataSource({format: 'OBJECT', alias: 'customerData', data: objCustomer});

                    let statementPDF = renderer.renderAsPdf();

                    let transactionFile = statementPDF;
                    transactionFile.name = 'Consolidated Customer Statement - ' + transactionFile.name + '_' + new Date().getTime() + '.pdf';
                    //transactionFile.folder = runtime.getCurrentScript().getParameter("custscript_invoice_folder");
                    transactionFile.folder = 1570401;
                    let id = transactionFile.save();
                    log.debug({title: `${LOG_TITLE} ${METHOD}`, details: `File Saved - transactionFile Id: ${id}`});

                    transactionFile = file.load({id});

                    redirect.redirect({url: transactionFile.url});
                } catch (err){
                    log.error({title: `${LOG_TITLE} ${METHOD}`, details: `errorDetails: ${err}`});
                }
            }

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        /**
         * Retrieves table data, this includes Invoice Table with balance forward, Payment Table with balance forward and Aging Table
         * @param {number} customerId
         * @param {string} strDate
         * @param {string} statementDate
         * @returns {Array<object>} objTableData - Returns object that contains table data
         */
        function getTableData(customerId, strDate, statementDate){
            var objTableDataArr = [];
            var objTableData = {};
            var paymentCount = 0, invoiceCount = 0;
            var objCustomerLookup = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customerId,
                columns: ["entityid", "companyname"]
            });
            var customerName = objCustomerLookup.entityid + ' ' + objCustomerLookup.companyname;
            log.debug('customerName', customerName);


            //Invoice Balance Forward
            var objBalForward = new Object();
            var objSearch = search.load({id: 'customsearch_sna_balanceforward_srch__11'});
            if(!isEmpty(strDate)){
                var objFilter = search.createFilter({name: 'trandate',operator: 'before',values: strDate});
                objSearch.filters.push(objFilter)
            }
            var objFilter2 = search.createFilter({
                name : 'formulanumeric',
                operator : search.Operator.EQUALTO,
                values : [1],
                formula : "CASE WHEN {customermain.parent} ='" + customerName + "' THEN 1 ELSE 0 END",
            })
            objSearch.filters.push(objFilter2);
            objSearch.run().each(function(result){
                objBalForward.fltInvoice = result.getValue({name: "amountremaining",summary: "SUM",});

                if(isEmpty(objBalForward.fltInvoice)){
                    objBalForward.fltInvoice = 0.00;
                }

            });


            //Payment Balance Forward
            var objSearch2 = search.load({id: 'customsearch_sna_balanceforward_srch__12'});
            if(!isEmpty(strDate)){
                var objFilter2 = search.createFilter({name: 'trandate',operator: 'before',values: strDate});
                objSearch2.filters.push(objFilter2);
            }
            var objFilter22 = search.createFilter({
                name : 'formulanumeric',
                operator : search.Operator.EQUALTO,
                values : [1],
                formula : "CASE WHEN {customermain.parent} ='" + customerName + "' THEN 1 ELSE 0 END",
            });
            objSearch2.filters.push(objFilter22);
            objSearch2.run().each(function(result){
                var sumOfAmount, sumOfAmountApplied, sumOfAmountUnapplied;
                sumOfAmount = isEmpty(result.getValue(result.columns[0])) ? 0.00 : parseFloat(result.getValue(result.columns[0]));
                sumOfAmountApplied = isEmpty(result.getValue(result.columns[1])) ? 0.00 : parseFloat(result.getValue(result.columns[1]));
                sumOfAmountUnapplied = isEmpty(result.getValue(result.columns[2])) ? 0.00 : parseFloat(result.getValue(result.columns[2]));
                objBalForward.fltPayment = sumOfAmountUnapplied; //sumOfAmountApplied + sumOfAmountUnapplied;
                log.audit('sumOfAmountApplied',sumOfAmountApplied);
                log.audit('sumOfAmountUnapplied',sumOfAmountUnapplied);
                objBalForward.fltPaymentAmountApplied = sumOfAmountApplied;
                objBalForward.fltPaymentAmountUnapplied = sumOfAmountUnapplied;
            });
            objBalForward.fltInvoice = parseFloat(objBalForward.fltInvoice);
            log.audit('objBalForward',objBalForward);


            //Payment Table
            var obj = new Object();
            var arrPayments = new Array();
            var objSearch3 = search.load({id: 'customsearch_sna_balanceforward_srch__10'});
            if(!isEmpty(strDate)){
                var objFilter33 = search.createFilter({name: 'trandate',operator: 'onorafter',values: strDate});
                objSearch3.filters.push(objFilter33);
            }
            var objFilter34 = search.createFilter({name: 'trandate',operator: 'onorbefore',values: statementDate});
            objSearch3.filters.push(objFilter34);
            var objFilter3 = search.createFilter({
                name : 'formulanumeric',
                operator : search.Operator.EQUALTO,
                values : [1],
                formula : "CASE WHEN {customermain.parent} ='" + customerName + "' THEN 1 ELSE 0 END",
            })
            objSearch3.filters.push(objFilter3);
            objSearch3.run().each(function(result){
                var fltTotalAmount, strTotalAmount, fltAmountRem, strAmountRem, fltAppliedAmount, strAppliedAmount = '-';
                fltTotalAmount = isEmpty(result.getValue(result.columns[2])) ? 0.00 : result.getValue(result.columns[2])
                strTotalAmount = formatMoney(fltTotalAmount, true);
                fltAmountRem = isEmpty(result.getValue(result.columns[3])) ? 0.00 : result.getValue(result.columns[3])
                strAmountRem = formatMoney(fltAmountRem, true);

                fltAppliedAmount = parseFloat(fltTotalAmount) - parseFloat(fltAmountRem);
                strAppliedAmount = formatMoney(fltAppliedAmount, true);
                paymentCount++;
                arrPayments.push({
                    date: result.getValue(result.columns[0]),
                    description: result.getValue(result.columns[4]),
                    totalamount: fltTotalAmount,
                    amountremaining: fltAmountRem,
                    strtotalamount: strTotalAmount,
                    strappliedamount: strAppliedAmount,
                    stramountremaining: strAmountRem,
                });

                return true;
            });

            log.audit('arrPayments',arrPayments);
            log.audit('arrPayments length',arrPayments.length);


            //Aging Table
            var objSearch4 = search.load({id: 'customsearch_sna_agingbalance_4'});

            var objFilter4 = search.createFilter({
                name : 'formulanumeric',
                operator : search.Operator.EQUALTO,
                values : [1],
                formula : "CASE WHEN {customermain.parent} ='" + customerName + "' THEN 1 ELSE 0 END",
            })
            objSearch4.filters.push(objFilter4);
            var objResultSet = objSearch4.run();
            var objResult = objResultSet.getRange({start: 0,end: 1})[0];

            var fltAgingAmount = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[0])), true);
            var fltAgingCurrent = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[1])), false);
            var fltAging1 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[2])), false);
            var fltAging31 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[3])), false);
            var fltAging61 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[4])), false);
            var fltAging90 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[5])), false);

            log.audit('fltAgingAmount',fltAgingAmount);
            log.audit('fltAgingCurrent',fltAgingCurrent);
            log.audit('fltAging1',fltAging1);
            log.audit('fltAging31',fltAging31);
            log.audit('fltAging61',fltAging61);
            log.audit('fltAging90',fltAging90);


            //Invoice Table
            var arrInvoices = new Array();
            var objSearch5 = search.load({id: 'customsearch_sna_invoicetable_srch_2'});
            if(!isEmpty(strDate)){
                var objFilter55 = search.createFilter({name: 'trandate',operator: 'onorafter',values: strDate});
                objSearch5.filters.push(objFilter55);
            }
            var objFilter5 = search.createFilter({
                name : 'formulanumeric',
                operator : search.Operator.EQUALTO,
                values : [1],
                formula : "CASE WHEN {customermain.parent} ='" + customerName + "' THEN 1 ELSE 0 END",
            })
            objSearch5.filters.push(objFilter5);
            objSearch5.run().each(function(result){

                var fltTotalAmount = isEmpty(result.getValue({name: "amount"})) ? 0.00 : result.getValue({name: "amount"})
                var strTotalAmount = formatMoney(fltTotalAmount, true);

                var fltAmountRem = isEmpty(result.getValue({name: "amountremaining"})) ? 0.00 : result.getValue({name: "amountremaining"})
                var strAmountRem = formatMoney(fltAmountRem, true);
                invoiceCount++;
                arrInvoices.push({
                    id: result.id,
                    date: result.getValue({name: "trandate"}),
                    description: result.getValue({name: "formulatext"}),
                    totalamount: fltTotalAmount,
                    amountremaining: fltAmountRem,
                    strtotalamount: strTotalAmount,
                    stramountremaining: strAmountRem,
                });

                return true;
            })

            log.debug('arrInvoices', arrInvoices);
            log.debug('arrInvoices length', arrInvoices.length);
            log.debug('arrPayments', arrPayments);
            log.debug('arrPayments length', arrPayments.length);

            objTableData.fltInvBalForward = objBalForward.fltInvoice;
            objTableData.fltPayBalForward = objBalForward.fltPayment;
            objTableData.fltPayAmountApplied = objBalForward.fltPaymentAmountApplied;
            objTableData.fltPayAmountUnapplied = objBalForward.fltPaymentAmountUnapplied;
            objTableData.arrPayments = arrPayments;//JSON.stringify(arrPayments);
            objTableData.arrInvoices = arrInvoices;//JSON.stringify(arrInvoices);
            objTableData.fltCurrent = fltAgingCurrent;
            objTableData.fltAging1 = fltAging1;
            objTableData.fltAging31 = fltAging31;
            objTableData.fltAging61 = fltAging61;
            objTableData.fltAging90 = fltAging90;
            objTableData.fltAgingAmount = fltAgingAmount;

            objTableDataArr.push(objTableData);

            return objTableDataArr;
        }

        /**
         * Retrieves the entire result set
         * @param {search.Search} mySearch
         * @returns {Array<search.Result>} searchResults - Returns an array of search results
         */
        function getFullResultSet(mySearch) {
            var searchResults = [],
                pagedData;
            pagedData = mySearch.runPaged({ pageSize: 1000 });
            pagedData.pageRanges.forEach(function (pageRange) {
                var page = pagedData.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    searchResults.push(result);
                });
            });
            return searchResults;
        }

        function formatMoney(amount, iscurrency, decimalCount = 2, decimal = ".", thousands = ",") {
            try {
                decimalCount = Math.abs(decimalCount);
                decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

                amount = parseFloat(amount);

                const isNegative = amount < 0 ? true : false

                let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
                let j = (i.length > 3) ? i.length % 3 : 0;

                let currency = ''
                if(iscurrency){
                    currency = '$';
                }
                var formattedString =  (j ? i.substr(0, j) + thousands : '') +
                    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
                    (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "")

                if(isNegative){
                    formattedString = currency + '(' + formattedString + ')';
                }else{
                    formattedString = currency + formattedString;
                }


                return formattedString;
            } catch (e) {
                log.audit('formatMoney catch', e)
            }
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        const getDate = (dateStr) => {
            let dateArr = dateStr.split("-");
            let data = [dateArr[1], dateArr[2], dateArr[0]].join("/")
            // let date = new Date(data);
            return data;
        }

        return {onRequest}

    });
