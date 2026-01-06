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
        function pageInit_(context)
        {
            //debugger;
            var currentScript = runtime.getCurrentScript();
            SPEEDEE_SHIPPING_METHOD = currentScript.getParameter({ name: 'custscript_param_speedeeshipmethod' });
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
                    }
                    else if(CURRENTRECORD.type == 'itemfulfillment')
                    {
                        if(stShipMethod != SPEEDEE_SHIPPING_METHOD)
                        {
                            disableParcelFields(true)
                        }
                        else
                        {
                            disableParcelFields(false)
                        }
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
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            var field = scriptContext.fieldId;
            var sublist = scriptContext.sublistId;

            var line = scriptContext.line;

            //debugger;




            if(field == 'shipmethod')
            {
                var stShipMethod = CURRENTRECORD.getValue({ fieldId: 'shipmethod'});

                if(CURRENTRECORD.type == 'itemfulfillment')
                {
                    if(stShipMethod != SPEEDEE_SHIPPING_METHOD)
                    {
                        disableParcelFields(true)
                    }
                    else
                    {
                        disableParcelFields(false)
                    }
                }

            }
        }


        function saveRecord(context)
        {

            var stFieldId = context.fieldId;
            var bRetVal = true;
            if(CURRENTRECORD.type == 'itemfulfillment') {

                var stOrderId = CURRENTRECORD.getValue({fieldId: 'custbody_sna_speedeeorderid'});

                var stShipCarrier = CURRENTRECORD.getValue({fieldId: 'shipcarrier'});

                if(stShipCarrier == 'nonups')
                {
                    if (isEmpty(stOrderId)) {
                        alert('Please calculate shipping rate first');
                        bRetVal = false;
                    }
                }


            }

            return bRetVal;
        }

        function disableParcelFields(isDisable)
        {
            //debugger;
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

            var objCurrRec = currentRecord.get();
            // alert('record type = ' + objCurrRec.type);
            var stRecordType = objCurrRec.type;
            var stShippingMethod = objCurrRec.getValue({ fieldId: 'shipmethod'});

            if(stSpeeDeeShipMethodId != stShippingMethod)
            {
                Shipping.calculateRates();
            }
            else
            {
                //alert('execute speedee integration');

                calculateSpeeDeeRates(objCurrRec, stSpeeDeeToken, stRecordType, stSpeeDeeCarrierAcct);
            }



        }

        function printParcel()
        {
            var objCurrRec = currentRecord.get();


            // call manifest suitelet
            var objParams = {
                ifId: objCurrRec.id

            };

            //load record to get parcel data
            var recIF = record.load({ type: 'itemfulfillment', id: objCurrRec.id });
            var stParcelJSON = recIF.getValue({ fieldId: 'custbody_sna_parceljson' });
            console.log('stParcelJSON = ' + stParcelJSON)

            if(!isEmpty(stParcelJSON))
            {
                var objParcelJSON = JSON.parse(stParcelJSON)

                for(var i in objParcelJSON)
                {
                    window.open(objParcelJSON[i].postageLabel);
                }
            }
            else
            {
                alert('Nothing to print...');
            }


            // // call url with dates to filter
            // var stURL = url.resolveScript({
            //     scriptId: 'customscript_sna_hul_sl_spdmanifestrrpt',
            //     deploymentId: 'customdeploy_sna_hul_sl_spdmanifestrrpt',
            //     params: objParams
            // });
            //
            // // Redirect Using the generated URL
            // window.ischanged = false;
            // // window.location = stURL;
            // window.open(stURL,'_blank');

        }


        function calculateSpeeDeeRates(objCurrRec, stSpeeDeeToken, stRecordType, stSpeeDeeCarrierAcct)
        {
            //debugger;

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


                //debugger;
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
            printParcel: printParcel
        };
    });