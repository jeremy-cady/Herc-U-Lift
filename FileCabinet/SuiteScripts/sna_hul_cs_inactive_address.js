/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Client Script will display a warning message (pop-up) every time the Shipping and/or Billing Address used is marked as inactive.
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2025/01/28                        Care Parba          Initial version
 *
 */
define(['N/record', 'N/search', 'N/currentRecord', 'N/log', 'N/ui/message'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{currentRecord} currentRecord
     * @param{log} log
     * @param{message} message
     */
    function(record, search, currentRecord, log, message) {

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        const identifyInactiveAddress = (scriptContext, stLoggerTitle) => {
            let objCurrentRec = scriptContext.currentRecord;

            let stBillingAddressInternalId = objCurrentRec.getValue({ fieldId: 'billingaddress_key' });
            log.debug({ title: stLoggerTitle, details: { stBillingAddressInternalId } });
            let stShippingAddressInternalId = objCurrentRec.getValue({ fieldId: 'shippingaddress_key' });
            log.debug({ title: stLoggerTitle, details: { stShippingAddressInternalId } });

            let stBothInactiveTitle = 'INACTIVE BILLING ADDRESS AND SHIPPING ADDRESS';
            let stBAInactiveTitle = 'INACTIVE BILLING ADDRESS';
            let stSAInactiveTitle = 'INACTIVE SHIPPING ADDRESS';

            let stBothInactiveMsg = 'Warning! The Billing Address and Shipping Address selected are Inactive.';
            let stBAInactiveMsg = 'Warning! The Billing Address selected is Inactive.';
            let stSAInactiveMsg = 'Warning! The Shipping Address selected is Inactive.';

            let bBAInactive = false;
            let bSAInactive = false;

            if(!isEmpty(stBillingAddressInternalId)) {
                bBAInactive = search.lookupFields({
                    type: "address",
                    id: stBillingAddressInternalId, //stBillingAddressInternalId
                    columns: "custrecord_sn_inactive_address"
                }).custrecord_sn_inactive_address;
            }

            log.debug({ title: stLoggerTitle, details: { bBAInactive } });

            if(!isEmpty(stShippingAddressInternalId)) {
                bSAInactive = search.lookupFields({
                    type: "address",
                    id: stShippingAddressInternalId,
                    columns: "custrecord_sn_inactive_address"
                }).custrecord_sn_inactive_address;
            }

            log.debug({ title: stLoggerTitle, details: { bSAInactive } });

            if(bBAInactive || bSAInactive) {
                let stFinalMsgTitle, stFinalMsg;

                if(bBAInactive && bSAInactive) { // Both Addresses are Inactive
                    stFinalMsgTitle = stBothInactiveTitle;
                    stFinalMsg = stBothInactiveMsg;
                } else if(bBAInactive && !bSAInactive) { // Only Billing Addresses is Inactive
                    stFinalMsgTitle = stBAInactiveTitle;
                    stFinalMsg = stBAInactiveMsg;
                } else if(!bBAInactive && bSAInactive) { // Only Shipping Addresses is Inactive
                    stFinalMsgTitle = stSAInactiveTitle;
                    stFinalMsg = stSAInactiveMsg;
                }

                let objWarningMsg = message.create({
                    title: stFinalMsgTitle,
                    message: stFinalMsg,
                    type: message.Type.WARNING
                });

                alert(stFinalMsg);
                objWarningMsg.show({ duration: 10000 });
            }
        }

        const identifyInactiveAddressCase = (scriptContext, stLoggerTitle) => {
            let objCurrentRec = scriptContext.currentRecord;

            let stNxcServiceAssetId = objCurrentRec.getValue({ fieldId: 'custevent_nx_case_asset' });
            log.debug({ title: stLoggerTitle, details: { stNxcServiceAssetId } });

            let stAddrInactiveTitle = 'INACTIVE NEXTSERVICE ASSET (JOB SITE) ADDRESS';
            let stAddrInactiveMsg = `Warning! The NextService Asset (Job Site)'s Address selected is Inactive.`;
            let bAddrInactive = false;

            if(!isEmpty(stNxcServiceAssetId)) {
                let objNxcAssetLookup = search.lookupFields({
                    type: "customrecord_nx_asset",
                    id: stNxcServiceAssetId,
                    columns: ["custrecord_nx_asset_customer", "custrecord_nx_asset_address"]
                });

                let stCustomerId, stAddressId;

                if(!isEmpty(objNxcAssetLookup)) {
                    if(objNxcAssetLookup.custrecord_nx_asset_customer.length > 0) {
                        stCustomerId = objNxcAssetLookup.custrecord_nx_asset_customer[0].value;
                    }
                    if(objNxcAssetLookup.custrecord_nx_asset_address.length > 0) {
                        stAddressId = objNxcAssetLookup.custrecord_nx_asset_address[0].value;
                    }
                }

                log.debug({ title: stLoggerTitle, details: { stCustomerId } });
                log.debug({ title: stLoggerTitle, details: { stAddressId } });

                if(!isEmpty(stCustomerId)) {
                    log.debug({ title: stLoggerTitle, details: `inside if` });
                    let objCustomerRec = record.load({
                        type: record.Type.CUSTOMER,
                        id: stCustomerId
                    });

                    let iLineCount = objCustomerRec.getLineCount({ sublistId: 'addressbook' });

                    for(let i = 0; i < iLineCount; i++){
                        let stCustAddressId = objCustomerRec.getSublistValue({
                            sublistId: 'addressbook',
                            fieldId: 'addressid',
                            line: i
                        });
                        log.debug({ title: stLoggerTitle, details: { stCustAddressId } });

                        if(stAddressId == stCustAddressId){
                            let stAddressInternalId = objCustomerRec.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'addressbookaddress',
                                line: i
                            });
                            log.debug({ title: stLoggerTitle, details: `before bAddrInactive: ${bAddrInactive}` });
                            bAddrInactive = search.lookupFields({
                                type: "address",
                                id: stAddressInternalId,
                                columns: ["custrecord_sn_inactive_address"]
                            }).custrecord_sn_inactive_address;
                            log.debug({ title: stLoggerTitle, details: `after bAddrInactive: ${bAddrInactive}` });
                            break;
                        }
                    }
                }
            }
            log.debug({ title: stLoggerTitle, details: { bAddrInactive } });
            log.debug({ title: stLoggerTitle, details: `typeof bAddrInactive: ${typeof bAddrInactive}` });

            if(bAddrInactive === true) {
                let objWarningMsg = message.create({
                    title: stAddrInactiveTitle,
                    message: stAddrInactiveMsg,
                    type: message.Type.WARNING
                });

                alert(stAddrInactiveMsg);
                objWarningMsg.show({duration: 100000});
            }

        }

        const pageInit = (scriptContext) => {
            const stLoggerTitle = 'pageInit';

            log.debug({ title: stLoggerTitle, details: `scriptContext.type: ${scriptContext.currentRecord.type}` });

            if(scriptContext.currentRecord.type === 'supportcase'){
                identifyInactiveAddressCase(scriptContext, stLoggerTitle);
            } else {
                identifyInactiveAddress(scriptContext, stLoggerTitle);
            }
        }

        const fieldChanged = (scriptContext) => {
            const stLoggerTitle = 'fieldChanged';
            let stShippingField = scriptContext.fieldId;

            log.debug({ title: stLoggerTitle, details: { stShippingField } });
            log.debug({ title: stLoggerTitle, details: `scriptContext.type: ${scriptContext.currentRecord.type}` });
            if(scriptContext.currentRecord.type === 'supportcase'){
                if(stShippingField === "custevent_nx_case_asset"){
                    identifyInactiveAddressCase(scriptContext, stLoggerTitle);
                }
            } else {
                if(stShippingField === "billaddress" || stShippingField === "shipaddress") {
                    identifyInactiveAddress(scriptContext, stLoggerTitle);
                }
            }

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged
        };

    });
