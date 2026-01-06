/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author sdesilva
 * 
 * Script brief description: 
 * User event script deployed to Van Bin Assignment to validate Item and Location
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2023/06/16                       mdesilva         Initial version
 * 
 */
define(['N/search', 'N/record', 'N/currentRecord'],
    function(search, record, currentRecord) {
    function beforeSubmit(context) {
        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
            var currentRecord = context.newRecord;
            var itemId = currentRecord.getValue({
                fieldId: 'custrecord_sna_vba_item'
            });
			
            var locationId = currentRecord.getValue({
                fieldId: 'custrecord_sna_vba_loc'
            });
			var locationName = search.lookupFields({
                type: 'location',
                id: locationId,
                columns: ['name']
            });
			log.debug("locationId","locationId: "+ locationId);			
			var itemName = search.lookupFields({
                type: 'item',
                id: itemId,
                columns: ['itemid']
            });

            // Load existing Van Bin records for the item
            var existingRecords = loadVanBinRecords(itemId, locationId);
			log.debug("existingRecords","existingRecords count: "+ existingRecords);
			if(!isEmpty(existingRecords)){
				throw new Error('Location ' + locationName.name + ' is already set for item ' + itemName.itemid + ' in another Van Bin Assignement record.');
			}         
        }
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
        beforeSubmit: beforeSubmit
    };

});