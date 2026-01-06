/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * 
 * Inventory Reorder Analysis - Map/Reduce Script
 * 
 * Purpose: Analyze all inventory items and generate reorder recommendations
 * Handles: >5000 items via Map/Reduce pagination
 * Schedule: Daily at 6:00 AM
 * Output: CSV file + Email to purchasing team
 * 
 * Business Logic:
 * - Reorder if: QuantityAvailable < ReorderPoint AND recent sales velocity > 0
 * - Suggested Order Qty: PreferredStockLevel - QuantityAvailable - QuantityOnOrder
 * - Consider lead time and vendor in recommendations
 */

define(['N/search', 'N/record', 'N/email', 'N/file', 'N/runtime', 'N/format'],
    function(search, record, email, file, runtime, format) {

        /**
         * getInputData stage
         * Query all inventory items that need analysis
         * This runs ONCE and can return >5000 records via search pagination
         */
        function getInputData() {
            log.audit('getInputData', 'Starting inventory analysis query');
            
            try {
                // Create search for all active inventory items
                var inventorySearch = search.create({
                    type: 'item',
                    filters: [
                        ['type', 'anyof', 'InvtPart'],
                        'AND',
                        ['isinactive', 'is', 'F'],
                        // TEST MODE: Filter for single item - REMOVE THIS LINE AFTER TESTING
                        'AND',
                        ['itemid', 'is', '91B6100912']
                        // END TEST MODE
                    ],
                    columns: [
                        search.createColumn({ name: 'itemid', sort: search.Sort.ASC }),
                        search.createColumn({ name: 'displayname' }),
                        search.createColumn({ name: 'type' }),
                        
                        // Location-specific inventory (multi-location)
                        search.createColumn({ name: 'inventorylocation' }),
                        search.createColumn({ name: 'locationquantityavailable' }),
                        search.createColumn({ name: 'locationquantityonhand' }),
                        search.createColumn({ name: 'locationquantityonorder' }),
                        search.createColumn({ name: 'locationquantitycommitted' }),
                        search.createColumn({ name: 'locationquantitybackordered' }),
                        
                        // Reorder parameters (location-specific)
                        search.createColumn({ name: 'locationreorderpoint' }),
                        search.createColumn({ name: 'locationpreferredstocklevel' }),
                        
                        // Item costs
                        search.createColumn({ name: 'cost' }),
                        search.createColumn({ name: 'averagecost' }),
                        search.createColumn({ name: 'lastpurchaseprice' })
                    ]
                });
                
                log.audit('Search Created', 'Inventory search created successfully');
                return inventorySearch;
                
            } catch (e) {
                log.error('getInputData Error', 'Error: ' + e.toString());
                throw e;
            }
        }

        /**
         * map stage
         * Process each item and calculate reorder recommendations
         * This runs in parallel for each search result
         */
        function map(context) {
            try {
                var searchResult = JSON.parse(context.value);
                var itemId = searchResult.id;
                
                // Extract values from search result
                var itemData = {
                    id: itemId,
                    itemId: searchResult.values.itemid,
                    displayName: searchResult.values.displayname,
                    location: searchResult.values.inventorylocation ? searchResult.values.inventorylocation.text : 'No Location',
                    locationId: searchResult.values.inventorylocation ? searchResult.values.inventorylocation.value : null,
                    
                    // Quantities
                    qtyAvailable: parseFloat(searchResult.values.locationquantityavailable) || 0,
                    qtyOnHand: parseFloat(searchResult.values.locationquantityonhand) || 0,
                    qtyOnOrder: parseFloat(searchResult.values.locationquantityonorder) || 0,
                    qtyCommitted: parseFloat(searchResult.values.locationquantitycommitted) || 0,
                    qtyBackordered: parseFloat(searchResult.values.locationquantitybackordered) || 0,
                    
                    // Reorder parameters
                    reorderPoint: parseFloat(searchResult.values.locationreorderpoint) || 0,
                    preferredStockLevel: parseFloat(searchResult.values.locationpreferredstocklevel) || 0,
                    
                    // Costs
                    cost: parseFloat(searchResult.values.cost) || 0,
                    averageCost: parseFloat(searchResult.values.averagecost) || 0,
                    lastPurchasePrice: parseFloat(searchResult.values.lastpurchaseprice) || 0
                };
                
                // Get vendor info separately (more reliable than join)
                var vendorInfo = getPreferredVendor(itemId);
                itemData.vendor = vendorInfo.name;
                itemData.vendorId = vendorInfo.id;
                itemData.vendorLeadTime = vendorInfo.leadTime;
                itemData.vendorCost = vendorInfo.cost;
                itemData.isPreferredVendor = true;
                
                // Calculate sales velocity (30-day, 90-day)
                var salesVelocity = calculateSalesVelocity(itemId, itemData.locationId);
                itemData.velocity30Days = salesVelocity.days30;
                itemData.velocity90Days = salesVelocity.days90;
                itemData.avgDailyUsage = salesVelocity.avgDaily;
                
                // Calculate reorder recommendation
                var recommendation = calculateReorderRecommendation(itemData);
                itemData.shouldReorder = recommendation.shouldReorder;
                itemData.recommendedOrderQty = recommendation.orderQty;
                itemData.daysUntilStockout = recommendation.daysUntilStockout;
                itemData.urgencyLevel = recommendation.urgencyLevel;
                itemData.reason = recommendation.reason;
                
                // Only output items that need attention
                if (itemData.shouldReorder || itemData.qtyBackordered > 0 || itemData.urgencyLevel !== 'OK') {
                    // Key by vendor for reduce stage
                    var vendorKey = itemData.vendorId || 'NO_VENDOR';
                    context.write({
                        key: vendorKey,
                        value: itemData
                    });
                }
                
            } catch (e) {
                log.error('map Error', 'ItemId: ' + context.key + ', Error: ' + e.toString());
            }
        }

        /**
         * Get preferred vendor for an item
         */
        function getPreferredVendor(itemId) {
            try {
                var vendorSearch = search.create({
                    type: 'item',
                    filters: [
                        ['internalid', 'anyof', itemId]
                    ],
                    columns: [
                        search.createColumn({ name: 'vendor' }),
                        search.createColumn({ name: 'vendorname' }),
                        search.createColumn({ name: 'vendorpricecurrency' }),
                        search.createColumn({ name: 'vendorcost' })
                    ]
                });
                
                var vendorInfo = {
                    id: null,
                    name: 'No Vendor',
                    leadTime: 0,
                    cost: 0
                };
                
                vendorSearch.run().each(function(result) {
                    vendorInfo.id = result.getValue('vendor');
                    vendorInfo.name = result.getText('vendor') || 'No Vendor';
                    vendorInfo.cost = parseFloat(result.getValue('vendorcost')) || 0;
                    return false; // Only get first (preferred) vendor
                });
                
                // If we found a vendor, get lead time from vendor record
                if (vendorInfo.id) {
                    try {
                        var vendorLookup = search.lookupFields({
                            type: search.Type.VENDOR,
                            id: vendorInfo.id,
                            columns: ['leadstime']
                        });
                        vendorInfo.leadTime = parseInt(vendorLookup.leadstime) || 0;
                    } catch (e) {
                        // Lead time not available, use default
                        vendorInfo.leadTime = 14; // Default 2 weeks
                    }
                }
                
                return vendorInfo;
                
            } catch (e) {
                log.error('getPreferredVendor Error', 'ItemId: ' + itemId + ', Error: ' + e.toString());
                return {
                    id: null,
                    name: 'No Vendor',
                    leadTime: 14,
                    cost: 0
                };
            }
        }

        /**
         * Calculate sales velocity for an item
         */
        function calculateSalesVelocity(itemId, locationId) {
            try {
                var filters = [
                    ['type', 'anyof', 'SalesOrd'],
                    'AND',
                    ['item', 'anyof', itemId],
                    'AND',
                    ['mainline', 'is', 'F'],
                    'AND',
                    ['taxline', 'is', 'F']
                ];
                
                // Add location filter if available
                if (locationId) {
                    filters.push('AND');
                    filters.push(['location', 'anyof', locationId]);
                }
                
                var today = new Date();
                var date30DaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                var date90DaysAgo = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
                
                // Search for sales in last 90 days
                filters.push('AND');
                filters.push(['trandate', 'onorafter', format.format({ value: date90DaysAgo, type: format.Type.DATE })]);
                
                var salesSearch = search.create({
                    type: 'transaction',
                    filters: filters,
                    columns: [
                        search.createColumn({ name: 'trandate' }),
                        search.createColumn({ name: 'quantity' })
                    ]
                });
                
                var qty30Days = 0;
                var qty90Days = 0;
                
                salesSearch.run().each(function(result) {
                    var tranDate = result.getValue('trandate');
                    var quantity = Math.abs(parseFloat(result.getValue('quantity')) || 0);
                    
                    var tranDateObj = format.parse({ value: tranDate, type: format.Type.DATE });
                    
                    qty90Days += quantity;
                    
                    if (tranDateObj >= date30DaysAgo) {
                        qty30Days += quantity;
                    }
                    
                    return true; // Continue iteration
                });
                
                var avgDaily = qty30Days > 0 ? (qty30Days / 30) : (qty90Days / 90);
                
                return {
                    days30: qty30Days,
                    days90: qty90Days,
                    avgDaily: avgDaily
                };
                
            } catch (e) {
                log.error('calculateSalesVelocity Error', 'ItemId: ' + itemId + ', Error: ' + e.toString());
                return { days30: 0, days90: 0, avgDaily: 0 };
            }
        }

        /**
         * Calculate reorder recommendation based on business logic
         */
        function calculateReorderRecommendation(itemData) {
            var recommendation = {
                shouldReorder: false,
                orderQty: 0,
                daysUntilStockout: 999,
                urgencyLevel: 'OK',
                reason: ''
            };
            
            // Calculate days until stockout based on average daily usage
            if (itemData.avgDailyUsage > 0) {
                recommendation.daysUntilStockout = Math.floor(itemData.qtyAvailable / itemData.avgDailyUsage);
            }
            
            // Reorder Logic:
            // 1. Below reorder point AND has recent sales
            // 2. Has backorders
            // 3. Will stockout within lead time
            
            var needsReorder = false;
            var reasons = [];
            
            // Check 1: Below reorder point
            if (itemData.reorderPoint > 0 && itemData.qtyAvailable <= itemData.reorderPoint) {
                if (itemData.velocity30Days > 0) {
                    needsReorder = true;
                    reasons.push('Below reorder point (' + itemData.reorderPoint + ')');
                }
            }
            
            // Check 2: Has backorders
            if (itemData.qtyBackordered > 0) {
                needsReorder = true;
                reasons.push('Has ' + itemData.qtyBackordered + ' backordered');
            }
            
            // Check 3: Will stockout within lead time
            if (itemData.vendorLeadTime > 0 && recommendation.daysUntilStockout < itemData.vendorLeadTime) {
                if (itemData.velocity30Days > 0) {
                    needsReorder = true;
                    reasons.push('Will stockout in ' + recommendation.daysUntilStockout + ' days (lead time: ' + itemData.vendorLeadTime + ' days)');
                }
            }
            
            recommendation.shouldReorder = needsReorder;
            recommendation.reason = reasons.join('; ');
            
            if (needsReorder) {
                // Calculate order quantity
                // Target: PreferredStockLevel
                // Account for: Current Available + On Order - Backorders
                var targetQty = itemData.preferredStockLevel || (itemData.reorderPoint * 2) || (itemData.avgDailyUsage * (itemData.vendorLeadTime + 30));
                var netAvailable = itemData.qtyAvailable + itemData.qtyOnOrder - itemData.qtyBackordered;
                
                recommendation.orderQty = Math.max(0, Math.ceil(targetQty - netAvailable));
                
                // Determine urgency
                if (itemData.qtyBackordered > 0) {
                    recommendation.urgencyLevel = 'CRITICAL';
                } else if (recommendation.daysUntilStockout < 7) {
                    recommendation.urgencyLevel = 'HIGH';
                } else if (recommendation.daysUntilStockout < 14) {
                    recommendation.urgencyLevel = 'MEDIUM';
                } else {
                    recommendation.urgencyLevel = 'LOW';
                }
            }
            
            return recommendation;
        }

        /**
         * reduce stage
         * Group items by vendor for easier PO creation
         */
        function reduce(context) {
            try {
                var vendorId = context.key;
                var items = [];
                
                // Collect all items for this vendor
                context.values.forEach(function(value) {
                    var itemData = JSON.parse(value);
                    items.push(itemData);
                });
                
                // Sort by urgency and item ID
                items.sort(function(a, b) {
                    var urgencyOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4, 'OK': 5 };
                    var urgencyDiff = urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
                    
                    if (urgencyDiff !== 0) return urgencyDiff;
                    return a.itemId.localeCompare(b.itemId);
                });
                
                // Write grouped items
                context.write({
                    key: vendorId,
                    value: {
                        vendorId: vendorId,
                        vendorName: items[0].vendor,
                        itemCount: items.length,
                        items: items
                    }
                });
                
            } catch (e) {
                log.error('reduce Error', 'VendorId: ' + context.key + ', Error: ' + e.toString());
            }
        }

        /**
         * summarize stage
         * Generate CSV report and email to purchasing team
         */
        function summarize(context) {
            log.audit('summarize', 'Starting summary phase');
            
            var csvContent = '';
            var totalItems = 0;
            var criticalCount = 0;
            var highCount = 0;
            var mediumCount = 0;
            var lowCount = 0;
            var totalOrderValue = 0;
            
            // CSV Header
            csvContent += 'Urgency,Item ID,Item Name,Location,Vendor,Qty Available,Qty On Hand,Qty On Order,Qty Backordered,';
            csvContent += 'Reorder Point,Preferred Stock Level,Recommended Order Qty,Unit Cost,Total Cost,';
            csvContent += '30-Day Sales,90-Day Sales,Avg Daily Usage,Days Until Stockout,Lead Time,Reason\n';
            
            // Process all reduce stage outputs
            context.output.iterator().each(function(key, value) {
                var vendorData = JSON.parse(value);
                
                vendorData.items.forEach(function(item) {
                    totalItems++;
                    
                    // Count by urgency
                    switch(item.urgencyLevel) {
                        case 'CRITICAL': criticalCount++; break;
                        case 'HIGH': highCount++; break;
                        case 'MEDIUM': mediumCount++; break;
                        case 'LOW': lowCount++; break;
                    }
                    
                    // Calculate order value
                    var unitCost = item.vendorCost || item.averageCost || item.cost || 0;
                    var orderValue = item.recommendedOrderQty * unitCost;
                    totalOrderValue += orderValue;
                    
                    // Build CSV row
                    var row = [
                        item.urgencyLevel,
                        '"' + item.itemId + '"',
                        '"' + item.displayName + '"',
                        '"' + item.location + '"',
                        '"' + item.vendor + '"',
                        item.qtyAvailable,
                        item.qtyOnHand,
                        item.qtyOnOrder,
                        item.qtyBackordered,
                        item.reorderPoint,
                        item.preferredStockLevel,
                        item.recommendedOrderQty,
                        unitCost.toFixed(2),
                        orderValue.toFixed(2),
                        item.velocity30Days,
                        item.velocity90Days,
                        item.avgDailyUsage.toFixed(2),
                        item.daysUntilStockout,
                        item.vendorLeadTime,
                        '"' + item.reason + '"'
                    ].join(',');
                    
                    csvContent += row + '\n';
                });
                
                return true; // Continue iteration
            });
            
            // Log any errors from map/reduce stages
            if (context.inputSummary.error) {
                log.error('Input Error', context.inputSummary.error);
            }
            
            context.mapSummary.errors.iterator().each(function(key, error) {
                log.error('Map Error', 'Key: ' + key + ', Error: ' + error);
                return true;
            });
            
            context.reduceSummary.errors.iterator().each(function(key, error) {
                log.error('Reduce Error', 'Key: ' + key + ', Error: ' + error);
                return true;
            });
            
            // Create and save CSV file
            var csvFile = file.create({
                name: 'Inventory_Reorder_Analysis_' + getDateString() + '.csv',
                fileType: file.Type.CSV,
                contents: csvContent,
                folder: getFolderId() // Replace with your folder ID
            });
            
            var fileId = csvFile.save();
            log.audit('CSV Created', 'File ID: ' + fileId);
            
            // Send email to purchasing team
            sendEmailReport(fileId, totalItems, criticalCount, highCount, mediumCount, lowCount, totalOrderValue);
            
            log.audit('summarize Complete', {
                totalItems: totalItems,
                critical: criticalCount,
                high: highCount,
                medium: mediumCount,
                low: lowCount,
                totalValue: '$' + totalOrderValue.toFixed(2)
            });
        }

        /**
         * Send email report to purchasing team
         */
        function sendEmailReport(fileId, totalItems, criticalCount, highCount, mediumCount, lowCount, totalOrderValue) {
            try {
                var script = runtime.getCurrentScript();
                var recipientEmail = script.getParameter({ name: 'custscript_reorder_email_recipient' }) || 'purchasing@yourcompany.com';
                
                var emailBody = '<h2>Daily Inventory Reorder Analysis</h2>';
                emailBody += '<p>Report Date: ' + getDateString() + '</p>';
                emailBody += '<h3>Summary:</h3>';
                emailBody += '<ul>';
                emailBody += '<li><strong>Total Items Needing Attention:</strong> ' + totalItems + '</li>';
                emailBody += '<li><strong style="color: red;">Critical Items:</strong> ' + criticalCount + '</li>';
                emailBody += '<li><strong style="color: orange;">High Priority:</strong> ' + highCount + '</li>';
                emailBody += '<li><strong style="color: #FFD700;">Medium Priority:</strong> ' + mediumCount + '</li>';
                emailBody += '<li><strong>Low Priority:</strong> ' + lowCount + '</li>';
                emailBody += '<li><strong>Total Recommended Order Value:</strong> $' + totalOrderValue.toFixed(2) + '</li>';
                emailBody += '</ul>';
                emailBody += '<p>Please see the attached CSV file for detailed recommendations.</p>';
                emailBody += '<p><em>This report includes items that need reordering based on reorder points, sales velocity, and lead times.</em></p>';
                
                email.send({
                    author: -5, // System administrator
                    recipients: recipientEmail,
                    subject: 'Daily Inventory Reorder Analysis - ' + totalItems + ' Items Need Attention',
                    body: emailBody,
                    attachments: [file.load({ id: fileId })]
                });
                
                log.audit('Email Sent', 'Sent to: ' + recipientEmail);
                
            } catch (e) {
                log.error('sendEmailReport Error', e.toString());
            }
        }

        /**
         * Get folder ID for saving reports
         * TODO: Replace with your actual folder ID
         */
        function getFolderId() {
            // Option 1: Create a folder called "Inventory Reports" in File Cabinet
            // and put its internal ID here
            return 5861173; // REPLACE WITH YOUR FOLDER ID
            
            // Option 2: Search for folder by name
            // var folderSearch = search.create({
            //     type: 'folder',
            //     filters: [['name', 'is', 'Inventory Reports']],
            //     columns: ['internalid']
            // });
            // var folderId = null;
            // folderSearch.run().each(function(result) {
            //     folderId = result.id;
            //     return false;
            // });
            // return folderId || -15; // -15 is SuiteScripts folder
        }

        /**
         * Get current date as string (YYYY-MM-DD)
         */
        function getDateString() {
            var today = new Date();
            var year = today.getFullYear();
            var month = String(today.getMonth() + 1).padStart(2, '0');
            var day = String(today.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });