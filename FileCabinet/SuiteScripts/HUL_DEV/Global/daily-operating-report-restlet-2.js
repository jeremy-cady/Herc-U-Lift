/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/search', 'N/log'], (search, log) => {
    
    /**
     * Get cost from linked time entry
     * @param {string} timeEntryId - Internal ID of the time entry
     * @returns {number} The calculated cost
     */
    function getTimeEntryCost(timeEntryId) {
        try {
            if (!timeEntryId) return 0;
            
            log.debug('Getting time entry cost', 'Time Entry ID: ' + timeEntryId);
            
            const timeSearch = search.create({
                type: 'timebill',
                filters: [
                    ['internalid', 'anyof', timeEntryId]
                ],
                columns: [
                    search.createColumn({ name: 'employee' }),
                    search.createColumn({ name: 'hours' }),
                    search.createColumn({ name: 'rate' }),
                    // Let's add employee labor cost
                    search.createColumn({ 
                        name: 'laborcost',
                        join: 'employee'
                    })
                ]
            });
            
            let cost = 0;
            let found = false;
            
            timeSearch.run().each((result) => {
                found = true;
                const hours = parseFloat(result.getValue('hours') || '0') || 0;
                const rate = parseFloat(result.getValue('rate') || '0') || 0;
                const laborCost = parseFloat(result.getValue({ 
                    name: 'laborcost', 
                    join: 'employee' 
                }) || '0') || 0;
                
                // Use rate if available, otherwise use employee labor cost
                if (rate > 0) {
                    cost = hours * rate;
                } else if (laborCost > 0) {
                    cost = hours * laborCost;
                }
                
                log.debug('Time entry details', {
                    timeEntryId: timeEntryId,
                    hours: hours,
                    rate: rate,
                    laborCost: laborCost,
                    calculatedCost: cost
                });
                
                return false;
            });
            
            if (!found) {
                log.debug('Time entry not found', 'ID: ' + timeEntryId);
            }
            
            return cost;
            
        } catch (error) {
            log.error('Error getting time entry cost', {
                timeEntryId: timeEntryId,
                error: error.toString()
            });
            return 0;
        }
    }
    
    /**
     * Get cost from item fulfillment for inventory items
     * @param {string} salesOrderId - Internal ID of the sales order
     * @param {string} itemId - Internal ID of the item
     * @param {number} quantity - Quantity on the line
     * @returns {number} The calculated cost
     */
    function getItemFulfillmentCost(salesOrderId, itemId, quantity) {
        try {
            if (!salesOrderId || !itemId) return 0;
            
            log.debug('Getting fulfillment cost', {
                salesOrderId: salesOrderId,
                itemId: itemId,
                quantity: quantity
            });
            
            // First, try to get cost from the item record itself
            const itemCost = getItemCost(itemId);
            
            if (itemCost > 0) {
                // Search for item fulfillments to get actual fulfilled quantity
                const fulfillmentSearch = search.create({
                    type: 'itemfulfillment',
                    filters: [
                        ['createdfrom', 'anyof', salesOrderId],
                        'AND',
                        ['item', 'anyof', itemId],
                        'AND',
                        ['mainline', 'is', 'F'],
                        'AND',
                        ['taxline', 'is', 'F']
                    ],
                    columns: [
                        search.createColumn({ name: 'quantity' })
                    ]
                });
                
                let totalFulfilledQty = 0;
                
                fulfillmentSearch.run().each((result) => {
                    const fulfillmentQty = parseFloat(result.getValue('quantity') || '0') || 0;
                    totalFulfilledQty += fulfillmentQty;
                    return true;
                });
                
                log.debug('Fulfillment details', {
                    itemCost: itemCost,
                    fulfilledQty: totalFulfilledQty,
                    orderedQty: quantity,
                    totalCost: totalFulfilledQty * itemCost
                });
                
                // Return cost based on fulfilled quantity if available, otherwise ordered quantity
                return (totalFulfilledQty > 0 ? totalFulfilledQty : quantity) * itemCost;
            }
            
            return 0;
            
        } catch (error) {
            log.error('Error getting item fulfillment cost', {
                salesOrderId: salesOrderId,
                itemId: itemId,
                error: error.toString()
            });
            return 0;
        }
    }
    
    /**
     * Get item cost from item record
     * @param {string} itemId - Internal ID of the item
     * @returns {number} The item cost
     */
    function getItemCost(itemId) {
        try {
            if (!itemId) return 0;
            
            // Try inventory item first
            const itemSearch = search.create({
                type: search.Type.ITEM,
                filters: [
                    ['internalid', 'anyof', itemId]
                ],
                columns: [
                    search.createColumn({ name: 'averagecost' }),
                    search.createColumn({ name: 'lastpurchaseprice' }),
                    search.createColumn({ name: 'cost' }),
                    search.createColumn({ name: 'type' })
                ]
            });
            
            let itemCost = 0;
            
            itemSearch.run().each((result) => {
                // Priority: average cost > last purchase price > standard cost
                itemCost = parseFloat(result.getValue('averagecost') || '0') || 
                          parseFloat(result.getValue('lastpurchaseprice') || '0') || 
                          parseFloat(result.getValue('cost') || '0') || 
                          0;
                
                log.debug('Item cost details', {
                    itemId: itemId,
                    type: result.getValue('type'),
                    averageCost: result.getValue('averagecost'),
                    lastPurchasePrice: result.getValue('lastpurchaseprice'),
                    standardCost: result.getValue('cost'),
                    selectedCost: itemCost
                });
                
                return false;
            });
            
            return itemCost;
            
        } catch (error) {
            log.error('Error getting item cost', {
                itemId: itemId,
                error: error.toString()
            });
            return 0;
        }
    }
    
    /**
     * Get today's sales order lines with revenue, COGS, and margin
     * @param {Object} requestParams - The request parameters
     * @returns {Object} The response containing transaction lines with financial data
     */
    function get(requestParams) {
        try {
            log.debug('Starting Daily Operating Report', 'Request params: ' + JSON.stringify(requestParams));
            
            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Format dates for search
            const todayStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            const tomorrowStr = (tomorrow.getMonth() + 1) + '/' + tomorrow.getDate() + '/' + tomorrow.getFullYear();
            
            log.debug('Date Range', 'From: ' + todayStr + ' To: ' + tomorrowStr);
            
            // Start with a very simple search
            const salesOrderLineSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['type', 'anyof', 'SalesOrd'],
                    'AND',
                    ['mainline', 'is', 'F'],
                    'AND',
                    ['taxline', 'is', 'F'],
                    'AND',
                    ['lastmodifieddate', 'within', todayStr, tomorrowStr],
                    'AND',
                    ['numbertext', 'doesnotstartwith', 'R'] // Filter out rental orders
                ],
                columns: [
                    search.createColumn({ name: 'tranid' }),
                    search.createColumn({ name: 'entity' }),
                    search.createColumn({ name: 'trandate' }),
                    search.createColumn({ name: 'line' }),
                    search.createColumn({ name: 'item' }),
                    search.createColumn({ name: 'quantity' }),
                    search.createColumn({ name: 'rate' }),
                    search.createColumn({ name: 'amount' }),
                    search.createColumn({ name: 'custcol_sna_linked_time' }),
                    search.createColumn({ name: 'custcol_sna_so_service_code_type' }),
                    search.createColumn({ name: 'lastmodifieddate' }),
                    search.createColumn({ name: 'custcol_sna_hul_temp_porate' }) // Correct custom field for PO rate
                ]
            });
            
            const results = [];
            let count = 0;
            
            // Limit to first 100 results for testing
            salesOrderLineSearch.run().each((result) => {
                try {
                    // Increase limit gradually to find where it breaks
                    if (count >= 100) return false; // Increased to 150 for testing
                    
                    // Add detailed logging every 10 records
                    if (count % 10 === 0) {
                        log.debug('Processing progress', {
                            count: count,
                            lastTransactionId: result.getValue('tranid'),
                            lastItemId: result.getValue('item')
                        });
                    }
                    
                    const lineData = {
                        transactionId: result.getValue('tranid') || '',
                        transactionInternalId: result.id || '',
                        customer: result.getText('entity') || '',
                        customerId: result.getValue('entity') || '',
                        tranDate: result.getValue('trandate') || '',
                        line: result.getValue('line') || '',
                        item: result.getText('item') || '',
                        itemId: result.getValue('item') || '',
                        quantity: parseFloat(result.getValue('quantity') || '0') || 0,
                        rate: parseFloat(result.getValue('rate') || '0') || 0,
                        revenue: parseFloat(result.getValue('amount') || '0') || 0,
                        linkedTimeEntry: result.getValue('custcol_sna_linked_time') || '',
                        serviceCodeType: result.getValue('custcol_sna_so_service_code_type') || '',
                        lastModified: result.getValue('lastmodifieddate') || '',
                        poRate: parseFloat(result.getValue('custcol_sna_hul_temp_porate') || '0') || 0,
                        cogs: 0,
                        grossMargin: 0,
                        marginPercent: 0,
                        cogsSource: 'none'
                    };
                    
                    // Debug logging for item 98642
                    if (lineData.itemId == '98642') {
                        log.debug('Temporary Item Found', {
                            itemId: lineData.itemId,
                            poRate: lineData.poRate,
                            poRateRaw: result.getValue('custcol_sna_hul_temp_porate'),
                            quantity: lineData.quantity
                        });
                    }
                    
                    // Calculate COGS for service items with linked time entries
                    if (lineData.serviceCodeType == '2' && lineData.linkedTimeEntry) {
                        lineData.cogs = getTimeEntryCost(lineData.linkedTimeEntry);
                        lineData.cogsSource = lineData.cogs > 0 ? 'timeEntry' : 'noTimeEntryCost';
                    } else if (lineData.serviceCodeType != '2') {
                        // Special handling for Temporary Item - 9800
                        if (lineData.itemId == '98642' && lineData.poRate > 0) {
                            lineData.cogs = lineData.quantity * lineData.poRate;
                            lineData.cogsSource = 'poRate';
                            log.debug('Using PO Rate for temporary item', {
                                itemId: lineData.itemId,
                                quantity: lineData.quantity,
                                poRate: lineData.poRate,
                                cogs: lineData.cogs
                            });
                        } else {
                            // For other non-service items, try to get fulfillment cost
                            lineData.cogs = getItemFulfillmentCost(
                                lineData.transactionInternalId,
                                lineData.itemId,
                                lineData.quantity
                            );
                            lineData.cogsSource = lineData.cogs > 0 ? 'fulfillment' : 'noFulfillmentCost';
                        }
                    }
                    
                    // Calculate gross margin
                    lineData.grossMargin = lineData.revenue - lineData.cogs;
                    lineData.marginPercent = lineData.revenue > 0 
                        ? ((lineData.grossMargin / lineData.revenue) * 100).toFixed(2)
                        : '0';
                    
                    results.push(lineData);
                    count++;
                    
                    // Log every problematic line for debugging
                    if (count > 100 && count <= 110) {
                        log.debug('Line details after 100', {
                            count: count,
                            transactionId: lineData.transactionId,
                            itemId: lineData.itemId,
                            serviceCodeType: lineData.serviceCodeType,
                            linkedTimeEntry: lineData.linkedTimeEntry
                        });
                    }
                    
                } catch (lineError) {
                    log.error('Error processing line at count ' + count, {
                        error: lineError.toString(),
                        lineId: result.id,
                        transactionId: result.getValue('tranid'),
                        itemId: result.getValue('item')
                    });
                }
                
                return true;
            });
            
            log.debug('Search completed', 'Found ' + results.length + ' lines');
            
            // Calculate summary totals
            const summary = {
                totalRevenue: 0,
                totalCOGS: 0,
                totalGrossMargin: 0,
                overallMarginPercent: 0,
                lineCount: results.length,
                byCogsSource: {}
            };
            
            // Calculate totals and group by COGS source
            results.forEach(line => {
                summary.totalRevenue += line.revenue;
                summary.totalCOGS += line.cogs;
                
                // Track COGS by source
                if (!summary.byCogsSource[line.cogsSource]) {
                    summary.byCogsSource[line.cogsSource] = {
                        count: 0,
                        totalCogs: 0,
                        totalRevenue: 0,
                        totalMargin: 0,
                        marginPercent: 0
                    };
                }
                summary.byCogsSource[line.cogsSource].count++;
                summary.byCogsSource[line.cogsSource].totalCogs += line.cogs;
                summary.byCogsSource[line.cogsSource].totalRevenue += line.revenue;
            });
            
            // Calculate margins for each COGS source
            Object.keys(summary.byCogsSource).forEach(source => {
                const sourceData = summary.byCogsSource[source];
                sourceData.totalMargin = sourceData.totalRevenue - sourceData.totalCogs;
                sourceData.marginPercent = sourceData.totalRevenue > 0 
                    ? ((sourceData.totalMargin / sourceData.totalRevenue) * 100).toFixed(2)
                    : '0';
            });
            
            summary.totalGrossMargin = summary.totalRevenue - summary.totalCOGS;
            summary.overallMarginPercent = summary.totalRevenue > 0 
                ? ((summary.totalGrossMargin / summary.totalRevenue) * 100).toFixed(2) 
                : '0';
            
            return {
                success: true,
                message: 'Search completed for date: ' + todayStr,
                summary: summary,
                lines: results
            };
            
        } catch (error) {
            log.error('Error in Daily Operating Report', {
                error: error.toString(),
                message: error.message,
                type: error.name
            });
            
            return {
                success: false,
                error: error.toString(),
                message: error.message || 'Unknown error'
            };
        }
    }
    
    return {
        get: get
    };
});