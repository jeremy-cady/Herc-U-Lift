/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * CS script of sna_hul_sl_rentalcosting.js
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/19       		                 aduldulao       Initial version.
 * 2022/8/30       		                 aduldulao       Default updates
 * 2022/9/1       		                 aduldulao       Best Pricing Option
 * 2022/9/13       		                 aduldulao       Set charge start and end date
 * 2022/9/21       		                 aduldulao       Character limit
 * 2022/9/26       		                 aduldulao       Set object and fleet columns
 * 2022/10/6       		                 aduldulao       Set rate card and rates
 * 2022/10/16       		             aduldulao       Set rate from best rate table
 * 2022/11/1       		                 aduldulao       Enable/disable Charges fields, Earliest Avail Date
 * 2023/1/9       		                 aduldulao       Overtime charges
 * 2023/2/10       		                 aduldulao       Calculate Rent Cost
 * 2023/2/16       		                 aduldulao       Best Price
 * 2023/7/13                             aduldulao       Rental enhancements
 * 2023/11/20                            aduldulao       Multiple billing formula
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/format', 'N/search', 'N/runtime', 'N/http', 'N/xml', 'SuiteScripts/moment.js'],
/**
 * @param{currentRecord} currentRecord
 * @param{url} url
 */
function(currentRecord, url, format, search, runtime, http, xml, moment) {

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

    function replaceAll(str, find, replaceString) {
        return str.replace(new RegExp(find, 'g'), replaceString);
    }

    function formatCurrency(flValue, stCurrencySymbol, intDecimalPrecision) {
        var flAmount = round(forceFloat(flValue), intDecimalPrecision);

        var arrDigits = flAmount.toFixed(intDecimalPrecision).split(".");
        arrDigits[0] = arrDigits[0].split("").reverse().join("").replace(/(\d{3})(?=\d)/g, "$1,").split("").reverse().join("");
        return stCurrencySymbol + arrDigits.join(".");
    }

    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    function workingDaysBetweenDates(startDate, endDate) {
        console.log('2 starting date: ' + startDate + ' | ' + endDate);

        var vTimezoneDiff2 = startDate.getTimezoneOffset() - endDate.getTimezoneOffset();
        var vTimezoneDiff = endDate.getTimezoneOffset() - startDate.getTimezoneOffset(); // startdate is dst
        console.log('1 vTimezoneDiff: ' + vTimezoneDiff + ' | vTimezoneDiff2: ' + vTimezoneDiff2);

        if (vTimezoneDiff > 0) {
            // Handle daylight saving time difference between two dates.
            startDate.setMinutes(startDate.getMinutes() + vTimezoneDiff);
        }
        else if (vTimezoneDiff2 > 0) {
            // Handle daylight saving time difference between two dates.
            endDate.setMinutes(endDate.getMinutes() + vTimezoneDiff);
        }

        var offset = 0;
        if (startDate.toString().includes('Daylight') && !endDate.toString().includes('Daylight')) {
            offset = -1;
        }
        else if (endDate.toString().includes('Daylight') && !startDate.toString().includes('Daylight')) {
            offset = 1;
        }
        console.log('offset: ' + offset);

        console.log('3 actual dates: ' + startDate + ' | ' + endDate);

        // Validate input
        if (endDate < startDate)
            return 0;

        // Calculate days between dates
        var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
        startDate.setHours(0,0,0,1);  // Start just after midnight
        endDate.setHours(23,59,59,999);  // End just before midnight
        var diff = endDate - startDate;  // Milliseconds between datetime objects
        var days = Math.ceil(diff / millisecondsPerDay);

        // Subtract two weekend days for every week in between
        var weeks = Math.floor(days / 7);
        days = days - (weeks * 2);

        // Handle special cases
        var startDay = startDate.getDay();
        var endDay = endDate.getDay();

        // 10/19 - this should be ok. issue on last condition only
        //if (offset == 0) {
            // Remove weekend not previously removed.
            if (startDay - endDay > 1)
                days = days - 2;

            // Remove start day if span starts on Sunday but ends before Saturday
            if (startDay == 0 && endDay != 6)
                days = days - 1

            // Remove end day if span ends on Saturday but starts after Sunday
            if (endDay == 6 && startDay != 0)
                days = days - 1

            // start date is DST
            if (endDay == 1 && startDay == 3 && offset == -1)
                days = days + 2; // for some reason, Wed is -1 day so need to add 2 days to counter offset

            // Remove start day if span starts on Sunday but ends before Saturday
            //if (endDay == 6 && startDay != 0)
                //days = days - 1
        //}

        console.log('days: ' + days + ' | ' + (days + offset))
        return days + offset;
    }

    function workday_count(start,end) {
        // Validate input
        if (end < start)
            return 0;
        if (isEmpty(end) || isEmpty(start))
            return 0;

        start = moment(start);
        end = moment(end);

        var first = start.clone().endOf('week'); // end of first week
        var last = end.clone().startOf('week'); // start of last week
        var days = last.diff(first,'days') * 5 / 7; // this will always multiply of 7
        var wfirst = first.day() - start.day(); // check first week
        if(start.day() == 0) --wfirst; // -1 if start with sunday
        var wlast = end.day() - last.day(); // check last week
        if(end.day() == 6) --wlast; // -1 if end with saturday
        return wfirst + Math.floor(days) + wlast; // get the total
    }

    var GLOBAL = {
        param_4weekly: '',
        param_weekly: '',
        param_daily: '',
        param_hour: '',
        defaultstatdate: '',
        defaultenddate: '',
        param_ldw: ''
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
        GLOBAL.param_ldw = currentScript.getParameter({name: 'custscript_sna_group_ldw'});

        var currrec = currentRecord.get();
        var fromline = currrec.getValue({fieldId: 'custpage_fromlinefld'});

        window.opener.require(['N/currentRecord'], function() {

            var rec = window.opener.require('N/currentRecord').get();

            // from SO or quote line
            if (fromline == 'T') {
                var objconfig = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator'});
                var objconfig2 = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator_2'});

                var parsedconfigfields = !isEmpty(objconfig) ? JSON.parse(objconfig) : [];
                var parsedconfig2fields = !isEmpty(objconfig2) ? JSON.parse(objconfig2) : [];
                var combined = parsedconfigfields.concat(parsedconfig2fields);

                rec.setValue({fieldId: 'custbody_sna_hul_rental_temp_config', value: (combined.length == 0 ? '' : JSON.stringify(combined))}); // get the current configuration
            }

            var startdate = rec.getValue({fieldId: 'startdate'});
            if (isEmpty(startdate)) {
                startdate = new Date();
            }
            defaultstatdate = startdate;
            currrec.setValue({fieldId: 'custpage_startdatefld', value: startdate});

            var enddate = rec.getValue({fieldId: 'enddate'});
            if (!isEmpty(enddate)) {
                defaultenddate = enddate;
            }
            currrec.setValue({fieldId: 'custpage_enddatefld', value: enddate});

            var waive = rec.getValue({fieldId: 'custbody_sna_hul_waive_insurance'});
            var cust = rec.getValue({fieldId: 'entity'});

            var coi = '';
            var coiexpiry = '';

            if (!isEmpty(cust)) {
                var custflds = search.lookupFields({type: 'customer', id: cust, columns: ['custentity_sna_cert_of_insurance', 'custentity_sna_hul_date_of_exp_coi']});
                coi = !isEmpty(custflds.custentity_sna_cert_of_insurance) ? custflds.custentity_sna_cert_of_insurance[0].value : '';
                coiexpiry = !isEmpty(custflds.custentity_sna_hul_date_of_exp_coi) ? new Date(custflds.custentity_sna_hul_date_of_exp_coi) : '';
            }

            if (waive || (!isEmpty(coi) && !isEmpty(coiexpiry) && coiexpiry > new Date(trandate))) {
                disableFld('custpage_ldwitmfld', true, currrec);
                disableFld('custpage_ldwfld', true, currrec);
                disableFld('custpage_ldwamtfld', true, currrec);
            }
            else {
                disableFld('custpage_ldwitmfld', false, currrec);
                disableFld('custpage_ldwfld', false, currrec);
                disableFld('custpage_ldwamtfld', false, currrec);
            }
        });
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
        var fldid = scriptContext.fieldId;

        var currrec = scriptContext.currentRecord;

        // set Time Unit Price, Best Option table, Number of Hours
        if (fldid == 'custpage_selectbestfld' || fldid == 'custpage_timeqtyfld') {
            var bestprice = currrec.getValue({fieldId: 'custpage_bestpricefld'});
            var ratecard = currrec.getValue({fieldId: 'custpage_rentalcardidfld'});
            var trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
            var timeqty = currrec.getValue({fieldId: 'custpage_timeqtyfld'});
            var timeunit = currrec.getValue({fieldId: 'custpage_timeunitfld'});
            var selectedbest = currrec.getValue({fieldId: 'custpage_selectbestfld'});

            // just in case empty but unlikely
            if (isEmpty(bestprice)) {
                var ratecardsub = getTimeUnitPrice(null, trandate, ratecard);
                currrec.setValue({fieldId: 'custpage_bestpricefld', value: JSON.stringify(ratecardsub)});

                var bestprice = currrec.getValue({fieldId: 'custpage_bestpricefld'});
            }

            var ratecardsub = !isEmpty(bestprice) ? JSON.parse(bestprice) : {};

            setBestPriceTable(currrec, ratecardsub, timeunit, timeqty, selectedbest);
        }

        // set Time Quantity
        if (fldid == 'custpage_startdatefld' || fldid == 'custpage_enddatefld') {
            var startdate = currrec.getValue({fieldId: 'custpage_startdatefld'});
            var enddate = currrec.getValue({fieldId: 'custpage_enddatefld'});

            // alert to inform that changing start date will affect the start date of all lines
            if (fldid == 'custpage_startdatefld') {
                if (format.format({value: defaultstatdate, type: format.Type.DATE}) !== format.format({value: startdate, type: format.Type.DATE})) {
                    alert('The new start date may not match the start date of the other rental items in this order.')
                }
            }

            if (!isEmpty(startdate) && !isEmpty(enddate)) {
                //console.log('startdate: ' + startdate  + ' | enddate: ' + enddate);
                //console.log('moment dates: ' + moment(startdate).toString() + ' | ' + moment(enddate).toString());
                //console.log('new dates: ' + new Date(startdate)  + ' | ' + new Date(enddate));
                //startdate.setMinutes(startdate.getMinutes() + startdate.getTimezoneOffset());
                //enddate.setMinutes(enddate.getMinutes() + enddate.getTimezoneOffset());

                var timeqty = workday_count(startdate, enddate); // no need to get rental days because time unit is always Day

                currrec.setValue({fieldId: 'custpage_timeqtyfld', value: timeqty});

                // aduldulao remove
                /*var startstr = format.format({value: startdate, type: format.Type.DATE});
                console.log('startstr: ' + startstr);
                var startparts = startstr.split('/');
                console.log('split: ' + new Date(startparts[2], startparts[1]-1, startparts[0]));
                var tstartdate = format.parse({value: startstr, type: format.Type.DATE});
                tstartdate.setMinutes(tstartdate.getMinutes() + tstartdate.getTimezoneOffset());

                var endstr = format.format({value: enddate, type: format.Type.DATE});
                console.log('endstr: ' + endstr);
                var endparts = endstr.split('/');
                console.log('split end: ' + new Date(endparts[2], endparts[1]-1, endparts[0]));
                var tenddate = format.parse({value: endstr, type: format.Type.DATE});
                tenddate.setMinutes(tenddate.getMinutes() + tenddate.getTimezoneOffset());

                console.log('tstartdate.getTimezoneOffset(): ' + tstartdate.getTimezoneOffset() + ' | tenddate.getTimezoneOffset(): ' + tenddate.getTimezoneOffset());
                console.log('tstartdate: ' + tstartdate + ' | ' + tstartdate.getTime() + ' | tenddate: ' + tenddate + ' | ' + tenddate.getTime());
                currrec.setValue({fieldId: 'custpage_test1_timeqtyfld', value: workingDaysBetweenDates(tstartdate, tenddate)});*/
            }
            else {
                currrec.setValue({fieldId: 'custpage_timeqtyfld', value: ''});
            }
        }

        // set Object Subtotal
        if (fldid == 'custpage_timeqtyfld' || fldid == 'custpage_timeunitprcfld' || fldid == 'custpage_selectbestfld') {
            var timeqty = currrec.getValue({fieldId: 'custpage_timeqtyfld'});
            var timeprce = currrec.getValue({fieldId: 'custpage_timeunitprcfld'});
            var selectedbest = currrec.getValue({fieldId: 'custpage_selectbestfld'});
            var timeunit = currrec.getValue({fieldId: 'custpage_timeunitfld'});

            // default from rate card sublist
            if (selectedbest == 1) {
                var objst = forceFloat(timeqty) * forceFloat(timeprce);
            }
            // from best option table
            else {
                var rentaldays = getRentalDays(timeunit, timeqty);
                var objst = forceFloat(rentaldays) * forceFloat(timeprce); // item price is expected to be unit cost per day
            }

            currrec.setValue({fieldId: 'custpage_objsubfld', value: round(forceFloat(objst), 2)});
        }

        // set LDW Amount
        if (fldid == 'custpage_ldwfld' || fldid == 'custpage_objsubfld') {
            var perc = currrec.getValue({fieldId: 'custpage_ldwfld'});
            var objst = currrec.getValue({fieldId: 'custpage_objsubfld'});

            var amt = (forceFloat(perc) / 100) * forceFloat(objst);
            currrec.setValue({fieldId: 'custpage_ldwamtfld', value: amt});
        }

        // set CDW Amount
        if (fldid == 'custpage_cdwfld' || fldid == 'custpage_objsubfld') {
            var perc = currrec.getValue({fieldId: 'custpage_cdwfld'});
            var objst = currrec.getValue({fieldId: 'custpage_objsubfld'});

            var amt = (forceFloat(perc) / 100) * forceFloat(objst);
            currrec.setValue({fieldId: 'custpage_cdwamtfld', value: amt});
        }

        // set LIS Amount
        if (fldid == 'custpage_lisfld' || fldid == 'custpage_objsubfld') {
            var perc = currrec.getValue({fieldId: 'custpage_lisfld'});
            var objst = currrec.getValue({fieldId: 'custpage_objsubfld'});

            var amt = (forceFloat(perc) / 100) * forceFloat(objst);
            currrec.setValue({fieldId: 'custpage_lisamtfld', value: amt});
        }

        // set Environmental Charge
        if (fldid == 'custpage_envifld' || fldid == 'custpage_objsubfld') {
            var perc = currrec.getValue({fieldId: 'custpage_envifld'});
            var objst = currrec.getValue({fieldId: 'custpage_objsubfld'});

            var amt = (forceFloat(perc) / 100) * forceFloat(objst);
            currrec.setValue({fieldId: 'custpage_enviamtfld', value: amt});
        }

        // set Charge Code Amount
        if (fldid == 'custpage_charge1fld' || fldid == 'custpage_charge2fld' || fldid == 'custpage_charge3fld' || fldid == 'custpage_timeunitfld') {
            var otcharge = currrec.getValue({fieldId: 'custpage_overchargefld'});

            var chargeitm1 = currrec.getValue({fieldId: 'custpage_charge1fld'});
            var chargeitm2 = currrec.getValue({fieldId: 'custpage_charge2fld'});
            var chargeitm3 = currrec.getValue({fieldId: 'custpage_charge3fld'});

            if (chargeitm1 == otcharge || chargeitm2 == otcharge || chargeitm3 == otcharge) {
                var ratecard = currrec.getValue({fieldId: 'custpage_rentalcardidfld'});
                var trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
                var timeunit = currrec.getValue({fieldId: 'custpage_timeunitfld'});

                var ratecardsub = getTimeUnitPrice(null, trandate, ratecard);
                var m1unitprice = !isEmpty(ratecardsub[timeunit+'_m1']) ? ratecardsub[timeunit+'_m1'] : (!isEmpty(ratecardsub[timeunit+'_temp_m1']) ? ratecardsub[timeunit+'_temp_m1'] : '');

                if (chargeitm1 == otcharge && !isEmpty(otcharge)) {
                    currrec.setValue({fieldId: 'custpage_charge1amtfld', value: m1unitprice});
                }
                if (chargeitm2 == otcharge && !isEmpty(otcharge)) {
                    currrec.setValue({fieldId: 'custpage_charge2amtfld', value: m1unitprice});
                }
                if (chargeitm3 == otcharge && !isEmpty(otcharge)) {
                    currrec.setValue({fieldId: 'custpage_charge3amtfld', value: m1unitprice});
                }
            }
        }

        // set Default Charges Subtotal
        if (fldid == 'custpage_ldwamtfld' || fldid == 'custpage_cdwamtfld' || fldid == 'custpage_lisamtfld' || fldid == 'custpage_enviamtfld') {
            var ldw = currrec.getValue({fieldId: 'custpage_ldwamtfld'});
            var cdw = currrec.getValue({fieldId: 'custpage_cdwamtfld'});
            var lis = currrec.getValue({fieldId: 'custpage_lisamtfld'});
            var envi = currrec.getValue({fieldId: 'custpage_enviamtfld'});

            var amt = forceFloat(ldw) + forceFloat(cdw) + forceFloat(lis) + forceFloat(envi);
            currrec.setValue({fieldId: 'custpage_defaultchargesubfld', value: amt});
        }

        // Add On Charges Subtotal
        if (fldid == 'custpage_charge1amtfld' || fldid == 'custpage_charge2amtfld' || fldid == 'custpage_charge3amtfld') {
            var charge1 = currrec.getValue({fieldId: 'custpage_charge1amtfld'});
            var charge2 = currrec.getValue({fieldId: 'custpage_charge2amtfld'});
            var charge3 = currrec.getValue({fieldId: 'custpage_charge3amtfld'});

            var amt = forceFloat(charge1) + forceFloat(charge2) + forceFloat(charge3);
            currrec.setValue({fieldId: 'custpage_addonsubfld', value: amt});
        }

        // set Total Cost
        if (fldid == 'custpage_objsubfld' || fldid == 'custpage_defaultchargesubfld' || fldid == 'custpage_addonsubfld') {
            var objsub = currrec.getValue({fieldId: 'custpage_objsubfld'});
            var chargesub = currrec.getValue({fieldId: 'custpage_defaultchargesubfld'});
            var addonsub = currrec.getValue({fieldId: 'custpage_addonsubfld'});

            var amt = forceFloat(objsub) + forceFloat(chargesub) + forceFloat(addonsub);
            currrec.setValue({fieldId: 'custpage_totalfld', value: amt});
        }

        // disable LDW fields
        if (fldid == 'custpage_ldwitmfld') {
            var chritm = currrec.getValue({fieldId: 'custpage_ldwitmfld'});

            if (isEmpty(chritm)) {
                disableFld('custpage_ldwfld', true, currrec);
                disableFld('custpage_ldwamtfld', true, currrec);
            }
            else {
                disableFld('custpage_ldwfld', false, currrec);
                disableFld('custpage_ldwamtfld', false, currrec);
            }
        }

        // disable CDW fields
        if (fldid == 'custpage_cdwitmfld') {
            var chritm = currrec.getValue({fieldId: 'custpage_cdwitmfld'});

            if (isEmpty(chritm)) {
                disableFld('custpage_cdwfld', true, currrec);
                disableFld('custpage_cdwamtfld', true, currrec);
            }
            else {
                disableFld('custpage_cdwfld', false, currrec);
                disableFld('custpage_cdwamtfld', false, currrec);
            }
        }

        // disable LIS fields
        if (fldid == 'custpage_lisitmfld') {
            var chritm = currrec.getValue({fieldId: 'custpage_lisitmfld'});

            if (isEmpty(chritm)) {
                disableFld('custpage_lisfld', true, currrec);
                disableFld('custpage_lisamtfld', true, currrec);
            }
            else {
                disableFld('custpage_lisfld', false, currrec);
                disableFld('custpage_lisamtfld', false, currrec);
            }
        }

        // disable ENVI fields
        if (fldid == 'custpage_enviitmfld') {
            var chritm = currrec.getValue({fieldId: 'custpage_enviitmfld'});

            if (isEmpty(chritm)) {
                disableFld('custpage_envifld', true, currrec);
                disableFld('custpage_enviamtfld', true, currrec);
            }
            else {
                disableFld('custpage_envifld', false, currrec);
                disableFld('custpage_enviamtfld', false, currrec);
            }
        }

        // disable Charge 1 fields
        if (fldid == 'custpage_charge1fld') {
            var chritm = currrec.getValue({fieldId: 'custpage_charge1fld'});

            if (isEmpty(chritm)) {
                disableFld('custpage_charge1amtfld', true, currrec);
            } else {
                disableFld('custpage_charge1amtfld', false, currrec);
            }
        }

        // disable Charge 2 fields
        if (fldid == 'custpage_charge2fld') {
            var chritm = currrec.getValue({fieldId: 'custpage_charge2fld'});

            if (isEmpty(chritm)) {
                disableFld('custpage_charge2amtfld', true, currrec);
            }
            else {
                disableFld('custpage_charge2amtfld', false, currrec);
            }
        }

        // disable Charge 3 fields
        if (fldid == 'custpage_charge3fld') {
            var chritm = currrec.getValue({fieldId: 'custpage_charge3fld'});

            if (isEmpty(chritm)) {
                disableFld('custpage_charge3amtfld', true, currrec);
            }
            else {
                disableFld('custpage_charge3amtfld', false, currrec);
            }
        }
    }

    /**
     * Disable fields
     * @param fldid
     * @param val
     * @param currrec
     */
    function disableFld(fldid, val, currrec) {
        var fld = currrec.getField({fieldId: fldid});
        fld.isDisabled = val;

        if (val) {
            currrec.setValue({fieldId: fldid, value: ''});
        }
    }

    /**
     * Goes back to the page's previous state
     */
    function backButton() {
        var currrec = currentRecord.get();
        var selected = currrec.getValue({fieldId: 'custpage_objidfld'});
        var cust = currrec.getValue({fieldId: 'custpage_custfld'});
        var custgrp = currrec.getValue({fieldId: 'custpage_custpricegrpfld'});
        var trandate = currrec.getValue({fieldId: 'custpage_trandtefld'});
        var loccode = currrec.getValue({fieldId: 'custpage_loccodefld'});
        var fromline = currrec.getValue({fieldId: 'custpage_fromlinefld'});
        var linenum = currrec.getValue({fieldId: 'custpage_linenumfld'});
        var rentalcomments = currrec.getValue({fieldId: 'custpage_configcommentsfld'});

        var fullURL = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectratecard', deploymentId: 'customdeploy_sna_hul_sl_selectratecard',
            params: {
                selected: selected,
                fromline: fromline,
                linenum: linenum,
                cust: cust,
                custgrp: custgrp,
                trandate: !isEmpty(trandate) ? format.format({value: new Date(trandate), type: format.Type.DATE}) : '',
                loccode: loccode,
                rentalcomments: rentalcomments
            }
        });

        // This disables the confirmation dialog: 'Changes you made may not be saved.' when redirecting the suitelet page.
        window.onbeforeunload = null;
        window.document.location = fullURL;
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var currrec = scriptContext.currentRecord;
        var serviceitem = currrec.getValue({fieldId: 'custpage_serviceitmfld'});
        var objid = currrec.getValue({fieldId: 'custpage_objidfld'});
        var serviceitem = currrec.getValue({fieldId: 'custpage_serviceitmfld'});
        var timeunit = currrec.getValue({fieldId: 'custpage_timeunitfld'});
        var timeqty = currrec.getValue({fieldId: 'custpage_timeqtyfld'});
        var nohr = currrec.getValue({fieldId: 'custpage_numhrfld'});
        var timeunitprice = currrec.getValue({fieldId: 'custpage_timeunitprcfld'});
        var startdate = currrec.getValue({fieldId: 'custpage_startdatefld'});
        var enddate = currrec.getValue({fieldId: 'custpage_enddatefld'});
        var selectedbest = currrec.getValue({fieldId: 'custpage_selectbestfld'});
        var objtotal = currrec.getValue({fieldId: 'custpage_objsubfld'});
        var earliestdte = currrec.getValue({fieldId: 'custpage_earliestdtefld'});
        var fromline = currrec.getValue({fieldId: 'custpage_fromlinefld'});
        var linenum = currrec.getValue({fieldId: 'custpage_linenumfld'});
        var min_dayprice = currrec.getValue({fieldId: 'custpage_mindayfld'});
        var min_weekprice = currrec.getValue({fieldId: 'custpage_minweekfld'});
        var extra_days = currrec.getValue({fieldId: 'custpage_extradaysfld'});
        var rentalcomments = currrec.getValue({fieldId: 'custpage_configcommentsfld'});

        if (!isEmpty(startdate) && !isEmpty(earliestdte) && startdate < earliestdte) {
            alert('Start Date is less than Earliest Available Date');
            return false;
        }

        if (isEmpty(startdate) || isEmpty(enddate) || isEmpty(timeunitprice)) {
            alert('Please enter value(s) for: Start Date, End Date, Time Unit Price');
            return false;
        }

        var ldwitm = currrec.getValue({fieldId: 'custpage_ldwitmfld'});
        var cdwitm = currrec.getValue({fieldId: 'custpage_cdwitmfld'});
        var lisitm = currrec.getValue({fieldId: 'custpage_lisitmfld'});
        var enviitm = currrec.getValue({fieldId: 'custpage_enviitmfld'});
        var ldwamt = currrec.getValue({fieldId: 'custpage_ldwamtfld'});
        var cdwamt = currrec.getValue({fieldId: 'custpage_cdwamtfld'});
        var lisamt = currrec.getValue({fieldId: 'custpage_lisamtfld'});
        var enviamt = currrec.getValue({fieldId: 'custpage_enviamtfld'});
        var ldwper = currrec.getValue({fieldId: 'custpage_ldwfld'});
        var cdwper = currrec.getValue({fieldId: 'custpage_cdwfld'});
        var lisper = currrec.getValue({fieldId: 'custpage_lisfld'});
        var enviper = currrec.getValue({fieldId: 'custpage_envifld'});

        var charge1 = currrec.getValue({fieldId: 'custpage_charge1fld'});
        var charge1amt = currrec.getValue({fieldId: 'custpage_charge1amtfld'});
        var charge2 = currrec.getValue({fieldId: 'custpage_charge2fld'});
        var charge2amt = currrec.getValue({fieldId: 'custpage_charge2amtfld'});
        var charge3 = currrec.getValue({fieldId: 'custpage_charge3fld'});
        var charge3amt = currrec.getValue({fieldId: 'custpage_charge3amtfld'});

        // time unit cost
        var ratecard = currrec.getValue({fieldId: 'custpage_rentalcardidfld'});
        var bestprice = currrec.getValue({fieldId: 'custpage_bestpricefld'});
        var ratecardsub = !isEmpty(bestprice) ? JSON.parse(bestprice) : {};

        var dailyunitcost = !isEmpty(ratecardsub[GLOBAL.param_daily]) ? ratecardsub[GLOBAL.param_daily] : (!isEmpty(ratecardsub[GLOBAL.param_daily+'_temp']) ? ratecardsub[GLOBAL.param_daily+'_temp'] : '');
        var weeklyunitcost = !isEmpty(ratecardsub[GLOBAL.param_weekly]) ? ratecardsub[GLOBAL.param_weekly] : (!isEmpty(ratecardsub[GLOBAL.param_weekly+'_temp']) ? ratecardsub[GLOBAL.param_weekly+'_temp'] : '');
        var fourweekunitcost = !isEmpty(ratecardsub[GLOBAL.param_4weekly]) ? ratecardsub[GLOBAL.param_4weekly] : (!isEmpty(ratecardsub[GLOBAL.param_4weekly+'_temp']) ? ratecardsub[GLOBAL.param_4weekly+'_temp'] : '');

        var objmodel = '';
        var objfleetcode = '';

        window.opener.require(['N/currentRecord'], function() {
            var rec = window.opener.require('N/currentRecord').get();
            var configfields = rec.getValue({fieldId: 'custbody_sna_hul_rental_temp_config'});
            var config2fields = '';

            if (!isEmpty(configfields)) {
                var parsedconfig = JSON.parse(configfields);
                var parsedlen = forceFloat(parsedconfig.length);
                var configlen = forceFloat(configfields.length);

                var currlen = forceFloat(configlen);
                var newconfig = [];

                // 4000 character max for text area
                if (configlen > 4000) {
                    for (var i = parsedlen - 1; i >= 0; i--) {
                        var element = parsedconfig[i];
                        var elemlen = forceFloat(JSON.stringify(element).length);

                        if (currlen > 3900) {
                            newconfig.push(element);
                            parsedconfig.splice(i, 1);

                        }
                        else {
                            break;
                        }

                        currlen = currlen - elemlen;
                    }

                    configfields = JSON.stringify(parsedconfig);
                    config2fields = JSON.stringify(newconfig);
                }
            }

            if (!isEmpty(objid)) {
                var objflds = search.lookupFields({type: 'customrecord_sna_objects', id: objid, columns: ['custrecord_sna_equipment_group', 'custrecord_sna_equipment_model', 'custrecord_sna_fleet_code']});

                if (!isEmpty(objflds.custrecord_sna_equipment_model)) {
                    objmodel = objflds.custrecord_sna_equipment_model[0].value;
                }

                if (!isEmpty(objflds.custrecord_sna_fleet_code)) {
                    objfleetcode = objflds.custrecord_sna_fleet_code;
                }
            }

            if (!isEmpty(serviceitem)) {
                var allowMultDates = rec.getValue({fieldId: 'custbody_sna_allow_mult_rental'});

                if (!allowMultDates) {
                    rec.setValue({fieldId: 'startdate', value: startdate});
                    rec.setValue({fieldId: 'enddate', value: enddate});
                }

                if (fromline != 'T') {
                    rec.selectNewLine({sublistId: 'item'});
                }

                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: serviceitem, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_object', value: objid, forceSyncSourcing: true, ignoreFieldChange: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', value: objid, forceSyncSourcing: true, ignoreFieldChange: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_po_fleet_code', value: objfleetcode, forceSyncSourcing: true, ignoreFieldChange: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_obj_model', value: objmodel, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_time_unit', value: timeunit, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rental_hrs', value: nohr, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1, forceSyncSourcing: true}); // custom
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: forceFloat(timeqty), forceSyncSourcing: true});
                // default from rate card sublist
                if (selectedbest == 1) {
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(timeunitprice), forceSyncSourcing: true});
                }
                // from best option table
                else {
                    var newrate = forceFloat(objtotal) / forceFloat(timeqty);

                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(newrate), forceSyncSourcing: true});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'amount', value: forceFloat(objtotal), forceSyncSourcing: true});
                }
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_start_date', value: startdate, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', value: enddate, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator', value: configfields, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator_2', value: config2fields, forceSyncSourcing: true});

                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_rental_rate_card', value: ratecard, ignoreFieldChange: true, forceSyncSourcing: true}); // has client script trigger
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_rate', value: dailyunitcost, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_weekly_rate', value: weeklyunitcost, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_4week_rate', value: fourweekunitcost, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_bestprice', value: min_dayprice, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_week_bestprice', value: min_weekprice, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_extra_days', value: extra_days, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rental_config_comment', value: rentalcomments, forceSyncSourcing: true});
                rec.commitLine({sublistId: 'item'});
            }

            var currentlen = rec.getLineCount({sublistId: 'item'}); // get position of latest rental charge. issue here if user removes lines before saving

            if (fromline == 'T') {
                removeOldCharges(linenum, objid, rec);
            }

            setChargeItem(rec, ldwitm, ldwamt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty, ldwper);
            setChargeItem(rec, cdwitm, cdwamt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty, cdwper);
            setChargeItem(rec, lisitm, lisamt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty, lisper);
            setChargeItem(rec, enviitm, enviamt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty, enviper);

            setChargeItem(rec, charge1, charge1amt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty);
            setChargeItem(rec, charge2, charge2amt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty);
            setChargeItem(rec, charge3, charge3amt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty);
        });

        return true;
    }

    /**
     * Remove old charges
     * @param linenum
     * @param objid
     * @param rec
     */
    function removeOldCharges(linenum, objid, rec) {
        var lastindex = parseInt(linenum) + 7; // max of 7 charges always added after main rental item
        var currentlen = rec.getLineCount({sublistId: 'item'});

        for (var l = lastindex; l > linenum; l--) { // start at next index
            if (l < currentlen) { // make sure it does not exceed sublist count
                var currobj = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: l});
                var itmtype = rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: l});

                if (itmtype == 'OthCharge' && currobj == objid) {
                    rec.removeLine({sublistId: 'item', line: l});
                }
            }
        }
    }

    /**
     * set the charge items
     * @param rec
     * @param chargeitm
     * @param chargeamt
     * @param startdate
     * @param enddate
     * @param timeunit
     * @param objid
     * @param objmodel
     * @param linenum
     * @param fromline
     */
    function setChargeItem(rec, chargeitm, chargeamt, startdate, enddate, timeunit, objid, objmodel, objfleetcode, linenum, fromline, timeqty, per) {
        var nextlineindx = parseInt(linenum)+1;
        var currlen = rec.getLineCount({sublistId: 'item'});

        if (!isEmpty(chargeitm)) {
            if (fromline == 'T' && parseInt(nextlineindx)+1 < currlen) { // insert before next rental item if any
                rec.insertLine({sublistId: 'item', line: nextlineindx});
            }
            else {
                rec.selectNewLine({sublistId: 'item'});
            }

            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: chargeitm, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_object', value: objid, forceSyncSourcing: true, ignoreFieldChange: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', value: objid, forceSyncSourcing: true, ignoreFieldChange: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_po_fleet_code', value: objfleetcode, forceSyncSourcing: true, ignoreFieldChange: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_obj_model', value: objmodel, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_time_unit', value: timeunit, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'price', value: -1, forceSyncSourcing: true}); // custom
            var chargeitmname = rec.getCurrentSublistText({sublistId: 'item', fieldId: 'item'});
            if (chargeitmname.toUpperCase() == 'R OVERTIME') {
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: 0, forceSyncSourcing: true});
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(chargeamt), forceSyncSourcing: true});
            }
            else {
                var itmgroup = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i});

                if (itmgroup == GLOBAL.param_ldw) {
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: forceFloat(timeqty), forceSyncSourcing: true});
                    var newrate = forceFloat(chargeamt) / forceFloat(timeqty);
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(newrate), forceSyncSourcing: true});
                }
                else {
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: 1, forceSyncSourcing: true});
                    rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(chargeamt), forceSyncSourcing: true});
                }
            }

            if (!isEmpty(per)) {
                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sn_hul_othercharge_percent', value: per, forceSyncSourcing: true});
            }
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_start_date', value: startdate, forceSyncSourcing: true});
            rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', value: enddate, forceSyncSourcing: true});
            rec.commitLine({sublistId: 'item'});
        }
    }

    /**
     * Get rental days
     * @param timeunit
     * @param timeqty
     * @returns {string}
     */
    function getRentalDays(timeunit, timeqty) {
        // get rental days
        var rentaldays = '';

        if (timeunit == GLOBAL.param_hour) {
            rentaldays = forceFloat(timeqty) / 8;
        }
        else if (timeunit == GLOBAL.param_daily) {
            rentaldays = timeqty;
        }
        else if (timeunit == GLOBAL.param_weekly) {
            rentaldays = forceFloat(timeqty) * 5;
        }
        else if (timeunit == GLOBAL.param_4weekly) {
            rentaldays = forceFloat(timeqty) * 20;
        }

        return rentaldays;
    }

    /**
     * Set Time Unit Price and Best Option table
     * @param currrec
     * @param ratecardsub
     * @param timeunit
     * @param timeqty
     * @param selectedbest
     */
    function setBestPriceTable(currrec, ratecardsub, timeunit, timeqty, selectedbest) {
        // get rental days
        var rentaldays = forceFloat(getRentalDays(timeunit, timeqty));
        var fourweeks = 0;
        var days = 0;

        // get number of 20 days and remaining days
        if (rentaldays <= 20) {
            days = rentaldays;
        }
        else {
            var total20days = rentaldays / 20;
            fourweeks = Math.trunc(total20days);
            days = rentaldays - (fourweeks * 20);
        }

        // time unit cost based on selected rate card
        var dailym1 = !isEmpty(ratecardsub[GLOBAL.param_daily+'_m1']) ? ratecardsub[GLOBAL.param_daily+'_m1'] : (!isEmpty(ratecardsub[GLOBAL.param_daily+'_temp_m1']) ? ratecardsub[GLOBAL.param_daily+'_temp_m1'] : '');
        var dailyunitcost = !isEmpty(ratecardsub[GLOBAL.param_daily]) ? ratecardsub[GLOBAL.param_daily] : (!isEmpty(ratecardsub[GLOBAL.param_daily+'_temp']) ? ratecardsub[GLOBAL.param_daily+'_temp'] : '');
        var dailyperday = dailyunitcost;
        var dailytotal = forceFloat(dailyperday) * forceFloat(rentaldays);

        var weeklym1 = !isEmpty(ratecardsub[GLOBAL.param_weekly+'_m1']) ? ratecardsub[GLOBAL.param_weekly+'_m1'] : (!isEmpty(ratecardsub[GLOBAL.param_weekly+'_temp_m1']) ? ratecardsub[GLOBAL.param_weekly+'_temp_m1'] : '');
        var weeklyunitcost = !isEmpty(ratecardsub[GLOBAL.param_weekly]) ? ratecardsub[GLOBAL.param_weekly] : (!isEmpty(ratecardsub[GLOBAL.param_weekly+'_temp']) ? ratecardsub[GLOBAL.param_weekly+'_temp'] : '');
        var weeklyperday = forceFloat(weeklyunitcost) / 5;
        var weeklytotal = forceFloat(weeklyperday) * forceFloat(rentaldays);

        var fourweekm1 = !isEmpty(ratecardsub[GLOBAL.param_4weekly+'_m1']) ? ratecardsub[GLOBAL.param_4weekly+'_m1'] : (!isEmpty(ratecardsub[GLOBAL.param_4weekly+'_temp_m1']) ? ratecardsub[GLOBAL.param_4weekly+'_temp_m1'] : '');
        var fourweekunitcost = !isEmpty(ratecardsub[GLOBAL.param_4weekly]) ? ratecardsub[GLOBAL.param_4weekly] : (!isEmpty(ratecardsub[GLOBAL.param_4weekly+'_temp']) ? ratecardsub[GLOBAL.param_4weekly+'_temp'] : '');
        var fourweekperday = forceFloat(fourweekunitcost) / 20;
        var fourweektotal = forceFloat(fourweekperday) * rentaldays;

        console.log('dailyunitcost: ' + dailyunitcost + ' | weeklyunitcost: ' + weeklyunitcost + ' | fourweekunitcost: ' + fourweekunitcost);

        // set final unit price
        var finalunitprice = '';
        var defaultprice = '';
        var defaultunitprice = '';
        var finalnohr = forceFloat(rentaldays) * 8;

        // get best prices
        //var formula = getBestPriceFormula(fourweeks, days, dailyunitcost, weeklyunitcost, fourweekunitcost);
        //var bestprice = getBestPrice(days, formula, dailyunitcost, weeklyunitcost, fourweekunitcost);
        var bestprices = getBestPriceFormula(fourweeks, days, dailyunitcost, weeklyunitcost, fourweekunitcost);
        var bestprice = bestprices.finalprice;
        var bestpriceunit = !isEmpty(bestprice) && !isEmpty(rentaldays) ? forceFloat(forceFloat(bestprice) / rentaldays) : '';

        // get default prices
        if (timeunit == GLOBAL.param_daily) {
            defaultunitprice = dailyperday;
            defaultprice = dailytotal;
        }
        else if (timeunit == GLOBAL.param_weekly) {
            defaultunitprice = weeklyperday;
            defaultprice = weeklytotal;
        }
        else if (timeunit == GLOBAL.param_4weekly) {
            defaultunitprice = fourweekperday;
            defaultprice = fourweektotal;
        }

        // finalunitprice from rate card sublist
        if (selectedbest == 1) {
            if (timeunit == GLOBAL.param_daily) {
                finalunitprice = dailyunitcost;
            }
            else if (timeunit == GLOBAL.param_weekly) {
                finalunitprice = weeklyunitcost;
            }
            else if (timeunit == GLOBAL.param_4weekly) {
                finalunitprice = fourweekunitcost;
            }
        }
        // finalunitprice from best option
        else {
            finalunitprice = bestpriceunit;
        }

        // new table with total cost
        var htmltable = '<table style="font-size:10px">';
        htmltable += '<tr><td></td><td></td><td><b># of Days</b></td><td><b>Unit Price</b></td><td><b>Total Price</b></td></tr>';
        htmltable += '<tr>';
        htmltable += '<td>a.</td>';
        htmltable += '<td>Default</td>';
        htmltable += '<td>' + rentaldays + '</td>';
        htmltable += '<td>' + formatCurrency(defaultunitprice, '', 2) + '</td>';
        htmltable += '<td>' + formatCurrency(defaultprice, '', 2) + '</td>';
        htmltable += '</tr>';
        htmltable += '<tr>';
        htmltable += '<td>b.</td>';
        htmltable += '<td>Best Price</td>';
        htmltable += '<td>' + rentaldays + '</td>';
        htmltable += '<td>' + formatCurrency(bestpriceunit, '', 2) + '</td>';
        htmltable += '<td>' + formatCurrency(bestprice, '', 2) + '</td>';
        htmltable += '</tr>';
        htmltable += '</table><br /><br />';

        currrec.setValue({fieldId: 'custpage_htmlfld', value: htmltable});
        currrec.setValue({fieldId: 'custpage_timeunitprcfld', value: finalunitprice});
        currrec.setValue({fieldId: 'custpage_numhrfld', value: finalnohr});
        currrec.setValue({fieldId: 'custpage_mindayfld', value: bestprices.min_dayprice});
        currrec.setValue({fieldId: 'custpage_minweekfld', value: bestprices.min_weekprice});
        currrec.setValue({fieldId: 'custpage_extradaysfld', value: days});
    }

    /**
     * Get formula from custom record
     * @param fourweeks
     * @param days
     * @returns {string}
     */
    function getBestPriceFormula(fourweeks, days, dailyunitcost, weeklyunitcost, fourweekunitcost) {
        console.log('fourweeks: ' + fourweeks + ' | days: ' + days + ' | dailyunitcost: ' + dailyunitcost + ' | weeklyunitcost: ' + weeklyunitcost + ' | fourweekunitcost: ' + fourweekunitcost);

        if (isEmpty(days)) return '';

        var finalformula = '';
        var weekformula = [];
        var dayformula = [];

        // days is always <= 20
        var filters = [];
        filters.push(['custrecord_sna_hul_no_of_day', search.Operator.EQUALTO, days]);
        if (!isEmpty(fourweeks) && forceFloat(fourweeks) > 0) {
            filters.push('or');
            filters.push(['custrecord_sna_hul_no_of_day', search.Operator.EQUALTO, '20']);
        }

        var columns = [];
        columns.push(search.createColumn({name: 'custrecord_sna_hul_formula'}));
        columns.push(search.createColumn({name: 'custrecord_sna_hul_no_of_day'}));

        var sear = search.create({type: 'customrecord_sna_hul_rental_best_price', filters: filters, columns: columns});
        sear.run().each(function(result) {
            var numdays = result.getValue({name: 'custrecord_sna_hul_no_of_day'});
            var formla = result.getValue({name: 'custrecord_sna_hul_formula'});

            if (!isEmpty(formla)) {
                if (numdays == days) {
                    dayformula.push(formla);
                }
                if (numdays == '20') {
                    weekformula.push(formla);
                }
            }

            return true;
        });

        console.log('dayformula: ' + JSON.stringify(dayformula) + ' | weekformula: ' + JSON.stringify(weekformula));

        var min_weekprice = 0;
        var min_dayprice = 0;
        var finalprice = 0;

        if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(dayformula)) {
            var dayprices = [];
            for (var b = 0; b < dayformula.length; b++) {
                dayprices.push(getBestPrice(days, dayformula[b], dailyunitcost, weeklyunitcost, fourweekunitcost));
            }

            console.log('dayprices: ' + dayprices.toString());
            min_dayprice = Math.min.apply(Math, dayprices);

            finalprice = forceFloat(min_dayprice);
        }

        if (!isEmpty(fourweeks) && forceFloat(fourweeks) > 0 && !isEmpty(weekformula)) {
            var weekprices = [];
            for (var a = 0; a < weekformula.length; a++) {
                weekprices.push(getBestPrice(20, weekformula[a], dailyunitcost, weeklyunitcost, fourweekunitcost)); // use 20 here for n
            }

            console.log('weekprices: ' + weekprices.toString());
            min_weekprice = Math.min.apply(Math, weekprices);

            finalprice = forceFloat(min_weekprice) * forceFloat(fourweeks);

            if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(dayformula)) {
                finalprice += min_dayprice;
            }
        }

        console.log('min_weekprice: ' + min_weekprice + ' | min_dayprice: ' + min_dayprice + ' | finalprice: ' + finalprice);

        return {
            finalprice: finalprice,
            min_dayprice: min_dayprice,
            min_weekprice: min_weekprice
        };

        /*if (!isEmpty(fourweeks) && forceFloat(fourweeks) > 0 && !isEmpty(weekformula)) {
            finalformula = '(' + weekformula + '*' + fourweeks + ')'

            if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(dayformula)) {
                finalformula += '+(' + dayformula + ')';
            }
        }
        else {
            finalformula = dayformula;
        }

        console.log('dayformula: ' + dayformula + ' | weekformula: ' + weekformula + ' | finalformula: ' + finalformula);

        return finalformula;*/
    }

    /**
     * Call library to convert string formula to mathematical expression
     * @param days
     * @param formula
     * @param dailyunitcost
     * @param weeklyunitcost
     * @param fourweekunitcost
     * @returns {number}
     */
    function getBestPrice(days, formula, dailyunitcost, weeklyunitcost, fourweekunitcost) {
        var bestprice = 0;

        dailyunitcost = '(' + dailyunitcost + ')';
        weeklyunitcost = '(' + weeklyunitcost + ')';
        fourweekunitcost = '(' + fourweekunitcost + ')';
        days = '(' + days + ')';

        var replacedformula = replaceAll(formula, 'a', dailyunitcost);
        replacedformula = replaceAll(replacedformula, 'b', weeklyunitcost);
        replacedformula = replaceAll(replacedformula, 'c', fourweekunitcost);
        replacedformula = replaceAll(replacedformula, 'n', days);

        console.log('replacedformula: ' + replacedformula + ' | formula: ' + formula);

        var response = http.get({ url: 'http://api.mathjs.org/v4/?expr='+encodeURIComponent(xml.escape({xmlText: replacedformula})) });
        if (response.code === 200) {
            bestprice = !isEmpty(response.body) && response.body != 'undefined' ? response.body : '';
            console.log('response.body: ' + bestprice);
        }

        return bestprice;
    }

    /**
     * Get time unit price
     * @param timeunit
     * @param startdate
     * @returns {string}
     */
    function getTimeUnitPrice(timeunit, trandate, selectedratecard) {
        var ratecardsubinfo = {};

        if (isEmpty(selectedratecard) || isEmpty(trandate)) return '';

        var fil = [];
        fil.push(search.createFilter({name: 'custrecord_sna_hul_linked_rate_card', operator: search.Operator.IS, values: selectedratecard}));
        if (!isEmpty(timeunit)) {
            fil.push(search.createFilter({name: 'custrecord_sna_hul_rent_time_unit', operator: search.Operator.IS, values: timeunit}));
        }

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

        return ratecardsubinfo;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        backButton: backButton,
        saveRecord: saveRecord
    };
    
});