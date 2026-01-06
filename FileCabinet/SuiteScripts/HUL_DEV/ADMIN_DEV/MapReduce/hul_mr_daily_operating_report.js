/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log', 'N/runtime', 'N/format', 'N/file'], 
    (search, record, log, runtime, format, file) => {

    /**
     * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
     * @param {Object} inputContext
     * @param {boolean} inputContext.isRestart - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {Object} inputContext.ObjectRef - Object that references the input data
     * @typedef {Object} ObjectRef
     * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
     * @property {string} ObjectRef.type - Type of the record instance that contains the input data
     * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
     * @since 2015.2
     */
    function getInputData(inputContext) {
        try {
            log.audit('Starting Daily Operating Report Map/Reduce', {
                date: new Date().toISOString()
            });

            // Get script parameters with your actual parameter IDs
            const script = runtime.getCurrentScript();
            let targetDate = script.getParameter({ name: 'custscriptcustscript_report_date' });
            const processOpenOrders = script.getParameter({ name: 'custscriptcustscript_dor_open_orders' }) === true || 
                                     script.getParameter({ name: 'custscriptcustscript_dor_open_orders' }) === 'T';

            log.audit('Script Parameters', {
                targetDate: targetDate,
                processOpenOrders: processOpenOrders
            });

            // Create base filters for sales orders
            let filters = [
                ['type', 'anyof', 'SalesOrd'],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['taxline', 'is', 'F'],
                'AND',
                ['numbertext', 'doesnotstartwith', 'R'] // Filter out rental orders
            ];

            // Add date or status filters based on mode
            if (processOpenOrders) {
                // Process open sales orders
                filters.push('AND');
                filters.push(['status', 'anyof', ['SalesOrd:A', 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F']]);
                
                log.audit('Processing Mode', {
                    mode: 'Open Orders',
                    statusFilters: 'A, B, D, E, F (Pending Approval through Pending Billing)'
                });
            } else {
                // Process by date (existing logic)
                if (!targetDate) {
                    targetDate = new Date();
                } else {
                    targetDate = new Date(targetDate);
                }
                
                targetDate.setHours(0, 0, 0, 0);
                const nextDay = new Date(targetDate);
                nextDay.setDate(nextDay.getDate() + 1);
                
                // Format dates for search
                const targetDateStr = format.format({
                    value: targetDate,
                    type: format.Type.DATE
                });
                
                const nextDayStr = format.format({
                    value: nextDay,
                    type: format.Type.DATE
                });
                
                filters.push('AND');
                filters.push(['lastmodifieddate', 'within', targetDateStr, nextDayStr]);
                
                log.audit('Processing Mode', {
                    mode: 'Date Based',
                    from: targetDateStr,
                    to: nextDayStr,
                    targetDate: targetDate.toISOString(),
                    nextDay: nextDay.toISOString()
                });
            }

            // Create the search for sales order lines
            const salesOrderSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: filters,
                columns: [
                    search.createColumn({ name: 'internalid' }),
                    search.createColumn({ name: 'tranid' }),
                    search.createColumn({ name: 'entity' }),
                    search.createColumn({ name: 'trandate' }),
                    search.createColumn({ name: 'line' }),
                    search.createColumn({ name: 'item' }),
                    search.createColumn({ name: 'quantity' }),
                    search.createColumn({ name: 'rate' }),
                    search.createColumn({ name: 'amount' }),
                    search.createColumn({ name: 'memo' }), // Line description/memo
                    search.createColumn({ name: 'custcol_sna_linked_time' }),
                    search.createColumn({ name: 'custcol_sna_so_service_code_type' }),
                    search.createColumn({ name: 'lastmodifieddate' }),
                    search.createColumn({ name: 'custcol_sna_hul_temp_porate' }),
                    search.createColumn({ name: 'custcol_sna_hul_temp_item_code' }), // Serial number for temp items
                    // New fields
                    search.createColumn({ name: 'cseg_sna_revenue_st' }),
                    search.createColumn({ name: 'location' }),
                    search.createColumn({ name: 'department' }),
                    search.createColumn({ name: 'cseg_sna_hul_eq_seg' }),
                    search.createColumn({ name: 'cseg_hul_mfg' }),
                    search.createColumn({ name: 'custcol_sna_hul_fleet_no' }),
                    search.createColumn({ name: 'custcol_sna_linked_po' }), // Add linked PO column
                    // Add fulfilling transaction COGS amount
                    search.createColumn({ 
                        name: 'cogsamount',
                        join: 'fulfillingtransaction'
                    })
                ]
            });
            
            // Log the search count
            const searchCount = salesOrderSearch.runPaged().count;
            log.audit('Search Results Count', {
                count: searchCount,
                mode: processOpenOrders ? 'Open Orders' : 'Date Based'
            });
            
            return salesOrderSearch;
            
        } catch (error) {
            log.error('Error in getInputData', error);
            throw error;
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
     * @param {boolean} mapContext.isRestart - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {string} mapContext.key - Key to be processed during the map stage
     * @param {string} mapContext.value - Value to be processed during the map stage
     * @since 2015.2
     */
    function map(mapContext) {
        try {
            const searchResult = JSON.parse(mapContext.value);
            
            // Log first few records for debugging
            if (mapContext.key < 5) {
                log.debug('Map processing record', {
                    key: mapContext.key,
                    values: searchResult.values,
                    rawValue: mapContext.value
                });
            }
            
            // Extract values from search result - Map/Reduce format is different
            const getValue = (field) => {
                // Handle joined fields (e.g., 'fulfillingtransaction.cogsamount')
                if (field.includes('.')) {
                    const value = searchResult.values[field];
                    if (value && typeof value === 'object') {
                        return value.value || '';
                    }
                    return value || '';
                }
                
                const value = searchResult.values[field];
                if (value && typeof value === 'object') {
                    return value.value || '';
                }
                return value || '';
            };
            
            const getText = (field) => {
                // Handle joined fields
                if (field.includes('.')) {
                    const value = searchResult.values[field];
                    if (value && typeof value === 'object') {
                        return value.text || value.value || '';
                    }
                    return value || '';
                }
                
                const value = searchResult.values[field];
                if (value && typeof value === 'object') {
                    return value.text || value.value || '';
                }
                return value || '';
            };
            
            const lineData = {
                transactionId: getValue('tranid'),
                transactionInternalId: searchResult.id,
                customer: getText('entity'),
                customerId: getValue('entity'),
                tranDate: getValue('trandate'),
                line: getValue('line'),
                item: getText('item'),
                itemId: getValue('item'),
                description: getValue('memo') || '', // Line memo/description
                quantity: parseFloat(getValue('quantity') || '0') || 0,
                rate: parseFloat(getValue('rate') || '0') || 0,
                revenue: parseFloat(getValue('amount') || '0') || 0,
                linkedTimeEntry: getValue('custcol_sna_linked_time'),
                serviceCodeType: getValue('custcol_sna_so_service_code_type'),
                lastModified: getValue('lastmodifieddate'),
                poRate: parseFloat(getValue('custcol_sna_hul_temp_porate') || '0') || 0,
                tempItemCode: getValue('custcol_sna_hul_temp_item_code'), // Serial number for temp items
                // New fields
                revenueStream: getText('cseg_sna_revenue_st'),
                revenueStreamId: getValue('cseg_sna_revenue_st'),
                location: getText('location'),
                locationId: getValue('location'),
                department: getText('department'),
                departmentId: getValue('department'),
                equipmentSegment: getText('cseg_sna_hul_eq_seg'),
                equipmentSegmentId: getValue('cseg_sna_hul_eq_seg'),
                manufacturer: getText('cseg_hul_mfg'),
                manufacturerId: getValue('cseg_hul_mfg'),
                fleetNo: getValue('custcol_sna_hul_fleet_no'),
                linkedPO: getValue('custcol_sna_linked_po'), // Add linked PO field
                itemCategory: '', // Will be populated after item lookup
                inventoryPostingGroup: '', // Will be populated after item lookup
                vendorItemPurchasePrice: 0, // Will be populated after vendor price lookup
                vendorContractPrice: 0, // Will be populated after vendor price lookup
                // COGS fields
                cogs: 0,
                grossMargin: 0,
                marginPercent: 0,
                cogsSource: 'none',
                fulfillingCOGS: 0
            };
            
            // Try different ways to access the fulfilling transaction COGS
            // Check if it's under a different key format
            const possibleKeys = [
                'fulfillingtransaction.cogsamount',
                'cogsamount.fulfillingtransaction',
                'cogsamount'
            ];
            
            for (let key of possibleKeys) {
                const value = searchResult.values[key];
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object' && value.value !== undefined) {
                        lineData.fulfillingCOGS = Math.abs(parseFloat(value.value || '0') || 0);
                    } else if (typeof value === 'object' && value.text !== undefined) {
                        lineData.fulfillingCOGS = Math.abs(parseFloat(value.text || '0') || 0);
                    } else if (typeof value === 'string' || typeof value === 'number') {
                        lineData.fulfillingCOGS = Math.abs(parseFloat(value || '0') || 0);
                    }
                    
                    if (lineData.fulfillingCOGS > 0) {
                        log.debug('Found fulfilling COGS', {
                            key: key,
                            value: value,
                            parsedCOGS: lineData.fulfillingCOGS,
                            itemId: lineData.itemId
                        });
                        break;
                    }
                }
            }
            
            // Also log if we couldn't find COGS for debugging
            if (lineData.fulfillingCOGS === 0 && mapContext.key < 10) {
                log.debug('No fulfilling COGS found', {
                    itemId: lineData.itemId,
                    allKeys: Object.keys(searchResult.values),
                    checkedKeys: possibleKeys
                });
            }
            
            // Debug logging for segment fields
            if (mapContext.key < 5) {
                log.debug('Segment fields check', {
                    equipmentSegmentRaw: searchResult.values.cseg_sna_hul_eq_seg,
                    manufacturerRaw: searchResult.values.cseg_hul_mfg,
                    revenueStreamRaw: searchResult.values.cseg_sna_revenue_st
                });
            }
            
            // Get item category and vendor prices from related records
            if (lineData.itemId) {
                try {
                    // Get item category and inventory posting group
                    const itemLookup = search.lookupFields({
                        type: search.Type.ITEM,
                        id: lineData.itemId,
                        columns: ['custitem_sna_hul_itemcategory', 'custitem_sna_inv_posting_grp']
                    });
                    
                    // Handle item category
                    if (itemLookup.custitem_sna_hul_itemcategory) {
                        // Handle if it returns an object with text/value
                        if (typeof itemLookup.custitem_sna_hul_itemcategory === 'object') {
                            if (Array.isArray(itemLookup.custitem_sna_hul_itemcategory) && itemLookup.custitem_sna_hul_itemcategory[0]) {
                                lineData.itemCategory = itemLookup.custitem_sna_hul_itemcategory[0].text || itemLookup.custitem_sna_hul_itemcategory[0].value || '';
                            } else if (itemLookup.custitem_sna_hul_itemcategory.text) {
                                lineData.itemCategory = itemLookup.custitem_sna_hul_itemcategory.text;
                            } else if (itemLookup.custitem_sna_hul_itemcategory.value) {
                                lineData.itemCategory = itemLookup.custitem_sna_hul_itemcategory.value;
                            } else {
                                lineData.itemCategory = String(itemLookup.custitem_sna_hul_itemcategory);
                            }
                        } else {
                            lineData.itemCategory = String(itemLookup.custitem_sna_hul_itemcategory || '');
                        }
                    }
                    
                    // Handle inventory posting group
                    if (itemLookup.custitem_sna_inv_posting_grp) {
                        // Handle if it returns an object with text/value
                        if (typeof itemLookup.custitem_sna_inv_posting_grp === 'object') {
                            if (Array.isArray(itemLookup.custitem_sna_inv_posting_grp) && itemLookup.custitem_sna_inv_posting_grp[0]) {
                                lineData.inventoryPostingGroup = itemLookup.custitem_sna_inv_posting_grp[0].text || itemLookup.custitem_sna_inv_posting_grp[0].value || '';
                            } else if (itemLookup.custitem_sna_inv_posting_grp.text) {
                                lineData.inventoryPostingGroup = itemLookup.custitem_sna_inv_posting_grp.text;
                            } else if (itemLookup.custitem_sna_inv_posting_grp.value) {
                                lineData.inventoryPostingGroup = itemLookup.custitem_sna_inv_posting_grp.value;
                            } else {
                                lineData.inventoryPostingGroup = String(itemLookup.custitem_sna_inv_posting_grp);
                            }
                        } else {
                            lineData.inventoryPostingGroup = String(itemLookup.custitem_sna_inv_posting_grp || '');
                        }
                    }
                    
                    // Ensure they're always strings
                    lineData.itemCategory = String(lineData.itemCategory || '');
                    lineData.inventoryPostingGroup = String(lineData.inventoryPostingGroup || '');
                    
                    // Get vendor prices
                    const vendorPrices = getVendorPrices(lineData.itemId);
                    lineData.vendorItemPurchasePrice = vendorPrices.purchasePrice;
                    lineData.vendorContractPrice = vendorPrices.contractPrice;
                    
                } catch (itemError) {
                    log.error('Error looking up item details', {
                        itemId: lineData.itemId,
                        error: itemError.toString()
                    });
                    lineData.itemCategory = '';
                    lineData.inventoryPostingGroup = '';
                }
            }
            
            // Debug log for service items
            if (lineData.serviceCodeType == '2') {
                log.debug('Service item found', {
                    itemId: lineData.itemId,
                    serviceCodeType: lineData.serviceCodeType,
                    linkedTimeEntry: lineData.linkedTimeEntry
                });
            }
            
            // Calculate COGS based on type
            if (lineData.serviceCodeType == '2' && lineData.linkedTimeEntry) {
                // Service item with linked time entry
                const timeEntryCost = getTimeEntryCost(lineData.linkedTimeEntry);
                lineData.cogs = timeEntryCost;
                lineData.cogsSource = timeEntryCost > 0 ? 'timeEntry' : 'noTimeEntryCost';
            } else if (lineData.serviceCodeType != '2') {
                // Special handling for Temporary Item - 9800 (ID: 98642)
                if (lineData.itemId == '98642') {
                    if (lineData.linkedPO && lineData.tempItemCode) {
                        // Get cost from linked PO using temp item code
                        const poCost = getLinkedPOCost(lineData.linkedPO, lineData.tempItemCode, lineData.quantity);
                        lineData.cogs = poCost;
                        lineData.cogsSource = poCost > 0 ? 'linkedPO' : 'noLinkedPO';
                    } else {
                        // No linked PO or temp item code
                        lineData.cogs = 0;
                        lineData.cogsSource = 'noLinkedPO';
                    }
                } else {
                    // For other non-service items, use the fulfilling transaction COGS amount
                    if (lineData.fulfillingCOGS > 0) {
                        lineData.cogs = lineData.fulfillingCOGS;
                        lineData.cogsSource = 'fulfillment';
                    } else {
                        // No fulfillment COGS found
                        lineData.cogs = 0;
                        lineData.cogsSource = 'notFulfilled';
                    }
                }
            }
            
            // Calculate gross margin
            lineData.grossMargin = lineData.revenue - lineData.cogs;
            lineData.marginPercent = lineData.revenue > 0 
                ? ((lineData.grossMargin / lineData.revenue) * 100).toFixed(2)
                : '0';
            
            // Write to context - group by COGS source for efficient reducing
            mapContext.write({
                key: lineData.cogsSource,
                value: lineData
            });
            
        } catch (error) {
            log.error('Error in map', {
                error: error.toString(),
                key: mapContext.key,
                value: mapContext.value
            });
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
     * @param {boolean} reduceContext.isRestart - Indicates whether the current invocation of this function is the first
     *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
     * @param {string} reduceContext.key - Key to be processed during the reduce stage
     * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
     *     for processing
     * @since 2015.2
     */
    function reduce(reduceContext) {
        try {
            const cogsSource = reduceContext.key;
            const lines = reduceContext.values.map(value => JSON.parse(value));
            
            // Calculate totals for this COGS source
            const sourceData = {
                source: cogsSource,
                count: lines.length,
                totalRevenue: 0,
                totalCogs: 0,
                totalMargin: 0,
                marginPercent: '0',
                lines: []
            };
            
            lines.forEach(line => {
                sourceData.totalRevenue += line.revenue;
                sourceData.totalCogs += line.cogs;
                sourceData.lines.push(line);
            });
            
            sourceData.totalMargin = sourceData.totalRevenue - sourceData.totalCogs;
            sourceData.marginPercent = sourceData.totalRevenue > 0 
                ? ((sourceData.totalMargin / sourceData.totalRevenue) * 100).toFixed(2)
                : '0';
            
            // Write summary data
            reduceContext.write({
                key: 'summary_' + cogsSource,
                value: sourceData
            });
            
            // Also write individual lines for detailed reporting
            lines.forEach((line, index) => {
                reduceContext.write({
                    key: 'line_' + cogsSource + '_' + index,
                    value: line
                });
            });
            
        } catch (error) {
            log.error('Error in reduce', {
                error: error.toString(),
                key: reduceContext.key
            });
        }
    }

    /**
     * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
     * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
     * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
     * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
     *     script
     * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
     * @param {boolean} summaryContext.isRestart - Indicates whether the current invocation of this function is the first
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
    function summarize(summaryContext) {
        try {
            // Log any errors
            handleErrors(summaryContext);
            
            // Get script parameters for file naming
            const script = runtime.getCurrentScript();
            const processOpenOrders = script.getParameter({ name: 'custscriptcustscript_dor_open_orders' }) === true || 
                                     script.getParameter({ name: 'custscriptcustscript_dor_open_orders' }) === 'T';
            
            // Initialize summary
            const summary = {
                totalRevenue: 0,
                totalCOGS: 0,
                totalGrossMargin: 0,
                overallMarginPercent: '0',
                lineCount: 0,
                byCogsSource: {},
                processingTime: summaryContext.seconds,
                governanceUsed: summaryContext.usage,
                mode: processOpenOrders ? 'Open Orders' : 'Date Based'
            };
            
            const allLines = [];
            
            // Check if there's any output
            if (summaryContext.output && summaryContext.output.iterator) {
                // Process output
                summaryContext.output.iterator().each((key, value) => {
                    const parsedValue = JSON.parse(value);
                    
                    if (key.startsWith('summary_')) {
                        const source = key.replace('summary_', '');
                        summary.byCogsSource[source] = {
                            count: parsedValue.count,
                            totalRevenue: parsedValue.totalRevenue,
                            totalCogs: parsedValue.totalCogs,
                            totalMargin: parsedValue.totalMargin,
                            marginPercent: parsedValue.marginPercent
                        };
                        
                        summary.totalRevenue += parsedValue.totalRevenue;
                        summary.totalCOGS += parsedValue.totalCogs;
                        summary.lineCount += parsedValue.count;
                    } else if (key.startsWith('line_')) {
                        allLines.push(parsedValue);
                    }
                    
                    return true;
                });
            } else {
                log.audit('No output data', 'Map/Reduce produced no results');
            }
            
            summary.totalGrossMargin = summary.totalRevenue - summary.totalCOGS;
            summary.overallMarginPercent = summary.totalRevenue > 0 
                ? ((summary.totalGrossMargin / summary.totalRevenue) * 100).toFixed(2)
                : '0';
            
            // Log input stage info
            log.audit('Input Summary', {
                inputCount: summaryContext.inputSummary.inputCount || 0,
                errorCount: summaryContext.inputSummary.errorCount || 0
            });
            
            // Save results even if empty
            saveResults(summary, allLines, processOpenOrders);
            
            log.audit('Daily Operating Report Complete', {
                mode: summary.mode,
                lineCount: summary.lineCount,
                totalRevenue: summary.totalRevenue,
                totalCOGS: summary.totalCOGS,
                totalMargin: summary.totalGrossMargin,
                marginPercent: summary.overallMarginPercent,
                processingTime: summary.processingTime,
                governanceUsed: summary.governanceUsed
            });
            
        } catch (error) {
            log.error('Error in summarize', error);
        }
    }
    
    /**
     * Handle and log any errors from the map/reduce stages
     */
    function handleErrors(summaryContext) {
        ['inputSummary', 'mapSummary', 'reduceSummary'].forEach(stage => {
            if (summaryContext[stage] && summaryContext[stage].errors && summaryContext[stage].errors.iterator) {
                summaryContext[stage].errors.iterator().each((key, error) => {
                    log.error(stage + ' Error for key: ' + key, error);
                    return true;
                });
            }
        });
    }
    
    /**
     * Save results to custom record or file - split large files to avoid size limits
     */
    function saveResults(summary, lines, processOpenOrders) {
        try {
            const script = runtime.getCurrentScript();
            const dateStr = new Date().toISOString().split('T')[0];
            const filePrefix = processOpenOrders ? 'open_orders_report_' : 'daily_operating_report_';
            const folderId = script.getParameter({ name: 'custscript_dor_folder_id' }) || 5661069;
            
            // Check content size and split if necessary
            const maxFileSize = 9 * 1024 * 1024; // 9MB to stay under NetSuite's 10MB limit
            const linesPerChunk = 5000; // Process in chunks of 1000 lines updated to 5000 by Tom Jr
            
            log.audit('Saving results', {
                totalLines: lines.length,
                estimatedSize: JSON.stringify(lines).length + ' bytes',
                maxAllowedSize: maxFileSize + ' bytes'
            });
            
            // Always save summary as separate JSON file
            const summaryContent = JSON.stringify({
                summary: summary,
                generatedAt: new Date().toISOString(),
                totalLines: lines.length,
                fileCount: Math.ceil(lines.length / linesPerChunk)
            });
            
            const summaryFile = file.create({
                name: filePrefix + dateStr + '_summary.json',
                fileType: file.Type.JSON,
                contents: summaryContent,
                folder: folderId
            });
            
            const summaryFileId = summaryFile.save();
            log.audit('Summary JSON file saved', { fileId: summaryFileId });
            
            // Split lines into chunks and save separately
            const chunks = [];
            for (let i = 0; i < lines.length; i += linesPerChunk) {
                chunks.push(lines.slice(i, i + linesPerChunk));
            }
            
            log.audit('Splitting into chunks', {
                totalChunks: chunks.length,
                linesPerChunk: linesPerChunk
            });
            
            // Save each chunk as separate files
            chunks.forEach((chunk, index) => {
                const chunkNumber = index + 1;
                const totalChunks = chunks.length;
                
                try {
                    // Save JSON chunk
                    const jsonChunkContent = JSON.stringify({
                        chunkInfo: {
                            chunkNumber: chunkNumber,
                            totalChunks: totalChunks,
                            linesInChunk: chunk.length
                        },
                        lines: chunk,
                        generatedAt: new Date().toISOString()
                    });
                    
                    const jsonChunkFile = file.create({
                        name: filePrefix + dateStr + '_part' + chunkNumber + 'of' + totalChunks + '.json',
                        fileType: file.Type.JSON,
                        contents: jsonChunkContent,
                        folder: folderId
                    });
                    
                    const jsonChunkFileId = jsonChunkFile.save();
                    log.audit('JSON chunk saved', { 
                        fileId: jsonChunkFileId, 
                        chunk: chunkNumber,
                        lines: chunk.length 
                    });
                    
                    // Save CSV chunk
                    const csvChunkContent = createCSVContentForChunk(chunk, summary, chunkNumber, totalChunks);
                    
                    const csvChunkFile = file.create({
                        name: filePrefix + dateStr + '_part' + chunkNumber + 'of' + totalChunks + '.csv',
                        fileType: file.Type.CSV,
                        contents: csvChunkContent,
                        folder: folderId
                    });
                    
                    const csvChunkFileId = csvChunkFile.save();
                    log.audit('CSV chunk saved', { 
                        fileId: csvChunkFileId, 
                        chunk: chunkNumber,
                        lines: chunk.length 
                    });
                    
                } catch (chunkError) {
                    log.error('Error saving chunk', {
                        chunkNumber: chunkNumber,
                        error: chunkError.toString()
                    });
                }
            });
            
            // If we only have one chunk, also create a complete CSV file
            if (chunks.length === 1) {
                try {
                    const completeCsvContent = createCSVContent(lines, summary);
                    
                    const completeCsvFile = file.create({
                        name: filePrefix + dateStr + '.csv',
                        fileType: file.Type.CSV,
                        contents: completeCsvContent,
                        folder: folderId
                    });
                    
                    const completeCsvFileId = completeCsvFile.save();
                    log.audit('Complete CSV file saved', { fileId: completeCsvFileId });
                } catch (completeError) {
                    log.error('Error saving complete CSV', completeError);
                }
            }
            
        } catch (error) {
            log.error('Error saving results', error);
        }
    }
    
    /**
     * Create CSV content for a chunk of lines
     */
    function createCSVContentForChunk(lines, summary, chunkNumber, totalChunks) {
        try {
            // CSV Headers
            const headers = [
                'Transaction ID',
                'Transaction Internal ID',
                'Customer',
                'Customer ID',
                'Transaction Date',
                'Line',
                'Item',
                'Item ID',
                'Description',
                'Item Category',
                'Inventory Posting Group',
                'Temp Item Code',
                'Quantity',
                'Rate',
                'Revenue',
                'Vendor Purchase Price',
                'Vendor Contract Price',
                'COGS',
                'Gross Margin',
                'Margin %',
                'COGS Source',
                'Service Code Type',
                'Linked Time Entry',
                'PO Rate',
                'Revenue Stream',
                'Location',
                'Department',
                'Equipment Segment',
                'Manufacturer',
                'Fleet No',
                'Last Modified'
            ];
            
            // Start with chunk info
            let csv = 'FILE INFO\n';
            csv += 'Chunk,' + chunkNumber + ' of ' + totalChunks + '\n';
            csv += 'Lines in this chunk,' + lines.length + '\n';
            csv += 'Generated at,' + new Date().toISOString() + '\n';
            csv += '\n';
            
            // Add headers
            csv += headers.join(',') + '\n';
            
            // Add data rows
            lines.forEach(line => {
                const row = [
                    line.transactionId || '',
                    line.transactionInternalId || '',
                    '"' + (line.customer || '').replace(/"/g, '""') + '"',
                    line.customerId || '',
                    line.tranDate || '',
                    line.line || '',
                    '"' + (line.item || '').replace(/"/g, '""') + '"',
                    line.itemId || '',
                    '"' + (line.description || '').replace(/"/g, '""') + '"',
                    '"' + (line.itemCategory || '').replace(/"/g, '""') + '"',
                    '"' + (line.inventoryPostingGroup || '').replace(/"/g, '""') + '"',
                    line.tempItemCode || '',
                    line.quantity || 0,
                    line.rate || 0,
                    line.revenue || 0,
                    line.vendorItemPurchasePrice || 0,
                    line.vendorContractPrice || 0,
                    line.cogs || 0,
                    line.grossMargin || 0,
                    line.marginPercent || 0,
                    line.cogsSource || '',
                    line.serviceCodeType || '',
                    line.linkedTimeEntry || '',
                    line.poRate || 0,
                    '"' + (line.revenueStream || '').replace(/"/g, '""') + '"',
                    '"' + (line.location || '').replace(/"/g, '""') + '"',
                    '"' + (line.department || '').replace(/"/g, '""') + '"',
                    '"' + (line.equipmentSegment || '').replace(/"/g, '""') + '"',
                    '"' + (line.manufacturer || '').replace(/"/g, '""') + '"',
                    line.fleetNo || '',
                    line.lastModified || ''
                ];
                
                csv += row.join(',') + '\n';
            });
            
            // Add note about summary being in separate file if this is a chunk
            if (totalChunks > 1) {
                csv += '\n\n';
                csv += 'NOTE: Summary data is saved in the separate summary file\n';
                csv += 'This is part ' + chunkNumber + ' of ' + totalChunks + ' data files\n';
            }
            
            return csv;
            
        } catch (error) {
            log.error('Error creating CSV chunk content', error);
            return 'Error creating CSV chunk: ' + error.message;
        }
    }

    /**
     * Create CSV content from lines data
     */
    function createCSVContent(lines, summary) {
        try {
            // CSV Headers
            const headers = [
                'Transaction ID',
                'Transaction Internal ID',
                'Customer',
                'Customer ID',
                'Transaction Date',
                'Line',
                'Item',
                'Item ID',
                'Description',
                'Item Category',
                'Inventory Posting Group',
                'Temp Item Code',
                'Quantity',
                'Rate',
                'Revenue',
                'Vendor Purchase Price',
                'Vendor Contract Price',
                'COGS',
                'Gross Margin',
                'Margin %',
                'COGS Source',
                'Service Code Type',
                'Linked Time Entry',
                'PO Rate',
                'Revenue Stream',
                'Location',
                'Department',
                'Equipment Segment',
                'Manufacturer',
                'Fleet No',
                'Last Modified'
            ];
            
            // Start with headers
            let csv = headers.join(',') + '\n';
            
            // Add data rows
            lines.forEach(line => {
                const row = [
                    line.transactionId || '',
                    line.transactionInternalId || '',
                    '"' + (line.customer || '').replace(/"/g, '""') + '"', // Escape quotes in customer name
                    line.customerId || '',
                    line.tranDate || '',
                    line.line || '',
                    '"' + (line.item || '').replace(/"/g, '""') + '"', // Escape quotes in item name
                    line.itemId || '',
                    '"' + (line.description || '').replace(/"/g, '""') + '"', // Description
                    '"' + (line.itemCategory || '').replace(/"/g, '""') + '"', // Item category
                    '"' + (line.inventoryPostingGroup || '').replace(/"/g, '""') + '"', // Inventory posting group
                    line.tempItemCode || '', // Serial number for temp items
                    line.quantity || 0,
                    line.rate || 0,
                    line.revenue || 0,
                    line.vendorItemPurchasePrice || 0,
                    line.vendorContractPrice || 0,
                    line.cogs || 0,
                    line.grossMargin || 0,
                    line.marginPercent || 0,
                    line.cogsSource || '',
                    line.serviceCodeType || '',
                    line.linkedTimeEntry || '',
                    line.poRate || 0,
                    '"' + (line.revenueStream || '').replace(/"/g, '""') + '"',
                    '"' + (line.location || '').replace(/"/g, '""') + '"',
                    '"' + (line.department || '').replace(/"/g, '""') + '"',
                    '"' + (line.equipmentSegment || '').replace(/"/g, '""') + '"',
                    '"' + (line.manufacturer || '').replace(/"/g, '""') + '"',
                    line.fleetNo || '',
                    line.lastModified || ''
                ];
                
                csv += row.join(',') + '\n';
            });
            
            // Add summary section at the bottom
            csv += '\n\n';
            csv += 'SUMMARY\n';
            csv += 'Metric,Value\n';
            csv += 'Processing Mode,' + summary.mode + '\n';
            csv += 'Total Lines,' + summary.lineCount + '\n';
            csv += 'Total Revenue,' + summary.totalRevenue + '\n';
            csv += 'Total COGS,' + summary.totalCOGS + '\n';
            csv += 'Total Gross Margin,' + summary.totalGrossMargin + '\n';
            csv += 'Overall Margin %,' + summary.overallMarginPercent + '\n';
            csv += 'Processing Time (seconds),' + summary.processingTime + '\n';
            csv += 'Governance Used,' + summary.governanceUsed + '\n';
            
            // Add COGS source breakdown
            csv += '\n\nCOGS SOURCE BREAKDOWN\n';
            csv += 'Source,Count,Revenue,COGS,Margin,Margin %\n';
            
            Object.keys(summary.byCogsSource).forEach(source => {
                const data = summary.byCogsSource[source];
                csv += [
                    source,
                    data.count,
                    data.totalRevenue,
                    data.totalCogs,
                    data.totalMargin,
                    data.marginPercent
                ].join(',') + '\n';
            });
            
            return csv;
            
        } catch (error) {
            log.error('Error creating CSV content', error);
            return 'Error creating CSV';
        }
    }
    
    /**
     * Get cost from linked time entry
     */
    function getTimeEntryCost(timeEntryId) {
        try {
            if (!timeEntryId) return 0;
            
            // First lookup to get basic time entry info - include duration fields
            const timeSearch = search.lookupFields({
                type: 'timebill',
                id: timeEntryId,
                columns: ['hours', 'rate', 'employee', 'duration', 'durationdecimal']
            });
            
            if (!timeSearch) {
                log.debug('Time entry not found', {
                    timeEntryId: timeEntryId
                });
                return 0;
            }
            
            // Try different fields for hours
            let hours = 0;
            
            // Try durationdecimal first (most accurate)
            if (timeSearch.durationdecimal) {
                hours = parseFloat(timeSearch.durationdecimal) || 0;
            } 
            // Then try hours field
            else if (timeSearch.hours) {
                hours = parseFloat(timeSearch.hours) || 0;
            }
            // Then try duration (might be in format like "0:45")
            else if (timeSearch.duration) {
                // Parse duration if it's in time format
                const durationStr = timeSearch.duration;
                if (durationStr.includes(':')) {
                    const parts = durationStr.split(':');
                    hours = parseInt(parts[0]) + (parseInt(parts[1]) / 60);
                } else {
                    hours = parseFloat(durationStr) || 0;
                }
            }
            
            const rate = parseFloat(timeSearch.rate || '0') || 0;
            
            // Log initial values
            log.debug('Time entry lookup complete', {
                timeEntryId: timeEntryId,
                hours: hours,
                durationField: timeSearch.duration,
                durationDecimalField: timeSearch.durationdecimal,
                hoursField: timeSearch.hours,
                rate: rate,
                employee: timeSearch.employee
            });
            
            if (hours === 0) {
                log.debug('No hours found on time entry', {
                    timeEntryId: timeEntryId,
                    allFields: timeSearch
                });
                return 0;
            }
            
            if (rate > 0) {
                const cost = hours * rate;
                log.debug('Using time entry rate', {
                    timeEntryId: timeEntryId,
                    hours: hours,
                    rate: rate,
                    cost: cost
                });
                return cost;
            }
            
            // If no rate on time entry, try to get employee labor cost
            if (timeSearch.employee && timeSearch.employee[0]) {
                const employeeId = timeSearch.employee[0].value;
                
                const laborCostSearch = search.lookupFields({
                    type: 'employee',
                    id: employeeId,
                    columns: ['laborcost', 'entityid']
                });
                
                const laborCost = parseFloat(laborCostSearch.laborcost || '0') || 0;
                const cost = hours * laborCost;
                
                log.debug('Using employee labor cost', {
                    timeEntryId: timeEntryId,
                    employeeId: employeeId,
                    employeeName: laborCostSearch.entityid,
                    hours: hours,
                    laborCost: laborCost,
                    cost: cost
                });
                
                return cost;
            } else {
                log.debug('No employee found on time entry', {
                    timeEntryId: timeEntryId,
                    employeeField: timeSearch.employee
                });
            }
            
            return 0;
            
        } catch (error) {
            log.error('Error getting time entry cost', {
                timeEntryId: timeEntryId,
                error: error.toString()
            });
            return 0;
        }
    }
    
    /**
     * Get cost from linked purchase order for temporary items
     */
    function getLinkedPOCost(poId, tempItemCode, quantity) {
        try {
            if (!poId || !tempItemCode) return 0;
            
            log.debug('Getting linked PO cost', {
                poId: poId,
                tempItemCode: tempItemCode,
                quantity: quantity
            });
            
            // Search for PO lines with matching temp item code
            const poLineSearch = search.create({
                type: search.Type.PURCHASE_ORDER,
                filters: [
                    ['internalid', 'anyof', poId],
                    'AND',
                    ['mainline', 'is', 'F'],
                    'AND',
                    ['taxline', 'is', 'F'],
                    'AND',
                    ['custcol_sna_hul_temp_item_code', 'is', tempItemCode]
                ],
                columns: [
                    search.createColumn({ name: 'line' }),
                    search.createColumn({ name: 'item' }),
                    search.createColumn({ name: 'rate' }),
                    search.createColumn({ name: 'quantity' }),
                    search.createColumn({ name: 'custcol_sna_hul_temp_item_code' })
                ]
            });
            
            let poRate = 0;
            let found = false;
            
            poLineSearch.run().each(function(result) {
                // Take the first match
                if (!found) {
                    poRate = parseFloat(result.getValue('rate') || '0') || 0;
                    found = true;
                    
                    log.audit('Linked PO rate found', {
                        poId: poId,
                        tempItemCode: tempItemCode,
                        poLine: result.getValue('line'),
                        poItem: result.getText('item'),
                        poRate: poRate,
                        poQuantity: result.getValue('quantity')
                    });
                }
                return false; // Stop after first match
            });
            
            if (!found) {
                log.debug('No matching PO line found', {
                    poId: poId,
                    tempItemCode: tempItemCode
                });
                return 0;
            }
            
            // Calculate total COGS (PO rate * SO quantity)
            const totalCOGS = poRate * quantity;
            
            log.debug('Linked PO COGS calculated', {
                poId: poId,
                tempItemCode: tempItemCode,
                poRate: poRate,
                soQuantity: quantity,
                totalCOGS: totalCOGS
            });
            
            return totalCOGS;
            
        } catch (error) {
            log.error('Error getting linked PO cost', {
                poId: poId,
                tempItemCode: tempItemCode,
                error: error.toString()
            });
            return 0;
        }
    }
    
    /**
     * Get vendor prices for an item
     */
    function getVendorPrices(itemId) {
        try {
            if (!itemId) return { purchasePrice: 0, contractPrice: 0 };
            
            // Log the search attempt - commented out for performance
            // log.debug('Searching for vendor prices', {
            //     itemId: itemId,
            //     recordType: 'customrecord_sna_hul_vendorprice'
            // });
            
            // Search for vendor price records for this item where primary vendor = true
            const vendorPriceSearch = search.create({
                type: 'customrecord_sna_hul_vendorprice',
                filters: [
                    ['custrecord_sna_hul_item', 'anyof', itemId],
                    'AND',
                    ['custrecord_sna_hul_primaryvendor', 'is', 'T']
                ],
                columns: [
                    search.createColumn({ name: 'custrecord_sna_hul_itempurchaseprice' }),
                    search.createColumn({ name: 'custrecord_sna_hul_contractprice' }),
                    search.createColumn({ name: 'internalid' })
                ]
            });
            
            let purchasePrice = 0;
            let contractPrice = 0;
            let found = false;
            let recordCount = 0;
            
            try {
                // Commented out for performance
                // const searchResultCount = vendorPriceSearch.runPaged().count;
                // log.debug('Vendor price search result count', {
                //     itemId: itemId,
                //     count: searchResultCount
                // });
                
                vendorPriceSearch.run().each(function(result) {
                    recordCount++;
                    purchasePrice = parseFloat(result.getValue('custrecord_sna_hul_itempurchaseprice') || '0') || 0;
                    contractPrice = parseFloat(result.getValue('custrecord_sna_hul_contractprice') || '0') || 0;
                    found = true;
                    
                    // Commented out for performance
                    // log.audit('Vendor price found', {
                    //     itemId: itemId,
                    //     recordId: result.getValue('internalid'),
                    //     purchasePrice: purchasePrice,
                    //     contractPrice: contractPrice,
                    //     recordNumber: recordCount
                    // });
                    
                    return false; // Take first primary vendor found
                });
            } catch (searchError) {
                log.error('Error running vendor price search', {
                    itemId: itemId,
                    error: searchError.toString()
                });
            }
            
            if (!found) {
                // Commented out for performance
                // log.debug('No primary vendor price found for item', {
                //     itemId: itemId,
                //     searchCount: recordCount
                // });
                
                // Try searching without primary vendor filter
                try {
                    const allVendorSearch = search.create({
                        type: 'customrecord_sna_hul_vendorprice',
                        filters: [
                            ['custrecord_sna_hul_item', 'anyof', itemId]
                        ],
                        columns: [
                            search.createColumn({ name: 'custrecord_sna_hul_itempurchaseprice' }),
                            search.createColumn({ name: 'custrecord_sna_hul_contractprice' }),
                            search.createColumn({ name: 'custrecord_sna_hul_primaryvendor' }),
                            search.createColumn({ name: 'internalid' })
                        ]
                    });
                    
                    // Commented out for performance
                    // const allCount = allVendorSearch.runPaged().count;
                    // log.debug('All vendor prices count (no primary filter)', {
                    //     itemId: itemId,
                    //     count: allCount
                    // });
                    
                    // if (allCount > 0) {
                        allVendorSearch.run().each(function(result) {
                            if (!found) {
                                purchasePrice = parseFloat(result.getValue('custrecord_sna_hul_itempurchaseprice') || '0') || 0;
                                contractPrice = parseFloat(result.getValue('custrecord_sna_hul_contractprice') || '0') || 0;
                                const isPrimary = result.getValue('custrecord_sna_hul_primaryvendor');
                                
                                // Commented out for performance
                                // log.audit('Vendor price found (no primary filter)', {
                                //     itemId: itemId,
                                //     recordId: result.getValue('internalid'),
                                //     isPrimary: isPrimary,
                                //     purchasePrice: purchasePrice,
                                //     contractPrice: contractPrice
                                // });
                                
                                found = true;
                            }
                            return true; // Continue to see all records in logs
                        });
                    // }
                } catch (allSearchError) {
                    log.error('Error searching all vendor prices', {
                        itemId: itemId,
                        error: allSearchError.toString()
                    });
                }
            }
            
            return {
                purchasePrice: purchasePrice,
                contractPrice: contractPrice
            };
            
        } catch (error) {
            log.error('Error getting vendor prices', {
                itemId: itemId,
                error: error.toString()
            });
            return { purchasePrice: 0, contractPrice: 0 };
        }
    }
    
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});