/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 08/04/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as log from 'N/log';

/**
* Function definition to be triggered before record is loaded.
*
* @param {Object} ctx
* @param {Record} ctx.newRecord - New record
* @param {string} ctx.type - Trigger type
* @param {Form} ctx.form - Form
* @Since 2015.2
*/
function beforeSubmit(ctx: EntryPoints.UserEvent.beforeSubmitContext): void {
    try {
        if (ctx.type === ctx.UserEventType.CREATE || ctx.type === ctx.UserEventType.EDIT) {
            const caseRecord = ctx.newRecord;
            const customFormId = String(caseRecord.getValue({ fieldId: 'customform' }));
            log.debug('Custom Form ID', `Current custom form ID: ${customFormId}`);

            // Set the custom form ID in our custom field
            caseRecord.setValue({
                fieldId: 'custevent_hul_custom_form_id',
                value: customFormId
            });

            log.debug('Custom Form ID Set', `Case form ${customFormId} copied to custevent_hul_custom_form_id`);
        }
    } catch (error) {
        log.error('Error in beforeSubmit', error.message);
    }
}

export = {
    beforeSubmit
};