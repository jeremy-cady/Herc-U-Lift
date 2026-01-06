/**
 * @NApiVersion 2.0
 * @NScriptType WorkflowActionScript
 */
/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author sdesilva
 *
 * Script brief description:
 * WFA script to reopen a Case if the service bucket is from Part going to 3
 *
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2025/01/009                           mdesilva       Initial version
 * 
 *
 */
define(['N/record', 'N/log'], function(record, log) {
    function onAction(context) {
        try {
            var salesOrder = context.newRecord;
            var serviceBucket = salesOrder.getValue('custbody_sna_hul_service_bucket_');
			log.debug('serviceBucket', 'serviceBucket: '+serviceBucket);

            if (serviceBucket == 1) { //1 internal ID of PARTS
                var caseId = salesOrder.getValue('custbody_nx_case');

                if (caseId) {
                    record.submitFields({
                        type: 'supportcase',
                        id: caseId,
                        values: {
                            status: 4
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                }
				
                /*record.submitFields({
                    type: 'salesorder',
                    id: salesOrder.id,
                    values: {
                        custbody_sna_hul_case_closed: false
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });**/
				salesOrder.setValue({
                    fieldId: 'custbody_sna_hul_case_closed',
                    value: false
                });
            }
        } catch (error) {
            log.error('Error in Workflow Action Script', error);
        }
    }

    return {
        onAction: onAction
    };
});
