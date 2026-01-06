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
 * 2024/7/2          191788              caranda         Initial version.
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/error', 'N/file', 'N/log', 'N/record', 'N/runtime', 'N/search', 'N/email'],
    /**
     * @param{error} error
     * @param{file} file
     * @param{log} log
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (error, file, log, record, runtime, search, email) => {
        const searchSummaryObj = {
            'GROUP': search.Summary.GROUP,
            'MIN': search.Summary.MIN,
            'MAX': search.Summary.MAX,
            'AVG': search.Summary.AVG,
            'SUM': search.Summary.SUM,
        }


        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {

            let LOG_TITLE = 'getInputData';
            let scriptObj = runtime.getCurrentScript();
            log.debug('getInputData scriptObj', JSON.stringify(scriptObj))

            let mrParamsObj = scriptObj.getParameter({name: 'custscript_sna_form_filters'});
            log.debug('getInputData mrParamsObj', mrParamsObj)

            let mrSavedSearch = scriptObj.getParameter({name: 'custscript_sna_hul_mr_ss'});
            log.debug('getInputData mrSavedSearch', mrSavedSearch)

            if(!isEmpty(mrParamsObj)) {

                //Perform Search
                mrParamsObj = JSON.parse(mrParamsObj);

                let tranSrchObj = search.load({
                    id: mrSavedSearch
                });

                //let filtersObj = tranSrchObj.filters;
                let filterExpObj = tranSrchObj.filterExpression;

                let itemCatFilter = mrParamsObj['custpage_filter_itemcat'];
                let vendorFilter = mrParamsObj['custpage_filter_vendor'];
                let locFilter = mrParamsObj['custpage_filter_loc'];
                let locFilterText = mrParamsObj['custpage_filter_locname'];
                let locInclChild = mrParamsObj['custpage_filter_loc_child'];
                locInclChild = (locInclChild == 'T' ? true : false);
                let demandPeriodFilter = mrParamsObj['custpage_filter_demper'];
                let demandPeriodFilterEnd = mrParamsObj['custpage_filter_demper_end'];
                let poPeriodFilter = mrParamsObj['custpage_filter_poper'];
                let poPeriodFilterEnd = mrParamsObj['custpage_filter_poper_end']
                let diffMinFilter = mrParamsObj['custpage_filter_diffmin'];
                let diffMaxFilter = mrParamsObj['custpage_filter_diffmax'];

                //for ROP Qty
                let ropQtyOp = mrParamsObj['custpage_filter_ropqtyop'];
                let ropQtyVal = mrParamsObj['custpage_filter_ropqty'];

                log.debug(LOG_TITLE, {
                    itemCatFilter,
                    vendorFilter,
                    locFilter,
                    locFilterText,
                    locInclChild,
                    demandPeriodFilter,
                    demandPeriodFilterEnd,
                    poPeriodFilter,
                    poPeriodFilterEnd,
                    diffMinFilter,
                    diffMaxFilter,
                    ropQtyOp,
                    ropQtyVal
                });

                if (!isEmpty(vendorFilter)){
                    filterExpObj.push('AND');
                    let vendorFilterExp = ['custrecord_sna_hul_item.custrecord_sna_hul_vendor', 'anyof', [vendorFilter]];

                    filterExpObj.push(vendorFilterExp)
                }

                if (!isEmpty(itemCatFilter)) {
                    filterExpObj.push('AND');
                    let itemCatFilterExp = ['custitem_sna_hul_itemcategory', 'anyof', itemCatFilter];

                    filterExpObj.push(itemCatFilterExp)
                    //filtersObj.push(search.createFilter({name: 'custitem_sna_hul_itemcategory', join: 'item', operator: search.Operator.ANYOF, values: [itemCatFilter]}));*/
                }

                if (!isEmpty(locFilter)) {
                    filterExpObj.push('AND');

                    let locFilterExp;
                    if (locInclChild) {
                        //filtersObj.push(search.createFilter({name: 'location', operator: search.Operator.ANYOF, values: locFilter }));
                        locFilterExp = [
                            ['inventorylocation', 'anyof', locFilter],
                            'OR',
                            ['inventorylocation.name', 'startswith', locFilterText]
                        ];
                    } else {
                        locFilterExp = ['inventorylocation', 'anyof', locFilter];
                    }

                    filterExpObj.push(locFilterExp);
                }

                let mainDateFilterArr = [];
                let demandPeriodDateMain = [];
                let poPeriodDateMain = [];

                if (!isEmpty(demandPeriodFilter) || !isEmpty(demandPeriodFilterEnd)) {

                    demandPeriodDateMain.push(['transaction.type', 'anyof', 'SalesOrd']);
                    if (!isEmpty(demandPeriodFilter)) {
                        demandPeriodDateMain.push('AND');
                        demandPeriodDateMain.push(['transaction.trandate', 'onorafter', demandPeriodFilter]);
                    }

                    if (!isEmpty(demandPeriodFilterEnd)) {
                        demandPeriodDateMain.push('AND');
                        demandPeriodDateMain.push(['transaction.trandate', 'onorbefore', demandPeriodFilterEnd]);
                    }

                    mainDateFilterArr.push(demandPeriodDateMain);

                }

                if (!isEmpty(poPeriodFilter) || !isEmpty(poPeriodFilterEnd)) {

                    poPeriodDateMain.push(['transaction.type', 'anyof', 'PurchOrd']);
                    if (!isEmpty(poPeriodFilter)) {
                        poPeriodDateMain.push('AND');
                        poPeriodDateMain.push(['transaction.trandate', 'onorafter', poPeriodFilter]);
                    }

                    if (!isEmpty(poPeriodFilterEnd)) {
                        poPeriodDateMain.push('AND');
                        poPeriodDateMain.push(['transaction.trandate', 'onorbefore', poPeriodFilterEnd]);
                    }

                    if (!isEmpty(mainDateFilterArr)) {
                        mainDateFilterArr.push('OR');
                    }

                    mainDateFilterArr.push(poPeriodDateMain);
                }

                if (!isEmpty(mainDateFilterArr)) {
                    filterExpObj.push('AND');
                    filterExpObj.push(mainDateFilterArr)

                    //Add Summary Filter if Dates have value
                    filterExpObj.push('AND');
                    let summaryDateFilter = [
                        ["max(formulanumeric:CASE WHEN {transaction.locationnohierarchy} = {inventorylocation} THEN  ({transaction.QUANTITY}-{transaction.QUANTITYSHIPRECV}) ELSE NULL END )", 'isnotempty', ''],
                        'OR',
                        ["max(formulanumeric:CASE WHEN {transaction.type} = 'Purchase Order' and {transaction.locationnohierarchy} = {inventorylocation} then ({transaction.QUANTITY}-{transaction.QUANTITYSHIPRECV}) end)", 'isnotempty', '']
                    ];

                    filterExpObj.push(summaryDateFilter);
                }

                log.audit(LOG_TITLE, 'mainDateFilterArr = ' + JSON.stringify(mainDateFilterArr));

                if (!isEmpty(diffMinFilter)) {
                    filterExpObj.push('AND');
                    let diffMinFilterExp = ["max(formulanumeric:MAX(NVL({locationquantityonhand},0)) + max(Case When {transaction.type} = 'Purchase Order' and {transaction.status} = 'Pending Receipt' and   {transaction.locationnohierarchy} = {inventorylocation} Then NVL({transaction.quantity},0) Else 0 End) - max(Case When {transaction.type} =  'Sales Order' and {transaction.status} = 'Pending Fulfillment' and {transaction.locationnohierarchy} = {inventorylocation} Then  NVL({transaction.quantitycommitted},0) Else 0 End) - MAX(NVL({locationreorderpoint},0)))", 'greaterthanorequalto', diffMinFilter];

                    filterExpObj.push(diffMinFilterExp);
                }

                if (!isEmpty(diffMaxFilter)) {
                    filterExpObj.push('AND');
                    let diffMaxFilterExp = ["max(formulanumeric:MAX(NVL({locationquantityonhand},0)) + max(Case When {transaction.type} = 'Purchase Order' and {transaction.status} = 'Pending Receipt' and   {transaction.locationnohierarchy} = {inventorylocation} Then NVL({transaction.quantity},0) Else 0 End) - max(Case When {transaction.type} =  'Sales Order' and {transaction.status} = 'Pending Fulfillment' and {transaction.locationnohierarchy} = {inventorylocation} Then  NVL({transaction.quantitycommitted},0) Else 0 End) - MAX(NVL({locationreorderpoint},0)))", 'lessthanorequalto', diffMaxFilter];

                    filterExpObj.push(diffMaxFilterExp);
                }

                if (!isEmpty(ropQtyVal)) {
                    let ropOperator;

                    switch (ropQtyOp) {
                        case 'equalsto':
                            ropOperator = search.Operator.EQUALTO;
                            break;
                        case 'lessthan':
                            ropOperator = search.Operator.LESSTHAN;
                            break;
                        case 'greaterthan':
                            ropOperator = search.Operator.GREATERTHAN;
                            break;
                    }

                    filterExpObj.push('AND'); //custpage_list_roqty
                    let ropQtyFilterExp = ["formulanumeric_8:nvl(to_number({custitem8}),0)", ropOperator, Number(ropQtyVal)]

                    filterExpObj.push(ropQtyFilterExp);
                }

                //log.debug({title: LOG_TITLE, details: 'FINAL filterExpObj = ' + JSON.stringify(filterExpObj)});

                // Define the filter to remove
                let filterToRemove = ["transaction.trandate", "within", "thismonth"];

                // Remove the exact match filter from top-level filters
                let newFilters = [];
                for (let i = 0; i < filterExpObj.length; i++) {
                    let item = filterExpObj[i];

                    if (Array.isArray(item) && JSON.stringify(item) === JSON.stringify(filterToRemove)) {
                        // Skip the filter and one adjacent logical operator
                        if (i > 0 && typeof filterExpObj[i - 1] === 'string') {
                            // Remove logical operator before the filter
                            newFilters.pop();
                        } else if (i < filterExpObj.length - 1 && typeof filterExpObj[i + 1] === 'string') {
                            // Skip logical operator after the filter
                            i++;
                        }
                        continue; // Skip the target filter
                    }

                    newFilters.push(item);
                }


                tranSrchObj.filterExpression = newFilters;

                //tranSrchObj.filterExpression = filterExpObj;

                log.debug({title: LOG_TITLE, details: 'FINAL filterExpObj = ' + JSON.stringify(newFilters)});

                //Add Formula SUM columns
                let srchCols = tranSrchObj.columns;

                // Create new columns
                let ropCol = search.createColumn({
                    name: 'formulanumeric_1',
                    label: 'custpage_list_rop',
                    formula: 'max({locationreorderpoint})',
                    summary: search.Summary.SUM
                });

                srchCols.push(ropCol);

                let demandCol = search.createColumn({
                    name: 'formulanumeric_2',
                    label: 'custpage_list_demand',
                    formula: "CASE WHEN {transaction.type} = 'Sales Order' and {transaction.locationnohierarchy} = {inventorylocation}  then {transaction.quantity} end",
                    summary: search.Summary.SUM
                });
                srchCols.push(demandCol);

                let invOnHandCol = search.createColumn({
                    name: 'formulanumeric_3',
                    label: 'custpage_list_onhand',
                    formula: 'max({locationquantityonhand})',
                    summary: search.Summary.SUM
                });

                srchCols.push(invOnHandCol);

                let qtyPoCol = search.createColumn({
                     name: 'formulanumeric_4',
                     label: 'custpage_list_poqty',
                     formula: "CASE WHEN {transaction.type} = 'Purchase Order' and {transaction.locationnohierarchy} = {inventorylocation} then ({transaction.QUANTITY}-{transaction.QUANTITYSHIPRECV}) end",
                     summary: search.Summary.SUM
                 });

                 srchCols.push(qtyPoCol);

                let qtySoCol = search.createColumn({
                     name: 'formulanumeric_5',
                     label: 'custpage_list_soqty',
                     formula: "CASE WHEN {transaction.type} = 'Sales Order' and substr({transaction.number},1,1) != 'W' and {transaction.locationnohierarchy} = {inventorylocation}  then {transaction.quantity}-{transaction.quantityshiprecv} end",
                     summary: search.Summary.SUM
                 });

                 srchCols.push(qtySoCol);

                let qtywoCol = search.createColumn({
                     name: 'formulanumeric_6',
                     label: 'custpage_list_woqty',
                     formula: "CASE WHEN {transaction.type} = 'Sales Order' and substr({transaction.number},1,1) = 'W' and {transaction.locationnohierarchy} = {inventorylocation}  then {transaction.quantity}-{transaction.quantityshiprecv} end",
                     summary: search.Summary.SUM
                 });

                 srchCols.push(qtywoCol);

                 let diffCol = search.createColumn({
                     name: 'formulanumeric_7',
                     label: 'custpage_list_diff',
                     formula: "MAX(NVL({locationquantityonhand},0)) + SUM(Case When {transaction.type} = 'Purchase Order' and {transaction.locationnohierarchy} = {inventorylocation} Then NVL({transaction.quantity}-{transaction.QUANTITYSHIPRECV},0) Else 0 End) - sum(Case When {transaction.type} =  'Sales Order' and {transaction.locationnohierarchy} = {inventorylocation} Then NVL({transaction.quantity}-{transaction.quantityshiprecv},0) Else 0 End) - MAX(NVL({locationreorderpoint},0))",
                     summary: search.Summary.SUM
                 });

                 srchCols.push(diffCol);

                let invLocCol = search.createColumn({
                    name: 'formulatext_2',
                    label: 'Inventory Location',
                    formula: "CASE WHEN {transaction.type} in ('Sales Order','Purchase Order') and {transaction.locationnohierarchy} = {inventorylocation} then {inventorylocation} end",
                    summary: search.Summary.GROUP
                });

                srchCols.push(invLocCol);

               /*let fixedBinCol = search.createColumn({
                   name: 'formulatext_3',
                   label: 'Fixed Bin',
                   formula: "case when {preferredbin} = 'T' and {inventorylocation} = {binnumber.location} and {inventorylocation} = {binonhand.location} then {binnumber} end",
                   summary: search.Summary.GROUP
               });

               srchCols.push(fixedBinCol);

                let shipMethodCol = search.createColumn({
                    name: 'formulatext_4',
                    label: 'Shipping Method',
                    formula: "CASE WHEN {transaction.type} in ('Sales Order','Purchase Order') and {transaction.locationnohierarchy} = {inventorylocation}  then {transaction.custcol_sna_hul_ship_meth_vendor} end",
                    summary: search.Summary.GROUP
                });

                srchCols.push(shipMethodCol);*/

                /*let lastQtySold = search.createColumn({
                    name: 'formulanumeric_8',
                    label: 'Last # Quantity Sold',
                    formula: "CASE WHEN {transaction.type} = 'Sales Order' and {transaction.locationnohierarchy} = {inventorylocation}  then {transaction.quantity} end",
                    summary: search.Summary.MAX,
                });

                lastQtySold.setWhenOrderedBy({
                    name: 'trandate',
                    join: 'transaction'
                })

                srchCols.push(lastQtySold);

                let lastSaleTranDate = search.createColumn({
                    name: 'formuladate',
                    label: 'Last Sale Transaction Date',
                    formula: "CASE WHEN {transaction.type} = 'Sales Order' and {transaction.locationnohierarchy} = {inventorylocation}  then {transaction.trandate} end",
                    summary: search.Summary.MAX,
                    sort: search.Sort.DESC
                });

                srchCols.push(lastSaleTranDate);*/

                try{
                    return tranSrchObj;
                }catch (e) {
                    log.error({ title: 'Error in getInputData function', details: error });
                }


            }

        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            try {

                let scriptObj = runtime.getCurrentScript();

                /*let mrSavedSearchSub = scriptObj.getParameter({name: 'custscript_sna_hul_mr_ss_sub'});
                log.debug('map mrSavedSearchSub', mrSavedSearchSub)*/

                //Test Data: {"recordType":null,"id":"6","values":{"GROUP(itemid)":"0973356","GROUP(salesdescription)":"FILTER, OIL F","GROUP(custitem_sna_hul_itemcategory)":{"value":"39","text":"7900 - Promatch"},"GROUP(formulatext)":"34796 Promatch","GROUP(custrecord_sna_itemcat_desc.CUSTITEM_SNA_HUL_ITEMCATEGORY)":"Promatch","SUM(weight)":"","GROUP(custitem7)":"- None -","GROUP(inventorylocation)":{"value":"107","text":"Van 50 - Dustin J Larson (3)"},"GROUP(custrecord_sna_hul_itempurchaseprice.CUSTRECORD_SNA_HUL_ITEM)":"5.9","SUM(formulanumeric)":"0","MAX(formulanumeric)":"-1","COUNT(formulanumeric)":"1","MAX(custrecord_sna_hul_contractprice.CUSTRECORD_SNA_HUL_ITEM)":"5.9","SUM(formulacurrency)":".00","GROUP(formulanumeric)":"54685"}}


                let result = JSON.parse(mapContext.value);
                log.debug('map', JSON.stringify(result));
                let row = [];

                let newMapObj = getMapValues(result.values);
                log.debug('map newMapObj', JSON.stringify(newMapObj));

                let csvCols= ['custpage_list_item','custpage_list_desc','custpage_list_itemcat','custpage_list_weight','custpage_list_pkgqty','custpage_list_vendorno','custpage_list_manufcode','custpage_list_fixedbin','custpage_list_unitcost','custpage_list_rop','custpage_list_roqty','custpage_list_demand','custpage_list_demandhits','custpage_list_invloc','custpage_list_onhand','custpage_list_poqty','custpage_list_soqty','custpage_list_woqty','custpage_list_diff','custpage_list_qty','custpage_list_rate','custpage_list_amt','custpage_list_lastqtysold','custpage_list_lastqtysolddate'];

                csvCols.forEach((col, index) =>{
                    let columnValue = newMapObj[col] || ''; // Default to empty string if null
                    row.push(escapeForCSV(columnValue)); // Wrap in quotes to handle commas
                })

                log.debug('map', 'map to reduce data = '+ JSON.stringify({
                    key: result.id,
                    value: row.join(',')
                }));

                mapContext.write({
                    key: result.id,
                    value: row.join(',')
                });
            } catch (error) {
                log.error({ title: 'Error in map function', details: error });
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            try {

                reduceContext.values.forEach(row => {
                    reduceContext.write({ key: 'csvData', value: row });
                });

            } catch (error) {
                log.error({ title: 'Error in reduce function', details: error });
            }

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            try {

                let scriptObj = runtime.getCurrentScript();
                let folderId = scriptObj.getParameter({name: 'custscript_sna_hul_folder_id'});

                let csvHeader = 'Item No,Description,Item Category,Item Weight,Package Quantity,Vendor No,Manufacturer Code,Fixed Bin,Unit Cost,Reorder Point,Reorder Quantity,Demand,Demand Hits,Inventory Location,Inventory On Hand,Quantity on PO, Quantity on SO, Quantity on WO,Difference,Quantity,Rate,Amount,Last # of Quantity Sold, Last Sale Transaction Date'+'\n';

                let csvFile;
                const fileName = createFilename();
                let fileId = null;

                let csvLines = [];
                summaryContext.output.iterator().each((key, value) => {
                    if (key === 'csvData') {
                        csvLines.push(value); // Already a full CSV line
                    }
                    return true;
                });


                // Create the initial CSV file
                try {
                    csvFile = file.create({
                        name: fileName,
                        fileType: file.Type.CSV,
                        contents: csvHeader,
                        folder: folderId,
                        encoding: file.Encoding.UTF8
                    });

                    fileId = csvFile.save();
                    log.audit('File created', `File ID: ${fileId}`);
                } catch (e) {
                    log.error('File creation failed', e.message);
                    return;
                }

                // Re-load the file and append lines
                try {

                    const chunkSize = 500;
                    for (let i = 0; i < csvLines.length; i += chunkSize) {
                        const chunk = csvLines.slice(i, i + chunkSize).join('\n');
                        let loadedFile = file.load({ id: fileId });
                        loadedFile.appendLine({ value: chunk });
                        loadedFile.save();
                    }

                    log.audit('CSV Append complete', `Updated File ID: ${fileId}`);
                } catch (e) {
                    log.error('CSV Append failed', e.message);
                }

                //send file to the user via email
                /*
                    1. Reload File
                    2. Get file size and file url
                    3. If file size exceeds 10mb, include file url in the email body. If not, send as attachment.
                 */

                // 1. Reload the file using known file ID
                let userId = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_form_currentuser_id' });
                log.debug('userId', userId)
                let loadedFile = file.load({ id: fileId });

                // 2. Get file size (in bytes) and URL
                let fileSizeBytes = loadedFile.size;
                let fileSizeMB = fileSizeBytes / (1024 * 1024);
                let fileUrl = loadedFile.url;

                log.debug('File Info', `Size: ${fileSizeMB.toFixed(2)} MB, URL: ${fileUrl}`);

                // 3. Determine email behavior
                let subject = 'Stock Order Report';
                let body = '';
                let recipient = userId;

                if (fileSizeMB > 10) {
                    // File too large – include URL
                    body = 'The generated file is too large to attach. You can download it from the following link:\n' +
                        '6952227-sb1.app.netsuite.com' + fileUrl;

                    email.send({
                        author: -5,
                        recipients: recipient,
                        subject: subject,
                        body: body,
                        relatedRecords: {
                            entityId: recipient,
                        }
                    });

                } else {
                    // File is small – send as attachment
                    body = 'Please find the report attached.';

                    email.send({
                        author: -5,
                        recipients: recipient,
                        subject: subject,
                        body: body,
                        attachments: [loadedFile],
                        relatedRecords: {
                            entityId: recipient,
                        }
                    });
                }


            } catch (error) {
                log.error({ title: 'Error in summarize function', details: error });
            }
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

        const padNumber = (num) => {
            return num.toString().padStart(2, '0');
        }

        const fixAndParseJSON = (jsonString) => {
            try {
                // Remove surrounding quotes if they exist
                if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                    jsonString = jsonString.slice(1, -1);
                }

                // Split while preserving commas inside quoted values
                const values = jsonString.match(/(?:\"([^\"]*)\")|([^,]+)/g).map(v =>
                    v.replace(/^"|"$/g, '') // Remove quotes around values
                );

                return values; // Returns a properly formatted array
            } catch (error) {
                log.error("Invalid JSON format:", error);
                return null;
            }
        }

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        const getMapValues = (mapDataValues) => {

            let mainMapObj = {};

            let stringifyValues = JSON.stringify(mapDataValues);
            let cleanString = stringifyValues.replace(/[\r\n]/g, '');
            let newObject = JSON.parse(cleanString);

            log.audit('getMapValues - newObject', JSON.stringify(newObject));

            mainMapObj.custpage_list_item = '="' +(newObject['GROUP(itemid)']) + '"';
            mainMapObj.custpage_list_desc = (newObject['GROUP(salesdescription)']);
            mainMapObj.custpage_list_itemcat = (newObject['GROUP(custitem_sna_hul_itemcategory)'].text);
            mainMapObj.custpage_list_weight = (newObject['GROUP(weight)']);
            mainMapObj.custpage_list_pkgqty = (newObject['GROUP(custitem7)']);
            mainMapObj.custpage_list_vendorno = (newObject['GROUP(formulatext)']);
            mainMapObj.custpage_list_manufcode = (newObject['GROUP(manufacturer)']);
            mainMapObj.custpage_list_fixedbin = (newObject['GROUP(binnumber)']);
            //mainMapObj.custpage_list_fixedbin = newObject.GROUPformulatext_3;
            mainMapObj.custpage_list_unitcost = (newObject['MAX(custrecord_sna_hul_itempurchaseprice.CUSTRECORD_SNA_HUL_ITEM)']);
            mainMapObj.custpage_list_rop = (newObject['SUM(formulanumeric_1)']);
            mainMapObj.custpage_list_roqty = (newObject['MAX(formulanumeric_8)']);
            mainMapObj.custpage_list_demand = (newObject['SUM(formulanumeric_2)']);
            mainMapObj.custpage_list_demandhits = (newObject['COUNT(formulanumeric)']);
            mainMapObj.custpage_list_invloc = (newObject['GROUP(formulatext_2)']);
            mainMapObj.custpage_list_onhand = (newObject['SUM(formulanumeric_3)']);
            mainMapObj.custpage_list_poqty = (newObject['SUM(formulanumeric_4)']);
            mainMapObj.custpage_list_soqty = (newObject['SUM(formulanumeric_5)']);
            mainMapObj.custpage_list_woqty = (newObject['SUM(formulanumeric_6)']);
            mainMapObj.custpage_list_diff = (newObject['SUM(formulanumeric_7)']);
            mainMapObj.custpage_list_lastqtysold = (newObject['MAX(formulanumeric)']);
            mainMapObj.custpage_list_lastqtysolddate = (newObject['MAX(formuladate)']);
            //mainMapObj.custpage_list_ship = (newObject['GROUP(formulatext_4)']);

            let qtyVal = getQtyVal(newObject['SUM(formulanumeric_7)'], newObject['MAX(formulanumeric_8)']); //(diff, ropQty)
            qtyVal = (isEmpty(qtyVal) ? 0 : qtyVal);
            mainMapObj.custpage_list_qty = (qtyVal)

            let itemRate = newObject['MAX(custrecord_sna_hul_contractprice.CUSTRECORD_SNA_HUL_ITEM)'];
            mainMapObj.custpage_list_rate = (itemRate);

            let finalAmt = itemRate*qtyVal;
            mainMapObj.custpage_list_amt = ((!isEmpty(finalAmt) ? parseFloat(finalAmt).toFixed(2) : '0.00'));

            return mainMapObj;
        }

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

        const formatNumberForCSV = (value) => {
            if (typeof value === 'number') {
                // Convert very large or small numbers to fixed-point string
                if (value > 1e21 || value < 1e-6) {
                    return value.toFixed(0); // or toFixed(n) depending on precision needed
                }
                return value.toString();
            }
            return value;
        }

        const escapeForCSV = (value) => {
            if (value == null) return '""';

            const str = String(value);

            if (typeof value === 'number' && value.toExponential().includes('e')) {
                return `"${value.toLocaleString('fullwide', { useGrouping: false })}"`;
            }

            if (typeof value === 'string' && /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(value)) {
                return `"${str.replace(/"/g, '""')}"`;
            }

            // Escape any value containing characters that require quoting
            if (/[",\n\r()]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`;
            }

            return `"${str}"`;
        };



        return {getInputData, map, reduce, summarize}

    });