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
* Date                      Issue/Case          Author              Issue Fix Summary
* =======================================================================================================
* 2022/09/16                                    natoretiro          Initial version
* 2022/11/14                                    aduldulao           Null checking
* 2023/01/16                GAP009              nretiro             removed previous logic in populating PO Rate.
*                                                                   This time script will look at the Vendor Pricing custom record
* 2023/01/25                                    Amol Jagkar         Do not update PO if created from Requisition Worksheet
* 2023/01/26                                    fang                Gap7
* 2023/02/24                                    nretiro             create Vendor Pricing if there is no VP record for the item-vendor combination
* 2023/04/27                                    aduldulao           Check createdpo on SO line before setting povendor
* 2023/06/08                                    fang                Set employee field value when PO is created by System
*                                                                   Remove force setting of department and location
*
*/


/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


define([
    'N/record',
    'N/runtime',
    'N/search',
    'N/format',
    'N/error',
    'N/https',
    'N/url'
],

function (record, runtime, search, format, error,https, url) {

    function afterSubmit_(context) {
        var stLoggerTitle = 'afterSubmit_';
        log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

        var currentScript = runtime.getCurrentScript();

        var stDefaultPOForm = currentScript.getParameter({ name: 'custscript_param_popartsform' });
        var stDefaultDept = currentScript.getParameter({ name: 'custscript_param_popartsformdept' });

        var stEmpLoc = '';
        try {

            var stContextType = context.type;
            log.debug(stLoggerTitle, 'stContextType = ' + stContextType);

            if(stContextType == 'delete')
            {
                return;
            }

            if(stContextType == 'dropship' || stContextType == 'specialorder')
            {
                // load record
                var objCurrentRecord = context.newRecord;

                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;
                log.debug(stLoggerTitle, 'stRecId = ' + stRecId + ' | stRecType = ' + stRecType);

                var objPO = record.load({ type: stRecType, id: stRecId });

                // objPO.setValue({ fieldId: 'customform', value: stDefaultPOForm });
                // objPO.setValue({ fieldId: 'department', value: stDefaultDept });
                log.debug(stLoggerTitle, 'stDefaultPOForm = ' + stDefaultPOForm + ' | stDefaultDept = ' + stDefaultDept);

                //get current user record
                var objCurrUser = runtime.getCurrentUser();
                var stUserId = objCurrUser.id;
                log.debug(stLoggerTitle, 'stUserId = ' + stUserId);

                /*var objEmpRec = search.lookupFields({ type: 'employee', id: stUserId, columns: ['location']});

                if(objEmpRec.location[0] != undefined)
                {
                    stEmpLoc = objEmpRec.location[0].value;
                    log.debug(stLoggerTitle, 'stEmpLoc = ' + stEmpLoc);
                }*/

                // set employee field in PO
                if (stUserId != '-4') {
                    objPO.setValue({ fieldId: 'employee', value: stUserId, ignoreFieldChange: true });
                }

                var stLoc = objPO.getValue({ fieldId: 'location' });
                log.debug(stLoggerTitle, 'stLoc = ' + stLoc);
                var stSOId = objPO.getValue({ fieldId: 'createdfrom' });

                var stPOCreatedFromRW = objPO.getValue({ fieldId: 'custbody_sna_created_from_reqworksheet' });
                var stPOBuyFromVendor = objPO.getValue({ fieldId: 'custbody_sna_buy_from' });

                //Start - Gap07
                var poType = objPO.getValue({
                    fieldId: "custbody_po_type"
                });

                var poTypeField;

                if (poType == 1) { //Emergency
                    poTypeField = "custentity_sna_hul_emergency"
                } else if (poType == 2) { //Truck Down/Breakdown
                    poTypeField = "custentity_sna_hul_truckdown"
                } else if (poType == 3) { //Drop Ship
                    poTypeField = "custentity_sna_hul_dropship_percent"
                } else if (poType == 4) { //Stock Order
                    poTypeField = "custentity_sna_hul_stock_order"
                }
                //End - Gap07

                //get pay to/bill to vendor
                var stBillToVendor = objPO.getValue({ fieldId: 'entity' });
                var stParentVendor = '';
                log.debug({
                    title: 'setVendorPrice', details: 'stPOBuyFromVendor : ' + stPOBuyFromVendor +
                        ' | stBillToVendor = ' + stBillToVendor
                });

                var objVendor = search.lookupFields({
                    type: 'vendor',
                    id: stBillToVendor,
                    columns: ['custentity_sna_parent_vendor']
                });

                log.debug(stLoggerTitle, 'objVendor = ' + JSON.stringify(objVendor));
                if (!isEmpty(objVendor)) {

                    if (!isEmpty(objVendor.custentity_sna_parent_vendor)) {
                        stParentVendor = objVendor.custentity_sna_parent_vendor[0].value;
                    }

                    log.debug(stLoggerTitle, 'stParentVendor = ' + stParentVendor);

                    var stBuyFromVendor = objPO.getValue({ fieldId: 'custbody_sna_buy_from' });
                    log.debug(stLoggerTitle, 'stParentVendor = ' + stParentVendor +
                        ' | stBuyFromVendor = ' + stBuyFromVendor);

                    if (isEmpty(stBuyFromVendor)) {
                        if (!isEmpty(stParentVendor)) {
                            objPO.setValue({ fieldId: 'entity', value: stParentVendor });
                            objPO.setValue({ fieldId: 'custbody_sna_buy_from', value: stBillToVendor });
                        }
                        else {
                            objPO.setValue({ fieldId: 'custbody_sna_buy_from', value: stBillToVendor });
                        }
                    }
                }

                //Start - Gap07
                var buyFromVendor = objPO.getValue({
                    fieldId: "custbody_sna_buy_from"
                });

                log.debug("buyFromVendor", buyFromVendor);
                //End - Gap07

                //get line items

                //Start - Gap07 - if BuyFromVendor + PO Type field !empty, get discountMarkup rates if applicable
                var discountMarkup;
                if (!isEmpty(buyFromVendor) && !isEmpty(poTypeField)) {
                    var discountMarkupLookup = search.lookupFields({
                        type: search.Type.VENDOR,
                        id: buyFromVendor,
                        columns: poTypeField
                    });

                    log.debug("discountMarkupLookup", discountMarkupLookup);

                    if (!isEmpty(discountMarkupLookup[poTypeField])) {
                        discountMarkup = discountMarkupLookup[poTypeField];

                    }
                }
                log.debug("discountMarkup", discountMarkup);
                //End - Gap07 - if BuyFromVendor + PO Type field !empty, get discountMarkup rates if applicable

                var intItemLineCount = objPO.getLineCount({ sublistId: 'item' });

                for (var i = 0; i < intItemLineCount; i++) {
                    var stItem = objPO.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    var qty = objPO.getSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        line: i
                    });

                    // var stRate = objPO.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'rate',
                    //     line: i
                    // });

                    // log.debug(stLoggerTitle, 'stItem = ' + stItem + ' | stRate = ' + stRate + ' | Line = ' + i);

                    //Start - Gap07 - If Create, get item rate and set Original Rate custom column; if Edit, get Original Rate for item rate calc

                    var flRate = 0;

                    if (stContextType == context.UserEventType.CREATE || stContextType == context.UserEventType.DROPSHIP ||
                        stContextType == context.UserEventType.SPECIALORDER ) {
                        flRate = objPO.getSublistValue({
                            sublistId: "item",
                            fieldId: "rate",
                            line: i
                        });

                        objPO.setSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_original_item_rate",
                            line: i,
                            value: flRate
                        });

                    } else if (stContextType == context.UserEventType.EDIT){ //context.type = EDIT
                        flRate = objPO.getSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_original_item_rate",
                            line: i
                        });
                    }

                    log.debug('flRate', flRate);
                    log.debug('qty', qty);
                    log.debug("discountMarkup", discountMarkup);

                    var newitemRate = 0;
                    if (!isEmpty(discountMarkup)) {
                        newitemRate = parseFloat(flRate) + (parseFloat(flRate) * (parseFloat(discountMarkup) / 100));
                    } else {
                        newitemRate = flRate;
                    }

                    log.debug('newitemRate', newitemRate);

                    //End - Gap07 - If Create, get item rate and set Original Rate custom column; if Edit, get Original Rate for item rate calc

                    //GAP 009
                    log.debug(stLoggerTitle, 'Resetting Rate value');
                    if (stContextType == 'specialorder' || stContextType == 'dropship') {
                        objPO.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: i,
                            value: newitemRate
                        });

                        objPO.setSublistValue({
                            sublistId: "item",
                            fieldId: "amount",
                            line: i,
                            value: newitemRate * qty
                        });

                        // objPO.setSublistValue({
                        //     sublistId: "item",
                        //     fieldId: "department",
                        //     line: i,
                        //     value: stDefaultDept
                        // });
                        //
                        // objPO.setSublistValue({
                        //     sublistId: "item",
                        //     fieldId: "location",
                        //     line: i,
                        //     value: stEmpLoc
                        // });
                    }
                    // else if (stContextType != 'specialorder' && stContextType != 'dropship') {
                    //     objPO = setPOVendorPrice(objPO, 'item', discountMarkup, stContextType);
                    // }

                    // not needed for dealernet items
                    // else {
                    //     objPO = setPOVendorPrice(objPO, 'item', discountMarkup, stContextType);
                    // }

                }

                if (!stPOCreatedFromRW) {
                    var stPO = objPO.save({ ignoreMandatoryFields: true, enableSourcing: false });
                    log.debug(stLoggerTitle, 'stPO = ' + stPO);
                }

                if (!isEmpty(stSOId)) {
                    var objSO = record.load({ type: 'salesorder', id: stSOId });

                    // get item line count
                    var intSOLineCount = objSO.getLineCount({ sublistId: 'item' });
                    log.debug(stLoggerTitle, 'intSOLineCount = ' + intSOLineCount);

                    for (var i = 0; i < intSOLineCount; i++) {
                        var createdPO = objSO.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'createdpo',
                            line: i
                        });
                        log.debug(stLoggerTitle, 'i = ' + i + ' | stBillToVendor = ' + stBillToVendor + ' | createdPO: ' + createdPO);

                        if (stRecId == createdPO) {
                            objSO.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'povendor',
                                value: stBillToVendor,
                                line: i
                            });

                            objSO.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_linked_po',
                                value: createdPO,
                                line: i
                            });

                            objSO.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_csi_povendor',
                                value: buyFromVendor,
                                line: i
                            });
                        }
                    }

                    stSOId = objSO.save({ enableSourcing: false });
                    log.debug(stLoggerTitle, 'stSOId = ' + stSOId);


                    //overwrite PO department, location
                    var stPO =  record.submitFields({ type: 'purchaseorder', id: stRecId, values:{ 'department': stDefaultDept, 'location': stLoc } });
                    log.debug(stLoggerTitle, 'stPO 1 = ' + stPO);
                }
            }
            // else if(stContextType == 'create' || stContextType == 'edit') //-- for testing
            else if(stContextType == 'create')
            {
                // load record
                var objCurrentRecord = context.newRecord;

                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;
                log.debug(stLoggerTitle, 'stRecId = ' + stRecId + ' | stRecType = ' + stRecType);

                var objPO = record.load({ type: stRecType, id: stRecId });

                // objPO.setValue({ fieldId: 'customform', value: stDefaultPOForm });
                // objPO.setValue({ fieldId: 'department', value: stDefaultDept });
                log.debug(stLoggerTitle, 'stDefaultPOForm = ' + stDefaultPOForm + ' | stDefaultDept = ' + stDefaultDept);

                //get current user record
                var objCurrUser = runtime.getCurrentUser();
                var stUserId = objCurrUser.id;
                log.debug(stLoggerTitle, 'stUserId = ' + stUserId);

                var objEmpRec = search.lookupFields({ type: 'employee', id: stUserId, columns: ['location']});

                if(!isEmpty(objEmpRec.location))
                {
                    stEmpLoc = objEmpRec.location[0].value;
                    log.debug(stLoggerTitle, 'stEmpLoc = ' + stEmpLoc);
                }

                var stSOId = objPO.getValue({ fieldId: 'createdfrom' });
                var stPOTranId = objPO.getValue({ fieldId: 'tranid' });
                var stLoc = objPO.getValue({ fieldId: 'location' });
                var stDept = objPO.getValue({ fieldId: 'department' });
                log.debug(stLoggerTitle, 'stSOId: ' +  stSOId);
                log.debug(stLoggerTitle, 'tPOTranId = ' + stPOTranId + ' | stLoc = ' + stLoc + ' | stDept = ' + stDept);

                //set employee field in PO if special/dropship PO
                if (!isEmpty(stSOId)) { //Special/Dropship PO
                    if (stUserId == -4) { //If user is System 
                        log.debug('Created by System');
    
                        var objEmployee = search.lookupFields({
                            type: 'salesorder',
                            id: stSOId,
                            columns: ['custbody_sna_order_taken_by']
                        });
    
                        log.debug(stLoggerTitle, 'objEmployee = ' + JSON.stringify(objEmployee));
    
                        if (!isEmpty(objEmployee.custbody_sna_order_taken_by)) {
                            var empVal = objEmployee.custbody_sna_order_taken_by[0].value;
                            objPO.setValue({ fieldId: 'employee', value: empVal, ignoreFieldChange: true });

                            //Based on testing, since setting employee field value, changes PO#, location, and department field values, reverting them back to their original values
                            objPO.setValue({ fieldId: 'tranid', value: stPOTranId, ignoreFieldChange: true });
                            objPO.setValue({ fieldId: 'location', value: stLoc, ignoreFieldChange: true });
                            objPO.setValue({ fieldId: 'department', value: stDept, ignoreFieldChange: true });
                        }
    
                    //     objPO.setValue({ fieldId: 'employee', value: stUserId, ignoreFieldChange: true });
                    }
                }

                var stPOCreatedFromRW = objPO.getValue({ fieldId: 'custbody_sna_created_from_reqworksheet' });
                var stPOBuyFromVendor = objPO.getValue({ fieldId: 'custbody_sna_buy_from' });

                //Start - Gap07
                var poType = objPO.getValue({
                    fieldId: "custbody_po_type"
                });

                var poTypeField;
                var isspecialdropPO = false;

                if (poType == 1) { //Emergency
                    poTypeField = "custentity_sna_hul_emergency"
                } else if (poType == 2) { //Truck Down/Breakdown
                    poTypeField = "custentity_sna_hul_truckdown"
                } else if (poType == 3) { //Drop Ship
                    poTypeField = "custentity_sna_hul_dropship_percent"
                } else if (poType == 4) { //Stock Order
                    poTypeField = "custentity_sna_hul_stock_order"
                }
                //End - Gap07

                log.emergency({
                    title: 'poType', details: poType
                });

                // dropship or specialorder
                if (poType == 3 || poType == 6) {
                    isspecialdropPO = true;
                }

                //get pay to/bill to vendor
                var stBillToVendor = objPO.getValue({ fieldId: 'entity' });
                var stParentVendor = '';
                log.debug({
                    title: 'setVendorPrice', details: 'stPOBuyFromVendor : ' + stPOBuyFromVendor +
                        ' | stBillToVendor = ' + stBillToVendor
                });

                var objVendor = search.lookupFields({
                    type: 'vendor',
                    id: stBillToVendor,
                    columns: ['custentity_sna_parent_vendor']
                });

                log.debug(stLoggerTitle, 'objVendor = ' + JSON.stringify(objVendor));
                if (!isEmpty(objVendor)) {
                    if (!isEmpty(objVendor.custentity_sna_parent_vendor)) {
                        stParentVendor = objVendor.custentity_sna_parent_vendor[0].value;
                    }

                    log.debug(stLoggerTitle, 'stParentVendor = ' + stParentVendor);

                    var stBuyFromVendor = objPO.getValue({ fieldId: 'custbody_sna_buy_from' });

                    log.debug(stLoggerTitle, 'stParentVendor = ' + stParentVendor +
                        ' | stBuyFromVendor = ' + stBuyFromVendor);

                    if (isEmpty(stBuyFromVendor)) {
                        if (!isEmpty(stParentVendor)) {
                            objPO.setValue({ fieldId: 'entity', value: stParentVendor });
                            objPO.setValue({ fieldId: 'custbody_sna_buy_from', value: stBillToVendor });
                        }
                        else {
                            objPO.setValue({ fieldId: 'custbody_sna_buy_from', value: stBillToVendor });
                        }
                    }
                }

                //Start - Gap07
                var buyFromVendor = objPO.getValue({
                    fieldId: "custbody_sna_buy_from"
                });

                log.debug("buyFromVendor", buyFromVendor);
                //End - Gap07

                //get line items

                //Start - Gap07 - if BuyFromVendor + PO Type field !empty, get discountMarkup rates if applicable
                var discountMarkup;
                if (!isEmpty(buyFromVendor) && !isEmpty(poTypeField)) {
                    var discountMarkupLookup = search.lookupFields({
                        type: search.Type.VENDOR,
                        id: buyFromVendor,
                        columns: poTypeField
                    });

                    log.debug("discountMarkupLookup", discountMarkupLookup);

                    if (!isEmpty(discountMarkupLookup[poTypeField])) {
                        discountMarkup = discountMarkupLookup[poTypeField];

                    }
                }
                log.debug("discountMarkup", discountMarkup);
                //End - Gap07 - if BuyFromVendor + PO Type field !empty, get discountMarkup rates if applicable

                var intItemLineCount = objPO.getLineCount({ sublistId: 'item' });

                for (var i = 0; i < intItemLineCount; i++) {
                    var stItem = objPO.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    var qty = objPO.getSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        line: i
                    });

                    // var stRate = objPO.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'rate',
                    //     line: i
                    // });

                    // log.debug(stLoggerTitle, 'stItem = ' + stItem + ' | stRate = ' + stRate + ' | Line = ' + i);

                    //Start - Gap07 - If Create, get item rate and set Original Rate custom column; if Edit, get Original Rate for item rate calc

                    var flRate = 0;

                    flRate = objPO.getSublistValue({
                        sublistId: "item",
                        fieldId: "rate",
                        line: i
                    });

                    log.emergency('test', 'flRate: ' + flRate);

                    if (isspecialdropPO) {
                        objPO.setSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_sna_original_item_rate",
                            line: i,
                            value: flRate
                        });

                        var newitemRate = 0;
                        if (!isEmpty(discountMarkup)) {
                            newitemRate = parseFloat(flRate) + (parseFloat(flRate) * (parseFloat(discountMarkup) / 100));
                        } else {
                            newitemRate = flRate;
                        }

                        log.debug('newitemRate 1', newitemRate);

                        log.debug(stLoggerTitle, 'Resetting Rate value 1');

                        objPO.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: i,
                            value: newitemRate
                        });

                        objPO.setSublistValue({
                            sublistId: "item",
                            fieldId: "amount",
                            line: i,
                            value: newitemRate * qty
                        });
                    }

                    objPO = setPOVendorPrice2(objPO, 'item', discountMarkup, stContextType, i);


                }

                if (!stPOCreatedFromRW) {
                    var stPO = objPO.save({ ignoreMandatoryFields: true, enableSourcing: true });
                    log.debug(stLoggerTitle, 'stPO = ' + stPO);

                    // stand alone - Removing this, Standalone PO will use client script's defaulting and changed made by user on PO shouldn't get reverted
                    // if (isEmpty(stSOId)) {
                    //     //overwrite PO department, location
                    //     var tempobj = {};
                    //     tempobj.department = stDept; // retain
                    //     tempobj.location = stLoc; // retain

                    //     var stPO =  record.submitFields({ type: 'purchaseorder', id: stRecId, values:tempobj });
                    // }
                }

                // from hyperlink
                if (!isEmpty(stSOId)) {
                    var objSO = record.load({ type: 'salesorder', id: stSOId });

                    // get item line count
                    var intSOLineCount = objSO.getLineCount({ sublistId: 'item' });
                    log.debug(stLoggerTitle, 'intSOLineCount = ' + intSOLineCount);

                    for (var i = 0; i < intSOLineCount; i++) {
                        var createdPO = objSO.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'createdpo',
                            line: i
                        });
                        log.debug(stLoggerTitle, 'i = ' + i + ' | stBillToVendor = ' + stBillToVendor + ' | createdPO: ' + createdPO);

                        if (stRecId == createdPO) {
                            objSO.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'povendor',
                                value: stBillToVendor,
                                line: i
                            });

                            objSO.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_linked_po',
                                value: createdPO,
                                line: i
                            });

                            objSO.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_sna_csi_povendor',
                                value: buyFromVendor,
                                line: i
                            });
                        }
                    }



                    stSOId = objSO.save({ enableSourcing: false });
                    log.debug(stLoggerTitle, 'stSOId 1 = ' + stSOId);


                    //overwrite PO department, location - Removing this, department and location should be sourced from SO
                    // var tempobj = {};
                    // tempobj.department = stDept; // client script defaulting should work here
                    // tempobj.location = stLoc; // retain default location from sales order

                    // var stPO =  record.submitFields({ type: 'purchaseorder', id: stRecId, values:tempobj });
                    log.debug(stLoggerTitle, 'stPO 2 = ' + stPO);
                }

            }




        } catch (err) {
            log.audit({
                title: err.name,
                details: err.message
            });

            throw err;

        }

        log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
    }

    function getItemVendorPrice(stItem) {
        var stLoggerTitle = 'getItemVendorPrice';
        log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

        var objData = {};


        try {
            var objItemVendorPrice = search.create({
                type: "item",
                filters:
                    [
                        ["internalid", "anyof", stItem],
                        "AND",
                        ["custrecord_sna_hul_item.custrecord_sna_hul_primaryvendor", "is", "T"]

                    ],
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

            var searchResultCount = objItemVendorPrice.runPaged().count;
            log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);




            objItemVendorPrice.run().each(function (result) {

                objData[result.id] = {
                    poRate: parseFloat(result.getValue({
                        name: 'custrecord_sna_hul_itempurchaseprice',
                        join: 'CUSTRECORD_SNA_HUL_ITEM'
                    }))
                };

                return true;

            });

        } catch (err) {
            log.audit({
                title: err.name,
                details: err.message
            });

            throw err;
        }

        log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        return objData;
    }


    //GAP 009
    /**
     * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
     * @param rec
     * @param sublist
     * @param field
     */

    function setPOVendorPrice(rec, sublist, discountMarkup, stContextType) {
        var stLoggerTitle = 'setPOVendorPrice';
        log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
        log.debug({ title: 'setVendorPrice', details: 'stContextType : ' + stContextType });

        var stPOId = 0;
        try {
            if (!isEmpty(sublist)) {
                var itmCount = rec.getLineCount({ sublistId: sublist });
                log.debug({ title: 'setVendorPrice', details: 'itmCount : ' + itmCount });

                var buyFromVendor = rec.getValue({ fieldId: 'custbody_sna_buy_from' });
                log.debug({ title: 'setVendorPrice', details: 'buyFromVendor : ' + buyFromVendor });
                if (isEmpty(buyFromVendor)) {
                    buyFromVendor = rec.getValue({ fieldId: 'entity' });
                    log.debug({ title: 'setVendorPrice', details: 'buyFromVendor : ' + buyFromVendor });
                }

                for (var i = 0; i < itmCount; i++) {

                    var itm = rec.getSublistValue({ sublistId: sublist, fieldId: 'item', line: i });
                    var itm_txt = rec.getSublistText({ sublistId: sublist, fieldId: 'item', line: i });
                    var qty = rec.getSublistValue({ sublistId: sublist, fieldId: 'quantity', line: i });
                    var intSumOfQty = 0;

                    // if (itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

                    log.debug({ title: 'setVendorPrice', details: 'itm: ' + itm + '| buyFromVendor: ' + buyFromVendor + '| qty: ' + qty });

                    if (!isEmpty(itm)) {
                        var prices = getVendorPrice(itm, buyFromVendor);
                        log.debug({ title: 'setVendorPrice', details: 'Object.keys(prices).length: ' + Object.keys(prices).length });
                        if(Object.keys(prices).length > 0)
                        {
                            if (!isEmpty(prices.qtybreakprice))
                            {
                                //log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });
                                log.debug({ title: 'setVendorPrice', details: 'qtybreakprice: ' + prices.qtybreakprice });

                                var qtyBreakPrice = JSON.parse(prices.qtybreakprice);

                                var setPrice = 0;

                                for (var qbpIndex = 0; qbpIndex < qtyBreakPrice.length; qbpIndex++) {
                                    var currQty = qtyBreakPrice[qbpIndex].Quantity;
                                    var currPrice = qtyBreakPrice[qbpIndex].Price;

                                    log.debug({ title: 'setVendorPrice', details: 'qty: ' + qty + ' vs. ' + 'currQty: ' + currQty + '| currPrice: ' + currPrice });

                                    if (qty >= currQty) {
                                        setPrice = currPrice;

                                        continue;
                                    } else {
                                        break;
                                    }
                                }

                                log.debug({ title: 'setVendorPrice', details: 'setPrice: ' + setPrice });

                                if (stContextType == 'create') {
                                    rec.setSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_sna_original_item_rate",
                                        line: i,
                                        value: setPrice
                                    });

                                } else if (stContextType == 'edit') {

                                    var updatePriceCheckbox = rec.getValue({
                                        fieldId: "custbody_sna_update_price_markup_disc"
                                    });

                                    log.debug('updatePriceCheckbox', updatePriceCheckbox);

                                    if (updatePriceCheckbox) {
                                        setPrice = rec.getSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_original_item_rate",
                                            line: i
                                        });
                                    } else {
                                        continue;
                                    }
                                }

                                if (!isEmpty(discountMarkup)) {
                                    var setPriceWithMarkupDiscount =  parseFloat(setPrice) + (parseFloat(setPrice) * (parseFloat(discountMarkup) / 100));
                                    log.debug({ title: 'setVendorPrice', details: 'setPriceWithMarkupDiscount: ' + setPriceWithMarkupDiscount});

                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPriceWithMarkupDiscount, line: i });
                                } else {
                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, line: i });
                                }

                            }
                            else if (!isEmpty(prices.contractprice))
                            {
                                log.debug({ title: 'setVendorPrice', details: 'contractprice: ' + prices.contractprice });

                                var setPrice = 0;
                                setPrice = prices.contractprice;

                                if (stContextType == 'create') {
                                    rec.setSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_sna_original_item_rate",
                                        line: i,
                                        value: setPrice
                                    });

                                } else if (stContextType == 'edit') {
                                    var updatePriceCheckbox = rec.getValue({
                                        fieldId: "custbody_sna_update_price_markup_disc"
                                    });

                                    log.debug('updatePriceCheckbox', updatePriceCheckbox);

                                    if (updatePriceCheckbox) {
                                        setPrice = rec.getSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_original_item_rate",
                                            line: i
                                        });
                                    } else {
                                        continue;
                                    }
                                }

                                if (!isEmpty(discountMarkup)) {
                                    var setPriceWithMarkupDiscount =  parseFloat(setPrice) + (parseFloat(setPrice) * (parseFloat(discountMarkup) / 100));
                                    log.debug({ title: 'setVendorPrice', details: 'setPriceWithMarkupDiscount: ' + setPriceWithMarkupDiscount});

                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPriceWithMarkupDiscount, line: i });
                                } else {
                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, line: i });
                                }

                            }
                            else if (!isEmpty(prices.itmpurchprice))
                            {
                                log.debug({ title: 'setVendorPrice', details: 'itmpurchprice: ' + prices.itmpurchprice });

                                var setPrice = 0;
                                setPrice = prices.itmpurchprice;

                                if (stContextType == 'create') {
                                    rec.setSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_sna_original_item_rate",
                                        line: i,
                                        value: setPrice
                                    });

                                } else if (stContextType == 'edit') {
                                    var updatePriceCheckbox = rec.getValue({
                                        fieldId: "custbody_sna_update_price_markup_disc"
                                    });

                                    log.debug('updatePriceCheckbox', updatePriceCheckbox);

                                    if (updatePriceCheckbox) {
                                        setPrice = rec.getSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_original_item_rate",
                                            line: i
                                        });
                                    } else {
                                        continue;
                                    }
                                }

                                if (!isEmpty(discountMarkup)) {
                                    var setPriceWithMarkupDiscount =  parseFloat(setPrice) + (parseFloat(setPrice) * (parseFloat(discountMarkup) / 100));
                                    log.debug({ title: 'setVendorPrice', details: 'setPriceWithMarkupDiscount: ' + setPriceWithMarkupDiscount});

                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPriceWithMarkupDiscount, line: i });
                                } else {
                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPrice, line: i });
                                }

                            }
                        }
                        else
                        {
                            // NATO | 03/07/2023 | use item
                            log.debug({ title: 'setVendorPrice', details: 'Opening item record' });
                            var objItem = record.load({ type: 'inventoryitem', id: itm });

                            //get purchase price
                            var flPurchasePrice = objItem.getValue({ fieldId: 'cost' });

                            //get last purchase price
                            var flLastPurchasePrice = objItem.getValue({ fieldId: 'lastpurchaseprice' });

                            if(!isEmpty(flPurchasePrice))
                            {

                                if (stContextType == 'create') {
                                    rec.setSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_sna_original_item_rate",
                                        line: i,
                                        value: flPurchasePrice
                                    });

                                } else if (stContextType == 'edit') {
                                    var updatePriceCheckbox = rec.getValue({
                                        fieldId: "custbody_sna_update_price_markup_disc"
                                    });

                                    log.debug('updatePriceCheckbox', updatePriceCheckbox);

                                    if (updatePriceCheckbox) {
                                        setPrice = rec.getSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_original_item_rate",
                                            line: i
                                        });
                                    } else {
                                        continue;
                                    }
                                }

                                if (!isEmpty(discountMarkup)) {
                                    var setPriceWithMarkupDiscount =  parseFloat(flPurchasePrice) + (parseFloat(flPurchasePrice) * (parseFloat(discountMarkup) / 100));
                                    log.debug({ title: 'setVendorPrice', details: 'setPriceWithMarkupDiscount: ' + setPriceWithMarkupDiscount});

                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPriceWithMarkupDiscount, line: i });
                                } else {
                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: flPurchasePrice, line: i });
                                }
                            }
                            else if(isEmpty(flPurchasePrice) && isEmpty(flLastPurchasePrice))
                            {

                                if (stContextType == 'create') {
                                    rec.setSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_sna_original_item_rate",
                                        line: i,
                                        value: flLastPurchasePrice
                                    });

                                } else if (stContextType == 'edit') {
                                    var updatePriceCheckbox = rec.getValue({
                                        fieldId: "custbody_sna_update_price_markup_disc"
                                    });

                                    log.debug('updatePriceCheckbox', updatePriceCheckbox);

                                    if (updatePriceCheckbox) {
                                        setPrice = rec.getSublistValue({
                                            sublistId: "item",
                                            fieldId: "custcol_sna_original_item_rate",
                                            line: i
                                        });
                                    } else {
                                        continue;
                                    }
                                }

                                if (!isEmpty(discountMarkup)) {
                                    var setPriceWithMarkupDiscount =  parseFloat(flLastPurchasePrice) + (parseFloat(flLastPurchasePrice) * (parseFloat(discountMarkup) / 100));
                                    log.debug({ title: 'setVendorPrice', details: 'setPriceWithMarkupDiscount: ' + setPriceWithMarkupDiscount});

                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: setPriceWithMarkupDiscount, line: i });
                                } else {
                                    rec.setSublistValue({ sublistId: sublist, fieldId: 'rate', value: flLastPurchasePrice, line: i });
                                }
                            }
                            else
                            {
                                log.debug({ title: 'setVendorPrice', details: 'CREATE VENDOR PRICING' });
                                //calling create vendor pricing suitelet

                                var stSLURL = url.resolveScript({
                                    scriptId: 'customscript_sna_hul_sl_createvendprice',
                                    deploymentId: 'customdeploy_sna_hul_sl_createvendprice',
                                    returnExternalUrl: true
                                })
                                log.debug({ title: 'setVendorPrice', details: 'stSLURL = ' + stSLURL });
                                var response = https.post({url: stSLURL, body: { itm: itm, itm_txt: itm_txt, buyFromVendor: buyFromVendor} });
                                log.debug({ title: 'setVendorPrice', details: 'response = ' + JSON.stringify(response) });
                            }






                        }



                    }
                }

            }
        }
        catch (e) {
            log.audit({ title: 'setVendorPrice', details: 'error = ' + JSON.stringify(e) });
        }

        log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        return rec;
    }

    function setPOVendorPrice2(rec, sublist, discountMarkup, stContextType, line) {
        var stLoggerTitle = 'setPOVendorPrice2';
        log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
        log.debug({ title: 'setVendorPrice', details: 'stContextType : ' + stContextType });

        var stPOId = 0;
        try {
            if (!isEmpty(sublist)) {
                var itmCount = rec.getLineCount({ sublistId: sublist });
                log.debug({ title: 'setVendorPrice', details: 'itmCount : ' + itmCount });

                var buyFromVendor = rec.getValue({ fieldId: 'custbody_sna_buy_from' });
                log.debug({ title: 'setVendorPrice', details: 'buyFromVendor : ' + buyFromVendor });
                if (isEmpty(buyFromVendor)) {
                    buyFromVendor = rec.getValue({ fieldId: 'entity' });
                    log.debug({ title: 'setVendorPrice', details: 'buyFromVendor : ' + buyFromVendor });
                }


                log.debug({ title: 'setVendorPrice', details: 'line : ' +line });

                var itm = rec.getSublistValue({ sublistId: sublist, fieldId: 'item', line: line });
                var itm_txt = rec.getSublistText({ sublistId: sublist, fieldId: 'item', line: line });
                var qty = rec.getSublistValue({ sublistId: sublist, fieldId: 'quantity', line: line });
                var rate = rec.getSublistValue({ sublistId: sublist, fieldId: 'rate', line: line });
                var intSumOfQty = 0;

                // if (itm == RENTALCHARGE || itm == RENTALEQUIPMENT || itmtype != 'InvtPart') return;

                log.debug({ title: 'setVendorPrice', details: 'itm: ' + itm + '| buyFromVendor: ' + buyFromVendor + '| qty: ' + qty });

                if (!isEmpty(itm)) {



                    // get item and check for its type
                    // when item is inventory type, script will exit
                    var bIsLotItem = getItemType(itm);
                    log.debug(stLoggerTitle, 'bIsLotItem = ' + bIsLotItem);
                    if(bIsLotItem)
                    {
                        log.audit(stLoggerTitle, 'Exiting... Item Type not supported -- ' + itm_txt);
                        return rec;
                    }

                    var prices = getVendorPrice(itm, buyFromVendor, true);
                    log.debug({ title: 'setVendorPrice', details: 'Object.keys(prices).length: ' + Object.keys(prices).length });
                    if(Object.keys(prices).length == 0)
                    {

                        log.debug({ title: 'setVendorPrice', details: 'CREATE VENDOR PRICING' });
                        //calling create vendor pricing suitelet

                        var stSLURL = url.resolveScript({
                            scriptId: 'customscript_sna_hul_sl_createvendprice',
                            deploymentId: 'customdeploy_sna_hul_sl_createvendprice',
                            returnExternalUrl: true
                        })
                        log.debug({ title: 'setVendorPrice', details: 'stSLURL = ' + stSLURL });
                        var response = https.post({url: stSLURL, body: { itm: itm, itm_txt: itm_txt, buyFromVendor: buyFromVendor, rate: rate} });
                        log.debug({ title: 'setVendorPrice', details: 'response = ' + JSON.stringify(response) });

                    }



                }


            }
        }
        catch (e) {
            log.audit({ title: 'setVendorPrice', details: 'error = ' + JSON.stringify(e) });
        }

        log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        return rec;
    }

    /**
     * From the Vendor Price record with Primary Vendor? checkbox marked, the below fields are populated: List Price, Item Purchase Price
     * @param itm
     * @param buyFromVendor
     * @returns {{}}
     */
    function getVendorPrice(itm, buyFromVendor, bIsDNet) {
        var prices = {};
        // prices.listprice = '';
        // prices.itmpurchprice = '';
        //
        // log.debug({ title: 'getVendorPrice', details: 'itm: ' + itm + ' | buyFromVendor = ' + buyFromVendor });


        var filters_ = [];
        filters_.push(search.createFilter({ name: 'custrecord_sna_hul_item', operator: search.Operator.IS, values: itm }));
        filters_.push(search.createFilter({ name: 'custrecord_sna_hul_vendor', operator: search.Operator.IS, values: buyFromVendor }));

        if(!isEmpty(bIsDNet))
        {
            filters_.push(search.createFilter({name: 'custitem_dealernetitem', join:'custrecord_sna_hul_item', operator: search.Operator.IS, values: false }));
        }

        var columns_ = [];
        columns_.push(search.createColumn({ name: 'internalid', sort: search.Sort.ASC })); // to get first combination
        columns_.push(search.createColumn({ name: 'custrecord_sna_hul_listprice' }));
        columns_.push(search.createColumn({ name: 'custrecord_sna_hul_itempurchaseprice' }));
        columns_.push(search.createColumn({ name: 'custrecord_sna_hul_qtybreakprices' }));
        columns_.push(search.createColumn({ name: 'custrecord_sna_hul_contractprice' }));


        var cusrecsearch = search.create({ type: 'customrecord_sna_hul_vendorprice', filters: filters_, columns: columns_ });
        var cusrecser = cusrecsearch.run().getRange({ start: 0, end: 1 });

        log.debug({ title: 'getVendorPrice', details: 'cusrecser: ' + JSON.stringify(cusrecser) });

        if (!isEmpty(cusrecser)) {
            prices.listprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_listprice' });
            prices.itmpurchprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_itempurchaseprice' });
            prices.qtybreakprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_qtybreakprices' });
            prices.contractprice = cusrecser[0].getValue({ name: 'custrecord_sna_hul_contractprice' });
        }

        return prices;
    }

    //END  OF GAP009

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


    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined)
            || (stValue.constructor === Array && stValue.length == 0)
            || (stValue.constructor === Object && (function (v) { for (var k in v) return false; return true; })(stValue)));
    }

    function forceInt(stValue) {
        var flValue = parseInt(stValue);
        if (isNaN(flValue) || (stValue == 'Infinity')) {
            return 0;
        }
        return flValue;
    }

    return {
        afterSubmit: afterSubmit_
    };

});