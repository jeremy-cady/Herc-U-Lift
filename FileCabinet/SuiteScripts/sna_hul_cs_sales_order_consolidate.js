/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/08/01           98786            sjprat         Initial Version -
 * 2023/08/24           97587            aduldulao      Move pageinit to beforeload customscript_sna_hul_ue_lockqteconvert
 * 2023/11/21                            fang           Add printWarrantyFxn
 * 2024/02/20                         Vishal Pitale         Initial Version
 * 2023/03/16       		             Amol Jagkar        Initial Version
 * 2022/05/16						            natoretiro      	Initial version
 * 2022/07/06                                    nretiro             hide calculate shipping button
 * 2023/01/11                                    nretiro             disables parcel fields if Shipping Method is not
 *                                                                   SpeeDee
 * 2023/01/30                                    nretiro             adjustment to open manifest suitelet in order to print label/s
 * 2023/02/24                                    nretiro             removed call to suitelet in printing parcel. will now execute print immediately
 * 2023/07/27                                    nretiro             THIS SCRIPT HAS BEEN DEPRECATED BY SNA_HUL_CS_.JS -- THIS CAN BE DELETED
 */

define([
    'N/runtime',
    'N/search',
    'N/url',
    'N/ui/message',
    'N/ui/dialog',
    'N/https'
], function (runtime, search, url, message, dialog, https) {

    // source: sna_hul_cs_calcshippingcost.js
    let CURRENT_RECORD = null;
    let SPEEDEE_SHIPPING_METHOD = '';

    // source: sna_hul_cs_so_porequired.js
    let PO_REQUIRED_MESSAGE = null;
    let CREATE_MODE = false;

    const isEmpty = (value) => {
        if (value == null) return true; // handle null and undefined
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    };

    // source: sna_hul_cs_calcshippingcost.js
    function getCustomerAddress(stId, stShipTo) {
        var objCustomer = {};
        if ((!isEmpty(stId))) {
            var objSearch = search.create({
                type: "customer",
                filters: [
                    ["internalid", "anyof", stId],
                    "AND",
                    ["formulatext: {Address.addressinternalid}", "is", stShipTo]
                ],
                columns: [
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
            objSearch.run().each(function (result) {
                objCustomer[result.id] = {
                    entityId: result.getValue({ name: 'entityid' }),
                    altName: result.getValue({ name: 'altname' }),
                    address: result.getValue({ name: 'address' }),
                    addressLabel: result.getValue({ name: 'addresslabel', join: 'address' }),
                    address1: result.getValue({ name: 'address1', join: 'address' }),
                    address2: result.getValue({ name: 'address2', join: 'address' }),
                    address3: result.getValue({ name: 'address3', join: 'address' }),
                    city: result.getValue({ name: 'city', join: 'address' }),
                    zipCode: result.getValue({ name: 'zipcode', join: 'address' }),
                    state: result.getValue({ name: 'state', join: 'address' }),
                    stateDisplayName: result.getValue({ name: 'statedisplayname', join: 'address' }),
                    country: result.getValue({ name: 'country', join: 'address' }),
                    countryCode: result.getValue({ name: 'countrycode', join: 'address' }),
                    phone: result.getValue({ name: 'addressphone', join: 'address' }),
                };
                return true;
            });
        }
        return objCustomer;
    }

    // source: sna_hul_cs_calcshippingcost.js
    const getLocationAddress = (stId) => {
        var objLocation = {};
        if ((!isEmpty(stId))) {
            var objSearch = search.create({
                type: "location",
                filters: [["internalid", "anyof", stId]],
                columns: [
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
            objSearch.run().each(function (result) {
                objLocation[result.id] = {
                    entityId: result.id,
                    altName: result.getValue({ name: 'name' }),
                    address: '',
                    addressLabel: '',
                    address1: result.getValue({ name: 'address1' }),
                    address2: result.getValue({ name: 'address2' }),
                    address3: result.getValue({ name: 'address3' }),
                    city: result.getValue({ name: 'city' }),
                    zipCode: result.getValue({ name: 'zip' }),
                    state: result.getValue({ name: 'state' }),
                    stateDisplayName: '',
                    country: result.getValue({ name: 'country' }),
                    countryCode: result.getValue({ name: 'country' }),
                    phone: result.getValue({ name: 'phone' }),
                };
                return true;
            });
        }
        return objLocation;
    };

    // source: sna_hul_cs_calcshippingcost.js
    const calculateSpeeDeeRates = (objCurrRec, stSpeeDeeToken, stRecordType, stSpeeDeeCarrierAcct) => {
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

        if (!isEmpty(stCustomer)) {
            objCustomerAddress = getCustomerAddress(stCustomer, stShipTo);
            console.log('objCustomerAddress = ' + JSON.stringify(objCustomerAddress));
        } else {
            dialog.alert({
                title: 'Customer is not set.',
                message: 'Customer is not set.'
            });
            return;
        }

        if (stRecordType == 'salesorder') {
            stLocation = objCurrRec.getValue({ fieldId: 'location' });
            if (!isEmpty(stLocation)) {
                objLocationAddress = getLocationAddress(stLocation);
                console.log('objLocationAddress = ' + JSON.stringify(objLocationAddress));
            } else {
                dialog.alert({
                    title: 'Location is not set.',
                    message: 'Location is not set.'
                });
                return;
            }
            var intLineCount = objCurrRec.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < intLineCount; i++) {
                var flQty = objCurrRec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });

                var objItem = search.lookupFields({
                    type: 'item',
                    id: objCurrRec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }),
                    columns: ['weight', 'weightunit']
                });
                var flWeight = parseFloat(objItem.weight) * flQty;
                var flWeightUnit = (!isEmpty(objItem.weightunit) ? objItem.weightunit[0].value : '');

                //Convert Weight if necessary
                if (flWeightUnit == '1') { //lb to lb
                    flWeight = flWeight.toFixed(0);
                } else if (flWeightUnit == '2') { //oz to lb
                    flWeight = (flWeight * 0.0625).toFixed(0);
                } else if (flWeightUnit == '3') { //kg to lb
                    flWeight = (flWeight * 2.20462).toFixed(0);
                } else if (flWeightUnit == '4') { //g to lb
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
            }).then(function (response) {
                console.log('Response : ' + JSON.stringify(response));

                if (response.code == 201) {
                    var obj = JSON.parse(response.body);
                    console.log('obj : ' + JSON.stringify(obj));

                    if (obj.messages.length == 0) {
                        objCurrRec.setValue({ fieldId: 'shippingcost', value: obj.rates[0].rate || 0 });
                    } else {

                        objCurrRec.setValue({ fieldId: 'shippingcost', value: 0 });
                        dialog.alert({
                            title: 'Error : Spee-dee is not supported for the selected Customer Address.',
                            message: 'Error : Spee-dee is not supported for the selected Customer Address.'
                        });
                    }


                } else {
                    dialog.alert({
                        title: 'An unexpected error has occured. Status: ' + response.code,
                        message: 'An unexpected error has occured. Status: ' + response.code
                    });
                }


            }).catch(function onRejected(reason) {
                console.log('Reason : Spee-dee is not supported for the selected Customer Address.');
            });


        } else if (stRecordType == 'itemfulfillment') {
            stLocation = objCurrRec.getSublistValue({ sublistId: 'item', fieldId: 'location', line: 0 });

            if (!isEmpty(stLocation)) {
                objLocationAddress = getLocationAddress(stLocation);
                console.log('objLocationAddress = ' + JSON.stringify(objLocationAddress));
            } else {
                dialog.alert({
                    title: 'Location is not set.',
                    message: 'Location is not set.'
                });
                return;
            }

            var intPackagesCount = objCurrRec.getLineCount({ sublistId: 'custpage_sublist_parcel' });

            var objOrder = {};

            var arrShipments = [];

            for (var ii = 0; ii < intPackagesCount; ii++) {
                flWeight = isEmpty(objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_weightinlbs',
                    line: ii
                })) ? 0 : objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_weightinlbs',
                    line: ii
                });
                flLength = isEmpty(objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_lengthininches',
                    line: ii
                })) ? 0 : objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_lengthininches',
                    line: ii
                });
                flWidth = isEmpty(objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_widthininches',
                    line: ii
                })) ? 0 : objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_widthininches',
                    line: ii
                });
                flHeight = isEmpty(objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_heightininches',
                    line: ii
                })) ? 0 : objCurrRec.getSublistValue({
                    sublistId: 'custpage_sublist_parcel',
                    fieldId: 'custpage_sl_heightininches',
                    line: ii
                });

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
                    "carrier_accounts": stSpeeDeeCarrierAcct,
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
                    "shipments": arrShipments

                }
            }

            objCurrRec.setValue({ fieldId: 'custbody_sna_speedeeorderdetails', value: JSON.stringify(objOrder) })
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
            switch (response.code) {
                case 201:
                    var obj = JSON.parse(response.body);
                    objCurrRec.setValue({ fieldId: 'custbody_sna_speedeeorderreturn', value: JSON.stringify(obj) })
                    var objShipments = obj.shipments;
                    for (var index in objShipments) {
                        objCurrRec.selectLine({ sublistId: 'custpage_sublist_parcel', line: index });
                        if (objShipments[index].messages.length == 0) {
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
                        } else {

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

                            dialog.alert({
                                title: "Spee-dee is not supported for the selected Customer Address.",
                                message: "Spee-dee is not supported for the selected Customer Address."
                            });

                            break;
                        }
                        objCurrRec.commitLine({ sublistId: 'custpage_sublist_parcel' });
                    }
                    flSumShippingRate = obj.messages.length == 0 ? parseFloat(obj.rates[0].rate) : 0;
                    objCurrRec.setValue({ fieldId: 'shippingcost', value: flSumShippingRate });
                    objCurrRec.setValue({ fieldId: 'custbody_sna_speedeeorderid', value: obj.id });
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
                    dialog.alert({
                        title: "Spee-dee is not supported for the selected Customer Address.",
                        message: "Spee-dee is not supported for the selected Customer Address."
                    })
                    break;
            }
        }
    };

    // source: sna_hul_cs_calcshippingcost.js
    const calculateShippingCost = (stSpeeDeeShipMethodId, stSpeeDeeToken, stSpeeDeeCarrierAcct) => {
        var objCurrRec = currentRecord.get();
        var stRecordType = objCurrRec.type;
        var stShippingMethod = objCurrRec.getValue({ fieldId: 'shipmethod' });

        if (stSpeeDeeShipMethodId != stShippingMethod) {
            Shipping.calculateRates();
        } else {
            calculateSpeeDeeRates(objCurrRec, stSpeeDeeToken, stRecordType, stSpeeDeeCarrierAcct);
        }
    };

    // source: sna_hul_cs_calcshippingcost.js
    function printParcel() {
        var objCurrRec = currentRecord.get();
        // call manifest suitelet
        var objParams = {
            ifId: objCurrRec.id
        };

        //load record to get parcel data
        var recIF = record.load({ type: 'itemfulfillment', id: objCurrRec.id });
        var stParcelJSON = recIF.getValue({ fieldId: 'custbody_sna_parceljson' });
        console.log('stParcelJSON = ' + stParcelJSON)

        if (!isEmpty(stParcelJSON)) {
            var objParcelJSON = JSON.parse(stParcelJSON)

            for (var i in objParcelJSON) {
                window.open(objParcelJSON[i].postageLabel);
            }
        } else {
            dialog.alert({
                title: 'Nothing to print...',
                message: 'Nothing to print...'
            });
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


    // source: sna_hul_cs_salesorder.js
    const handleCommissionOverride = (context) => {
        let currentRecord = context.currentRecord;
        const commOverride = currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_override_commission'
        });
        const commAmtField = currentRecord.getSublistField({
            sublistId: 'item',
            fieldId: 'custcol_sna_commission_amount',
            line: context.line
        });

        commAmtField.isDisabled = !(isTrue(commOverride));
    };

    // source: sna_hul_cs_so_porequired.js
    const handlePORequirements = () => {
        const customer = CURRENT_RECORD.getValue({ fieldId: 'entity' });
        if (!isEmpty(customer)) {
            const poFields = search.lookupFields({
                type: 'customer',
                id: customer,
                columns: ['custentity_sna_hul_po_required', 'custentity_sna_blanket_po']
            });

            let poNum = CURRENT_RECORD.getValue({ fieldId: 'otherrefnum' });

            if (!isEmpty(poFields['custentity_sna_blanket_po']) && isEmpty(poNum)) {
                CURRENT_RECORD.setValue({
                    fieldId: 'otherrefnum',
                    value: poFields['custentity_sna_blanket_po']
                });
                poNum = poFields['custentity_sna_blanket_po'];
            }

            if (poFields['custentity_sna_hul_po_required'] && isEmpty(poNum)) {
                PO_REQUIRED_MESSAGE.show();
            } else {
                PO_REQUIRED_MESSAGE.hide();
            }
        }
    };

    // source: sna_hul_cs_calcshippingcost.js
    const disableParcelFields = (isDisable) => {
        const fieldIds = [
            'custpage_sl_contentsdesc',
            'custpage_sl_weightinlbs',
            'custpage_sl_declaredvalue',
            'custpage_sl_lengthininches',
            'custpage_sl_widthininches',
            'custpage_sl_heightininches'
        ];

        const objSublist = CURRENT_RECORD.getSublist({ sublistId: 'custpage_sublist_parcel' });
        fieldIds.forEach(fieldId => {
            objSublist.getColumn({ fieldId: fieldId }).isDisabled = isDisable;
        });
    };

    // source: sna_hul_cs_so_porequired.js
    const printWarrantyFxn = () => {
        const currRecId = CURRENT_RECORD.id;
        const suiteletUrl = url.resolveScript({
            scriptId: 'customscript_sna_hul_sl_print_wty_pdf',
            deploymentId: 'customdeploy_sna_hul_print_wty_pdf',
            params: { 'inv_rec_id': currRecId }
        });
        window.open(suiteletUrl);
    };

    /**
     * Function to be executed after page is initialized.
     * source: sna_hul_cs_calcshippingcost.js, sna_hul_cs_so_porequired.js
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    const pageInit = (context) => {
        try {
            CURRENT_RECORD = context.currentRecord;
            CREATE_MODE = context.mode === 'create';

            const currentScript = runtime.getCurrentScript();
            SPEEDEE_SHIPPING_METHOD = currentScript.getParameter({ name: 'custscript_param_speedeeshipmethod' });

            // source: sna_hul_cs_so_porequired.js
            PO_REQUIRED_MESSAGE = message.create({
                title: "PO is Required for this Customer",
                message: "Please Enter Purchase Order Number on PO# field",
                type: message.Type.ERROR
            });

            // source: sna_hul_cs_calcshippingcost.js
            if (context.mode === 'copy' || context.mode === 'create' || context.mode === 'edit') {
                const stShipMethod = CURRENT_RECORD.getValue({ fieldId: 'shipmethod' });

                if (CURRENT_RECORD.type === 'itemfulfillment') {
                    disableParcelFields(stShipMethod !== SPEEDEE_SHIPPING_METHOD);
                }
            }

            // handlePORequirements();
        } catch (err) {
            console.error('page init error:', err);
        }
    };

    const setUserDepartmentAndLocation = (cr) => {
        const userObj = runtime.getCurrentUser();
        cr.setValue({ fieldId: "department", value: userObj.department });
        cr.setValue({ fieldId: "location", value: userObj.location });
    };

    /**
     * Function to be executed when field is changed.
     * source: sna_hul_cs_update_dept_loc.js, sna_hul_cs_salesorder.js, sna_hul_cs_so_porequired.js
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     * @param {number} context.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    const fieldChanged = (context) => {
        try {
            const field = context.fieldId;
            const sublist = context.sublistId;
            const currentRecord = context.currentRecord;
            const recordType = currentRecord.type;

            if (recordType === search.Type.SALES_ORDER) {
                // source: sna_hul_cs_update_dept_loc.js
                if (field === 'entity' && CREATE_MODE) {
                    setUserDepartmentAndLocation(currentRecord);
                }

                // source: sna_hul_cs_salesorder.js
                if (sublist === 'item' && field === 'custcol_sna_override_commission') {
                    handleCommissionOverride(context);
                }

                // source: sna_hul_cs_so_porequired.js
                if (field === 'otherrefnum' || field === 'entity') {
                    handlePORequirements();
                }
            }

            if (recordType === search.Type.ESTIMATE) {
                // source: sna_hul_cs_update_dept_loc.js
                if (field === 'entity' && CREATE_MODE) {
                    setUserDepartmentAndLocation(context.currentRecord);
                }
            }

            if (recordType === search.Type.ITEM_FULFILLMENT) {
                // source: sna_hul_cs_calcshippingcost.js
                if (field === 'shipmethod') {
                    const stShipMethod = currentRecord.getValue({ fieldId: 'shipmethod' });
                    disableParcelFields(stShipMethod !== SPEEDEE_SHIPPING_METHOD);
                }
            }

            // if (field === 'entity') {
            //     if (CREATE_MODE) {
            //         const userObj = runtime.getCurrentUser();
            //         CURRENT_RECORD.setValue({ fieldId: "department", value: userObj.department });
            //         CURRENT_RECORD.setValue({ fieldId: "location", value: userObj.location });
            //     }
            //     handlePORequirements();
            // }

            // source: sna_hul_cs_calcshippingcost.js
            // if (field === 'shipmethod' && CURRENT_RECORD.type === 'itemfulfillment') {
            //     const stShipMethod = CURRENT_RECORD.getValue({ fieldId: 'shipmethod' });
            //     disableParcelFields(stShipMethod !== SPEEDEE_SHIPPING_METHOD);
            // }

            // // source: sna_hul_cs_salesorder.js
            // if (sublist === 'item' && field === 'custcol_sna_override_commission') {
            //     handleCommissionOverride(context);
            // }
            //
            // // source: sna_hul_cs_so_porequired.js
            // if (field === 'otherrefnum') {
            //     handlePORequirements();
            // }
        } catch (err) {
            console.error('Field change error:', err);
        }
    };

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    const isTrue = (value) => value === true || value === 'true' || value === 'T';

    /**
     * Validation function to be executed when field is changed.
     * source: sna_hul_cs_salesorder.js
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     * @param {number} context.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    const validateLine = (context) => {
        const currentRecord = context.currentRecord;
        if (currentRecord.type === search.Type.SALES_ORDER) {
            if (context.sublistId === 'item') {
                const salesRep = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_sales_rep'
                });
                const commissionAmt = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_commission_amount'
                });
                const commOverride = currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_override_commission'
                });

                if (isTrue(commOverride) && (isEmpty(commissionAmt) || isEmpty(salesRep))) {
                    dialog.alert({
                        title: 'Empty Sales Rep or Commission Amount',
                        message: 'Please enter the values for Sales Rep and/or Commission Amount.'
                    });
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     * source: sna_hul_cs_so_porequired.js
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    const saveRecord = (context) => {

        const currentRecord = context.currentRecord;
        if (currentRecord.type === search.Type.ITEM_FULFILLMENT) {
            var currentScript = runtime.getCurrentScript();
            var stWillCallShippingMethod = currentScript.getParameter({ name: 'custscript_param_willcallshippingmethod' });
            var stFieldId = context.fieldId;
            var bRetVal = true;
            var stOrderId = currentRecord.getValue({ fieldId: 'custbody_sna_speedeeorderid' });
            var stShipCarrier = currentRecord.getValue({ fieldId: 'shipcarrier' });
            var stShippingMethod = currentRecord.getValue({ fieldId: 'shipmethod' });
            if (stShipCarrier === 'nonups') {
                if (isEmpty(stOrderId)) {
                    if (stShippingMethod == stWillCallShippingMethod) {
                        bRetVal = true;
                    } else {
                        // should be speedee shipping method
                        dialog.alert({
                            title: 'Please calculate shipping rate first',
                            message: 'Please calculate shipping rate first'
                        });
                        bRetVal = false;
                    }
                }
            }
            return bRetVal;
        }


        const customer = currentRecord.getValue({ fieldId: 'entity' });
        const poRequired = search.lookupFields({
            type: 'customer',
            id: customer,
            columns: ['custentity_sna_hul_po_required']
        })['custentity_sna_hul_po_required'];

        const poNum = currentRecord.getValue({ fieldId: 'otherrefnum' });

        if (poRequired && isEmpty(poNum)) {
            PO_REQUIRED_MESSAGE.hide();
            if (currentRecord.type === 'invoice') {
                PO_REQUIRED_MESSAGE.show();
                return false;
            } else if (currentRecord.type === 'salesorder') {
                PO_REQUIRED_MESSAGE.show();
            }
        } else {
            PO_REQUIRED_MESSAGE.hide();
        }
        return true;
    };

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        saveRecord: saveRecord,
        printWarrantyFxn: printWarrantyFxn,
        calculateShippingCost: calculateShippingCost,
        printParcel: printParcel
    };

});
