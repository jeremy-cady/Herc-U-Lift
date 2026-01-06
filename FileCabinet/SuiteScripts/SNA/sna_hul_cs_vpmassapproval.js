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
        var URL_PARAMS = {};
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


            if (sublistName === 'custpage_slist_vp' && sublistFieldName === 'custpage_slf_select')
            {
                var stVal = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: sublistFieldName });
                var stVP = currentRecord.getSublistValue({ sublistId: sublistName, fieldId: 'custpage_slf_vp', line: line });
                var arrSelectedVP = [];
                var stSelectedVP = currentRecord.getValue({ fieldId: 'custpage_fld_vptoapprove' });

                if(!isEmpty(stSelectedVP))
                {
                    arrSelectedVP = stSelectedVP.split(',');
                }


                if(stVal == true)
                {
                    var index = arrSelectedVP.indexOf(stVP);

                    if(index == -1)
                    {
                        arrSelectedVP.push(stVP);
                    }
                }
                else if(stVal == false)
                {
                    var index = arrSelectedVP.indexOf(stVP);

                    if(index != -1)
                    {
                        arrSelectedVP.splice(index, 1);
                    }
                }

                currentRecord.setValue({ fieldId: 'custpage_fld_vptoapprove', value: arrSelectedVP.toString() });
            }
            else if(sublistFieldName === 'custpage_ps_fld_page')
            {
                var page = currentRecord.getValue(sublistFieldName);

                jump(page);
            }
            else if(sublistFieldName === 'custpage_ps_fld_itemcatfilter')
            {
                var page = 0;
                jump(page);
            }



            console.log(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

        }

        function pageInit_(context)
        {

            CURRENTRECORD = currentRecord.get();

        }

        function markAll(bIsMarkAll)
        {
            var stLoggerTitle = 'markAll';
            console.log(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            var arrVPToApprove = [];

            var objRec = currentRecord.get();

            //line count
            var intLineCount = objRec.getLineCount({ sublistId: 'custpage_slist_vp' });

            if(bIsMarkAll)
            {
                for(var i = 0; i < intLineCount; i++)
                {
                    objRec.selectLine({ sublistId: 'custpage_slist_vp', line: i });

                    //set checkbox to true
                    objRec.setCurrentSublistValue({ sublistId: 'custpage_slist_vp', fieldId: 'custpage_slf_select', value: bIsMarkAll });
                    objRec.commitLine({ sublistId: 'custpage_slist_vp' });
                }


            }
            else
            {
                for(var i = 0; i < intLineCount; i++)
                {
                    objRec.selectLine({ sublistId: 'custpage_slist_vp', line: i });
                    //set checkbox to false
                    objRec.setCurrentSublistValue({ sublistId: 'custpage_slist_vp', fieldId: 'custpage_slf_select', value: bIsMarkAll });
                    objRec.commitLine({ sublistId: 'custpage_slist_vp' });
                }
            }



            console.log(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }



        function next(page)
        {
            debugger;

            if(isNaN(page))
            {
                return;
            }


            refreshPage(parseInt(page) + 1);


        }

        function prev(page)
        {


            if(isNaN(page))
            {
                return;
            }

            if((page - 1) == -1)
            {
                alert('Operation not supported. You are already in the first page.');
                return;
            }
            else
            {
                refreshPage(parseInt(page) - 1);
            }



        }

        function jump(page)
        {


            if(isNaN(page))
            {
                return;
            }

            refreshPage(page);
        }

        function refreshPage(page)
        {

            var objRec = currentRecord.get();
            URL_PARAMS.param_page = isEmpty(page) ? 0 : page;

            var stItemCatFilter = objRec.getValue({ fieldId: 'custpage_ps_fld_itemcatfilter' });
            URL_PARAMS.param_ic = isEmpty(stItemCatFilter) ? '' : stItemCatFilter;

            // Get URL
            var stURL = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_vpmassapprover',
                deploymentId: 'customdeploy_sna_hul_sl_vpmassapprover',
                params: URL_PARAMS
            });

            // Redirect Using the generated URL
            window.ischanged = false;
            window.location = stURL;
        }

        function exportToCSV()
        {

            var objRec = currentRecord.get();
            URL_PARAMS = {
                action : 'CSV',
                stReportName : 'Vendor Prices For Approval',
                stPaperSize : 'LEGAL',
                stPaperOrientation : 'LANDSCAPE'
            };

            alert('Starting export process. Please do not close window.');


            // Get URL
            var stURL = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_vpforapprovalexp',
                deploymentId: 'customdeploy_sna_hul_sl_vpforapprovalexp',
                params: URL_PARAMS
            });


            // Redirect Using the generated URL
            window.ischanged = false;
            // window.location = stURL;

            window.open(stURL, '_blank');


        }

        function rejectAllPrice()
        {
            var stLoggerTitle = 'rejectAllPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            var objRec = currentRecord.get();

            try
            {
                var stVPToReject = objRec.getValue({ fieldId: 'custpage_fld_vptoapprove' });
                log.debug(stLoggerTitle, 'stVPToReject = ' + stVPToReject);

                objRec.setValue({ fieldId: 'custpage_fld_vptoreject', value: stVPToReject });
                objRec.setValue({ fieldId: 'custpage_fld_vptoapprove', value: '' });

                if(!isEmpty(stVPToReject))
                {
                    // Get URL
                    var stURL = url.resolveScript({
                        scriptId: 'customscript_sna_hul_sl_vpmassapprover',
                        deploymentId: 'customdeploy_sna_hul_sl_vpmassapprover'

                    });

                    // jQuery.post(stURL, { action: 'reject', vpsToReject: stVPToReject }, function(data){
                    //     alert('Mass rejection has started. An email will be sent to you once the process is done.');
                    // });

                    document.forms[0].method = 'post';
                    document.forms[0].action = stURL;
                    window.ischanged = false;
                    document.forms[0].submit();

                }
                else
                {
                    log.debug(stLoggerTitle, 'Cannot proceed. No record was selected.');
                    alert('Cannot proceed. No record was selected.')
                }





            }
            catch(e) {

                log.debug(stLoggerTitle, 'e.name = ' + e.name + ' | e.message = ' + e.message);

            }
            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
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


            pageInit: pageInit_,
            fieldChanged: fieldChanged_,
            markAll: markAll,
            refreshPage : refreshPage,
            prev : prev,
            next : next,
            jump : jump,
            //exportToCSV: exportToCSV,
            //rejectAllPrice: rejectAllPrice
        };
    });