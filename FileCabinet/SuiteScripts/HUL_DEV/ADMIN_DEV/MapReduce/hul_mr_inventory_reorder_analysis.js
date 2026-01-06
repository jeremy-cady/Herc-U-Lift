/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * HUL - Inventory Reorder Analysis
 *
 * Purpose: Analyze all inventory items and generate reorder recommendations
 * Handles: >5000 items via two-stage query architecture (items first, then locations per item)
 * Schedule: Daily at 2:00 AM Central Time
 * Output: CSV file + Email to purchasing team
 *
 * Business Logic:
 * - Reorder if: QuantityAvailable < ReorderPoint AND recent sales velocity > 0
 * - Suggested Order Qty: PreferredStockLevel - QuantityAvailable - QuantityOnOrder
 * - Consider lead time and vendor in recommendations
 * - Shows ALL locations (Central + Van) for items needing reorder at ANY location
 * - Includes Central Summary showing warehouse inventory for items being reordered
 *
 * Location Types:
 * - Central: Main warehouses (IDs 2-15, names don't start with "Van")
 * - Van: Mobile/field locations (IDs 102+, names start with "Van")
 *
 * TEST MODE: Currently filtered to Mitsubishi category (internal ID = 1)
 * Remove category filter before production deployment
 *
 * @see Documentation/PRDs/PRD-20251125-InventoryReorderAnalysis.md
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
                        'AND',
                        // TEST MODE: Filter by Item Category - 1000 Mitsubishi (internal ID = 1)
                        ['custitem_sna_hul_itemcategory', 'anyof', '1']
                        // Single item filter removed - now testing full category with limit
                    ],
                    columns: [
                        search.createColumn({ name: 'itemid', sort: search.Sort.ASC }),
                        search.createColumn({ name: 'displayname' }),
                        search.createColumn({ name: 'type' }),

                        // Item costs (location data queried separately in map stage)
                        search.createColumn({ name: 'cost' }),
                        search.createColumn({ name: 'averagecost' }),
                        search.createColumn({ name: 'lastpurchaseprice' })
                    ]
                });
                
                // PRODUCTION MODE: Return search object directly
                // Map/Reduce automatically handles pagination for >4000 results
                log.audit('Search Created', 'Returning search object for Map/Reduce pagination');
                return inventorySearch;
                
            } catch (e) {
                log.error('getInputData Error', 'Error: ' + e.toString());
                throw e;
            }
        }

        /**
         * map stage
         * Process each item: query location data, calculate reorder recommendations
         * Keys by itemId so reduce can check if ANY location needs reorder
         * Outputs ALL locations for later filtering in reduce stage
         *
         * Two-stage query architecture:
         * - getInputData returns unique items only (no location columns)
         * - map queries location data per item to avoid timeout
         */
        function map(context) {
            try {
                var searchResult = JSON.parse(context.value);
                var itemInternalId = searchResult.id;
                var itemId = searchResult.values.itemid;
                var displayName = searchResult.values.displayname;

                // Item-level costs from getInputData
                var cost = parseFloat(searchResult.values.cost) || 0;
                var averageCost = parseFloat(searchResult.values.averagecost) || 0;
                var lastPurchasePrice = parseFloat(searchResult.values.lastpurchaseprice) || 0;

                // Get vendor info (1 search per item)
                var vendorInfo = getPreferredVendor(itemInternalId);

                // Get location-specific inventory data (1 search per item)
                var locations = getLocationInventory(itemInternalId);

                // If no locations found, skip this item
                if (!locations || locations.length === 0) {
                    log.debug('map', 'No locations found for item: ' + itemId);
                    return;
                }

                // Calculate sales velocity ONCE per item (not per location) to stay within governance
                // Pass null for locationId to get item-level velocity across all locations
                var salesVelocity = calculateSalesVelocity(itemInternalId, null);

                // Process each location for this item
                locations.forEach(function(loc) {
                    // Build item data for this location
                    var itemData = {
                        id: itemInternalId,
                        itemId: itemId,
                        displayName: displayName,
                        location: loc.locationName,
                        locationId: loc.locationId,
                        isCentralLocation: loc.isCentralLocation,

                        // Quantities from location search
                        qtyAvailable: loc.qtyAvailable,
                        qtyOnHand: loc.qtyOnHand,
                        qtyOnOrder: loc.qtyOnOrder,
                        qtyCommitted: loc.qtyCommitted,
                        qtyBackordered: loc.qtyBackordered,

                        // Reorder parameters from location search
                        reorderPoint: loc.reorderPoint,
                        preferredStockLevel: loc.preferredStockLevel,

                        // Costs from item-level
                        cost: cost,
                        averageCost: averageCost,
                        lastPurchasePrice: lastPurchasePrice,

                        // Vendor info
                        vendor: vendorInfo.name,
                        vendorId: vendorInfo.id,
                        vendorLeadTime: vendorInfo.leadTime,
                        vendorCost: vendorInfo.cost,

                        // Sales velocity
                        velocity30Days: salesVelocity.days30,
                        velocity90Days: salesVelocity.days90,
                        avgDailyUsage: salesVelocity.avgDaily
                    };

                    // Calculate reorder recommendation for this location
                    var recommendation = calculateReorderRecommendation(itemData);
                    itemData.shouldReorder = recommendation.shouldReorder;
                    itemData.recommendedOrderQty = recommendation.orderQty;
                    itemData.daysUntilStockout = recommendation.daysUntilStockout;
                    itemData.urgencyLevel = recommendation.urgencyLevel;
                    itemData.reason = recommendation.reason;

                    // Key by itemId (internal ID) so reduce can collect all locations for this item
                    context.write({
                        key: itemInternalId,
                        value: itemData
                    });
                });

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
         * Get location-specific inventory data for an item
         * Returns array of location objects with inventory quantities
         */
        function getLocationInventory(itemId) {
            var locations = [];

            try {
                var locationSearch = search.create({
                    type: 'item',
                    filters: [
                        ['internalid', 'anyof', itemId]
                    ],
                    columns: [
                        'inventorylocation',
                        'locationquantityavailable',
                        'locationquantityonhand',
                        'locationquantityonorder',
                        'locationquantitycommitted',
                        'locationquantitybackordered',
                        'locationreorderpoint',
                        'locationpreferredstocklevel'
                    ]
                });

                locationSearch.run().each(function(result) {
                    var locationName = result.getText('inventorylocation') || 'No Location';
                    var locationId = result.getValue('inventorylocation');

                    if (locationId) {
                        locations.push({
                            locationId: locationId,
                            locationName: locationName,
                            isCentralLocation: !locationName.toLowerCase().startsWith('van'),
                            qtyAvailable: parseFloat(result.getValue('locationquantityavailable')) || 0,
                            qtyOnHand: parseFloat(result.getValue('locationquantityonhand')) || 0,
                            qtyOnOrder: parseFloat(result.getValue('locationquantityonorder')) || 0,
                            qtyCommitted: parseFloat(result.getValue('locationquantitycommitted')) || 0,
                            qtyBackordered: parseFloat(result.getValue('locationquantitybackordered')) || 0,
                            reorderPoint: parseFloat(result.getValue('locationreorderpoint')) || 0,
                            preferredStockLevel: parseFloat(result.getValue('locationpreferredstocklevel')) || 0
                        });
                    }
                    return true;
                });

            } catch (e) {
                log.error('getLocationInventory Error', 'ItemId: ' + itemId + ', Error: ' + e.toString());
            }

            return locations;
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
         * For each item, check if ANY location needs reorder
         * If yes, output ALL locations for this item (including Central)
         */
        function reduce(context) {
            try {
                var itemInternalId = context.key;
                var locations = [];
                var needsReorderAnywhere = false;
                var centralSummary = {
                    totalQtyAvailable: 0,
                    totalQtyOnHand: 0,
                    locations: []
                };

                // Collect all locations for this item
                context.values.forEach(function(value) {
                    var locationData = JSON.parse(value);
                    locations.push(locationData);

                    // Check if this location needs reorder
                    if (locationData.shouldReorder || locationData.qtyBackordered > 0 || locationData.urgencyLevel !== 'OK') {
                        needsReorderAnywhere = true;
                        log.debug('Location Needs Reorder', {
                            itemId: locationData.itemId,
                            location: locationData.location,
                            shouldReorder: locationData.shouldReorder,
                            qtyBackordered: locationData.qtyBackordered,
                            urgencyLevel: locationData.urgencyLevel,
                            reason: locationData.reason
                        });
                    }

                    // Build Central summary
                    if (locationData.isCentralLocation) {
                        centralSummary.totalQtyAvailable += locationData.qtyAvailable;
                        centralSummary.totalQtyOnHand += locationData.qtyOnHand;
                        if (locationData.qtyAvailable > 0 || locationData.qtyOnHand > 0) {
                            centralSummary.locations.push({
                                name: locationData.location,
                                qtyAvailable: locationData.qtyAvailable,
                                qtyOnHand: locationData.qtyOnHand
                            });
                        }
                    }
                });

                // Log reduce summary for debugging
                log.debug('Reduce Summary', {
                    itemInternalId: itemInternalId,
                    itemId: locations[0] ? locations[0].itemId : 'unknown',
                    locationCount: locations.length,
                    needsReorderAnywhere: needsReorderAnywhere,
                    centralQtyAvailable: centralSummary.totalQtyAvailable
                });

                // Only output if at least one location needs reorder
                if (needsReorderAnywhere) {
                    // Sort locations: Central first (alphabetically), then Van (by urgency then name)
                    locations.sort(function(a, b) {
                        // Central locations first
                        if (a.isCentralLocation && !b.isCentralLocation) return -1;
                        if (!a.isCentralLocation && b.isCentralLocation) return 1;

                        // Within same type, sort by urgency then location name
                        var urgencyOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4, 'OK': 5 };
                        var urgencyDiff = urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
                        if (urgencyDiff !== 0) return urgencyDiff;

                        return a.location.localeCompare(b.location);
                    });

                    // Get item-level info from first location
                    var firstLoc = locations[0];

                    // Write item with all its locations
                    context.write({
                        key: itemInternalId,
                        value: {
                            itemInternalId: itemInternalId,
                            itemId: firstLoc.itemId,
                            displayName: firstLoc.displayName,
                            vendor: firstLoc.vendor,
                            vendorId: firstLoc.vendorId,
                            vendorLeadTime: firstLoc.vendorLeadTime,
                            vendorCost: firstLoc.vendorCost,
                            averageCost: firstLoc.averageCost,
                            cost: firstLoc.cost,
                            centralSummary: centralSummary,
                            locations: locations
                        }
                    });
                }

            } catch (e) {
                log.error('reduce Error', 'ItemId: ' + context.key + ', Error: ' + e.toString());
            }
        }

        /**
         * summarize stage
         * Generate CSV report and email to purchasing team
         * Includes Central Summary showing warehouse inventory for items being reordered
         */
        function summarize(context) {
            log.audit('summarize', 'Starting summary phase');

            // Log map/reduce statistics
            log.audit('Map/Reduce Stats', {
                mapKeys: context.mapSummary.keys,
                reduceKeys: context.reduceSummary.keys
            });

            var csvContent = '';
            var totalUniqueItems = 0;
            var totalLocationRows = 0;
            var criticalCount = 0;
            var highCount = 0;
            var mediumCount = 0;
            var lowCount = 0;
            var okCount = 0;
            var totalOrderValue = 0;

            // Central Summary tracking
            var centralSummaryData = [];

            // CSV Header - added Location Type and Central Inventory columns
            csvContent += 'Location Type,Urgency,Item ID,Item Name,Location,Vendor,Qty Available,Qty On Hand,Qty On Order,Qty Backordered,';
            csvContent += 'Reorder Point,Preferred Stock Level,Recommended Order Qty,Unit Cost,Total Cost,';
            csvContent += '30-Day Sales,90-Day Sales,Avg Daily Usage,Days Until Stockout,Lead Time,Central Qty Available,Reason\n';

            // Process all reduce stage outputs (now keyed by itemId)
            context.output.iterator().each(function(key, value) {
                var itemData = JSON.parse(value);
                totalUniqueItems++;

                // Track Central Summary for this item
                if (itemData.centralSummary && itemData.centralSummary.totalQtyAvailable > 0) {
                    centralSummaryData.push({
                        itemId: itemData.itemId,
                        displayName: itemData.displayName,
                        centralQtyAvailable: itemData.centralSummary.totalQtyAvailable,
                        centralQtyOnHand: itemData.centralSummary.totalQtyOnHand,
                        centralLocations: itemData.centralSummary.locations
                    });
                }

                var unitCost = itemData.vendorCost || itemData.averageCost || itemData.cost || 0;
                var centralQtyAvailable = itemData.centralSummary ? itemData.centralSummary.totalQtyAvailable : 0;

                // Output each location for this item
                itemData.locations.forEach(function(loc) {
                    totalLocationRows++;

                    // Count by urgency (only count non-OK for urgency stats)
                    switch(loc.urgencyLevel) {
                        case 'CRITICAL': criticalCount++; break;
                        case 'HIGH': highCount++; break;
                        case 'MEDIUM': mediumCount++; break;
                        case 'LOW': lowCount++; break;
                        case 'OK': okCount++; break;
                    }

                    // Calculate order value (only for locations that need reorder)
                    var orderValue = loc.recommendedOrderQty * unitCost;
                    if (loc.shouldReorder) {
                        totalOrderValue += orderValue;
                    }

                    // Build CSV row
                    var locationType = loc.isCentralLocation ? 'Central' : 'Van';
                    var row = [
                        locationType,
                        loc.urgencyLevel,
                        '"' + loc.itemId + '"',
                        '"' + loc.displayName + '"',
                        '"' + loc.location + '"',
                        '"' + loc.vendor + '"',
                        loc.qtyAvailable,
                        loc.qtyOnHand,
                        loc.qtyOnOrder,
                        loc.qtyBackordered,
                        loc.reorderPoint,
                        loc.preferredStockLevel,
                        loc.recommendedOrderQty,
                        unitCost.toFixed(2),
                        orderValue.toFixed(2),
                        loc.velocity30Days,
                        loc.velocity90Days,
                        loc.avgDailyUsage.toFixed(2),
                        loc.daysUntilStockout,
                        loc.vendorLeadTime,
                        centralQtyAvailable,
                        '"' + (loc.reason || '') + '"'
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
                folder: getFolderId()
            });

            var fileId = csvFile.save();

            // Load the saved file to get the URL for easy download
            var savedFile = file.load({ id: fileId });
            var fileUrl = savedFile.url;

            log.audit('CSV Created', {
                fileId: fileId,
                fileName: savedFile.name,
                fileUrl: fileUrl,
                downloadLink: 'https://system.netsuite.com' + fileUrl
            });

            // Send email to purchasing team with Central Summary
            var emailStats = {
                totalUniqueItems: totalUniqueItems,
                totalLocationRows: totalLocationRows,
                criticalCount: criticalCount,
                highCount: highCount,
                mediumCount: mediumCount,
                lowCount: lowCount,
                okCount: okCount,
                totalOrderValue: totalOrderValue,
                centralSummaryData: centralSummaryData
            };
            sendEmailReport(fileId, emailStats);

            log.audit('summarize Complete', {
                uniqueItems: totalUniqueItems,
                locationRows: totalLocationRows,
                critical: criticalCount,
                high: highCount,
                medium: mediumCount,
                low: lowCount,
                ok: okCount,
                totalValue: '$' + totalOrderValue.toFixed(2)
            });
        }

        /**
         * Send email report to purchasing team
         * Includes Central Summary section showing warehouse inventory for items being reordered
         */
        function sendEmailReport(fileId, stats) {
            try {
                var script = runtime.getCurrentScript();
                var recipientEmail = script.getParameter({ name: 'custscript_reorder_email_recipient' }) || 'purchasing@yourcompany.com';
                var senderEmployeeId = script.getParameter({ name: 'custscript_reorder_sender' });

                // Calculate locations needing attention (non-OK)
                var locationsNeedingAttention = stats.criticalCount + stats.highCount + stats.mediumCount + stats.lowCount;

                var emailBody = '<html><body style="font-family: Arial, sans-serif;">';
                emailBody += '<h2 style="color: #333;">Daily Inventory Reorder Analysis</h2>';
                emailBody += '<p>Report Date: ' + getDateString() + '</p>';

                // Summary Section
                emailBody += '<h3 style="color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Summary</h3>';
                emailBody += '<table style="border-collapse: collapse; margin-bottom: 20px;">';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong>Unique Items Needing Attention:</strong></td><td>' + stats.totalUniqueItems + '</td></tr>';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong>Total Location Rows:</strong></td><td>' + stats.totalLocationRows + '</td></tr>';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong style="color: #dc3545;">Critical (Backorders):</strong></td><td style="color: #dc3545;">' + stats.criticalCount + '</td></tr>';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong style="color: #fd7e14;">High Priority (&lt;7 days):</strong></td><td style="color: #fd7e14;">' + stats.highCount + '</td></tr>';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong style="color: #ffc107;">Medium Priority (7-14 days):</strong></td><td style="color: #ffc107;">' + stats.mediumCount + '</td></tr>';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong>Low Priority:</strong></td><td>' + stats.lowCount + '</td></tr>';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong style="color: #28a745;">OK (No Reorder Needed):</strong></td><td style="color: #28a745;">' + stats.okCount + '</td></tr>';
                emailBody += '<tr><td style="padding: 5px 15px 5px 0;"><strong>Total Recommended Order Value:</strong></td><td><strong>$' + stats.totalOrderValue.toFixed(2) + '</strong></td></tr>';
                emailBody += '</table>';

                // Central Summary Section
                if (stats.centralSummaryData && stats.centralSummaryData.length > 0) {
                    emailBody += '<h3 style="color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Central Warehouse Inventory</h3>';
                    emailBody += '<p style="color: #666; font-size: 12px;">Items below need reordering at Van locations but have inventory available at Central warehouses.</p>';
                    emailBody += '<table style="border-collapse: collapse; width: 100%; max-width: 600px; font-size: 12px;">';
                    emailBody += '<tr style="background-color: #f8f9fa;">';
                    emailBody += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item ID</th>';
                    emailBody += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item Name</th>';
                    emailBody += '<th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Central Qty Available</th>';
                    emailBody += '</tr>';

                    // Sort by qty available descending
                    stats.centralSummaryData.sort(function(a, b) {
                        return b.centralQtyAvailable - a.centralQtyAvailable;
                    });

                    // Show top 20 items with Central inventory
                    var maxItems = Math.min(stats.centralSummaryData.length, 20);
                    for (var i = 0; i < maxItems; i++) {
                        var item = stats.centralSummaryData[i];
                        emailBody += '<tr>';
                        emailBody += '<td style="border: 1px solid #ddd; padding: 8px;">' + item.itemId + '</td>';
                        emailBody += '<td style="border: 1px solid #ddd; padding: 8px;">' + item.displayName + '</td>';
                        emailBody += '<td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold; color: #28a745;">' + item.centralQtyAvailable + '</td>';
                        emailBody += '</tr>';
                    }
                    emailBody += '</table>';

                    if (stats.centralSummaryData.length > 20) {
                        emailBody += '<p style="color: #666; font-size: 12px;">...and ' + (stats.centralSummaryData.length - 20) + ' more items with Central inventory. See attached CSV for full list.</p>';
                    }
                }

                emailBody += '<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">';
                emailBody += '<p>Please see the attached CSV file for detailed recommendations.</p>';
                emailBody += '<p style="color: #666; font-size: 12px;"><em>This report shows ALL locations (Central + Van) for items that need reordering at ANY location. ';
                emailBody += 'Use the "Location Type" and "Central Qty Available" columns to identify transfer opportunities before ordering.</em></p>';
                emailBody += '</body></html>';

                // Use sender employee ID if configured, otherwise fall back to -5
                var authorId = senderEmployeeId ? parseInt(senderEmployeeId, 10) : -5;

                email.send({
                    author: authorId,
                    recipients: recipientEmail,
                    subject: 'Daily Inventory Reorder Analysis - ' + stats.totalUniqueItems + ' Items, ' + locationsNeedingAttention + ' Locations Need Attention',
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
         * Uses script parameter if configured, otherwise searches for "Inventory Reports" folder
         */
        function getFolderId() {
            var script = runtime.getCurrentScript();

            // Option 1: Use script parameter if configured
            var paramFolderId = script.getParameter({ name: 'custscript_reorder_folder' });
            if (paramFolderId) {
                return parseInt(paramFolderId, 10);
            }

            // Option 2: Search for folder by name
            try {
                var folderSearch = search.create({
                    type: 'folder',
                    filters: [['name', 'is', 'Inventory Reports']],
                    columns: ['internalid']
                });
                var folderId = null;
                folderSearch.run().each(function(result) {
                    folderId = result.id;
                    return false;
                });

                if (folderId) {
                    log.audit('getFolderId', 'Found "Inventory Reports" folder: ' + folderId);
                    return folderId;
                }
            } catch (e) {
                log.error('getFolderId Search Error', e.toString());
            }

            // Option 3: Fall back to SuiteScripts folder
            log.audit('getFolderId', 'Using SuiteScripts folder as fallback');
            return -15; // -15 is SuiteScripts folder
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