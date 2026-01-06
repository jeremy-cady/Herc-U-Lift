/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Vishal Pitale
 *
 * Script brief description:
 This Suitelet is used for:
 - Display the Sales Orders Data and creates Inventory Transfers / Transfer Orders.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               	Issue Fix Summary
 * =============================================================================================
 * 2023/11/27          122554          Vishal Pitale            Initial version
 */

define(['N/https', 'N/record', 'N/ui/serverWidget', 'N/search', 'N/url', 'N/runtime', 'N/cache', 'N/query'],
    function(https, record, serverWidget, search, url, runtime, cache, query) {

        let disableFlagTO = false;

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (let k in v)
                    return false;
                return true;
            })(stValue)));
        }

        // Function to attach client script to the Suitelet.
        function attachCS(form) {
            let clientScriptSearch = search.create({ type: 'file', filters: ['name','is','sna_hul_cs_so_transfer_process.js'] }).run().getRange(0,1);
log.audit('clientScriptSearch', clientScriptSearch);
            form.clientScriptFileId = clientScriptSearch[0].id;
            return form;
        }

        function getFullResultSet(mySearch) {
            var searchResults = [],
                pagedData;
            pagedData = mySearch.runPaged({ pageSize: 1000 });
            pagedData.pageRanges.forEach(function (pageRange) {
                var page = pagedData.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    searchResults.push(result);
                });
            });
            return searchResults;
        }

        // Function used to get Data from Sales Order Sublist.
        function getSearchResults(context) {
            let shipMethodTransfer = 98430, locTypeCentral = 1, locTypeVan = 2, itemLocFilter = new Array();
            let soId = context.request.parameters.soId || '';
log.audit('soId', soId);

            // Executing the code only when the soId is not empty.
            if(!isEmpty(soId)) {
                let soItemData = new Array(), locData = new Array(), locIDs = '';

                let soSearchObj = search.create({ type: 'transaction',
                    filters: [ ['internalid','anyof',soId], 'AND', ['mainline','is','F'], 'AND', ['shipping','is','F'], 'AND', ['taxline','is','F'], 'AND',
                        ['custcol_sna_hul_so_linked_transfer','anyof','@NONE@'], 'AND', ['custcol_sna_hul_ship_meth_vendor','anyof',shipMethodTransfer], 'AND',
                        // ['formulanumeric: NVL({quantitycommitted}, 0) + NVL({quantityshiprecv}, 0) + NVL({quantitypacked},0) + NVL({quantitypicked},0)','equalto','0'], 'AND',
                        ['formulanumeric: NVL({quantityshiprecv}, 0) + NVL({quantitypacked},0) + NVL({quantitypicked},0)','equalto','0'], 'AND',
                        ['item.type','anyof','InvtPart'] ],
                    columns: [ search.createColumn({ name: 'usebins', join: 'item' }),
                        // search.createColumn({ name: 'usesbins', join: 'location' }),
                        'custcol_sna_hul_ship_meth_vendor', 'location', 'item', 'quantity' ] });

                let soSearch = getFullResultSet(soSearchObj);
log.audit('soSearch', soSearch);

                // Traversing through the SO Search.
                for(let loop1 = 0; loop1 < soSearch.length; loop1++) {
                    let itemLocation = soSearch[loop1].getValue({ name: 'location' });
                    locIDs = itemLocation + ',';
                }
                locIDs = locIDs.substring(0, (locIDs.length - 1));
log.audit('locData', locIDs);

                // Searching the location details.
                let locSearchObj = new Array();
                let sql = "SELECT ID, PARENT, custrecord_hul_loc_type FROM LOCATION WHERE ID IN ("+locIDs+")";
                let resultIterator = query.runSuiteQLPaged({ query: sql, pageSize: 1000 }).iterator();
                resultIterator.each(function (page) {
                    let pageIterator = page.value.data.iterator();
                    pageIterator.each(function (row) {
                        locSearchObj.push({ id: row.value.getValue(0), parent: row.value.getValue(1), locType: row.value.getValue(2) });
                        return true;
                    });
                    return true;
                });
log.audit('locSearchObj', locSearchObj);

                // Traversing through the Sales Order sublist to get the items details.
                for(let loop2 = 0; loop2 < soSearch.length; loop2++) {
                    let item = soSearch[loop2].getValue({ name: 'item' });
                    let qty = soSearch[loop2].getValue({ name: 'quantity' });
                    let toLoc = soSearch[loop2].getValue({ name: 'location' });
                    let useBinsItem = soSearch[loop2].getValue({ name: 'usebins', join: 'item' });
                    let useBinsLoc = '';
                    // let useBinsLoc = soSearch[loop2].getValue({ name: 'usesbins', join: 'location' });
                    let fromLoc = '', transactionCreated = 'Transfer Order';

                    // Traversing through the To Location to get the Location Type.
                    for(let loop3 = 0; loop3 < locSearchObj.length; loop3++) {

log.audit('Compare Details', 'locSearchObj[loop3].id: ' + locSearchObj[loop3].id + ', toLoc: ' + toLoc + ', locSearchObj[loop3].locType: ' + locSearchObj[loop3].locType + ', locTypeVan: ' + locTypeVan);
                        // Getting the Location Data for To Location.
                        if(locSearchObj[loop3].id == toLoc && locSearchObj[loop3].locType == locTypeVan) {
                            fromLoc = locSearchObj[loop3].parent;
                            transactionCreated = 'Inventory Transfer';
                            break;
                        }
                    }

                    if(loop2 == 0 && transactionCreated == 'Transfer Order') {
                        disableFlagTO = true;
                    }

                    soItemData.push({
                        'item': item,
                        'qty': qty,
                        'toLoc': toLoc,
                        'fromLoc': fromLoc,
                        'useBinsItem': useBinsItem,
                        'useBinsLoc': useBinsLoc,
                        'transactionCreated': transactionCreated
                    });
                }
log.audit('soItemData', soItemData);

                return soItemData;
            }

            return '';
        }

        // Function used to create the UI.
        function createUI(context, form) {

            let subsidiary = context.request.parameters.subsidiary;
            let soId = context.request.parameters.soId;
            let subsidiaryField = form.addField({id: 'custpage_subsidiary', type: serverWidget.FieldType.SELECT, label: 'Subsidiary', source: 'subsidiary'}).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            let soIDField = form.addField({id: 'custpage_soid', type: serverWidget.FieldType.SELECT, label: 'Sales Order ID', source: 'transaction'}).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

            if(!isEmpty(subsidiary)) { subsidiaryField.defaultValue = subsidiary; }
            if(!isEmpty(soId)) { soIDField.defaultValue = soId; }

            let soSublist = form.addSublist({ id: 'custpage_sublist_solist', type: serverWidget.SublistType.LIST, label: 'Sublist Data' });
            soSublist.addField({ id: 'custpage_sublist_linenumber', type: serverWidget.FieldType.INTEGER, label: 'Line Number' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            soSublist.addField({ id: 'custpage_sublist_chk', type: serverWidget.FieldType.CHECKBOX, label: 'Select' });
            soSublist.addField({ id: 'custpage_sublist_item', type: serverWidget.FieldType.SELECT, label: 'Item', source: 'item' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            soSublist.addField({ id: 'custpage_sublist_qty', type: serverWidget.FieldType.INTEGER, label: 'Quantity' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            soSublist.addField({ id: 'custpage_sublist_toloc', type: serverWidget.FieldType.SELECT, label: 'To Location', source: 'location' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            soSublist.addField({ id: 'custpage_sublist_fromloc', type: serverWidget.FieldType.SELECT, label: 'From Location', source: 'location' });
            soSublist.addField({ id: 'custpage_sublist_itemusebins', type: serverWidget.FieldType.CHECKBOX, label: 'Use Bins' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
            let invDetField = soSublist.addField({ id: 'custpage_sublist_locinvdet', type: serverWidget.FieldType.CHECKBOX, label: 'Inventory Detail' });
            soSublist.addField({ id: 'custpage_sublist_locinvdetenter', type: serverWidget.FieldType.CHECKBOX, label: 'Inventory Detail Data Entered' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
            soSublist.addField({ id: 'custpage_sublist_locinvdetdata', type: serverWidget.FieldType.TEXTAREA, label: 'Inventory Detail Data' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });
            soSublist.addField({ id: 'custpage_sublist_qtyfrmloc', type: serverWidget.FieldType.TEXT, label: 'Quantity Available (From Location)' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });
            soSublist.addField({ id: 'custpage_sublist_trtocreated', type: serverWidget.FieldType.TEXT, label: 'Transfer to be created' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

            // Disabling the Inventory Detail field for Transfer Orders.
            if(disableFlagTO) { invDetField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED }); }

            // Adding Buttons.
            let addSubmitButton = form.addSubmitButton({ id: 'custpage_btn_submit', label: 'Create Transfer' });
            let addCancelButton = form.addButton({ id: 'custpage_btn_close', label: 'Close', functionName: 'eventClose' });
            return form;
        }

        // Function to populate the sublist.
        function populateSublist(resultSet, form) {
            let filterData = new Array(), idx = 0, emptyQtyAvailFlag = true;
            let sublistObj = form.getSublist({ id: 'custpage_sublist_solist' }), itemSearchObj = '';

            // Traversing through the resultset to get the items and locations to get the Qty Available,
            for(let loop2 = 0; loop2 < resultSet.length; loop2++) {
                let item = resultSet[loop2].item;
                let fromLoc = resultSet[loop2].fromLoc;
                let innerFilterData = new Array();

                // Executing the code only when the item and From Location is not empty.
                if(!isEmpty(item) && !isEmpty(fromLoc)) {
                    innerFilterData[0] = ['internalid','anyof',item], innerFilterData[1] = 'AND';
                    innerFilterData[2] = ['inventorylocation','anyof',fromLoc], innerFilterData[3] = 'AND';
                    innerFilterData[4] = ['locationquantityavailable','greaterthan','0'];

                    filterData[idx] = innerFilterData, idx++;
                    filterData[idx] = 'OR', idx++; emptyQtyAvailFlag = false;
                }
            }
            filterData.pop();

            // Executing the code only when the filters are created.
            if(!emptyQtyAvailFlag) {
                itemSearchObj = search.create({ type: 'item',
                    filters: filterData,
                    columns: [ search.createColumn({ name: 'itemid', sort: search.Sort.ASC }), 'inventorylocation', 'locationquantityavailable' ] }).run().getRange(0,999);
            }
log.audit('itemSearchObj', itemSearchObj);

            // Traversing through the resultSet to populate the sublist.
            for(let loop1 = 0; loop1 < resultSet.length; loop1++) {
                let item = resultSet[loop1].item;
                let qty = resultSet[loop1].qty;
                let toLoc = resultSet[loop1].toLoc;
                let fromLoc = resultSet[loop1].fromLoc;
                let transactionCreated = resultSet[loop1].transactionCreated;
                let useBinsItem = resultSet[loop1].useBinsItem;
                let useBinsLoc = resultSet[loop1].useBinsLoc;
log.audit('Details', 'item: ' + item + ', qty: ' + qty + ', toLoc: ' + toLoc + ', fromLoc: ' + fromLoc + ', transactionCreated: ' + transactionCreated + ', useBinsItem: ' + useBinsItem);

                // Populating the sublist only when the data is not empty.
                sublistObj.setSublistValue({ id: 'custpage_sublist_linenumber', line: loop1, value: loop1 });
                if(!isEmpty(item)) { sublistObj.setSublistValue({ id: 'custpage_sublist_item', line: loop1, value: item }); }
                if(!isEmpty(qty)) { sublistObj.setSublistValue({ id: 'custpage_sublist_qty', line: loop1, value: parseInt(qty) }); }
                if(!isEmpty(toLoc)) { sublistObj.setSublistValue({ id: 'custpage_sublist_toloc', line: loop1, value: toLoc }); }
                if(!isEmpty(fromLoc)) { sublistObj.setSublistValue({ id: 'custpage_sublist_fromloc', line: loop1, value: fromLoc }); }
                if(!isEmpty(transactionCreated)) { sublistObj.setSublistValue({ id: 'custpage_sublist_trtocreated', line: loop1, value: transactionCreated }); }
                sublistObj.setSublistValue({ id: 'custpage_sublist_itemusebins', line: loop1, value: useBinsItem ? 'T' : 'F' });

                // Populating the QUANTITY AVAILABLE.
                if(emptyQtyAvailFlag) {
                    sublistObj.setSublistValue({ id: 'custpage_sublist_qtyfrmloc', line: loop1, value: '0' });
                } else {
                    // Traversing through the search result to populate the Quantity Available.
                    for(let loop3 = 0; loop3 < itemSearchObj.length; loop3++) {
                        let searchItem = itemSearchObj[loop3].id;
                        let searchLoc = itemSearchObj[loop3].getValue({ name: 'inventorylocation' });
                        let qtyAvail = itemSearchObj[loop3].getValue({ name: 'locationquantityavailable' });

                        if(!isEmpty(qtyAvail) && searchItem == item && searchLoc == fromLoc) {
                            sublistObj.setSublistValue({ id: 'custpage_sublist_qtyfrmloc', line: loop1, value: qtyAvail });
                            break;
                        } else {
                            sublistObj.setSublistValue({ id: 'custpage_sublist_qtyfrmloc', line: loop1, value: '0' });
                        }
                    }
                }
            }
            return form;
        }

        // Post Method Function.
        function postMethod(context) {
            let updateSOJSON = new Array(), postTransactionsCreated = new Array(), recCreateData = new Array(), newRecData = new Array();
            let subsidiary = context.request.parameters.custpage_subsidiary;
            let soId = context.request.parameters.custpage_soid;
            let subCnt = context.request.getLineCount({ group: 'custpage_sublist_solist' });

            // Gathering the data from the Suitelet's sublist.
            for(let loop1 = 0; loop1 < subCnt; loop1++) {
                let JSONFlag = true;
                let marked = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_chk', line: loop1 });

                // Gathering the data for marked records.
                if(marked == 'T' || marked == true) {
                    let lineNum = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_linenumber', line: loop1 });
                    let item = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_item', line: loop1 });
                    let qty = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_qty', line: loop1 });
                    let toLoc = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_toloc', line: loop1 });
                    let fromLoc = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_fromloc', line: loop1 });
                    let locDetData = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_locinvdetdata', line: loop1 });
                    let transactionCreated = context.request.getSublistValue({ group:'custpage_sublist_solist', name:'custpage_sublist_trtocreated', line: loop1 });

log.audit('b4 recCreateData ' + loop1, recCreateData);
                    // Pushing the data in the new created array.
                    if(!isEmpty(recCreateData)) {
log.audit('inside if 1', recCreateData);

                        for(let loop2 = 0; loop2 < recCreateData.length; loop2++) {
                            let jsonFromLoc = recCreateData[loop2].fromLoc;
                            let jsonToLoc = recCreateData[loop2].toLoc;
                            let jsonTransaction = recCreateData[loop2].recType;
log.audit('inside if 2', 'fromLoc: ' + fromLoc + ', jsonFromLoc: ' + jsonFromLoc + ', toLoc: ' + toLoc + ', jsonToLoc: ' + jsonToLoc + ', transactionCreated: ' + transactionCreated + ', jsonTransaction: ' + jsonTransaction);
                            // Updating the JSON with same from location, to location and transaction created.
                            if(fromLoc == jsonFromLoc && toLoc == jsonToLoc && transactionCreated == jsonTransaction) {
log.audit('inside if 3', recCreateData);
                                let itemArr = recCreateData[loop2].itemArr;
log.audit('itemArr', itemArr);
                                if(!isEmpty(itemArr)) {
log.audit('b4 pushing recCreateData', recCreateData);
                                    recCreateData[loop2].itemArr.push({ 'item': item, 'qty': qty, 'locDetData': locDetData })
log.audit('a4 pushing recCreateData', recCreateData);
                                } else {
log.audit('else condition push', recCreateData);
                                    let itemArr = new Array();
                                    itemArr.push({ 'item': item, 'qty': qty, 'locDetData': locDetData });
                                    recCreateData[loop2].itemArr = itemArr;
                                }
                                JSONFlag = false;
                                break;
                            }
log.audit('JSONFlag', JSONFlag);
                            if(loop2 == (recCreateData.length - 1) && JSONFlag) {
log.audit('inside if 4', recCreateData);
                                let itemArr = new Array();
                                itemArr.push({ 'item': item, 'qty': qty, 'locDetData': locDetData });
                                recCreateData.push({ 'recType': transactionCreated, 'fromLoc': fromLoc, 'toLoc': toLoc, 'subsidiary': subsidiary, 'itemArr': itemArr });
log.audit('inside if 5', recCreateData);
                                break;
                            }
                        }
                    } else {
log.audit('inside else b4', recCreateData);
                        let itemArr = new Array();
                        itemArr.push({ 'item': item, 'qty': qty, 'locDetData': locDetData });
                        recCreateData.push({ 'recType': transactionCreated, 'fromLoc': fromLoc, 'toLoc': toLoc, 'subsidiary': subsidiary, 'itemArr': itemArr });
log.audit('inside else a4', recCreateData);
                    }
                }
            }
log.audit('recCreateData', recCreateData);

            // Traversing through the JSON.
            for(let loop1 = 0; loop1 < recCreateData.length; loop1++) {
                let itemInsert = new Array();
                let transactionCreated = recCreateData[loop1].recType;
                let subsidiary = recCreateData[loop1].subsidiary;
                let fromLoc = recCreateData[loop1].fromLoc;
                let toLoc = recCreateData[loop1].toLoc;
                let itemArr = recCreateData[loop1].itemArr;

                if(transactionCreated == 'Transfer Order') {
                    let createRec = record.create({ type: 'transferorder', isDynamic: true });
                    createRec.setValue({ fieldId: 'subsidiary', value: subsidiary });
                    createRec.setValue({ fieldId: 'location', value: fromLoc });
                    createRec.setValue({ fieldId: 'transferlocation', value: toLoc });
                    createRec.setValue({ fieldId: 'orderstatus', value: 'B' });             // 'B' - Pending Fulfillment.
                    createRec.setValue({ fieldId: 'incoterm', value: 1 });                  // 1 - DAP.
                    createRec.setValue({ fieldId: 'custbody_sna_hul_created_from_so', value: soId });

                    for(let loop2 = 0; loop2 < itemArr.length; loop2++) {
                        let item = itemArr[loop2].item;
                        let qty = itemArr[loop2].qty;
                        let locDetData = itemArr[loop2].locDetData;

                        createRec.selectNewLine({ sublistId: 'item' });
                        createRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: item });
                        createRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qty });

                        let flagVar = false;

                        try {
                            let invDetail = createRec.getCurrentSublistSubrecord({ sublistId: 'inventory', fieldId: 'inventorydetail' });
                            flagVar = true;
                        } catch(e) { }

                        // Executing the code only when the Inventory Detail is found.
                        if(flagVar) {
                            let invData = JSON.parse(locDetData);
log.audit('invData', invData);

                            let invDetail = createRec.getCurrentSublistSubrecord({ sublistId: 'inventory', fieldId: 'inventorydetail' });
log.audit('invDetail TO', invDetail);

                            for(let loop3 = 0; loop3 < invData.length; loop3++) {
                                invDetail.selectNewLine({ sublistId: 'inventoryassignment' });
                                invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'binnumber', value: invData[loop3].fromBins });
                                invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'tobinnumber', value: invData[loop3].toBins });
                                invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: invData[loop3].qty });
                                invDetail.commitLine({ sublistId: 'inventoryassignment' });
                            }
                        }

                        createRec.commitLine({ sublistId: 'item' });
                        itemInsert.push(item);
                    }
                    let saveRec = createRec.save({ ignoreMandatoryFields: true });
                    updateSOJSON.push({ 'itemIdArr': itemInsert, 'recId': saveRec });
                    postTransactionsCreated.push(saveRec);
                }

                // Creating the Inventory Transfer.
                if(transactionCreated == 'Inventory Transfer') {
                    let createRec = record.create({ type: 'inventorytransfer', isDynamic: true });
                    createRec.setValue({ fieldId: 'subsidiary', value: subsidiary });
                    createRec.setValue({ fieldId: 'location', value: fromLoc });
                    createRec.setValue({ fieldId: 'transferlocation', value: toLoc });
                    createRec.setValue({ fieldId: 'custbody_sna_hul_created_from_so', value: soId });

                    for(let loop2 = 0; loop2 < itemArr.length; loop2++) {
                        let item = itemArr[loop2].item;
                        let qty = itemArr[loop2].qty;
                        let locDetData = itemArr[loop2].locDetData;

                        createRec.selectNewLine({ sublistId: 'inventory' });
                        createRec.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'item', value: item });
                        createRec.setCurrentSublistValue({ sublistId: 'inventory', fieldId: 'adjustqtyby', value: qty });

                        let flagVar = false;

                        try {
                            let invDetail = createRec.getCurrentSublistSubrecord({ sublistId: 'inventory', fieldId: 'inventorydetail' });
                            flagVar = true;
                        } catch(e) { }

log.audit('flagVar', flagVar);
                        // Executing the code only when the Inventory Detail is found.
                        if(flagVar) {
                            let invData = JSON.parse(locDetData);
log.audit('invData', invData);

                            let invDetail = createRec.getCurrentSublistSubrecord({ sublistId: 'inventory', fieldId: 'inventorydetail' });
log.audit('invDetail IT', invDetail);

                            for(let loop3 = 0; loop3 < invData.length; loop3++) {
                                invDetail.selectNewLine({ sublistId: 'inventoryassignment' });
                                invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'binnumber', value: invData[loop3].fromBins });
                                invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'tobinnumber', value: invData[loop3].toBins });
                                invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: invData[loop3].qty });
                                invDetail.commitLine({ sublistId: 'inventoryassignment' });
                            }
                        }

                        createRec.commitLine({ sublistId: 'inventory' });
                        itemInsert.push(item);
                    }

                    let saveRec = createRec.save({ ignoreMandatoryFields: true });
                    updateSOJSON.push({ 'itemIdArr': itemInsert, 'recId': saveRec });
                    postTransactionsCreated.push(saveRec);

                }
            }
