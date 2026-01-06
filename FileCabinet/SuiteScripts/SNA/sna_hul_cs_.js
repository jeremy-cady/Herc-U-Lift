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
* 2022/05/16						            natoretiro      	Initial version
* 2022/07/06                                    nretiro             hide calculate shipping button
* 2023/01/11                                    nretiro             disables parcel fields if Shipping Method is not
*                                                                   SpeeDee
* 2023/01/30                                    nretiro             adjustment to open manifest suitelet in order to print label/s
* 2023/04/28                                    aduldulao           remove timeout
* 2023/06/09                                    nretiro             set shipping cost to 0 once shipping method is Will Call/Shop Order
*
*/

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([
        'N/record',
        'N/runtime',
        'N/search',
        'N/format',
        'N/error',
        'N/currentRecord',
        'N/https',
        'N/url'
    ],

    function (record, runtime, search, format, error, currentRecord, https, url) {
        var OBJITEMDETAILS = {};
        var CURRENTRECORD = null;
        var SPEEDEE_SHIPPING_METHOD = '';
        var WILLCALLSHOPORDER_SHIPPING_METHOD = '';


        function postSourcing(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;


            try
            {
                if (sublistName === 'item' && sublistFieldName === 'item')
                {
                    var stLoc = currentRecord.getValue({ fieldId: 'location' });

                    if(!isEmpty(stLoc))
                    {
                        currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'location', value: stLoc });
                    }

                    // set po vendor
                    var objQBPrice = {};

                    var stItem = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' });

                    if(!isEmpty(stItem))
                    {

                        var arrFilter = [];

                        arrFilter.push(["internalid","anyof",stItem]);
                        arrFilter.push("AND");
                        arrFilter.push(["custrecord_sna_hul_item.custrecord_sna_hul_primaryvendor","is","T"]);

                        // new search here
                        var objItemVP = getItemVendorPrice(arrFilter);
                        console.log('postSourcing', 'objItemVP = ' + JSON.stringify(objItemVP));
                        //debugger;

                        if(Object.keys(objItemVP).length > 0)
                        {
                            for(var i in objItemVP)
                            {

                                currentRecord.setCurrentSublistValue({
                                    sublistId: sublistName,
                                    fieldId: 'custcol_sna_csi_povendor',
                                    value: objItemVP[i].poVendor,
                                    ignoreFieldChange: true
                                });

                                currentRecord.setCurrentSublistValue({
                                    sublistId: sublistName,
                                    fieldId: 'povendor',
                                    value: objItemVP[i].poVendor,
                                    ignoreFieldChange: true
                                });


                                var flPORate = null;
                                var stQBPrice = objItemVP[i].qBPrice;

                                if(!isEmpty(stQBPrice))
                                {
                                    objQBPrice = JSON.parse(stQBPrice);
                                    console.log('postSourcing' + ' | objQBPrice = ' + JSON.stringify(objQBPrice));
                                }


                                var flContractPrice = parseFloat(objItemVP[i].contractPrice);


                                var flItemPurchPrice = parseFloat(objItemVP[i].itemPurchPrice);


                                if(Object.keys(objQBPrice).length > 0) {

                                    var qty = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'quantity' }) || 1;

                                    for (var qbpIndex = 0; qbpIndex < objQBPrice.length; qbpIndex++) {
                                        var currQty = objQBPrice[qbpIndex].Quantity;
                                        var currPrice = objQBPrice[qbpIndex].Price;

                                        if (qty >= currQty) {
                                            flPORate = currPrice;

                                            continue;
                                        } else {
                                            break;
                                        }

                                        // flPORate = currPrice;
                                    }

                                }


                                if(isEmpty(flPORate))
                                {
                                    if(!isEmpty(flContractPrice))
                                    {
                                        console.log('postSourcing' + ' | flContractPrice = ' + flContractPrice);

                                        if(!isNaN(flContractPrice))
                                        {
                                            flPORate = parseFloat(flContractPrice);
                                        }

                                    }

                                    if(isNaN(flPORate) || isEmpty(flPORate))
                                    {
                                        console.log('postSourcing' + ' | flItemPurchPrice = ' + flItemPurchPrice);
                                        flPORate = parseFloat(flItemPurchPrice);
                                    }
                                }

                                console.log('postSourcing' + ' | flPORate = ' + flPORate);

                                currentRecord.setCurrentSublistValue({
                                    sublistId: sublistName,
                                    fieldId: 'porate',
                                    value: flPORate
                                });



                                // return false;
                            }
                        }
                        else
                        {
                            // NATO | 03/17/2023 | use item
                            console.log('postSourcing' + ' | Opening item record');
                            var objItem = record.load({ type: 'inventoryitem', id: stItem });

                            //get purchase price
                            var flPurchasePrice = objItem.getValue({ fieldId: 'cost' });

                            //get last purchase price
                            var flLastPurchasePrice = objItem.getValue({ fieldId: 'lastpurchaseprice' });

                            if(!isEmpty(flPurchasePrice))
                            {
                                currentRecord.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "porate",
                                    value: flPurchasePrice
                                });

                            }
                            else if(isEmpty(flPurchasePrice) && !isEmpty(flLastPurchasePrice))
                            {


                                currentRecord.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "porate",
                                    value: flLastPurchasePrice
                                });


                            }
                        }






                    }


                }
            }
            catch(e)
            {
                console.log('SKIPPING ITEM...');
            }


        }

        function pageInit_(context)
        {

            var currentScript = runtime.getCurrentScript();

            SPEEDEE_SHIPPING_METHOD = currentScript.getParameter({ name: 'custscript_param_speedeeshipmethod' });
            WILLCALLSHOPORDER_SHIPPING_METHOD = currentScript.getParameter({ name: 'custscript_param_sm_willcallshoporder' });
            CURRENTRECORD = currentRecord.get();
            if(context.mode == 'copy' || context.mode == 'create' || context.mode == 'edit')
            {
                try
                {
                    var stShipMethod = CURRENTRECORD.getValue({ fieldId: 'shipmethod'});

                    // if( isEmpty(stShipMethod)) { return; }



                    if(CURRENTRECORD.type == 'salesorder')
                    {
                        // hide calc button
                        // jQuery('.uir-field-widget').hide();

                        // from quote
                        var createdfrom = CURRENTRECORD.getValue({fieldId: 'createdfrom'});
                        log.debug({title: 'pageInit', details: 'createdfrom = ' + createdfrom});

                        if (isEmpty(createdfrom)) return;

                        log.debug({title: 'pageInit', details: 'context.mod = ' + context.mode});

                        if (context.mode == 'create' || context.mode == 'copy') {
                            var allitems = [];

                            var itmlen = CURRENTRECORD.getLineCount({sublistId: 'item'});

                            for (var a = itmlen - 1; a >= 0; a--) {
                                var item = CURRENTRECORD.getSublistValue({sublistId: 'item', fieldId: 'item', line: a});
                                allitems.push(item);
                            }

                            if (!isEmpty(allitems)) {
                                var arrFilter = [];

                                arrFilter.push(["internalid","anyof",allitems]);
                                arrFilter.push("AND");
                                arrFilter.push(["custrecord_sna_hul_item.custrecord_sna_hul_primaryvendor","is","T"]);

                                var objItemVP = getItemVendorPrice(arrFilter);

                                if (Object.keys(objItemVP).length > 0) {
                                    // go back to the lines
                                    for (var i = 0; i < itmlen; i++) {
                                        var itm = CURRENTRECORD.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                                        var currpovendor = CURRENTRECORD.getSublistValue({sublistId: 'item', fieldId: 'povendor', line: i});
                                        var currpovendorscript = CURRENTRECORD.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_csi_povendor', line: i});

                                        log.debug({title: 'pageInit', details: 'currpovendor = ' + currpovendor + ' | currpovendorscript: ' + currpovendorscript});

                                        if (!isEmpty(objItemVP[itm])) {
                                            // has primary vendor custom record
                                            if (!isEmpty(objItemVP[itm].poVendor)) {
                                                log.debug({title: 'pageInit', details: 'poVendor = ' + objItemVP[itm].poVendor});

                                                CURRENTRECORD.selectLine({sublistId: 'item', line: i});
                                                CURRENTRECORD.setCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'custcol_sna_csi_povendor',
                                                    value: objItemVP[itm].poVendor,
                                                    ignoreFieldChange: true
                                                });

                                                CURRENTRECORD.setCurrentSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'povendor',
                                                    value: objItemVP[itm].poVendor,
                                                    ignoreFieldChange: true
                                                });
                                                CURRENTRECORD.commitLine({sublistId: 'item'});
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                    else if(CURRENTRECORD.type == 'itemfulfillment')
                    {
                        var stWCSO = runtime.getCurrentScript().getParameter({ name: 'custscript_param_sm_willcallshoporder' });

                        if(stShipMethod == SPEEDEE_SHIPPING_METHOD)
                        {
                            disableParcelFields(false)
                        }
                        // else if(stShipMethod == stWCSO)
                        // {
                        //     CURRENTRECORD.setValue({ fieldId: 'shippingcost', value: 0 });
                        //
                        //
                        // }



                        else
                        {
                            disableParcelFields(true)
                        }


                        CURRENTRECORD.setValue({ fieldId: 'shippingcost', value: 0 });
                    }


                }
                catch(err)
                {
                    console.log (err.name + ' : ' + err.message)

                }

            }
        }

        /**
         * Function to be executed when field value is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.CURRENTRECORD - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            var stLoggerTitle = 'fieldChanged_';
            // console.log(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;

            var line = scriptContext.line;

            var currentRec = scriptContext.currentRecord;


            var objQBPrice = {};


            try
            {
                if (sublist === 'item' && (/*field === 'item' || */field === 'povendor' || field === 'quantity'))
                {
                    var stItem = currentRec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'item' });
                    var arrFilter = [];

                    arrFilter.push(["internalid","anyof",stItem]);

                    if(field == 'item')
                    {

                        arrFilter.push("AND");
                        arrFilter.push(["custrecord_sna_hul_item.custrecord_sna_hul_primaryvendor","is","T"]);

                    }
                    else if(field == 'povendor' || field === 'quantity')
                    {
                        var stPOVendor = currentRec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'povendor' });
                        arrFilter.push("AND");
                        arrFilter.push(["custrecord_sna_hul_item.custrecord_sna_hul_vendor","anyof",stPOVendor]);

                    }




                    if(!isEmpty(stItem))
                    {

                        // new search here
                        var objItemVP = getItemVendorPrice(arrFilter);
                        console.log(stLoggerTitle, 'objItemVP = ' + JSON.stringify(objItemVP));
                        //debugger;

                        if(Object.keys(objItemVP).length > 0)
                        {
                            for(var i in objItemVP)
                            {
                                if(field == 'item')
                                {

                                    // currentRec.setCurrentSublistValue({
                                    //     sublistId: sublist,
                                    //     fieldId: 'povendor',
                                    //     value: objItemVP[i].poVendor,
                                    //     ignoreFieldChange: true
                                    // });

                                    currentRec.setCurrentSublistValue({
                                        sublistId: sublist,
                                        fieldId: 'custcol_sna_csi_povendor',
                                        value: objItemVP[i].poVendor,
                                        ignoreFieldChange: true
                                    });

                                    // currentRec.setSublistValue({
                                    //     sublistId: sublist,
                                    //     fieldId: 'povendor',
                                    //     value: stPOVendor,
                                    //     ignoreFieldChange: true,
                                    //     line: line
                                    // });


                                    /*currentRec.setCurrentSublistValue({
                                        sublistId: sublist,
                                        fieldId: 'povendor',
                                        value: objItemVP[i].poVendor,
                                        ignoreFieldChange: true
                                    });*/

                                    setTimeout(function(){
                                        // nlapiSetCurrentLineItemValue('item', 'povendor', objItemVP[i].poVendor);

                                        currentRec.setCurrentSublistValue({
                                            sublistId: sublist,
                                            fieldId: 'povendor',
                                            value: objItemVP[i].poVendor,
                                            ignoreFieldChange: true
                                        });


                                    }, 800);

                                    // CURRENTRECORD.commitLine({ sublistId: sublist });
                                    //
                                    // CURRENTRECORD.selectLine({ sublistId: sublist, line: line });

                                }
                                else if(field == 'povendor')
                                {

                                    var stPOVendor = currentRec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'povendor' });

                                    currentRec.setCurrentSublistValue({
                                        sublistId: sublist,
                                        fieldId: 'custcol_sna_csi_povendor',
                                        value: stPOVendor,
                                        ignoreFieldChange: true
                                    });

                                    currentRec.setCurrentSublistValue({
                                        sublistId: sublist,
                                        fieldId: 'povendor',
                                        value: stPOVendor,
                                        ignoreFieldChange: true
                                    });



                                }




                                var flPORate = null;
                                var stQBPrice = objItemVP[i].qBPrice;

                                if(!isEmpty(stQBPrice))
                                {
                                    objQBPrice = JSON.parse(stQBPrice);
                                    console.log(stLoggerTitle + ' | objQBPrice = ' + JSON.stringify(objQBPrice));
                                }


                                var flContractPrice = parseFloat(objItemVP[i].contractPrice);


                                var flItemPurchPrice = parseFloat(objItemVP[i].itemPurchPrice);


                                if(Object.keys(objQBPrice).length > 0) {

                                    var qty = currentRec.getCurrentSublistValue({ sublistId: sublist, fieldId: 'quantity' }) || 1;

                                    for (var qbpIndex = 0; qbpIndex < objQBPrice.length; qbpIndex++) {
                                        var currQty = objQBPrice[qbpIndex].Quantity;
                                        var currPrice = objQBPrice[qbpIndex].Price;

                                        if (qty >= currQty) {
                                            flPORate = currPrice;

                                            continue;
                                        } else {
                                            break;
                                        }

                                        // flPORate = currPrice;
                                    }

                                }


                                if(isEmpty(flPORate))
                                {
                                    if(!isEmpty(flContractPrice))
                                    {
                                        console.log(stLoggerTitle + ' | flContractPrice = ' + flContractPrice);

                                        if(!isNaN(flContractPrice))
                                        {
                                            flPORate = parseFloat(flContractPrice);
                                        }

                                    }

                                    if(isNaN(flPORate) || isEmpty(flPORate))
                                    {
                                        console.log(stLoggerTitle + ' | flItemPurchPrice = ' + flItemPurchPrice);
                                        flPORate = parseFloat(flItemPurchPrice);
                                    }
                                }

                                console.log(stLoggerTitle + ' | flPORate = ' + flPORate);

                                if (field === 'quantity') {
                                    currentRec.setCurrentSublistValue({
                                        sublistId: sublist,
                                        fieldId: 'porate',
                                        value: flPORate
                                    });
                                }

                                setTimeout(function(){
                                    currentRec.setCurrentSublistValue({
                                        sublistId: sublist,
                                        fieldId: 'porate',
                                        value: flPORate
                                    });
                                }, 800);



                                // return false;
                            }
                        }
                        else
                        {
                            // NATO | 03/17/2023 | use item
                            console.log(stLoggerTitle + ' | Opening item record');
                            var objItem = record.load({ type: 'inventoryitem', id: stItem });

                            //get purchase price
                            var flPurchasePrice = objItem.getValue({ fieldId: 'cost' });

                            //get last purchase price
                            var flLastPurchasePrice = objItem.getValue({ fieldId: 'lastpurchaseprice' });

                            if(!isEmpty(flPurchasePrice))
                            {
                                currentRec.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "porate",
                                    value: flPurchasePrice
                                });

                            }
                            else if(isEmpty(flPurchasePrice) && !isEmpty(flLastPurchasePrice))
                            {


                                currentRec.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "porate",
                                    value: flLastPurchasePrice
                                });


                            }
                        }






                    }
                }
                else if(sublist === 'item' && field === 'custcol_sna_csi_povendor')
                {
                    //debugger;

                    var stPOVendorS = currentRec.getCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: field
                    });



                    currentRec.setCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: 'povendor',
                        value: stPOVendorS,
                        ignoreFieldChange: true
                    });

                }



                // console.log(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');


                if(field == 'shipmethod')
                {
                    var stShipMethod = currentRec.getValue({ fieldId: 'shipmethod'});

                    if(currentRec.type == 'itemfulfillment')
                    {



                        if(stShipMethod == SPEEDEE_SHIPPING_METHOD)
                        {
                            disableParcelFields(false);
                        }
                        else
                        {
                            disableParcelFields(true);
                        }


                    }

                }
                else if(field == 'custbody_sna_hul_location')
                {
                    var stLocationId = currentRec.getValue({ fieldId: field });

                    currentRec.setValue({ fieldId: 'location', value: stLocationId });
                    // getLocationBySubsidiary(CURRENTRECORD, stSubsidiaryId);

                    // check if item lines has content
                    var intItemLines = currentRec.getLineCount({ sublistId: 'item' });

                    if(intItemLines > 0)
                    {
                        for(var i=0; i<intItemLines; i++)
                        {
                            currentRec.selectLine({ sublistId: 'item', line: i });
                            currentRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: stLocationId });
                        }
                    }
                }
            }
            catch(err)
            {
                console.log('ERROR: ' + err.type + ' | DESC: ' + err.message);
            }


            // console.log(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function validateLine_(scriptContext) {
            var currRec = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;


            var stItem = CURRENTRECORD.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' });

            if(!isEmpty(stItem)) {
                var stLoc = CURRENTRECORD.getValue({ fieldId: 'location' });
                CURRENTRECORD.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'location',
                    value: stLoc,
                    ignoreFieldChange: true
                });
            }


            return true;
        }

        function saveRecord(context)
        {
            var stWCSO = runtime.getCurrentScript().getParameter({ name: 'custscript_param_sm_willcallshoporder' });
            var stFieldId = context.fieldId;
            var bRetVal = true;

            //debugger;
            if(CURRENTRECORD.type == 'itemfulfillment') {

                var stOrderId = CURRENTRECORD.getValue({fieldId: 'custbody_sna_speedeeorderid'});

                var stShipCarrier = CURRENTRECORD.getValue({fieldId: 'shipcarrier'});

                var stShippingMethod = CURRENTRECORD.getValue({fieldId: 'shipmethod'});

                if(stShipCarrier == 'nonups')
                {

                    if (isEmpty(stOrderId))
                    {
                        if(stShippingMethod == stWCSO)
                        {
                            bRetVal =  true;
                        }
                        else
                        {
                            // should be speedee shipping method
                            // alert('Please calculate shipping rate first');   //07/20/2023 | NATO | Removed for now. No calculation needed
                            bRetVal = true;
                        }


                    }

                }


            }

            return bRetVal;
        }

        function disableParcelFields(isDisable)
        {

            if(isDisable)
            {
                // get sublist
                var objSublist = CURRENTRECORD.getSublist({ sublistId: 'custpage_sublist_parcel'});
                objSublist.getColumn({
                    fieldId: "custpage_sl_contentsdesc"
                }).isDisabled = true;

                objSublist.getColumn({
                    fieldId: "custpage_sl_weightinlbs"
                }).isDisabled = true;

                objSublist.getColumn({
                    fieldId: "custpage_sl_declaredvalue"
                }).isDisabled = true;

                objSublist.getColumn({
                    fieldId: "custpage_sl_lengthininches"
                }).isDisabled = true;

                objSublist.getColumn({
                    fieldId: "custpage_sl_widthininches"
                }).isDisabled = true;

                objSublist.getColumn({
                    fieldId: "custpage_sl_heightininches"
                }).isDisabled = true;
            }
            else
            {
                // get sublist
                var objSublist = CURRENTRECORD.getSublist({ sublistId: 'custpage_sublist_parcel'});
                objSublist.getColumn({
                    fieldId: "custpage_sl_contentsdesc"
                }).isDisabled = false;

                objSublist.getColumn({
                    fieldId: "custpage_sl_weightinlbs"
                }).isDisabled = false;

                objSublist.getColumn({
                    fieldId: "custpage_sl_declaredvalue"
                }).isDisabled = false;

                objSublist.getColumn({
                    fieldId: "custpage_sl_lengthininches"
                }).isDisabled = false;

                objSublist.getColumn({
                    fieldId: "custpage_sl_widthininches"
                }).isDisabled = false;

                objSublist.getColumn({
                    fieldId: "custpage_sl_heightininches"
                }).isDisabled = false;
            }

        }
        function calculateShippingCost(stSpeeDeeShipMethodId, stSpeeDeeToken, stSpeeDeeCarrierAcct)
        {

            //alert('stSpeeDeeToken = ' + stSpeeDeeToken);
            //debugger;

            var objCurrRec = currentRecord.get();

            // alert('record type = ' + objCurrRec.type);
            var stRecordType = objCurrRec.type;
            var stShippingMethod = objCurrRec.getValue({ fieldId: 'shipmethod'});


            if(stShippingMethod == WILLCALLSHOPORDER_SHIPPING_METHOD)
            {
                //alert('WILLCALLSHOPORDER_SHIPPING_METHOD = ' + WILLCALLSHOPORDER_SHIPPING_METHOD);

                objCurrRec.setValue({fieldId: 'shippingcost', value: 0 });
            }
            else if(stShippingMethod == stSpeeDeeShipMethodId )
            {
                //alert('execute speedee integration');

                calculateSpeeDeeRates(objCurrRec, stSpeeDeeToken, stRecordType, stSpeeDeeCarrierAcct);
            }
            else
            {
                Shipping.calculateRates();
            }



        }

        function printParcel()
        {
            var objCurrRec = currentRecord.get();


            // call manifest suitelet
            var objParams = {
                ifId: objCurrRec.id

            };


            // call url with dates to filter
            var stURL = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_spdmanifestrrpt',
                deploymentId: 'customdeploy_sna_hul_sl_spdmanifestrrpt',
                params: objParams
            });

            // Redirect Using the generated URL
            window.ischanged = false;
            // window.location = stURL;
            window.open(stURL,'_blank');

        }


        function calculateSpeeDeeRates(objCurrRec, stSpeeDeeToken, stRecordType, stSpeeDeeCarrierAcct)
        {


            var objCustomerAddress = {};
            var objLocationAddress = {};
            var stCustomer = objCurrRec.getValue({ fieldId: 'entity' });
            var stShipTo = objCurrRec.getValue({ fieldId: 'shipaddresslist' });
            var stLocation = '';

            //sum item weight in lbs
            var flSumOfWeightInLBS = 0;

            var flSumShippingRate = 0;
            var flLength = 12;
            var flWidth = 12;
            var flHeight = 12;

            if(!isEmpty(stCustomer))
            {
                objCustomerAddress = getCustomerAddress(stCustomer, stShipTo);
                console.log('objCustomerAddress = ' + JSON.stringify(objCustomerAddress));
            }
            else
            {
                alert('Customer is not set.');
                return;
            }






            if(stRecordType == 'salesorder')
            {
                stLocation = objCurrRec.getValue({ fieldId: 'location' });

                if(!isEmpty(stLocation))
                {
                    objLocationAddress = getLocationAddress(stLocation);
                    console.log('objLocationAddress = ' + JSON.stringify(objLocationAddress));
                }
                else
                {
                    alert('Location is not set.');
                    return;
                }


                var intLineCount = objCurrRec.getLineCount({ sublistId: 'item' });

                for(var i = 0; i < intLineCount; i++)
                {
                    var flQty = objCurrRec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });

                    var objItem = search.lookupFields({type: 'item', id: objCurrRec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i}), columns: ['weight', 'weightunit']});
                    var flWeight = parseFloat(objItem.weight) * flQty;
                    var flWeightUnit = (!isEmpty(objItem.weightunit) ? objItem.weightunit[0].value : '');

                    //Convert Weight if necessary
                    if(flWeightUnit == '1') { //lb to lb
                        flWeight =  flWeight.toFixed(0);
                    }
                    else if(flWeightUnit == '2') { //oz to lb
                        flWeight = (flWeight * 0.0625).toFixed(0);
                    }
                    else if(flWeightUnit == '3') { //kg to lb
                        flWeight = (flWeight * 2.20462).toFixed(0);
                    }
                    else if(flWeightUnit == '4') { //g to lb
                        flWeight = (flWeight * 0.00220462).toFixed(0);
                    }

                    flSumOfWeightInLBS += parseFloat(flWeight);
                }

                var objParam = {
                    "shipment": {
                        "carrier_account": stSpeeDeeCarrierAcct,
                        // "service":"first",
                        "object": "Shipment",
                        "to_address": {
                            "object": "Address",
                            "name": objCustomerAddress[stCustomer].altName,
                            "street1": objCustomerAddress[stCustomer].address1,
                            "street2": objCustomerAddress[stCustomer].address2,
                            "city": objCustomerAddress[stCustomer].city,
                            "state": objCustomerAddress[stCustomer].state,
                            "zip": objCustomerAddress[stCustomer].zipCode,
                            "country": objCustomerAddress[stCustomer].country,
                            "phone": objCustomerAddress[stCustomer].phone,
                            "email": null
                        },
                        "from_address": {
                            "object": "Address",
                            "name": objLocationAddress[stLocation].altName,
                            "company": objLocationAddress[stLocation].altName,
                            "street1": objLocationAddress[stLocation].address1,
                            "street2": objLocationAddress[stLocation].address2,
                            "city": objLocationAddress[stLocation].city,
                            "state": objLocationAddress[stLocation].state,
                            "zip": objLocationAddress[stLocation].zipCode,
                            "country": objLocationAddress[stLocation].country,
                            "phone": objLocationAddress[stLocation].phone,
                            "email": null
                        },
                        "parcel": {
                            "object": "Parcel",
                            "weight": flSumOfWeightInLBS,
                            "length": flLength,
                            "height": flHeight,
                            "width": flWidth
                        }
                    }
                };

                var stSpeeDeeAPIURL = 'https://www.easypost.com/api/v2/shipments';


                var headers = {
                    'Authorization': "Bearer " + stSpeeDeeToken,
                    'Content-Type': 'application/json'


                };

                https.post.promise({
                    url: stSpeeDeeAPIURL,
                    headers: headers,
                    body: JSON.stringify(objParam)
                }).then(function (response){
                    console.log('Response : ' + JSON.stringify(response));

                    if(response.code == 201)
                    {
                        var obj = JSON.parse(response.body);
                        console.log('obj : ' + JSON.stringify(obj));

                        if(obj.messages.length == 0)
                        {
                            objCurrRec.setValue({fieldId: 'shippingcost', value: obj.rates[0].rate || 0});
                        }
                        else
                        {

                            objCurrRec.setValue({fieldId: 'shippingcost', value: 0});
                            alert('Error : Spee-dee is not supported for the selected Customer Address.');
                        }


                    }
                    else
                    {
                        alert('An unexpected error has occured. Status: ' + response.code);
                    }


                }).catch(function onRejected(reason) {
                    console.log('Reason : Spee-dee is not supported for the selected Customer Address.');
                });





            }
            else if(stRecordType == 'itemfulfillment')
            {
                var stSpeeDeeOrderId = objCurrRec.getValue({ fieldId: 'custbody_sna_speedeeorderid' });



                stLocation = objCurrRec.getSublistValue({ sublistId: 'item', fieldId: 'location', line: 0 });

                if(!isEmpty(stLocation))
                {
                    objLocationAddress = getLocationAddress(stLocation);
                    console.log('objLocationAddress = ' + JSON.stringify(objLocationAddress));
                }
                else
                {
                    alert('Location is not set.');
                    return;
                }

                var intPackagesCount = objCurrRec.getLineCount({ sublistId: 'custpage_sublist_parcel' });

                var objOrder = {};

                var arrShipments = [];

                for(var ii = 0; ii < intPackagesCount; ii++)
                {
                    flWeight = isEmpty(objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_weightinlbs', line: ii })) ? 0 : objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_weightinlbs', line: ii });
                    flLength = isEmpty(objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_lengthininches', line: ii })) ? 0 : objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_lengthininches', line: ii });
                    flWidth = isEmpty(objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_widthininches', line: ii }))  ? 0 : objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_widthininches', line: ii });
                    flHeight = isEmpty(objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_heightininches', line: ii })) ? 0 : objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_heightininches', line: ii });

                    arrShipments.push({
                        "object": "Shipment",
                        "to_address": {
                            "object": "Address",
                            "name": objCustomerAddress[stCustomer].altName,
                            "street1": objCustomerAddress[stCustomer].address1,
                            "street2": objCustomerAddress[stCustomer].address2,
                            "city": objCustomerAddress[stCustomer].city,
                            "state": objCustomerAddress[stCustomer].state,
                            "zip": objCustomerAddress[stCustomer].zipCode,
                            "country": objCustomerAddress[stCustomer].country,
                            "phone": objCustomerAddress[stCustomer].phone,
                            "email": null
                        },
                        "from_address": {
                            "object": "Address",
                            "name": objLocationAddress[stLocation].altName,
                            "company": objLocationAddress[stLocation].altName,
                            "street1": objLocationAddress[stLocation].address1,
                            "street2": objLocationAddress[stLocation].address2,
                            "city": objLocationAddress[stLocation].city,
                            "state": objLocationAddress[stLocation].state,
                            "zip": objLocationAddress[stLocation].zipCode,
                            "country": objLocationAddress[stLocation].country,
                            "phone": objLocationAddress[stLocation].phone,
                            "email": null
                        },
                        "parcel": {
                            "object": "Parcel",
                            "weight": flWeight,
                            "length": flLength,
                            "height": flHeight,
                            "width": flWidth
                        }

                    });


                }

                objOrder = {
                    "order": {
                        // "carrier" : "SpeeDee",
                        // "service" : "SpeeDeeDelivery",
                        "carrier_accounts":stSpeeDeeCarrierAcct,
                        "to_address" :{
                            "object": "Address",
                            "name": objCustomerAddress[stCustomer].altName,
                            "street1": objCustomerAddress[stCustomer].address1,
                            "street2": objCustomerAddress[stCustomer].address2,
                            "city": objCustomerAddress[stCustomer].city,
                            "state": objCustomerAddress[stCustomer].state,
                            "zip": objCustomerAddress[stCustomer].zipCode,
                            "country": objCustomerAddress[stCustomer].country,
                            "phone": objCustomerAddress[stCustomer].phone,
                            "email": null
                        },
                        "from_address" :{
                            "object": "Address",
                            "name": objLocationAddress[stLocation].altName,
                            "company": objLocationAddress[stLocation].altName,
                            "street1": objLocationAddress[stLocation].address1,
                            "street2": objLocationAddress[stLocation].address2,
                            "city": objLocationAddress[stLocation].city,
                            "state": objLocationAddress[stLocation].state,
                            "zip": objLocationAddress[stLocation].zipCode,
                            "country": objLocationAddress[stLocation].country,
                            "phone": objLocationAddress[stLocation].phone,
                            "email": null
                        },
                        "shipments" : arrShipments

                    }
                }

                console.log('objOrder = ' + JSON.stringify(objOrder));
                objCurrRec.setValue({ fieldId: 'custbody_sna_speedeeorderdetails', value: JSON.stringify(objOrder)})

                var stSpeeDeeAPIURL = 'https://www.easypost.com/api/v2/orders/';


                var headers = {
                    'Authorization': "Bearer " + stSpeeDeeToken,
                    'Content-Type': 'application/json'


                };

                var response = https.post({
                    url: stSpeeDeeAPIURL,
                    headers: headers,
                    body: JSON.stringify(objOrder)
                });


                switch(response.code)
                {
                    case 201:
                        var obj = JSON.parse(response.body);

                        objCurrRec.setValue({ fieldId: 'custbody_sna_speedeeorderreturn', value: JSON.stringify(obj)})



                        var objShipments = obj.shipments;

                        for(var index in objShipments)
                        {


                            objCurrRec.selectLine({ sublistId: 'custpage_sublist_parcel', line: index });

                            if(objShipments[index].messages.length == 0)
                            {
                                objCurrRec.setCurrentSublistValue({
                                    sublistId: 'custpage_sublist_parcel',
                                    fieldId: 'custpage_sl_shipmentid',
                                    value: objShipments[index].id,

                                });

                                objCurrRec.setCurrentSublistValue({
                                    sublistId: 'custpage_sublist_parcel',
                                    fieldId: 'custpage_sl_shippingcost',
                                    value: parseFloat(objShipments[index].rates[0].rate) || 0,

                                });

                                objCurrRec.setCurrentSublistValue({
                                    sublistId: 'custpage_sublist_parcel',
                                    fieldId: 'custpage_sl_remarks',
                                    value: '',

                                });

                            }
                            else
                            {

                                objCurrRec.setCurrentSublistValue({
                                    sublistId: 'custpage_sublist_parcel',
                                    fieldId: 'custpage_sl_shippingcost',
                                    value: 0,

                                });

                                objCurrRec.setCurrentSublistValue({
                                    sublistId: 'custpage_sublist_parcel',
                                    fieldId: 'custpage_sl_remarks',
                                    value: 'Spee-dee is not supported for the selected Customer Address.'

                                });

                                alert("Spee-dee is not supported for the selected Customer Address.");

                                break;
                            }
                            objCurrRec.commitLine({ sublistId: 'custpage_sublist_parcel' });




                        }



                        flSumShippingRate = obj.messages.length == 0 ? parseFloat(obj.rates[0].rate) : 0;
                        objCurrRec.setValue({fieldId: 'shippingcost', value: flSumShippingRate});

                        objCurrRec.setValue({fieldId: 'custbody_sna_speedeeorderid', value: obj.id});

                        objCurrRec.setValue({ fieldId: 'custbody_sna_speedeeorderbought', value: false });

                        break;

                    case 200:
                    case 400:
                    case 401:
                    case 402:
                    case 404:
                    case 409:
                    case 422:
                        var objError = JSON.parse(response.body);
                        alert("Spee-dee is not supported for the selected Customer Address.");
                        break;
                }



            }




        }

        function getCustomerAddress(stId, stShipTo)
        {

            var objCustomer = {};


            if((!isEmpty(stId)))
            {
                var objSearch = search.create({
                    type: "customer",
                    filters:
                        [
                            ["internalid","anyof",stId],
                            "AND",
                            ["formulatext: {Address.addressinternalid}","is",stShipTo]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC
                            }),
                            "altname",
                            "address",
                            search.createColumn({
                                name: "addressee",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "addresslabel",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "address1",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "address2",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "address3",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "city",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "zipcode",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "state",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "statedisplayname",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "country",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "countrycode",
                                join: "Address"
                            }),
                            search.createColumn({
                                name: "addressphone",
                                join: "Address"
                            })
                        ]
                });
                var searchResultCount = objSearch.runPaged().count;

                objSearch.run().each(function(result){
                    objCustomer[result.id] = {
                        entityId: result.getValue({ name : 'entityid' }),
                        altName: result.getValue({ name : 'altname' }),
                        address: result.getValue({ name : 'address' }),
                        addressLabel: result.getValue({ name : 'addresslabel', join: 'address' }),
                        address1: result.getValue({ name : 'address1', join: 'address' }),
                        address2: result.getValue({ name : 'address2', join: 'address' }),
                        address3: result.getValue({ name : 'address3', join: 'address' }),
                        city: result.getValue({ name : 'city', join: 'address' }),
                        zipCode: result.getValue({ name : 'zipcode', join: 'address' }),
                        state: result.getValue({ name : 'state', join: 'address' }),
                        stateDisplayName: result.getValue({ name : 'statedisplayname', join: 'address' }),
                        country: result.getValue({ name : 'country', join: 'address' }),
                        countryCode: result.getValue({ name : 'countrycode', join: 'address' }),
                        phone: result.getValue({ name : 'addressphone', join: 'address' }),
                    };
                    return true;
                });
            }



            return objCustomer;
        }

        function getLocationAddress(stId)
        {

            var objLocation = {};


            if((!isEmpty(stId)))
            {
                var objSearch = search.create({
                    type: "location",
                    filters:
                        [
                            ["internalid","anyof",stId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC
                            }),
                            "address1",
                            "address2",
                            "address3",
                            "city",
                            "state",
                            "zip",
                            "country",
                            "phone"
                        ]
                });
                var searchResultCount = objSearch.runPaged().count;

                objSearch.run().each(function(result){
                    objLocation[result.id] = {
                        entityId: result.id,
                        altName: result.getValue({ name : 'name' }),
                        address: '',
                        addressLabel: '',
                        address1: result.getValue({ name : 'address1' }),
                        address2: result.getValue({ name : 'address2' }),
                        address3: result.getValue({ name : 'address3' }),
                        city: result.getValue({ name : 'city' }),
                        zipCode: result.getValue({ name : 'zip' }),
                        state: result.getValue({ name : 'state' }),
                        stateDisplayName: '',
                        country: result.getValue({ name : 'country' }),
                        countryCode: result.getValue({ name : 'country' }),
                        phone: result.getValue({ name : 'phone' }),
                    };
                    return true;
                });
            }



            return objLocation;
        }

        function getItemVendorPrice(arrFilters)
        {
            var stLoggerTitle = 'getItemVendorPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');



            var objRetVal = {};



            try
            {
                var objItem = search.create({
                    type: "item",
                    filters: arrFilters,
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC
                            }),
                            "displayname",
                            "salesdescription",
                            "type",
                            search.createColumn({
                                name: "custrecord_sna_hul_vendor",
                                join: "CUSTRECORD_SNA_HUL_ITEM"
                            }),
                            search.createColumn({
                                name: "custrecord_sna_hul_qtybreakprices",
                                join: "CUSTRECORD_SNA_HUL_ITEM"
                            }),
                            search.createColumn({
                                name: "custrecord_sna_hul_contractprice",
                                join: "CUSTRECORD_SNA_HUL_ITEM"
                            }),
                            search.createColumn({
                                name: "custrecord_sna_hul_itempurchaseprice",
                                join: "CUSTRECORD_SNA_HUL_ITEM"
                            }),
                            search.createColumn({
                                name: "custrecord_sna_hul_listprice",
                                join: "CUSTRECORD_SNA_HUL_ITEM"
                            }),
                            search.createColumn({
                                name: "custrecord_sna_hul_primaryvendor",
                                join: "CUSTRECORD_SNA_HUL_ITEM"
                            })
                        ]
                });

                var searchResultCount = objItem.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);

                objItem.run().each(function(result) {
                    // log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));



                    console.log(stLoggerTitle + ' | result = ' + JSON.stringify(result));

                    objRetVal[result.id] = {
                        poVendor: result.getValue({
                            name: 'custrecord_sna_hul_vendor',
                            join: 'CUSTRECORD_SNA_HUL_ITEM'
                        }),
                        qBPrice: result.getValue({
                            name: 'custrecord_sna_hul_qtybreakprices',
                            join: 'CUSTRECORD_SNA_HUL_ITEM'
                        }),
                        contractPrice: result.getValue({
                            name: 'custrecord_sna_hul_contractprice',
                            join: 'CUSTRECORD_SNA_HUL_ITEM'
                        }),
                        itemPurchPrice: result.getValue({
                            name: 'custrecord_sna_hul_itempurchaseprice',
                            join: 'CUSTRECORD_SNA_HUL_ITEM'
                        })

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



            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return objRetVal;
        }


        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }


        return {

            pageInit: pageInit_,
            saveRecord: saveRecord,
            calculateShippingCost: calculateShippingCost,
            fieldChanged: fieldChanged,
            printParcel: printParcel,
            postSourcing: postSourcing,
            validateLine: validateLine_
        };
    });