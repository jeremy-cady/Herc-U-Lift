/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to prevent SO fulfillment and invoicing
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/8/4       		                 aduldulao       Initial version.
 * 2022/8/24                             aduldulao       Rental invoice lines if Bill Date <= Date today
 * 2022/9/12                             aduldulao       Update object once shipped
 * 2022/9/19                             aduldulao       Null checking
 * 2022/9/22       		                 aduldulao       Add config 2 checking
 * 2022/9/26       		                 aduldulao       Remove lines beforeload
 * 2022/10/16       		             aduldulao       Final Invoice
 * 2022/11/1         		             aduldulao       Remove Final Invoice
 * 2022/11/4       		                 aduldulao       Act_Config
 * 2023/1/16       		                 aduldulao       Rental Module – Statuses
 * 2023/03/08       	64505             vpitale        Update Code for Handling Cost
 * 2023/3/22       		                 aduldulao       Move Object Updates
 * 2023/6/18                             aduldulao       Invoice Qty > SO Qty minus Returned Qty
 * 2023/7/13                             aduldulao       Rental enhancements
 * 2023/8/11       		                 aduldulao       Rental enhancements
 * 2023/9/28                             aduldulao       Used Equipment Item
 * 2023/11/20                            aduldulao       Multiple billing formula
 * 2023/11/21                            aduldulao       New rate calculation
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format', 'SuiteScripts/moment.js'],
    /**
 * @param{record} record
 */
    (record, search, runtime, format, moment) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
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

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
        }

        function round(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        }

        function workday_count(start, end) {
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

        function workingDaysBetweenDates(startDate, endDate) {
            // Validate input
            if (endDate < startDate)
                return 0;
            if (isEmpty(endDate) || isEmpty(startDate))
                return 0;

            var vTimezoneDiff2 = startDate.getTimezoneOffset() - endDate.getTimezoneOffset();
            var vTimezoneDiff = endDate.getTimezoneOffset() - startDate.getTimezoneOffset(); // startdate is dst

            if (vTimezoneDiff > 0) {
                // Handle daylight saving time difference between two dates.
                startDate.setMinutes(startDate.getMinutes() + vTimezoneDiff);
            }
            else if (vTimezoneDiff2 > 0) {
                // Handle daylight saving time difference between two dates.
                endDate.setMinutes(endDate.getMinutes() + vTimezoneDiff);
            }

            var offset = 0;
            if ((startDate.toString().includes('Daylight') || startDate.toString().includes('PDT')) && !endDate.toString().includes('Daylight') && !endDate.toString().includes('PDT')) {
                offset = -1;
            }
            else if ((endDate.toString().includes('Daylight') || endDate.toString().includes('PDT')) && !startDate.toString().includes('Daylight') && !startDate.toString().includes('PDT')) {
                offset = 1;
            }

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

            return days + offset;
        }

// ---------------------------------------------------------------- updateCosts Function ----------------------------------------------------------------
        /**
         * Updates the Shipping Cost and Handling Cost of the Item Fulfillment.
         * @param {Object} scriptContext
         */
        function updateCosts(scriptContext) {
log.debug('updateCosts','------------------------------Start-------------------------------------');

            var rec = scriptContext.newRecord, currentScript = runtime.getCurrentScript();
            var minShipCost = Number(currentScript.getParameter({ name: 'custscript_sna_ue_if_min_ship_cost' }));
            var minHandlingCost = Number(currentScript.getParameter({ name: 'custscript_sna_ue_if_min_handling_cost' }));
            var maxHandlingCost = Number(currentScript.getParameter({ name: 'custscript_sna_ue_if_max_handling_cost' }));
            var handlingCostPc = Number(currentScript.getParameter({ name: 'custscript_sna_ue_if_handling_cost_pc' }));
            var shipCost = rec.getValue({ fieldId: 'shippingcost' });
log.debug('Details', 'shipCost: ' + shipCost + 'minShipCost: ' + minShipCost + ', minHandlingCost: ' + minHandlingCost + ', maxHandlingCost: ' + maxHandlingCost + ', handlingCostPc: ' + handlingCostPc + ', shipCost: ' + shipCost);

            // Executing the code only when the Minimum Handling Cost Parameter is not empty.
            if(!isEmpty(minShipCost)) {
                // Executing the code only when the Shipping Cost is not empty.
                if(!isEmpty(shipCost)) {
                    // Setting the Minimum Shipping Value if it is less than Minimum Shipping Cost from Parameter.
                    if(shipCost < minShipCost) {
                        rec.setValue({ fieldId: 'shippingcost', value: minShipCost });
                        shipCost = minShipCost;
                    }
                } else {
                    // Setting the Minimum Shipping Value as Shipping Cost is empty.
                    rec.setValue({ fieldId: 'shippingcost', value: minShipCost });
                    shipCost = minShipCost;
                }
            } else {
                log.error('Error', 'Parameter Minimum Shipping Cost is empty. minShipCost: ' + minShipCost);
            }
log.debug('shipCost b4 Handling Cost', shipCost);

            // Executing the code only when the Handling Cost Parameters and Shipping Cost are not empty.
            if(!isEmpty(minHandlingCost) && !isEmpty(maxHandlingCost) && !isEmpty(handlingCostPc) && !isEmpty(shipCost)) {
                var pcHandleCost = (shipCost * handlingCostPc) / 100;

                // Executing the code when the Computed Handling Cost is less than Minimum Handling Cost.
                if(pcHandleCost < minHandlingCost) { pcHandleCost = minHandlingCost; }

                // Executing the code when the Computed Handling Cost is less than Maximum Handling Cost.
                if(pcHandleCost > maxHandlingCost) { pcHandleCost = maxHandlingCost; }

                // Setting the Value for Handling Cost.
                rec.setValue({ fieldId: 'handlingcost', value: pcHandleCost });
            } else {
                log.error('Error', 'Empty Inputs. minHandlingCost: ' + minHandlingCost + ', maxHandlingCost: ' + maxHandlingCost + ', handlingCostPc: ' + handlingCostPc + ', shipCost: ' + shipCost);
            }

log.debug('updateCosts','------------------------------End-------------------------------------');
        }

// ---------------------------------------------------------------- beforeLoad Function ----------------------------------------------------------------

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
                log.debug({title: 'beforeLoad', details: 'runtime.executionContext: ' + runtime.executionContext});

                var rec = scriptContext.newRecord;
                var recid = rec.id;
                var rectype = rec.type;

log.debug('Rec Details', 'rectype: ' + rectype + ', record.Type.ITEM_FULFILLMENT: ' + record.Type.ITEM_FULFILLMENT);
                // Executing the code when the Item Fulfillment is being created or updated.
                if(scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
                    if (rectype == record.Type.ITEM_FULFILLMENT) {
                        // Function to update the Shipping and Handling Cost for the Item Fulfillment.
                        updateCosts(scriptContext);
                    }
                }

                if (scriptContext.type == scriptContext.UserEventType.VIEW) {
                    var form = scriptContext.form;

                    if (rectype == record.Type.ITEM_FULFILLMENT) {
                        var nextbill = form.getButton({id: 'submitinv'});

                        if (nextbill) {
                            var createdfrom = rec.getValue({fieldId: 'createdfrom'});

                            if (!isEmpty(createdfrom)) {
                                var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
                                var createdfromtype = fldcreatefrom.recordtype;

                                if (createdfromtype == record.Type.SALES_ORDER) {
                                    var sosrch = checkConfiguration(createdfrom);

                                    // locked for Item Fulfillment and Invoicing unless there are no longer Dummy Object lines and all rental configuration have been completed
                                    if (!isEmpty(sosrch)) {
                                        form.removeButton({id: 'submitinv'});
                                    }
                                }
                            }
                        }
                    }
                }
                if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                    if (rectype == record.Type.INVOICE) {

                        // non-ui uses the beforesubmit
                        if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
                            var aftitemcount = removeLines(rec);
                            if (aftitemcount == 0)  throw 'Lines are not allowed to be invoiced';
                        }

                        var itemcount = rec.getLineCount({sublistId: 'item'});

                        for (var i = 0; i < itemcount; i++) {
                            var qtyreturned = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_qty_returned', line: i});
                            var qty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                            var rate = rec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});

                            if (forceFloat(qtyreturned) > 0) {
                                var newqty = forceFloat(qty) - forceFloat(qtyreturned);
                                log.debug({title: 'beforeLoad', details: 'line: ' + i + ' | qtyreturned: ' + qtyreturned + ' | qty: ' + qty + ' | newqty: ' + newqty});

                                rec.setSublistValue({sublistId: 'item', fieldId: 'quantity', value: parseInt(newqty), line: i});
                                rec.setSublistValue({sublistId: 'item', fieldId: 'amount', value: (forceFloat(newqty) * forceFloat(rate)), line: i});
                            }
                        }

                        /*var finalinvoice = rec.getValue({fieldId: 'custbody_sna_rent_final_inv'});
                        log.debug({title: 'beforeLoad', details: 'finalinvoice: ' + finalinvoice});

                        if (finalinvoice == 'T') {
                            var currentScript = runtime.getCurrentScript();
                            var otitem = currentScript.getParameter({name: 'custscript_sna_ot_charge'});

                            var lines = [];
                            var createdfrom = rec.getValue({fieldId: 'createdfrom'});

                            var overtime = getReturnLines(createdfrom);
                            var ratecardrates = getRateCards(createdfrom);

                            for (var contractid in overtime) {
                                log.debug({title: 'beforeLoad', details: 'contractid: ' + contractid + ' | total rental days: ' + overtime[contractid].rentaldays + ' | total OT days:' + overtime[contractid].totalotdays + ' | bill for damage: ' + overtime[contractid].damaged});

                                var rentalamounts = !isEmpty(ratecardrates[contractid]) ? ratecardrates[contractid] : {};
                                var dailyrate = forceFloat(rentalamounts.totalamount) / forceFloat(ratecardrates[contractid].totalqty);
                                var hourlyrate = forceFloat(dailyrate) / 8;
                                log.debug({title: 'beforeLoad', details: 'rentalamounts: ' + JSON.stringify(rentalamounts) + ' | dailyrate: ' + dailyrate + ' | hourlyrate: ' + hourlyrate});

                                // bill all returned qty by hourly rate
                                if (overtime[contractid].damaged) {
                                    var totalhours = overtime[contractid].rentaldays * 8;
                                }
                                // bill OT days only
                                else {
                                    var totalhours = overtime[contractid].totalotdays * 8;
                                }

                                var totalhourlyrate = forceFloat(totalhours) * hourlyrate;
                                log.debug({title: 'beforeLoad', details: 'totalhourlyrate: ' + totalhourlyrate + ' | totalhours: ' + totalhours});

                                var objline = {};
                                objline.item = otitem;
                                objline.quantity = totalhours;
                                objline.rate = hourlyrate;
                                lines.push(objline);

                                /*rec.selectNewLine({sublistId: 'item'});
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: otitem});
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: forceFloat(totalhours)});
                                rec.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(hourlyrate)});
                                rec.commitLine({sublistId: 'item'});*/
                            /*}

                            rec.setValue({fieldId: 'custbody_sna_rent_otcharges', value: JSON.stringify(lines)});
                        }*/
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

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            log.debug({title: 'beforeSubmit', details: 'runtime.executionContext: ' + runtime.executionContext});

            var rec = scriptContext.newRecord;
            var recid = rec.id;
            var rectype = rec.type;

