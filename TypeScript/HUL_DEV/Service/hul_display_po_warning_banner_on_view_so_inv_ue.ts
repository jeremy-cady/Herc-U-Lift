/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: Jeremy Cady
* Date: 07/12/
* Version: 1.0
*/

import { EntryPoints } from 'N/types';
import * as message from 'N/ui/message';
import * as log from 'N/log';
import * as search from 'N/search';

/**
* Function definition to be triggered before record is loaded.
*
* @param {Object} ctx
* @param {Record} ctx.newRecord - New record
* @param {string} ctx.type - Trigger type
* @param {Form} ctx.form - Form
* @param {Record} ctx.currentRecord - Current form record
* @Since 2015.2
*/

// create message object for use with addPageInitMessage function
const warningMessage: any = message.create({
    type: message.Type.ERROR,
    title: 'PO is Required for this Customer',
    message: 'Please Enter Purchase Order Number On PO# field'
});

function beforeLoad(ctx: EntryPoints.UserEvent.beforeLoadContext) {
    log.debug('in beforeLoad', ctx.type);
    // check that user event type is 'VIEW'
    if (ctx.type === ctx.UserEventType.VIEW) {
        // declare newRecord to be able to pull field values from SO or Invoice
        const newRecord = ctx.newRecord;
        // get cusotmer ID to check their record for po req field value
        const customerID = newRecord.getValue({ fieldId: 'entity' });
        log.debug('customerID', customerID);
        // get po req value through lookup
        const isPoReq = getPOReqValue(customerID);
        log.debug('isPoReq: ', isPoReq);
        // check to see if there is a value al
        const poNum = newRecord.getValue({ fieldId: 'otherrefnum' });
        log.debug('poNum', poNum);
        // if ispoReq === true && there is no value in PO # field, display message
        if (isPoReq === true && !poNum) {
            ctx.form.addPageInitMessage({
                message: warningMessage
            });
        }
    }

}
// function to get the PO Req field value from customer record via field lookup
const getPOReqValue = function (customerID) {
    log.debug('in getPOReqValue', customerID);
    // build params object
    const lookupFieldsParams = {
        type: 'customer',
        id: customerID,
        columns: ['custentity_sna_hul_po_required']
    };
    // perform field search
    const poReqValue = search.lookupFields(lookupFieldsParams).custentity_sna_hul_po_required;
    log.debug('poReqValue: ', poReqValue);
    // return value for use in conditional
    return poReqValue;
};

export = { beforeLoad };