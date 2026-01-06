/*
* Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
*
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/01/26						            natoretiro      	Initial version
*
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
        'N/url',
        'N/https'
    ],

    function (record, runtime, search, format, error, currentRecord, url, https)
    {
        var CURRENTRECORD = null;


        function processFilter()
        {
            var stDateFrom = CURRENTRECORD.getValue({ fieldId: 'custpage_datefrom'});
            var stDateTo = CURRENTRECORD.getValue({ fieldId: 'custpage_dateto'});

            var getURL = new URL(document.location.href);
            var scriptId = getURL.searchParams.get('script');
            var deploymentId = getURL.searchParams.get('deploy');



            debugger;


            if(isEmpty(stDateTo) || isEmpty(stDateFrom))
            {
                alert('Please choose a Date Range');
                return;
            }



            var objParams = {
                dateFrom: format.format({ value: stDateFrom, type: format.Type.DATE }),
                dateTo: format.format({ value: stDateTo, type: format.Type.DATE })

            };





            if(stDateTo < stDateFrom)
            {
                alert('Value of Date To should not be less than Date From');
                return;
            }

            stDateFrom = format.format({value:format.parse({ value: stDateFrom,type: format.Type.DATE}), type: format.Type.DATE});
            stDateTo = format.format({value:format.parse({ value: stDateTo,type: format.Type.DATE}), type: format.Type.DATE});


            // call url with dates to filter
            var stURL = url.resolveScript({
                scriptId: scriptId,
                deploymentId: deploymentId,
                params: objParams
            });

            // Redirect Using the generated URL
            window.ischanged = false;
            window.location = stURL;

        }




        function fieldChanged(context)
        {



        }




        function pageInit(context)
        {

            CURRENTRECORD = currentRecord.get();

        }

        function printParcel()
        {
            var objCurrRec = currentRecord.get();

            var intParcelLineCount = objCurrRec.getLineCount({ sublistId: 'custpage_sublist_parcel' });
            console.log('intParcelLineCount = ' + intParcelLineCount);

            if(intParcelLineCount == 0)
            {
                alert('No label present in parcel list to print...');
                return;
            }

            for(var i = 0; i < intParcelLineCount; i++) {
                var stLabel = objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_postagelabel', line: i });
                console.log(stLabel);
                window.open(stLabel, "_blank");


            }
        }

        function printManifest()
        {
            var objCurrRec = currentRecord.get();
            var arrShipmentId = [];

            var intParcelLineCount = objCurrRec.getLineCount({ sublistId: 'custpage_sublist_parcel' });
            console.log('intParcelLineCount = ' + intParcelLineCount);

            if(intParcelLineCount == 0)
            {
                alert('No shipment in parcel list to print...');
                return;
            }

            for(var i = 0; i < intParcelLineCount; i++) {
                var stShipmentId = objCurrRec.getSublistValue({ sublistId: 'custpage_sublist_parcel', fieldId: 'custpage_sl_shipmentid', line: i });
                console.log(stShipmentId);

                arrShipmentId.push({'id': stShipmentId});

            }

            console.log(JSON.stringify(arrShipmentId));

            // call easypost api
            try
            {

                var stSpeeDeeToken = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeetoken'});
                var stSpeeDeeCarrierAccount = runtime.getCurrentScript().getParameter({name: 'custscript_param_speedeecarrieraccount'});

                var objParam = {
                    "shipments": arrShipmentId
                }
                console.log(JSON.stringify(objParam));

                var stSpeeDeeAPIURL = 'https://www.easypost.com/api/v2/scan_forms/';


                var headers = {
                    'Authorization': "Bearer " + stSpeeDeeToken,
                    'Content-Type': 'application/json'

                };

                console.log('stSpeeDeeAPIURL = ' + stSpeeDeeAPIURL);

                var response = https.post({
                    url: stSpeeDeeAPIURL,
                    body: JSON.stringify(objParam),
                    headers: headers
                });

                console.log('response = ' + JSON.stringify(response));

                if (response.code == 200) {
                    console.log('response.body = ' + JSON.stringify(response.body));

                    console.log('Updating Opportunity');
                    var objJSON = JSON.parse(response.body);
                    console.log('objJSON = ' + JSON.stringify(objJSON));

                    var stPDFURL = objJSON.form_url;
                    window.open(stPDFURL, '_blank');

                }
                else
                {
                    alert('No URL was returned...' + response.code);
                }
            }
            catch (e)
            {
                alert(e.message);
            }

        }

        function getURLParamValue(name)
        {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results == null)
                return "";
            else
                return results[1];
        }

        /*
        *	set current time stamp in HH:mm format
        *	console.log(formatTime(new Date));
        */
        function formatTime(date)
        {
            var hours = date.getHours();
            var minutes = date.getMinutes();

            var strTime = hours + ':' + minutes;
            return strTime;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function (v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        /**
         * Add days to date
         *
         * @param {date} dtDate
         * @param {int} intDays
         * @returns {date} result
         */
        function addDays(dtDate, intDays) {
            var result = new Date(dtDate);
            result.setDate(result.getDate() + intDays);
            return result;
        }

        return {

            processFilter: processFilter,
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            printParcel:  printParcel,
            printManifest: printManifest
        };
    });