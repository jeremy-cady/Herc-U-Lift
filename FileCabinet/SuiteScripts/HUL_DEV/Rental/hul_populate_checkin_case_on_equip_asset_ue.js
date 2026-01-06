/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/01/2025
* Version: 1.0
*/
define(["require", "exports", "N/record", "N/log"], function (require, exports, record, log) {
    "use strict";
    function afterSubmit(ctx) {
        try {
            // Only run on CREATE and EDIT
            if (ctx.type !== ctx.UserEventType.CREATE && ctx.type !== ctx.UserEventType.EDIT) {
                return;
            }
            var caseRecord = ctx.newRecord;
            var caseId_1 = caseRecord.id;
            // Check if case type is '104'
            var caseType = caseRecord.getValue({ fieldId: 'custevent_nx_case_type' });
            if (caseType !== '104') {
                log.debug('Case type check failed', "Case type is ".concat(caseType, ", expected 104"));
                return;
            }
            // Check if status is any of '2', '3', '4', '6'
            var status_1 = caseRecord.getValue({ fieldId: 'status' });
            var validStatuses = ['2', '3', '4', '6'];
            if (validStatuses.indexOf(status_1 === null || status_1 === void 0 ? void 0 : status_1.toString()) === -1) {
                log.debug('Status check failed', "Status is ".concat(status_1, ", expected one of: ").concat(validStatuses.join(', ')));
                return;
            }
            log.debug('All conditions met', "Processing case ".concat(caseId_1));
            // Get related equipment assets
            var equipmentAssets = caseRecord.getValue({ fieldId: 'custevent_nxc_case_assets' });
            if (!equipmentAssets) {
                log.debug('No equipment assets', 'custevent_nxc_case_assets field is empty');
                return;
            }
            // Handle both single asset and multiple assets
            var assetIds = Array.isArray(equipmentAssets) ? equipmentAssets : [equipmentAssets];
            log.debug('Processing assets', "Found ".concat(assetIds.length, " equipment asset(s): ").concat(assetIds.join(', ')));
            // Update each equipment asset record
            assetIds.forEach(function (assetId) {
                try {
                    record.submitFields({
                        type: 'customrecord_nx_asset',
                        id: assetId,
                        values: {
                            custrecord_most_recent_checkin_case: caseId_1
                        }
                    });
                    log.debug('Asset updated', "Successfully updated asset ".concat(assetId, " with case ").concat(caseId_1));
                }
                catch (error) {
                    log.error('Asset update failed', "Failed to update asset ".concat(assetId, ": ").concat(error.message));
                }
            });
        }
        catch (error) {
            log.error('Script execution failed', error.message);
        }
    }
    return {
        afterSubmit: afterSubmit
    };
});
