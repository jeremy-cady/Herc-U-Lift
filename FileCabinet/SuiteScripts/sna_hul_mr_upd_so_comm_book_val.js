/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author Vishal Pitale
*
* Script brief description:
* M/R script to update the SO Commissionable Book Value in Sales Order Sublist.
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/01/09				  154607	      Vishal Pitale          Initial version
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
            let object = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_mr_upd_so_object' });
            let newCommBookValue = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_mr_upd_so_cmv' });
            let custApplied = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_mr_upd_so_cust_applied' });
log.audit('Details', 'object: ' + object + ', newCommBookValue: ' + newCommBookValue + ', custApplied: ' + custApplied);

            try {
                if(!isEmpty(newCommBookValue)) {
                    // Getting SO with status Pending Billing, Pending Fulfillment and Pending Billing/Partially Fulfilled.
                    let soSearch = search.create({ type: 'salesorder',
                        filters: [ ['custcol_sna_hul_fleet_no','anyof',object], 'AND', ['type','anyof','SalesOrd'], 'AND',
                            ['mainline','is','F'], 'AND', ['status','anyof','SalesOrd:F','SalesOrd:B'] ],
                        columns: [ search.createColumn({ name: 'internalid', summary: 'group' }) ] });
                    let soSearchObj = getFullResultSet(soSearch);
log.audit('soSearchObj', soSearchObj);

                    let soArr = new Array();
                    for(let loop1 = 0; loop1 < soSearchObj.length; loop1++) {
                        soArr.push(soSearchObj[loop1].getValue({ name: 'internalid', summary: 'group' }));
                    }
log.audit('soArr', soArr);

                    let soCustSearch = search.create({ type: 'salesorder', filters: [ ['mainline','is','T'], 'AND',
                            ['customermain.internalid','anyof',custApplied], 'AND', ['type','anyof','SalesOrd'], 'AND',
                            ['status','anyof','SalesOrd:B'], 'AND', ['internalid','anyof',soArr] ], columns: [ 'internalid' ] });
                    let soCustSearchObj = getFullResultSet(soCustSearch);

                    let finalSOArr = new Array();
                    for(let loop2 = 0; loop2 < soCustSearchObj.length; loop2++) {
                        finalSOArr.push({ 'soId': soCustSearchObj[loop2].id });
                    }
                    log.audit('finalSOArr', finalSOArr);

                    return finalSOArr;
                }
            } catch (e) { log.error('Error', e); }
        }

        function map(context) {
            let object = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_mr_upd_so_object' });
            let newCommBookValue = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_mr_upd_so_cmv' });
log.audit('Details', 'object: ' + object + ', newCommBookValue: ' + newCommBookValue);
            let mapData = JSON.parse(context.value);
log.audit('mapData', mapData);
log.audit('mapData.soId', mapData.soId);

            try {
                if(!isEmpty(mapData)) {
                    let loadSO = record.load({ type: 'salesorder', id: mapData.soId });
                    let itemCnt = loadSO.getLineCount({ sublistId: 'item' });

                    for(let loop1 = 0; loop1 < itemCnt; loop1++) {
                        let fleetNo = loadSO.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: loop1 });
log.audit('Sublist Details', 'fleetNo: ' + fleetNo + ', object: ' + object);

                        if(fleetNo == object) {
                            loadSO.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_so_commissionable_bv', line: loop1, value: newCommBookValue });
                        }
                    }
                    let saveSO = loadSO.save({ ignoreMandatoryFields: true });
log.audit('saveSO', saveSO);
                }
            } catch(e) { log.error('Error', e); }
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue))               );
        }

        function getFullResultSet(mySearch) {
            var searchResults = [], pagedData;
            pagedData = mySearch.runPaged({ pageSize: 1000 });
            pagedData.pageRanges.forEach(function(pageRange) {
                var page = pagedData.fetch({ index: pageRange.index });
                page.data.forEach(function(result) { searchResults.push(result); });
            });
            return searchResults;
        }

        return {
            getInputData: getInputData,
            map: map
        };
    });