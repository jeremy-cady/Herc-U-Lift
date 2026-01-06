/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 *
 * Revision History:
 * UE script deployed to time entry/time bill
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/6/15       		                 aduldulao       Initial version.
 * 2023/8/23                             caranda         Trigger Suitelet in afterSubmit
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/redirect', 'N/url', 'N/https'],
    /**
 * @param{record} record
 * @param{search} runtime
 * @param{redirect} redirect
 * @param{url} url
 * @param{https} https
 */
    (record, runtime, redirect, url, https) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            var currentScript = runtime.getCurrentScript();
            var resource = currentScript.getParameter({name:'custscript_sna_servicetype_resource'});

            var _rec = scriptContext.newRecord;
            var recid = _rec.id
            var linkedso = _rec.getValue({fieldId: 'custcol_sna_linked_so'});
            var hours = _rec.getValue({fieldId: 'hours'});
            var timeposted = _rec.getValue({fieldId: 'posted'});

            if (!isEmpty(linkedso)) {

                var sorec = record.load({type: record.Type.SALES_ORDER, id: linkedso});
                var orderstatus = sorec.getValue({fieldId: 'orderstatus'});

                var soline = sorec.findSublistLineWithValue({sublistId: 'item', fieldId: 'custcol_sna_linked_time', value: recid});
                log.debug({title: 'beforeSubmit', details: 'soline: ' + soline + ' | orderstatus: ' + orderstatus + ' | timeposted: ' + timeposted});

                if (soline != -1) {
                    var qty = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_act_service_hours', line: soline});
                    var nxtask = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', line: soline});
                    var lineservicetype = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: soline});

                    if (qty != hours && !isEmpty(nxtask) && lineservicetype == resource) {
                        if (timeposted) {
                            //throw 'Time entry is already posted.';
                        }
                        if (orderstatus == 'G') {
                            //throw 'Linked sales order is already billed.';
                        }
                        if (orderstatus == 'H') {
                            //throw 'Linked sales order is already closed.';
                        }
                    }
                }
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            try {
                var currentScript = runtime.getCurrentScript();
                var resource = currentScript.getParameter({name:'custscript_sna_servicetype_resource'});

                var _rec = scriptContext.newRecord;
                var recid = _rec.id
                var linkedso = _rec.getValue({fieldId: 'custcol_sna_linked_so'});
                var hours = _rec.getValue({fieldId: 'hours'});
                var timeposted = _rec.getValue({fieldId: 'posted'});
                log.debug({title: 'afterSubmit', details: 'recid: ' + recid});

                if (!isEmpty(linkedso)) {

                    var paramObj = {
                        'recid': recid,
                        'linkedso': linkedso,
                        'hours': hours,
                        'timeposted': timeposted,
                        'resource': resource
                    }

                    //Call Suitelet
                    if(runtime.executionContext == runtime.ContextType.USER_INTERFACE){
                        redirect.toSuitelet({
                            scriptId: 'customscript_sna_hul_sl_time_so',
                            deploymentId: 'customdeploy_sna_hul_sl_time_so',
                            parameters: paramObj
                        });
                    }else if(runtime.executionContext == runtime.ContextType.SUITELET){
                        var sl_url = url.resolveScript({
                            scriptId: 'customscript_sna_hul_sl_time_so',
                            deploymentId: 'customdeploy_sna_hul_sl_time_so',
                            returnExternalUrl: true,
                            params: paramObj
                        });

                        //var fullURL = 'https://6952227-sb1.app.netsuite.com'+sl_url

                        log.debug('afterSubmit', 'sl_url = ' + sl_url);

                        var response = https.post({
                            url: sl_url,
                            body: JSON.stringify(paramObj) // Pass any required data
                        });
                    }


                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }

        }

        return {beforeSubmit, afterSubmit}

    });
