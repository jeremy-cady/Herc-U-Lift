/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This User Event script shows two buttons that recalculates Line Rate and recalculates Line Rate based on the Line's selected Revenue Stream
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2023/10/12                        Care Parba          Initial version
 *
 */
define(['N/record', 'N/search', 'N/url', 'N/file'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{url} url
     * @param{file} file  */
    (record, search, url, file) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            const LOG_TITLE = "beforeLoad";

            log.debug({title: LOG_TITLE, details: "===========START==========="});

            let objInvoiceRec = scriptContext.newRecord;
            log.debug({title: LOG_TITLE, details: `objInvoiceRec: ${JSON.stringify(objInvoiceRec)}`});

            if(scriptContext.type === scriptContext.UserEventType.VIEW) {
                try {
                    //scriptContext.form.clientScriptModulePath = './sna_hul_cs_recalculate_rate_rev_stream.js';
                    let stSuiteletURL = url.resolveScript({
                        scriptId: 'customscript_sna_hul_sl_recalc_rate_revs',
                        deploymentId: 'customdeploy_sna_hul_sl_recalc_rate_revs',
                        //returnExternalUrl: false,
                        params: {
                            'custparam_actionType': 'recalculateRate',
                            'custparam_soId': objInvoiceRec.id
                        }
                    });
                    scriptContext.form.addButton({
                        id: "custpage_sna_recalculate_rate",
                        label: "Recalculate Rate",
                        functionName: `window.location.replace("${stSuiteletURL}")` //recalculateRate'
                    });
                } catch (error) {
                    log.error({title: LOG_TITLE, details: `Error while showing Recalculate Rate button: ${error}`});
                }

                try {
                    //scriptContext.form.clientScriptModulePath = './sna_hul_cs_recalculate_rate_rev_stream.js';
                    let stSuiteletURL = url.resolveScript({
                        scriptId: 'customscript_sna_hul_sl_recalc_rate_revs',
                        deploymentId: 'customdeploy_sna_hul_sl_recalc_rate_revs',
                        //returnExternalUrl: false,
                        params: {
                            'custparam_actionType': 'updateRevStreamRecalcRate',
                            'custparam_soId': objInvoiceRec.id
                        }
                    });
                    scriptContext.form.addButton({
                        id: "custpage_sna_upd_revstream_recalc_rate",
                        label: "Update Rev Stream & Recalc Rate",
                        functionName: `window.location.replace("${stSuiteletURL}")`//updateRevStreamRecalcRate
                    });
                } catch (error) {
                    log.error({
                        title: LOG_TITLE,
                        details: `Error while showing Update Rev Stream & Recalc Rate button: ${error}`
                    });
                }
            }

            if(scriptContext.type === scriptContext.UserEventType.EDIT) {
                try {
                    scriptContext.form.clientScriptModulePath = './sna_hul_cs_recalculate_rate_rev_stream.js';
                    scriptContext.form.addButton({
                        id: "custpage_sna_recalculate_rate",
                        label: "Recalculate Rate",
                        functionName: `recalculateRate`
                    });
                } catch (error) {
                    log.error({title: LOG_TITLE, details: `Error while showing Recalculate Rate button: ${error}`});
                }

                try {
                    scriptContext.form.clientScriptModulePath = './sna_hul_cs_recalculate_rate_rev_stream.js';
                    scriptContext.form.addButton({
                        id: "custpage_sna_upd_revstream_recalc_rate",
                        label: "Update Rev Stream & Recalc Rate",
                        functionName: `updateRevStreamRecalcRate`
                    });
                } catch (error) {
                    log.error({
                        title: LOG_TITLE,
                        details: `Error while showing Update Rev Stream & Recalc Rate button: ${error}`
                    });
                }
            }

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        return { beforeLoad }

    });
