/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
/**
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Vishal Pitale
 *
 * Script brief description:
 This Suitelet is used to create JE and update time entries in the Invoice.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               	Issue Fix Summary
 * =============================================================================================
 * 2025/01/28                        Care Parba               Added changes to post time entries attached to SO or Invoice lines that has 0 quantity
 * 2024/03/11        168271          Vishal Pitale            Adding support for JE creation when Invoice is updated.
 * 2024/01/29                        Vishal Pitale            Initial version
 */
define(['N/https', 'N/record', 'N/search'],
    function(https, record, search) {

        /**
         * Check if value is empty (null, undefined, empty array, empty object)
         * @param {string|[]|{}} stValue
         * @returns {boolean} - Returns true if the input value is empty
         */
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (let k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Retrieves the entire result set
         * @param {search.Search} mySearch
         * @returns {Array<search.Result>} searchResults - Returns an array of search results
         */
        function getFullResultSet(mySearch) {
            var searchResults = [], pagedData;
            pagedData = mySearch.runPaged({ pageSize: 1000 });

            pagedData.pageRanges.forEach(function (pageRange) {
                var page = pagedData.fetch({ index: pageRange.index });
                page.data.forEach(function (result) { searchResults.push(result); });
            });
            return searchResults;
        }

        // Debit Account = 53012 COGS - Service Revenue : COGS - Service Labor : COGS - Service Labor – Internal (id: 646)
        // Credit Account = 13830 Inventory : Work In-Process : Labor WIP (id: 464)
        let debitAccount = 646, creditAccount = 464;

        // Function to get the Time Entries from Invoice when it is getting created.
        function invGetTimeEntries(newRec) {
            let invTimeEntryList = new Array(), finalList = new Array();
            let lineCount = newRec.getLineCount({ sublistId: 'item' });
            log.audit('lineCount', lineCount);

            // Traversing through the sublist to get the Time Entries in the
            for(let loop1 = 0; loop1 < lineCount; loop1++) {
                let timeEntry = newRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_linked_time', line: loop1 });

                if(!isEmpty(timeEntry)) { invTimeEntryList.push(timeEntry); }
            }
            log.audit('invTimeEntryList', invTimeEntryList);

            // Executing the code only when the Time Entry List is not empty.
            if(!isEmpty(invTimeEntryList)) {
                let timebillSearchObj = search.create({ type: 'timebill', filters: [ ['internalid','anyof',invTimeEntryList], 'AND', ['posted','is','F'] ] });
                timebillSearchObj = getFullResultSet(timebillSearchObj);
                log.audit('timebillSearchObj', timebillSearchObj);

                // Getting the Internal Id's of the Posted Time Entries.
                for(let loop2 = 0; loop2 < timebillSearchObj.length; loop2++) {
                    finalList.push(timebillSearchObj[loop2].id);
                }
            } else {
                log.error('Inside invGetTimeEntries', 'invTimeEntryList is empty.');
            }

            return finalList;
        }

        // Function to get the Time Entries from the Sales Order when Invoice is getting updated.
        function soGetTimeEntries(newRec) {
            let soTimeEntryList = new Array(), finalList = new Array();
            let soId = newRec.getValue({ fieldId: 'createdfrom' });
            log.audit('soId', soId);

            let soSearchObj = search.create({ type: 'transaction', filters: [ ['internalid','anyof',soId], 'AND',
                    ['mainline','is','F'], 'AND', ['shipping','is','F'], 'AND',  ['cogs','is','F'], 'AND', ['taxline','is','F'] ],
                columns: [ 'item', 'quantity', 'quantitybilled', 'custcol_sna_linked_time',
                    search.createColumn({ name: 'posted', join: 'CUSTCOL_SNA_LINKED_TIME' }) ] });

            soSearchObj = getFullResultSet(soSearchObj);
            log.audit('soSearchObj', soSearchObj);

            // Traversing through the SO search Resultset.
            for(let loop1 = 0; loop1 < soSearchObj.length; loop1++) {
                let timeEntry = soSearchObj[loop1].getValue({ name: 'custcol_sna_linked_time' });
                let quantity = soSearchObj[loop1].getValue({ name: 'quantity' });
                let quantityBilled = soSearchObj[loop1].getValue({ name: 'quantitybilled' });
                let postedVal = soSearchObj[loop1].getValue({ name: 'posted', join: 'CUSTCOL_SNA_LINKED_TIME' });
                log.audit('postedVal', postedVal);

                if(!isEmpty(timeEntry) && quantity == quantityBilled) {
                    soTimeEntryList.push(timeEntry);
                }
            }
            log.audit('soTimeEntryList', soTimeEntryList);

            // Executing the code only when the Time Entry List is not empty.
            if(!isEmpty(soTimeEntryList)) {
                let timebillSearchObj = search.create({ type: 'timebill', filters: [ ['internalid','anyof',soTimeEntryList], 'AND', ['posted','is','F'] ] });
                timebillSearchObj = getFullResultSet(timebillSearchObj);

                // Getting the Internal Id's of the Posted Time Entries.
                for(let loop1 = 0; loop1 < timebillSearchObj.length; loop1++) {
                    finalList.push(timebillSearchObj[loop1].id);
                }
            } else {
                log.error('Error', 'soTimeEntryList is empty');
            }
            log.audit('finalList', finalList);

            return finalList;
        }

        // Function to create the Journal Entry for the Time Entries.
        function createCOGSJE(invId, timeEntryList, newRec) {
            let timebillSearchObj = search.create({ type: 'timebill', filters: [ ['internalid','anyof',timeEntryList] ],
                columns: [ 'durationdecimal', 'employee', 'customer', 'department', 'location', search.createColumn({ name: 'laborcost', join: 'employee' }),
                    'line.cseg_sna_revenue_st' ] });
            timebillSearchObj = getFullResultSet(timebillSearchObj);
            log.audit('timebillSearchObj', timebillSearchObj);

            // Executing the code only when the search for the time bills is not empty.
            if(!isEmpty(timebillSearchObj)) {
                let memoVal = '';
                let invSearchObj = search.create({ type: 'invoice', filters: [ ['internalid','anyof',invId], 'AND', ['mainline','is','T'] ], columns: [ 'tranid' ] }).run().getRange(0,1);
                log.audit('invSearchObj', invSearchObj);

                // Executing the code only when the search is not empty.
                if(!isEmpty(invSearchObj)) {
                    let tranId = invSearchObj[0].getValue({ name: 'tranid' });
                    log.audit('tranId', tranId);
                    memoVal = 'Time entry for Invoice ' + tranId;
                    log.audit('memoVal', memoVal);
                }

                let journalEntry = record.create({ type: record.Type.JOURNAL_ENTRY, isDynamic: true });
                journalEntry.setValue({ fieldId: 'trandate', value: new Date(newRec.getValue({ fieldId: 'trandate' })) });
                journalEntry.setValue({ fieldId: 'subsidiary', value: newRec.getValue({ fieldId: 'subsidiary' }) });
                journalEntry.setValue({ fieldId: 'memo', value: memoVal });

                for(let loop2 = 0; loop2 < timebillSearchObj.length; loop2++) {
                    let memo = timebillSearchObj[loop2].id;
                    let customer = timebillSearchObj[loop2].getValue({ name: 'customer' });
                    let dept = timebillSearchObj[loop2].getValue({ name: 'department' });
                    let location = timebillSearchObj[loop2].getValue({ name: 'location' });
                    let revenueStream = timebillSearchObj[loop2].getValue({ name: 'line.cseg_sna_revenue_st' });
                    let amount = timebillSearchObj[loop2].getValue({ name: 'durationdecimal' }) * timebillSearchObj[loop2].getValue({ name: 'laborcost', join: 'employee' });

                    journalEntry.selectNewLine({ sublistId: 'line' });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'account', value: debitAccount });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'entity', value: customer });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'debit', value: amount });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'department', value: dept });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'location', value: location });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'cseg_sna_revenue_st', value: revenueStream });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'memo', value: memo });
                    journalEntry.commitLine({ sublistId: 'line' });

                    journalEntry.selectNewLine({ sublistId: 'line' });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'account', value: creditAccount });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'entity', value: customer });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'credit', value: amount });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'department', value: dept });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'location', value: location });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'cseg_sna_revenue_st', value: revenueStream });
                    journalEntry.setCurrentSublistValue({ sublistId: 'line', fieldId: 'memo', value: memo });
                    journalEntry.commitLine({ sublistId: 'line' });
                }

                let journalEntryId = journalEntry.save();
                log.audit('journalEntryId', journalEntryId);

                // Posting and updating the Time Bills after Journal Entry is created.
                if(!isEmpty(journalEntryId)) {
                    for(let loop2 = 0; loop2 < timeEntryList.length; loop2++) {
                        let timeEntryID = timeEntryList[loop2];
                        log.audit('timeEntryID ' + loop2, timeEntryID);

                        record.submitFields({ type: 'timebill', id: timeEntryID, values: { 'posted' : true, 'custcol_sna_hul_linked_je': journalEntryId } });
                    }
                } else {
                    log.error('journalEntryId is empty', journalEntryId);
                }
            } else {
                log.error('Error', 'timebillSearchObj is empty');
            }
        }

        // POST Method Function.
        function postMethod(context) {
            let timeBillList = new Array();
            let invId = context.request.parameters.invId;
            let action = context.request.parameters.action;
            log.audit('Parameter Details', 'invId: ' + invId + ', action: ' + action);

            // Executing the code only when the Invoice ID is not empty.
            if(!isEmpty(invId)) {
                let newRec = record.load({ type: 'invoice', id: invId });

                // Executing the code if the action is Invoice Creation.
                if(action == 'create') {
                    //timeBillList = invGetTimeEntries(newRec);
                    timeBillList = soGetTimeEntries(newRec);
                }

                // Executing the code if the action is Invoice Editing.
                if(action == 'edit') {
                    timeBillList = soGetTimeEntries(newRec);
                }

                log.audit('action: ' + action + ': timeBillList', timeBillList);

                // Creating the Journal Entry for the Time Bills.
                if(!isEmpty(timeBillList)) {
                    // Function used to create JE and update the time entry.
                    createCOGSJE(invId, timeBillList, newRec);
                }
                log.audit('Details', 'Script Completed.');

                context.response.write('Script Completed.');
            }
        }

        function onRequest(context) {
            try {
                // Conditional Execution for GET and POST method.
                if (context.request.method == https.Method.POST) { postMethod(context); }
            }
            catch(e) { log.error('Error', e); }
        }

        return {
            onRequest : onRequest
        }
    });