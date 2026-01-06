/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to auto create hour meter record from rental checklist or maintenance record
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/4/18       		                 aduldulao       Initial version.
 * 2023/4/28       		                 aduldulao       Add delivery and rental conditions
 * 2023/8/21                             aduldulao       Add new case types
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/format'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 */
    (record, runtime, search, format) => {

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
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
            try {
                log.debug({title: 'afterSubmit', details: 'scriptContext.type: ' + scriptContext.type});

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                log.debug({title: 'afterSubmit', details: '_rectype: ' + _rectype + ' | _recid: ' + _recid});

                if (scriptContext.type == scriptContext.UserEventType.COPY || scriptContext.type == scriptContext.UserEventType.CREATE) {
                    var currentScript = runtime.getCurrentScript();
                    var paramdeliver = currentScript.getParameter({name: 'custscript_sna_source_deliver'});
                    var paramreturn = currentScript.getParameter({name: 'custscript_sna_source_return'});
                    var paramwo = currentScript.getParameter({name: 'custscript_sna_source_wo'});
                    var paramwarranty = currentScript.getParameter({name: 'custscript_sna_source_warranty'});
                    var parampmsched = currentScript.getParameter({name: 'custscript_sna_source_pmsched'});

                    var supportcase = '';
                    var hourreading = ''
                    var asset = '';
                    var object = '';
                    var sourceno = '';
                    var revstream = '';
                    var casetype = '';
                    var sourcetype = '';

                    if (_rectype == 'customrecord_nxc_mr') {
                        supportcase = _rec.getValue({fieldId: 'custrecord_nxc_mr_case'});
                        hourreading = _rec.getValue({fieldId: 'custrecord_nxc_mr_field_222'});
                        asset = _rec.getValue({fieldId: 'custrecord_nxc_mr_asset'});
                    }
                    else {
                        supportcase = _rec.getValue({fieldId: 'custrecord_sna_nxc_rc_case'});
                        hourreading = _rec.getValue({fieldId: 'custrecord_sna_nxc_rc_field_26'});
                        asset = _rec.getValue({fieldId: 'custrecord_sna_nxc_rc_asset'});
                    }

                    if (!isEmpty(asset)) {
                        var assetflds = search.lookupFields({type: 'customrecord_nx_asset', id: asset, columns: ['custrecord_sna_hul_nxcassetobject']});

                        if (!isEmpty(assetflds['custrecord_sna_hul_nxcassetobject'])) {
                            object = assetflds['custrecord_sna_hul_nxcassetobject'][0].value;
                        }
                    }

                    if (!isEmpty(supportcase) && !isEmpty(hourreading)) {
                        var caseflds = search.lookupFields({type: search.Type.SUPPORT_CASE, id: supportcase, columns: ['cseg_sna_revenue_st', 'casenumber', 'custevent_nx_case_type']});

                        if (!isEmpty(caseflds.casenumber)) {
                            sourceno = 'Case #' + caseflds.casenumber;
                        }

                        if (!isEmpty(caseflds['cseg_sna_revenue_st'])) {
                            revstream = caseflds['cseg_sna_revenue_st'][0].text;
                            log.debug({title: 'afterSubmit', details: 'revstream: ' + revstream});
                        }

                        if (!isEmpty(caseflds['custevent_nx_case_type'])) {
                            casetype = caseflds['custevent_nx_case_type'][0].text;
                            log.debug({title: 'afterSubmit', details: 'casetype: ' + casetype});
                        }

                        if (revstream.includes('External : Service : Planned Maintenance')) {
                            sourcetype = parampmsched;
                        }
                        else if (revstream.includes('Internal : Service : Warranty')) {
                            sourcetype = paramwarranty;
                        }
                        else if (casetype.includes('Breakfix')) {
                            sourcetype = paramwo;
                        }
                        else if (casetype.includes('Delivery')) {
                            sourcetype = paramdeliver;
                        }
                        else if (casetype.includes('Pick-up')) {
                            sourcetype = paramreturn;
                        }

                        log.debug({title: 'afterSubmit', details: 'sourcetype: ' + sourcetype + ' | hourreading: ' + hourreading + ' | object: ' + object + ' | sourceno: ' + sourceno});
                        createHourMeter(sourcetype, hourreading, object, sourceno);
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

        function createHourMeter(sourcetype, hourreading, object, sourceno) {
            // hour meter
            var hmrec = record.create({type: 'customrecord_sna_hul_hour_meter', isDynamic: true});
            hmrec.setValue({fieldId: 'custrecord_sna_hul_object_ref', value: object});
            hmrec.setValue({fieldId: 'custrecord_sna_hul_date', value: new Date()});

            var hours = new Date().getHours().toString();
            var minutes = new Date().getMinutes().toString();
            var time = hours.concat(minutes);

            hmrec.setText({fieldId: 'custrecord_sna_hul_time', text: time});
            hmrec.setValue({fieldId: 'custrecord_sna_hul_hour_meter_reading', value: hourreading});
            hmrec.setValue({fieldId: 'custrecord_sna_hul_hr_meter_source', value: sourcetype});
            hmrec.setValue({fieldId: 'custrecord_sna_hul_actual_reading', value: hourreading});
            hmrec.setValue({fieldId: 'custrecord_sna_hul_source_record', value: sourceno});
            var hmid = hmrec.save({ignoreMandatoryFields: true});
            log.debug({title: 'createHourMeter', details: 'hour meter created: ' + hmid});

            return hmid;
        }

        return {afterSubmit}

    });