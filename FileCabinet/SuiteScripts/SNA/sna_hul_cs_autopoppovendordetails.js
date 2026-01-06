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
* 2022/09/15						            natoretiro      	Initial version
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
        'N/error'
    ],

    function (record, runtime, search, format, error) {


        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged_(context) {
            var stLoggerTitle = 'getLocationBySubsidiary';
            console.log(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            debugger;
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;


            if (sublistName === 'item' && sublistFieldName === 'item')
            {
                var stItem = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: sublistFieldName });

                if(!isEmpty(stItem))
                {

                    // var objVendorPrice = getItemVendorPrice(stItem);
                    // console.log('objVendorPrice = ' + JSON.stringify(objVendorPrice))
                    //
                    // if(Object.keys(objVendorPrice).length > 0)
                    // {
                    //     currentRecord.setCurrentSublistValue({
                    //         sublistId: sublistName,
                    //         fieldId: 'povendor',
                    //         value: objVendorPrice[stItem].poVendor,
                    //         ignoreFieldChange: true
                    //     });
                    //
                    //     currentRecord.setCurrentSublistValue({
                    //         sublistId: sublistName,
                    //         fieldId: 'porate',
                    //         value: parseFloat(objVendorPrice[stItem].poRate)
                    //     });
                    // }

                    //search item's vendor price
                    search.create.promise({
                        type: "item",
                        filters:
                            [
                                ["internalid","anyof",stItem],
                                "AND",
                                ["custrecord_sna_hul_item.custrecord_sna_hul_primaryvendor","is","T"]
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
                    }).then(function(objSearch){

                        var searchResultCount = objSearch.runPaged().count;
                        console.log(stLoggerTitle + ' | searchResultCount = ' + searchResultCount);

                        debugger;
                        if(searchResultCount > 0)
                        {

                            objSearch.run().each(function(result)
                            {
                                console.log(stLoggerTitle + ' | result = ' + JSON.stringify(result));



                                currentRecord.setCurrentSublistValue({
                                    sublistId: sublistName,
                                    fieldId: 'povendor',
                                    value: result.getValue({
                                        name: 'custrecord_sna_hul_vendor',
                                        join: 'CUSTRECORD_SNA_HUL_ITEM'
                                    }),
                                    ignoreFieldChange: true
                                });

                                currentRecord.setCurrentSublistValue({
                                    sublistId: sublistName,
                                    fieldId: 'custcol_sna_csi_povendor',
                                    value: result.getValue({
                                        name: 'custrecord_sna_hul_vendor',
                                        join: 'CUSTRECORD_SNA_HUL_ITEM'
                                    }),
                                    ignoreFieldChange: true
                                });

                                currentRecord.setCurrentSublistValue({
                                    sublistId: sublistName,
                                    fieldId: 'porate',
                                    value: parseFloat(result.getValue({
                                        name: 'custrecord_sna_hul_itempurchaseprice',
                                        join: 'CUSTRECORD_SNA_HUL_ITEM'
                                    }))
                                });

                                return false;
                            });




                        }



                    }).catch(function(err){

                        console.log(stLoggerTitle + ' | search.create.promise | ERROR: ' + err);
                    });
                }
            }
            else if(sublistName === 'item' && sublistFieldName === 'povendor')
            {

                var stPOVendor = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'povendor'
                });

                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_sna_csi_povendor',
                    value: stPOVendor,
                    ignoreFieldChange: true
                });

                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'povendor',
                    value: stPOVendor,
                    ignoreFieldChange: true
                });

            }



            console.log(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        function getItemVendorPrice(stItem)
        {
            var stLoggerTitle = 'getItemVendorPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var objData = {};


            try {
                var objItemVendorPrice = search.create({
                    type: "item",
                    filters:
                        [
                            ["internalid","anyof",stItem],
                            "AND",
                            ["custrecord_sna_hul_item.custrecord_sna_hul_primaryvendor","is","T"]

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
                        })),
                        poVendor: result.getValue({
                            name: 'custrecord_sna_hul_vendor',
                            join: 'CUSTRECORD_SNA_HUL_ITEM'
                        })
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


        function postSourcing(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;
            if (sublistName === 'item' && sublistFieldName === 'item')
                if (currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: sublistFieldName
                }) === '39')
                    if (currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'pricelevels'
                    }) !== '1-1')
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'pricelevels',
                            value: '1-1'
                        });
        }


        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }


        return {
            fieldChanged: fieldChanged_,

        };
    });