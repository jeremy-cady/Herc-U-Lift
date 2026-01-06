/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE scrip to show button to first suitelet
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/7/6       		                 aduldulao       Initial version.
 * 2022/8/17       		                 aduldulao       Billing dates
 * 2022/9/1       		                 aduldulao       Move SO data
 * 2022/9/22       		                 aduldulao       Add config 2 checking, HUL code
 * 2022/10/13       		             aduldulao       Final Invoice
 * 2022/11/1         		             aduldulao       Remove Final Invoice, alert on Add Object
 * 2022/11/2         		             aduldulao       Hide Case Sale and Invoice Button, move beforeSubmit
 * 2022/11/3         		             aduldulao       Override Bill Date
 * 2023/1/30       		                 aduldulao       Remove Credit Limit and Claim Insurance Lock from Non Rental Estimate Order
 * 2023/3/22       		                 aduldulao       Move Object Updates
 * 2023/3/28       		                 aduldulao       Create NXC Site Asset from Customer Address
 * 2023/6/13                             aduldulao       Auto Create Time Entries
 * 2023/6/22                             aduldulao       Add Temp Items
 * 2023/7/13                             aduldulao       Rental enhancements
 * 2023/8/23                             aduldulao       Move SO Hide Button script here
 * 2023/9/26                             aduldulao       Used Equipment Item
 * 2023/11/3                             aduldulao       Set NX Equipment Asset field
 * 2023/11/20                            aduldulao       Multiple billing formula
 * 2024/1/31       		                 aduldulao       Address 3
 * 2024/3/6       		                 aduldulao       Use Quantity checkbox
 * 2024/4/15       		                 aduldulao       Create Time Entry checkbox
 * 2025/03/19       		             lincecum        Remove bill date via item revenue streams
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  'N/record',
  'N/runtime',
  'N/search',
  'N/url',
  'N/format',
  'N/redirect',
  'N/http',
  'N/xml',
  './moment.js',
  './SNA/shared/sna_hul_mod_rental_orders',
] /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{url} url
 */, (record, runtime, search, url, format, redirect, http, xml, moment, RENTAL_FUNCTIONS) => {
  // UTILITY FUNCTIONS
  function isEmpty(stValue) {
    return (
      stValue === '' ||
      stValue == null ||
      stValue == undefined ||
      (stValue.constructor === Array && stValue.length == 0) ||
      (stValue.constructor === Object &&
        (function (v) {
          for (var k in v) return false;
          return true;
        })(stValue))
    );
  }

  function forceFloat(stValue) {
    var flValue = parseFloat(stValue);
    if (isNaN(flValue) || stValue == 'Infinity') {
      return 0.0;
    }
    return flValue;
  }

  function forceInt(stValue) {
    var intValue = parseInt(stValue, 10);
    if (isNaN(intValue) || stValue == 'Infinity') {
      return 0;
    }
    return intValue;
  }

  function inArray(stValue, arrValue) {
    for (var i = arrValue.length - 1; i >= 0; i--) {
      if (stValue == arrValue[i]) {
        break;
      }
    }
    return i > -1;
  }

  function replaceAll(str, find, replaceString) {
    return str.replace(new RegExp(find, 'g'), replaceString);
  }

  function addDays(dtDate, intDays) {
    if (isEmpty(dtDate)) return '';

    var result = new Date(dtDate);
    result.setDate(result.getDate() + intDays);
    return result;
  }

  /*function addWorkingDays(startDate, days) {
            if(isNaN(days)) {
                console.log("Value provided for \"days\" was not a number");
                return
            }
            if(!(startDate instanceof Date)) {
                console.log("Value provided for \"startDate\" was not a Date object");
                return
            }
            // Get the day of the week as a number (0 = Sunday, 1 = Monday, .... 6 = Saturday)
            var dow = startDate.getDay();
            var daysToAdd = parseInt(days);
            // If the current day is Sunday add one day
            if (dow == 0)
                daysToAdd++;
            // If the start date plus the additional days falls on or after the closest Saturday calculate weekends
            if (dow + daysToAdd >= 6) {
                //Subtract days in current working week from work days
                var remainingWorkDays = daysToAdd - (5 - dow);
                //Add current working week's weekend
                daysToAdd += 2;
                if (remainingWorkDays > 5) {
                    //Add two days for each working week by calculating how many weeks are included
                    daysToAdd += 2 * Math.floor(remainingWorkDays / 5);
                    //Exclude final weekend if remainingWorkDays resolves to an exact number of weeks
                    if (remainingWorkDays % 5 == 0)
                        daysToAdd -= 2;
                }
            }
            startDate.setDate(startDate.getDate() + daysToAdd);
            return startDate;
        }*/

  function addBusinessDays(date, daysToAdd) {
    var cnt = 0;
    var tmpDate = moment(date);
    while (cnt < daysToAdd) {
      tmpDate = tmpDate.add('days', 1);
      if (
        tmpDate.weekday() != moment().day('Sunday').weekday() &&
        tmpDate.weekday() != moment().day('Saturday').weekday()
      ) {
        cnt = cnt + 1;
      }
    }

    return tmpDate;
  }

  function addWorkingDays(datStartDate, lngNumberOfWorkingDays, blnIncSat, blnIncSun) {
    if (isEmpty(datStartDate)) return '';

    var intWorkingDays = 5;
    var intNonWorkingDays = 2;
    var intStartDay = datStartDate.getDay(); // 0=Sunday ... 6=Saturday
    var intOffset;
    var intModifier = 0;

    if (blnIncSat) {
      intWorkingDays++;
      intNonWorkingDays--;
    }
    if (blnIncSun) {
      intWorkingDays++;
      intNonWorkingDays--;
    }
    var newDate = new Date(datStartDate);
    if (lngNumberOfWorkingDays >= 0) {
      // Moving Forward
      if (!blnIncSat && blnIncSun) {
        intOffset = intStartDay;
      } else {
        intOffset = intStartDay - 1;
      }
      // Special start Saturday rule for 5 day week
      if (intStartDay == 6 && !blnIncSat && !blnIncSun) {
        intOffset -= 6;
        intModifier = 1;
      }
    } else {
      // Moving Backward
      if (blnIncSat && !blnIncSun) {
        intOffset = intStartDay - 6;
      } else {
        intOffset = intStartDay - 5;
      }
      // Special start Sunday rule for 5 day week
      if (intStartDay == 0 && !blnIncSat && !blnIncSun) {
        intOffset++;
        intModifier = 1;
      }
    }
    // ~~ is used to achieve integer division for both positive and negative numbers
    newDate.setTime(
      datStartDate.getTime() +
        new Number(
          ~~((lngNumberOfWorkingDays + intOffset) / intWorkingDays) * intNonWorkingDays +
            lngNumberOfWorkingDays +
            intModifier,
        ) *
          86400000,
    );
    return newDate;
  }

  function workingDaysBetweenDates(startDate, endDate) {
    // Validate input
    if (endDate < startDate) return 0;
    if (isEmpty(endDate) || isEmpty(startDate)) return 0;

    var vTimezoneDiff2 = startDate.getTimezoneOffset() - endDate.getTimezoneOffset();
    var vTimezoneDiff = endDate.getTimezoneOffset() - startDate.getTimezoneOffset(); // startdate is dst

    if (vTimezoneDiff > 0) {
      // Handle daylight saving time difference between two dates.
      startDate.setMinutes(startDate.getMinutes() + vTimezoneDiff);
    } else if (vTimezoneDiff2 > 0) {
      // Handle daylight saving time difference between two dates.
      endDate.setMinutes(endDate.getMinutes() + vTimezoneDiff);
    }

    var offset = 0;
    if (
      (startDate.toString().includes('Daylight') || startDate.toString().includes('PDT')) &&
      !endDate.toString().includes('Daylight') &&
      !endDate.toString().includes('PDT')
    ) {
      offset = -1;
    } else if (
      (endDate.toString().includes('Daylight') || endDate.toString().includes('PDT')) &&
      !startDate.toString().includes('Daylight') &&
      !startDate.toString().includes('PDT')
    ) {
      offset = 1;
    }

    // Calculate days between dates
    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
    startDate.setHours(0, 0, 0, 1); // Start just after midnight
    endDate.setHours(23, 59, 59, 999); // End just before midnight
    var diff = endDate - startDate; // Milliseconds between datetime objects
    var days = Math.ceil(diff / millisecondsPerDay);

    // Subtract two weekend days for every week in between
    var weeks = Math.floor(days / 7);
    days = days - weeks * 2;

    // Handle special cases
    var startDay = startDate.getDay();
    var endDay = endDate.getDay();

    // 10/19 - this should be ok. issue on last condition only
    //if (offset == 0) {
    // Remove weekend not previously removed.
    if (startDay - endDay > 1) days = days - 2;

    // Remove start day if span starts on Sunday but ends before Saturday
    if (startDay == 0 && endDay != 6) days = days - 1;

    // Remove end day if span ends on Saturday but starts after Sunday
    if (endDay == 6 && startDay != 0) days = days - 1;

    // start date is DST
    if (endDay == 1 && startDay == 3 && offset == -1) days = days + 2; // for some reason, Wed is -1 day so need to add 2 days to counter offset

    // Remove start day if span starts on Sunday but ends before Saturday
    //if (endDay == 6 && startDay != 0)
    //days = days - 1
    //}

    return days + offset;
  }

  function workday_count(start, end) {
    // Validate input
    if (end < start) return 0;
    if (isEmpty(end) || isEmpty(start)) return 0;

    start = moment(start);
    end = moment(end);

    var first = start.clone().endOf('week'); // end of first week
    var last = end.clone().startOf('week'); // start of last week
    var days = (last.diff(first, 'days') * 5) / 7; // this will always multiply of 7
    var wfirst = first.day() - start.day(); // check first week
    if (start.day() == 0) --wfirst; // -1 if start with sunday
    var wlast = end.day() - last.day(); // check last week
    if (end.day() == 6) --wlast; // -1 if end with saturday
    return wfirst + Math.floor(days) + wlast; // get the total
  }

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
    try {
      var rec = scriptContext.newRecord;
      var recid = rec.id;
      var rectype = rec.type;

      if (
        scriptContext.type == scriptContext.UserEventType.COPY ||
        scriptContext.type == scriptContext.UserEventType.CREATE
      ) {
        var startdate = rec.getValue({ fieldId: 'startdate' });

        if (isEmpty(startdate)) {
          rec.setValue({ fieldId: 'startdate', value: new Date() });
        }
      }

      if (
        scriptContext.type != scriptContext.UserEventType.VIEW &&
        runtime.executionContext == runtime.ContextType.USER_INTERFACE
      ) {
        var cust = rec.getValue({ fieldId: 'entity' });
        if (isEmpty(cust)) cust = null;
        var custgrp = rec.getValue({ fieldId: 'custbody_sna_hul_cus_pricing_grp' });
        if (isEmpty(custgrp)) custgrp = null;
        var loc = rec.getValue({ fieldId: 'location' });
        if (isEmpty(loc)) loc = null;
        var trandate = !isEmpty(rec.getValue({ fieldId: 'trandate' }))
          ? format.format({ value: new Date(rec.getValue({ fieldId: 'trandate' })), type: format.Type.DATE })
          : null;

        /*var loccode = '';
                    if (!isEmpty(loc)) {
                        var locflds = search.lookupFields({type: 'location', id: loc, columns: ['custrecord_hul_code']});
                        loccode = locflds.custrecord_hul_code;
                    }

                    // Order Entry Process on Quotes and Sales Orders
                    var slurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_selectobject', deploymentId: 'customdeploy_sna_hul_sl_selectobject',
                        params : {'cust': cust, 'custgrp' : custgrp, 'trandate' : trandate, 'loccode' : loc}
                    });
                    var jsStr = "require([],function(){window.ischanged=false;window.open('" + slurl + "','_blank','width=1000,height=600,top=300,left=300,menubar=1');});";*/

        scriptContext.form.clientScriptModulePath = './sna_hul_cs_ad_combinedcs.js';
        scriptContext.form.addButton({
          id: 'custpage_objbtn',
          label: 'Add Object',
          functionName: 'showPrompt(' + cust + ',' + custgrp + ',' + trandate + ',' + loc + ')',
        });
        scriptContext.form.addButton({
          id: 'custpage_tempitmbtn',
          label: 'Add Temporary Item',
          functionName: 'redirectToSL()',
        });
        scriptContext.form.addButton({
          id: 'custpage_calcrentalbtn',
          label: 'Calculate Rental',
          functionName: 'calculateRental()',
        });
      } else if (scriptContext.type == scriptContext.UserEventType.VIEW) {
        var form = scriptContext.form;

        if (rectype == record.Type.ESTIMATE) {
          var currscript = runtime.getCurrentScript();
          var rentalestform = currscript.getParameter('custscript_sna_rentalestform');
          log.debug({ title: 'beforeLoad', details: 'rentalestform: ' + rentalestform });

          var sobutton = form.getButton({ id: 'createsalesord' });
          var cashsalebutton = form.getButton({ id: 'createcashsale' });
          var invbutton = form.getButton({ id: 'createinvoice' });

          var estflds = search.lookupFields({ type: record.Type.ESTIMATE, id: recid, columns: ['customform'] });
          var estform = !isEmpty(estflds.customform) ? estflds.customform[0].value : '';
          log.debug({ title: 'beforeLoad', details: 'estform: ' + estform });

          if (estform == rentalestform && (sobutton || cashsalebutton || invbutton)) {
            var creditlimit = rec.getValue({ fieldId: 'custbody_sna_hul_custcredit_limit' });
            var waive = rec.getValue({ fieldId: 'custbody_sna_hul_waive_insurance' });
            var donotenforce = rec.getValue({ fieldId: 'custbody_sna_hul_donotenforce' });
            var total = rec.getValue({ fieldId: 'total' });
            var cust = rec.getValue({ fieldId: 'entity' });
            var trandate = rec.getValue({ fieldId: 'trandate' });
            var balance = 0;
            var coi = '';
            var coiexpiry = '';

            if (!isEmpty(cust)) {
              var custflds = search.lookupFields({
                type: 'customer',
                id: cust,
                columns: ['balance', 'custentity_sna_cert_of_insurance', 'custentity_sna_hul_date_of_exp_coi'],
              });
              balance = custflds.balance;
              coi = !isEmpty(custflds.custentity_sna_cert_of_insurance)
                ? custflds.custentity_sna_cert_of_insurance[0].value
                : '';
              coiexpiry = !isEmpty(custflds.custentity_sna_hul_date_of_exp_coi)
                ? new Date(custflds.custentity_sna_hul_date_of_exp_coi)
                : '';
            }

            var newbal = forceFloat(balance) + forceFloat(total);

            log.debug({
              title: 'beforeLoad',
              details:
                'recid: ' +
                recid +
                ' | creditlimit: ' +
                creditlimit +
                ' | donotenforce: ' +
                donotenforce +
                ' | waive: ' +
                waive +
                ' | coi: ' +
                coi +
                ' | coiexpiry: ' +
                coiexpiry +
                ' | trandate: ' +
                trandate +
                ' | total: ' +
                total +
                ' | balance: ' +
                balance +
                ' | newbal: ' +
                newbal,
            });

            // locked for Sales Order Conversion, unless all of the following conditions have been met:
            // i. A file is attached on the Certificate of Insurance or Waive Insurance checkbox is marked
            // ii. Quote Total Amount + Current Account Receivable is less than Credit Limit or Do not Enforce Credit Limit Checkbox is marked
            var errmess = '';
            if ((isEmpty(coi) || (!isEmpty(coiexpiry) && coiexpiry <= new Date(trandate))) && !waive) {
              errmess =
                '<span style="color: #FF0000;">Certificate of Insurance is not found or Expired. Check Customer record.</span><br />';
            }
            if (newbal > creditlimit && !donotenforce) {
              errmess += '<span style="color: #FF0000;">Order is above Customer\'s Credit Limit.</span>';
            }

            rec.setValue({ fieldId: 'custbody_sna_hul_conversionerror', value: errmess });

            if (!isEmpty(errmess)) {
              if (sobutton) {
                form.removeButton({ id: 'createsalesord' });
              }
              if (cashsalebutton) {
                form.removeButton({ id: 'createcashsale' });
              }
              if (invbutton) {
                form.removeButton({ id: 'createinvoice' });
              }
            }
          }
        } else if (rectype == record.Type.SALES_ORDER) {
          var ifbutton = form.getButton({ id: 'process' });
          var nextbill = form.getButton({ id: 'nextbill' });
          var billremaining = form.getButton({ id: 'billremaining' });
          var billbtn = form.getButton({ id: 'bill' });

          if (ifbutton || nextbill || billremaining || billbtn) {
            var billing_status = rec.getValue('custbody_sna_hul_billing_status');
            log.debug('beforeLoad', 'SO ID: ' + recid + ' | Billing Status: ' + billing_status);

            var _filters = [];
            _filters.push(['custcol_sna_hul_object_configurator', search.Operator.CONTAINS, '"CONFIGURED":"F"']);
            _filters.push('or');
            _filters.push(['custcol_sna_hul_object_configurator_2', search.Operator.CONTAINS, '"CONFIGURED":"F"']);
            _filters.push('or');
            _filters.push(['custcol_sna_hul_fleet_no.custrecord_sna_hul_rent_dummy', search.Operator.IS, 'T']);

            var mainfilters = [];
            mainfilters.push(['internalid', search.Operator.IS, recid]);
            mainfilters.push('and');
            mainfilters.push(_filters);

            var srch = search.create({ type: record.Type.SALES_ORDER, filters: mainfilters });

            var sosrch = srch.run().getRange({ start: 0, end: 1 });

            // locked for Item Fulfillment and Invoicing unless there are no longer Dummy Object lines and all rental configuration have been completed
            if (!isEmpty(sosrch)) {
              if (ifbutton) {
                form.removeButton({ id: 'process' });
              }
            }
            if (!isEmpty(sosrch) || billing_status != 2) {
              if (nextbill) {
                form.removeButton({ id: 'nextbill' });
              }
              if (billremaining) {
                form.removeButton({ id: 'billremaining' });
              }
              if (billbtn) {
                form.removeButton({ id: 'bill' });
              }
              log.debug('beforeLoad', '-- Hide Bill Buttons --');
            }
            // check if for final invoicing
            /*else {
                                var forfinal = checkFinalInvoicing(recid);
                                log.debug({title: 'beforeLoad', details: 'forfinal: ' + forfinal});

                                if (forfinal) {
                                    //var slurl = '/app/accounting/transactions/custinvc.nl?id='+recid+'&e=T&transform=salesord&memdoc=0&whence=';

                                    var slfinivurl = url.resolveScript({scriptId: 'customscript_sna_hul_sl_finalinvoice', deploymentId: 'customdeploy_sna_hul_sl_finalinvoice',
                                        params: {'soid': recid}
                                    });
                                    var jsfinStr = "window.open('" + slfinivurl + "',\'_self\'); windown.focus();";

                                    scriptContext.form.addButton({id: 'custpage_finalinv', label: 'Final Invoice', functionName: jsfinStr});
                                }
                            }*/
          }

          // Rental Configurator suitelet
          var slurl = url.resolveScript({
            scriptId: 'customscript_sna_hul_sl_rentalconfigurat',
            deploymentId: 'customdeploy_sna_hul_sl_rentalconfigurat',
            params: { soid: recid },
          });
          var jsStr =
            "require([],function(){window.ischanged=false;window.open('" +
            slurl +
            "','_blank','width=1000,height=600,top=300,left=300,menubar=1');});";

          scriptContext.form.addButton({ id: 'custpage_configurebtn', label: 'Configure Object', functionName: jsStr });

          // Billing schedule suitelet
          var itmlen = rec.getLineCount({ sublistId: 'item' });

          for (var i = 0; i < itmlen; i++) {
            var lineuniquekey = rec.getSublistValue({ sublistId: 'item', fieldId: 'lineuniquekey', line: i });
            var billingsched = rec.getSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sn_hul_billingsched',
              line: i,
            });
            var billdate = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i });

            if (!isEmpty(billingsched) || !isEmpty(billdate)) {
              var slurl = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_billscheddets',
                deploymentId: 'customdeploy_sna_hul_sl_billscheddets',
                params: { lineid: lineuniquekey },
              });
              slurl =
                '<a href="' +
                slurl +
                '" onclick="window.open(\'' +
                slurl +
                "', 'newwindow', 'width=800,height=600'); return false;\">Billing Schedule</a>";

              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sn_hul_billingschedlink',
                value: slurl,
                line: i,
              });
            }
          }
        }
      }
    } catch (e) {
      if (e.message != undefined) {
        log.error('ERROR', e.name + ' ' + e.message);
      } else {
        log.error('ERROR', 'Unexpected Error', e.toString());
      }
    }
  };

  /**
   * Check if for final invoicing
   * @param recid
   * @returns {boolean}
   */
  function checkFinalInvoicing(recid) {
    var forfinal = false;

    var filters = [];
    filters.push(['applyingtransaction.custcol_sna_rental_bill_damage', search.Operator.IS, true]);
    filters.push('or');
    filters.push([
      'formulanumeric: case when TO_DATE({applyingtransaction.custcol_sna_rental_returned_date}) > TO_DATE({custcol_sna_hul_rent_end_date}) then 1 else 0 end',
      search.Operator.EQUALTO,
      '1',
    ]);

    var mainfilters = [];
    mainfilters.push(['internalid', search.Operator.IS, recid]);
    mainfilters.push('and');
    mainfilters.push(['mainline', search.Operator.IS, false]);
    mainfilters.push('and');
    mainfilters.push(['applyingtransaction.type', search.Operator.ANYOF, 'RtnAuth']);
    mainfilters.push('and');
    mainfilters.push(['applyingtransaction.status', search.Operator.ANYOF, ['RtnAuth:G', 'RtnAuth:F']]); // Received | Refunded or Pending Refund
    mainfilters.push('and');
    mainfilters.push(filters);

    var columns = [];
    columns.push(search.createColumn({ name: 'custcol_sna_hul_rent_contractidd' }));

    var srch = search.create({ type: record.Type.SALES_ORDER, filters: mainfilters, columns: columns });

    var ser = srch.run().getRange({ start: 0, end: 1 });

    // has pending receipt RMA
    if (!isEmpty(ser)) {
      forfinal = true;
    }

    return forfinal;
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
    if (scriptContext.type == scriptContext.UserEventType.DELETE) return;
    log.debug({
      title: 'beforeSubmit',
      details: 'scriptContext.type: ' + scriptContext.type + ' | runtime.executionContext: ' + runtime.executionContext,
    });

    var currentScript = runtime.getCurrentScript();
    var rentalitem = currentScript.getParameter({ name: 'custscript_sna_rental_serviceitem' });
    var param_daily = currentScript.getParameter({ name: 'custscript_sna_unit_daily' });
    var param_4weekly = currentScript.getParameter({ name: 'custscript_sna_unit_4weekly' });
    var param_weekly = currentScript.getParameter({ name: 'custscript_sna_unit_weekly' });
    var param_ldw = currentScript.getParameter({ name: 'custscript_sna_group_ldw' });
    var resourceservicecodetype = currentScript.getParameter({ name: 'custscript_sna_servicetype_resource' });

    var oldrec = scriptContext.oldRecord;
    var arractualhours = [];

    if (!isEmpty(oldrec)) {
      var _itemcount = oldrec.getLineCount({ sublistId: 'item' });
      for (var c = 0; c < _itemcount; c++) {
        var _lineuniquekey = oldrec.getSublistValue({ sublistId: 'item', fieldId: 'lineuniquekey', line: c });
        var _actualhours = oldrec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_hul_act_service_hours',
          line: c,
        });

        arractualhours[_lineuniquekey] = _actualhours;

        log.debug({
          title: 'beforeSubmit',
          details: 'arractualhours: ' + arractualhours[_lineuniquekey] + ' | _lineuniquekey: ' + _lineuniquekey,
        });
      }
    }

    var rec = scriptContext.newRecord;
    var rectype = rec.type;
    var startdate = rec.getValue({ fieldId: 'startdate' });
    var enddate = rec.getValue({ fieldId: 'enddate' }); // should be mandatory
    var trandate = rec.getValue({ fieldId: 'trandate' });
    var allowMultDates = rec.getValue({ fieldId: 'custbody_sna_allow_mult_rental' });

    // Set NX Equipment Asset field
    if (rectype == record.Type.SALES_ORDER && runtime.executionContext == runtime.ContextType.SUITELET) {
      var nextServiceCase = rec.getValue({ fieldId: 'custbody_nx_case' });
      var equipmentAsset = rec.getValue({ fieldId: 'custbody_sna_hul_nxc_eq_asset' });

      if (isEmpty(equipmentAsset) && !isEmpty(nextServiceCase)) {
        // NX Case Search
        var nxCaseSearch = search.lookupFields({
          type: 'supportcase',
          id: nextServiceCase,
          columns: ['custevent_nxc_case_assets'],
        });

        var nxCaseAsset = !isEmpty(nxCaseSearch.custevent_nxc_case_assets)
          ? nxCaseSearch.custevent_nxc_case_assets[0].value
          : '';

        rec.setValue({ fieldId: 'custbody_sna_hul_nxc_eq_asset', value: nxCaseAsset });
      }
    }

    // set initial end date
    if (
      scriptContext.type == scriptContext.UserEventType.COPY ||
      scriptContext.type == scriptContext.UserEventType.CREATE
    ) {
      rec.setValue({ fieldId: 'custbody_sn_rental_est_enddate', value: enddate });
    }

    var tempstartdate = '';
    var tempenddate = '';

    if (!isEmpty(startdate)) {
      tempstartdate = format.format({ value: startdate, type: format.Type.DATE });
    }
    if (!isEmpty(enddate)) {
      tempenddate = format.format({ value: enddate, type: format.Type.DATE });
    }

    var timeqty = workday_count(startdate, enddate); // no need to get rental days because time unit is always Day
    var finalnohr = forceFloat(timeqty) * 8;

    log.debug({
      title: 'beforeSubmit',
      details:
        'startdate: ' + startdate + ' | enddate: ' + enddate + ' | trandate: ' + trandate + ' | timeqty: ' + timeqty,
    });

    var allratecards = [];
    var alltimeqty = [];

    var itemcount = rec.getLineCount({ sublistId: 'item' });

    for (var i = 0; i < itemcount; i++) {
      var itm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
      var lnestartdate = rec.getSublistValue({
        sublistId: 'item',
        fieldId: 'custcol_sna_hul_rent_start_date',
        line: i,
      });
      var lneenddate = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', line: i });
      log.debug({
        title: 'beforeSubmit',
        details: 'line: ' + i + ' | itm: ' + itm + ' | lnestartdate: ' + lnestartdate + ' | lneenddate: ' + lneenddate,
      });

      if (itm == rentalitem) {
        if (!isEmpty(lnestartdate)) {
          lnestartdate = format.format({ value: lnestartdate, type: format.Type.DATE });
        }
        if (!isEmpty(lneenddate)) {
          lneenddate = format.format({ value: lneenddate, type: format.Type.DATE });
        }

        if (
          (lnestartdate != tempstartdate || lneenddate != tempenddate) &&
          !allowMultDates &&
          runtime.executionContext == runtime.ContextType.USER_INTERFACE
        ) {
          var lneratecard = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_rental_rate_card',
            line: i,
          });

          if (!inArray(lneratecard, allratecards) && !isEmpty(lneratecard)) {
            allratecards.push(lneratecard);
          }
        }
      }

      var timeposted = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_time_posted', line: i });
      var linkedtime = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_linked_time', line: i });
      var lineservicetype = rec.getSublistValue({
        sublistId: 'item',
        fieldId: 'custcol_sna_service_itemcode',
        line: i,
      });
      var nxtask = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nx_task', line: i });
      var lineuniquekey = rec.getSublistValue({ sublistId: 'item', fieldId: 'lineuniquekey', line: i });
      var qty = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_act_service_hours', line: i });
      var oldqty = !isEmpty(arractualhours[lineuniquekey]) ? arractualhours[lineuniquekey] : '';
      log.debug({ title: 'beforeSubmit', details: 'line: ' + i + ' | qty: ' + qty + ' | oldqty: ' + oldqty });

      if (!isEmpty(linkedtime) && !isEmpty(nxtask) && lineservicetype == resourceservicecodetype) {
        if (timeposted && !isEmpty(oldqty) && oldqty != qty) {
          rec.setSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_hul_act_service_hours',
            line: i,
            value: oldqty,
          });

          log.error({ title: 'Time Posted', details: 'Time entry is already posted.' });
        }
      }
    }

    log.debug({ title: 'beforeSubmit', details: 'allratecards: ' + JSON.stringify(allratecards) });

    if (!isEmpty(allratecards)) {
      // maan
      let soLines = {};
      let finalSoLines = {};

      if (!isEmpty(oldrec)) {
        // get all related invoices and credit memos
        let filters = [];
        filters.push(
          search.createFilter({
            name: 'createdfrom',
            operator: search.Operator.IS,
            values: scriptContext.newRecord.id,
          }),
        );
        filters.push(search.createFilter({ name: 'mainline', operator: search.Operator.IS, values: 'F' }));
        filters.push(search.createFilter({ name: 'shipping', operator: search.Operator.IS, values: 'F' }));
        filters.push(search.createFilter({ name: 'taxline', operator: search.Operator.IS, values: 'F' }));
        filters.push(search.createFilter({ name: 'cogs', operator: search.Operator.IS, values: 'F' }));

        let columns = [];
        columns.push(search.createColumn({ name: 'lineuniquekey', join: 'appliedToTransaction' })); // SO line key
        columns.push(search.createColumn({ name: 'quantitybilled', join: 'appliedToTransaction' })); // SO quantity billed
        columns.push(search.createColumn({ name: 'quantity', join: 'applyingTransaction' })); // CM quantity

        let srch = search.create({ type: search.Type.INVOICE, columns: columns, filters: filters });
        let searchResultCount = srch.runPaged().count;
        log.debug({ title: 'beforeSubmit', details: `searchResultCount: ${searchResultCount}` });

        srch.run().each(function (result) {
          let solinekey = result.getValue({ name: 'lineuniquekey', join: 'appliedToTransaction' });
          let sobilledqty = result.getValue({ name: 'quantitybilled', join: 'appliedToTransaction' });
          let cmqty = result.getValue({ name: 'quantity', join: 'applyingTransaction' });

          if (isEmpty(soLines[solinekey])) {
            soLines[solinekey] = {
              sobilledqty: 0,
              cmqty: 0,
            };
          }
          soLines[solinekey].sobilledqty = sobilledqty;
          soLines[solinekey].cmqty += forceFloat(cmqty);

          return true;
        });

        if (!isEmpty(soLines)) {
          for (sokey in soLines) {
            let newsoqty =
              forceFloat(timeqty) -
              (forceFloat(soLines[sokey].sobilledqty) + forceFloat(soLines[sokey].cmqty)) +
              forceFloat(soLines[sokey].sobilledqty);

            log.debug({
              title: 'beforeSubmit',
              details: `sokey: ${sokey} | timeqty: ${timeqty} | sobilledqty: ${soLines[sokey].sobilledqty} | cmqty: ${soLines[sokey].cmqty}`,
            });
            log.debug({ title: 'beforeSubmit', details: `newsoqty: ${newsoqty}` });

            finalSoLines[sokey] = newsoqty;
          }
        }
      }
      // end maan

      var ratecardsub = getTimeUnitPrice(trandate, allratecards);

      var allfinalunitprice = setBestPriceTable(
        ratecardsub,
        param_daily,
        timeqty,
        allratecards,
        param_4weekly,
        param_weekly,
      );

      var origtimeqty = timeqty;
      var rentalchargeamt = '';

      // set new line fields
      for (var j = 0; j < itemcount; j++) {
        var itm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: j });
        var lneratecard = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_rental_rate_card', line: j });
        var timeunit = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_time_unit', line: j });
        // maan 2
        var uniquelinekey = rec.getSublistValue({ sublistId: 'item', fieldId: 'lineuniquekey', line: j });
        if (!isEmpty(finalSoLines[uniquelinekey])) {
          timeqty = finalSoLines[uniquelinekey];
        }
        // end maan 2

        if (itm == rentalitem) {
          rec.setSublistValue({ sublistId: 'item', fieldId: 'quantity', line: j, value: timeqty });
          rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_rental_hrs', line: j, value: finalnohr });

          if (!isEmpty(allfinalunitprice[lneratecard])) {
            if (!isEmpty(allfinalunitprice[lneratecard].bestpriceunit)) {
              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: j,
                value: forceFloat(allfinalunitprice[lneratecard].bestpriceunit),
              });
            }
            if (!isEmpty(allfinalunitprice[lneratecard].extra_days)) {
              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_extra_days',
                line: j,
                value: forceFloat(allfinalunitprice[lneratecard].extra_days),
              });
            }
            if (!isEmpty(allfinalunitprice[lneratecard].min_dayprice)) {
              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_day_bestprice',
                line: j,
                value: forceFloat(allfinalunitprice[lneratecard].min_dayprice),
              });
            }
            if (!isEmpty(allfinalunitprice[lneratecard].min_weekprice)) {
              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_week_bestprice',
                line: j,
                value: forceFloat(allfinalunitprice[lneratecard].min_weekprice),
              });
            }
            if (!isEmpty(allfinalunitprice[lneratecard].dailyunitcost)) {
              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_day_rate',
                line: j,
                value: allfinalunitprice[lneratecard].dailyunitcost,
              });
            }
            if (!isEmpty(allfinalunitprice[lneratecard].weeklyunitcost)) {
              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_weekly_rate',
                line: j,
                value: allfinalunitprice[lneratecard].weeklyunitcost,
              });
            }
            if (!isEmpty(allfinalunitprice[lneratecard].fourweekunitcost)) {
              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_4week_rate',
                line: j,
                value: allfinalunitprice[lneratecard].fourweekunitcost,
              });
            }
          }

          var rte = rec.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: j });
          rentalchargeamt = forceFloat(rte) * origtimeqty;
          rec.setSublistValue({ sublistId: 'item', fieldId: 'amount', line: j, value: rentalchargeamt }); // need to set this in case of early return
        }

        log.debug({ title: 'beforeSubmit', details: 'rentalchargeamt: ' + rentalchargeamt });

        // charge items
        if (!isEmpty(timeunit)) {
          rec.setSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_hul_rent_start_date',
            line: j,
            value: startdate,
          });
          rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', line: j, value: enddate });

          var itmgroup = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_hul_gen_prodpost_grp',
            line: j,
          });
          var perc = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sn_hul_othercharge_percent', line: j });
          var chargeamt = rec.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: j });

          if (itmgroup == param_ldw) {
            if (!isEmpty(rentalchargeamt)) {
              chargeamt = forceFloat(rentalchargeamt) * 0.12; // must be 12% of rental charge
            }

            rec.setSublistValue({ sublistId: 'item', fieldId: 'quantity', line: j, value: timeqty });
            var newrate = forceFloat(chargeamt) / forceFloat(origtimeqty);
            rec.setSublistValue({ sublistId: 'item', fieldId: 'rate', line: j, value: newrate });
            rec.setSublistValue({ sublistId: 'item', fieldId: 'amount', line: j, value: chargeamt }); // need to set this in case of early return
          } else {
            if (!isEmpty(perc) && !isEmpty(rentalchargeamt)) {
              chargeamt = forceFloat(rentalchargeamt) * (forceFloat(perc) / 100);
              rec.setSublistValue({ sublistId: 'item', fieldId: 'rate', line: j, value: chargeamt });
            }
          }
        }
      }
    }

    var enddateadd = !isEmpty(enddate) ? addDays(enddate, 1) : '';
    rec.setValue({ fieldId: 'custbody_sn_rental_pickup_date', value: enddateadd });
  };

  /**
   * Get time unit price
   * @param timeunit
   * @param startdate
   * @returns {string}
   */
  function getTimeUnitPrice(trandate, selectedratecard) {
    var ratecardsubinfo = [];

    if (isEmpty(selectedratecard) || isEmpty(trandate)) return '';

    var fil = [];
    fil.push(
      search.createFilter({
        name: 'custrecord_sna_hul_linked_rate_card',
        operator: search.Operator.ANYOF,
        values: selectedratecard,
      }),
    );

    var col = [];
    col.push(search.createColumn({ name: 'custrecord_sna_hul_linked_rate_card' }));
    col.push(search.createColumn({ name: 'custrecord_sna_hul_time_unit_price' }));
    col.push(search.createColumn({ name: 'custrecord_sna_hul_effective_start_date' }));
    col.push(search.createColumn({ name: 'custrecord_sna_hul_effective_end_date' }));
    col.push(search.createColumn({ name: 'custrecord_sna_hul_m1_units_included' }));
    col.push(search.createColumn({ name: 'custrecord_sna_m1_unit_price' }));
    col.push(search.createColumn({ name: 'custrecord_sna_hul_rent_time_unit', sort: search.Sort.DESC }));
    col.push(search.createColumn({ name: 'internalid', sort: search.Sort.DESC }));

    var res = search.create({ type: 'customrecord_sna_hul_rate_card_sublist', filters: fil, columns: col });

    res.run().each(function (result) {
      var res_internalid = result.getValue({ name: 'custrecord_sna_hul_linked_rate_card' });
      var res_timeunitprice = result.getValue({ name: 'custrecord_sna_hul_time_unit_price' });
      var res_effectivestart = result.getValue({ name: 'custrecord_sna_hul_effective_start_date' });
      var res_effectiveend = result.getValue({ name: 'custrecord_sna_hul_effective_end_date' });
      var res_unit = result.getValue({ name: 'custrecord_sna_hul_rent_time_unit' });
      var res_m1unitsinc = result.getValue({ name: 'custrecord_sna_hul_m1_units_included' });
      var res_m1unitprice = result.getValue({ name: 'custrecord_sna_m1_unit_price' });

      // Tran date within effective start date and effective end date
      if (
        (!isEmpty(res_effectivestart) &&
          !isEmpty(res_effectiveend) &&
          new Date(trandate) >= new Date(res_effectivestart) &&
          new Date(trandate) <= new Date(res_effectiveend)) ||
        (!isEmpty(res_effectivestart) &&
          isEmpty(res_effectiveend) &&
          new Date(trandate) >= new Date(res_effectivestart)) ||
        (isEmpty(res_effectivestart) && !isEmpty(res_effectiveend) && new Date(trandate) <= new Date(res_effectiveend))
      ) {
        if (isEmpty(ratecardsubinfo[res_internalid])) {
          ratecardsubinfo[res_internalid] = {};
        }

        // get 1st result always
        if (isEmpty(ratecardsubinfo[res_internalid][res_unit])) {
          ratecardsubinfo[res_internalid][res_unit] = res_timeunitprice;
          ratecardsubinfo[res_internalid][res_unit + '_m1'] = res_m1unitprice;
        }
      }

      // If there are multiple Rental Rate Card Sublist containing the same Time Unit wherein Effective Dates are Null, select the most recently created.
      else if (isEmpty(res_effectivestart) && isEmpty(res_effectivestart)) {
        if (isEmpty(ratecardsubinfo[res_internalid])) {
          ratecardsubinfo[res_internalid] = {};
        }

        // get 1st result always
        if (isEmpty(ratecardsubinfo[res_internalid][res_unit + '_temp'])) {
          ratecardsubinfo[res_internalid][res_unit + '_temp'] = res_timeunitprice;
          ratecardsubinfo[res_internalid][res_unit + '_temp_m1'] = res_m1unitprice;
        }
      }

      return true;
    });

    return ratecardsubinfo;
  }

  /**
   * Set Time Unit Price and Best Option table
   * @param currrec
   * @param ratecardsub
   * @param timeunit
   * @param timeqty
   * @param selectedbest
   */
  function setBestPriceTable(ratecardsub, param_daily, timeqty, allratecards, param_4weekly, param_weekly) {
    var allfinalunitprice = {};

    // get rental days
    var rentaldays = timeqty;
    var fourweeks = 0;
    var days = 0;

    // get number of 20 days and remaining days
    if (rentaldays <= 20) {
      days = rentaldays;
    } else {
      var total20days = rentaldays / 20;
      fourweeks = Math.trunc(total20days);
      days = rentaldays - fourweeks * 20;
    }

    //var formula = getBestPriceFormula(fourweeks, days);

    for (var a = 0; a < allratecards.length; a++) {
      var ratecard = allratecards[a];
      log.debug({
        title: 'getBestPriceFormula',
        details: 'ratecard: ' + ratecard + ' | ratecardsub[ratecard]: ' + JSON.stringify(ratecardsub[ratecard]),
      });

      allfinalunitprice[ratecard] = {};

      if (isEmpty(ratecardsub[ratecard])) {
        allfinalunitprice[ratecard].extra_days = '';
        allfinalunitprice[ratecard].bestpriceunit = '';
        allfinalunitprice[ratecard].min_dayprice = '';
        allfinalunitprice[ratecard].min_weekprice = '';
        allfinalunitprice[ratecard].dailyunitcost = '';
        allfinalunitprice[ratecard].weeklyunitcost = '';
        allfinalunitprice[ratecard].fourweekunitcost = '';
        continue;
      }

      // time unit cost based on selected rate card
      var dailyunitcost = !isEmpty(ratecardsub[ratecard][param_daily])
        ? ratecardsub[ratecard][param_daily]
        : !isEmpty(ratecardsub[ratecard][param_daily + '_temp'])
          ? ratecardsub[ratecard][param_daily + '_temp']
          : '';
      var weeklyunitcost = !isEmpty(ratecardsub[ratecard][param_weekly])
        ? ratecardsub[ratecard][param_weekly]
        : !isEmpty(ratecardsub[ratecard][param_weekly + '_temp'])
          ? ratecardsub[ratecard][param_weekly + '_temp']
          : '';
      var fourweekunitcost = !isEmpty(ratecardsub[ratecard][param_4weekly])
        ? ratecardsub[ratecard][param_4weekly]
        : !isEmpty(ratecardsub[ratecard][param_4weekly + '_temp'])
          ? ratecardsub[ratecard][param_4weekly + '_temp']
          : '';

      log.debug({
        title: 'setBestPriceTable',
        details:
          'dailyunitcost: ' +
          dailyunitcost +
          ' | weeklyunitcost: ' +
          weeklyunitcost +
          ' | fourweekunitcost: ' +
          fourweekunitcost,
      });

      // get best prices
      //var bestprice = getBestPrice(days, formula, dailyunitcost, weeklyunitcost, fourweekunitcost);
      var bestprices = getBestPriceFormula(fourweeks, days, dailyunitcost, weeklyunitcost, fourweekunitcost);
      var bestprice = bestprices.finalprice;
      var bestpriceunit =
        !isEmpty(bestprice) && !isEmpty(rentaldays) ? forceFloat(forceFloat(bestprice) / rentaldays) : '';

      allfinalunitprice[ratecard].extra_days = days;
      allfinalunitprice[ratecard].min_dayprice = bestprices.min_dayprice;
      allfinalunitprice[ratecard].min_weekprice = bestprices.min_weekprice;
      allfinalunitprice[ratecard].bestpriceunit = bestpriceunit;
      allfinalunitprice[ratecard].dailyunitcost = dailyunitcost;
      allfinalunitprice[ratecard].weeklyunitcost = weeklyunitcost;
      allfinalunitprice[ratecard].fourweekunitcost = fourweekunitcost;
    }

    log.debug({ title: 'setBestPriceTable', details: 'allfinalunitprice: ' + JSON.stringify(allfinalunitprice) });

    return allfinalunitprice;
  }

  /**
   * Get formula from custom record
   * @param fourweeks
   * @param days
   * @returns {string}
   */
  function getBestPriceFormula(fourweeks, days, dailyunitcost, weeklyunitcost, fourweekunitcost) {
    log.debug({
      title: 'getBestPriceFormula',
      details:
        'fourweeks: ' +
        fourweeks +
        ' | days: ' +
        days +
        ' | dailyunitcost: ' +
        dailyunitcost +
        ' | weeklyunitcost: ' +
        weeklyunitcost +
        ' | fourweekunitcost: ' +
        fourweekunitcost,
    });

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
    columns.push(search.createColumn({ name: 'custrecord_sna_hul_formula' }));
    columns.push(search.createColumn({ name: 'custrecord_sna_hul_no_of_day' }));

    var sear = search.create({ type: 'customrecord_sna_hul_rental_best_price', filters: filters, columns: columns });
    sear.run().each(function (result) {
      var numdays = result.getValue({ name: 'custrecord_sna_hul_no_of_day' });
      var formla = result.getValue({ name: 'custrecord_sna_hul_formula' });

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

    log.debug({
      title: 'getBestPriceFormula',
      details: 'dayformula: ' + JSON.stringify(dayformula) + ' | weekformula: ' + JSON.stringify(weekformula),
    });

    var min_weekprice = 0;
    var min_dayprice = 0;
    var finalprice = 0;

    if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(dayformula)) {
      var dayprices = [];
      for (var b = 0; b < dayformula.length; b++) {
        dayprices.push(getBestPrice(days, dayformula[b], dailyunitcost, weeklyunitcost, fourweekunitcost));
      }

      log.debug({ title: 'getBestPriceFormula', details: 'dayprices: ' + dayprices.toString() });

      min_dayprice = Math.min.apply(Math, dayprices);

      finalprice = forceFloat(min_dayprice);
    }

    if (!isEmpty(fourweeks) && forceFloat(fourweeks) > 0 && !isEmpty(weekformula)) {
      var weekprices = [];
      for (var a = 0; a < weekformula.length; a++) {
        weekprices.push(getBestPrice(20, weekformula[a], dailyunitcost, weeklyunitcost, fourweekunitcost)); // use 20 here for n
      }

      log.debug({ title: 'getBestPriceFormula', details: 'weekprices: ' + weekprices.toString() });
      min_weekprice = Math.min.apply(Math, weekprices);

      finalprice = forceFloat(min_weekprice) * forceFloat(fourweeks);

      if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(dayformula)) {
        finalprice += min_dayprice;
      }
    }

    log.debug({
      title: 'getBestPriceFormula',
      details: 'min_weekprice: ' + min_weekprice + ' | min_dayprice: ' + min_dayprice + ' | finalprice: ' + finalprice,
    });

    return { finalprice: finalprice, min_dayprice: min_dayprice, min_weekprice: min_weekprice };

    /*if (!isEmpty(fourweeks) && forceFloat(fourweeks) > 0 && !isEmpty(weekformula)) {
                finalformula = '(' + weekformula + '*' + fourweeks + ')'

                if (!isEmpty(days) && forceFloat(days) > 0 && !isEmpty(dayformula)) {
                    finalformula += '+(' + dayformula + ')';
                }
            }
            else {
                finalformula = dayformula;
            }

            log.debug({title: 'getBestPriceFormula', details: 'dayformula: ' + dayformula + ' | weekformula: ' + weekformula + ' | finalformula: ' + finalformula});

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

    log.debug({ title: 'getBestPrice', details: 'replacedformula: ' + replacedformula + ' | formula: ' + formula });

    var response = http.get({
      url: 'http://api.mathjs.org/v4/?expr=' + encodeURIComponent(xml.escape({ xmlText: replacedformula })),
    });
    if (response.code === 200) {
      bestprice = !isEmpty(response.body) && response.body != 'undefined' ? response.body : '';
      log.debug({ title: 'getBestPrice', details: 'response.body: ' + bestprice });
    }

    return bestprice;
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
    log.debug({ title: 'afterSubmit', details: 'scriptContext.type: ' + scriptContext.type });
    if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

    try {
      var _rec = scriptContext.newRecord;
      var rectype = _rec.type;
      var recid = _rec.id;

      if (rectype != record.Type.SALES_ORDER) return;

      log.audit({
        title: 'afterSubmit:CONTEXT_TYPE',
        details: {
          'scriptContext.type': scriptContext.type,
        },
      });
      const { CREATE, EDIT, COPY } = scriptContext.UserEventType;
      if ([CREATE, EDIT, COPY].includes(scriptContext.type)) {
        RENTAL_FUNCTIONS.updateCopiedTimeEntry(scriptContext.newRecord);
      }

      var currentScript = runtime.getCurrentScript();
      var cc = currentScript.getParameter({ name: 'custscript_sna_terms_cc' });
      var cod = currentScript.getParameter({ name: 'custscript_sna_terms_cod' });
      var param_4weekly = currentScript.getParameter({ name: 'custscript_sna_unit_4weekly' });
      var param_weekly = currentScript.getParameter({ name: 'custscript_sna_unit_weekly' });
      var param_daily = currentScript.getParameter({ name: 'custscript_sna_unit_daily' });
      var param_ldw = currentScript.getParameter({ name: 'custscript_sna_group_ldw' });
      var param_freight = currentScript.getParameter({ name: 'custscript_sna_group_freight' });
      var param_fuel = currentScript.getParameter({ name: 'custscript_sna_group_fuel' });
      var param_ot = currentScript.getParameter({ name: 'custscript_sna_group_overtime' });
      var param_custdam = currentScript.getParameter({ name: 'custscript_sna_group_cust_damage' });
      var serviceitem = currentScript.getParameter({ name: 'custscript_sna_rental_serviceitem' });
      var siteform = currentScript.getParameter({ name: 'custscript_sna_custform_site' });
      var sitetype = currentScript.getParameter({ name: 'custscript_sna_assettype_site' });
      var resource = currentScript.getParameter({ name: 'custscript_sna_servicetype_resource' });
      var servicedept = currentScript.getParameter({ name: 'custscript_sna_dept_service' });
      var rentalform = currentScript.getParameter({ name: 'custscript_sna_dept_service' });
      var rentalrevstream = currentScript.getParameter({ name: 'custscript_sn_hul_revstream_rental' });
      var param_usedequipment = currentScript.getParameter({ name: 'custscript_sn_hul_used_equipment' });
      var param_newequipment = currentScript.getParameter({ name: 'custscript_sn_hul_new_equipment' });

      // to compare if new fleet or not for object status
      var oldrec = scriptContext.oldRecord;
      var arrexitingfleets = [];

      if (!isEmpty(oldrec)) {
        var _itemcount = oldrec.getLineCount({ sublistId: 'item' });
        for (var c = 0; c < _itemcount; c++) {
          var _lineuniquekey = oldrec.getSublistValue({ sublistId: 'item', fieldId: 'lineuniquekey', line: c });
          var _fleet = oldrec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: c });

          arrexitingfleets[_lineuniquekey] = _fleet;

          log.debug({
            title: 'afterSubmit',
            details: 'arrexitingfleets: ' + arrexitingfleets[_lineuniquekey] + ' | _lineuniquekey: ' + _lineuniquekey,
          });
        }
      }

      var latestindex = 0;
      var hasnew = false;

      // search for latest counter in the current record
      if (!isEmpty(recid)) {
        var filters = [];
        filters.push(search.createFilter({ name: 'internalid', operator: search.Operator.IS, values: recid }));
        filters.push(search.createFilter({ name: 'mainline', operator: search.Operator.IS, values: 'F' }));
        filters.push(
          search.createFilter({ name: 'custcol_sna_hul_rent_contractidd', operator: search.Operator.ISNOTEMPTY }),
        );

        var columns = [];
        columns.push(search.createColumn({ name: 'tranid' }));
        columns.push(search.createColumn({ name: 'item' }));
        columns.push(search.createColumn({ name: 'custcol_sna_hul_temp_item_code' }));
        columns.push(
          search.createColumn({
            name: 'formulanumeric',
            formula:
              "TO_NUMBER(SUBSTR({custcol_sna_hul_rent_contractidd},INSTR({custcol_sna_hul_rent_contractidd},'_', -1)+1))",
            sort: search.Sort.DESC,
          }),
        );

        var srch = search.create({ type: record.Type.SALES_ORDER, columns: columns, filters: filters });

        srch.run().each(function (result) {
          latestindex = result.getValue({
            name: 'formulanumeric',
            formula:
              "TO_NUMBER(SUBSTR({custcol_sna_hul_rent_contractidd},INSTR({custcol_sna_hul_rent_contractidd},'_', -1)+1))",
          });

          return false; // get first
        });
      }

      var rec = record.load({ type: record.Type.SALES_ORDER, id: recid });
      var orderstatus = rec.getValue({ fieldId: 'orderstatus' });
      var tranid = rec.getValue({ fieldId: 'tranid' });
      var terms = rec.getValue({ fieldId: 'terms' });
      var entity = rec.getValue({ fieldId: 'entity' });
      var proj = rec.getValue({ fieldId: 'job' });
      var addresschanged = rec.getValue({ fieldId: 'custbody_sna_hul_address_changed' });
      var exclude = rec.getValue({ fieldId: 'custbody_sna_hul_exclude_te_creation' });
      var trandate = rec.getValue({ fieldId: 'trandate' });
      var customform = rec.getValue({ fieldId: 'customform' });
      var useqty = rec.getValue({ fieldId: 'custbody_sn_use_qty_for_time' });
      var createtime = rec.getValue({ fieldId: 'custbody_sna_hul_create_time_entry' });

      if (customform == rentalform) {
        rec.setValue({ fieldId: 'cseg_sna_revenue_st', value: rentalrevstream });
      }

      var rid_counter = forceInt(latestindex);
      var dwrentaldays = '';
      var allobjects = [];
      var allrentalobject = [];

      log.debug({
        title: 'afterSubmit',
        details:
          'recid: ' +
          recid +
          ' | tranid: ' +
          tranid +
          ' | terms: ' +
          terms +
          ' | current rid_counter: ' +
          rid_counter +
          ' | addresschanged: ' +
          addresschanged +
          ' | orderstatus: ' +
          orderstatus +
          ' | exclude: ' +
          exclude,
      });

      var itemcount = rec.getLineCount({ sublistId: 'item' });

      // time entry creation
      var emp = '';
      var emploc = '';
      var emplaborcost = '';
      var allassignedto = [];
      var assignedtoinfo = {};

      var toCreateTime = true;
      if (
        scriptContext.type == scriptContext.UserEventType.EDIT &&
        runtime.executionContext == runtime.ContextType.CSV_IMPORT &&
        !createtime
      ) {
        toCreateTime = false;
      }

      log.debug({ title: 'afterSubmit', details: 'toCreateTime: ' + toCreateTime });

      for (var c = 0; c < itemcount; c++) {
        var nxtask = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nx_task', line: c });
        var lineservicetype = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_service_itemcode',
          line: c,
        });

        if (lineservicetype == resource && !isEmpty(nxtask) && !exclude && toCreateTime) {
          var assignedto = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_assigned_to', line: c });

          if (!isEmpty(assignedto)) {
            allassignedto.push(assignedto);
          }
        }
      }

      log.debug({ title: 'afterSubmit', details: 'allassignedto: ' + JSON.stringify(allassignedto) });

      if (!isEmpty(allassignedto)) {
        var _filters = [];
        _filters.push(
          search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: allassignedto }),
        );

        var _columns = [];
        _columns.push(search.createColumn({ name: 'location' }));
        _columns.push(search.createColumn({ name: 'custentity_nx_labor_cost' }));

        var addsrch = search.create({ type: record.Type.EMPLOYEE, columns: _columns, filters: _filters });

        addsrch.run().each(function (result) {
          assignedtoinfo[result.id] = {};
          assignedtoinfo[result.id].location = result.getValue({ name: 'location' });
          assignedtoinfo[result.id].custentity_nx_labor_cost = result.getValue({ name: 'custentity_nx_labor_cost' });

          return true;
        });

        log.debug({ title: 'afterSubmit', details: 'assignedtoinfo: ' + JSON.stringify(assignedtoinfo) });
      }

      // Start calc for rental billing
      var previnvoices = getPrevInvoices(recid, serviceitem, param_ldw);

      let linkedTimeIds = [];
      for (let line = 0; line < itemcount; line++) {
        linkedTimeIds.push(rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_linked_time', line }));
      }
      linkedTimeIds = [...new Set(linkedTimeIds)].filter((x) => !isEmpty(x));
      const timeEntryProps = searchTimeEntryProps(linkedTimeIds);
      log.audit('LINKED_TIME_ENTRY_SUMMARY', timeEntryProps);

      for (var i = 0; i < itemcount; i++) {
        var objconfig = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_hul_object_configurator',
          line: i,
        });
        var config2fields = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_hul_object_configurator_2',
          line: i,
        });
        var contractid = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_hul_rent_contractidd',
          line: i,
        });
        var startdate = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_rent_start_date', line: i });
        var enddate = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', line: i });
        var billdate = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i });
        var timeunit = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_time_unit', line: i });
        var itmgroup = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i });
        var override = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_overridebilldate', line: i });
        var rentaldays = rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
        var dailyrate = rec.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i });
        var itmtype = rec.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: i });

        log.debug({
          title: 'afterSubmit',
          details:
            'line: ' +
            (forceInt(i) + 1) +
            ' | rid_counter: ' +
            rid_counter +
            ' | startdate: ' +
            startdate +
            ' | override: ' +
            override +
            ' | enddate: ' +
            enddate +
            ' | rentaldays: ' +
            rentaldays +
            ' | dailyrate: ' +
            dailyrate +
            ' | billdate: ' +
            billdate +
            ' | timeunit: ' +
            timeunit +
            ' | itmgroup: ' +
            itmgroup +
            ' | objconfig: ' +
            objconfig +
            ' | config2fields: ' +
            config2fields,
        });

        var itm = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
        var nxtask = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nx_task', line: i });
        var nxcase = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nxc_case', line: i });
        var fleetno = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: i });
        var fleetcode = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_po_fleet_code', line: i });
        var fleetnotxt = rec.getSublistText({ sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: i });
        var lineuniquekey = rec.getSublistValue({ sublistId: 'item', fieldId: 'lineuniquekey', line: i });
        var oldfleetno = !isEmpty(arrexitingfleets[lineuniquekey]) ? arrexitingfleets[lineuniquekey] : '';
        var lineservicetype = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_service_itemcode',
          line: i,
        });
        var taskassignedto = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_task_assigned_to',
          line: i,
        });
        var qty = rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
        var actualqty = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_hul_act_service_hours',
          line: i,
        });
        var taskstartdate = rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_taskdate', line: i });

        if (itm == serviceitem) {
          // assumed the rental charge comes before the damage waiver charge
          dwrentaldays = rentaldays;

          if (!inArray(fleetno, allrentalobject) && !isEmpty(fleetno)) {
            allrentalobject.push(fleetno);
          }
        }

        log.debug({
          title: 'afterSubmit',
          details: { line: forceInt(i) + 1, itm, nxtask, nxcase, fleetno, oldfleetno, lineservicetype, dwrentaldays },
        });

        // Rental Charge
        if (!isEmpty(objconfig)) {
          // set the Rental Contract ID
          if (isEmpty(contractid)) {
            rid_counter += 1;
            hasnew = true;

            log.debug({
              title: 'afterSubmit',
              details: 'line: ' + (forceInt(i) + 1) + ' | rid_counter: ' + rid_counter,
            });

            rec.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_sna_hul_rent_contractidd',
              line: i,
              value: fleetnotxt + '_' + fleetcode + '_' + tranid + '_' + rid_counter,
            }); //maan
            contractid = fleetnotxt + '_' + fleetcode + '_' + tranid + '_' + rid_counter;
          }
        }

        // Used Equipment
        if ((itm == param_usedequipment || itm == param_newequipment) && !isEmpty(fleetno) && fleetno != oldfleetno) {
          allobjects.push(fleetno);
        }

        // Create time entry if created from NXC Mobile and contains a Resource Item
        if (lineservicetype == resource && !isEmpty(nxtask) && !exclude && toCreateTime) {
          emp = taskassignedto;

          if (!isEmpty(assignedtoinfo[taskassignedto])) {
            emploc = assignedtoinfo[taskassignedto].location;
            emplaborcost = assignedtoinfo[taskassignedto].custentity_nx_labor_cost;
          } else {
            emploc = '';
            emplaborcost = 0;
          }

          /**
           * @type {ResourceItem}
           */
          let resourceItem = {};
          resourceItem.employee = emp;
          resourceItem.customer = !isEmpty(proj)
            ? proj
            : rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_task_company', line: i });
          resourceItem.casetaskevent = !isEmpty(nxcase)
            ? nxcase
            : rec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_taskcase', line: i });
          resourceItem.item = itm;
          resourceItem.memo = tranid;
          if (
            ((new Date(taskstartdate) >= new Date('5/22/2023') && new Date(taskstartdate) <= new Date('8/30/2023')) ||
              useqty) &&
            isEmpty(actualqty)
          ) {
            resourceItem.hours = qty;
          } else {
            resourceItem.hours = actualqty;
          }
          resourceItem.isbillable = false;
          resourceItem.trandate = taskstartdate;
          resourceItem.department = servicedept;
          resourceItem.location = emploc;
          resourceItem.cseg_sna_revenue_st = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'cseg_sna_revenue_st',
            line: i,
          });
          resourceItem.cseg_hul_mfg = rec.getSublistValue({ sublistId: 'item', fieldId: 'cseg_hul_mfg', line: i });
          resourceItem.cseg_sna_hul_eq_seg = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'cseg_sna_hul_eq_seg',
            line: i,
          });
          resourceItem.custcol_nx_task = nxtask;
          resourceItem.custcol_nx_asset = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_nx_asset',
            line: i,
          });
          resourceItem.custcol_sna_repair_code = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_repair_code',
            line: i,
          });
          resourceItem.custcol_sna_group_code = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_group_code',
            line: i,
          });
          resourceItem.custcol_sna_work_code = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_work_code',
            line: i,
          });
          resourceItem.custcol_nxc_equip_asset = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_nxc_equip_asset',
            line: i,
          });
          resourceItem.custcol_nxc_time_desc = tranid;
          resourceItem.custcol_sna_linked_so = recid;
          resourceItem.custcol_sna_linked_time = rec.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_sna_linked_time',
            line: i,
          });
          resourceItem.custcol_nx_time_cost = !isEmpty(emplaborcost) ? emplaborcost : 0;

          var timeId = createTimeEntry(resourceItem, orderstatus, timeEntryProps);

          if (!isEmpty(timeId)) {
            rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_linked_time', line: i, value: timeId });

            hasnew = true;
          }
        }

        // Other Charge for Fuel, Overtime, Customer Damage = End Date
        // Fuel, Overtime and all other charges are Billed at the end of the contract
        if (itmtype == 'OthCharge' && itmgroup != param_freight && itmgroup != param_ldw) {
          if (enddate != billdate && !override) {
            rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i, value: enddate });

            hasnew = true;
          }
        }

        // Rental charges Damage Waiver will follow Time Unit; Freight charge is 1st invoice
        else if (itm == serviceitem || itmgroup == param_freight || itmgroup == param_ldw) {
          // for first time invoice
          if (itmgroup == param_freight) {
            rentaldays = dwrentaldays;
          }

          var fourweeks = 0;
          if (rentaldays > 20) {
            var total20days = rentaldays / 20;
            fourweeks = Math.ceil(total20days);
            rec.setValue({ fieldId: 'custbody_sn_rental_billing_cycle', value: fourweeks });
          } else {
            rec.setValue({ fieldId: 'custbody_sn_rental_billing_cycle', value: 1 });
          }

          var billdates = [];
          var tempstartdate = startdate;
          var tempenddate = enddate;
          var dateminus = !isEmpty(startdate) ? addDays(startdate, -1) : '';

          // Customer with Credit Card or term = COD or Credit Card
          if ((terms == cod || terms == cc) && !override) {
            // Freight Charges are billed on the first Invoice which is the date before start date
            if (itmgroup == param_freight) {
              if (dateminus != billdate && !override) {
                rec.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_hul_bill_date',
                  line: i,
                  value: dateminus,
                });

                hasnew = true;
              }
            }

            // Rental charge or damage waiver charge is billed every billing period
            else {
              // rental days less than 20
              if (rentaldays <= 20) {
                rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sn_hul_billingsched', line: i, value: '' });

                // All Rental Charges (Day, Week and 4 Week) are billed before the Rental Start Date
                if (dateminus != billdate && !override) {
                  rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_hul_bill_date',
                    line: i,
                    value: dateminus,
                  });
                }

                hasnew = true;
              }

              // rental days more than 20
              else {
                if (override) continue;

                rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i, value: '' });

                var counter = 1;
                var previnv = !isEmpty(previnvoices[lineuniquekey]) ? previnvoices[lineuniquekey] : '';
                log.audit({
                  title: 'afterSubmit',
                  details: 'line: ' + (forceInt(i) + 1) + ' | previnv: ' + JSON.stringify(previnv),
                });

                var previnvqty = !isEmpty(previnv) ? previnv.invqty : '';
                var previnvenddate = !isEmpty(previnv) ? previnv.invenddate : '';
                if (
                  !isEmpty(previnvenddate) &&
                  forceFloat(previnvqty) > 0 &&
                  forceFloat(previnvqty) < forceFloat(rentaldays)
                ) {
                  tempstartdate = addDays(previnvenddate, 1);
                  log.audit({
                    title: 'afterSubmit',
                    details: 'line: ' + (forceInt(i) + 1) + ' | new tempstartdate: ' + tempstartdate,
                  });
                }

                var temptodate = startdate;
                while (
                  format.format({ value: new Date(temptodate), type: format.Type.DATE }) !=
                  format.format({ value: new Date(enddate), type: format.Type.DATE })
                ) {
                  //for (var c = 1; c <= fourweeks; c++) {
                  var additionalDays = 20;

                  var obj = {};
                  obj.fromdate = tempstartdate;
                  var currday = obj.fromdate.getDay();
                  if (currday == 0 || currday == 6) additionalDays = 21; // 21 days for sat and sunday start date
                  tempenddate = addDays(addBusinessDays(obj.fromdate, additionalDays), -1);
                  if (tempenddate > enddate) {
                    tempenddate = enddate;
                  }
                  obj.todate = tempenddate; // (start date + 21 working days) - 1 day | NOTE: 21 working days include 1st day
                  obj.billdate = addDays(obj.fromdate, -1); // start date - 1 day
                  obj.dailyrate = dailyrate; // always the rate field because time unit is always day
                  obj.rentaldays = rentaldays;

                  billdates.push(obj);

                  // set values for next billing period
                  tempstartdate = addDays(obj.todate, 1);
                  counter++;
                  temptodate = obj.todate;
                }

                log.audit({
                  title: 'afterSubmit',
                  details: 'line: ' + (forceInt(i) + 1) + ' | billdates: ' + JSON.stringify(billdates),
                });

                rec.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sn_hul_billingsched',
                  line: i,
                  value: JSON.stringify(billdates),
                });
                hasnew = true;
              }
            }
          }

          // If Sales Order Terms is not Credit Card or COD
          else if (terms != cod && terms != cc) {
            var firstbilldate = '';

            // rental days less than 20
            if (rentaldays <= 20) {
              rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sn_hul_billingsched', line: i, value: '' });

              // set the Bill Date to Contract Date for Rental Service charge Time Unit is 4-Weekly || Freight Charges are billed on the first Invoice
              if (timeunit == param_4weekly) {
                if (trandate != billdate && !override) {
                  rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_hul_bill_date',
                    line: i,
                    value: trandate,
                  });
                  hasnew = true;
                }

                firstbilldate = trandate;
              }
              // set the Bill Date to End Date Rental Service Charge Time Unit is Daily and/or Weekly || Freight Charges are billed on the first Invoice
              else if (timeunit == param_weekly || timeunit == param_daily) {
                if (enddate != billdate && !override) {
                  rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_hul_bill_date',
                    line: i,
                    value: enddate,
                  });

                  hasnew = true;
                }

                firstbilldate = enddate;
              }
            }

            // rental days more than 20
            else {
              if (override) continue;

              // Rental charge or damage waiver charge is billed every billing period
              rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i, value: '' });

              var haprev = false;
              var counter = 1;
              var previnv = !isEmpty(previnvoices[lineuniquekey]) ? previnvoices[lineuniquekey] : '';
              log.audit({
                title: 'afterSubmit',
                details: 'line: ' + (forceInt(i) + 1) + ' | previnv: ' + JSON.stringify(previnv),
              });

              var previnvqty = !isEmpty(previnv) ? previnv.invqty : '';
              var previnvenddate = !isEmpty(previnv) ? previnv.invenddate : '';
              if (
                !isEmpty(previnvenddate) &&
                forceFloat(previnvqty) > 0 &&
                forceFloat(previnvqty) < forceFloat(rentaldays)
              ) {
                haprev = true;
                tempstartdate = addDays(previnvenddate, 1);
                log.audit({
                  title: 'afterSubmit',
                  details: 'line: ' + (forceInt(i) + 1) + ' | new tempstartdate: ' + tempstartdate,
                });
              }

              var temptodate = startdate;
              while (
                format.format({ value: new Date(temptodate), type: format.Type.DATE }) !=
                format.format({ value: new Date(enddate), type: format.Type.DATE })
              ) {
                //for (var c = 1; c <= fourweeks; c++) {
                var additionalDays = 20;

                var obj = {};
                obj.fromdate = tempstartdate;
                var currday = obj.fromdate.getDay();
                if (currday == 0 || currday == 6) additionalDays = 21; // 21 days for sat and sunday start date
                tempenddate = addDays(addBusinessDays(obj.fromdate, additionalDays), -1);
                if (tempenddate > enddate) {
                  tempenddate = enddate;
                }
                obj.todate = tempenddate; // (start date + 21 working days) - 1 day | NOTE: 21 working days include 1st day
                obj.billdate = counter == 1 && !haprev ? addDays(obj.fromdate, -1) : addDays(obj.fromdate, -7); // start date - 7 days
                obj.dailyrate = dailyrate; // always the rate field because time unit is always day
                obj.rentaldays = rentaldays;

                billdates.push(obj);

                // set values for next billing period
                tempstartdate = addDays(obj.todate, 1);
                counter++;
                temptodate = obj.todate;
              }

              log.audit({
                title: 'afterSubmit',
                details: 'line: ' + (forceInt(i) + 1) + ' | billdates: ' + JSON.stringify(billdates),
              });

              rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sn_hul_billingsched',
                line: i,
                value: JSON.stringify(billdates),
              });
              hasnew = true;

              firstbilldate = dateminus;
            }

            // Freight Charges are billed on the first Invoice
            if (itmgroup == param_freight) {
              if (dateminus != billdate && !override) {
                rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sn_hul_billingsched', line: i, value: '' });
                rec.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_hul_bill_date',
                  line: i,
                  value: firstbilldate,
                });

                hasnew = true;
              }
            }
          }
        }
      }

      // remove bill date via item revenue streams
      var excludeRevenueStream = currentScript.getParameter({ name: 'custscript_sn_execlude_revenue_stream' });
      if (excludeRevenueStream) {
        for (var line = 0; line < itemcount; line++) {
          var itemId = rec.getSublistValue({ sublistId: 'item', line: line, fieldId: 'item' });
          var itemRevenue = search.lookupFields({ type: 'item', id: itemId, columns: ['cseg_sna_revenue_st', 'type'] });
          if (
            itemRevenue &&
            itemRevenue.cseg_sna_revenue_st &&
            itemRevenue.cseg_sna_revenue_st[0] &&
            itemRevenue.cseg_sna_revenue_st[0].value
          ) {
            var revenue = itemRevenue.cseg_sna_revenue_st[0].value;
            if (itemRevenue.type[0].value === 'OthCharge' && revenue === excludeRevenueStream) {
              rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: line, value: '' });
            }
          }
        }
      }

      // save all the time
      rec.setValue({ fieldId: 'custbody_sna_hul_address_changed', value: false });
      rec.save();
      log.debug({ title: 'afterSubmit', details: 'SO lines updated: ' + recid });

      // Used Equipment
      if (!isEmpty(allobjects)) {
        updateObjectStatus(allobjects);
      }

      // Rental objects
      if (
        scriptContext.type == scriptContext.UserEventType.COPY ||
        scriptContext.type == scriptContext.UserEventType.CREATE
      ) {
        if (!isEmpty(allrentalobject)) {
          updateRentalObjectStatus(allrentalobject);
        }
      }

      // Create NXC Site Asset from Customer Address
      if (addresschanged) {
        var siteassetid = checkNxAssets(recid, rec, entity, siteform, sitetype);

        if (!hasnew) {
          var fldobjs = {};
          fldobjs.custbody_sna_hul_address_changed = false;

          record.submitFields({ type: record.Type.SALES_ORDER, id: recid, values: fldobjs });
          log.debug({ title: 'afterSubmit', details: 'address changed to false: ' + recid });
        }
      }
    } catch (e) {
      if (e.message != undefined) {
        log.error('ERROR', e.name + ' ' + e.message);
      } else {
        log.error('ERROR', 'Unexpected Error', e.toString());
      }
    }
  };

  /**
   * Update rental object
   * @param allrentalobject
   */
  function updateRentalObjectStatus(allrentalobject) {
    var currscript = runtime.getCurrentScript();
    var rental_config = currscript.getParameter('custscriptcustscript_sn_eqstatus_rconfig');

    for (var z = 0; z < allrentalobject.length; z++) {
      var obj = allrentalobject[z];

      record.submitFields({
        type: 'customrecord_sna_objects',
        id: obj,
        values: { custrecord_sna_status: rental_config },
      });
      log.debug({
        title: 'updateObjectStatus',
        details: 'fleet updated: ' + obj + ' | rental_config: ' + rental_config,
      });
    }
  }

  /**
   * Update object status
   * @param allobjects
   */
  function updateObjectStatus(allobjects) {
    var currscript = runtime.getCurrentScript();
    var nfs_inv_onorder = currscript.getParameter('custscript_sna_equipstat_inv_on_so');
    var nfs_on_order = currscript.getParameter('custscript_sna_equipstat_on_order');
    var config_for_sale = currscript.getParameter('custscript_sna_equipstat_configsale');

    // search for related PO and IR
    var objinfo = {};

    var _filters = [];
    _filters.push(
      search.createFilter({ name: 'custcol_sna_hul_fleet_no', operator: search.Operator.ANYOF, values: allobjects }),
    );
    _filters.push(
      search.createFilter({
        name: 'type',
        join: 'applyingtransaction',
        operator: search.Operator.ANYOF,
        values: ['@NONE@', 'ItemRcpt'],
      }),
    );

    var _columns = [];
    _columns.push(search.createColumn({ name: 'custcol_sna_hul_fleet_no' }));
    _columns.push(search.createColumn({ name: 'applyingtransaction' }));
    _columns.push(search.createColumn({ name: 'type', join: 'applyingTransaction' }));

    var posrch = search.create({ type: record.Type.PURCHASE_ORDER, columns: _columns, filters: _filters });

    posrch.run().each(function (result) {
      var obj = result.getValue({ name: 'custcol_sna_hul_fleet_no' });
      var applyingtype = result.getValue({ name: 'type', join: 'applyingTransaction' });

      if (isEmpty(objinfo[obj])) {
        objinfo[obj] = {};
      }
      objinfo[obj].po = result.id;
      if (applyingtype == 'ItemRcpt') {
        objinfo[obj].ir = result.getValue({ name: 'applyingtransaction' });
      }

      return true;
    });

    for (var z = 0; z < allobjects.length; z++) {
      var obj = allobjects[z];

      var finalstatus = nfs_inv_onorder;

      if (!isEmpty(objinfo[obj])) {
        log.debug({
          title: 'updateObjectStatus',
          details: 'obj: ' + obj + ' | objinfo: ' + JSON.stringify(objinfo[obj]),
        });

        if (!isEmpty(objinfo[obj].po)) {
          var finalstatus = nfs_on_order;
        }
        if (!isEmpty(objinfo[obj].ir)) {
          var finalstatus = config_for_sale;
        }
      }

      record.submitFields({
        type: 'customrecord_sna_objects',
        id: obj,
        values: { custrecord_sna_status: finalstatus },
      });
      log.debug({ title: 'updateObjectStatus', details: 'fleet updated: ' + obj + ' | finalstatus: ' + finalstatus });
    }
  }

  /**
   * Get previous invoices
   * @param recid
   * @param serviceitem
   * @param param_ldw
   * @returns {*[]}
   */
  function getPrevInvoices(recid, serviceitem, param_ldw) {
    var previnvoices = [];

    var transactionSearchObj = search.create({
      type: search.Type.INVOICE,
      filters: [
        ['createdfrom', 'anyof', recid],
        'AND',
        [['item', 'anyof', serviceitem], 'OR', ['item.custitem_sna_hul_gen_prodpost_grp', 'anyof', param_ldw]],
        'AND',
        [['applyingtransaction.type', 'is', 'CustCred'], 'OR', ['appliedtotransaction.type', 'is', 'SalesOrd']],
      ],
      columns: [
        search.createColumn({ name: 'item' }),
        search.createColumn({ name: 'quantitybilled', join: 'appliedToTransaction' }), // SO Qty Billed
        search.createColumn({ name: 'lineuniquekey', join: 'appliedToTransaction' }), // SO line
        search.createColumn({ name: 'quantity', join: 'applyingTransaction' }), // CM Qty
        search.createColumn({ name: 'custcol_sna_hul_rent_end_date', sort: search.Sort.DESC }), // Inv End Date
        search.createColumn({ name: 'quantity' }), // Inv Qty
      ],
    });
    var searchResultCount = transactionSearchObj.runPaged().count;
    log.debug('getPrevInvoices', 'transactionSearchObj result count: ' + searchResultCount);

    transactionSearchObj.run().each(function (result) {
      var solinekey = result.getValue({ name: 'lineuniquekey', join: 'appliedToTransaction' });
      var cmqty = result.getValue({ name: 'quantity', join: 'applyingTransaction' });
      var invid = result.id;

      if (isEmpty(previnvoices[solinekey])) {
        previnvoices[solinekey] = {
          invqty: forceFloat(result.getValue({ name: 'quantity' })),
          invenddate: result.getValue({ name: 'custcol_sna_hul_rent_end_date' }),
        };
      }
      previnvoices[solinekey].invqty += forceFloat(cmqty); // negative

      return true;
    });

    return previnvoices;
  }

  /**
   * @typedef {object} ResourceItem - object representation of properties to be used for createTimeEntry function.
   * @property {string|number} employee
   * @property {string|number} customer
   * @property {string|number} casetaskevent
   * @property {string} item
   * @property {string} memo
   * @property {number} hours
   * @property {boolean} isbillable
   * @property {date} taskstartdate
   * @property {number} department - Line level department
   * @property {location} location - Line level location
   * @property {number} cseg_sna_revenue_st - Revenue Stream Segment sourced from a sales order line item
   * @property {number} custcol_nx_task
   * @property {number} custcol_nx_asset
   * @property {number} custcol_sna_repair_code
   * @property {number} custcol_sna_group_code
   * @property {number} custcol_sna_work_code
   * @property {number} custcol_nxc_equip_asset
   * @property {number} custcol_nxc_time_desc
   * @property {number} custcol_sna_linked_so
   * @property {number} custcol_sna_linked_time
   * @property {number} custcol_nx_time_cost
   * @property {number} cseg_sna_hul_eq_seg - Equipment Posting/Category/Group sourced from a sales order line item
   * @property {number} cseg_hul_mfg - HUL Manufacturer sourced from sales order line item
   */

  /**
   * Create time entry for resource items
   * @param {ResourceItem} props
   * @param {string} orderStatus
   * @param {[{timeId: number, hours: number, isPosted: boolean}]} timeEntryProps
   * @returns {string|number} the time bill internal id
   */
  function createTimeEntry(props, orderStatus, timeEntryProps) {
    let timeId = '';
    const SalesOrderStatus = {
      PENDING_APPROVAL: 'A',
      PENDING_FULFILLMENT: 'B',
      CANCELLED: 'C',
      PARTIALLY_FULFILLED: 'D',
      PENDING_BILLING_PARTIALLY_FULFILLED: 'E',
      PENDING_BILLING: 'F',
      BILLED: 'G',
      CLOSED: 'H',
    };
    try {
      log.debug({ title: 'createTimeEntry:PROPS', details: props });

      if (isEmpty(props.employee)) return ''; // this is mandatory

      if (!isEmpty(props.custcol_sna_linked_time)) {
        const linkedTimeDetails = timeEntryProps.find((x) => x.timeId == props.custcol_sna_linked_time);
        const { hours: currentDuration = 0, posted: isPosted = false } = linkedTimeDetails;
        log.debug({ title: 'createTimeEntry: hours_isPosted?', details: { linkedTimeDetails, props } });
        const propsToUpdate = {
          cseg_sna_revenue_st: props.cseg_sna_revenue_st,
          cseg_sna_hul_eq_seg: props.cseg_sna_hul_eq_seg,
          cseg_hul_mfg: props.cseg_hul_mfg,
        };

        if (currentDuration != props.hours) {
          propsToUpdate.hours = props.hours;
        }

        const isSalesOrderBilledOrClosed = [SalesOrderStatus.BILLED, SalesOrderStatus.CLOSED].includes(orderStatus);
        log.audit('createTimeEntry: statuscheck', { isSalesOrderBilledOrClosed, orderStatus });
        log.audit('createTimeEntry:isPosted');
        if (!isPosted && !isSalesOrderBilledOrClosed) {
          log.debug({ title: 'createTimeEntry', details: 'Updating time entry: ' + props.custcol_sna_linked_time });
          record.submitFields
            .promise({ type: record.Type.TIME_BILL, id: props.custcol_sna_linked_time, values: propsToUpdate })
            .catch((err) => {
              log.error({
                title: 'createTimeEntry: ERROR_UPDATING_TIME_ENTRY',
                details: { message: err.message, stack: err.stack },
              });
            });
        } else {
          log.audit('STARTING_MOCK_TIME_ENTRY_CREATION');
          /*let timeBill = record.create({ type: record.Type.TIME_BILL, isDynamic: true });
          log.debug({ title: 'createTimeEntry', details: 'Creating time entry' });
          for (let [fieldId, value] of Object.entries(props)) {
            try {
              if (!isEmpty(value)) {
                log.audit({ title: 'createTimeEntry: setFieldValue_LOG', details: { fieldId, value } });
                timeBill.setValue({ fieldId, value });
              }
            } catch (e) {
              if (e.message != undefined) {
                log.error('ERROR', `${e.name} ${e.message}`);
              } else {
                log.error('ERROR', 'Unexpected Error', e.toString());
              }
            }
          }

          timeId = timeBill.save({ ignoreMandatoryFields: true, enableSourcing: false });*/
        }
      } else {
        let timeBill = record.create({ type: record.Type.TIME_BILL, isDynamic: true });
        log.debug({ title: 'createTimeEntry', details: 'Creating time entry' });
        for (let [fieldId, value] of Object.entries(props)) {
          try {
            if (!isEmpty(value)) {
              log.audit({ title: 'createTimeEntry: setFieldValue_LOG', details: { fieldId, value } });
              timeBill.setValue({ fieldId, value });
            }
          } catch (e) {
            if (e.message != undefined) {
              log.error('ERROR', `${e.name} ${e.message}`);
            } else {
              log.error('ERROR', 'Unexpected Error', e.toString());
            }
          }
        }

        timeId = timeBill.save({ ignoreMandatoryFields: true, enableSourcing: false });
        log.debug({ title: 'createTimeEntry', details: 'Time created: ' + timeId });
      }

      return timeId;
    } catch (e) {
      if (e.message != undefined) {
        log.error('ERROR', e.name + ' ' + e.message);
      } else {
        log.error('ERROR', 'Unexpected Error', e.toString());
      }
    }
  }

  /**
   * Check for existing NX Asset
   * @param recid
   * @param rec
   * @param entity
   * @param siteform
   * @param sitetype
   */
  function checkNxAssets(recid, rec, entity, siteform, sitetype) {
    var siteassetid = '';
    var shipfilter1 = '';
    var shipfilter2 = '';
    var shipfilter3 = '';
    var shipaddress = '';
    var shipzip = '';

    var _filters = [];
    _filters.push(search.createFilter({ name: 'internalid', operator: search.Operator.IS, values: recid }));

    var _columns = [];
    _columns.push(search.createColumn({ name: 'shipaddress' }));
    _columns.push(search.createColumn({ name: 'shipcountry' }));
    _columns.push(search.createColumn({ name: 'shippingattention' }));
    _columns.push(search.createColumn({ name: 'shipaddressee' }));
    _columns.push(search.createColumn({ name: 'shipaddress1' }));
    _columns.push(search.createColumn({ name: 'shipaddress2' }));
    _columns.push(search.createColumn({ name: 'shipaddress3' }));
    _columns.push(search.createColumn({ name: 'shipcity' }));
    _columns.push(search.createColumn({ name: 'shipstate' }));
    _columns.push(search.createColumn({ name: 'shipzip' }));

    var addsrch = search.create({ type: record.Type.SALES_ORDER, columns: _columns, filters: _filters });

    addsrch.run().each(function (result) {
      shipaddress = result.getValue({ name: 'shipaddress' });
      var shipcountry = result.getValue({ name: 'shipcountry' });
      var shipattention = result.getValue({ name: 'shippingattention' });
      var shipaddressee = result.getValue({ name: 'shipaddressee' });
      var shipaddress1 = result.getValue({ name: 'shipaddress1' });
      var shipaddress2 = result.getValue({ name: 'shipaddress2' });
      var shipaddress3 = result.getValue({ name: 'shipaddress3' });
      var shipcity = result.getValue({ name: 'shipcity' });
      var shipstate = result.getValue({ name: 'shipstate' });
      shipzip = result.getValue({ name: 'shipzip' });

      log.debug({
        title: 'checkNxAssets',
        details:
          'shipaddress1: ' +
          shipaddress1 +
          ' | shipaddress2: ' +
          shipaddress2 +
          ' | shipaddress3: ' +
          shipaddress3 +
          ' | shipcity: ' +
          shipcity +
          ' | shipstate: ' +
          shipstate +
          ' | shipzip: ' +
          shipzip,
      });

      if (!isEmpty(shipaddress1)) {
        shipfilter1 += shipaddress1;
      }
      if (!isEmpty(shipaddress2)) {
        shipfilter2 += shipaddress2;
      }
      // add add3 only if add1 and add2 are empty
      if (isEmpty(shipaddress1) && isEmpty(shipaddress2)) {
        shipfilter1 += shipaddress3;
      }

      if (!isEmpty(shipcity)) {
        shipfilter3 += shipcity + ' ';
      }
      if (!isEmpty(shipstate)) {
        shipfilter3 += shipstate + ' ';
      }
      if (!isEmpty(shipzip)) {
        shipfilter3 += shipzip;
      }

      shipaddress = shipaddress.replace(shipaddressee, '');

      return false; // get first
    });

    shipfilter1 = shipfilter1.toLowerCase();
    shipfilter2 = shipfilter2.toLowerCase();
    shipfilter3 = shipfilter3.toLowerCase();

    log.debug({
      title: 'checkNxAssets',
      details:
        'shipfilter1: ' +
        shipfilter1 +
        ' | shipfilter2: ' +
        shipfilter2 +
        ' | shipfilter3: ' +
        shipfilter3 +
        ' | entity: ' +
        entity,
    });

    var filters = [];
    filters.push(
      search.createFilter({ name: 'custrecord_nx_asset_customer', operator: search.Operator.IS, values: entity }),
    );
    filters.push(
      search.createFilter({ name: 'custrecord_nxc_na_asset_type', operator: search.Operator.IS, values: sitetype }),
    );
    filters.push(search.createFilter({ name: 'isinactive', operator: search.Operator.IS, values: 'F' }));
    if (!isEmpty(shipfilter1)) {
      filters.push(
        search.createFilter({
          name: 'formulanumeric',
          operator: search.Operator.EQUALTO,
          values: 1,
          formula:
            "case when TO_NUMBER(INSTR(LOWER({custrecord_nx_asset_address_text}), '" +
            shipfilter1 +
            "')) > 0 then 1 else 0 end",
        }),
      );
    }
    if (!isEmpty(shipfilter2)) {
      filters.push(
        search.createFilter({
          name: 'formulanumeric',
          operator: search.Operator.EQUALTO,
          values: 1,
          formula:
            "case when TO_NUMBER(INSTR(LOWER({custrecord_nx_asset_address_text}), '" +
            shipfilter2 +
            "')) > 0 then 1 else 0 end",
        }),
      );
    }
    if (!isEmpty(shipfilter3)) {
      filters.push(
        search.createFilter({
          name: 'formulanumeric',
          operator: search.Operator.EQUALTO,
          values: 1,
          formula:
            "case when TO_NUMBER(INSTR(LOWER({custrecord_nx_asset_address_text}), '" +
            shipfilter3 +
            "')) > 0 then 1 else 0 end",
        }),
      );
    }

    var columns = [];
    columns.push(search.createColumn({ name: 'custrecord_nx_asset_address_text' }));

    var srch = search.create({ type: 'customrecord_nx_asset', columns: columns, filters: filters });
    var ser = srch.run().getRange({ start: 0, end: 1 });

    if (!isEmpty(ser)) {
      var res_address = ser[0].getValue({ name: 'custrecord_nx_asset_address_text' });
      log.debug({ title: 'checkNxAssets', details: 'res_address: ' + res_address });
    } else {
      // If no Site Asset has been found, create a Site Asset with the following fields populated
      siteassetid = createSiteAsset(entity, shipzip, shipaddress, siteform, sitetype);
    }

    return siteassetid;
  }

  /**
   * Create NX Asset
   * @param entity
   * @param shipzip
   * @param shipaddress
   * @param siteform
   * @param sitetype
   */
  function createSiteAsset(entity, shipzip, shipaddress, siteform, sitetype) {
    var region = getZipRegion(shipzip);

    // nextservice asset
    var nxrec = record.create({ type: 'customrecord_nx_asset' });
    nxrec.setValue({ fieldId: 'customform', value: siteform });
    nxrec.setValue({ fieldId: 'custrecord_nxc_na_asset_type', value: sitetype });
    //nxrec.setValue({fieldId: 'name', value: (entity + ' || ' + shipaddress)});
    nxrec.setValue({ fieldId: 'name', value: shipaddress });
    nxrec.setValue({ fieldId: 'custrecord_nx_asset_customer', value: entity });
    nxrec.setValue({ fieldId: 'custrecord_nx_asset_address_text', value: shipaddress });
    nxrec.setValue({ fieldId: 'custrecord_nx_asset_region', value: region });
    var nxid = nxrec.save({ ignoreMandatoryFields: true });
    log.debug({ title: 'createSiteAsset', details: 'nx asset created: ' + nxid });

    return nxid;
  }

  /**
   * Get region from zip
   * @param shipzip
   * @returns {string}
   */
  function getZipRegion(shipzip) {
    log.debug({ title: 'getZipRegion', details: 'shipzip: ' + shipzip });

    var region = '';

    if (isEmpty(shipzip)) return region;

    var salesZoneSrch = search.create({
      type: 'customrecord_sna_sales_zone',
      filters: [{ name: 'custrecord_sna_st_zip_code', operator: search.Operator.IS, values: shipzip }],
      columns: ['custrecord_sna_hul_nxc_region'],
    });

    salesZoneSrch.run().each(function (result) {
      region = result.getValue({ name: 'custrecord_sna_hul_nxc_region' });

      return false; // get 1st
    });

    log.debug({ title: 'getZipRegion', details: 'region: ' + region });

    return region;
  }

  /**
   *
   * @param {number[]} timeIds
   * @returns {*|*[{timeId: number, hours: number, posted: boolean}]}
   */
  function searchTimeEntryProps(timeIds = []) {
    log.audit('TIME_IDS_PARAMS', timeIds);
    try {
      if (timeIds.length == 0) return [];
      log.audit('TIME_IDS', timeIds);
      const searchObj = search.create({
        type: search.Type.TIME_BILL,
        filters: [search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: timeIds })],
        columns: [
          search.createColumn({ name: 'internalid' }),
          search.createColumn({ name: 'hours' }),
          search.createColumn({ name: 'posted' }),
        ],
      });
      const results = searchObj.run().getRange({ start: 0, end: 1000 });
      return results.map((result) => ({
        timeId: result.getValue({ name: 'internalid' }),
        hours: result.getValue({ name: 'hours' }),
        posted: result.getValue({ name: 'posted' }),
      }));
    } catch (err) {
      log.error({ title: 'SEARCH_TIME_ENTRY_PROPS_ERR', details: { message: err.message, stack: err.stack } });
      return [];
    }
  }

  return { beforeLoad, beforeSubmit, afterSubmit };
});
