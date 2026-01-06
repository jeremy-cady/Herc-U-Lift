/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script of the 4th suitelet page of the rental module
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/19       		                 aduldulao       Initial version.
 * 2022/8/30       		                 aduldulao       Default updates
 * 2022/9/1       		                 aduldulao       Best Pricing Option
 * 2022/11/1       		                 aduldulao       Enable/disable Charges fields, Earliest Avail Date
 * 2023/1/9       		                 aduldulao       Overtime charges
 * 2023/2/10       		                 aduldulao       Calculate Rent Cost
 * 2023/2/16       		                 aduldulao       Best Price
 * 2023/7/11       		                 aduldulao       Rental enhancements
 * 2023/11/20                            aduldulao       Multiple billing formula
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/format', 'N/runtime', 'N/search', 'N/ui/serverWidget'],
    /**
 * @param{format} format
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (format, runtime, search, serverWidget) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
            }
            return flValue;
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var method = scriptContext.request.method;

            var currentScript = runtime.getCurrentScript();
            var rentaldays = currentScript.getParameter({name: 'custscript_sna_rentaldays'});
            var serviceitem = currentScript.getParameter({name: 'custscript_sna_rental_serviceitem'});
            var param_4weekly = currentScript.getParameter({name: 'custscript_sna_unit_4weekly'});
            var param_weekly = currentScript.getParameter({name: 'custscript_sna_unit_weekly'});
            var param_daily = currentScript.getParameter({name: 'custscript_sna_unit_daily'});
            var param_hour = currentScript.getParameter({name: 'custscript_sna_unit_hour'});

            // GET
            if (method == 'GET') {
                var params = scriptContext.request.parameters;
                log.debug({title: 'GET - params', details: JSON.stringify(params)});

                var objid = params.objid;
                var selectedratecard = params.selectedratecard;
                var fromline = params.fromline;
                var linenum = params.linenum;
                var cust = params.cust;
                var custgrp = params.custgrp;
                var trandate = params.trandate;
                var loccode = params.loccode;
                var rentalcomments = params.rentalcomments;

                // create form
                var form = serverWidget.createForm({title: 'Rental Costing', hideNavBar: true});
                form.clientScriptModulePath = './sna_hul_cs_rentalcosting.js';

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add field groups
                var generalfg = form.addFieldGroup({id: 'custpage_generalfg', label: 'General'});
                var defaultchargefg = form.addFieldGroup({id: 'custpage_defaultchargefg', label: 'Default Charges'});
                var addonfg = form.addFieldGroup({id: 'custpage_addonfg', label: 'Add On Charges'});
                var totalfg = form.addFieldGroup({id: 'custpage_totalfg', label: 'Total'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // create header fields
                var configcommentsfld = form.addField({id: 'custpage_configcommentsfld', type: serverWidget.FieldType.TEXTAREA, label: 'Rental Configuration Comments', container: 'custpage_generalfg'});
                configcommentsfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                configcommentsfld.defaultValue = rentalcomments;

                var rentalcardidfld = form.addField({id: 'custpage_rentalcardidfld', type: serverWidget.FieldType.SELECT, label: 'Rate Card', source: 'customrecord_sna_hul_rental_rate_card'});
                rentalcardidfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                rentalcardidfld.defaultValue = selectedratecard;

                var daysfld = form.addField({id: 'custpage_daysfld', type: serverWidget.FieldType.INTEGER, label: 'Total Rental Business Days'});
                daysfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                daysfld.defaultValue = rentaldays;

                var serviceitmfld = form.addField({id: 'custpage_serviceitmfld', type: serverWidget.FieldType.SELECT, label: 'Item', source: 'item'});
                serviceitmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                serviceitmfld.defaultValue = serviceitem;

                var objidfld = form.addField({id: 'custpage_objidfld', type: serverWidget.FieldType.SELECT, label: 'Object', source: 'customrecord_sna_objects', container: 'custpage_generalfg'});
                objidfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                objidfld.defaultValue = objid;

                var fromlinefld = form.addField({id: 'custpage_fromlinefld', type: serverWidget.FieldType.TEXT, label: 'From Line'});
                fromlinefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                fromlinefld.defaultValue = fromline;

                var linenumfld = form.addField({id: 'custpage_linenumfld', type: serverWidget.FieldType.TEXT, label: 'Line Num'});
                linenumfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                linenumfld.defaultValue = linenum;

                var custfld = form.addField({id: 'custpage_custfld', type: serverWidget.FieldType.SELECT, label: 'Customer', source: 'customer', container: 'custpage_generalfg'});
                custfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                custfld.defaultValue = cust;

                var trandtefld = form.addField({id: 'custpage_trandtefld', type: serverWidget.FieldType.DATE, label: 'Transaction Date', container: 'custpage_generalfg'});
                trandtefld.defaultValue = !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '';
                trandtefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var earliestdtefld = form.addField({id: 'custpage_earliestdtefld', type: serverWidget.FieldType.DATE, label: 'Earliest Available Date', container: 'custpage_generalfg'});

                var loccodefld = form.addField({id: 'custpage_loccodefld', type: serverWidget.FieldType.SELECT, label: 'Location', source: 'location', container: 'custpage_generalfg'});
                loccodefld.defaultValue = loccode;
                loccodefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var custpricegrpfld = form.addField({id: 'custpage_custpricegrpfld', type: serverWidget.FieldType.SELECT, label: 'Customer Price Group', source: 'customrecord_sna_hul_customerpricinggrou', container: 'custpage_generalfg'});
                custpricegrpfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                custpricegrpfld.defaultValue = custgrp;

                var rentalcardnofld = form.addField({id: 'custpage_rentalcardnofld', type: serverWidget.FieldType.TEXT, label: 'Rental Card Number', container: 'custpage_generalfg'});
                rentalcardnofld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var rentalcarddescfld = form.addField({id: 'custpage_rentalcarddescfld', type: serverWidget.FieldType.TEXT, label: 'Rental Card Description', container: 'custpage_generalfg'});
                rentalcarddescfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var startdatefld = form.addField({id: 'custpage_startdatefld', type: serverWidget.FieldType.DATE, label: 'Start Date', container: 'custpage_generalfg'});
                startdatefld.isMandatory = true;
                startdatefld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                var enddatefld = form.addField({id: 'custpage_enddatefld', type: serverWidget.FieldType.DATE, label: 'End Date', container: 'custpage_generalfg'});
                enddatefld.isMandatory = true;

                var timeqtyfld = form.addField({id: 'custpage_timeqtyfld', type: serverWidget.FieldType.INTEGER, label: 'Time Quantity', container: 'custpage_generalfg'});
                timeqtyfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                timeqtyfld.isMandatory = true;

                /*var timeqtyfld = form.addField({id: 'custpage_test1_timeqtyfld', type: serverWidget.FieldType.INTEGER, label: 'Time Quantity (Corrected)', container: 'custpage_generalfg'});
                timeqtyfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
                timeqtyfld.isMandatory = true;*/

                var timeunitfld = form.addField({id: 'custpage_timeunitfld', type: serverWidget.FieldType.SELECT, label: 'Time Unit', source: 'customlist_sna_hul_rental_time_unit', container: 'custpage_generalfg'});
                timeunitfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                timeunitfld.defaultValue = param_daily;

                var timeunitprcfld = form.addField({id: 'custpage_timeunitprcfld', type: serverWidget.FieldType.FLOAT, label: 'Time Unit Price', container: 'custpage_generalfg'});
                timeunitprcfld.isMandatory = true;

                var numhrfld = form.addField({id: 'custpage_numhrfld', type: serverWidget.FieldType.CURRENCY, label: 'Number of Hours', container: 'custpage_generalfg'});
                numhrfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var selectbestfld = form.addField({id: 'custpage_selectbestfld', type: serverWidget.FieldType.SELECT, label: 'Select Best Price', container: 'custpage_generalfg'});
                selectbestfld.addSelectOption({value: '', text: '- Best Price -'});
                selectbestfld.addSelectOption({value: '1', text: 'a. Default'});
                selectbestfld.addSelectOption({value: '2', text: 'b. Best Price'});
                selectbestfld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                var htmlfld = form.addField({id: 'custpage_htmlfld', type: serverWidget.FieldType.INLINEHTML, label: ' ', container: 'custpage_generalfg'});
                htmlfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var bestpricefld = form.addField({id: 'custpage_bestpricefld', type: serverWidget.FieldType.LONGTEXT, label: 'Best Price (Remove)', container: 'custpage_generalfg'});
                bestpricefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var mindayfld = form.addField({id: 'custpage_mindayfld', type: serverWidget.FieldType.LONGTEXT, label: 'Min Day Price', container: 'custpage_generalfg'});
                mindayfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var minweekfld = form.addField({id: 'custpage_minweekfld', type: serverWidget.FieldType.LONGTEXT, label: 'Min Week Price', container: 'custpage_generalfg'});
                minweekfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var extradaysfld = form.addField({id: 'custpage_extradaysfld', type: serverWidget.FieldType.LONGTEXT, label: 'Extra Days', container: 'custpage_generalfg'});
                extradaysfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var objsubfld = form.addField({id: 'custpage_objsubfld', type: serverWidget.FieldType.CURRENCY, label: 'Object Subtotal', container: 'custpage_generalfg'});
                objsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var ldwitmfld = form.addField({id: 'custpage_ldwitmfld', type: serverWidget.FieldType.SELECT, label: 'LDW Cost Type', source: 'otherchargeitem', container: 'custpage_defaultchargefg'});
                var ldwfld = form.addField({id: 'custpage_ldwfld', type: serverWidget.FieldType.PERCENT, label: 'LDW %', container: 'custpage_defaultchargefg'});
                var ldwamtfld = form.addField({id: 'custpage_ldwamtfld', type: serverWidget.FieldType.CURRENCY, label: 'LDW Amount', container: 'custpage_defaultchargefg'});

                var cdwitmfld = form.addField({id: 'custpage_cdwitmfld', type: serverWidget.FieldType.SELECT, label: 'CDW Cost Type', source: 'otherchargeitem', container: 'custpage_defaultchargefg'});
                var cdwfld = form.addField({id: 'custpage_cdwfld', type: serverWidget.FieldType.PERCENT, label: 'CDW %', container: 'custpage_defaultchargefg'});
                var cdwamtfld = form.addField({id: 'custpage_cdwamtfld', type: serverWidget.FieldType.CURRENCY, label: 'CDW Amount', container: 'custpage_defaultchargefg'});

                var lisitmfld = form.addField({id: 'custpage_lisitmfld', type: serverWidget.FieldType.SELECT, label: 'LIS Cost Type', source: 'otherchargeitem', container: 'custpage_defaultchargefg'});
                var lisfld = form.addField({id: 'custpage_lisfld', type: serverWidget.FieldType.PERCENT, label: 'LIS %', container: 'custpage_defaultchargefg'});
                var lisamtfld = form.addField({id: 'custpage_lisamtfld', type: serverWidget.FieldType.CURRENCY, label: 'LIS Amount', container: 'custpage_defaultchargefg'});
                lisitmfld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                var enviitmfld = form.addField({id: 'custpage_enviitmfld', type: serverWidget.FieldType.SELECT, label: 'Environment Cost Type', source: 'otherchargeitem', container: 'custpage_defaultchargefg'});
                var envifld = form.addField({id: 'custpage_envifld', type: serverWidget.FieldType.PERCENT, label: 'Environmental Charge %', container: 'custpage_defaultchargefg'});
                var enviamtfld = form.addField({id: 'custpage_enviamtfld', type: serverWidget.FieldType.CURRENCY, label: 'Environmental Charge', container: 'custpage_defaultchargefg'});

                if (isEmpty(selectedratecard)) {
                    ldwitmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    ldwfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    ldwamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    cdwitmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    cdwfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    cdwamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    lisitmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    lisfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    lisamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    enviitmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    envifld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    enviamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                }

                var defaultchargesubfld = form.addField({id: 'custpage_defaultchargesubfld', type: serverWidget.FieldType.CURRENCY, label: 'Default Charges Subtotal', container: 'custpage_defaultchargefg'});
                defaultchargesubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                defaultchargesubfld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                var overchargefld = form.addField({id: 'custpage_overchargefld', type: serverWidget.FieldType.SELECT, label: 'Default Overtime Charge', source: 'otherchargeitem', container: 'custpage_addonfg'});
                overchargefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                var charge1fld = form.addField({id: 'custpage_charge1fld', type: serverWidget.FieldType.SELECT, label: 'Charge Code 1', source: 'otherchargeitem', container: 'custpage_addonfg'});
                var charge1amtfld = form.addField({id: 'custpage_charge1amtfld', type: serverWidget.FieldType.CURRENCY, label: 'Charge Code 1 Amount', container: 'custpage_addonfg'});

                var charge2fld = form.addField({id: 'custpage_charge2fld', type: serverWidget.FieldType.SELECT, label: 'Charge Code 2', source: 'otherchargeitem', container: 'custpage_addonfg'});
                var charge2amtfld = form.addField({id: 'custpage_charge2amtfld', type: serverWidget.FieldType.CURRENCY, label: 'Charge Code 2 Amount', container: 'custpage_addonfg'});
                charge2amtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

                var charge3fld = form.addField({id: 'custpage_charge3fld', type: serverWidget.FieldType.SELECT, label: 'Charge Code 3', source: 'otherchargeitem', container: 'custpage_addonfg'});
                var charge3amtfld = form.addField({id: 'custpage_charge3amtfld', type: serverWidget.FieldType.CURRENCY, label: 'Charge Code 3 Amount', container: 'custpage_addonfg'});
                charge3amtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                charge3fld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                var addonsubfld = form.addField({id: 'custpage_addonsubfld', type: serverWidget.FieldType.CURRENCY, label: 'Add On Charges Subtotal', container: 'custpage_addonfg'});
                addonsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                addonsubfld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

                var totalfld = form.addField({id: 'custpage_totalfld', type: serverWidget.FieldType.CURRENCY, label: 'Total', container: 'custpage_totalfg'});
                totalfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add buttons
                form.addButton({id: 'custpage_backbtn', label: 'Back', functionName: 'backButton()'});

                // add submit button
                form.addSubmitButton({label: 'Submit'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // set best price table
                var ratecardsub = getTimeUnitPrice(trandate, selectedratecard);
                var m1unitprice = !isEmpty(ratecardsub[param_daily+'_m1']) ? ratecardsub[param_daily+'_m1'] : (!isEmpty(ratecardsub[param_daily+'_temp_m1']) ? ratecardsub[param_daily+'_temp_m1'] : '');

                /*var dailyunitcost = !isEmpty(ratecardsub[param_daily]) ? ratecardsub[param_daily] : (!isEmpty(ratecardsub[param_daily+'_temp']) ? ratecardsub[param_daily+'_temp'] : '');
                var weeklyunitcost = !isEmpty(ratecardsub[param_weekly]) ? ratecardsub[param_weekly] : (!isEmpty(ratecardsub[param_weekly+'_temp']) ? ratecardsub[param_weekly+'_temp'] : '');
                var fourweekunitcost = !isEmpty(ratecardsub[param_4weekly]) ? ratecardsub[param_4weekly] : (!isEmpty(ratecardsub[param_4weekly+'_temp']) ? ratecardsub[param_4weekly+'_temp'] : '');

                var htmltable = '<table style="font-size:10px">';
                htmltable += '<tr><td></td><td><b>Time Unit</b></td><td><b>Standard # of Days</b></td><td><b>Unit Cost</b></td><td><b>Unit Cost Per Day</b></td><td><b>Total Rent Cost</b></td></tr>';
                htmltable += '<tr>';
                htmltable += '<td>a.</td>';
                htmltable += '<td>Daily</td>';
                htmltable += '<td>1</td>';
                htmltable += '<td>' + dailyunitcost + '</td>';
                htmltable += '<td>' + dailyunitcost + '</td>';
                htmltable += '<td></td>';
                htmltable += '</tr>';
                htmltable += '<tr>';
                htmltable += '<td>b.</td>';
                htmltable += '<td>Weekly</td>';
                htmltable += '<td>5</td>';
                htmltable += '<td>' + weeklyunitcost + '</td>';
                htmltable += '<td>' + (forceFloat(weeklyunitcost) / 5) + '</td>';
                htmltable += '<td></td>';
                htmltable += '</tr>';
                htmltable += '<tr>';
                htmltable += '<td>c.</td>';
                htmltable += '<td>4-Week</td>';
                htmltable += '<td>20</td>';
                htmltable += '<td>' + fourweekunitcost + '</td>';
                htmltable += '<td>' + (forceFloat(fourweekunitcost) / 20) + '</td>';
                htmltable += '<td></td>';
                htmltable += '</tr>';
                htmltable += '</table><br /><br />';

                htmlfld.defaultValue = htmltable;*/
                bestpricefld.defaultValue = JSON.stringify(ratecardsub);

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // set field values
                var ratecardvalues = getFieldValues(selectedratecard);
                log.debug({title: 'GET - ratecardvalues', details: ratecardvalues});

                if (!isEmpty(ratecardvalues)) {
                    rentalcardnofld.defaultValue = ratecardvalues.rentalcardnofld;
                    rentalcarddescfld.defaultValue = ratecardvalues.rentalcarddescfld;
                    ldwfld.defaultValue = ratecardvalues.ldwfld;
                    cdwfld.defaultValue = ratecardvalues.cdwfld;
                    lisfld.defaultValue = ratecardvalues.lisfld;
                    envifld.defaultValue = ratecardvalues.envifld;
                    ldwitmfld.defaultValue = ratecardvalues.ldwitmfld;
                    cdwitmfld.defaultValue = ratecardvalues.cdwitmfld;
                    lisitmfld.defaultValue = ratecardvalues.lisitmfld;
                    enviitmfld.defaultValue = ratecardvalues.enviitmfld;
                    charge1fld.defaultValue = ratecardvalues.charge1fld;
                    overchargefld.defaultValue = ratecardvalues.charge1fld;

                    if (!isEmpty(ratecardvalues.charge1fld)) {
                        charge1amtfld.defaultValue = m1unitprice;
                        addonsubfld.defaultValue = m1unitprice;
                        totalfld.defaultValue = m1unitprice;
                    }

                    // disable % and amount fields
                    if (isEmpty(ratecardvalues.charge1fld)) {
                        charge1amtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    }
                    if (isEmpty(ratecardvalues.ldwitmfld)) {
                        ldwfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                        ldwamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    }
                    if (isEmpty(ratecardvalues.cdwitmfld)) {
                        cdwfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                        cdwamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    }
                    if (isEmpty(ratecardvalues.lisitmfld)) {
                        lisfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                        lisamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    }
                    if (isEmpty(ratecardvalues.enviitmfld)) {
                        envifld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                        enviamtfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                    }
                }

                if (!isEmpty(objid)) {
                    var objflds = search.lookupFields({type: 'customrecord_sna_objects', id: objid, columns: ['custrecord_sna_exp_rental_return_date']});

                    if (!isEmpty(objflds.custrecord_sna_exp_rental_return_date)) {
                        var returndte = objflds.custrecord_sna_exp_rental_return_date;
                        log.debug({title: 'GET - returndte', details: returndte});

                        if (!isEmpty(returndte)) {
                            returndte = format.parse({value: returndte, type: format.Type.DATE});
                            returndte = format.parse({value: new Date(returndte.setDate(returndte.getDate() + 1)), type: format.Type.DATE});
                            earliestdtefld.defaultValue = returndte;
                        }
                    }
                    else {
                        earliestdtefld.defaultValue = format.parse({value: new Date(), type: format.Type.DATE});
                    }
                }
                else {
                    earliestdtefld.defaultValue = format.parse({value: new Date(), type: format.Type.DATE});
                }

                scriptContext.response.writePage(form);
            }

            // POST
            else {
                var stHtml = '<script language="JavaScript">';
                stHtml += 'window.close();';
                stHtml += '</script>';

                scriptContext.response.write({output: stHtml});
            }
        }

        /**
         * Best Pricing Option
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
            col.push(search.createColumn({name: 'custrecord_sna_m1_unit_price'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_rent_time_unit', sort: search.Sort.DESC}));
            col.push(search.createColumn({name: 'internalid', sort: search.Sort.DESC}));

            var res = search.create({type: 'customrecord_sna_hul_rate_card_sublist', filters: fil, columns: col});

            res.run().each(function(result) {
                var res_timeunitprice = result.getValue({name: 'custrecord_sna_hul_time_unit_price'});
                var res_effectivestart = result.getValue({name: 'custrecord_sna_hul_effective_start_date'});
                var res_effectiveend = result.getValue({name: 'custrecord_sna_hul_effective_end_date'});
                var res_unit = result.getValue({name: 'custrecord_sna_hul_rent_time_unit'});
                var res_m1unitsinc = result.getValue({name: 'custrecord_sna_hul_m1_units_included'});
                var res_m1unitprice = result.getValue({name: 'custrecord_sna_m1_unit_price'});

                log.debug({title: 'getTimeUnitPrice', details: 'res_unit: ' + res_unit + ' | res_effectivestart: ' + res_effectivestart + ' | res_effectiveend: ' + res_effectiveend + ' | res_timeunitprice: ' + res_timeunitprice + ' | res_m1unitprice: ' + res_m1unitprice});

                // Tran date within effective start date and effective end date
                if (
                    (!isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart) && new Date(trandate) <= new Date(res_effectiveend)) ||
                    (!isEmpty(res_effectivestart) && isEmpty(res_effectiveend) && new Date(trandate) >= new Date(res_effectivestart)) ||
                    (isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) <= new Date(res_effectiveend))
                ) {
                    // get 1st result always
                    if (isEmpty(ratecardsubinfo[res_unit])) {
                        ratecardsubinfo[res_unit] = res_timeunitprice;
                        ratecardsubinfo[res_unit+'_m1'] = res_m1unitprice;
                    }
                }

                // If there are multiple Rental Rate Card Sublist containing the same Time Unit wherein Effective Dates are Null, select the most recently created.
                else if (isEmpty(res_effectivestart) && isEmpty(res_effectivestart)) {
                    // get 1st result always
                    if (isEmpty(ratecardsubinfo[res_unit + '_temp'])) {
                        ratecardsubinfo[res_unit + '_temp'] = res_timeunitprice;
                        ratecardsubinfo[res_unit + '_temp_m1'] = res_m1unitprice;
                    }
                }

                return true;
            });

            log.debug({title: 'getTimeUnitPrice', details: 'ratecardsubinfo: ' + JSON.stringify(ratecardsubinfo)});

            return ratecardsubinfo;
        }

        /**
         * Get field values
         * @param ratecardid
         * @returns {{}}
         */
        function getFieldValues(ratecardid) {
            var obj = {};

            if (isEmpty(ratecardid)) return obj;

            var fil = [];
            fil.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: ratecardid}));

            var col = [];
            col.push(search.createColumn({name: 'name'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_description'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_ldw_item'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_ldwpercent'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_cdw_item'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_cdwpercent'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_lis_item'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_lispercent'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_envi_item'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_envipercent'}));
            col.push(search.createColumn({name: 'custrecord_sna_hul_ratecard_m1chargecode'}));

            var res = search.create({type: 'customrecord_sna_hul_rental_rate_card', filters: fil, columns: col});
            res.run().each(function(result) {
                obj.rentalcardnofld = result.getValue({name: 'name'});
                obj.rentalcarddescfld = result.getValue({name: 'custrecord_sna_hul_ratecard_description'});
                obj.ldwfld = result.getValue({name: 'custrecord_sna_hul_ratecard_ldwpercent'});
                obj.cdwfld = result.getValue({name: 'custrecord_sna_hul_ratecard_cdwpercent'});
                obj.lisfld = result.getValue({name: 'custrecord_sna_hul_ratecard_lispercent'});
                obj.envifld = result.getValue({name: 'custrecord_sna_hul_ratecard_envipercent'});
                obj.ldwitmfld = result.getValue({name: 'custrecord_sna_hul_ratecard_ldw_item'});
                obj.cdwitmfld = result.getValue({name: 'custrecord_sna_hul_ratecard_cdw_item'});
                obj.lisitmfld = result.getValue({name: 'custrecord_sna_hul_ratecard_lis_item'});
                obj.enviitmfld = result.getValue({name: 'custrecord_sna_hul_ratecard_envi_item'});
                obj.charge1fld = result.getValue({name: 'custrecord_sna_hul_ratecard_m1chargecode'});

                return false; // 1 result only
            });

            return obj;
        }

        return {onRequest}

    });