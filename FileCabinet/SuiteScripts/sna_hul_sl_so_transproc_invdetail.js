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
 - Displays the Inventory Detail for SNA HUL SL SO Transfer Process Suitelet.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author               	Issue Fix Summary
 * =============================================================================================
 * 2023/12/04          122554          Vishal Pitale            Initial version
 */
define(['N/https', 'N/record', 'N/ui/serverWidget', 'N/search'],
    function(https, record, serverWidget, search) {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (let k in v)
                    return false;
                return true;
            })(stValue)));
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

        // Function to attach client script to the Suitelet.
        function attachCS(form) {
            let clientScriptSearch = search.create({ type: 'file', filters: ['name','is','sna_hul_cs_so_transproc_invdetail.js'] }).run().getRange(0,1);
            log.audit('clientScriptSearch', clientScriptSearch);
            form.clientScriptFileId = clientScriptSearch[0].id;
            return form;
        }

        // Function to populate bins in the inventory details for From Item.
        function populateFromBins(item, location, binObj) {

            let filterData = new Array();
            filterData[0] = ['type','anyof','InvtPart'];
            filterData[1] = 'AND';
            filterData[2] = ['usebins','is','T'];
            filterData[3] = 'AND';
            filterData[4] = ['binonhand.location','anyof',location];
            filterData[5] = 'AND';
            filterData[6] = ['internalid', 'anyof', item];
            filterData[7] = 'AND';
            filterData[8] = ['binonhand.quantityavailable', 'greaterthan', '0'];
            filterData[9] = 'AND';
            filterData[10] = ['inventorylocation', 'anyof', location];
log.audit('filterData', filterData);

            let invitemSearch = search.create({ type: 'inventoryitem',
                filters: filterData,
                columns: [ 'internalid', 'locationquantityavailable', search.createColumn({ name: 'itemid', sort: search.Sort.ASC }),
                    search.createColumn({ name: 'location', join: 'binOnHand' }),
                    search.createColumn({ name: 'binnumber', join: 'binOnHand' }),
                    search.createColumn({ name: 'quantityavailable', join: 'binOnHand' }) ] }).run().getRange(0,999);
log.audit('invitemSearch', invitemSearch);

            // Traversing through the search to update the From Location Bins.
            for(let loop1 = 0; loop1 < invitemSearch.length; loop1++) {
                let binNumber = invitemSearch[loop1].getValue({ name: 'binnumber', join: 'binOnHand' });
                let binNumberText = invitemSearch[loop1].getText({ name: 'binnumber', join: 'binOnHand' });
                let qtyAvailable = invitemSearch[loop1].getValue({ name: 'quantityavailable', join: 'binOnHand' });
                let qtyAvail = invitemSearch[loop1].getValue({ name: 'locationquantityavailable' });
                let locationInv = invitemSearch[loop1].getValue({ name: 'location', join: 'binOnHand' });
                binNumberText = binNumberText + '||' + qtyAvail;

                if(locationInv == location) {
                    binObj.addSelectOption({ value: binNumber, text: binNumberText });
                }
            }
        }

        // Function to populate bins in the inventory details for To Item.
        function populateToBins(item, toLocation, binObj) {
            let binSearchObj = search.create({ type: 'bin', filters: [ ['location','anyof',toLocation], 'AND', ['inactive','is','F'] ],
                columns: [ 'location', search.createColumn({ name: 'binnumber', sort: search.Sort.ASC }) ] });

            let binSearch = getFullResultSet(binSearchObj);
log.audit('binSearch', binSearch);

            // Traversing through the search to update the To Location Bins.
            for(let loop1 = 0; loop1 < binSearch.length; loop1++) {
                let binNumber = binSearch[loop1].id;
                let binNumberText = binSearch[loop1].getValue({ name: 'binnumber' });
                let locationInv = binSearch[loop1].getValue({ name: 'location' });

                if(locationInv == toLocation) { binObj.addSelectOption({ value: binNumber, text: binNumberText }); }
            }
        }

        // Function used to create the Base UI for Inventory Detail.
        function createUI(context, form) {
            let item = context.request.parameters.item || '';
            let qty = context.request.parameters.qty || '';
            let fromLocation = context.request.parameters.fromLocation || '';
            let toLocation = context.request.parameters.toLocation || '';

            let itemField = form.addField({ id: 'custpage_itemfield', type: serverWidget.FieldType.SELECT, label: 'Item', source: 'item' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            let qtyField = form.addField({ id: 'custpage_qtyfield', type: serverWidget.FieldType.TEXT, label: 'Quantity' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

            // Populating the fields if the URL has the parameters.
            if(!isEmpty(item)) { itemField.defaultValue = item; }
            if(!isEmpty(qty)) { qtyField.defaultValue = qty; }

            let invDetSublist = form.addSublist({ id: 'custpage_sublist_invdetdata', type: serverWidget.SublistType.INLINEEDITOR, label: 'Inventory Detail' });
            let fromBinList = invDetSublist.addField({ id: 'custpage_sublist_frombins', type: serverWidget.FieldType.SELECT, label: 'From Bins' });
            let toBinList = invDetSublist.addField({ id: 'custpage_sublist_tobins', type: serverWidget.FieldType.SELECT, label: 'To Bins' });
            let qtyAvail = invDetSublist.addField({ id: 'custpage_sublist_qtyavail', type: serverWidget.FieldType.TEXT, label: 'Quantity Available' });
            invDetSublist.addField({ id: 'custpage_sublist_qty', type: serverWidget.FieldType.INTEGER, label: 'Quantity' });
            fromBinList.addSelectOption({ value: ' ', text: ' ' });
            toBinList.addSelectOption({ value: ' ', text: ' ' });

            populateFromBins(item, fromLocation, fromBinList);
            populateToBins(item, toLocation, toBinList);

            // Adding Buttons.
            let addSubmitButton = form.addButton({ id: 'custpage_btn_okbtn', label: 'OK', functionName: 'eventOK' });
            let addCancelButton = form.addButton({ id: 'custpage_btn_closebtn', label: 'Close', functionName: 'eventClose' });
            return form;
        }

        // Get Method Function.
        function getMethod(context) {
            let form = serverWidget.createForm({ title: 'Inventory Details' });
            let csAttachForm = attachCS(form);
            let uiForm = createUI(context, csAttachForm);
            context.response.writePage(uiForm);
        }

        // onRequest Function.
        function onRequest(context) {
            try {
                // Conditional Execution for GET and POST method.
                if (context.request.method == https.Method.GET) { getMethod(context); }
            }
            catch(e) { log.error('Error', e); }
        }

        return {
            onRequest : onRequest
        }
    });