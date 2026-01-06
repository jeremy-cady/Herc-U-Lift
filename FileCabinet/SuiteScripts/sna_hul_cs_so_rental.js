/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script for the configure object line suitelet
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/9/28       		                 aduldulao       Initial version.
 * 2022/10/7                             aduldulao       Rate Card field change
 * 2022/11/1                             aduldulao       Show prompt
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/format', 'N/runtime', 'N/search', 'N/currentRecord'],
/**
 * @param{url} url
 */
function(url, format, runtime, search, currentRecord) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for ( var k in v)
                return false;
            return true;
        })(stValue)));
    }

    var GLOBAL = {
        param_4weekly: '',
        param_weekly: '',
        param_daily: '',
        param_hour: ''
    }

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var currentScript = runtime.getCurrentScript();
        GLOBAL.param_4weekly = currentScript.getParameter({name: 'custscript_sna_unit_4weekly'});
        GLOBAL.param_weekly = currentScript.getParameter({name: 'custscript_sna_unit_weekly'});
        GLOBAL.param_daily = currentScript.getParameter({name: 'custscript_sna_unit_daily'});
        GLOBAL.param_hour = currentScript.getParameter({name: 'custscript_sna_unit_hour'});
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var field = scriptContext.fieldId;
        var rec = scriptContext.currentRecord;

        if (field == 'custcol_sna_configure_object') {
            var currentScript = runtime.getCurrentScript();
            var serviceitem = currentScript.getParameter({name: 'custscript_sna_rental_serviceitem'});

            var selected = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
            var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});

            if (itm == serviceitem) {
                var cust = rec.getValue({fieldId: 'entity'});
                var custgrp = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
                var loc = rec.getValue({fieldId: 'location'});
                var trandate = !isEmpty(rec.getValue({fieldId: 'trandate'})) ? format.format({value: new Date(rec.getValue({fieldId: 'trandate'})), type: format.Type.DATE}) : '';

                var slconfigurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_configureobject', deploymentId: 'customdeploy_sna_hul_sl_configureobject',
                    params: {
                        selected: selected,
                        fromline: 'T',
                        cust: cust,
                        custgrp: custgrp,
                        trandate: !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '',
                        loccode: loc
                    }
                });

                window.open(slconfigurl, '_blank','width=1000,height=600,top=300,left=300,menubar=1');
            }
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_configure_object', value: false, ignoreFieldChange: true});
        }

        if (field == 'custcol_sna_rental_rate_card') {
            var trandate = rec.getValue({fieldId: 'trandate'});
            var selectedratecard = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_rental_rate_card'});

            var ratecardsub = getTimeUnitPrice(trandate, selectedratecard);

            var dailyunitcost = !isEmpty(ratecardsub[GLOBAL.param_daily]) ? ratecardsub[GLOBAL.param_daily] : (!isEmpty(ratecardsub[GLOBAL.param_daily+'_temp']) ? ratecardsub[GLOBAL.param_daily+'_temp'] : '');
            var weeklyunitcost = !isEmpty(ratecardsub[GLOBAL.param_weekly]) ? ratecardsub[GLOBAL.param_weekly] : (!isEmpty(ratecardsub[GLOBAL.param_weekly+'_temp']) ? ratecardsub[GLOBAL.param_weekly+'_temp'] : '');
            var fourweekunitcost = !isEmpty(ratecardsub[GLOBAL.param_4weekly]) ? ratecardsub[GLOBAL.param_4weekly] : (!isEmpty(ratecardsub[GLOBAL.param_4weekly+'_temp']) ? ratecardsub[GLOBAL.param_4weekly+'_temp'] : '');

            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_rate', value: dailyunitcost, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_weekly_rate', value: weeklyunitcost, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_4week_rate', value: fourweekunitcost, forceSyncSourcing: true});
        }
    }

    /**
     * Get time unit price
     * @param trandate
     * @param selectedratecard
     * @returns {string|{}}
     */
    function getTimeUnitPrice(trandate, selectedratecard) {
        var ratecardsubinfo = {};

        if (isEmpty(selectedratecard) || isEmpty(trandate)) return '';

        var fil = [];
        fil.push(search.createFilter({name: 'custrecord_sna_hul_linked_rate_card', operator: search.Operator.IS, values: selectedratecard}));

        var col = [];
        col.push(search.createColumn({name: 'custrecord_sna_hul_time_unit_price'}));
        col.push(search.createColumn({name: 'custrecord_sna_hul_effective_start_date'}));
        col.push(search.createColumn({name: 'custrecord_sna_hul_effective_end_date'}));
        col.push(search.createColumn({name: 'custrecord_sna_hul_m1_units_included'}));
        col.push(search.createColumn({name: 'custrecord_sna_hul_rent_time_unit', sort: search.Sort.DESC}));
        col.push(search.createColumn({name: 'internalid', sort: search.Sort.DESC}));

        var res = search.create({type: 'customrecord_sna_hul_rate_card_sublist', filters: fil, columns: col});

        res.run().each(function(result) {
            var res_timeunitprice = result.getValue({name: 'custrecord_sna_hul_time_unit_price'});
            var res_effectivestart = result.getValue({name: 'custrecord_sna_hul_effective_start_date'});
            var res_effectiveend = result.getValue({name: 'custrecord_sna_hul_effective_end_date'});
            var res_unit = result.getValue({name: 'custrecord_sna_hul_rent_time_unit'});
            var res_m1unitsinc = result.getValue({name: 'custrecord_sna_hul_m1_units_included'});

            log.debug({title: 'getTimeUnitPrice', details: 'res_unit: ' + res_unit + ' | res_effectivestart: ' + res_effectivestart + ' | res_effectiveend: ' + res_effectiveend + ' | res_timeunitprice: ' + res_timeunitprice});

            // Tran date within effective start date and effective end date
            if (
                (!isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart) && new Date(trandate) <= new Date(res_effectiveend)) ||
                (!isEmpty(res_effectivestart) && isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart)) ||
                (isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) <= new Date(res_effectiveend))
            ) {
                // get 1st result always
                if (isEmpty(ratecardsubinfo[res_unit])) {
                    ratecardsubinfo[res_unit] = res_timeunitprice;
                    ratecardsubinfo[res_unit+'_m1'] = res_m1unitsinc
                }
            }

            // If there are multiple Rental Rate Card Sublist containing the same Time Unit wherein Effective Dates are Null, select the most recently created.
            else if (isEmpty(res_effectivestart) && isEmpty(res_effectivestart)) {
                // get 1st result always
                if (isEmpty(ratecardsubinfo[res_unit + '_temp'])) {
                    ratecardsubinfo[res_unit + '_temp'] = res_timeunitprice;
                    ratecardsubinfo[res_unit + '_temp_m1'] = res_m1unitsinc;
                }
            }

            return true;
        });

        log.debug({title: 'getTimeUnitPrice', details: 'ratecardsubinfo: ' + JSON.stringify(ratecardsubinfo)});

        return ratecardsubinfo;
    }

    /**
     * Open Select Object suitelet
     * @param cust
     * @param custgrp
     * @param trandate
     * @param loc
     */
    function showPrompt(cust, custgrp, trandate, loc) {
        var rec = currentRecord.get();
        var cust = rec.getValue({fieldId: 'entity'});
        var custgrp = rec.getValue({fieldId: 'custbody_sna_hul_cus_pricing_grp'});
        var loc = rec.getValue({fieldId: 'location'});
        var trandate = !isEmpty(rec.getValue({fieldId: 'trandate'})) ? format.format({value: new Date(rec.getValue({fieldId: 'trandate'})), type: format.Type.DATE}) : '';

        if (isEmpty(cust) || isEmpty(loc)) {
            alert('Customer and Location cannot be empty');
            return;
        }

        var slurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectobject', deploymentId: 'customdeploy_sna_hul_sl_selectobject',
            params : {'cust': cust, 'custgrp' : custgrp, 'trandate' : trandate, 'loccode' : loc}
        });

        var params = 'width=1000,height=600,top=300,left=300,menubar=1';
        window.open(slurl, '_blank', params);
    }

    return {
        fieldChanged: fieldChanged,
        pageInit: pageInit,
        showPrompt: showPrompt
    };
    
});
