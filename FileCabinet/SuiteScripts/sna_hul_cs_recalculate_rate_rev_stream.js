/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This User Event script shows a button that generates a PDF from the Invoice before saving it
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2023/07/14                        Care Parba          Initial version
 *
 */
define(['N/search', 'N/currentRecord', 'N/url', 'N/runtime', './sna_hul_mod_sales_tax.js'],

    /**
     * @param{search} search
     * @param{currentRecord} currentRecord
     * @param{url} url
     */
    function(search, currentRecord, url, runtime, mod_tax) {

        const NOT_TAXABLE = -7;

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        const recalculateRate = () => {
            const LOG_TITLE = "recalculateRate";
            log.debug({ title: LOG_TITLE, details: "===========START===========" });

            const setLineFields = async () => {//lineCount

                const objCurrentSORec = await currentRecord.get.promise();

                let iLineCount = objCurrentSORec.getLineCount({ sublistId: 'item' });

                for (let i = 0; i < iLineCount; i++) {//
                    objCurrentSORec.selectLine({sublistId: 'item', line: i});
                    objCurrentSORec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_sna_hul_lock_rate',
                        value: false,
                        forceSyncSourcing: true
                    });
                    objCurrentSORec.commitLine({sublistId: 'item'});
                }
            }
            setLineFields();

            log.debug({ title: LOG_TITLE, details: "===========END===========" });
        }

        const updateRevStreamRecalcRate = () => {
            const LOG_TITLE = "updateRevStreamRecalcRate";
            log.debug({ title: LOG_TITLE, details: "===========START===========" });

            const setLineFields = async () => {

                const objCurrentSORec = await currentRecord.get.promise();

                let currentScript = runtime.getCurrentScript();
                let willcall = currentScript.getParameter({name: 'custscript_sna_ofm_willcall'});
                let ship = currentScript.getParameter({name: 'custscript_sna_ofm_ship'});
                let avataxpos = currentScript.getParameter({name: 'custscript_sna_tax_avataxpos'});
                let avatax = currentScript.getParameter({name: 'custscript_sna_tax_avatax'});

                let stRevStream = objCurrentSORec.getValue({ fieldId: 'cseg_sna_revenue_st' });
                let ordermethod = objCurrentSORec.getValue({fieldId: 'custbody_sna_order_fulfillment_method'});
                let iLineCount = objCurrentSORec.getLineCount({ sublistId: 'item' });

                let internal = mod_tax.updateLines(objCurrentSORec, true);

                objCurrentSORec.setValue({fieldId: 'custbody_ava_disable_tax_calculation', value: false}); // always set to F here. will update on the UE script

                if(!isEmpty(stRevStream)) {
                    for (let i = 0; i < iLineCount; i++) {
                        objCurrentSORec.selectLine({sublistId: 'item', line: i});
                        objCurrentSORec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'cseg_sna_revenue_st',
                            value: stRevStream,
                            forceSyncSourcing: true
                        });
                        objCurrentSORec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_sna_hul_lock_rate',
                            value: false,
                            forceSyncSourcing: true
                        });
                        if (internal) {
                            log.debug({title: 'internal tax', details: 'setting line ' + i + ' to internal'});
                            objCurrentSORec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                value: NOT_TAXABLE,
                                forceSyncSourcing: true
                            });

                            objCurrentSORec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ava_taxamount',
                                value: 0,
                                forceSyncSourcing: true
                            });
                        }
                        else {
                            if (ordermethod == willcall) {
                                finaltaxcode = avataxpos;
                            }
                            else if (ordermethod == ship) {
                                finaltaxcode = avatax;
                            }

                            log.debug({title: 'non-internal tax', details: 'setting line ' + i + ' to non-internal'});
                            objCurrentSORec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                value: finaltaxcode,
                                forceSyncSourcing: true
                            });
                        }
                        objCurrentSORec.commitLine({sublistId: 'item'});
                    }

                    if (internal) {
                        objCurrentSORec.setValue({fieldId: 'taxamountoverride', value: 0});
                        objCurrentSORec.setValue({fieldId: 'custbody_ava_disable_tax_calculation', value: true});
                    }
                }
            }
            setLineFields();

            log.debug({ title: LOG_TITLE, details: "===========END===========" });
        }

        const refreshSuitelet = (customRecordId) => {
            let stSuiteletURL = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_recalc_rate_revs',
                deploymentId: 'customdeploy_sna_hul_sl_recalc_rate_revs',
                //returnExternalUrl: false,
                params: {
                    'custparam_actionType': 'refreshSuitelet',
                    'custparam_customRecordId': customRecordId
                }
            });

            window.onbeforeunload = null;
            location.href = stSuiteletURL;
        }

        const pageInit = (scriptContext) => {

        }

        return {
            recalculateRate: recalculateRate,
            updateRevStreamRecalcRate: updateRevStreamRecalcRate,
            refreshSuitelet: refreshSuitelet,
            pageInit: pageInit
        };

    });