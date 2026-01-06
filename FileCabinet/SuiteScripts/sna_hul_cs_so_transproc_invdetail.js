/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author vpitale
 *
 * Script brief description:
 * Client script is attached to the suitelet SNA HUL SL SO Transfer Proc Inv Detail.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               Issue Fix Summary
 * =============================================================================================
 * 2023/12/04          122554         Vishal Pitale          Initial version
 */
define(['N/url', 'N/currentRecord', 'N/format', 'N/search'],
    function(url, currentRecord, format, search) {

        // Function used to parse and format the date.
        function parseAndFormatDateString(myDate) {
            var initialFormattedDateString = myDate;
            if(initialFormattedDateString != '') {
                var parsedDateStringAsRawDateObject = format.parse({ value: initialFormattedDateString, type: format.Type.DATE });
                var formattedDateString = format.format({ value: parsedDateStringAsRawDateObject, type: format.Type.DATE });
            }
            else { var formattedDateString = ''; }
            return formattedDateString;
        }

        // Function to get the URL Parameters.
        function getURLParamValue(name){
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results == null)
                return "";
            else
                return results[1];
        }

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (let k in v)
                    return false;
                return true;
            })(stValue)));
        }

        // Page Init Event.
        function pageInit(scriptContext) {
            let curRec = scriptContext.currentRecord, jsonData;
            let urlVal = new URL(location.href);
            let lineNum = urlVal.searchParams.get('lineNum');
            jsonData = window.opener.nlapiGetLineItemValue('custpage_sublist_solist','custpage_sublist_locinvdetdata',lineNum).trim();

            // Executing the code only when the jsonData is not empty.
            if(!isEmpty(jsonData)) {
                // jsonData = JSON.parse('[' + window.opener.nlapiGetLineItemValue('custpage_sublist_solist','custpage_sublist_locinvdetdata',lineNum).trim() + ']');
                jsonData = JSON.parse(window.opener.nlapiGetLineItemValue('custpage_sublist_solist','custpage_sublist_locinvdetdata',lineNum).trim());

                // Traversing through the JSON Data.
                for(let loop1 = 0; loop1 < jsonData.length; loop1++) {
                    let fromBins = jsonData[loop1].fromBins;
                    let toBins = jsonData[loop1].toBins;
                    let qty = jsonData[loop1].qty;

                    curRec.selectLine({ sublistId: 'custpage_sublist_invdetdata', line: loop1 });
                    curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_frombins', value: fromBins });
                    curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_tobins', value: toBins });
                    curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_qty', value: parseInt(qty) });
                    curRec.commitLine({ sublistId: 'custpage_sublist_invdetdata' });
                }
            }
        }

        // Field Changed Function.
        function fieldChanged(scriptContext) {
            let curRec = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            let fieldId = scriptContext.fieldId;
            let itemId = curRec.getValue({ fieldId: 'custpage_itemfield' });
            let toLoc = getURLParamValue('toLocation');

            if (sublistId == 'custpage_sublist_invdetdata' && fieldId == 'custpage_sublist_frombins') {
                let qtyAvail = curRec.getCurrentSublistText({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_frombins' });
                qtyAvail = qtyAvail.substring(qtyAvail.indexOf('||') + 2);
                curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_qtyavail', value: qtyAvail });
            }

            if(sublistId == 'custpage_sublist_invdetdata' && fieldId == 'custpage_sublist_frombins' && !isEmpty(itemId) && !isEmpty(toLoc)) {
                let itemSearchObj = search.create({ type: 'inventoryitem',
                    filters: [ ['type','anyof','InvtPart'], 'AND', ['preferredbin','is','T'], 'AND', ['binnumber.location','anyof',toLoc], 'AND', ['internalid','anyof',itemId] ],
                    columns: [ 'binnumber', search.createColumn({ name: 'internalid', join: 'binNumber' }) ] }).run().getRange(0,10);

                if(!isEmpty(itemSearchObj)) {
                    curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_tobins',
                        value: itemSearchObj[0].getValue({ name: 'internalid', join: 'binNumber' }), ignoreFieldChange: true });
                }
            }
        }

        // Function is called when Cancel button is clicked.
        function eventOK() {
            let curRec = currentRecord.get(), jsonData = new Array(), finalSubVal = 0, compareFlag = true;
            let sublistCnt = curRec.getLineCount({ sublistId: 'custpage_sublist_invdetdata' });
            let urlVal = new URL(location.href);
            let lineNum = urlVal.searchParams.get('lineNum');
            let locType = urlVal.searchParams.get('locType');

            let qtyVal = curRec.getValue({ fieldId: 'custpage_qtyfield' });

            // Traversing through the Inventory Detail Sublist.
            for(let loop1 = 0; loop1 < sublistCnt; loop1++) {
                let fromBins = curRec.getSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_frombins', line: loop1 });
                let toBins = curRec.getSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_tobins', line: loop1 });
                let qtyAvail = curRec.getSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_qtyavail', line: loop1 });
                let qty = curRec.getSublistValue({ sublistId: 'custpage_sublist_invdetdata', fieldId: 'custpage_sublist_qty', line: loop1 });
                finalSubVal = finalSubVal + qty;
                jsonData.push({ 'fromBins': fromBins, 'toBins': toBins, qty });

                // Checking if the Quantity is greater than Available Quantity.
                if(qty > Number(qtyAvail)) {
                    alert('Total Available Quantity is less than added Quantity.');
                    compareFlag = false;
                }
            }

            // Throwing an error when the Quantity in header doesn't matches the Quantity in sublist.
            if(qtyVal == finalSubVal) {
                if(compareFlag) {
                    window.opener.updateLine(JSON.stringify(jsonData), lineNum - 1);
                    window.onbeforeunload = null;
                    window.close();
                }
            } else {
                alert('The total inventory detail quantity must be ' + qtyVal);
            }
        }

        // Function is called when Cancel button is clicked.
        function eventClose() { window.onbeforeunload = null; window.close(); }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            eventOK: eventOK,
            eventClose: eventClose
        }
    });