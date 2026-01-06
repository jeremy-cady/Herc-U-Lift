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
* 2023/02/07						            natoretiro      	Initial version
* 2023/05/18                                    nretiro             Added line to set For Approval checkbox to false
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
        'N/url',
        'N/currentRecord'
    ],

    function (record, runtime, search, format, error, url, currRec) {

        var CURRENTRECORD = null;
        function pageInit_(context)
        {

            CURRENTRECORD = context.currentRecord;

        }

        function approveNewListPrice(stRecType,stRecId, stCurrentUser)
        {
            var stLoggerTitle = 'approveNewPrice';
            console.log(stLoggerTitle + '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try
            {


                var objRec = search.lookupFields({
                    type: stRecType,
                    id: stRecId,
                    columns: [
                        'custrecord_sna_hul_t_itempurchaseprice',
                        'custrecord_sna_hul_t_listprice',                        
                        'custrecord_sna_hul_t_qtybreakprices',
                        'custrecord_sna_hul_remarks'
                    ]});
                console.log(stLoggerTitle + ' objRec = ' + JSON.stringify(objRec));

                var arrRemarks = objRec.custrecord_sna_hul_remarks.toString().split(',');

                arrRemarks[2] = '';

                arrRemarks[1] = '';


                var stVPId = record.submitFields({
                    type: stRecType,
                    id: stRecId,
                    values: {
                        custrecord_sna_hul_listprice: objRec.custrecord_sna_hul_t_listprice || 0,
                        custrecord_sna_hul_forapproval: false,
                        custrecord_sna_hul_lp_lastapprovedby: stCurrentUser,
                        custrecord_sna_hul_lp_lastapprovaldate: new Date(),
                        custrecord_sna_hul_remarks: arrRemarks.toString()
                    }
                });
                console.log(stLoggerTitle + 'stVPId = ' + stVPId);

                var stURL = url.resolveRecord({
                    recordType: stRecType,
                    recordId: stRecId
                });

                window.ischange=false;
                window.open(stURL,'_self');


            }
            catch(e) {


                console.log(stLoggerTitle + ' | e.name = ' + e.name + ' | e.message = ' + e.message);
            }
            console.log(stLoggerTitle + '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function approveNewPurchasePrice(stRecType,stRecId, stCurrentUser)
        {

            var stLoggerTitle = 'approveNewPrice';
            console.log(stLoggerTitle + '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try
            {


                var objRec = search.lookupFields({
                    type: stRecType,
                    id: stRecId,
                    columns: [
                        'custrecord_sna_hul_t_itempurchaseprice',
                        'custrecord_sna_hul_t_contractprice',
                        'custrecord_sna_hul_remarks'

                    ]});
                console.log(stLoggerTitle + ' objRec = ' + JSON.stringify(objRec));

                var arrRemarks = objRec.custrecord_sna_hul_remarks.toString().split(',');
                arrRemarks[0] = '';


                var stVPId = record.submitFields({
                    type: stRecType,
                    id: stRecId,
                    values: {
                        custrecord_sna_hul_itempurchaseprice: objRec.custrecord_sna_hul_t_itempurchaseprice || 0,
                        custrecord_sna_hul_contractprice: objRec.custrecord_sna_hul_t_contractprice || 0,
                        custrecord_sna_hul_pp_lastapprovedby: stCurrentUser,
                        custrecord_sna_hul_pp_lastapprovaldate: new Date(),
                        custrecord_sna_hul_remarks: arrRemarks.toString()

                    }
                });
                console.log(stLoggerTitle + 'stVPId = ' + stVPId);

                var stURL = url.resolveRecord({
                    recordType: stRecType,
                    recordId: stRecId
                });

                window.ischange=false;
                window.open(stURL,'_self');


            }
            catch(e) {


                console.log(stLoggerTitle + ' | e.name = ' + e.name + ' | e.message = ' + e.message);
            }
            console.log(stLoggerTitle + '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function approveAllPrice(stRecType,stRecId, stCurrentUser)
        {

            var stLoggerTitle = 'approveAllPrice';
            console.log(stLoggerTitle + '|--->> Starting ' + stLoggerTitle + ' <<---|');

            try
            {


                var objRec = search.lookupFields({
                    type: stRecType,
                    id: stRecId,
                    columns: [
                        'custrecord_sna_hul_t_itempurchaseprice',
                        'custrecord_sna_hul_t_listprice',
                        'custrecord_sna_hul_t_contractprice',
                        'custrecord_sna_hul_t_qtybreakprices',
                        'custrecord_sna_hul_remarks'

                    ]});
                console.log(stLoggerTitle + ' objRec = ' + JSON.stringify(objRec));

                var arrRemarks = objRec.custrecord_sna_hul_remarks.toString().split(',');
                arrRemarks[0] = '';
                arrRemarks[2] = '';
                arrRemarks[1] = '';

                var stVPId = record.submitFields({
                    type: stRecType,
                    id: stRecId,
                    values: {
                        custrecord_sna_hul_itempurchaseprice: objRec.custrecord_sna_hul_t_itempurchaseprice || 0,
                        custrecord_sna_hul_listprice: objRec.custrecord_sna_hul_t_listprice || 0,
                        custrecord_sna_hul_contractprice: objRec.custrecord_sna_hul_t_contractprice || 0,
                        custrecord_sna_hul_lp_lastapprovedby: stCurrentUser,
                        custrecord_sna_hul_lp_lastapprovaldate: new Date(),
                        custrecord_sna_hul_remarks: arrRemarks.toString()
                    }
                });
                console.log(stLoggerTitle + 'stVPId = ' + stVPId);

                var stURL = url.resolveRecord({
                    recordType: stRecType,
                    recordId: stRecId
                });

                window.ischange=false;
                window.open(stURL,'_self');


            }
            catch(e) {


                console.log(stLoggerTitle + ' | e.name = ' + e.name + ' | e.message = ' + e.message);
            }
            console.log(stLoggerTitle + '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }


        return {
            pageInit: pageInit_,
            approveNewListPrice: approveNewListPrice,
            approveNewPurchasePrice: approveNewPurchasePrice,
            approveAllPrice: approveAllPrice

        };
    });