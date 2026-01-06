/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 *
 * Revision History:
 * Suitelet that will trigger SO User Event from SNA HUL UE Time Bill
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/08/23       		             caranda         Initial version
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/runtime'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 * @param{runtime} runtime
*/
    (record, redirect, runtime) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var requestparam = scriptContext.request.parameters;
            var recid = requestparam.recid;
            var linkedso = requestparam.linkedso;
            var hours = requestparam.hours;
            var timeposted = requestparam.timeposted;
            timeposted = (timeposted == 'true' ? true : false);
            //var resource = requestparam.resource;

            var currentScript = runtime.getCurrentScript();
            var resource = currentScript.getParameter({name:'custscript_sna_servicetype_resource'});

            log.debug('requestparam', {recid, linkedso, hours, timeposted, resource});

            var sorec = record.load({type: record.Type.SALES_ORDER, id: linkedso});
            var orderstatus = sorec.getValue({fieldId: 'orderstatus'});

            var soline = sorec.findSublistLineWithValue({sublistId: 'item', fieldId: 'custcol_sna_linked_time', value: recid});
            log.debug({title: 'afterSubmit', details: 'soline: ' + soline + ' | orderstatus: ' + orderstatus + ' | timeposted: ' + timeposted});

            if (soline != -1) {
                var qty = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_act_service_hours', line: soline});
                var nxtask = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_nx_task', line: soline});
                var lineservicetype = sorec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_service_itemcode', line: soline});
                //log.debug({title: 'afterSubmit', details: 'nxtask: ' + nxtask + ' | lineservicetype: ' + lineservicetype});
                log.debug({title: 'afterSubmit', details: {qty, nxtask, lineservicetype}});

                /*log.audit('qty != hours', qty != hours);
                log.audit('orderstatus != \'G\'', orderstatus != 'G');
                log.audit('orderstatus != \'H\'', orderstatus != 'H');
                log.audit('!timeposted', !timeposted);
                log.audit('!isEmpty(nxtask)', !isEmpty(nxtask));
                log.audit('lineservicetype == resource', lineservicetype == resource);*/

                if (qty != hours && orderstatus != 'G' && orderstatus != 'H' && !timeposted && !isEmpty(nxtask) && lineservicetype == resource) {
                    log.debug({title: 'suitelet', details: 'update line'});
                    sorec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_act_service_hours', value: hours, line: soline});

                    try{
                        var recsoid = sorec.save({ignoreMandatoryFields: true});
                        log.debug({title: 'afterSubmit', details: recsoid + ' updated (SO).'});
                    }catch(e){
                        log.error({title: 'Error in saving SO = ' + linkedso, details: e.message});
                    }

                }
            }

            redirect.toRecord({
                type: 'timebill',
                id: recid
            });

        }

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {onRequest}

    });