log.debug('Rec Details', 'rectype: ' + rectype + ', record.Type.ITEM_FULFILLMENT: ' + record.Type.ITEM_FULFILLMENT);
            // Executing the code when the Item Fulfillment is being created or updated.
            if(scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
                if (rectype == record.Type.ITEM_FULFILLMENT) {
                    // Function to update the Shipping and Handling Cost for the Item Fulfillment.
                    updateCosts(scriptContext);
                }
            }

            if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                var createdfrom = rec.getValue({fieldId: 'createdfrom'});

                if (!isEmpty(createdfrom)) {
                    var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
                    var createdfromtype = fldcreatefrom.recordtype;

                    if (createdfromtype == record.Type.SALES_ORDER) {
                        var sosrch = checkConfiguration(createdfrom);

                        // locked for Item Fulfillment and Invoicing unless there are no longer Dummy Object lines and all rental configuration have been completed
                        if (!isEmpty(sosrch)) {
                            throw 'Related sales order is locked for item fulfillment and invoicing'
                        }

                        log.debug({title: 'beforeSubmit', details: 'test1: ' + rec.getValue({fieldId: 'trandate'})});

                        // this part already runs in the beforeload func
                        if (rectype == record.Type.INVOICE) {
                            log.debug({title: 'beforeSubmit', details: 'runtime.executionContext: ' + runtime.executionContext});

                            // need to move to beforesubmit for non-ui because trandate might be hardcoded
                            if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) {
                                var aftitemcount = removeLines(rec);
                                if (aftitemcount == 0)  throw 'Lines are not allowed to be invoiced';
                            }

                            /*var itemcount = rec.getLineCount({sublistId: 'item'});

                            for (var i = 0; i < itemcount; i++) {
                                var qtyreturned = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_qty_returned', line: i});
                                var qty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});

                                if (forceFloat(qtyreturned) > 0) {
                                    var newqty = forceFloat(qty) - forceFloat(qtyreturned);
                                    log.debug({title: 'beforeSubmit', details: 'line: ' + i + ' | qtyreturned: ' + qtyreturned + ' | qty: ' + qty + ' | newqty: ' + newqty});

                                    rec.setSublistValue({sublistId: 'item', fieldId: 'quantity', value: newqty, line: i});
                                }
                            }*/
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
                var usedequipment = currentScript.getParameter({name: 'custscript_sn_hul_used_equipment'});
                var newequipment = currentScript.getParameter({name: 'custscript_sn_hul_new_equipment'});
                var sold = currentScript.getParameter({name: 'custscript_sna_sold'});
                var inventorysold = currentScript.getParameter({name: 'custscript_sna_equipstat_inv_sold'});

                var contexttype = scriptContext.type;

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                if (_rectype != record.Type.INVOICE) return;

                var rec = record.load({type: _rectype, id: _recid, isDynamic: true});
                var createdfrom = rec.getValue({fieldId: 'createdfrom'});

                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | _rectype: ' + _rectype + ' | createdfrom: ' + createdfrom});

                if (!isEmpty(createdfrom)) {
                    var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
                    var createdfromtype = fldcreatefrom.recordtype;

                    if (createdfromtype == record.Type.SALES_ORDER) {
                        var itemcount = rec.getLineCount({sublistId: 'item'});

                        for (var i = 0; i < itemcount; i++) {
                            rec.selectLine({sublistId: 'item', line: i});
                            var fleetno = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
                            var itm = rec.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});

                            if (!isEmpty(fleetno) && (itm == usedequipment || itm == newequipment)) {
                                var objvalues = {};
                                objvalues['custrecord_sna_owner_status'] = 1; // Owner Status = Customer
                                objvalues['custrecord_sna_posting_status'] = sold;
                                objvalues['custrecord_sna_status'] = inventorysold;

                                record.submitFields({type: 'customrecord_sna_objects', id: fleetno, values: objvalues});
                                log.debug({title: 'afterSubmit', details: 'fleet updated: ' + JSON.stringify(objvalues) + ' | fleetno: ' + fleetno});
                            }
                        }
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

        /**
         * Check configuration if ready for invoicing and fulfillment
         * @param createdfrom
         * @returns {Result[]}
         */
        function checkConfiguration(createdfrom) {
            var _filters = [];
            _filters.push(['custcol_sna_hul_object_configurator', search.Operator.CONTAINS, '"CONFIGURED":"F"'])
            _filters.push('or');
            _filters.push(['custcol_sna_hul_object_configurator_2', search.Operator.CONTAINS, '"CONFIGURED":"F"'])
            _filters.push('or');
            _filters.push(['custcol_sna_hul_fleet_no.custrecord_sna_hul_rent_dummy', search.Operator.IS, 'T']);

            var mainfilters = [];
            mainfilters.push(['internalid', search.Operator.IS, createdfrom]);
            mainfilters.push('and');
            mainfilters.push(_filters);

            var srch = search.create({type: record.Type.SALES_ORDER, filters: mainfilters});

            var sosrch = srch.run().getRange({start: 0, end: 1});

            return sosrch;
        }

        /**
         * Remove invoice lines
         * @param rec
         * @returns {*}
         */
        function removeLines(rec) {
            var currscript = runtime.getCurrentScript();
            var dw = currscript.getParameter('custscript_sn_damage_waiver');
            var serviceitem = currscript.getParameter({name: 'custscript_sna_rental_serviceitem'});
            log.debug({title: 'removeLines', details: 'dw: ' + dw + ' | serviceitem: ' + serviceitem});

            var trandate = rec.getValue({fieldId: 'trandate'}); //new Date('8/10/2023');
            var createdfrom = rec.getValue({fieldId: 'createdfrom'});
            var prebill = rec.getValue({fieldId: 'custbody_sn_hul_allow_prebilling'});

            log.debug({title: 'removeLines', details: 'trandate: ' + trandate + ' | prebill: ' + prebill});

            // check if already billed to adjust amount is any
            var totalbilled = getTotalBilled(createdfrom);
            log.debug({title: 'totalbilled', details: JSON.stringify(totalbilled)});

            var hasldw = false;

            var itemcount = rec.getLineCount({sublistId: 'item'});

            for (var i = itemcount - 1; i >= 0; i--) {
                var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                var billdate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: i});
                var objconfig = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator', line: i});
                var objconfig2 = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_object_configurator_2', line: i});;
                var dummy = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_dummy', line: i});
                var billdates = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sn_hul_billingsched', line: i});
                var qty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                var itmgroup = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: i});
                var rate = rec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                var amount = rec.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
                var contractid = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_contractidd', line: i});
                var soobject = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: i});
                var dayrate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_rate', line: i});
                var weekrate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_weekly_rate', line: i});
                var fourweekrate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_4week_rate', line: i});
                var min_dayprice = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_day_bestprice', line: i});
                var min_weekprice = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_week_bestprice', line: i});
                var extra_days = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_extra_days', line: i});

                log.debug({title: 'removeLines', details: 'line: ' + i + ' | billdate: ' + billdate + ' | objconfig: ' + objconfig + ' | dummy: ' + dummy
                        + ' | qty: ' + qty + ' | rate: ' + rate + ' | amount: ' + amount + ' | contractid: ' + contractid + ' | soobject: ' + soobject
                        + ' | dayrate: ' + dayrate + ' | weekrate: ' + weekrate + ' | fourweekrate: ' + fourweekrate
                        + ' | min_dayprice: ' + min_dayprice + ' | min_weekprice: ' + min_weekprice + ' | extra_days: ' + extra_days});

                // only lines where it is not yet invoiced and Bill Date is <= the Date today will be included
                if (dummy || objconfig.includes('"CONFIGURED":"F"') || objconfig2.includes('"CONFIGURED":"F"') || (!prebill && !isEmpty(billdate) && new Date(billdate) > new Date(trandate))) {
                    rec.removeLine({sublistId: 'item', line: i});

                    log.debug({title: 'removeLines - 1', details: 'removing line: ' + i});

                    continue;
                }

                // for multuple dw, use object as key
                if (itmgroup == dw) {
                    contractid = soobject;

                    // special rate calc if days > 20 days
                    if (isEmpty(billdate) && !isEmpty(billdates)) {
                        hasldw = true;
                    }
                }

                // <= 20 days
                if (!isEmpty(billdate)) {
                    if (!isEmpty(totalbilled[contractid])) {
                        var totalamtbilled = round(forceFloat(totalbilled[contractid].totalamtbilled), 2);
                        var totalqtybilled = totalbilled[contractid].totalqtybilled;

                        var expextedamtbilled = round(forceFloat(forceFloat(totalqtybilled) * rate), 2); // current rate
                        log.debug({title: 'billed_', details: 'totalamtbilled: ' + totalamtbilled + ' | expextedamtbilled: ' + expextedamtbilled});

                        var diff = forceFloat(totalamtbilled) - forceFloat(expextedamtbilled); // can be negative to add to newamount
                        log.debug({title: 'billed_', details: 'diff: ' + diff});

                        if (diff != 0) {
                            var actualamount = forceFloat(qty) * forceFloat(rate); // native amount is based of remaining unbilled quantity
                            var newamt = forceFloat(actualamount) - forceFloat(diff);
                            log.debug({title: 'billed_', details: 'newamt: ' + newamt});

                            rate = newamt / parseInt(qty);
                            log.debug({title: 'billed_', details: 'newrate: ' + rate});

                            rec.setSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(rate), line: i});
                            rec.setSublistValue({sublistId: 'item', fieldId: 'amount', value: (forceFloat(qty) * forceFloat(rate)), line: i});
                        }
                    }
                }
                // > 20 days
                else if (isEmpty(billdate)) {
                    if (!isEmpty(billdates)) {
                        var includeline = false;

                        var arrbilldates = JSON.parse(billdates);
                        log.debug({title: 'arrbilldates', details: arrbilldates});

                        // get existing invoices
                        var usedbilldates = getInvoiceBillDates(createdfrom);
                        log.debug({title: 'usedbilldates', details: JSON.stringify(usedbilldates)});

                        // need to check if already billed to skip date
                        sub: for (var z = 0; z < arrbilldates.length; z++) {
                            var lnbilldate = format.parse({value: arrbilldates[z].billdate, type: format.Type.DATE});

                            // invoice already created for this bill schedule
                            if (inArray(format.format({value: new Date(lnbilldate), type: format.Type.DATE}), usedbilldates)) {
                                continue sub;
                            }
                            // not yet
                            if (!prebill && !isEmpty(lnbilldate) && !isEmpty(trandate) && new Date(lnbilldate) > new Date(trandate)) {
                                continue sub;
                            }

                            var fromdate = arrbilldates[z].fromdate;
                            var todate = arrbilldates[z].todate;
                            var dailyrate = arrbilldates[z].dailyrate;

                            if (!prebill) {
                                if (new Date(todate) < new Date(fromdate)) {
                                    // maan
                                    // this is early return
                                    var workingdays = qty; // use default unbilled qty
                                    log.debug({title: 'workingdays-1', details: workingdays});
                                }
                                else {
                                    var workingdays = workday_count(new Date(fromdate), new Date(todate));
                                    log.debug({title: 'workingdays-2', details: workingdays});
                                }

                                if (workingdays == 0) {
                                    // this is early return
                                    var workingdays = qty; // use default unbilled qty
                                    log.debug({title: 'workingdays-3', details: workingdays});
                                }

                                var newqty = workingdays;
                                if (newqty > qty) {
                                    newqty = qty;
                                }
                            }
                            else {
                                newqty = qty;
                            }

                            // this is from best prices
                            var hasfixedprice = false;

                            // this is only for rental charges
                            var expectedamt = 0;
                            if (newqty == 20 && min_weekprice > 0) {
                                expectedamt = min_weekprice;
                                hasfixedprice = true;
                            }
                            else if (newqty < 20 && newqty == extra_days && min_dayprice > 0) {
                                expectedamt = min_dayprice;
                                hasfixedprice = true;
                            }

                            log.debug({title: 'hasfixedprice', details: hasfixedprice + ' | ' + JSON.stringify(totalbilled[contractid])});

                            // use this for special cases like early return or longer rental. exclude ldw
                            if (!isEmpty(totalbilled[contractid]) && !hasfixedprice && itmgroup != dw) {
                                var totalamtbilled = round(forceFloat(totalbilled[contractid].totalamtbilled), 2);
                                var totalqtybilled = totalbilled[contractid].totalqtybilled;

                                var expextedamtbilled = round(forceFloat(forceFloat(totalqtybilled) * rate), 2); // current rate
                                log.debug({title: 'billed', details: 'totalamtbilled: ' + totalamtbilled + ' | expextedamtbilled: ' + expextedamtbilled});

                                var diff = forceFloat(totalamtbilled) - forceFloat(expextedamtbilled); // can be negative to add to newamount
                                log.debug({title: 'billed', details: 'diff: ' + diff});

                                if (diff != 0) {
                                    var actualamount = forceFloat(newqty) * forceFloat(rate); // native amount is based of remaining unbilled quantity
                                    var newamt = forceFloat(actualamount) - forceFloat(diff);
                                    log.debug({title: 'billed', details: 'newamt: ' + newamt});

                                    rate = newamt / parseInt(newqty);
                                    log.debug({title: 'billed', details: 'newrate: ' + rate});
                                }
                            }
                            else if (hasfixedprice)  {
                                rate = forceFloat(expectedamt) / forceFloat(newqty);
                                log.debug({title: 'expectedamt', details: 'expectedamt: ' + expectedamt + ' | expectedrate: ' + rate});
                            }

                            rec.setSublistValue({sublistId: 'item', fieldId: 'quantity', value: parseInt(newqty), line: i});
                            rec.setSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(rate), line: i});
                            rec.setSublistValue({sublistId: 'item', fieldId: 'amount', value: (forceFloat(newqty) * forceFloat(rate)), line: i});
                            rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_start_date', value: new Date(format.parse({value: fromdate, type: format.Type.DATE})), line: i});
                            rec.setSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_end_date', value: new Date(format.parse({value: todate, type: format.Type.DATE})), line: i});

                            rec.setValue({fieldId: 'custbody_sn_hul_billdate', value: !prebill ? new Date(lnbilldate) : new Date(trandate)});
                            rec.setValue({fieldId: 'startdate', value: new Date(format.parse({value: fromdate, type: format.Type.DATE}))});
                            rec.setValue({fieldId: 'enddate', value: new Date(format.parse({value: todate, type: format.Type.DATE}))});
                            //rec.setValue({fieldId: 'custbody_sn_hul_rentalstart', value: new Date(format.parse({value: fromdate, type: format.Type.DATE}))});
                            //rec.setValue({fieldId: 'custbody_sn_hul_rentalend', value: new Date(format.parse({value: todate, type: format.Type.DATE}))});

                            includeline = true;
                            break sub;
                        }

                        if (!prebill && !includeline) {
                            rec.removeLine({sublistId: 'item', line: i});

                            log.debug({title: 'removeLines - 2', details: 'removing line: ' + i});
                        }
                    }
                }
            }

            // go back to lines to get correct rate
            if (hasldw) {
                var rentalchargeamt = '';
                for (var j = 0; j < itemcount; j++) {
                    var itm = rec.getSublistValue({sublistId: 'item', fieldId: 'item', line: j});
                    var itmgroup = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_gen_prodpost_grp', line: j});
                    var perc = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sn_hul_othercharge_percent', line: j});
                    var contractid = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_rent_contractidd', line: j});
                    var soobject = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: j});
                    var billdate = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_bill_date', line: j});
                    var billdates = rec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sn_hul_billingsched', line: j});
                    var rate = rec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: j});
                    var newqty = rec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: j});

                    // rental charge should always come first
                    if (itm == serviceitem) {
                        rentalchargeamt = rec.getSublistValue({sublistId: 'item', fieldId: 'amount', line: j});
                    }

                    if (itmgroup == dw) {
                        contractid = soobject;

                        if (isEmpty(perc)) {
                            perc = 12;
                        }

                        var chargeamt = rec.getSublistValue({sublistId: 'item', fieldId: 'amount', line: j});
                        if (!isEmpty(rentalchargeamt)) {
                            chargeamt = forceFloat(rentalchargeamt) * (forceFloat(perc) / 100);
                        }

                        rate = forceFloat(chargeamt) / forceFloat(newqty);
                        log.debug({title: 'hasldw', details: 'expectedamt: ' + chargeamt + ' | expectedrate: ' + rate});

                        if (isEmpty(billdate) && !isEmpty(billdates)) {
                            // removed becuase expected to be always a fixed percentage of rental charge
                            /*// use this for special cases like early return or longer rental
                            if (!isEmpty(totalbilled[contractid])) {
                                var totalamtbilled = round(forceFloat(totalbilled[contractid].totalamtbilled), 2);
                                var totalqtybilled = totalbilled[contractid].totalqtybilled;

                                var initialrate = forceFloat(totalbilled[contractid].soamount) / forceFloat(totalbilled[contractid].soqty);
                                var expextedamtbilled = round(forceFloat(forceFloat(totalqtybilled) * rate), 2); // current rate
                                log.debug({title: 'hasldw', details: 'totalamtbilled: ' + totalamtbilled + ' | totalqtybilled: ' + totalqtybilled  + ' | initialrate: ' + initialrate + ' | expextedamtbilled: ' + expextedamtbilled});

                                var diff = forceFloat(totalamtbilled) - forceFloat(expextedamtbilled); // can be negative to add to newamount
                                log.debug({title: 'hasldw', details: 'diff: ' + diff});

                                if (diff != 0) {
                                    var actualamount = forceFloat(newqty) * forceFloat(rate); // native amount is based of remaining unbilled quantity
                                    var newamt = forceFloat(actualamount) - forceFloat(diff);
                                    log.debug({title: 'hasldw', details: 'newamt: ' + newamt});

                                    rate = newamt / parseInt(newqty);
                                    log.debug({title: 'hasldw', details: 'newrate: ' + rate});
                                }
                            }*/

                            rec.setSublistValue({sublistId: 'item', fieldId: 'rate', value: forceFloat(rate), line: j});
                            rec.setSublistValue({sublistId: 'item', fieldId: 'amount', value: (forceFloat(newqty) * forceFloat(rate)), line: j});
                        }

                        rentalchargeamt = '';
                    }
                }
            }

            var aftitemcount = rec.getLineCount({sublistId: 'item'});
            log.debug({title: 'removeLines', details: 'aftitemcount: ' + aftitemcount});
            return aftitemcount;
        }

        /**
         * Get total billed amounts
         * @param createdfrom
         * @returns {{}}
         */
        function getTotalBilled(createdfrom) {
            var currentScript = runtime.getCurrentScript();
            var serviceitem = currentScript.getParameter({name: 'custscript_sna_rental_serviceitem'});
            var param_ldw = currentScript.getParameter({name: 'custscript_sna_group_ldw'});

            var previnvoices = {};

            var transactionSearchObj = search.create({
                type: search.Type.INVOICE,
                filters:
                    [
                        ['createdfrom', 'anyof', createdfrom],
                        'AND',
                        [['item', 'anyof', serviceitem], 'OR', ['item.custitem_sna_hul_gen_prodpost_grp', 'anyof', param_ldw]],
                        'AND',
                        [['applyingtransaction.type', 'is', 'CustCred'], 'OR', ['appliedtotransaction.type', 'is', 'SalesOrd']]
                    ],
                columns:
                    [
                        search.createColumn({name: "quantity", join: 'appliedToTransaction'}), // SO Qty
                        search.createColumn({name: "amount", join: 'appliedToTransaction'}), // SO Amount
                        search.createColumn({name: "custcol_sna_hul_fleet_no", join: 'appliedToTransaction'}), // SO fleet no
                        search.createColumn({name: "custcol_sna_hul_rent_contractidd", join: 'appliedToTransaction'}), // SO rental contract id
                        search.createColumn({name: "quantity"}), // Inv Qty
                        search.createColumn({name: "amount"}), // Inv Amt
                        search.createColumn({name: "custitem_sna_hul_gen_prodpost_grp", join: "item"}),
                        search.createColumn({ name: 'quantity', join: 'applyingTransaction' }), // CM Qty
                        search.createColumn({ name: 'amount', join: 'applyingTransaction' }), // CM Amt
                    ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug('getTotalBilled', "transactionSearchObj result count: " + searchResultCount);

            transactionSearchObj.run().each(function(result){
                var socontractid = result.getValue({name: 'custcol_sna_hul_rent_contractidd', join: 'appliedToTransaction'});
                var soobject = result.getValue({name: 'custcol_sna_hul_fleet_no', join: 'appliedToTransaction'});
                var itmpostinggrp = result.getValue({name: 'custitem_sna_hul_gen_prodpost_grp', join: 'item'});
                var cmqty = result.getValue({ name: 'quantity', join: 'applyingTransaction' });
                var cmamt = result.getValue({ name: 'amount', join: 'applyingTransaction' });

                // if empty contract id, assumed ldw
                if (itmpostinggrp == param_ldw) {
                    socontractid = soobject; // need to have non-empty index because there might be multuple ldw in the order
                }
                if (isEmpty(previnvoices[socontractid])) {
                    previnvoices[socontractid] = {};
                    previnvoices[socontractid].totalqtybilled = 0;
                    previnvoices[socontractid].totalamtbilled = 0;
                    previnvoices[socontractid].soamount = 0;
                    previnvoices[socontractid].soqty = 0;
                }

                previnvoices[socontractid].totalqtybilled += forceFloat(result.getValue({name: 'quantity'}));
                previnvoices[socontractid].totalqtybilled += forceFloat(result.getValue({name: 'quantity', join: 'applyingTransaction'})); // negative
                previnvoices[socontractid].totalamtbilled += forceFloat(result.getValue({name: 'amount'}));
                previnvoices[socontractid].totalamtbilled += forceFloat(result.getValue({name: 'amount', join: 'applyingTransaction'})); // negative
                previnvoices[socontractid].soamount = forceFloat(result.getValue({name: 'amount', join: 'appliedToTransaction'}));
                previnvoices[socontractid].soqty = forceFloat(result.getValue({name: 'quantity', join: 'appliedToTransaction'}));

                return true;
            });

            return previnvoices;
        }

        /**
         * Get used bill dates
         * @param createdfrom
         * @returns {*[]}
         */
        function getInvoiceBillDates(createdfrom) {
            var billdates = [];

            var filters = [];
            filters.push(search.createFilter({name: 'createdfrom', operator: search.Operator.IS, values: createdfrom}));
            filters.push(search.createFilter({name: 'custbody_sn_hul_billdate', operator: search.Operator.ISNOTEMPTY, values: ''}));
            filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: true}));
            filters.push(search.createFilter({name: 'type', join: 'applyingtransaction', operator: search.Operator.NONEOF, values: 'CustCred'}));
            var columns = [];
            columns.push(search.createColumn({name: 'custbody_sn_hul_billdate'}));

            var srch = search.create({type: search.Type.INVOICE, filters: filters, columns: columns});

            srch.run().each(function(result) {
                var inv = result.id;
                var invbilldate = result.getValue({name: 'custbody_sn_hul_billdate'});

                billdates.push(invbilldate);

                return true;
            });

            return billdates;
        }

        /**
         * Get bill for damage or overtime from return authorizartion
         * @param createdfrom
         * @returns {{}}
         */
        function getReturnLines(createdfrom) {
            var overtime = {};
            var sum = 0;

            var filters = [];
            filters.push(['custcol_sna_rental_bill_damage', search.Operator.IS, true])
            filters.push('or');
            filters.push(['formulanumeric: case when TO_DATE({custcol_sna_rental_returned_date}) > TO_DATE({custcol_sna_hul_rent_end_date}) then 1 else 0 end', search.Operator.EQUALTO, '1']);

            var mainfilters = [];
            mainfilters.push(['createdfrom', search.Operator.IS, createdfrom]);
            mainfilters.push('and');
            mainfilters.push(['mainline', search.Operator.IS, false]);
            mainfilters.push('and');
            mainfilters.push(filters);

            var columns = [];
            columns.push(search.createColumn({name: 'custcol_sna_hul_rent_contractidd'}));
            columns.push(search.createColumn({name: 'custcol_sna_rental_returned_date'}));
            columns.push(search.createColumn({name: 'custcol_sna_rental_returned_time'}));
            columns.push(search.createColumn({name: 'custcol_sna_hul_rent_end_date'}));
            columns.push(search.createColumn({name: 'custcol_sna_rental_bill_damage'}));
            columns.push(search.createColumn({name: 'quantity'}));
            columns.push(search.createColumn({name: 'custcol_sna_hul_time_unit'}));

            var srch = search.create({type: record.Type.RETURN_AUTHORIZATION, filters: mainfilters, columns: columns});

            srch.run().each(function(result) {
                var contractid = result.getValue({name: 'custcol_sna_hul_rent_contractidd'});
                var returnedqty = result.getValue({name: 'quantity'}) * -1;
                var enddate = result.getValue({name: 'custcol_sna_hul_rent_end_date'});
                var returneddate = result.getValue({name: 'custcol_sna_rental_returned_date'});
                var billdamage = result.getValue({name: 'custcol_sna_rental_bill_damage'});
                var timeunit = result.getValue({name: 'custcol_sna_hul_time_unit'});

                log.debug({title: 'getReturnLines', details: 'contractid: ' + contractid + ' | returnedqty: ' + returnedqty + ' | billdamage: ' + billdamage + ' | timeunit: ' + timeunit});

                if (isEmpty(overtime[contractid])) {
                    overtime[contractid] = {};
                    overtime[contractid].rentaldays = 0;
                    overtime[contractid].totalotdays = 0;
                    overtime[contractid].damaged = billdamage;
                }

                var rentaldays = getRentalDays(timeunit, returnedqty); // time unit must be the same as time unit in SO
                overtime[contractid].rentaldays += forceFloat(rentaldays); // ok to get sum from multiple RA as total returnedqty should always be equal to the SO qty

                if (!billdamage) {
                    var differenceInDays = 0;
                    var differenceInHours = 0;

                    if (!isEmpty(returneddate) && !isEmpty(enddate)) {
                        enddate = format.parse({value: enddate, type: format.Type.DATE});
                        returneddate = format.parse({value: returneddate, type: format.Type.DATE});

                        differenceInDays = (returneddate.getTime() - enddate.getTime()) / (1000 * 60 * 60 * 24);
                        differenceInHours = (returneddate.getTime() - enddate.getTime()) / (1000 * 60 * 60);

                        log.debug({title: 'getReturnLines', details: 'enddate: ' + enddate + ' | returneddate: ' + returneddate + ' | differenceInDays: ' + differenceInDays + ' | differenceInHours: ' + differenceInHours});
                    }

                    // overtime
                    if (differenceInDays > 0) {
                        overtime[contractid].totalotdays += forceFloat(differenceInDays);
                    }
                }

                return true;
            });

            return overtime;
        }

        /**
         * Get rate card rates from sales order
         * @param createdfrom
         * @returns {{}}
         */
        function getRateCards(createdfrom) {
            var ratecardrates = {};

            var filters = [];
            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: createdfrom}));
            filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: 'F'}));
            filters.push(search.createFilter({name: 'custcol_sna_hul_rent_contractidd', operator: search.Operator.ISNOTEMPTY}));

            var columns = [];
            columns.push(search.createColumn({name: 'custcol_sna_hul_rent_contractidd'}));
            columns.push(search.createColumn({name: 'amount'}));
            columns.push(search.createColumn({name: 'quantity'}));
            columns.push(search.createColumn({name: 'rate'}));
            columns.push(search.createColumn({name: 'custcol_sna_hul_time_unit'}));

            var srch = search.create({type: record.Type.SALES_ORDER, columns: columns, filters: filters});

            srch.run().each(function(result) {
                var contractid = result.getValue({name: 'custcol_sna_hul_rent_contractidd'});
                var qty = result.getValue({name: 'quantity'});
                var rate = result.getValue({name: 'rate'});
                var amt = result.getValue({name: 'amount'});
                var timeunit = result.getValue({name: 'custcol_sna_hul_time_unit'});

                log.debug({title: 'getRateCards', details: 'contractid: ' + contractid + ' | qty: ' + qty + ' | rate: ' + rate + ' | amt: ' + amt + ' | timeunit: ' + timeunit});

                var rentaldays = getRentalDays(timeunit, qty);

                ratecardrates[contractid] = {};
                ratecardrates[contractid].totalqty = rentaldays;
                ratecardrates[contractid].totalamount = amt;

                return true;
            });

            return ratecardrates;
        }

        /**
         * Get rental days
         * @param timeunit
         * @param timeqty
         * @returns {string}
         */
        function getRentalDays(timeunit, timeqty) {
            var currentScript = runtime.getCurrentScript();
            var param_4weekly = currentScript.getParameter({name: 'custscript_sna_unit_4weekly'});
            var param_weekly = currentScript.getParameter({name: 'custscript_sna_unit_weekly'});
            var param_daily = currentScript.getParameter({name: 'custscript_sna_unit_daily'});
            var param_hour = currentScript.getParameter({name: 'custscript_sna_unit_hour'});

            // get rental days
            var rentaldays = '';

            if (timeunit == param_hour) {
                rentaldays = forceFloat(timeqty) / 8;
            }
            else if (timeunit == param_daily) {
                rentaldays = timeqty;
            }
            else if (timeunit == param_weekly) {
                rentaldays = forceFloat(timeqty) * 5;
            }
            else if (timeunit == param_4weekly) {
                rentaldays = forceFloat(timeqty) * 20;
            }

            return rentaldays;
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });