/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
* This script will create a field named Location which will be populated by selecting a subsidiary.
* Population of data will be done by a client side script
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2022/09/08						            natoretiro      	Initial version
* 2023/05/11                                    aduldulao           PO rate defaulting from quote
* 2023/06/15                                    cparba              Restrict Before Submit from running on MR Scripts
*
*/


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/format'],
    (record, widget, search, runtime, url, file, format) => {

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext ) => {
            try {
                var currentRecord = scriptContext.newRecord;
                log.debug({title: 'beforeLoad', details: 'scriptContext.type: ' + scriptContext.type});

                var createdfrom = currentRecord.getValue({fieldId: 'createdfrom'});
                if (isEmpty(createdfrom)) return;

                if (currentRecord.type != record.Type.SALES_ORDER) return;

                var stLoc = currentRecord.getValue({fieldId: 'location'});

                if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                    var allitems = [];
                    var objQBPrice = {};

                    var itmlen = currentRecord.getLineCount({sublistId: 'item'});

                    for (var a = itmlen - 1; a >= 0; a--) {
                        currentRecord.setSublistValue({sublistId: 'item', fieldId: 'location', line: a, value: stLoc});

                        var item = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: a});
                        allitems.push(item);
                    }

                    if (!isEmpty(allitems)) {
                        var arrFilter = [];

                        arrFilter.push(["internalid","anyof",allitems]);
                        arrFilter.push("AND");

                        var _filters = [];
                        _filters.push(["custrecord_sna_hul_item.custrecord_sna_hul_primaryvendor","is","T"]);
                        _filters.push('or');
                        _filters.push(["custrecord_sna_hul_item.internalid","anyof",'@NONE@']);

                        arrFilter.push(_filters);

                        var objItemVP = getItemVendorPrice(arrFilter);

                        if (Object.keys(objItemVP).length > 0) {
                            // go back to the lines

                            for (var i = 0; i < itmlen; i++) {
                                var itm = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                                var currpovendor = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'povendor', line: i});
                                var currpovendorscript = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_csi_povendor', line: i});
                                var estporate = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_estimated_po_rate', line: i});

                                log.debug({title: 'beforeLoad', details: 'currpovendor = ' + currpovendor + ' | currpovendorscript: ' + currpovendorscript + ' | estporate: ' + estporate});

                                if (!isEmpty(objItemVP[itm])) {
                                    // has primary vendor custom record
                                    if (!isEmpty(objItemVP[itm].poVendor)) {
                                        log.debug({title: 'beforeLoad', details: 'poVendor = ' + objItemVP[itm].poVendor});

                                        // not working so this is moved to pageInit
                                        currentRecord.setSublistValue({
                                            sublistId: 'item',
                                            line: i,
                                            fieldId: 'custcol_sna_csi_povendor',
                                            value: objItemVP[itm].poVendor,
                                            ignoreFieldChange: true
                                        });

                                        // not working so this is moved to pageInit
                                        currentRecord.setSublistValue({
                                            sublistId: 'item',
                                            line: i,
                                            fieldId: 'povendor',
                                            value: objItemVP[itm].poVendor,
                                            ignoreFieldChange: true
                                        });

                                        if (!isEmpty(estporate)) continue;

                                        var flPORate = null;
                                        var stQBPrice = objItemVP[itm].qBPrice;

                                        if (!isEmpty(stQBPrice))  {
                                            objQBPrice = JSON.parse(stQBPrice);
                                            log.debug({title: 'beforeLoad', details: 'objQBPrice = ' + JSON.stringify(objQBPrice)});
                                        }

                                        var flContractPrice = parseFloat(objItemVP[itm].contractPrice);
                                        var flItemPurchPrice = parseFloat(objItemVP[itm].itemPurchPrice);

                                        if (Object.keys(objQBPrice).length > 0) {
                                            var qty = currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i}) || 1;

                                            qbploop: for (var qbpIndex = 0; qbpIndex < objQBPrice.length; qbpIndex++) {
                                                var currQty = objQBPrice[qbpIndex].Quantity;
                                                var currPrice = objQBPrice[qbpIndex].Price;

                                                if (qty >= currQty) {
                                                    flPORate = currPrice;
                                                    continue qbploop;
                                                } else {
                                                    break qbploop;
                                                }
                                            }
                                        }

                                        if (isEmpty(flPORate)) {
                                            if(!isEmpty(flContractPrice)) {
                                                log.debug({title: 'beforeLoad', details: 'flContractPrice = ' + flContractPrice});

                                                if (!isNaN(flContractPrice)) {
                                                    flPORate = parseFloat(flContractPrice);
                                                }
                                            }

                                            if (isNaN(flPORate) || isEmpty(flPORate)) {
                                                log.debug({title: 'beforeLoad', details: 'flItemPurchPrice = ' + flItemPurchPrice});
                                                flPORate = parseFloat(flItemPurchPrice);
                                            }
                                        }

                                        log.debug({title: 'beforeLoad', details: 'flPORate = ' + flPORate});

                                        currentRecord.setSublistValue({
                                            sublistId: 'item',
                                            line: i,
                                            fieldId: 'porate',
                                            value: flPORate
                                        });
                                    }
                                    // no primary vendor, use item record
                                    else {
                                        if (!isEmpty(estporate)) continue;

                                        //get purchase price
                                        var flPurchasePrice = objItemVP[itm].flPurchasePrice;

                                        //get last purchase price
                                        var flLastPurchasePrice = objItemVP[itm].flLastPurchasePrice;

                                        if (!isEmpty(flPurchasePrice)) {
                                            currentRecord.setSublistValue({
                                                sublistId: "item",
                                                line: i,
                                                fieldId: "porate",
                                                value: flPurchasePrice
                                            });

                                            log.debug({title: 'beforeLoad', details: 'flPurchasePrice = ' + flPurchasePrice});
                                        }
                                        else if(isEmpty(flPurchasePrice) && !isEmpty(flLastPurchasePrice)) {
                                            currentRecord.setSublistValue({
                                                sublistId: "item",
                                                line: i,
                                                fieldId: "porate",
                                                value: flLastPurchasePrice
                                            });

                                            log.debug({title: 'beforeLoad', details: 'flLastPurchasePrice = ' + flLastPurchasePrice});
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }
        }

        function getItemVendorPrice(arrFilters) {
            var stLoggerTitle = 'getItemVendorPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var objRetVal = {};

            try {
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
                            "cost",
                            "lastpurchaseprice",
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
                    log.debug(stLoggerTitle, 'result = ' + JSON.stringify(result));

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
                        }),
                        flPurchasePrice: result.getValue({
                            name: 'cost'
                        }),
                        flLastPurchasePrice: result.getValue({
                            name: 'lastpurchaseprice'
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

        const beforeSubmit = (objContext) => {
            var stLoggerTitle = 'beforeSubmit';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try {
                if (runtime.executionContext === runtime.ContextType.MAP_REDUCE)
                    return;

                var objForm = objContext.form;
                var objCurrentRecord = objContext.newRecord;

                var stLocationId = objCurrentRecord.getValue({ fieldId: 'custbody_sna_hul_location' });


                if(!isEmpty(stLocationId))
                {
                    objCurrentRecord.setValue({ fieldId: 'location', value: stLocationId});

                    //get item sublist count
                    var intItemSLCount = objCurrentRecord.getLineCount({ sublistId: 'item'});

                    if(intItemSLCount > 0)
                    {
                        for(var i = 0; i < intItemSLCount; i++)
                        {
                            let currlineloc = objCurrentRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                line: i
                            });

                            if (isEmpty(currlineloc)) {
                                log.debug(stLoggerTitle, currlineloc + ' | ' + stLocationId);
                                objCurrentRecord.setSublistValue({ sublistId: 'item', fieldId: 'location', line: i, value: stLocationId});
                            }
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


        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        };

        return {beforeLoad, beforeSubmit}

    });