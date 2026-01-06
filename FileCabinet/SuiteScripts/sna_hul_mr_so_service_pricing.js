/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Sales Order update
 *
 * Revision History:
 *
 * Date			            Issue/Case		    Author			    Issue Fix Summary
 * =======================================================================================================
 * 2023/01/02						            caranda           	Initial version
 *
 */

/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/error'],

    (runtime, record, search, error) => {

            function getInputData() {
                    var stLoggerTitle = 'execute';
                    log.debug(stLoggerTitle, '*** START ***');

                    var scriptObj = runtime.getCurrentScript();
                    var searchId = scriptObj.getParameter({
                            name: 'custscript_sna_so_list_srch'
                    });

                    var searchObj = search.load({
                            id: searchId
                    });

                    return searchObj;

            }

            function map(context) {
                    var stLoggerTitle = 'map';

                    //Get Time Tracking per Task in SO
                    //- Get Service Item
                    //- Get Service Item > Service Code Type
                    //- Duration

                    var mapData = JSON.parse(context.value);
                    var mapDataValues = mapData.values;

                    //log.debug(stLoggerTitle, 'mapDataValues = ' + JSON.stringify(mapDataValues));

                    var orderTaskId = mapDataValues["custbody_nx_task"].value;
                    var orderZipCode = mapDataValues.shipzip;
                    var orderAssetObject = mapDataValues["custrecord_sna_hul_nxcassetobject.CUSTBODY_NX_ASSET"].value;
                    var orderNXcase = mapDataValues["custbody_nx_case"].value;
                    var orderNXasset = mapDataValues["custbody_nx_asset"].value;

                    log.debug(stLoggerTitle, 'orderTaskId = ' + orderTaskId);
                    log.debug(stLoggerTitle, 'orderZipCode = ' + orderZipCode);
                    log.debug(stLoggerTitle, 'orderAssetObject = ' + orderAssetObject);
                    log.debug(stLoggerTitle, 'orderNXcase = ' + orderNXcase);
                    log.debug(stLoggerTitle, 'orderNXasset = ' + orderNXasset);

                    var soObj = _getSOItems(orderTaskId, orderZipCode, orderAssetObject, orderNXcase, orderNXasset)

                    if(!isEmpty(soObj)){
                            context.write({
                                    key: context.key,
                                    value: soObj
                            });
                    }else{
                            //Not Resource
                            return;
                    }


            }

            function reduce(context) {
                    var stLoggerTitle = 'reduce';

                    log.debug(stLoggerTitle, '*** START *** | Time Allocation ID =' + context.key);

                    var soId = context.key;
                    log.debug(stLoggerTitle, 'soId = ' + soId);

                    var reduceData = JSON.parse(JSON.parse(JSON.stringify(context.values)));
                    log.debug(stLoggerTitle, 'reduceData = ' + JSON.stringify(reduceData));

                    if(!isEmpty(soId)){
                            var soObj = record.load({
                                    type: 'salesorder',
                                    id: soId,
                                    isDynamic: true
                            });

                            for(var i = 0; i < reduceData.length; i ++){
                                    soObj.selectNewLine({sublistId: 'item'})

                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: reduceData[i].itemId});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_cpg_resource', value: reduceData[i].customePriceGroup});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_nxc_case', value: reduceData[i].nxCase});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_nx_asset', value: reduceData[i].nxAsset});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', value: reduceData[i].nxTask});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_so_service_code_type', value: reduceData[i].serviceCodeType});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_object', value: reduceData[i].assetObj});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_resource_res_center', value: reduceData[i].resCenter});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_resource_manuf', value: reduceData[i].mfg});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: reduceData[i].duration});
                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_newunitcost', value: reduceData[i].unitPrice});

                                    var itemAmount = parseFloat(Number(reduceData[i].duration) * parseFloat(reduceData[i].unitPrice).toFixed(2)).toFixed(2);

                                    log.debug(stLoggerTitle, 'line ' + i + ' | itemAmount = ' + itemAmount);

                                    soObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'amount', value: itemAmount});

                                    soObj.commitLine({sublistId: 'item'})
                            }

                            var soId = soObj.save();
                            log.debug(stLoggerTitle, 'Save SO = ' + soId);


                    }

            }

            function summarize(context) {
                    var stLoggerTitle = 'summarize';


                    log.audit({
                            title: 'Usage units consumed',
                            details: context.usage
                    });
                    log.audit({
                            title: 'Concurrency',
                            details: context.concurrency
                    });
                    log.audit({
                            title: 'Number of yields',
                            details: context.yields
                    });

                    handleErrorIfAny(context);

            }

            function _getSOItems(taskId, zipCode, assetObj, orderNXcase, orderNXasset) {
                    var stLoggerTitle = '_getSOItems';

                    log.debug('stLoggerTitle', 'taskId = ' + taskId + ' | zipCode = ' + zipCode + ' | assetObj = ' + assetObj + ' | orderNXcase = ' + orderNXcase + ' | orderNXasset = ' + orderNXasset);

                    //Asset Object Search
                    var assetObjSrch = search.lookupFields({
                            type: 'customrecord_sna_objects',
                            id: assetObj,
                            columns: ['cseg_hul_mfg', 'custrecord_sna_responsibility_center']
                    });

                    var mfgId = assetObjSrch.cseg_hul_mfg[0];
                    var resCenter = assetObjSrch.custrecord_sna_responsibility_center[0].value;

                    log.debug('stLoggerTitle', 'mfgId = ' + mfgId.value);
                    log.debug('stLoggerTitle', 'resCenter = ' + resCenter);

                    var itemArr = [];

                    var scriptObj = runtime.getCurrentScript();
                    var searchId = scriptObj.getParameter({
                            name: 'custscript_sna_time_srch'
                    });

                    //Get Time Tracking per Task in SO
                    var srch = search.load({
                            id: searchId
                    });

                    var searchFilters = srch.filters;
                    var taskFilter = search.createFilter({
                            name: 'internalid',
                            join: 'task',
                            operator: 'anyof',
                            values: [taskId]
                    })
                    searchFilters.push(taskFilter);

                    srch.run().each(function(result) {
                            var itemObj = {};

                            itemObj.itemId = result.getValue({
                                    name: 'internalid',
                                    join: 'item'
                            }); //Item
                            itemObj.duration = timeToDecimal(result.getValue({
                                    name: 'hours'
                            })); //Duration

                            var serviceCodeTypeVal = result.getValue({
                                    name: 'custitem_sna_item_service_code_type',
                                    join: 'item'
                            }); //Service Code Type
                            itemObj.serviceCodeType = serviceCodeTypeVal;
                            //2 = Resource

                            itemObj.nxCase = orderNXcase;
                            itemObj.nxAsset = orderNXasset
                            itemObj.nxTask = taskId;

                            if (serviceCodeTypeVal == 2) {
                                    var priceGrp = _getCustomerPricingGroup(zipCode);
                                    itemObj.customePriceGroup = priceGrp
                                    itemObj.assetObj = assetObj;
                                    itemObj.mfg = mfgId.text;
                                    itemObj.resCenter = resCenter;
                                    itemObj.unitPrice = _getResourcePriceTable(priceGrp, mfgId.value, resCenter)
                            }

                            itemArr.push(itemObj);

                            return true;
                    });

                    log.debug(stLoggerTitle, 'itemArr = ' + JSON.stringify(itemArr));

                    return itemArr;

            }

            function _getCustomerPricingGroup(zipCode) {
                    //Search Sales Zone
                    var stLoggerTitle = '_getCustomerPricingGroup';

                    var salesZoneSrch = search.create({
                            type: 'customrecord_sna_sales_zone',
                            filters: [{
                                    name: 'custrecord_sna_st_zip_code',
                                    operator: 'equalto',
                                    values: zipCode
                            }],
                            columns: ['custrecord_sna_sz_cpg']
                    })

                    var priceGroup;
                    salesZoneSrch.run().each(function(result) {
                            priceGroup = result.getValue({
                                    name: 'custrecord_sna_sz_cpg'
                            });
                    });

                    log.debug(stLoggerTitle, 'priceGroup = ' + priceGroup);

                    return priceGroup;
            }

            function _getResourcePriceTable(priceGrp, manuf, resCenter) {
                    //Get Unit Price
                    var stLoggerTitle = '_getResourcePriceTable';

                    var resourcePriceSrch = search.create({
                            type: 'customrecord_sna_hul_resrcpricetable',
                            filters: [{
                                    name: 'custrecord_sna_rpt_cust_price_grp',
                                    operator: 'anyof',
                                    values: priceGrp
                                    },
                                    {
                                            name: 'custrecord_sna_rpt_manufacturer',
                                            operator: 'is',
                                            values: manuf
                                    },
                                    {
                                            name: 'custrecord_sna_rpt_resp_center',
                                            operator: 'anyof',
                                            values: resCenter
                                    }
                            ],
                            columns: ['custrecord_sna_rpt_unit_price']
                    });

                    var unitPrice;

                    resourcePriceSrch.run().each(function(result){
                            unitPrice = result.getValue({name: 'custrecord_sna_rpt_unit_price'});
                    });



                    if(isEmpty(unitPrice)){
                            var resourcePriceSrch2 = search.create({
                                    type: 'customrecord_sna_hul_resrcpricetable',
                                    filters: [{
                                            name: 'custrecord_sna_rpt_cust_price_grp',
                                            operator: 'anyof',
                                            values: priceGrp
                                    },
                                            {
                                                    name: 'custrecord_sna_rpt_manufacturer',
                                                    operator: 'is',
                                                    values: ''
                                            },
                                            {
                                                    name: 'custrecord_sna_rpt_resp_center',
                                                    operator: 'anyof',
                                                    values: resCenter
                                            }
                                    ],
                                    columns: ['custrecord_sna_rpt_unit_price']
                            });


                            resourcePriceSrch2.run().each(function(result){
                                    unitPrice = result.getValue({name: 'custrecord_sna_rpt_unit_price'});
                            });
                    }

                    log.debug(stLoggerTitle, 'unitPrice = ' + unitPrice);
                    return unitPrice;

            }

            function handleErrorIfAny(summary) {
                    var inputSummary = summary.inputSummary;
                    var mapSummary = summary.mapSummary;
                    var reduceSummary = summary.reduceSummary;

                    if (inputSummary.error) {
                            var e = error.create({
                                    name: 'INPUT_STAGE_FAILED',
                                    message: inputSummary.error
                            });
                            //handleErrorAndSendNotification(e, 'getInputData');
                    }

                    handleErrorInStage('map', mapSummary);
                    handleErrorInStage('reduce', reduceSummary);
            }

            function handleErrorInStage(stage, summary) {
                    var errorMsg = [];
                    summary.errors.iterator().each(function(key, value) {
                            if (!isEmpty(JSON.parse(value).message)) {
                                    var msg = 'Error was: ' + JSON.parse(value).message + '\n';
                                    errorMsg.push(msg);
                            }
                    });
                    if (errorMsg.length > 0) {
                            var e = error.create({
                                    name: 'ERROR_IN_STAGE',
                                    message: JSON.stringify(errorMsg)
                            });
                            //handleErrorAndSendNotification(e, stage);
                    }
            }

            function timeToDecimal(t) {
                    var arr = t.split(':');
                    var dec = parseInt((arr[1]/6)*10, 10);

                    return parseFloat(parseInt(arr[0], 10) + '.' + (dec<10?'0':'') + dec);
            }


            function isEmpty(stValue) {
                    return ((stValue === '' || stValue == null || stValue == undefined) ||
                        (stValue.constructor === Array && stValue.length == 0) ||
                        (stValue.constructor === Object && (function(v) {
                                for (var k in v) return false;
                                return true;
                        })(stValue)));
            }

            return {
                    getInputData: getInputData,
                    map: map,
                    reduce: reduce,
                    summarize: summarize
            };

    });