/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author mdesilva
 *
 * Script brief description:
 * Client script deployed on Item record to validate Van Bin Assignment sublist

 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2023/06/15                       mdesilva         Initial version
 * 
 *
 */
define(['N/record', 'N/ui/dialog', 'N/search'],
    function(record, dialog, search, runtime) {
		
        function validateLine(context) {
			var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;

            if (sublistName === 'recmachcustrecord_sna_vba_item') {
				var itemId = currentRecord.getCurrentSublistValue({
					sublistId: 'recmachcustrecord_sna_vba_item',
					fieldId: 'custrecord_sna_vba_item'	
	            });
				var locationId = currentRecord.getCurrentSublistValue({
					sublistId: 'recmachcustrecord_sna_vba_item',
					fieldId: 'custrecord_sna_vba_loc'
	            });
				
				var locationName = search.lookupFields({
					type: 'location',
					id: locationId,
					columns: ['name']
				});	
				var itemName = search.lookupFields({
					type: 'item',
					id: itemId,
					columns: ['itemid']
				});
				
				
				var existingRecords = loadVanBinRecords(itemId, locationId);
				log.debug("existingRecords","existingRecords count: "+ existingRecords);
                
				if(!isEmpty(existingRecords)){				
					dialog.alert({
						title: 'Existing Record Found',
						message: 'Location ' + locationName.name + ' is already set for item ' + itemName.itemid +'.'
					});
					return false; 
				}
				
				return true;
            }
          return true;

            
        }
		
		function loadVanBinRecords(itemId, locationId) {
			var customrecord_sna_van_bin_assignmentSearchObj = search.create({
				type: "customrecord_sna_van_bin_assignment",
				filters: [
					["custrecord_sna_vba_item", "anyof", itemId],
					"AND",
					["custrecord_sna_vba_loc", "anyof", locationId]
				],
				columns: [
					"internalid"
				]
			});
			var searchResultCount = customrecord_sna_van_bin_assignmentSearchObj.runPaged().count;
			//log.debug("customrecord_sna_van_bin_assignmentSearchObj","result count: "+ searchResultCount);
			//customrecord_sna_van_bin_assignmentSearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			//return true;
			//});
			return searchResultCount;
		}

        function isEmpty(stValue) {
            return ((stValue == 0 || stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {
            validateLine: validateLine,
            validateInsert: validateLine
            //saveRecord: saveRecord
        };
    });