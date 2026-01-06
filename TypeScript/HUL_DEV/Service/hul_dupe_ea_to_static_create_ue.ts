/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 01/09/2025
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
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
function beforeLoad(ctx: EntryPoints.UserEvent.beforeLoadContext) {
}

/**
* Function definition to be triggered before record is submitted.
*
* @param {Object} ctx
* @param {Record} ctx.newRecord - New record
* @param {Record} ctx.oldRecord - Old record
* @param {string} ctx.type - Trigger type
* @Since 2015.2
*/
function beforeSubmit(ctx: EntryPoints.UserEvent.beforeSubmitContext) {
}

/**
* Function definition to be triggered after a record is submitted.
*
* @param {Object} ctx
* @param {Record} ctx.newRecord - New record
* @param {Record} ctx.oldRecord - Old record
* @param {string} ctx.type - Trigger type
* @Since 2015.2
*/
function afterSubmit(ctx: EntryPoints.UserEvent.afterSubmitContext) {
    try{
        if (ctx.type === ctx.UserEventType.CREATE || ctx.type === ctx.UserEventType.EDIT) {
            // declare record object
            const projectRecord = ctx.newRecord;
            // gather the value from equipment asset field
            const equipmentAssetID: any = projectRecord.getValue({
                fieldId: 'custentity_nxc_project_assets'
            });
            log.debug('equipmentAssetID', equipmentAssetID);
            if (!equipmentAssetID) {
                log.debug('Missing Equipment Asset!', projectRecord.id);
                return;
            }
            const submit = record.submitFields({
                type: record.Type.JOB,
                id: projectRecord.id,
                values: {
                    custentity_hul_nxc_eqiup_asset: `${equipmentAssetID}`
                }
            });
            log.debug('submit', submit);
        }
    } catch (error) {
        log.error('ERROR in afterSubmit', error);
    }
}

export = { beforeLoad, beforeSubmit, afterSubmit };