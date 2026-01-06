/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Creates CSV and send to the User by clicking the Generate CSV button from the "SNA HUL SL Stock Order Report" Suitelet Script
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/7/25         191788              caranda         Initial version.
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/email', 'N/error', 'N/file', 'N/log', 'N/record', 'N/render', 'N/runtime', 'N/search'],
    /**
 * @param{email} email
 * @param{error} error
 * @param{file} file
 * @param{log} log
 * @param{record} record
 * @param{render} render
 * @param{runtime} runtime
 * @param{search} search
 */
    (email, error, file, log, record, render, runtime, search) => {

        const searchSummaryObj = {
            'GROUP': search.Summary.GROUP,
            'MIN': search.Summary.MIN,
            'MAX': search.Summary.MAX,
            'AVG': search.Summary.AVG,
            'SUM': search.Summary.SUM,
        }

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {

            const LOG_TITLE = 'execute'

            try{

                let scriptObj = runtime.getCurrentScript();
                log.debug(LOG_TITLE, JSON.stringify(scriptObj))

                let schedParamsObj = scriptObj.getParameter({name: 'custscript_sna_ss_params'});
                log.debug(LOG_TITLE, schedParamsObj)

                if(!isEmpty(schedParamsObj)){
                    //Perform Search
                    schedParamsObj = JSON.parse(schedParamsObj);

                    let tranSrchId = scriptObj.getParameter({name: 'custscript_sna__ss_stockorderrep_so_po'});
                    let itemSrchId = scriptObj.getParameter({name: 'custscript_sna__ss_stockorderrep_item'});
                    if(!isEmpty(tranSrchId)){
                        let tranSrchObj = search.load({
                            id: tranSrchId
                        });

                        //let filtersObj = tranSrchObj.filters;
                        let filterExpObj = tranSrchObj.filterExpression

                        let itemCatFilter = schedParamsObj['custpage_filter_itemcat'];
                        let vendorFilter = schedParamsObj['custpage_filter_vendor'];
                        let locFilter = schedParamsObj['custpage_filter_loc'];
                        let locFilterText = schedParamsObj['custpage_filter_locname'];
                        let demandPeriodFilter = schedParamsObj['custpage_filter_demper'];
                        let poPeriod = schedParamsObj['custpage_filter_poper'];
                        let diffMinFilter = schedParamsObj['custpage_filter_diffmin'];
                        let diffMaxFilter = schedParamsObj['custpage_filter_diffmax'];

                        //for ROP Qty
                        let ropQtyOp = schedParamsObj['custpage_filter_ropqtyop'];
                        let ropQtyVal = schedParamsObj['custpage_filter_ropqty'];

                        log.debug(LOG_TITLE, {itemCatFilter, vendorFilter, locFilter, locFilterText, demandPeriodFilter, poPeriod, diffMinFilter, diffMaxFilter, ropQtyOp, ropQtyVal});

                        if(!isEmpty(itemCatFilter)){
                            filterExpObj.push('AND');
                            let itemCatFilterExp = ['item.custitem_sna_hul_itemcategory', 'anyof', itemCatFilter];

                            filterExpObj.push(itemCatFilterExp)
                            //filtersObj.push(search.createFilter({name: 'custitem_sna_hul_itemcategory', join: 'item', operator: search.Operator.ANYOF, values: [itemCatFilter]}));*/
                        }

                        if(!isEmpty(locFilter)){
                            filterExpObj.push('AND');
                            //filtersObj.push(search.createFilter({name: 'location', operator: search.Operator.ANYOF, values: locFilter }));
                            /*let locFilterExp = [
                                    ['location', 'anyof', locFilter],
                                    'OR',
                                    ['location.name', 'startswith', locFilterText]
                                ];*/

                            let locFilterExp = ['item.inventorylocation', 'anyof', locFilter];

                            filterExpObj.push(locFilterExp);
                        }

                        if(!isEmpty(demandPeriodFilter)){
                            filterExpObj.push('AND');
                            let demandPeriodFilterExp = [
                                ['type', 'anyof', 'salesorder'],
                                'AND',
                                ['trandate', 'on', demandPeriodFilter]
                            ];

                            filterExpObj.push(demandPeriodFilterExp);
                        }

                        if(!isEmpty(poPeriod)){
                            filterExpObj.push('AND');
                            let poPeriodFilterExp = [
                                ['type', 'anyof', 'purchaseorder'],
                                'AND',
                                ['trandate', 'on', poPeriod]
                            ];

                            filterExpObj.push(poPeriodFilterExp);
                        }

                        if(!isEmpty(diffMinFilter)){
                            filterExpObj.push('AND');
                            let diffMinFilterExp = ["max(formulanumeric: MAX(Case When {location.id} = {item.inventorylocation.id} Then NVL({item.locationquantityonhand},0) Else 0 End) + SUM(Case When {type} = 'Purchase Order' and {status} = 'Pending Receipt' and {location.id} = {item.inventorylocation.id} Then NVL({quantity},0) Else 0 End) - SUM(Case When {type} = 'Sales Order' and {status} = 'Pending Fulfillment' and {location.id} = {item.inventorylocation.id} Then NVL({quantitycommitted},0) Else 0 End) - MAX(Case When {location.id} = {item.inventorylocation.id} Then NVL({item.locationreorderpoint},0) Else 0 End))", 'greaterthanorequalto', diffMinFilter];

                            filterExpObj.push(diffMinFilterExp);
                        }

                        if(!isEmpty(diffMaxFilter)){
                            filterExpObj.push('AND');
                            let diffMaxFilterExp = ["max(formulanumeric: MAX(Case When {location.id} = {item.inventorylocation.id} Then NVL({item.locationquantityonhand},0) Else 0 End) + SUM(Case When {type} = 'Purchase Order' and {status} = 'Pending Receipt' and {location.id} = {item.inventorylocation.id} Then NVL({quantity},0) Else 0 End) - SUM(Case When {type} = 'Sales Order' and {status} = 'Pending Fulfillment' and {location.id} = {item.inventorylocation.id} Then NVL({quantitycommitted},0) Else 0 End) - MAX(Case When {location.id} = {item.inventorylocation.id} Then NVL({item.locationreorderpoint},0) Else 0 End))", 'lessthanorequalto', diffMaxFilter];

                            filterExpObj.push(diffMaxFilterExp);
                        }

                        if(!isEmpty(ropQtyVal)){
                            let ropOperator;

                            switch(ropQtyOp){
                                case 'equalsto':
                                    ropOperator = search.Operator.IS;
                                    break;
                                case 'lessthan':
                                    ropOperator = search.Operator.LESSTHAN;
                                    break;
                                case 'greaterthan':
                                    ropOperator = search.Operator.GREATERTHAN;
                                    break;
                            }

                            filterExpObj.push('AND');
                            let ropQtyFilterExp = ["CASE WHEN {item.custitem8} IS NULL THEN 0 ELSE TO_NUMBER({item.custitem8}) END", ropOperator, Number(ropQtyVal)]

                            filterExpObj.push(ropQtyFilterExp);
                        }

                        log.debug(LOG_TITLE, 'filterExpObj = ' + JSON.stringify(filterExpObj));
                        tranSrchObj.filterExpression = filterExpObj;


                        let allResults = [];
                        let startIndex = 0;
                        let RANGECOUNT = 1000;
                        let pagedResultsCount;

                        let cnt = 0;
                        let itemIdArr = [];
                        let itemLineObj = {};

                        let csvContent = 'Item No,Description,Item Category,Product Group Code,Vendor No,Manufacturer Code,Fixed Bin,Unit Cost,Reorder Point,Reorder Quantity,Demand,Demand Hits,Inventory On Hand,Quantity on PO, Quantity on SO, Quantity on WO,Difference,Shipping Method,Quantity,Rate,Amount\n';

                        let csvHeader= ['custpage_list_item','custpage_list_desc','custpage_list_itemcat','custpage_list_prodcode','custpage_list_vendorno','custpage_list_manufcode','custpage_list_fixedbin','custpage_list_unitcost','custpage_list_rop','custpage_list_roqty','custpage_list_demand','custpage_list_demandhits','custpage_list_onhand','custpage_list_poqty','custpage_list_soqty','custpage_list_woqty','custpage_list_diff','custpage_list_ship','custpage_list_qty','custpage_list_rate','custpage_list_amt']


                        let searchColumns = tranSrchObj.columns;

                        // Extract the labels from the columns
                        let columnMetadata = [];

                        // Iterate through the columns to get label, join, and summary
                        searchColumns.forEach(column => {
                            let columnInfo = {
                                name: column.name,
                                label: column.label,
                                join: column.join || '', // Join might be null, handle it
                                summary: column.summary || '' // Summary might be null, handle it
                            };

                            // Add the column info to the metadata array
                            columnMetadata.push(columnInfo);
                        });
                        log.debug(LOG_TITLE, 'columnMetadata = ' + JSON.stringify(columnMetadata));

                        do{
                            let pagedResults = tranSrchObj.run().getRange({
                                start: parseInt(startIndex),
                                end: parseInt(startIndex + RANGECOUNT)
                            });

                            //pagedResults = JSON.stringify(pagedResults);
                            allResults = allResults.concat(pagedResults);


                            pagedResults.forEach(function(result) {
                                let itemId = result.getValue({name: 'item', summary: search.Summary.GROUP});
                                addKeyIfNotExists(itemLineObj, itemId, itemSrchId);
                                let itemInvLoc;
                                let proceed = true;

                                let rowColResults = {};

                                //filter by Vendor if not empty
                                if(!isEmpty(vendorFilter)){
                                    let itemVendorNoId = itemLineObj[itemId].filter_vendorno_id;

                                    log.debug('Vendor Filter', {vendorFilter, itemVendorNoId})
                                    if(itemVendorNoId != vendorFilter){
                                        proceed = false;
                                    }
                                }

                                let diffVal, ropQtyVal, lineRate;

                                if(proceed){
                                    for(let i in columnMetadata){
                                        let colName = columnMetadata[i].name;
                                        let colLabel = columnMetadata[i].label;
                                        let colJoin = columnMetadata[i].join;
                                        let colSummary = columnMetadata[i].summary;
                                        if(colLabel.startsWith('custpage_')){

                                            let colValue = ''

                                            switch (colLabel){
                                                case 'custpage_list_item':
                                                case 'custpage_list_itemcat':
                                                    colValue = result.getText({name: colName, join: colJoin, summary: searchSummaryObj[colSummary]});
                                                    break;
                                                default:
                                                    colValue = result.getValue({name: colName, join: colJoin, summary: searchSummaryObj[colSummary]});
                                            }

                                            if(colName == 'formulanumeric'){
                                                //formulanumeric
                                                colValue = result.getValue(tranSrchObj.columns[i]);
                                            }

                                            colValue = (!isEmpty(colValue) ? colValue : '');

                                            if(colLabel == 'custpage_list_fixedbin'){
                                                colValue = (colValue || colValue == 'true' ? 'Yes' : 'No');
                                            }

                                            rowColResults[colLabel] = colValue;

                                            if(colLabel == 'custpage_list_diff'){
                                                diffVal = colValue;
                                            }

                                            if(colLabel == 'custpage_list_roqty'){
                                                ropQtyVal = colValue
                                            }

                                        }else if(colLabel == 'inventory_location'){
                                            itemInvLoc = result.getValue({name: colName, join: colJoin, summary: searchSummaryObj[colSummary]});
                                        }

                                        if(itemLineObj.hasOwnProperty(itemId)){
                                            let exactItemLineObj = itemLineObj[itemId];
                                            let exactItemLineObjKeys = Object.keys(exactItemLineObj);;

                                            for(let x in exactItemLineObjKeys){
                                                let itemObjColLabel = exactItemLineObjKeys[x];
                                                if(itemObjColLabel.startsWith('custpage_')){

                                                    let itemObjColValue = exactItemLineObj[itemObjColLabel];
                                                    itemObjColValue = (!isEmpty(itemObjColValue) ? itemObjColValue : '');

                                                    rowColResults[itemObjColLabel] = itemObjColValue;

                                                    if(itemObjColLabel == 'custpage_list_rate'){
                                                        lineRate = itemObjColValue;

                                                    }

                                                }else if(itemObjColLabel == 'inventory_location'){
                                                    let exactItemInvLocArr = exactItemLineObj[itemInvLoc];

                                                    if(exactItemInvLocArr.length > 0){
                                                        for(let y in exactItemInvLocArr){
                                                            let exactItemInvLocArrLabel = exactItemInvLocArr[y];
                                                            if(exactItemInvLocArrLabel.startsWith('custpage_')){

                                                                let exactItemInvLocArrValue = exactItemInvLocArr[exactItemInvLocArrLabel];

                                                                exactItemInvLocArrValue = (!isEmpty(exactItemInvLocArrValue) ? exactItemInvLocArrValue : '');

                                                                rowColResults[exactItemInvLocArrLabel] = exactItemInvLocArrValue;

                                                            }
                                                        }
                                                    }
                                                }


                                            }
                                        }

                                    }//End for loop column

                                    let qtyVal = getQtyVal(diffVal, ropQtyVal);

                                    if(!isEmpty(qtyVal)){
                                        rowColResults['custpage_list_qty'] = qtyVal;

                                        let finalAmt = lineRate*qtyVal;
                                        rowColResults['custpage_list_amt'] = (!isEmpty(finalAmt) ? parseFloat(finalAmt).toFixed(2) : '0.00');
                                    }


                                    log.debug(LOG_TITLE, 'rowColResults = ' + JSON.stringify(rowColResults));

                                    if(!isEmpty(rowColResults)){
                                        //let rowColResultsArr = Object.keys(rowColResults);

                                        for(let x in csvHeader){
                                            let csvHeaderText = csvHeader[x];
                                            let csvHeaderVal = rowColResults[csvHeaderText];
                                            csvHeaderVal = (!isEmpty(csvHeaderVal) ? csvHeaderVal : '');

                                            if (x == csvHeader.length - 1) {
                                                // This is the last element
                                                csvContent += '\n'
                                            } else {
                                                // This is not the last element
                                                csvContent += '"'+csvHeaderVal+'"'
                                                csvContent += ','
                                            }
                                        }
                                    }
                                } //end proceed


                                cnt++
                            });

                            log.debug('GET', 'pagedResults = ' + pagedResults);
                            pagedResultsCount = (pagedResults != null ? pagedResults.length : 0);
                            startIndex += pagedResultsCount;
                        }while ( pagedResultsCount == RANGECOUNT);

                        log.debug('GET', 'itemIdArr = ' + JSON.stringify(itemIdArr));

                        let fileObj = file.create({
                            name: createFilename(),
                            fileType: file.Type.CSV,
                            contents: csvContent
                        });

                        fileObj.folder = scriptObj.getParameter({name: 'custscript_sna_ss_folder_id'});

                        let fileObjId = fileObj.save();
                        log.debug(LOG_TITLE, 'File Saved = ' + fileObjId);

                        if(!isEmpty(fileObjId)){
                            //Send Email to Current User

                            let fileLoad = file.load({
                                id: fileObjId
                            })
                            email.send({
                                author: '5',
                                recipients: runtime.getCurrentUser().id,
                                subject: 'Stock Order Report',
                                body: 'email body test',
                                attachments: [fileLoad],
                                relatedRecords: {
                                    entityId: runtime.getCurrentUser().id
                                }
                            });
                        }


                    }
                }

            }catch (e) {
                let stErrorMsg =
                    e.name !== null && e.name !== '' ? `${e.name}: ${e.message}` : `UnexpectedError: ${e.message}`;
                log.error({ title: LOG_TITLE, details: stErrorMsg });
                throw error.create({
                    name: `Error: ${LOG_TITLE}`,
                    message: stErrorMsg
                });
            }
        }

        const pushIfNotExist = (arr, value) => {
            if (!arr.includes(value)) {
                arr.push(value);
            }
        }

        const addKeyIfNotExists = (itemObj, itemId, itemSrchId) => {

            const LOG_TITLE = 'addKeyIfNotExists'
            if (!(itemId in itemObj)) {

                //Search Item
                let itemValues = {};
                let allResults = [];
                let startIndex = 0;
                let RANGECOUNT = 1000;
                let pagedResultsCount;

                let itemSrch = search.load({
                    id: itemSrchId
                });

                let filters = itemSrch.filters;
                filters.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: [itemId]}));

                let searchColumns = itemSrch.columns;

                // Extract the labels from the columns
                let columnMetadata = [];

                // Iterate through the columns to get label, join, and summary
                searchColumns.forEach(column => {
                    let columnInfo = {
                        name: column.name,
                        label: column.label,
                        join: column.join || '', // Join might be null, handle it
                        summary: column.summary || '' // Summary might be null, handle it
                    };

                    // Add the column info to the metadata array
                    columnMetadata.push(columnInfo);
                });
                log.debug(LOG_TITLE, 'columnMetadata = ' + JSON.stringify(columnMetadata));

                let cnt = 0;

                do{
                    let pagedResults = itemSrch.run().getRange({
                        start: parseInt(startIndex),
                        end: parseInt(startIndex + RANGECOUNT)
                    });

                    //pagedResults = JSON.stringify(pagedResults);
                    allResults = allResults.concat(pagedResults);

                    pagedResults.forEach(function(result) {

                        let itemInvObj = {}
                        let itemInvSubArr = []

                        for(let i in columnMetadata){

                            let colName = columnMetadata[i].name;
                            let colLabel = columnMetadata[i].label;
                            let colJoin = columnMetadata[i].join;
                            let colSummary = columnMetadata[i].summary;

                            if(colLabel.startsWith('custpage_')){

                                let colValue = result.getValue({name: colName, join: colJoin, summary: searchSummaryObj[colSummary]});

                                //log.debug(LOG_TITLE, 'colValue = ' + colValue);
                                if(!isEmpty(colValue)){
                                    //Add colum value to object
                                    itemValues[colLabel] = colValue;
                                }

                            }

                            if(colLabel.startsWith('filter_')){
                                let colValue = result.getValue({name: colName, join: colJoin, summary: searchSummaryObj[colSummary]});

                                //log.debug(LOG_TITLE, 'colValue = ' + colValue);
                                if(!isEmpty(colValue)){
                                    //Add colum value to object
                                    itemValues[colLabel] = colValue;
                                }
                            }

                            if(colLabel.startsWith('inventory_')){

                                let colValue = result.getValue({name: colName, join: colJoin, summary: searchSummaryObj[colSummary]});

                                //log.debug(LOG_TITLE, 'colValue = ' + colValue);
                                if(!isEmpty(colValue)){
                                    let textToRemove = 'inventory_'
                                    //Add column value to object
                                    let origColName = colLabel.replace(new RegExp(textToRemove, 'gi'), (match) => {
                                        // Custom logic for replacement (e.g., remove only if followed by ' ')
                                        return match + ' ' === textToRemove + ' ' ? '' : match;
                                    });

                                    if(origColName !== 'location'){
                                        let itemInvSubObj = {}
                                        itemInvSubObj[origColName] = (!isEmpty(colValue) ? colValue : '');
                                        itemInvSubArr.push(itemInvSubObj);

                                        //log.debug(LOG_TITLE, 'itemInvSubArr = ' + JSON.stringify(itemInvSubArr))

                                    }else if(origColName == 'location'){
                                        //log.debug(LOG_TITLE, 'current main object = ' + JSON.stringify(itemObj));
                                        //log.debug(LOG_TITLE, 'set location obj = ' + colValue)
                                        itemValues[colValue]= itemInvSubArr;

                                    }

                                }

                            }
                        }

                        cnt++
                    });

                    log.debug('GET', 'pagedResults = ' + pagedResults);
                    pagedResultsCount = (pagedResults != null ? pagedResults.length : 0);
                    startIndex += pagedResultsCount;
                }while ( pagedResultsCount == RANGECOUNT);

                itemObj[itemId] = itemValues;
            }
        };

        const getQtyVal = (diff, ropQty) => {
            const LOG_TITLE = getQtyVal;

            ropQty = (isEmpty(ropQty) ? 0 : Number(ropQty));
            diff = (isEmpty(diff) ? 0 : Number(diff));
            let finalQty;

            if(ropQty >= diff){
                finalQty = ropQty
            }else if(diff < 0){
                let newDiff = -diff;

                if(ropQty >= newDiff) {
                    finalQty = ropQty
                }else{
                    finalQty = newDiff;
                }

            }else{
                finalQty = diff
            }

            return finalQty
        }

        const padNumber = (num) => {
            return num.toString().padStart(2, '0');
        }

        const createFilename = () => {
            const now = new Date();

            const year = now.getFullYear();
            const month = padNumber(now.getMonth() + 1); // Months are zero-indexed
            const day = padNumber(now.getDate());

            const hours = padNumber(now.getHours());
            const minutes = padNumber(now.getMinutes());
            const seconds = padNumber(now.getSeconds());

            const filename = `file_${year}${month}${day}_${hours}${minutes}${seconds}_stock_order_report.csv`;
            return filename;
        }

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        return {execute}

    });
