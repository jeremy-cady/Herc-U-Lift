/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to update object from Task
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/1/17       		                 aduldulao       Initial version.
 * 2023/2/22       		                 aduldulao       Add NXC Case Type condition
 * 2023/3/23       		                 aduldulao       Rental Check In
 * 2023/5/1       		                 aduldulao       NATR condition
 * 2023/7/26                             aduldulao       Rental enhancements
 * 2023/8/21                             aduldulao       Add new case types
 * 2023/8/28                             aduldulao       Job Completed & Checkin Add’l Work
 * 2023/10/3                             aduldulao       Used Equipment Item
 * 2023/12/13                            aduldulao       Set Task in sales order
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
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

            log.debug({title: 'afterSubmit', details: 'scriptContext.type: ' + scriptContext.type});

            try {
                var currentScript = runtime.getCurrentScript();
                var pickupdel = currentScript.getParameter({name: 'custscript_sna_nxtasktype_pickup'});
                var pickupttype = currentScript.getParameter({name: 'custscript_sna_nxtasktype_pickup_new'});
                var deliveryttype = currentScript.getParameter({name: 'custscript_sna_nxtasktype_delivery'});
                var readyforpu = currentScript.getParameter({name: 'custscript_sna_eqstatus_readypickup'});
                var equipment = currentScript.getParameter({name: 'custscript_sna_assettype_equipment'});
                var jobsite = currentScript.getParameter({name: 'custscript_sna_assettype_jobsite'});
                var outassigned = currentScript.getParameter({name: 'custscript_sna_rentalstatus_6'});
                var jobcompleted = currentScript.getParameter({name: 'custscript_sna_taskres_jobcomp'});
                var instatus = currentScript.getParameter({name: 'custscript_sna_rentalstatus_1'});
                var jobsite = currentScript.getParameter({name: 'custscript_sna_assettype_jobsite'});
                var checkinreq = currentScript.getParameter({name: 'custscript_sna_eqstatus_checkinreq'});
                var atr = currentScript.getParameter({name: 'custscript_sna_eqstatus_atr'});
                var natr = currentScript.getParameter({name: 'custscript_sna_eqstatus_natr'});
                var checkin = currentScript.getParameter({name: 'custscript_sna_nxtasktype_checkin'});
                var rentalctype = currentScript.getParameter({name: 'custscript_sna_nxcasetype_rental'});
                var checkinctype = currentScript.getParameter({name: 'custscript_sna_nxcasetype_checkin'});
                var pickupctype = currentScript.getParameter({name: 'custscript_sna_nxcasetype_pickup'});
                var moretodo = currentScript.getParameter({name: 'custscript_sna_nxtaskres_more'});
                var casedelivery = currentScript.getParameter({name: 'custscript_sna_nxcasetype_delivery'});
                var onrent = currentScript.getParameter({name: 'custscript_sna_eqstatus_onrent'});
                var paramdeliver = currentScript.getParameter({name: 'custscript_sna_source_deliver'});
                var paramreturn = currentScript.getParameter({name: 'custscript_sna_source_return'});
                var jobcompletedcheckin = currentScript.getParameter({name: 'custscript_sna_taskres_jobcomp_checkaddl'});
                var workshop = currentScript.getParameter({name: 'custscript_sna_nxtasktype_workshop'});

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                var _rectype = _rec.type;

                var rec = record.load({type: _rectype, id: _recid, isDynamic: true});

                var tasktype = rec.getValue({fieldId: 'custevent_nx_task_type'});
                var asset = rec.getValue({fieldId: 'custevent_nx_task_asset'});
                var taskresult = rec.getValue({fieldId: 'custevent_nxc_task_result'});
                var taskresult_txt = rec.getText({fieldId: 'custevent_nxc_task_result'});
                var supportcase = rec.getValue({fieldId: 'supportcase'});
                var reason = rec.getValue({fieldId: 'custevent_nxc_reason_not_resolved'});
                var status = rec.getValue({fieldId: 'status'});
                var emp = rec.getValue({fieldId: 'assigned'});

                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | tasktype: ' + tasktype + ' | asset: ' + asset + ' | taskresult: '
                        + taskresult + ' | taskresult_txt: ' + taskresult_txt + ' | supportcase: ' + supportcase + ' | reason: ' + reason
                        + ' | status: ' + status + ' | emp: ' + emp});

                if (isEmpty(asset)) return;
                if (isEmpty(supportcase)) return;

                var casetype = '';

                // Object is linked via NextService Task Asset Record
                var fldsasset = getAssetFlds(asset);
                var assettype = !isEmpty(fldsasset[asset]) ? fldsasset[asset].assettype : '';
                var obj = '';

                // Next Service Asset Field can either Record with Asset Type of Job Site or Equipment. Only an Asset Type of Equipment will have a linked Object Record
                if (assettype == equipment) {
                    obj = !isEmpty(fldsasset[asset]) ? fldsasset[asset].obj : '';
                }
                // If on the Task Record the linked Asset Record is Job Site, Source the object from the Linked Case Record, NextService Equipment Asset(s) custevent_nxc_case_assets.
                else if (assettype == jobsite) {
                    var fldscase = getCaseFlds(supportcase);
                    casetype = !isEmpty(fldscase[supportcase]) ? fldscase[supportcase].casetype : '';
                    asset = !isEmpty(fldscase[supportcase]) ? fldscase[supportcase].arrassets : '';
                    fldsasset = getAssetFlds(asset);
                }

                var fldscase = search.lookupFields({type: search.Type.SUPPORT_CASE, id: supportcase, columns: ['custevent_nx_case_type', 'custevent_nx_case_transaction', 'custevent_nx_case_transaction.custbody_nx_task']});
                log.debug({title: 'afterSubmit', details: 'fldscase: ' + JSON.stringify(fldscase)});

                if (isEmpty(casetype)) {
                    casetype = !isEmpty(fldscase.custevent_nx_case_type) ? fldscase.custevent_nx_case_type[0].value : '';
                }

                log.debug({title: 'afterSubmit', details: 'casetype: ' + casetype});

                // update object records
                if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                    if (tasktype == pickupttype && casetype == pickupctype) {
                        var objvalues = {};
                        objvalues['custrecord_sna_rental_status'] = outassigned;
                        objvalues['custrecord_sna_status'] = readyforpu;

                        updateObj(obj, fldsasset, objvalues);
                    }

                    // delivery
                    else if (tasktype == deliveryttype && casetype == casedelivery && status == 'COMPLETE') {
                        /*var objvalues = {};
                        objvalues['custrecord_sna_rental_status'] = outassigned;
                        objvalues['custrecord_sna_status'] = onrent;

                        updateObj(obj, fldsasset, objvalues);*/

                        getSO(obj, fldsasset, supportcase, outassigned, onrent, paramdeliver, _recid);
                    }

                    // rental enhancement - update SO upon completion of pick up task. pick up = rentalctype
                    if (tasktype == pickupttype && status == 'COMPLETE' && casetype == pickupctype) {
                        var allobjects = getAllObj(obj, fldsasset);
                        log.debug({title: 'afterSubmit', details: 'allobjects: ' + JSON.stringify(allobjects)});

                        // get latest hour meters
                        var objhourmeters = getLatestHourMeters(allobjects, paramreturn);

                        updateSO('pickup', supportcase, objhourmeters, null, _recid);
                    }

                    // set task in sales order
                    if (!isEmpty(supportcase)) {
                        var sotask = !isEmpty(fldscase['custevent_nx_case_transaction.custbody_nx_task']) ? fldscase['custevent_nx_case_transaction.custbody_nx_task'][0].value : '';
                        var soid = !isEmpty(fldscase.custevent_nx_case_transaction) ? fldscase.custevent_nx_case_transaction[0].value : '';

                        if (isEmpty(sotask) && !isEmpty(soid)) {
                            record.submitFields({type: record.Type.SALES_ORDER, id: soid, values: {'custbody_nx_task': _recid}});
                            log.debug({title: 'afterSubmit', details: 'SO task updated: ' + soid + ' | task: ' + _recid});
                        }
                    }
                }

                else {
                    // rental enhancement - update SO upon completion of pick up task. pick up = rentalctype
                    if (tasktype == pickupttype && status == 'COMPLETE' && casetype == pickupctype) {
                        var allobjects = getAllObj(obj, fldsasset);
                        log.debug({title: 'afterSubmit', details: 'allobjects: ' + JSON.stringify(allobjects)});

                        // get latest hour meters
                        var objhourmeters = getLatestHourMeters(allobjects, paramreturn);

                        updateSO('pickup', supportcase, objhourmeters, null, _recid);
                    }

                    if (tasktype == pickupttype && taskresult == jobcompleted && casetype == pickupctype) {
                        var objvalues = {};
                        objvalues['custrecord_sna_rental_status'] = instatus;
                        objvalues['custrecord_sna_status'] = checkinreq;

                        updateObj(obj, fldsasset, objvalues);
                    }

                    else if (tasktype == workshop && status == 'COMPLETE') {
                        var locsiteasset = '';
                        var loccustomer = '';

                        if (!isEmpty(emp)) {
                            var locinfo = getLocInfo(emp);
                            locsiteasset = locinfo.locsiteasset;
                            loccustomer = locinfo.loccustomer;
                        }

                        updateAsset(locsiteasset, asset, loccustomer);
                    }

                    else if (tasktype == checkin && casetype == checkinctype) {
                        if (isEmpty(reason) && taskresult == jobcompleted) {
                            var objvalues = {};
                            objvalues['custrecord_sna_rental_status'] = instatus;
                            objvalues['custrecord_sna_customer_name'] = '';
                            objvalues['custrecord_sna_rental_contract_sec_date'] = '';
                            objvalues['custrecord_sna_exp_rental_return_date'] = '';
                            objvalues['custrecord_sna_status'] = atr;

                            updateObj(obj, fldsasset, objvalues);
                        }

                        else if (taskresult != jobcompleted) {
                            var objvalues = {};
                            objvalues['custrecord_sna_rental_status'] = instatus;
                            objvalues['custrecord_sna_customer_name'] = '';
                            objvalues['custrecord_sna_rental_contract_sec_date'] = '';
                            objvalues['custrecord_sna_exp_rental_return_date'] = '';
                            objvalues['custrecord_sna_status'] = natr;

                            updateObj(obj, fldsasset, objvalues);
                        }

                        // retain customer if Job Complete & Checkin Addtil work
                        if (status == 'COMPLETE' && taskresult != jobcompletedcheckin) {
                            // rental checkin
                            var locsiteasset = '';
                            var loccustomer = '';

                            if (!isEmpty(emp)) {
                                var locinfo = getLocInfo(emp);
                                locsiteasset = locinfo.locsiteasset;
                                loccustomer = locinfo.loccustomer;
                            }

                            updateAsset(locsiteasset, asset, loccustomer);
                        }
                    }

                    // delivery
                    else if (tasktype == deliveryttype && casetype == casedelivery && status == 'COMPLETE') {
                        /*var objvalues = {};
                        objvalues['custrecord_sna_rental_status'] = outassigned;
                        objvalues['custrecord_sna_status'] = onrent;

                        updateObj(obj, fldsasset, objvalues);*/

                        getSO(obj, fldsasset, supportcase, outassigned, onrent, paramdeliver, _recid);
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
         * Get location information from employee record
         * @param emp
         * @returns {{loccustomer: string, locsiteasset: string}}
         */
        function getLocInfo(emp) {
            var locsiteasset = '';
            var loccustomer = '';

            if (!isEmpty(emp)) {
                var empflds = search.lookupFields({type: search.Type.EMPLOYEE, id: emp, columns: ['location', 'location.custrecord_sna_hul_nxc_branch_site_asset', 'location.custrecord_sna_hul_nxc_branch_loc']});

                if (!isEmpty(empflds['location.custrecord_sna_hul_nxc_branch_site_asset'])) {
                    locsiteasset = empflds['location.custrecord_sna_hul_nxc_branch_site_asset'][0].value;

                    log.debug({title: 'locsiteasset', details: locsiteasset});
                }

                if (!isEmpty(empflds['location.custrecord_sna_hul_nxc_branch_loc'])) {
                    loccustomer = empflds['location.custrecord_sna_hul_nxc_branch_loc'][0].value;

                    log.debug({title: 'loccustomer', details: loccustomer});
                }
            }

            return {locsiteasset: locsiteasset, loccustomer: loccustomer}
        }

        /**
         * Get objects
         * @param obj
         * @param fldsasset
         */
        function getAllObj(obj, fldsasset) {
            var allobjects = [];

            if (!isEmpty(obj)) {
                allobjects.push(obj);
            }
            else {
                for (asset in fldsasset) {
                    var obj = fldsasset[asset].obj;

                    allobjects.push(obj);
                }
            }

            return allobjects;
        }

        /**
         * Get sales order configuration
         * @param obj
         * @param fldasset
         * @param supportcase
         */
        function getSO(obj, fldsasset, supportcase, outassigned, onrent, paramdeliver, _recid) {
            var currentScript = runtime.getCurrentScript();
            var param_usedequipment = currentScript.getParameter({name:'custscript_sn_hul_used_equipment'});
            var param_newequipment = currentScript.getParameter({name:'custscript_sn_hul_new_equipment'});
            var param_invdelivered = currentScript.getParameter({name:'custscript_sna_eqstatus_inv_deltocust'});
            log.debug({title: 'getSO', details: 'param_usedequipment: ' + param_usedequipment + ' | param_newequipment: ' + param_newequipment + ' | param_invdelivered: ' + param_invdelivered});

            var allobjects = getAllObj(obj, fldsasset);
            log.debug({title: 'getSO', details: 'allobjects: ' + JSON.stringify(allobjects)});

            if (isEmpty(allobjects)) return;

            // get latest hour meters
            var objhourmeters = getLatestHourMeters(allobjects, paramdeliver);

            // get sales order config
            var soid = '';
            var processed = 0;
            var objprocessed = {};
            var allsolines = [];

            var filters_ = [];
            filters_.push(search.createFilter({name: 'custbody_nx_case', operator: search.Operator.ANYOF, values: supportcase}));
            filters_.push(search.createFilter({name: 'custcol_sna_hul_fleet_no', operator: search.Operator.ANYOF, values: allobjects}));
            filters_.push(search.createFilter({name: 'custcol_sna_hul_object_configurator', operator: search.Operator.DOESNOTCONTAIN, values: '"CONFIGURED":"F"'}));
            filters_.push(search.createFilter({name: 'custcol_sna_hul_object_configurator_2', operator: search.Operator.DOESNOTCONTAIN, values: '"CONFIGURED":"F"'}));

            var columns_ = [];
            columns_.push(search.createColumn({name: 'tranid'}));
            columns_.push(search.createColumn({name: 'mainname'}));
            columns_.push(search.createColumn({name: 'item'}));
            columns_.push(search.createColumn({name: 'custcol_sna_hul_fleet_no'}));
            columns_.push(search.createColumn({name: 'custcol_sna_hul_object_configurator'}));
            columns_.push(search.createColumn({name: 'custcol_sna_hul_object_configurator_2'}));
            columns_.push(search.createColumn({name: 'custcol_sna_hul_rent_start_date'}));
            columns_.push(search.createColumn({name: 'custcol_sna_hul_rent_end_date'}));
            columns_.push(search.createColumn({name: 'custcol_sna_hul_rent_contractidd'}));
            columns_.push(search.createColumn({name: 'line'}));

            var recsearch = search.create({type: search.Type.SALES_ORDER, filters: filters_, columns: columns_});
            var resultcount = recsearch.runPaged().count;

            recsearch.run().each(function(result) {
                soid = result.id;
                var fleet = result.getValue({name: 'custcol_sna_hul_fleet_no'});
                var configfields = result.getValue({name: 'custcol_sna_hul_object_configurator'});
                var config2fields = result.getValue({name: 'custcol_sna_hul_object_configurator_2'});
                var startdate = result.getValue({name: 'custcol_sna_hul_rent_start_date'});
                var enddate = result.getValue({name: 'custcol_sna_hul_rent_end_date'});
                var contractid = result.getValue({name: 'custcol_sna_hul_rent_contractidd'});
                var entity = result.getValue({name: 'mainname'});
                var itm = result.getValue({name: 'item'});

                allsolines.push(result.getValue({name: 'line'}))

                // submit field and record load is 2 units each for custom record
                if (!isEmpty(fleet) && parseInt(processed) <= 150) {
                    if (isEmpty(objprocessed[fleet])) {
                        objprocessed[fleet] = 'yes';
                    }
                    else {
                        return true; // fleet already processed
                    }

                    log.debug({title: 'getSO', details: 'fleet: ' + fleet + ' | processed: ' + processed});

                    var recobj = record.load({type: 'customrecord_sna_objects', id: fleet, isDynamic: true});
                    var allflds = recobj.getFields();
                    var allfldlabels = {};
                    var objvalues = {};

                    // get all field labels
                    for (var w = 0; w < allflds.length; w++) {
                        var fldobj = recobj.getField({fieldId: allflds[w]});

                        if (!isEmpty(fldobj)) {
                            var selectOptions = {};
                            if (fldobj.type == 'select') {
                                selectOptions = fldobj.getSelectOptions();
                            }

                            allfldlabels[fldobj.label] = {
                                value: allflds[w],
                                type: fldobj.type,
                                options: selectOptions
                            };
                        }
                    }

                    // get config fields
                    if (!isEmpty(configfields)) {
                        var parsedconfigfields = JSON.parse(configfields);
                        var parsedconfig2fields = !isEmpty(config2fields) ? JSON.parse(config2fields) : [];
                        var combined = parsedconfigfields.concat(parsedconfig2fields);

                        for (var i = 0; i < combined.length; i++) {
                            var dataelement = combined[i].ELEMENT;
                            var configured = combined[i].CONFIGURED;
                            var requested = combined[i].ACT_CONFIG;
                            var temp = requested;

                            if (!isEmpty(allfldlabels[dataelement])) {
                                var fldid = allfldlabels[dataelement].value;

                                if (allfldlabels[dataelement].type == 'select') {
                                    inner: for (var v = 0; v < allfldlabels[dataelement].options.length; v++) {
                                        var optionval = allfldlabels[dataelement].options[v].text;

                                        if (optionval == temp) {
                                            requested = allfldlabels[dataelement].options[v].value;
                                            break inner;
                                        }
                                    }
                                }

                                objvalues[fldid] = requested; // should be configured = T at this point
                            }
                        }
                    }

                    if (itm != param_newequipment && itm != param_usedequipment) {
                        objvalues['custrecord_sna_rental_status'] = outassigned;
                    }
                    objvalues['custrecord_sna_status'] = (itm == param_newequipment || itm == param_usedequipment) ? param_invdelivered : onrent;
                    objvalues['custrecord_sna_customer_name'] = entity;
                    objvalues['custrecord_sna_rental_contract_no_so'] = contractid;
                    objvalues['custrecord_sna_rental_contract_sec_date'] = startdate;
                    objvalues['custrecord_sna_exp_rental_return_date'] = enddate;

                    record.submitFields({type: 'customrecord_sna_objects', id: fleet, values: objvalues});
                    log.debug({title: 'getSO', details: 'fleet updated: ' + JSON.stringify(objvalues) + ' | fleet: ' + fleet});

                    processed++;
                }

                return true;
            });

            if (!isEmpty(soid)) {
                updateSO('delivery', null, objhourmeters, soid, _recid);
                createIF(soid, allobjects, param_usedequipment, param_newequipment, allsolines);
            }
        }

        /**
         * Update return date of sales order
         * @param supportcase
         */
        function updateSO(method, supportcase, objhourmeters, soid, _recid) {
            var toupdate = false;

            // for pick-up
            if (!isEmpty(supportcase)) {
                var fldscase = search.lookupFields({type: search.Type.SUPPORT_CASE, id: supportcase, columns: ['custevent_nx_case_transaction']});
                soid = !isEmpty(fldscase.custevent_nx_case_transaction) ? fldscase.custevent_nx_case_transaction[0].value : '';
            }

            log.debug({title: 'updateSO', details: 'soid: ' + soid + ' | method: ' + method});

            if (!isEmpty(soid)) {
                var sorec = record.load({type: record.Type.SALES_ORDER, id: soid, isDynamic: true});
                if (method == 'pickup') {
                    var currrentaldate = sorec.getValue({fieldId: 'custbody_sn_rental_return_date'});

                    if (isEmpty(currrentaldate)) {
                        sorec.setValue({fieldId: 'custbody_sn_rental_return_date', value: new Date()});
                        toupdate = true;
                    }
                }

                var lineItemCount = sorec.getLineCount({sublistId: 'item'});
                for (var i = 0; i < lineItemCount; i++ ) {
                    sorec.selectLine({sublistId: 'item', line: i});
                    var fleetno = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no'});
                    var currinitial = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_initial_hourmeter'});
                    var currlast = sorec.getCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_last_hourmeter'});

                    var latestreading = !isEmpty(objhourmeters[fleetno]) ? objhourmeters[fleetno] : '';

                    if (method == 'delivery' && isEmpty(currinitial)) {
                        sorec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_initial_hourmeter', value: latestreading});
                        toupdate = true;
                    }
                    else if (method == 'pickup' && isEmpty(currlast)) {
                        sorec.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_last_hourmeter', value: latestreading});
                        toupdate = true;
                    }

                    sorec.commitLine({sublistId: 'item'})
                }

                if (toupdate) {
                    var currnxtask = sorec.getValue({fieldId: 'custbody_nx_task'});
                    if (isEmpty(currnxtask)) {
                        sorec.setValue({fieldId: 'custbody_nx_task', value: _recid});
                    }

                    var recId = sorec.save();
                    log.debug({title: 'updateSO', details: 'sales order updated: ' + soid});
                }
            }
        }

        /**
         * Create item fulfillment of equipment items
         * @param soid
         * @param allobjects
         * @param param_usedequipment
         * @param param_newequipment
         * @param allsolines
         */
        function createIF(soid, allobjects, param_usedequipment, param_newequipment, allsolines) {
            try {
                log.debug({title: 'createIF', details: 'allsolines: ' + JSON.stringify(allsolines)});

                var ifrec = record.transform({fromType: record.Type.SALES_ORDER, fromId: soid, toType: record.Type.ITEM_FULFILLMENT});
                var itemcount = ifrec.getLineCount({sublistId: 'item'});

                for (var i = 0; i < itemcount; i++) {
                    var isauto = false;

                    var itm = ifrec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                    var fleetno = ifrec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_hul_fleet_no', line: i});
                    var solinekey = ifrec.getSublistValue({sublistId: 'item', fieldId: 'orderline', line: i});
                    log.debug({title: 'createIF', details: 'line: ' + i + ' | itm: ' + itm + ' | fleetno: ' + fleetno + ' | solinekey: ' + solinekey});

                    if (!isEmpty(fleetno) && inArray(fleetno, allobjects) && inArray(solinekey, allsolines) && (itm == param_newequipment || itm == param_usedequipment)) {
                        isauto = true;
                    }

                    ifrec.setSublistValue({sublistId: 'item', fieldId: 'itemreceive', line: i, value: isauto});
                }

                var ifid = ifrec.save({ignoreMandatoryFields: true});
                log.debug({title: 'onRequest', details: 'IF created: ' + ifid});
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
         * Get latest hour meters
         * @param allobjects
         * @param source
         * @returns {{}}
         */
        function getLatestHourMeters(allobjects, source) {
            var objhourmeters = {};

            if (isEmpty(allobjects)) objhourmeters;

            var searchres = search.load({id: 'customsearch_sn_hul_latest_hm'});
            searchres.filters.push(search.createFilter({name: 'custrecord_sna_hul_object_ref', operator: search.Operator.ANYOF, values: allobjects}));
            searchres.filters.push(search.createFilter({name: 'custrecord_sna_hul_hr_meter_source', operator: search.Operator.ANYOF, values: source}));

            searchres.run().each(function(result) {
                var obj = result.getValue({name: 'custrecord_sna_hul_object_ref', summary: 'GROUP'});
                var reading = result.getValue({name: 'custrecord_sna_hul_actual_reading', summary: 'MAX'});

                log.debug({title: 'getLatestHourMeters', details: 'obj: ' + obj + ' | reading: ' + reading});

                if (isEmpty(objhourmeters[obj])) {
                    objhourmeters[obj] = reading;
                }

                return true;
            });

            log.debug({title: 'getLatestHourMeters', details: 'objhourmeters: ' + JSON.stringify(objhourmeters)});

            return objhourmeters;
        }

        /**
         * Update parent of asset
         * @param locsiteasset
         * @param asset
         * @param loccustomer
         */
        function updateAsset(locsiteasset, asset, loccustomer) {
            if (asset.constructor === Array) {
                for (var a = 0; a < asset.length; a++) {
                    record.submitFields({type: 'customrecord_nx_asset', id: asset[a], values: {'parent': locsiteasset, 'custrecord_nx_asset_customer': loccustomer}});
                    log.debug({title: 'updateAsset', details: 'asset updated - arr : ' + asset[a]});
                }
            }
            else {
                record.submitFields({type: 'customrecord_nx_asset', id: asset, values: {'parent': locsiteasset, 'custrecord_nx_asset_customer': loccustomer}});
                log.debug({title: 'updateAsset', details: 'asset updated: ' + asset});
            }
        }

        /**
         * Update object records
         * @param obj
         * @param fldsasset
         * @param objvalues
         */
        function updateObj(obj, fldsasset, objvalues) {
            if (!isEmpty(obj)) {
                record.submitFields({type: 'customrecord_sna_objects', id: obj, values: objvalues});
                log.debug({title: 'afterSubmit', details: 'fleet updated: ' + JSON.stringify(objvalues) + ' | obj: ' + obj});
            }
            else {
                for (asset in fldsasset) {
                    var obj = fldsasset[asset].obj;

                    record.submitFields({type: 'customrecord_sna_objects', id: obj, values: objvalues});
                    log.debug({title: 'afterSubmit', details: 'fleet updated: ' + JSON.stringify(objvalues) + ' | obj: ' + obj});
                }
            }
        }

        /**
         * Get asset values
         * @param asset
         * @returns {{}}
         */
        function getAssetFlds(asset) {
            var dta = {};

            log.debug({title: 'getAssetFlds', details: 'asset: ' + JSON.stringify(asset)});
            if (isEmpty(asset) || asset.length == 0) return dta;

            var filters_ = [];
            filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: asset}));

            var columns_ = [];
            columns_.push(search.createColumn({name: 'custrecord_nxc_na_asset_type'}));
            columns_.push(search.createColumn({name: 'custrecord_sna_hul_nxcassetobject'}));

            var recsearch = search.create({type: 'customrecord_nx_asset', filters: filters_, columns: columns_});
            var resultcount = recsearch.runPaged().count;

            recsearch.run().each(function(result) {
                var resasset = result.id;
                var assettype = result.getValue({name: 'custrecord_nxc_na_asset_type'});
                var resobj = result.getValue({name: 'custrecord_sna_hul_nxcassetobject'});

                log.debug({title: 'getAssetFlds', details: 'resasset: ' + resasset});

                dta[resasset] = {
                    assettype: assettype,
                    obj: resobj
                }

                return true;
            });

            return dta;
        }

        /**
         * Get support case fields
         * @param supportcase
         * @returns {{}}
         */
        function getCaseFlds(supportcase) {
            var dta = {};

            var filters_ = [];
            filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.ANYOF, values: supportcase}));

            var columns_ = [];
            columns_.push(search.createColumn({name: 'custevent_nxc_case_assets'}));
            columns_.push(search.createColumn({name: 'custevent_nx_case_type'}));

            var recsearch = search.create({type: 'supportcase', filters: filters_, columns: columns_});
            var resultcount = recsearch.runPaged().count;

            recsearch.run().each(function(result) {
                var rescase = result.id;
                var casetype = result.getValue({name: 'custevent_nx_case_type'});
                var caseassets = result.getValue({name: 'custevent_nxc_case_assets'});
                var arrassets = !isEmpty(caseassets) ? caseassets.split(',') : [];

                log.debug({title: 'getCaseFlds', details: 'rescase: '  + rescase + ' | casetype: ' + casetype + ' | caseassets: ' + caseassets});

                dta[rescase] = {
                    arrassets: arrassets,
                    casetype: casetype
                }

                return true;
            });

            return dta;
        }

        return {afterSubmit}

    });