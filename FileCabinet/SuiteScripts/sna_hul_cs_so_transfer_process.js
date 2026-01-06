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
 * Client script is attached to the suitelet SNA HUL SL SO Transfer Process.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               Issue Fix Summary
 * =============================================================================================
 * 2023/11/27          122554         Vishal Pitale          Initial version
 */
define(['N/url', 'N/currentRecord', 'N/format', 'N/search'],
    function(url, currentRecord, format, search) {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (let k in v)
                    return false;
                return true;
            })(stValue)));
        }

        // Function used to parse and format the date.
        function parseAndFormatDateString(myDate)
        {
            var initialFormattedDateString = myDate;
            if(initialFormattedDateString != '') {
                var parsedDateStringAsRawDateObject = format.parse({ value: initialFormattedDateString, type: format.Type.DATE });
                var formattedDateString = format.format({ value: parsedDateStringAsRawDateObject, type: format.Type.DATE });
            }
            else { var formattedDateString = ''; }
            return formattedDateString;
        }

        // Function used to get the URL for Print Packing Slip Suitelet.
        function getSuiteletURL() {
            return url.resolveScript({ scriptId: 'customscript_sna_hul_sl_so_transfer_proc', deploymentId: 'customdeploy_sna_hul_sl_so_transfer_proc' });
        }

        // Function used to get the URL for Print Packing Slip Suitelet.
        function getInvDetURL() {
            return url.resolveScript({ scriptId: 'customscript_sna_hul_so_transproc_invdet', deploymentId: 'customdeploy_sna_hul_so_transproc_invdet' });
        }

        // Page Init Event.
        function pageInit(context) {
            window.updateLine = function(jsonValue, lineNumber) {
                let curRec = currentRecord.get();
                curRec.selectLine({ sublistId: 'custpage_sublist_solist', line: lineNumber });
                curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_locinvdetdata', value: jsonValue });
                curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_locinvdetenter', value: true });
            }
        }

        // Field Changed Event.
        function fieldChanged(context){

            let fieldId = context.fieldId;
            let curRec = context.currentRecord;
            let lineNum = context.line;
            let item = curRec.getSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_item', line: lineNum });
            let qty = curRec.getSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_qty', line: lineNum });
            let fromLoc = curRec.getSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_fromloc', line: lineNum });

            if(fieldId == 'custpage_sublist_locinvdet') {
                let toLocation = curRec.getSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_toloc', line: lineNum });
                let invDetURL = getInvDetURL() + '&item=' + item + '&qty=' + qty + '&lineNum=' + (lineNum + 1) + '&fromLocation=' + fromLoc + '&toLocation=' + toLocation;

                if(!isEmpty(fromLoc)) {
                    window.open(invDetURL, '', 'width=1000, height=400, top=500, left=500, menubar=1');
                } else {
                    alert('Please select From Location.');
                }
            }

            if(fieldId == 'custpage_sublist_fromloc') {
                curRec.selectLine({ sublistId: 'custpage_sublist_solist', line: lineNum });
                curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_locinvdetdata', value: '' });
                curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_locinvdetenter', value: false });

                if(!isEmpty(fromLoc)) {
                    let itemSearchObj = search.create({ type: 'item',
                        filters: [ [['internalid','anyof',item],'AND',['inventorylocation','anyof',fromLoc],'AND',['locationquantityavailable','greaterthan','0']] ],
                        columns: [ search.createColumn({ name: 'itemid', sort: search.Sort.ASC }), 'inventorylocation', 'locationquantityavailable' ] }).run().getRange(0,1);

                    if(!isEmpty(itemSearchObj)) {
                        let locQtyAvail = itemSearchObj[0].getValue({ name: 'locationquantityavailable' });
                        if(!isEmpty(locQtyAvail)) {
                            curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_qtyfrmloc', value: locQtyAvail });
                        }
                    } else {
                        curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_qtyfrmloc', value: '0' });
                    }
                } else {
                    curRec.setCurrentSublistValue({ sublistId: 'custpage_sublist_solist', fieldId: 'custpage_sublist_qtyfrmloc', value: '0' });
                }
            }
        }

        // Save Record Event.
        function saveRecord(context) {
            try {
                let currentRec = currentRecord.get(), chkMarkFlag = false, recChk = 0, invDetFlag = true, fromLocFlag = true, qtyFlag = true;

                // Getting the sublist marked fields.
                let count = currentRec.getLineCount({ sublistId: 'custpage_sublist_solist' });

                // Traversing through the sublist.
                for(let loop1 = 0; loop1 < count; loop1++) {
                    let marked = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_chk', line: loop1 });
                    let line = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_linenumber', line: loop1 }) + 1;
                    let fromLoc = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_fromloc', line: loop1 });
                    let itemUseBins = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_itemusebins', line: loop1 });
                    let transaction = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_trtocreated', line: loop1 });
                    let invDetailEntered = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_locinvdetenter', line: loop1 });
                    let qty = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_qty', line: loop1 });
                    let qtyAvailable = currentRec.getSublistValue({ sublistId:'custpage_sublist_solist', fieldId:'custpage_sublist_qtyfrmloc', line: loop1 });

                    // Executing the code if the record is checked.
                    if(marked === true) {
                        chkMarkFlag = true; recChk++;

                        // Executing the code only when the From Location is empty.
                        if(isEmpty(fromLoc)) {
                            fromLocFlag = false;
                            alert('Please select the From Location on Line ' + line);
                            break;
                        }

                        // Executing the code for Inventory Transfer and empty Inventory Detail checked records.
                        if(transaction == 'Inventory Transfer' && invDetailEntered == false && itemUseBins == true) {
                            invDetFlag = false;
                            alert('Please enter the Inventory Details for Item on Line ' + line);
                            break;
                        }

                        // Executing
                        if(qtyAvailable < qty) {
                            qtyFlag = false;
                            alert('Not enough quantity to transfer for Item on Line ' + line);
                            break;
                        }
                    }

                    // Executing the code only when the Work Order checked are beyond 50.
                    // if(recChk > 10) { chkMarkFlag = false; alert('A maximum of 10 Orders are only allowed to be Processed.'); }
                }

                if(!chkMarkFlag && recChk < 100) {
                    alert('Please check the transactions to be Processed.');
                }

                return chkMarkFlag && invDetFlag && fromLocFlag && qtyFlag;
            } catch (e) { log.error('Error', e); }
        }

        // Function is called when Cancel button is clicked.
        function eventClose() { window.onbeforeunload = null; window.open('', '_self').close(); }

        // Function is called when Close button is clicked in POST.
        function eventCloseSORefresh() {
            window.opener.location.reload();
            window.open('', '_self').close();
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            eventClose: eventClose,
            eventCloseSORefresh: eventCloseSORefresh
        }
    });