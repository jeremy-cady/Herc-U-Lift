/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author mdesilva
 *
 * Script brief description:
 * User Event script deployed on PO to source vendor item name.
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2023/02/09                         mdesilva         Initial version
 * 
 *
 */
define(['N/record', 'N/runtime', 'N/search', 'N/https', 'N/render', 'N/email'], function(record, runtime, search, https, render, email) {

    function afterSubmit(context) {
		var LOG_TITLE = 'afterSubmit';
        var scriptContextType = runtime.executionContext;
        log.debug(LOG_TITLE, "scriptContextType: " + scriptContextType +" | context.type: " + context.type);		

        if (context.type === 'specialorder' || context.type ==='dropship') {
			//specialorder dropship            
			var currentRecord = context.newRecord;
			var rectype = currentRecord.type;
			var poInternalId = currentRecord.id;
			log.debug(LOG_TITLE, 'rectype: ' +rectype +' | poInternalId: ' +poInternalId);
			
			
			var objRecord = record.load({
				type: rectype,
				id: poInternalId,
				isDynamic: true
			});

			
			
			var buy_from_vendor = objRecord.getValue({
                fieldId: 'custbody_sna_buy_from'
            });			
			var numLines = objRecord.getLineCount({
				sublistId: 'item'
			});
			log.debug(LOG_TITLE, 'numLines: ' +numLines);
			
			for (var itemIndex = 0; itemIndex < numLines; itemIndex++) {
				var itemID = objRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: itemIndex
				});
				
				if (!isEmpty(itemID) && !isEmpty(buy_from_vendor)) {
                    var customrecord_sna_hul_vendorpriceSearchObj = search.create({
                        type: "customrecord_sna_hul_vendorprice",
                        filters: [
                            ["custrecord_sna_hul_vendor", "anyof", buy_from_vendor],
                            "AND",
                            ["custrecord_sna_hul_item", "anyof", itemID]
                        ],
                        columns: [
                            "custrecord_sna_vendor_item_name2"
                        ]
                    });

                    var vendor_item_name;
                    customrecord_sna_hul_vendorpriceSearchObj.run().each(function(result) {
                        vendor_item_name = result.getValue({
                            name: 'custrecord_sna_vendor_item_name2'
                        });
                        return true;
                    });
                    log.debug(LOG_TITLE, 'buy_from_vendor: ' + buy_from_vendor +' | item: ' +itemID +' | vendor_item_name: ' + vendor_item_name);
                    if (!isEmpty(vendor_item_name)) {
						objRecord.selectLine({
							sublistId: "item",
							line: itemIndex
						});
                        objRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_sna_vendor_item_name',
                            value: vendor_item_name
                        });
						
						
						objRecord.commitLine({sublistId: 'item'});
						
                    }
                } else {
					log.debug(LOG_TITLE, 'item or buy_from_vendor is empty');
				}
			
			}
			objRecord.save();
        }
    }	
	
    function isEmpty(stValue) {
        return ((stValue == 0 || stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    return {
        afterSubmit: afterSubmit
    };
});