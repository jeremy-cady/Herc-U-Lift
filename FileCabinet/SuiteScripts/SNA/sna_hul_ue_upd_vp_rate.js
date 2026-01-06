/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
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
* 2023/03/16						            natoretiro      	Initial version
* 
*/


/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/format'],
    (record, widget, search, runtime, url, file, format) => {

        function afterSubmit_(context) {
            var stLoggerTitle = 'afterSubmit_';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var currentScript = runtime.getCurrentScript();
            var bIsUpdateVP = false;
            var flRate = 0;
            var stItem = '';
            var stTranId = '';

            try {

                var stContextType = context.type;
                log.debug(stLoggerTitle, 'stContextType = ' + stContextType);

                if(stContextType == 'delete')
                {
                    return;
                }

                // load record
                var objCurrentRecord = context.newRecord;

                var stRecId = objCurrentRecord.id;
                var stRecType = objCurrentRecord.type;
                log.debug(stLoggerTitle, 'stRecId = ' + stRecId + ' | stRecType = ' + stRecType);

                var objVB = record.load({ type: stRecType, id: stRecId });
                var stVendor = objVB.getValue({ fieldId: 'custbody_sna_buy_from' });

                var arrItems = [];

                var intLineCount = objVB.getLineCount({ sublistId: 'item' });

                for(var i = 0;i < intLineCount; i++)
                {
                    arrItems.push(objVB.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }));
                }

                log.debug(stLoggerTitle, 'stVendor = ' + stVendor);
                if(!isEmpty(stVendor) && arrItems.length > 0)
                {
                    var arrLatestVB = getLatestVendorBill(stVendor, arrItems);
                    log.debug(stLoggerTitle, 'arrLatestVB = ' + JSON.stringify(arrLatestVB));

                    //sort by latest date
                    arrLatestVB = arrLatestVB.sort((a, b) => {
                        if (a.tranDate > b.tranDate) {
                            return -1;
                        }
                    });

                    if(arrLatestVB[0] != undefined)
                    {

                        //get only latest date -- index 0
                        var stVBId = arrLatestVB[0].internalId;
                        log.debug(stLoggerTitle, 'stVBId = ' + stVBId);


                        if(parseInt(stVBId) === parseInt(stRecId))
                        {
                            bIsUpdateVP = true;
                            stItem = arrLatestVB[0].item;
                            stTranId = arrLatestVB[0].tranId;
                            flRate = parseFloat(arrLatestVB[0].rate);
                        }


                        log.debug(stLoggerTitle, 'bIsUpdateVP = ' + bIsUpdateVP);
                        log.debug(stLoggerTitle, 'flRate = ' + flRate + ' | stTranId = ' + stTranId);
                        if(bIsUpdateVP)
                        {
                            // update VP Item Purchase Price

                            var stVPId = updateVendorPrice(stVendor, stItem, flRate, stTranId);
                            log.debug(stLoggerTitle, 'Vendor Price [' + stVPId + '] was updated.');
                        }
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


        function getLatestVendorBill(stVendor, arrItems)
        {
            var stLoggerTitle = 'getLatestVendorBill';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var arrData = [];


            try {
                var objVB = search.create({
                    type: "vendorbill",
                    filters:
                        [
                            ["type","anyof","VendBill"],
                            "AND",
                            ["item","anyof",arrItems],
                            "AND",
                            ["item.custitem_dealernetitem","is","F"],
                            "AND",
                            ["item.type","anyof","InvtPart"],
                            "AND",
                            ["item.islotitem","is","F"],
                            "AND",
                            ["custbody_po_type","noneof","1","2","4"],  // emergency or truck down or stock order
                            "AND",
                            ["custbody_sna_buy_from.internalid","anyof",stVendor]

                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "trandate",
                                summary: "GROUP",
                                sort: search.Sort.DESC
                            }),
                            search.createColumn({
                                name: "internalid",
                                summary: "GROUP",
                                sort: search.Sort.DESC
                            }),

                            search.createColumn({
                                name: "transactionnumber",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "altname",
                                join: "vendor",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "item",
                                summary: "GROUP"
                            }),
                            search.createColumn({
                                name: "rate",
                                summary: "MAX"
                            })
                        ]
                });

                var searchResultCount = objVB.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);




                objVB.run().each(function (result) {

                    var stInternalId = result.getValue({
                        name: 'internalid',
                        summary: "GROUP",
                    });

                    var stItemId = result.getValue({
                        name: 'item',
                        summary: "GROUP",
                    })

                    // arrData[stInternalId + '_' + stItemId] = {
                    arrData.push({
                        internalId: stInternalId,
                        tranDate: result.getValue({
                            name: 'trandate',
                            summary: "GROUP",
                        }),
                        tranId: result.getValue({
                            name: 'transactionnumber',
                            summary: "GROUP",
                        }),
                        vendor: result.getValue({
                            name: 'altname',
                            join: "vendor",
                            summary: "GROUP",
                        }),

                        item: stItemId,
                        rate: result.getValue({
                            name: 'rate',
                            summary: "MAX",
                        })

                    });

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

            return arrData;
        }

        function updateVendorPrice(stVendor, stItem, flRate, stTranId)
        {
            var stLoggerTitle = 'updateVendorPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            log.debug(stLoggerTitle, 'stVendor = ' + stVendor + ' | stItem = ' + stItem +
                                        ' | flRate = ' + flRate + ' | stTranId = ' + stTranId);

            var objData = {};
            var stVPId = '';

            try {
                var objVB = search.create({
                    type: "customrecord_sna_hul_vendorprice",
                    filters:
                        [
                            ["custrecord_sna_hul_item","anyof",stItem],
                            "AND",
                            ["custrecord_sna_hul_vendor","anyof",stVendor]

                        ],
                    columns:
                        [
                            "internalid",
                            "custrecord_sna_hul_itempurchaseprice",
                            "custrecord_sna_hul_vendor"
                        ]
                });

                var searchResultCount = objVB.runPaged().count;
                log.debug(stLoggerTitle, 'searchResultCount = ' + searchResultCount);




                objVB.run().each(function (result) {

                    var stInternalId = result.getValue({
                        name: 'internalid',

                    });

                    stVPId = record.submitFields({
                        type: 'customrecord_sna_hul_vendorprice',
                        id: stInternalId,
                        values: {
                            'custrecord_sna_hul_itempurchaseprice':flRate,
                            'custrecord_sna_hul_remarks':'Rate is updated using ' + stTranId
                        }
                    });

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

            return stVPId;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) { for (var k in v) return false; return true; })(stValue)));
        }

        return {
            afterSubmit : afterSubmit_
        }

    });