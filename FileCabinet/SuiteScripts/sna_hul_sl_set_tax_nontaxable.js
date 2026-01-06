/*
* Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author cparba
*
* Script brief description:
* This is a suitelet that will trigger the UE script in Invoice which sets the line tax code field to Not Taxable if revenue stream is Internal
*
* Revision History:
*
* Date			Issue/Case		Author			Issue Fix Summary
* =============================================================================================
* 2024/01/02					cparba          Initial version
*
*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', './sna_hul_mod_sales_tax.js'],
    function(record, redirect, mod_tax) {

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length - 1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
        }

        function onRequest(context) {
            const LOG_TITLE = "onRequest";
            const NOT_TAXABLE = -7;
            const AVATAX = 8;

            log.debug({title: LOG_TITLE, details: "===========START==========="});
            log.debug({title: LOG_TITLE, details: context.request.parameters});

            let stInvoiceId = context.request.parameters.custparam_recordId;
            let strecType = context.request.parameters.custparam_recordType;
            try{
                let objInvoiceRec = record.load({
                    type: strecType,
                    id: stInvoiceId,
                    isDynamic: true
                })
                objInvoiceRec.setValue({fieldId: 'custbody_ava_disable_tax_calculation', value: false});

                //var internal = false;
                var internal = mod_tax.updateLines(objInvoiceRec, true);
                /*if (internal) {
                    objInvoiceRec.setValue({fieldId: 'shipaddresslist', value: ''});
                }*/

                let iLineCount = objInvoiceRec.getLineCount({ sublistId: 'item' });
                log.debug({title: LOG_TITLE, details: {iLineCount} });

                for(let i = 0; i < iLineCount; i++){
                    objInvoiceRec.selectLine({ sublistId: 'item', line: i });
                    let stRevStream = objInvoiceRec.getCurrentSublistText({
                        sublistId: 'item',
                        fieldId: 'cseg_sna_revenue_st',
                        line: i
                    });
                    log.debug({title: LOG_TITLE, details: {i} });
                    log.debug({title: LOG_TITLE, details: {stRevStream} });

                    let bIsInternal = stRevStream.includes('Internal');
                    log.debug({title: LOG_TITLE, details: {bIsInternal} });

                    if(bIsInternal || internal){
                        log.debug({title: LOG_TITLE, details: 'setting to internal' });
                        objInvoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            value: NOT_TAXABLE,
                            forceSyncSourcing: true
                        });
                        objInvoiceRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ava_taxamount',
                            value: 0,
                            forceSyncSourcing: true
                        });
                        objInvoiceRec.commitLine({ sublistId: 'item' });
                    } else if (!internal && strecType == 'invoice') {
                        let bIsExternal = stRevStream.includes('External');
                        if(bIsExternal) {
                            objInvoiceRec.setValue({ fieldId: 'custbody_ava_disable_tax_calculation', value: false });

                            objInvoiceRec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                value: AVATAX
                            });
                            objInvoiceRec.commitLine({ sublistId: 'item' });
                        }
                    }
                }

                let hasApplied = false;
                let docs = [];
                if (strecType == 'creditmemo' && internal) {
                    // unapply everything to get correct amounts
                    for (let c = 0; c < objInvoiceRec.getLineCount({sublistId: 'apply'}); c++) {
                        objInvoiceRec.selectLine({sublistId: 'apply', line: c});
                        let isApply = objInvoiceRec.getCurrentSublistValue({sublistId: 'apply', fieldId: 'apply'});
                        let doc = objInvoiceRec.getCurrentSublistValue({sublistId: 'apply', fieldId: 'doc'});

                        if (isApply) {
                            hasApplied = true;
                            docs.push(doc);
                            log.debug({title: LOG_TITLE, details: c + ' | unapplying' });
                            objInvoiceRec.setCurrentSublistValue({sublistId: 'apply', fieldId: 'apply', value: false});
                        }

                        objInvoiceRec.commitLine({sublistId: 'apply'});
                    }
                }

                //objInvoiceRec.setValue({ fieldId: 'taxtotal', value: 0 });
                if (internal) {
                    objInvoiceRec.setValue({fieldId: 'taxamountoverride', value: 0});
                    objInvoiceRec.setValue({fieldId: 'custbody_ava_disable_tax_calculation', value: true});
                }
                let stUpdatedInvoiceId = objInvoiceRec.save({enableSourcing: true, ignoreMandatoryFields: true});

                // aduldulao 8/22/24 - need to do this after lines or else unexpected error
                if (internal) {
                    /*record.submitFields({
                        type: strecType,
                        id: stInvoiceId,
                        values: {
                            custbody_ava_disable_tax_calculation: true
                        }
                    });*/

                    if (hasApplied) {
                        let objInvoiceRec = record.load({
                            type: strecType,
                            id: stInvoiceId,
                            isDynamic: true
                        });

                        for (let d = 0; d < objInvoiceRec.getLineCount({sublistId: 'apply'}); d++) {
                            objInvoiceRec.selectLine({sublistId: 'apply', line: d});
                            let doc = objInvoiceRec.getCurrentSublistValue({sublistId: 'apply', fieldId: 'doc'});

                            if (inArray(doc, docs)) {
                                log.debug({title: LOG_TITLE, details: d + ' | applying'});
                                objInvoiceRec.setCurrentSublistValue({sublistId: 'apply', fieldId: 'apply', value: true});
                            }

                            objInvoiceRec.commitLine({sublistId: 'apply'});
                        }

                        let stUpdatedInvoiceId = objInvoiceRec.save({enableSourcing: true, ignoreMandatoryFields: true});
                    }
                }
                /*else {
                    record.submitFields({
                        type: strecType,
                        id: stInvoiceId,
                        values: {
                            custbody_ava_disable_tax_calculation: false
                        }
                    });
                }*/

                if(stUpdatedInvoiceId){
                    redirect.toRecord({
                        type: strecType,
                        id: stUpdatedInvoiceId
                    })
                }
            } catch (error) {
                log.error({title: LOG_TITLE, details: `Error: ${error}`});
                redirect.toRecord({
                    type: strecType,
                    id: stInvoiceId
                })
            }
            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        return {
            onRequest: onRequest
        };
    });