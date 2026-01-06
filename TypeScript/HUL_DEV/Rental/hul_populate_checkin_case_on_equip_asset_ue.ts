/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/01/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as log from 'N/log';

function afterSubmit(ctx: EntryPoints.UserEvent.afterSubmitContext): void {
    try {
        // Only run on CREATE and EDIT
        if (ctx.type !== ctx.UserEventType.CREATE && ctx.type !== ctx.UserEventType.EDIT) {
            return;
        }

        const caseRecord = ctx.newRecord;
        const caseId = caseRecord.id;

        // Check if case type is '104'
        const caseType = caseRecord.getValue({ fieldId: 'custevent_nx_case_type' });
        if (caseType !== '104') {
            log.debug('Case type check failed', `Case type is ${caseType}, expected 104`);
            return;
        }

        // Check if status is any of '2', '3', '4', '6'
        const status = caseRecord.getValue({ fieldId: 'status' });
        const validStatuses = ['2', '3', '4', '6'];
        if (validStatuses.indexOf(status?.toString()) === -1) {
            log.debug('Status check failed', `Status is ${status}, expected one of: ${validStatuses.join(', ')}`);
            return;
        }

        log.debug('All conditions met', `Processing case ${caseId}`);

        // Get related equipment assets
        const equipmentAssets = caseRecord.getValue({ fieldId: 'custevent_nxc_case_assets' });

        if (!equipmentAssets) {
            log.debug('No equipment assets', 'custevent_nxc_case_assets field is empty');
            return;
        }

        // Handle both single asset and multiple assets
        const assetIds = Array.isArray(equipmentAssets) ? equipmentAssets : [equipmentAssets];

        log.debug('Processing assets', `Found ${assetIds.length} equipment asset(s): ${assetIds.join(', ')}`);

        // Update each equipment asset record
        assetIds.forEach((assetId: string) => {
            try {
                record.submitFields({
                    type: 'customrecord_nx_asset', // Adjust this to your actual equipment asset record type
                    id: assetId,
                    values: {
                        custrecord_most_recent_checkin_case: caseId
                    }
                });

                log.debug('Asset updated', `Successfully updated asset ${assetId} with case ${caseId}`);
            } catch (error) {
                log.error('Asset update failed', `Failed to update asset ${assetId}: ${error.message}`);
            }
        });

    } catch (error) {
        log.error('Script execution failed', error.message);
    }
}

export = {
    afterSubmit
};