log.audit('updateSOJSON', updateSOJSON);

            // Executing the code when the final json is not empty.
            if(!isEmpty(updateSOJSON)) {
                let loadSO = record.load({ type: 'salesorder', id: soId });
                let itemCount = loadSO.getLineCount({ sublistId: 'item' });

                // Traversing through the item list to update the transaction created links.
                for(let loop1 = 0; loop1 < itemCount; loop1++) {
                    let breakLoop = false;
                    let item = loadSO.getSublistValue({ sublistId: 'item', fieldId: 'item', line: loop1 });

                    // Traversing through the JSON.
                    for(let loop2 = 0; loop2 < updateSOJSON.length; loop2++) {
                        let jsItemInsertArr = updateSOJSON[loop2].itemIdArr;

                        for(let loop3 = 0; loop3 < jsItemInsertArr.length; loop3++) {
                            let jsItem = jsItemInsertArr[loop3];

                            // Updating the sublist item's Linked Transfer Value.
                            if(item == jsItem) {
                                loadSO.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_so_linked_transfer', line: loop1, value: updateSOJSON[loop2].recId });
                                breakLoop = true;
                                break;
                            }
                        }

                        if(breakLoop) { break; }
                    }
                }
                let saveRec = loadSO.save({ ignoreMandatoryFields: true });
log.audit('saveRec final', saveRec);

                let form = serverWidget.createForm({ title: 'Processing is completed. Please close the Window.' });
                form = attachCS(form);
                let createTransactionField = form.addField({id: 'custpage_transaction', type: serverWidget.FieldType.MULTISELECT, label: 'Transaction Created', source: 'transaction'}).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                createTransactionField.defaultValue = postTransactionsCreated;
                let addCancelButton = form.addButton({ id: 'custpage_btn_close', label: 'Close', functionName: 'eventCloseSORefresh' });
                context.response.writePage(form);
            }
        }


        // Get Method Function.
        function getMethod(context) {
            let finalForm = '', form = serverWidget.createForm({ title: 'Sales Order Transfer Process' });

log.audit('Start', '------------------------------------------------------------------------------------------------------------------------------------------------------------------------');
            let resultSet = getSearchResults(context);
            let csAttachForm = attachCS(form);
            let uiForm = createUI(context, csAttachForm);

            // Executing the code only when the resultSet is not empty.
            if(!isEmpty(resultSet)) {
                finalForm = populateSublist(resultSet, uiForm);
            }
            else { finalForm = uiForm; }

            context.response.writePage(finalForm);
        }


        function onRequest(context) {
            try {
                // Conditional Execution for GET and POST method.
                if (context.request.method == https.Method.GET) { getMethod(context); }
                if (context.request.method == https.Method.POST) { postMethod(context); }
            }
            catch(e) { log.error('Error', e); }
        }

        return {
            onRequest : onRequest
        }
    });