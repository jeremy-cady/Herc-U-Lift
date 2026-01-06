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
* 
*/


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/format', 'N/https'],
    (record, widget, search, runtime, url, file, format, https) => {



        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const afterSubmit_getDealerNetPricing = (objContext) => {
            var stLoggerTitle = 'afterSubmit_getDealerNetPricing';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                log.debug(stLoggerTitle, 'objContext.type = ' + objContext.type);
                if(objContext.type == 'xedit')
                {
                    return;
                }

                if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE && runtime.executionContext !== runtime.ContextType.SUITELET  && runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
                {
                    log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + '. ' + runtime.executionContext + ' is not supported for this operation. <<---|');
                    return;
                }

                log.audit(stLoggerTitle, 'runtime.executionContext = ' + runtime.executionContext);
                var bIsAutoApprovePrice = true;
                var DEALERNET_DOMAIN = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetdomain' });
                var DEALERNET_KEY = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealerkey' });
                var DEALERNET_REQUESTACCESSKEYURL = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetaccesstokenurl' });
                var DEALERNET_PRICETHRESHOLD = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetpricethreshold' });
                var DEALERNET_CODE = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetcode' });

                var bIsForApproval = true;
                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;

                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;

                var objVendorPrice = record.load({ type: stRecType, id: stRecId });

                if(!isEmpty(objVendorPrice))
                {
                    // get Item, Vendor, Vendor Item Number
                    var stItem_id = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_item' });
                    var stItem_txt = objVendorPrice.getText({ fieldId: 'custrecord_sna_hul_item' });
                    log.debug(stLoggerTitle, 'stItem_id = ' + stItem_id + ' | stItem_txt = ' + stItem_txt);

                    // get item and check for its type
                    // when item is inventory type, script will exit
                    var bIsLotItem = getItemType(stItem_id);
                    log.debug(stLoggerTitle, 'bIsLotItem = ' + bIsLotItem);
                    if(bIsLotItem)
                    {
                        log.audit(stLoggerTitle, 'Exiting... Item Type not supported -- ' + stItem_txt);
                        return;
                    }




                    var stVendor_id = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_vendor' });
                    var stVendor_txt = objVendorPrice.getText({ fieldId: 'custrecord_sna_hul_vendor' });
                    log.debug(stLoggerTitle, 'stVendor_id = ' + stVendor_id + ' | stVendor_txt = ' + stVendor_txt);

                    var stVendorItemNumber_id = objVendorPrice.getValue({ fieldId: 'custrecordsna_hul_vendoritemnumber' });
                    var stVendorItemNumber_txt = objVendorPrice.getText({ fieldId: 'custrecordsna_hul_vendoritemnumber' });
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

                    var flPurchPriceC = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_itempurchaseprice' }) || 0;
                    var flListPriceC = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_listprice' }) || 0;
                    var flContractPriceC = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_contractprice' }) || 0;

                    flPurchPriceC = isNaN(flPurchPriceC) ? 0 : parseFloat(flPurchPriceC);
                    flListPriceC = isNaN(flListPriceC) ? 0 : parseFloat(flListPriceC);
                    flContractPriceC = isNaN(flContractPriceC) ? 0 : parseFloat(flContractPriceC);
                    log.debug(stLoggerTitle, 'flPurchPriceC = ' + flPurchPriceC +  ' | flListPriceC = ' + flListPriceC + ' | flContractPriceC = ' + flContractPriceC);

                    var flPurchPriceD = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_t_itempurchaseprice' }) || 0;
                    var flListPriceD = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_t_listprice' }) || 0;
                    var flContractPriceD = objVendorPrice.getValue({ fieldId: 'custrecord_sna_hul_t_contractprice' }) || 0;

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








                    var objResponse = https.get({
                        url: DEALERNET_REQUESTACCESSKEYURL,
                        headers: headers
                    });
                    log.audit(stLoggerTitle, 'objResponse = ' + JSON.stringify(objResponse));

                    var RESPONSE_CODE = objResponse.code;
                    var RESPONSE_BODY = JSON.parse(objResponse.body);
                    var stToken = RESPONSE_BODY.Token;

                    if(RESPONSE_CODE == 200)
                    {
                        log.audit(stLoggerTitle, 'stToken = ' + stToken );

                        // call dealernet part details
                        headers = {
                            'Authorization': "Bearer " + stToken,
                            'Content-Type': 'application/json'

                        };

                        var stAPI_URL = DEALERNET_DOMAIN + '/V1/Parts/GetPartDetailsByOemPartCode';
                            stAPI_URL += '?oemPartCode=' + stVendorItemNumber_id;
                            stAPI_URL += '&dealerCode=' + DEALERNET_CODE;
                            stAPI_URL += '&externalStockSourceType=Dealer';
                        log.audit(stLoggerTitle, 'stAPI_URL = ' + stAPI_URL );

                        objResponse = https.get({
                            url: stAPI_URL ,
                            headers: headers
                        });
                        log.audit(stLoggerTitle, 'objResponse = ' + JSON.stringify(objResponse));

                        RESPONSE_CODE = objResponse.code;
                        RESPONSE_BODY = JSON.parse(objResponse.body);
                        log.audit(stLoggerTitle, 'RESPONSE_BODY = ' + JSON.stringify(RESPONSE_BODY));

                        if(!isEmpty(RESPONSE_BODY))
                        {



                            objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: true });

                            objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_t_itempurchaseprice', value:  RESPONSE_BODY.DealerNetPrice});
                            objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_t_listprice', value: RESPONSE_BODY.FleetListPrice });
                            objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_t_contractprice', value: RESPONSE_BODY.ContractPrice });
                            objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_t_qtybreakprices', value: JSON.stringify(RESPONSE_BODY.QuantityBreakPrices) });

                            log.debug('1', parseFloat(RESPONSE_BODY.DealerNetPrice) > parseFloat(flPurchPriceDDN) && parseFloat(RESPONSE_BODY.DealerNetPrice) < parseFloat(flPurchPriceDD));
                            if(parseFloat(RESPONSE_BODY.DealerNetPrice) > parseFloat(flPurchPriceDDN) && parseFloat(RESPONSE_BODY.DealerNetPrice) < parseFloat(flPurchPriceDD))
                            {
                                objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_itempurchaseprice', value:  RESPONSE_BODY.DealerNetPrice});
                                if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
                                {
                                    bIsForApproval = false;
                                }
                            }
                            else
                            {
                                if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
                                {
                                    bIsForApproval = true;
                                }
                            }


                            log.debug('2', parseFloat(RESPONSE_BODY.FleetListPrice) > parseFloat(flListPriceDDN) && parseFloat(RESPONSE_BODY.FleetListPrice) < parseFloat(flListPriceDD));
                            if(parseFloat(RESPONSE_BODY.FleetListPrice) > parseFloat(flListPriceDDN) && parseFloat(RESPONSE_BODY.FleetListPrice) < parseFloat(flListPriceDD))
                            {
                                objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_listprice', value: RESPONSE_BODY.FleetListPrice });
                                if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
                                {
                                    bIsForApproval = false;
                                }
                            }
                            else
                            {
                                if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
                                {
                                    bIsForApproval = true;
                                }
                            }


                            log.debug('3', parseFloat(RESPONSE_BODY.ContractPrice) > parseFloat(flContractPriceDDN) && parseFloat(RESPONSE_BODY.ContractPrice) < parseFloat(flContractPriceDD));
                            if(parseFloat(RESPONSE_BODY.ContractPrice) > parseFloat(flContractPriceDDN) && parseFloat(RESPONSE_BODY.ContractPrice) < parseFloat(flContractPriceDD))
                            {
                                objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_contractprice', value: RESPONSE_BODY.ContractPrice });
                                if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
                                {
                                    bIsForApproval = false;
                                }

                            }
                            else
                            {
                                if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
                                {
                                    bIsForApproval = true;
                                }
                            }

                            log.debug(stLoggerTitle, 'bIsForApproval: ' + bIsForApproval);
                            if(!bIsForApproval)
                            {
                                if(runtime.executionContext !== runtime.ContextType.CSV_IMPORT) {
                                    objVendorPrice.setValue({
                                        fieldId: 'custrecord_sna_hul_forapproval',
                                        value: bIsForApproval
                                    });
                                    objVendorPrice.setValue({fieldId: 'custrecord_sna_hul_remarks', value: ''});
                                }

                            }

                            var stVendorPriceId = objVendorPrice.save();
                            log.debug(stLoggerTitle, 'MATCH | stVendorPriceId = ' + stVendorPriceId);
                        }
                        else
                        {
                            objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: false });


                            var stVendorPriceId = objVendorPrice.save();
                            log.debug(stLoggerTitle, 'NO MATCH | stVendorPriceId = ' + stVendorPriceId);
                        }



                    }
                    else
                    {
                        log.audit(stLoggerTitle, 'RESPONSE_CODE = ' + RESPONSE_CODE);

                        objVendorPrice.setValue({ fieldId: 'custrecord_sna_hul_issynced', value: false });




                        var stVendorPriceId = objVendorPrice.save();
                        log.debug(stLoggerTitle, 'NO MATCH | stVendorPriceId = ' + stVendorPriceId);
                    }

                }


            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        const beforeLoad_getDealerNetPricing = (objContext) => {
            var stLoggerTitle = 'beforeLoad_getDealerNetPricing';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            var bisApproveListPrice = false;
            var bisApprovePurchPrice = false;
            var DEALERNET_PRICETHRESHOLD = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetpricethreshold' });

            var objCurrentUser = runtime.getCurrentUser();
            log.debug(stLoggerTitle, 'objCurrentUser = ' + JSON.stringify(objCurrentUser));
            var stCurrentUser = objCurrentUser.id;
            log.debug(stLoggerTitle, 'stCurrentUser = ' + stCurrentUser);
            try {

                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;
                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;

                objForm.clientScriptModulePath  = './sna_hul_cs_getdealernetpricing.js';

                var flPurchPriceC = objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_itempurchaseprice' }) || 0;
                var flListPriceC = objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_listprice' }) || 0;
                var flContractPriceC = objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_contractprice' }) || 0;

                flPurchPriceC = isNaN(flPurchPriceC) ? 0 : parseFloat(flPurchPriceC);
                flListPriceC = isNaN(flListPriceC) ? 0 : parseFloat(flListPriceC);
                flContractPriceC = isNaN(flContractPriceC) ? 0 : parseFloat(flContractPriceC);
                log.debug(stLoggerTitle, 'flPurchPriceC = ' + flPurchPriceC +  ' | flListPriceC = ' + flListPriceC + ' | flContractPriceC = ' + flContractPriceC);

                var flPurchPriceD = objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_t_itempurchaseprice' }) || 0;
                var flListPriceD = objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_t_listprice' }) || 0;
                var flContractPriceD = objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_t_contractprice' }) || 0;

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
                log.debug(stLoggerTitle, 'flListPriceD < flListPriceDDN = ' + (flListPriceD < flListPriceDDN) +  ' | flListPriceD > flListPriceDD = ' + (flListPriceD > flListPriceDD) + ' | flContractPriceD < flContractPriceDDN = ' + (flContractPriceD < flContractPriceDDN) + ' | flContractPriceD > flContractPriceDD = ' + (flContractPriceD > flContractPriceDD));
              
                if(flListPriceD < flListPriceDDN || flListPriceD > flListPriceDD)
                {


                    if(!bisApproveListPrice)
                    {
                        if(flListPriceD > 0)
                        {

                            objForm.addButton({ id: 'custpage_btn_approvelistprice', label: 'Approve List Price', functionName: 'approveNewListPrice("' + stRecType + '","' + stRecId + '","' + stCurrentUser + '");' });
                        }
                    }

                    bisApproveListPrice = true;
                }

                if((flPurchPriceD < flPurchPriceDDN || flPurchPriceD > flPurchPriceDD) || (flContractPriceD < flContractPriceDDN || flContractPriceD > flContractPriceDD))
                {


                    if(!bisApprovePurchPrice)
                    {
                        if(flPurchPriceD > 0)
                        {

                            objForm.addButton({ id: 'custpage_btn_approvepurchaseprice', label: 'Approve Purchase Price', functionName: 'approveNewPurchasePrice("' + stRecType + '","' + stRecId + '","' + stCurrentUser + '");' });
                        }
                    }

                    bisApprovePurchPrice = true;
                }

                if(bisApproveListPrice == true && bisApprovePurchPrice == true && flPurchPriceD > 0 && flListPriceD > 0)
                {
                    objForm.addButton({ id: 'custpage_btn_approveallprice', label: 'Approve All Price', functionName: 'approveAllPrice("' + stRecType + '","' + stRecId + '","' + stCurrentUser + '");' });
                }



                // create tab and sublist for task codes
                objForm.addTab({
                    id: 'custpage_tab_qtybreakprices',
                    label: 'Quantity Break Prices'
                });

                objForm.addSubtab({
                    id: 'custpage_stab_qtybreakprices',
                    label: 'Quantity Break Prices',
                    tab: 'custpage_tab_qtybreakprices'
                });

                // add sublist
                var objSublist = objForm.addSublist({
                    id: 'custpage_slist_qtybreakprices',
                    type: widget.SublistType.STATICLIST,
                    label: 'List of Quantity Break Prices',
                    tab: 'custpage_stab_qtybreakprices'
                });

                //add sublist fields
                var flQuantity = objSublist.addField({id: 'custpage_sl_qbp_quantity', type: widget.FieldType.TEXT, label: 'Quantity' });
                flQuantity.updateDisplayType({ displayType: widget.FieldDisplayType.DISABLED });
                var flPrice = objSublist.addField({id: 'custpage_sl_qbp_price', type: widget.FieldType.TEXT, label: 'Price' });
                flPrice.updateDisplayType({ displayType: widget.FieldDisplayType.DISABLED });

                if(!isEmpty(objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_qtybreakprices'})))
                {
                    var objQBP = JSON.parse(objCurrentRecord.getValue({ fieldId: 'custrecord_sna_hul_qtybreakprices'}));
                    log.debug(stLoggerTitle, 'objQBP = ' + JSON.stringify(objQBP));

                    if(Object.keys(objQBP).length > 0)
                    {
                        var intLineCounter = 0;
                        for(var i in objQBP)
                        {
                            log.debug(stLoggerTitle, 'Quantity = ' + objQBP[i].Quantity + ' | Price = ' + objQBP[i].Price + ' | i = ' + i);
                            objSublist.setSublistValue({id: 'custpage_sl_qbp_quantity', line: intLineCounter, value: objQBP[i].Quantity });
                            objSublist.setSublistValue({id: 'custpage_sl_qbp_price', line: intLineCounter, value: objQBP[i].Price });

                            intLineCounter++;
                        }

                    }
                }




            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        function getItemType(stItemId)
        {
            var stLoggerTitle = 'getItemType';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');



            var bIsLotItem = null;
            var arrFilters = [];


            arrFilters.push(["internalid","anyof",stItemId]);


            try
            {
                var objItemSearch = search.create({
                    type: "item",
                    filters: arrFilters,
                    columns:
                        [
                            "type",
                            "islotitem"
                        ]
                });

                var searchResultCount = objItemSearch.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                objItemSearch.run().each(function(result) {
                    // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));



                    bIsLotItem= result.getValue({ name: 'islotitem'});




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



            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return bIsLotItem;
        }

        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }

        return {
                    afterSubmit: afterSubmit_getDealerNetPricing,
                    beforeLoad: beforeLoad_getDealerNetPricing
                }

    });