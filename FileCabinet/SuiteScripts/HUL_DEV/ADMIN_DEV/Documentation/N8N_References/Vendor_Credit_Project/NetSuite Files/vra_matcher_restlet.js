/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/search', 'N/record', 'N/log'], (search, record, log) => {
    
    /**
     * Handle POST request - Match vendor credit to VRA
     */
    function post(requestBody) {
        try {
            // Extract the data sent from n8n
            const {
                vraNumber,
                poNumber,
                vendorId,
                vendorName,
                lineItems,
                processId,
                creditTotal
            } = requestBody;
            
            log.audit('VRA Matching Request', {
                processId: processId,
                vraNumber: vraNumber,
                poNumber: poNumber,
                vendorId: vendorId,
                vendorName: vendorName,
                itemCount: lineItems ? lineItems.length : 0
            });
            
            // Method 1: Direct VRA search
            if (vraNumber && vraNumber.trim()) {
                log.audit('Method 1: Direct VRA Search', vraNumber);
                const vraResult = searchByVRANumber(vraNumber);
                if (vraResult) {
                    return {
                        matchFound: true,
                        method: 'vra_direct',
                        vraNumber: vraResult.vraNumber,
                        vraInternalId: vraResult.internalId,
                        vendorInternalId: vraResult.vendorId,
                        vendor: vraResult.vendor,
                        poInternalId: vraResult.poInternalId,
                        items: vraResult.items,
                        processId: processId
                    };
                }
            }
            
            // Method 2: PO to VRA search
            if (poNumber && poNumber.trim()) {
                log.audit('Method 2: PO Search', poNumber);
                const poResult = searchByPONumber(poNumber);
                if (poResult) {
                    return {
                        matchFound: true,
                        method: 'po_to_vra',
                        vraNumber: poResult.vraNumber,
                        vraInternalId: poResult.internalId,
                        vendorInternalId: poResult.vendorId,
                        poNumber: poNumber,
                        poInternalId: poResult.poInternalId,
                        vendor: poResult.vendor,
                        items: poResult.items,
                        processId: processId
                    };
                }
            }
            
            // Method 3: Vendor search with item matching
            if ((vendorId || (vendorName && vendorName.trim())) && lineItems && lineItems.length > 0) {
                log.audit('Method 3: Vendor Search', 'ID: ' + vendorId + ', Name: ' + vendorName);
                const vendorResults = searchByVendor(vendorId, vendorName, lineItems);
                
                if (vendorResults.length > 0) {
                    // Find best matching VRA based on items
                    let bestMatch = null;
                    let bestMatchScore = 0;
                    
                    for (let vra of vendorResults) {
                        let matchedItems = 0;
                        let totalItems = lineItems.length;
                        
                        // Check if items match (with fallback for vendor suffixes)
                        for (let creditItem of lineItems) {
                            const creditPartNum = (creditItem.partNumber || creditItem.itemNumber || '').toString().trim();
                            let itemMatched = false;
                            
                            for (let vraItem of vra.lineItems) {
                                const vraItemNum = (vraItem.itemNumber || '').toString().trim();
                                const vendorItemName = (vraItem.vendorItemName || '').toString().trim();
                                
                                // Try exact match first
                                if (vraItemNum === creditPartNum) {
                                    itemMatched = true;
                                    log.audit('Item matched (exact)', creditPartNum + ' = ' + vraItemNum);
                                    break;
                                }
                                
                                // Try removing suffix from VRA item (not credit item!)
                                const vraBase = vraItemNum.replace(/-JLG$|-MIT$|-MITSU$|-CAT$|-HYU$/i, '');
                                if (vraBase && vraBase === creditPartNum) {
                                    itemMatched = true;
                                    log.audit('Item matched (VRA suffix removed)', 'Credit: ' + creditPartNum + ' = VRA base: ' + vraBase + ' (from ' + vraItemNum + ')');
                                    break;
                                }
                                
                                // Try vendor item name field
                                if (vendorItemName && vendorItemName === creditPartNum) {
                                    itemMatched = true;
                                    log.audit('Item matched (vendor item name)', creditPartNum + ' = ' + vendorItemName);
                                    break;
                                }
                            }
                            
                            if (itemMatched) {
                                matchedItems++;
                            }
                        }
                        
                        const matchScore = (matchedItems / totalItems) * 100;
                        
                        if (matchScore > bestMatchScore) {
                            bestMatchScore = matchScore;
                            bestMatch = vra;
                        }
                    }
                    
                    // Return best match if above threshold
                    if (bestMatch && bestMatchScore >= 50) { // 50% threshold
                        log.audit('VRA match found via vendor search', {
                            vraNumber: bestMatch.vraNumber,
                            matchScore: bestMatchScore
                        });
                        
                        return {
                            matchFound: true,
                            method: 'vendor_search',
                            vraNumber: bestMatch.vraNumber,
                            vendorInternalId: bestMatch.vendorId,
                            vendor: bestMatch.vendor,
                            poInternalId: bestMatch.poInternalId,
                            matchScore: bestMatchScore,
                            items: bestMatch.lineItems,
                            processId: processId
                        };
                    }
                }
            }
            
            // No match found
            log.audit('No VRA match found', {
                processId: processId,
                triedMethods: {
                    vraSearch: !!vraNumber,
                    poSearch: !!poNumber,
                    vendorSearch: !!(vendorId || vendorName)
                }
            });
            
            return {
                matchFound: false,
                message: 'No matching VRA found',
                processId: processId,
                searchAttempts: {
                    vraNumber: vraNumber || null,
                    poNumber: poNumber || null,
                    vendorName: vendorName || null
                }
            };
            
        } catch (error) {
            log.error('Error in VRA matching', error.toString());
            return {
                matchFound: false,
                error: error.toString(),
                processId: requestBody.processId
            };
        }
    }
    
    /**
     * Search for VRA by VRA number
     */
    function searchByVRANumber(vraNumber) {
        try {
            const vraSearch = search.create({
                type: 'vendorreturnauthorization',
                filters: [
                    ['tranid', 'is', vraNumber],
                    'AND',
                    ['mainline', 'is', 'T']
                ],
                columns: ['internalid', 'tranid', 'entity', 'trandate', 'total', 'createdfrom']
            });
            
            let result = null;
            vraSearch.run().each(function(searchResult) {
                result = {
                    internalId: searchResult.getValue('internalid'),
                    vraNumber: searchResult.getValue('tranid'),
                    vendorId: searchResult.getValue('entity'),
                    vendor: searchResult.getText('entity'),
                    poInternalId: searchResult.getValue('createdfrom'),
                    date: searchResult.getValue('trandate'),
                    total: searchResult.getValue('total')
                };
                
                // Get line items
                result.items = getVRALineItems(result.internalId);
                
                return false; // Stop after first result
            });
            
            return result;
        } catch (error) {
            log.error('Error in searchByVRANumber', error.toString());
            return null;
        }
    }
    
    /**
     * Search for VRA by PO number
     */
    function searchByPONumber(poNumber) {
        try {
            const vraSearch = search.create({
                type: 'vendorreturnauthorization',
                filters: [
                    ['createdfrom.tranid', 'is', poNumber],
                    'AND',
                    ['mainline', 'is', 'T']
                ],
                columns: ['internalid', 'tranid', 'entity', 'trandate', 'total', 'createdfrom']
            });
            
            let result = null;
            vraSearch.run().each(function(searchResult) {
                result = {
                    internalId: searchResult.getValue('internalid'),
                    vraNumber: searchResult.getValue('tranid'),
                    vendorId: searchResult.getValue('entity'),
                    vendor: searchResult.getText('entity'),
                    poInternalId: searchResult.getValue('createdfrom'),
                    date: searchResult.getValue('trandate'),
                    total: searchResult.getValue('total'),
                    poNumber: searchResult.getText('createdfrom')
                };
                
                // Get line items
                result.items = getVRALineItems(result.internalId);
                
                return false; // Stop after first result
            });
            
            return result;
        } catch (error) {
            log.error('Error in searchByPONumber', error.toString());
            return null;
        }
    }
    
    /**
     * Search for VRAs by vendor and match items
     */
    function searchByVendor(vendorId, vendorName, lineItems) {
        try {
            // Resolve vendor ID if only name provided
            const searchVendorId = vendorId || resolveVendorId(vendorName);
            
            if (!searchVendorId) {
                log.error('Vendor not found', 'Could not resolve vendor: ' + vendorName);
                return [];
            }
            
            log.audit('Searching by Vendor ID', searchVendorId);
            
            const vraSearch = search.create({
                type: 'vendorreturnauthorization',
                filters: [
                    ['mainline', 'is', 'F'],
                    'AND',
                    ['entity', 'anyof', searchVendorId],
                    'AND',
                    ['status', 'noneof', 'VendRtnAuth:H'] // Exclude closed/cancelled
                ],
                columns: [
                    'tranid',
                    'trandate',
                    'entity',
                    'createdfrom',
                    'item',
                    search.createColumn({
                        name: 'itemid',
                        join: 'item'
                    }),
                    'custcol_sna_vendor_item_name', // Add vendor item name field
                    'quantity',
                    'amount'
                ]
            });
            
            const vraMap = {};
            
            vraSearch.run().each(function(result) {
                const vraId = result.getValue('tranid');
                const itemNumber = result.getValue({ name: 'itemid', join: 'item' });
                
                if (itemNumber) { // Only process if item has a number
                    if (!vraMap[vraId]) {
                        vraMap[vraId] = {
                            vraNumber: vraId,
                            date: result.getValue('trandate'),
                            vendorId: searchVendorId,
                            vendor: result.getText('entity'),
                            poInternalId: result.getValue('createdfrom'),
                            lineItems: []
                        };
                    }
                    
                    vraMap[vraId].lineItems.push({
                        itemNumber: itemNumber,
                        vendorItemName: result.getValue('custcol_sna_vendor_item_name'), // Include vendor item name
                        item: result.getText('item'),
                        quantity: Math.abs(parseFloat(result.getValue('quantity') || 0)),
                        amount: Math.abs(parseFloat(result.getValue('amount') || 0))
                    });
                }
                
                return true;
            });
            
            const results = Object.values(vraMap);
            log.audit('VRAs found for vendor', 'Found ' + results.length + ' VRAs for vendor ID: ' + searchVendorId);
            
            return results;
        } catch (error) {
            log.error('Error in searchByVendor', error.toString());
            return [];
        }
    }
    
    /**
     * Get line items for a specific VRA
     */
    function getVRALineItems(vraInternalId) {
        try {
            const itemSearch = search.create({
                type: 'vendorreturnauthorization',
                filters: [
                    ['internalid', 'is', vraInternalId],
                    'AND',
                    ['mainline', 'is', 'F']
                ],
                columns: [
                    'item',
                    search.createColumn({
                        name: 'itemid',
                        join: 'item'
                    }),
                    'custcol_sna_vendor_item_name',
                    'quantity',
                    'rate',
                    'amount'
                ]
            });
            
            const items = [];
            itemSearch.run().each(function(result) {
                items.push({
                    item: result.getText('item'),
                    itemNumber: result.getValue({ name: 'itemid', join: 'item' }),
                    vendorItemName: result.getValue('custcol_sna_vendor_item_name'),
                    quantity: result.getValue('quantity'),
                    rate: result.getValue('rate'),
                    amount: result.getValue('amount')
                });
                return true;
            });
            
            return items;
        } catch (error) {
            log.error('Error getting VRA items', error.toString());
            return [];
        }
    }
    
    /**
     * Resolve vendor name to internal ID
     */
    function resolveVendorId(vendorName) {
        if (!vendorName) return null;
        
        try {
            // Clean the vendor name
            const cleanName = vendorName.trim();
            
            // Try exact match first
            const vendorSearch = search.create({
                type: 'vendor',
                filters: [
                    ['entityid', 'is', cleanName]
                ],
                columns: ['internalid']
            });
            
            let vendorId = null;
            vendorSearch.run().each(function(result) {
                vendorId = result.getValue('internalid');
                return false;
            });
            
            // If no exact match, try contains
            if (!vendorId) {
                const vendorSearchContains = search.create({
                    type: 'vendor',
                    filters: [
                        ['entityid', 'contains', cleanName]
                    ],
                    columns: ['internalid', 'entityid']
                });
                
                vendorSearchContains.run().each(function(result) {
                    vendorId = result.getValue('internalid');
                    log.audit('Vendor found with contains', {
                        searchTerm: cleanName,
                        foundVendor: result.getValue('entityid')
                    });
                    return false;
                });
            }
            
            return vendorId;
        } catch (error) {
            log.error('Error resolving vendor', error.toString());
            return null;
        }
    }
    
    return {
        post: post
    };
});